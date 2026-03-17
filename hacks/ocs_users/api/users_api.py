from flask import Blueprint, request, jsonify
from flask_restful import Api, Resource
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    set_access_cookies,
    set_refresh_cookies,
    unset_jwt_cookies,
)

from model.users import db, User

users_api = Blueprint('users_api', __name__, url_prefix='/api/users')
api = Api(users_api)


class UsersAPI:

    # ── POST /api/users/register ──────────────────────────────────────────
    class _Register(Resource):
        def post(self):
            """Register a new OCS user.

            Body: { username, email, password }
            Returns: user object + JWT access token
            """
            body = request.get_json(silent=True)
            if not body:
                return {'error': 'No JSON body provided'}, 400

            username = (body.get('username') or '').strip()
            email    = (body.get('email')    or '').strip().lower()
            password =  body.get('password') or ''

            if not username or not email or not password:
                return {'error': 'username, email, and password are required'}, 400
            if len(password) < 6:
                return {'error': 'Password must be at least 6 characters'}, 400

            if User.query.filter_by(username=username).first():
                return {'error': 'Username already taken'}, 409
            if User.query.filter_by(email=email).first():
                return {'error': 'Email already registered'}, 409

            user = User(username=username, email=email)
            user.password = password
            db.session.add(user)
            db.session.commit()

            access_token  = create_access_token(identity=user.id)
            refresh_token = create_refresh_token(identity=user.id)

            resp = jsonify({
                'message': 'User registered successfully',
                'user':    user.to_dict(),
                'access_token': access_token,
            })
            set_access_cookies(resp, access_token)
            set_refresh_cookies(resp, refresh_token)
            return resp, 201

    # ── POST /api/users/login ─────────────────────────────────────────────
    class _Login(Resource):
        def post(self):
            """Login with username or email + password.

            Body: { username_or_email, password }
            Returns: user object + JWT access token
            """
            body = request.get_json(silent=True)
            if not body:
                return {'error': 'No JSON body provided'}, 400

            identifier = (body.get('username_or_email') or '').strip()
            password   =  body.get('password') or ''

            if not identifier or not password:
                return {'error': 'username_or_email and password are required'}, 400

            user = (
                User.query.filter_by(username=identifier).first()
                or User.query.filter_by(email=identifier.lower()).first()
            )

            if not user or not user.check_password(password):
                return {'error': 'Invalid credentials'}, 401

            access_token  = create_access_token(identity=user.id)
            refresh_token = create_refresh_token(identity=user.id)

            resp = jsonify({
                'message': 'Login successful',
                'user':    user.to_dict(),
                'access_token': access_token,
            })
            set_access_cookies(resp, access_token)
            set_refresh_cookies(resp, refresh_token)
            return resp

    # ── DELETE /api/users/logout ──────────────────────────────────────────
    class _Logout(Resource):
        @jwt_required()
        def delete(self):
            """Clear JWT cookies and log out."""
            resp = jsonify({'message': 'Logged out'})
            unset_jwt_cookies(resp)
            return resp

    # ── GET/PUT /api/users/profile ────────────────────────────────────────
    class _Profile(Resource):
        @jwt_required()
        def get(self):
            """Return the current user's profile."""
            user = User.query.get(get_jwt_identity())
            if not user:
                return {'error': 'User not found'}, 404
            return jsonify(user.to_dict())

        @jwt_required()
        def put(self):
            """Update username or email.

            Body: { username?, email? }
            """
            user = User.query.get(get_jwt_identity())
            if not user:
                return {'error': 'User not found'}, 404

            body = request.get_json(silent=True) or {}
            new_username = (body.get('username') or '').strip()
            new_email    = (body.get('email')    or '').strip().lower()

            if new_username and new_username != user.username:
                if User.query.filter_by(username=new_username).first():
                    return {'error': 'Username already taken'}, 409
                user.username = new_username

            if new_email and new_email != user.email:
                if User.query.filter_by(email=new_email).first():
                    return {'error': 'Email already registered'}, 409
                user.email = new_email

            db.session.commit()
            return jsonify({'message': 'Profile updated', 'user': user.to_dict()})

    # ── GET /api/users (admin only) ───────────────────────────────────────
    class _AllUsers(Resource):
        @jwt_required()
        def get(self):
            """Return all users. Requires admin role."""
            caller = User.query.get(get_jwt_identity())
            if not caller or caller.role != 'admin':
                return {'error': 'Admin access required'}, 403
            users = User.query.order_by(User.created_at.desc()).all()
            return jsonify([u.to_dict() for u in users])

    # ── POST /api/users/refresh ───────────────────────────────────────────
    class _Refresh(Resource):
        @jwt_required(refresh=True)
        def post(self):
            """Issue a new access token from a valid refresh token."""
            new_token = create_access_token(identity=get_jwt_identity())
            resp = jsonify({'access_token': new_token})
            set_access_cookies(resp, new_token)
            return resp


api.add_resource(UsersAPI._Register, '/register')
api.add_resource(UsersAPI._Login,    '/login')
api.add_resource(UsersAPI._Logout,   '/logout')
api.add_resource(UsersAPI._Profile,  '/profile')
api.add_resource(UsersAPI._AllUsers, '/')
api.add_resource(UsersAPI._Refresh,  '/refresh')
