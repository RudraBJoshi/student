"""
receive.py — General-purpose RECEIVE HTTP method for any Flask application.

What it is
----------
RECEIVE is a custom HTTP method (like GET, POST, PUT) designed specifically
for explicit data-ingestion acknowledgment.  When any external API sends data
to a RECEIVE endpoint, this layer:
  1. Validates and fingerprints the payload.
  2. Returns a structured acknowledgment with a unique receipt ID.
  3. Logs every receipt in memory for later lookup.

Custom status codes
-------------------
Because the standard 200 "OK" carries no semantic meaning about *receipt*,
RECEIVE ships with its own code family:

  2xx  Acknowledged
    210  RECEIVED            Full payload accepted and logged.
    211  RECEIVED_PARTIAL    Payload accepted but some fields were empty/null.
    212  RECEIVED_QUEUED     Accepted and placed in the processing queue.
    213  RECEIVED_DUPLICATE  Identical payload fingerprint already on record.

  4xx  Sender-side error
    461  RECEIVE_REJECTED    Body is missing or Content-Type is wrong.
    462  RECEIVE_MALFORMED   Payload could not be parsed.
    463  RECEIVE_TOO_LARGE   Payload exceeds the configured size limit.
    464  RECEIVE_STALE       Sender's `sent_at` timestamp is too old.

  5xx  Receiver-side error
    560  RECEIVE_OVERFLOW    In-memory queue is at capacity.
    561  RECEIVE_FAULT       Unexpected internal error during receipt.

Usage — standalone server
-------------------------
    python receive.py                    # runs on port 6000

Usage — plug into an existing Flask app
----------------------------------------
    from receive import receive_blueprint, ReceiveCodes
    app.register_blueprint(receive_blueprint, url_prefix='/receive')

Endpoints (all under the url_prefix)
--------------------------------------
    RECEIVE  /            Accept and acknowledge any payload.
    GET      /codes       Return the full custom status-code table.
    GET      /log         Return all receipts (newest first).
    GET      /log/<id>    Return a single receipt by its ID.
    DELETE   /log         Flush the in-memory log and queue.
"""

from __future__ import annotations

import datetime
import hashlib
import uuid

from flask import Blueprint, Flask, jsonify, request
from flask_cors import CORS

# ── Custom RECEIVE status codes ───────────────────────────────────────────────

class ReceiveCodes:
    # 2xx  Acknowledged
    RECEIVED            = 210
    RECEIVED_PARTIAL    = 211
    RECEIVED_QUEUED     = 212
    RECEIVED_DUPLICATE  = 213

    # 4xx  Sender-side errors
    RECEIVE_REJECTED    = 461
    RECEIVE_MALFORMED   = 462
    RECEIVE_TOO_LARGE   = 463
    RECEIVE_STALE       = 464

    # 5xx  Receiver-side errors
    RECEIVE_OVERFLOW    = 560
    RECEIVE_FAULT       = 561

    _phrases: dict[int, str] = {
        210: "RECEIVED",
        211: "RECEIVED_PARTIAL",
        212: "RECEIVED_QUEUED",
        213: "RECEIVED_DUPLICATE",
        461: "RECEIVE_REJECTED",
        462: "RECEIVE_MALFORMED",
        463: "RECEIVE_TOO_LARGE",
        464: "RECEIVE_STALE",
        560: "RECEIVE_OVERFLOW",
        561: "RECEIVE_FAULT",
    }

    _descriptions: dict[int, str] = {
        210: "Full payload accepted and logged",
        211: "Payload accepted but one or more fields were empty/null",
        212: "Payload accepted and placed in the processing queue",
        213: "Payload fingerprint already exists in the receipt log",
        461: "Payload body is missing or Content-Type is unsupported",
        462: "Payload structure could not be parsed",
        463: "Payload exceeds the maximum allowed size",
        464: "Payload's sent_at timestamp is older than the staleness window",
        560: "In-memory receive queue is at capacity",
        561: "Unexpected internal error while processing the receipt",
    }

    @classmethod
    def phrase(cls, code: int) -> str:
        return cls._phrases.get(code, "UNKNOWN")

    @classmethod
    def describe(cls, code: int) -> str:
        return cls._descriptions.get(code, "")

    @classmethod
    def table(cls) -> dict:
        return {
            str(code): {
                "phrase":      cls._phrases[code],
                "description": cls._descriptions[code],
                "category":    "acknowledged" if code < 300
                               else "sender_error" if code < 500
                               else "receiver_error",
            }
            for code in cls._phrases
        }


# ── In-memory store ───────────────────────────────────────────────────────────

_log:   dict[str, dict] = {}   # receipt_id → receipt entry
_queue: list[str]       = []   # ordered list of receipt IDs

MAX_PAYLOAD_BYTES = 10 * 1024 * 1024   # 10 MB
MAX_QUEUE_DEPTH   = 500
STALE_SECONDS     = 60


# ── Helper: build a uniform RECEIVE response ──────────────────────────────────

def _ack(code: int, receipt_id: str | None = None, **fields):
    body = {
        "receive_status":  code,
        "receive_phrase":  ReceiveCodes.phrase(code),
        "description":     ReceiveCodes.describe(code),
        "receipt_id":      receipt_id,
        "acknowledged_at": datetime.datetime.utcnow().isoformat() + "Z",
        **fields,
    }
    return jsonify(body), code


# ── Blueprint ─────────────────────────────────────────────────────────────────

receive_blueprint = Blueprint("receive", __name__)


@receive_blueprint.route("/", methods=["RECEIVE", "POST"])
def receive():
    """
    RECEIVE  /
    ----------
    Accept any payload from any external source and acknowledge receipt.

    The RECEIVE HTTP method signals intent: the caller is explicitly handing
    data to this service.  POST is accepted as a fallback for clients that
    cannot send custom HTTP methods.

    Request
        Method:        RECEIVE  (or POST)
        Content-Type:  application/json  (preferred)
                       anything else is accepted as raw bytes
        Body:          Any JSON object  — or raw bytes for non-JSON senders

        Optional JSON fields with special meaning:
          sent_at  (ISO-8601 string)  — enables staleness checking

    Response
        JSON body always contains:
          receive_status   int     one of the custom RECEIVE codes
          receive_phrase   str     human-readable code name
          description      str     what the code means
          receipt_id       str     UUID v4 to track this specific receipt
          acknowledged_at  str     UTC timestamp of acknowledgment
          http_method      str     the method used by the caller
          payload_size     int     bytes received
          payload_keys     list    top-level keys (JSON only)
          partial          bool    true if any top-level value was null/empty
          duplicate_of     str|null  receipt_id of earlier identical payload
          queue_depth      int     current queue length
    """
    try:
        # ── 1. Size guard ─────────────────────────────────────────────────────
        content_length = request.content_length or 0
        if content_length > MAX_PAYLOAD_BYTES:
            return _ack(
                ReceiveCodes.RECEIVE_TOO_LARGE,
                max_bytes=MAX_PAYLOAD_BYTES,
                received_bytes=content_length,
            )

        # ── 2. Read raw body ──────────────────────────────────────────────────
        raw = request.get_data()
        if not raw:
            return _ack(ReceiveCodes.RECEIVE_REJECTED, reason="Empty body — nothing to receive")

        # ── 3. Parse ──────────────────────────────────────────────────────────
        content_type = (request.content_type or "").lower()
        payload: dict | None = None

        if "application/json" in content_type:
            try:
                payload = request.get_json(force=True, silent=False)
            except Exception:
                return _ack(ReceiveCodes.RECEIVE_MALFORMED, reason="JSON parse error")
            if payload is None:
                return _ack(ReceiveCodes.RECEIVE_MALFORMED, reason="JSON body resolved to null")
            if not isinstance(payload, dict):
                return _ack(ReceiveCodes.RECEIVE_MALFORMED, reason="Top-level JSON value must be an object")
        else:
            # Accept raw / form / binary — wrap metadata so the rest of the
            # pipeline has something consistent to work with.
            payload = {
                "content_type": content_type or "unknown",
                "raw_size":     len(raw),
                "preview":      raw[:256].decode("utf-8", errors="replace"),
            }

        # ── 4. Staleness check ────────────────────────────────────────────────
        if "sent_at" in payload:
            try:
                sent_dt  = datetime.datetime.fromisoformat(str(payload["sent_at"]).rstrip("Z"))
                age_secs = (datetime.datetime.utcnow() - sent_dt).total_seconds()
                if age_secs > STALE_SECONDS:
                    return _ack(
                        ReceiveCodes.RECEIVE_STALE,
                        reason=f"Payload is {age_secs:.1f}s old (limit: {STALE_SECONDS}s)",
                        age_seconds=age_secs,
                    )
            except (ValueError, TypeError):
                pass  # unparseable timestamp — don't reject, just skip

        # ── 5. Fingerprint & duplicate detection ──────────────────────────────
        fingerprint  = hashlib.sha256(raw).hexdigest()
        duplicate_id = next(
            (rid for rid, e in _log.items() if e["fingerprint"] == fingerprint),
            None,
        )

        # ── 6. Queue capacity check ───────────────────────────────────────────
        if len(_queue) >= MAX_QUEUE_DEPTH:
            return _ack(
                ReceiveCodes.RECEIVE_OVERFLOW,
                queue_depth=len(_queue),
                max_queue=MAX_QUEUE_DEPTH,
            )

        # ── 7. Build & store receipt ──────────────────────────────────────────
        receipt_id  = str(uuid.uuid4())
        received_at = datetime.datetime.utcnow().isoformat() + "Z"
        partial     = any(v is None or v == "" for v in payload.values())

        entry = {
            "receipt_id":   receipt_id,
            "received_at":  received_at,
            "sender_ip":    request.remote_addr,
            "http_method":  request.method,
            "payload_size": len(raw),
            "fingerprint":  fingerprint,
            "partial":      partial,
            "payload_keys": list(payload.keys()),
        }
        _log[receipt_id] = entry
        _queue.append(receipt_id)

        # ── 8. Pick acknowledgment code ───────────────────────────────────────
        if duplicate_id:
            code = ReceiveCodes.RECEIVED_DUPLICATE
        elif partial:
            code = ReceiveCodes.RECEIVED_PARTIAL
        elif len(_queue) > MAX_QUEUE_DEPTH * 0.8:
            code = ReceiveCodes.RECEIVED_QUEUED
        else:
            code = ReceiveCodes.RECEIVED

        return _ack(
            code,
            receipt_id   = receipt_id,
            http_method  = request.method,
            payload_size = len(raw),
            payload_keys = entry["payload_keys"],
            partial      = partial,
            duplicate_of = duplicate_id,
            queue_depth  = len(_queue),
        )

    except Exception as exc:
        return _ack(ReceiveCodes.RECEIVE_FAULT, reason=str(exc))


@receive_blueprint.route("/codes", methods=["GET"])
def codes():
    """Return the full custom RECEIVE status-code table."""
    return jsonify({
        "method":  "RECEIVE",
        "codes":   ReceiveCodes.table(),
        "summary": {
            "2xx": "Payload was acknowledged (always includes a receipt_id)",
            "4xx": "Sender error — fix the request and retry",
            "5xx": "Receiver error — retry later or contact the server owner",
        },
    })


@receive_blueprint.route("/log", methods=["GET"])
def log_all():
    """Return all receipt log entries, newest first."""
    entries = sorted(_log.values(), key=lambda e: e["received_at"], reverse=True)
    return jsonify({
        "total_receipts": len(entries),
        "queue_depth":    len(_queue),
        "entries":        entries,
    })


@receive_blueprint.route("/log/<receipt_id>", methods=["GET"])
def log_entry(receipt_id: str):
    """Look up a single receipt by its ID."""
    entry = _log.get(receipt_id)
    if not entry:
        return jsonify({"error": "Receipt not found", "receipt_id": receipt_id}), 404
    return jsonify(entry)


@receive_blueprint.route("/log", methods=["DELETE"])
def log_flush():
    """Flush the entire in-memory log and queue."""
    cleared = len(_log)
    _log.clear()
    _queue.clear()
    return jsonify({"flushed": cleared, "queue_depth": 0})


# ── Standalone server (python receive.py) ────────────────────────────────────

if __name__ == "__main__":
    app = Flask(__name__)
    CORS(app)
    app.register_blueprint(receive_blueprint, url_prefix="/receive")

    print("RECEIVE method server running on http://0.0.0.0:6000")
    print()
    print("  RECEIVE  http://localhost:6000/receive/")
    print("  GET      http://localhost:6000/receive/codes")
    print("  GET      http://localhost:6000/receive/log")
    print("  GET      http://localhost:6000/receive/log/<id>")
    print("  DELETE   http://localhost:6000/receive/log")
    print()
    print("Custom status codes:")
    for code, info in ReceiveCodes.table().items():
        print(f"  {code}  {info['phrase']:<24}  {info['description']}")

    app.run(host="0.0.0.0", port=6000, debug=True)
