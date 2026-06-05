#!/usr/bin/env python3
"""Unified API server — all endpoints on one port.

Run:  python3 main.py

Routes
------
GET  /api/health                    — overall health check

GET  /api/apitube/health            — APItube engine health
GET  /api/apitube/streams/<video_id>

POST /api/titanic/predict           — Titanic survival prediction
GET  /api/titanic/feature-weights   — Decision-tree feature importances

RECV /api/receive/                  — RECEIVE method ingest
GET  /api/receive/codes             — custom status-code table
GET  /api/receive/log               — receipt log
GET  /api/receive/log/<id>
DEL  /api/receive/log

GET  /api/digit/health              — digit-recognition health
POST /api/digit/predict             — predict digit(s) from image
POST /api/digit/visualize           — CNN layer activations
"""

import os
import sys

from flask import Flask, jsonify
from flask_cors import CORS

# ── Import blueprints ─────────────────────────────────────────────────────────

# receive.py (already uses Blueprint pattern)
from receive import receive_blueprint

# titanic_backend — full implementation with flask-restful + split model/trainer
_TITANIC_DIR = os.path.join(os.path.dirname(__file__), 'titanic_backend')
sys.path.insert(0, _TITANIC_DIR)
from api.titanic_api import titanic_api          # Blueprint at url_prefix='/api/titanic'
from model.titanic import initTitanic

# APItube package
from APItube.engine import apitube_bp

# digit/digit_api.py (self-patches sys.path internally)
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'digit'))
from digit_api import digit_bp

# ── App setup ─────────────────────────────────────────────────────────────────

app = Flask(__name__)
CORS(app)

app.register_blueprint(apitube_bp,        url_prefix='/api/apitube')
app.register_blueprint(titanic_api)                    # already carries url_prefix='/api/titanic'
app.register_blueprint(receive_blueprint, url_prefix='/api/receive')
app.register_blueprint(digit_bp,          url_prefix='/api/digit')

# Pre-warm the Titanic model so the first request isn't slow
initTitanic()


@app.get('/api/health')
def health():
    return jsonify({
        'ok': True,
        'services': ['apitube', 'titanic', 'receive', 'digit'],
    })


# ── Run ───────────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f'Unified API → http://localhost:{port}')
    print('  /api/apitube/streams/<video_id>')
    print('  /api/titanic/predict  /api/titanic/feature-weights')
    print('  /api/receive/')
    print('  /api/digit/predict')
    app.run(host='0.0.0.0', port=port, debug=False)
