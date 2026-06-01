from flask import Flask, send_from_directory, request
from flask_socketio import SocketIO, join_room, emit
import random, json, time, os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'worldgame-2025'
socketio = SocketIO(app, cors_allowed_origins='*')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOMS_FILE = os.path.join(BASE_DIR, 'rooms.json')
ROOM_TTL = 30 * 24 * 3600  # drop rooms inactive for 30+ days

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

@app.route('/')
def index():
    return send_from_directory(BASE_DIR, 'index.html')

@socketio.on('create_room')
def on_create_room(payload):
    requested = payload.get('code', '').upper().strip()
    if requested and requested in rooms:
        # Rejoin existing persistent room
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
    for code in list(rooms.keys()):
        if request.sid in rooms[code]['sids']:
            rooms[code]['sids'].discard(request.sid)
            # Keep room alive — don't delete it
            emit('player_count', {'count': len(rooms[code]['sids'])}, to=code)
            break

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)
