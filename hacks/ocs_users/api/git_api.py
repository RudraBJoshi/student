import os
import subprocess

from flask import Blueprint, request, jsonify
from flask_restful import Api, Resource

git_api = Blueprint('git_api', __name__, url_prefix='/api/git')
api = Api(git_api)

DEFAULT_REPO = os.path.expanduser('~')


def _run(args: list, cwd: str) -> dict:
    """Run a git command and return stdout/stderr/returncode."""
    try:
        result = subprocess.run(
            ['git'] + args,
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=15,
        )
        return {
            'stdout':     result.stdout.strip(),
            'stderr':     result.stderr.strip(),
            'returncode': result.returncode,
            'ok':         result.returncode == 0,
        }
    except FileNotFoundError:
        return {'stdout': '', 'stderr': 'git not found in PATH', 'returncode': -1, 'ok': False}
    except subprocess.TimeoutExpired:
        return {'stdout': '', 'stderr': 'git command timed out', 'returncode': -1, 'ok': False}


def _repo(req) -> str:
    return (req.args.get('path') or req.get_json(silent=True, force=True) or {}).get('path', DEFAULT_REPO) \
        if hasattr(req, 'get_json') else DEFAULT_REPO


class GitAPI:

    class _Status(Resource):
        def get(self):
            """git status --short  +  current branch."""
            path = request.args.get('path', DEFAULT_REPO)
            status = _run(['status', '--short'], path)
            branch = _run(['rev-parse', '--abbrev-ref', 'HEAD'], path)
            remote = _run(['remote', 'get-url', 'origin'], path)
            return jsonify({
                'branch':  branch['stdout'] if branch['ok'] else 'unknown',
                'remote':  remote['stdout'] if remote['ok'] else None,
                'changes': status['stdout'],
                'clean':   status['stdout'] == '',
                'ok':      status['ok'],
                'error':   status['stderr'] if not status['ok'] else None,
            })

    class _Log(Resource):
        def get(self):
            """Last N commits (default 20)."""
            path  = request.args.get('path', DEFAULT_REPO)
            n     = min(int(request.args.get('n', 20)), 100)
            fmt   = '%H|%h|%an|%ae|%ar|%s'
            result = _run(['log', f'--max-count={n}', f'--pretty=format:{fmt}'], path)
            commits = []
            if result['ok']:
                for line in result['stdout'].splitlines():
                    parts = line.split('|', 5)
                    if len(parts) == 6:
                        commits.append({
                            'hash':    parts[0],
                            'short':   parts[1],
                            'author':  parts[2],
                            'email':   parts[3],
                            'when':    parts[4],
                            'message': parts[5],
                        })
            return jsonify({'commits': commits, 'ok': result['ok'], 'error': result['stderr'] if not result['ok'] else None})

    class _Diff(Resource):
        def get(self):
            """git diff (unstaged) or git diff --staged."""
            path   = request.args.get('path', DEFAULT_REPO)
            staged = request.args.get('staged', 'false').lower() == 'true'
            args   = ['diff', '--staged'] if staged else ['diff']
            result = _run(args, path)
            return jsonify({'diff': result['stdout'], 'ok': result['ok'], 'error': result['stderr'] if not result['ok'] else None})

    class _Add(Resource):
        def post(self):
            """git add <files>  (pass files=['.'] to stage all)."""
            body  = request.get_json(silent=True) or {}
            path  = body.get('path', DEFAULT_REPO)
            files = body.get('files', ['.'])
            if isinstance(files, str):
                files = [files]
            result = _run(['add'] + files, path)
            return jsonify({'ok': result['ok'], 'stdout': result['stdout'], 'error': result['stderr'] if not result['ok'] else None})

    class _Commit(Resource):
        def post(self):
            """git commit -m <message>."""
            body    = request.get_json(silent=True) or {}
            path    = body.get('path', DEFAULT_REPO)
            message = body.get('message', '').strip()
            if not message:
                return {'error': 'commit message is required'}, 400
            result = _run(['commit', '-m', message], path)
            return jsonify({'ok': result['ok'], 'stdout': result['stdout'], 'error': result['stderr'] if not result['ok'] else None})

    class _Push(Resource):
        def post(self):
            """git push."""
            body   = request.get_json(silent=True) or {}
            path   = body.get('path', DEFAULT_REPO)
            remote = body.get('remote', 'origin')
            branch = body.get('branch', '')
            args   = ['push', remote] + ([branch] if branch else [])
            result = _run(args, path)
            return jsonify({'ok': result['ok'], 'stdout': result['stdout'], 'stderr': result['stderr']})

    class _Pull(Resource):
        def post(self):
            """git pull."""
            body   = request.get_json(silent=True) or {}
            path   = body.get('path', DEFAULT_REPO)
            result = _run(['pull'], path)
            return jsonify({'ok': result['ok'], 'stdout': result['stdout'], 'stderr': result['stderr']})

    class _Clone(Resource):
        def post(self):
            """git clone <url> into path."""
            body   = request.get_json(silent=True) or {}
            url    = body.get('url', '').strip()
            dest   = body.get('dest', DEFAULT_REPO)
            if not url:
                return {'error': 'url is required'}, 400
            result = _run(['clone', url], dest)
            return jsonify({'ok': result['ok'], 'stdout': result['stdout'], 'stderr': result['stderr']})

    class _Branches(Resource):
        def get(self):
            """List all local branches."""
            path   = request.args.get('path', DEFAULT_REPO)
            result = _run(['branch', '--list'], path)
            branches = [b.strip().lstrip('* ') for b in result['stdout'].splitlines() if b.strip()]
            current  = _run(['rev-parse', '--abbrev-ref', 'HEAD'], path)
            return jsonify({'branches': branches, 'current': current['stdout'], 'ok': result['ok']})

    class _Checkout(Resource):
        def post(self):
            """git checkout <branch>  or  git checkout -b <branch>."""
            body   = request.get_json(silent=True) or {}
            path   = body.get('path', DEFAULT_REPO)
            branch = body.get('branch', '').strip()
            new    = body.get('new', False)
            if not branch:
                return {'error': 'branch is required'}, 400
            args   = ['checkout', '-b', branch] if new else ['checkout', branch]
            result = _run(args, path)
            return jsonify({'ok': result['ok'], 'stdout': result['stdout'], 'error': result['stderr'] if not result['ok'] else None})


api.add_resource(GitAPI._Status,   '/status')
api.add_resource(GitAPI._Log,      '/log')
api.add_resource(GitAPI._Diff,     '/diff')
api.add_resource(GitAPI._Add,      '/add')
api.add_resource(GitAPI._Commit,   '/commit')
api.add_resource(GitAPI._Push,     '/push')
api.add_resource(GitAPI._Pull,     '/pull')
api.add_resource(GitAPI._Clone,    '/clone')
api.add_resource(GitAPI._Branches, '/branches')
api.add_resource(GitAPI._Checkout, '/checkout')
