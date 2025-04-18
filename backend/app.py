from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from pymongo import MongoClient
from dotenv import load_dotenv
import os
import bcrypt

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# JWT Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET', 'your_jwt_secret_key_here')
jwt = JWTManager(app)

# MongoDB Configuration
mongo_uri = os.getenv('MONGODB_URI', 'mongodb://mongodb:27017/shellydb')
client = MongoClient(mongo_uri)
db = client.shellydb

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing email or password'}), 400
    
    # Check if user already exists
    if db.users.find_one({'email': data['email']}):
        return jsonify({'error': 'User already exists'}), 409
    
    # Hash password
    hashed = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
    
    # Create user
    user = {
        'email': data['email'],
        'password': hashed,
        'name': data.get('name', ''),
        'role': 'user'
    }
    
    db.users.insert_one(user)
    
    return jsonify({'message': 'User created successfully'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing email or password'}), 400
    
    user = db.users.find_one({'email': data['email']})
    
    if not user or not bcrypt.checkpw(data['password'].encode('utf-8'), user['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Create access token
    access_token = create_access_token(identity=str(user['_id']))
    
    return jsonify({
        'access_token': access_token,
        'user': {
            'email': user['email'],
            'name': user.get('name', ''),
            'role': user.get('role', 'user')
        }
    })

@app.route('/api/user', methods=['GET'])
@jwt_required()
def get_user():
    current_user_id = get_jwt_identity()
    user = db.users.find_one({'_id': current_user_id})
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'email': user['email'],
        'name': user.get('name', ''),
        'role': user.get('role', 'user')
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000) 