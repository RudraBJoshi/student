import eventlet
eventlet.monkey_patch()
from flask import Flask, send_from_directory, request, jsonify, abort
from flask_socketio import SocketIO, join_room, emit
import random, json, time, os, sqlite3

app = Flask(__name__)
app.config['SECRET_KEY'] = 'worldgame-2025'
socketio = SocketIO(app, cors_allowed_origins='*', async_mode='eventlet',
                   ping_interval=25, ping_timeout=60)

SUPERUSER_TOKEN = os.environ.get('SUPERUSER_TOKEN', '@RS-M@GNUM')
superuser_sids: set[str] = set()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.environ.get('DATA_DIR', '/data' if os.path.isdir('/data') else BASE_DIR)
DB_PATH  = os.path.join(DATA_DIR, 'worldgame.db')
ROOM_TTL = 60 * 24 * 3600  # 60 days

# ── SQLite helpers ────────────────────────────────────────────────────────────

def db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    with db() as c:
        c.execute('''CREATE TABLE IF NOT EXISTS rooms (
            code TEXT PRIMARY KEY,
            state TEXT,
            ts    REAL
        )''')

def load_rooms():
    try:
        init_db()
        now = time.time()
        result = {}
        with db() as c:
            rows = c.execute(
                'SELECT code, state, ts FROM rooms WHERE ts > ?',
                (now - ROOM_TTL,)
            ).fetchall()
        for row in rows:
            state = json.loads(row['state']) if row['state'] else None
            result[row['code']] = {'state': state, 'ts': row['ts'], 'sids': set()}
        return result
    except Exception as e:
        print(f'DB load error: {e}')
        return {}

def upsert_room(code, room):
    with db() as c:
        c.execute(
            'INSERT OR REPLACE INTO rooms (code, state, ts) VALUES (?, ?, ?)',
            (code, json.dumps(room['state']), room.get('ts', time.time()))
        )

def remove_room(code):
    with db() as c:
        c.execute('DELETE FROM rooms WHERE code = ?', (code,))

rooms = load_rooms()

# ── Helpers ───────────────────────────────────────────────────────────────────

def gen_code():
    chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    for _ in range(200):
        code = ''.join(random.choices(chars, k=6))
        if code not in rooms:
            return code
    raise RuntimeError('Could not generate a unique room code')

# ── Connection ────────────────────────────────────────────────────────────────

@socketio.on('connect')
def on_connect():
    token = request.args.get('su', '')
    if token and token == SUPERUSER_TOKEN:
        superuser_sids.add(request.sid)
        emit('superuser_ok', {'rooms': len(rooms)})

# ── Routes ────────────────────────────────────────────────────────────────────

@app.route('/')
def index():
    return send_from_directory(BASE_DIR, 'index.html')

# ── Game events ───────────────────────────────────────────────────────────────

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
        upsert_room(code, rooms[code])
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
        upsert_room(code, rooms[code])
        emit('state_update', data, to=code, include_self=False)

@socketio.on('disconnect')
def on_disconnect():
    superuser_sids.discard(request.sid)
    for code in list(rooms.keys()):
        if request.sid in rooms[code]['sids']:
            rooms[code]['sids'].discard(request.sid)
            emit('player_count', {'count': len(rooms[code]['sids'])}, to=code)
            break

# ── Superuser socket events ───────────────────────────────────────────────────

def _require_su():
    if request.sid in superuser_sids:
        return True
    emit('superuser_denied', {'message': 'Not authorized'})
    return False

@socketio.on('admin_list_rooms')
def on_admin_list_rooms():
    if not _require_su(): return
    emit('admin_rooms', {'rooms': {
        code: {'players': len(r['sids']), 'ts': r.get('ts', 0)}
        for code, r in rooms.items()
    }})

@socketio.on('admin_delete_room')
def on_admin_delete_room(payload):
    if not _require_su(): return
    code = payload.get('code', '').upper().strip()
    if code in rooms:
        del rooms[code]
        remove_room(code)
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
        upsert_room(code, rooms[code])
        emit('state_update', None, to=code)
        emit('admin_ok', {'message': f'Room {code} reset'})
    else:
        emit('admin_error', {'message': f'Room {code} not found'})

# ── Admin HTTP ────────────────────────────────────────────────────────────────

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
    port  = int(os.environ.get('PORT', 8080))
    debug = os.environ.get('FLY_APP_NAME') is None
    socketio.run(app, host='0.0.0.0', port=port, debug=debug, allow_unsafe_werkzeug=True)
