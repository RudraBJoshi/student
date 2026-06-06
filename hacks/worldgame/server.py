import eventlet
eventlet.monkey_patch()
from flask import Flask, send_from_directory, request, jsonify, abort
from flask_socketio import SocketIO, join_room, emit
import random, json, time, os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'worldgame-2025'
socketio = SocketIO(app, cors_allowed_origins='*')

# Only this token grants superuser access — set it here, never exposed client-side.
# Pass it at connection time via query string: io('http://...', {query: {su: TOKEN}})
# Nobody can promote themselves; auth happens server-side on connect only.
SUPERUSER_TOKEN = os.environ.get('SUPERUSER_TOKEN', '@RS-M@GNUM')

superuser_sids: set[str] = set()  # populated on connect, cleared on disconnect

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOMS_FILE = os.path.join(BASE_DIR, 'rooms.json')
ROOM_TTL = 30 * 24 * 3600

def load_rooms():
    try:
        with open(ROOMS_FILE) as f:
            data = json.load(f)
        now = time.time()
        return {
            code: {'state': r['state'], 'ts': r.get('ts', now), 'sids': set()}
            for code, r in data.items()
            if now - r.get('ts', 0) < ROOM_TTL
        }
    except (FileNotFoundError, json.JSONDecodeError):
        return {}

def save_rooms():
    data = {code: {'state': r['state'], 'ts': r.get('ts', time.time())}
            for code, r in rooms.items()}
    with open(ROOMS_FILE, 'w') as f:
        json.dump(data, f)

rooms = load_rooms()

def gen_code():
    chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    for _ in range(200):
        code = ''.join(random.choices(chars, k=6))
        if code not in rooms:
            return code
    raise RuntimeError('Could not generate a unique room code')

# ── Connection: grant superuser at connect time only ─────────────────────────

@socketio.on('connect')
def on_connect():
    token = request.args.get('su', '')
    if token and token == SUPERUSER_TOKEN:
        superuser_sids.add(request.sid)
        emit('superuser_ok', {'rooms': len(rooms)})

# ── Regular game events ───────────────────────────────────────────────────────

@app.route('/')
def index():
    return send_from_directory(BASE_DIR, 'index.html')

@socketio.on('create_room')
def on_create_room(payload):
    requested = payload.get('code', '').upper().strip()
    if requested and requested in rooms:
        code = requested
        rooms[code]['sids'].add(request.sid)
        join_room(code)
        emit('room_created', {'code': code})
        if rooms[code]['state']:
            emit('state_update', rooms[code]['state'])
    else:
        code = requested if requested and len(requested) >= 4 else gen_code()
        rooms[code] = {'state': payload.get('data'), 'ts': time.time(), 'sids': {request.sid}}
        join_room(code)
        emit('room_created', {'code': code})
        save_rooms()
    emit('player_count', {'count': len(rooms[code]['sids'])}, to=code)

@socketio.on('join_room')
def on_join_room(payload):
    code = payload.get('code', '').upper().strip()
    if code not in rooms:
        emit('room_error', {'message': f'Room "{code}" not found. Is the host still online?'})
        return
    rooms[code]['sids'].add(request.sid)
    join_room(code)
    emit('room_joined', {'code': code})
    if rooms[code]['state']:
        emit('state_update', rooms[code]['state'])
    emit('player_count', {'count': len(rooms[code]['sids'])}, to=code)

@socketio.on('state_update')
def on_state_update(payload):
    code = payload.get('room')
    data = payload.get('data')
    if code and code in rooms:
        rooms[code]['state'] = data
        rooms[code]['ts'] = time.time()
        save_rooms()
        emit('state_update', data, to=code, include_self=False)

@socketio.on('disconnect')
def on_disconnect():
    superuser_sids.discard(request.sid)
    for code in list(rooms.keys()):
        if request.sid in rooms[code]['sids']:
            rooms[code]['sids'].discard(request.sid)
            emit('player_count', {'count': len(rooms[code]['sids'])}, to=code)
            break

# ── Superuser-only socket events ──────────────────────────────────────────────

def _require_su():
    """Returns True if current SID is superuser, else emits denied and returns False."""
    if request.sid in superuser_sids:
        return True
    emit('superuser_denied', {'message': 'Not authorized'})
    return False

@socketio.on('admin_list_rooms')
def on_admin_list_rooms():
    if not _require_su(): return
    summary = {
        code: {'players': len(r['sids']), 'ts': r.get('ts', 0)}
        for code, r in rooms.items()
    }
    emit('admin_rooms', {'rooms': summary})

@socketio.on('admin_delete_room')
def on_admin_delete_room(payload):
    if not _require_su(): return
    code = payload.get('code', '').upper().strip()
    if code in rooms:
        del rooms[code]
        save_rooms()
        emit('admin_ok', {'message': f'Room {code} deleted'})
    else:
        emit('admin_error', {'message': f'Room {code} not found'})

@socketio.on('admin_reset_room')
def on_admin_reset_room(payload):
    if not _require_su(): return
    code = payload.get('code', '').upper().strip()
    if code in rooms:
        rooms[code]['state'] = None
        rooms[code]['ts'] = time.time()
        save_rooms()
        emit('state_update', None, to=code)
        emit('admin_ok', {'message': f'Room {code} reset'})
    else:
        emit('admin_error', {'message': f'Room {code} not found'})

# ── Admin HTTP endpoint ───────────────────────────────────────────────────────

@app.route('/admin')
def admin_panel():
    if request.args.get('su', '') != SUPERUSER_TOKEN:
        abort(403)
    summary = sorted(
        [{'code': c, 'players': len(r['sids']), 'ts': r.get('ts', 0)} for c, r in rooms.items()],
        key=lambda x: -x['ts']
    )
    return jsonify({'total_rooms': len(rooms), 'rooms': summary})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLY_APP_NAME') is None
    socketio.run(app, host='0.0.0.0', port=port, debug=debug, allow_unsafe_werkzeug=True)
