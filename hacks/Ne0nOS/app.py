import ast
import operator as op
import datetime
import random
import secrets

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps

app = Flask(__name__)
app.config['SECRET_KEY'] = 'ne0n-0s-5ecr3t-k3y-xK9p2024'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ne0nos.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
CORS(app, supports_credentials=True)


# ── Models ────────────────────────────────────────────────────────────────────

class User(db.Model):
    id         = db.Column(db.Integer, primary_key=True)
    username   = db.Column(db.String(80), unique=True, nullable=False)
    pw_hash    = db.Column(db.String(200), nullable=False)
    is_admin   = db.Column(db.Boolean, default=False)
    auth_token = db.Column(db.String(64), unique=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    files      = db.relationship('UserFile', backref='owner', lazy=True,
                                 cascade='all, delete-orphan')


class UserFile(db.Model):
    id          = db.Column(db.Integer, primary_key=True)
    name        = db.Column(db.String(255), nullable=False)
    content     = db.Column(db.Text, default='')
    created_at  = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    modified_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    user_id     = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)


# ── Auth helpers ──────────────────────────────────────────────────────────────

def current_user():
    token = request.headers.get('Authorization', '').strip()
    return User.query.filter_by(auth_token=token).first() if token else None


def auth_required(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        u = current_user()
        if not u:
            return jsonify({'error': 'Unauthorized'}), 401
        return f(u, *args, **kwargs)
    return wrap


# ── Auth routes ───────────────────────────────────────────────────────────────

@app.route('/api/auth/register', methods=['POST'])
def register():
    d = request.get_json() or {}
    username = (d.get('username') or '').strip()
    password = d.get('password') or ''
    if len(username) < 3:
        return jsonify({'error': 'Username must be at least 3 characters'}), 400
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already taken'}), 400
    token = secrets.token_hex(32)
    u = User(username=username, pw_hash=generate_password_hash(password),
             is_admin=(User.query.count() == 0), auth_token=token)
    db.session.add(u)
    db.session.commit()
    return jsonify({'token': token, 'username': u.username, 'is_admin': u.is_admin})


@app.route('/api/auth/login', methods=['POST'])
def login():
    d = request.get_json() or {}
    u = User.query.filter_by(username=(d.get('username') or '').strip()).first()
    if not u or not check_password_hash(u.pw_hash, d.get('password') or ''):
        return jsonify({'error': 'Invalid credentials'}), 401
    u.auth_token = secrets.token_hex(32)
    db.session.commit()
    return jsonify({'token': u.auth_token, 'username': u.username, 'is_admin': u.is_admin})


@app.route('/api/auth/logout', methods=['POST'])
@auth_required
def logout(u):
    u.auth_token = None
    db.session.commit()
    return jsonify({'ok': True})


# ── User API ──────────────────────────────────────────────────────────────────

@app.route('/api/user')
@auth_required
def api_user(u):
    return jsonify({'username': u.username, 'is_admin': u.is_admin,
                    'created_at': u.created_at.strftime('%Y-%m-%d %H:%M')})


@app.route('/api/user/password', methods=['POST'])
@auth_required
def change_password(u):
    d = request.get_json() or {}
    if not check_password_hash(u.pw_hash, d.get('current', '')):
        return jsonify({'error': 'Current password is incorrect'}), 400
    new_pw = d.get('new', '')
    if len(new_pw) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    if new_pw != d.get('confirm', ''):
        return jsonify({'error': 'Passwords do not match'}), 400
    u.pw_hash = generate_password_hash(new_pw)
    db.session.commit()
    return jsonify({'ok': True})


@app.route('/api/users')
@auth_required
def list_users(u):
    if not u.is_admin:
        return jsonify({'error': 'Admin required'}), 403
    return jsonify([{'username': x.username, 'is_admin': x.is_admin,
                     'created_at': x.created_at.strftime('%Y-%m-%d')}
                    for x in User.query.order_by(User.created_at).all()])


@app.route('/api/users/<uname>/promote', methods=['POST'])
@auth_required
def promote(u, uname):
    if not u.is_admin:
        return jsonify({'error': 'Admin required'}), 403
    target = User.query.filter_by(username=uname).first_or_404()
    target.is_admin = True
    db.session.commit()
    return jsonify({'ok': True})


@app.route('/api/users/<uname>', methods=['DELETE'])
@auth_required
def delete_user(u, uname):
    if not u.is_admin:
        return jsonify({'error': 'Admin required'}), 403
    if uname == u.username:
        return jsonify({'error': 'Cannot delete yourself'}), 400
    target = User.query.filter_by(username=uname).first_or_404()
    db.session.delete(target)
    db.session.commit()
    return jsonify({'ok': True})


# ── Files API ─────────────────────────────────────────────────────────────────

@app.route('/api/files')
@auth_required
def list_files(u):
    files = UserFile.query.filter_by(user_id=u.id).order_by(UserFile.name).all()
    return jsonify([{'id': f.id, 'name': f.name, 'size': len(f.content or ''),
                     'modified_at': f.modified_at.strftime('%Y-%m-%d %H:%M')}
                    for f in files])


@app.route('/api/files', methods=['POST'])
@auth_required
def save_file(u):
    d = request.get_json() or {}
    name = (d.get('name') or '').strip()
    if not name:
        return jsonify({'error': 'Filename required'}), 400
    content = d.get('content') or ''
    f = UserFile.query.filter_by(user_id=u.id, name=name).first()
    if f:
        f.content = content
        f.modified_at = datetime.datetime.utcnow()
    else:
        f = UserFile(name=name, content=content, user_id=u.id)
        db.session.add(f)
    db.session.commit()
    return jsonify({'ok': True, 'id': f.id})


@app.route('/api/files/<int:fid>')
@auth_required
def get_file(u, fid):
    f = UserFile.query.filter_by(id=fid, user_id=u.id).first_or_404()
    return jsonify({'name': f.name, 'content': f.content or ''})


@app.route('/api/files/<int:fid>', methods=['DELETE'])
@auth_required
def delete_file(u, fid):
    f = UserFile.query.filter_by(id=fid, user_id=u.id).first_or_404()
    db.session.delete(f)
    db.session.commit()
    return jsonify({'ok': True})


# ── Terminal API ──────────────────────────────────────────────────────────────

@app.route('/api/terminal', methods=['POST'])
@auth_required
def terminal(u):
    d = request.get_json() or {}
    cmd = (d.get('cmd') or '').strip()
    cwd = d.get('cwd') or f'/home/{u.username}'
    return process_cmd(cmd, cwd, u)


def safe_calc(expr):
    ops = {ast.Add: op.add, ast.Sub: op.sub, ast.Mult: op.mul,
           ast.Div: op.truediv, ast.Pow: op.pow, ast.USub: op.neg,
           ast.Mod: op.mod, ast.FloorDiv: op.floordiv}

    def ev(node):
        if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
            return node.value
        if isinstance(node, ast.BinOp) and type(node.op) in ops:
            return ops[type(node.op)](ev(node.left), ev(node.right))
        if isinstance(node, ast.UnaryOp) and type(node.op) in ops:
            return ops[type(node.op)](ev(node.operand))
        raise ValueError
    return ev(ast.parse(expr, mode='eval').body)


def R(out, cwd=None, **extra):
    r = {'out': out, **extra}
    if cwd:
        r['cwd'] = cwd
    return jsonify(r)


def process_cmd(raw, cwd, u):
    if not raw:
        return jsonify({'out': '', 'cwd': cwd})

    parts = raw.split()
    cmd, args = parts[0], parts[1:]
    uid, username, is_admin = u.id, u.username, u.is_admin

    if cmd == 'help':
        return R(HELP_TEXT, html=True)
    if cmd == 'clear':
        return R('', clear=True)
    if cmd == 'whoami':
        role = ' <span class="t-admin">[admin]</span>' if is_admin else ''
        return R(f'{username}{role}', html=True)
    if cmd == 'date':
        return R(datetime.datetime.now().strftime('%A, %B %d %Y  %H:%M:%S'))
    if cmd == 'uptime':
        return R('up 9 days, 16:42:03  |  1 user  |  load: 0.08, 0.04, 0.01')
    if cmd == 'uname':
        if args and args[0] == '-a':
            return R('Ne0nOS ne0nkernel 5.0.0-neon #1 SMP x86_64 GNU/NeonOS')
        return R('Ne0nOS')
    if cmd == 'echo':
        return R(' '.join(args))
    if cmd == 'pwd':
        return R(cwd)
    if cmd == 'version':
        return R('Ne0n OS 1.0.0 | NeonKernel 5.0 | © 2024 Ne0n Systems')
    if cmd == 'theme':
        return R('Theme: <span class="t-neon-c">Neon Dark Pro</span> '
                 '| <span class="t-neon-g">■</span> <span class="t-neon-c">■</span> '
                 '<span class="t-neon-p">■</span>', html=True)

    if cmd == 'cd':
        if not args or args[0] == '~':
            return jsonify({'out': '', 'cwd': f'/home/{username}'})
        t = args[0]
        new_cwd = (cwd.rsplit('/', 1)[0] or '/') if t == '..' else (t if t.startswith('/') else f'{cwd}/{t}')
        return jsonify({'out': '', 'cwd': new_cwd})

    if cmd in ('ls', 'dir'):
        files = UserFile.query.filter_by(user_id=uid).order_by(UserFile.name).all()
        if not files:
            return R('<span class="t-muted">No files. Use: touch &lt;name&gt; or write &lt;name&gt; &lt;text&gt;</span>', html=True)
        return R('  '.join(f'<span class="t-file">{f.name}</span>' for f in files), html=True)

    if cmd == 'cat':
        if not args:
            return R('<span class="t-err">Usage: cat &lt;filename&gt;</span>', html=True)
        f = UserFile.query.filter_by(user_id=uid, name=args[0]).first()
        return R(f.content or '(empty)') if f else R(f'<span class="t-err">cat: {args[0]}: No such file</span>', html=True)

    if cmd == 'touch':
        if not args:
            return R('<span class="t-err">Usage: touch &lt;filename&gt;</span>', html=True)
        if not UserFile.query.filter_by(user_id=uid, name=args[0]).first():
            db.session.add(UserFile(name=args[0], content='', user_id=uid))
            db.session.commit()
        return R('')

    if cmd in ('write', 'append'):
        if len(args) < 2:
            return R(f'<span class="t-err">Usage: {cmd} &lt;filename&gt; &lt;content&gt;</span>', html=True)
        name, content = args[0], ' '.join(args[1:])
        f = UserFile.query.filter_by(user_id=uid, name=name).first()
        if f:
            f.content = (f.content or '') + '\n' + content if cmd == 'append' else content
            f.modified_at = datetime.datetime.utcnow()
        else:
            db.session.add(UserFile(name=name, content=content, user_id=uid))
        db.session.commit()
        return R(f'<span class="t-ok">✓ Saved to {name}</span>', html=True)

    if cmd == 'nano':
        fname = args[0] if args else 'untitled.txt'
        return R(f'Opening {fname} in editor...', open_app='editor', open_arg=fname)

    if cmd == 'rm':
        if not args:
            return R('<span class="t-err">Usage: rm &lt;filename&gt;</span>', html=True)
        f = UserFile.query.filter_by(user_id=uid, name=args[0]).first()
        if not f:
            return R(f'<span class="t-err">rm: {args[0]}: No such file</span>', html=True)
        db.session.delete(f)
        db.session.commit()
        return R(f'Removed {args[0]}')

    if cmd == 'wc':
        if not args:
            return R('<span class="t-err">Usage: wc &lt;filename&gt;</span>', html=True)
        f = UserFile.query.filter_by(user_id=uid, name=args[0]).first()
        if not f:
            return R(f'<span class="t-err">wc: {args[0]}: No such file</span>', html=True)
        c = f.content or ''
        return R(f'  {c.count(chr(10)) + bool(c):4}  {len(c.split()):4}  {len(c):4}  {args[0]}')

    if cmd == 'grep':
        if len(args) < 2:
            return R('<span class="t-err">Usage: grep &lt;pattern&gt; &lt;filename&gt;</span>', html=True)
        pattern, filename = args[0], args[1]
        f = UserFile.query.filter_by(user_id=uid, name=filename).first()
        if not f:
            return R(f'<span class="t-err">grep: {filename}: No such file</span>', html=True)
        matches = [l.replace(pattern, f'<span class="t-match">{pattern}</span>')
                   for l in (f.content or '').splitlines() if pattern.lower() in l.lower()]
        return R('\n'.join(matches) if matches else '', html=True)

    if cmd == 'neofetch':
        fc = UserFile.query.filter_by(user_id=uid).count()
        uc = User.query.count()
        role = 'admin' if is_admin else 'user'
        return R(f'''<pre class="t-neofetch">
<span class="t-neon-g">  ███╗   ██╗███████╗ ██████╗ ███╗  </span>   <span class="t-neon-c">OS</span>      Ne0n OS 1.0.0
<span class="t-neon-g">  ████╗  ██║██╔════╝██╔═████╗████╗ </span>   <span class="t-neon-c">Kernel</span>  NeonKernel 5.0
<span class="t-neon-g">  ██╔██╗ ██║█████╗  ██║██╔██║██╔██╗</span>   <span class="t-neon-c">User</span>    {username} ({role})
<span class="t-neon-g">  ██║╚██╗██║██╔══╝  ████╔╝██║██║╚██</span>   <span class="t-neon-c">Shell</span>   ne0nsh 1.0
<span class="t-neon-g">  ██║ ╚████║███████╗╚██████╔╝██║ ╚█</span>   <span class="t-neon-c">Theme</span>   Neon Dark Pro
<span class="t-neon-g">  ╚═╝  ╚═══╝╚══════╝ ╚═════╝ ╚═╝  </span>   <span class="t-neon-c">Files</span>   {fc}  Users: {uc}
</pre>''', html=True)

    if cmd == 'sysinfo':
        return R(f'''<table class="t-table">
<tr><td class="t-key">OS</td><td>Ne0n OS 1.0.0</td></tr>
<tr><td class="t-key">Kernel</td><td>NeonKernel 5.0.0-neon-amd64</td></tr>
<tr><td class="t-key">Shell</td><td>ne0nsh 1.0</td></tr>
<tr><td class="t-key">Theme</td><td>Neon Dark Pro</td></tr>
<tr><td class="t-key">Users</td><td>{User.query.count()}</td></tr>
<tr><td class="t-key">Files</td><td>{UserFile.query.count()}</td></tr>
<tr><td class="t-key">Uptime</td><td>9 days, 16:42</td></tr>
</table>''', html=True)

    if cmd == 'banner':
        return R(BANNER_TEXT, html=True)
    if cmd in ('matrix', 'rain'):
        return R('', effect='matrix')
    if cmd == 'hack':
        return R('', effect='hack')

    if cmd == 'calc':
        if not args:
            return R('Usage: calc &lt;expr&gt;  e.g. calc 2**10', html=True)
        try:
            expr = ' '.join(args)
            res = safe_calc(expr)
            if isinstance(res, float) and res.is_integer():
                res = int(res)
            return R(f'<span class="t-ok">{expr} = {res}</span>', html=True)
        except Exception:
            return R('<span class="t-err">Error: invalid expression</span>', html=True)

    if cmd == 'color':
        schemes = ['green', 'cyan', 'pink', 'orange', 'white', 'blue']
        if not args:
            return R(f'Usage: color &lt;scheme&gt;  Available: {", ".join(schemes)}', html=True)
        s = args[0].lower()
        if s not in schemes:
            return R(f'<span class="t-err">Unknown scheme. Try: {", ".join(schemes)}</span>', html=True)
        return R(f'Color scheme: <span class="t-ok">{s}</span>', html=True, color_scheme=s)

    if cmd == 'apps':
        return R(APPS_LIST, html=True)

    if cmd == 'open':
        if not args:
            return R('Usage: open &lt;app&gt;', html=True)
        name = args[0].lower()
        valid = ['terminal', 'editor', 'files', 'calculator', 'monitor', 'settings']
        if name not in valid:
            return R(f'<span class="t-err">Unknown app: {name}</span>', html=True)
        return R(f'Opening {name}...', open_app=name)

    if cmd == 'ping':
        target = args[0] if args else 'ne0n.os'
        lines = [f'PING {target}: 56 data bytes']
        for i in range(4):
            ms = round(random.uniform(0.5, 5.0), 3)
            lines.append(f'64 bytes from {target}: icmp_seq={i} ttl=64 time={ms} ms')
        lines += [f'--- {target} ping statistics ---', '4 transmitted, 4 received, 0% packet loss']
        return R('\n'.join(lines))

    if cmd == 'passwd':
        return R('Opening settings...', open_app='settings')

    if cmd == 'users':
        if not is_admin:
            return R('<span class="t-err">Permission denied: admin only</span>', html=True)
        rows = [f'  {x.username}{"  <span class=\"t-admin\">[admin]</span>" if x.is_admin else ""}  '
                f'<span class="t-muted">{x.created_at.strftime("%Y-%m-%d")}</span>'
                for x in User.query.order_by(User.created_at).all()]
        return R('\n'.join(rows), html=True)

    if cmd == 'history':
        return R('', show_history=True)
    if cmd == 'logout':
        return R('Logging out...', logout=True)
    if cmd in ('exit', 'quit'):
        return R('Use <span class="t-cmd">logout</span> to end your session.', html=True)

    return R(f'<span class="t-err">ne0nsh: {cmd}: command not found</span>\n'
             'Type <span class="t-cmd">help</span> for available commands.', html=True)


HELP_TEXT = '''<div class="t-help"><span class="t-divider">━━━━━━━━━━ Ne0n Shell Help ━━━━━━━━━━</span>
<span class="t-cat">FILES</span>
  <span class="t-cmd">ls</span>                 List files
  <span class="t-cmd">cat</span> &lt;file&gt;         View file
  <span class="t-cmd">touch</span> &lt;file&gt;       Create file
  <span class="t-cmd">write</span> &lt;f&gt; &lt;text&gt;  Write to file
  <span class="t-cmd">append</span> &lt;f&gt; &lt;text&gt; Append to file
  <span class="t-cmd">rm</span> &lt;file&gt;         Delete file
  <span class="t-cmd">nano</span> &lt;file&gt;        Edit in editor
  <span class="t-cmd">wc</span> &lt;file&gt;         Word/line count
  <span class="t-cmd">grep</span> &lt;pat&gt; &lt;file&gt; Search file
  <span class="t-cmd">pwd</span> / <span class="t-cmd">cd</span>          Directory nav

<span class="t-cat">SYSTEM</span>
  <span class="t-cmd">whoami</span>  <span class="t-cmd">date</span>  <span class="t-cmd">uptime</span>  <span class="t-cmd">uname</span> [-a]
  <span class="t-cmd">neofetch</span>  <span class="t-cmd">sysinfo</span>  <span class="t-cmd">version</span>  <span class="t-cmd">theme</span>

<span class="t-cat">APPS</span>
  <span class="t-cmd">apps</span>               List apps
  <span class="t-cmd">open</span> &lt;app&gt;        Open app
  <span class="t-cmd">calc</span> &lt;expr&gt;       Calculator

<span class="t-cat">ACCOUNT</span>
  <span class="t-cmd">users</span>  <span class="t-cmd">passwd</span>  <span class="t-cmd">logout</span>

<span class="t-cat">FUN</span>
  <span class="t-cmd">matrix</span>  <span class="t-cmd">rain</span>  <span class="t-cmd">hack</span>  <span class="t-cmd">banner</span>
  <span class="t-cmd">ping</span> &lt;host&gt;  <span class="t-cmd">echo</span> &lt;text&gt;
  <span class="t-cmd">color</span> &lt;green|cyan|pink|orange|blue|white&gt;
  <span class="t-cmd">history</span>  <span class="t-cmd">clear</span>  (Ctrl+L also clears)
<span class="t-divider">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</span></div>'''

BANNER_TEXT = '''<pre class="t-banner">
<span class="t-neon-c"> ███╗   ██╗███████╗ ██████╗ ███╗   ██╗     ██████╗ ███████╗
 ████╗  ██║██╔════╝██╔═══██╗████╗  ██║    ██╔═══██╗██╔════╝
 ██╔██╗ ██║█████╗  ██║   ██║██╔██╗ ██║    ██║   ██║███████╗
 ██║╚██╗██║██╔══╝  ██║   ██║██║╚██╗██║    ██║   ██║╚════██║
 ██║ ╚████║███████╗╚██████╔╝██║ ╚████║    ╚██████╔╝███████║
 ╚═╝  ╚═══╝╚══════╝ ╚═════╝ ╚═╝  ╚═══╝     ╚═════╝ ╚══════╝</span>
<span class="t-neon-p">        ✦ The Neon-Powered Operating System  v1.0.0 ✦        </span>
</pre>'''

APPS_LIST = '''<div>
  <span class="t-cmd">terminal</span>    Terminal Emulator
  <span class="t-cmd">editor</span>      Text Editor
  <span class="t-cmd">files</span>       File Manager
  <span class="t-cmd">calculator</span>  Scientific Calculator
  <span class="t-cmd">monitor</span>     System Monitor
  <span class="t-cmd">settings</span>    Settings &amp; Account
</div>'''


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
