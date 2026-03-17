from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from api.users_api import users_api
from api.proxy_api import proxy_api
from api.git_api import git_api
from model.users import db, init_db

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ocs_users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'ocs-dev-secret-change-in-prod'
app.config['JWT_TOKEN_LOCATION'] = ['headers', 'cookies']
app.config['JWT_COOKIE_SECURE'] = False  # set True in production (HTTPS)

CORS(app, supports_credentials=True, origins='*')
JWTManager(app)

db.init_app(app)
app.register_blueprint(users_api)
app.register_blueprint(proxy_api)
app.register_blueprint(git_api)

with app.app_context():
    init_db()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5050)
