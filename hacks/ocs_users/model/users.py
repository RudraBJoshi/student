import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = 'users'

    id         = db.Column(db.Integer, primary_key=True)
    username   = db.Column(db.String(80),  unique=True, nullable=False)
    email      = db.Column(db.String(120), unique=True, nullable=False)
    _password  = db.Column('password', db.String(256), nullable=False)
    role       = db.Column(db.String(20), default='user')   # 'user' | 'admin'
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    # ── password hashing ───────────────────────────────────────────────────
    @property
    def password(self):
        raise AttributeError('password is write-only')

    @password.setter
    def password(self, plaintext):
        self._password = generate_password_hash(plaintext)

    def check_password(self, plaintext):
        return check_password_hash(self._password, plaintext)

    # ── serialization ──────────────────────────────────────────────────────
    def to_dict(self):
        return {
            'id':         self.id,
            'username':   self.username,
            'email':      self.email,
            'role':       self.role,
            'created_at': self.created_at.isoformat() + 'Z',
        }

    def __repr__(self):
        return f'<User {self.username}>'


def init_db():
    """Create all tables if they don't exist."""
    db.create_all()
