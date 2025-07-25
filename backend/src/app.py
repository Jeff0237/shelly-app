# from gevent import monkey
# monkey.patch_all()

# Standard and third-party imports
from flask import Flask, request, jsonify, redirect, make_response
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, decode_token, get_jwt
from pymongo import MongoClient
from dotenv import load_dotenv
from flask_mail import Mail, Message
from flask_restx import Api, Resource, fields, Namespace
import os
import bcrypt
import random
import string
import requests
from datetime import datetime, timedelta
from bson import ObjectId
from flask_socketio import SocketIO, emit, join_room
import threading
import time
import json
import websocket
import base64

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# JWT Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET', 'jwt')
jwt = JWTManager(app)

# Initialize API with Swagger documentation
authorizations = {
    'Bearer Auth': {
        'type': 'apiKey',
        'in': 'header',
        'name': 'Authorization',
        'description': "Type in the *'Value'* input box below: **'Bearer &lt;JWT&gt;'**, where JWT is the token"
    }
}

api = Api(
    app,
    version='1.0',
    title='Shelly API',
    description='API for Shelly application',
    doc='/api/docs',
    authorizations=authorizations,
    security='Bearer Auth'
)


@app.before_request
def catch_root():
    # Only intercept the root path
    if request.path == '/':
        # If the request is for the API docs or static, let Flask-RESTX handle it
        if request.endpoint and (request.endpoint.startswith('static') or request.endpoint.startswith('doc') or request.endpoint.startswith('restx_doc')):
            return None
        # Otherwise, return the welcome page
        html = '''<h2>Welcome to the Shelly App Backend API!</h2><p>API is running. Visit <a href="/api/docs">/api/docs</a> for documentation.</p>'''
        return make_response(html, 200)

# Email Configuration
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True').lower() == 'true'
app.config['MAIL_USE_SSL'] = os.getenv('MAIL_USE_SSL', 'False').lower() == 'true'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
mail = Mail(app)

# MongoDB Configuration
mongo_uri = os.getenv('MONGODB_URI')
client = MongoClient(mongo_uri)
db = client.shellydb

# Initialize SocketIO
socketio = SocketIO(app, cors_allowed_origins="*")

# Local imports (must come after all above setup)
from src.models import create_models, Collections

# Now create namespaces and models
# Create namespaces
auth_ns = api.namespace('api/auth', description='Authentication operations')
webhook_ns = api.namespace('api/webhook', description='Webhook operations')
user_ns = api.namespace('api/user', description='User operations')
settings_ns = api.namespace('api/settings', description='User settings operations')
devices_ns = api.namespace('api/devices', description='Device operations')
shelly_ns = api.namespace('api/shelly', description='Shelly Cloud operations')

# Initialize models
models = create_models(api)

def generate_otp():
    return ''.join(random.choices(string.digits, k=6))

def serialize_datetime(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    if isinstance(obj, ObjectId):
        return str(obj)
    raise TypeError(f"Type {type(obj)} not serializable")

# Store user WebSocket threads
user_ws_threads = {}

def decode_jwt_payload(token):
    """Decode JWT payload without verification (for reading user_api_url)"""
    try:
        # Split the token and get the payload part
        parts = token.split('.')
        if len(parts) != 3:
            return None
        
        # Decode the payload (middle part)
        payload = parts[1]
        # Add padding if needed
        payload += '=' * (4 - len(payload) % 4)
        decoded = base64.b64decode(payload)
        return json.loads(decoded)
    except Exception as e:
        print(f"Failed to decode JWT payload: {e}")
        return None

def get_user_token(user_id):
    """Get user's Shelly API token from settings"""
    settings = db[Collections.SETTINGS].find_one({'user_id': user_id})
    if not settings or 'apiKey' not in settings:
        return None
    return settings['apiKey']

def get_shelly_jwt(user_api_url, api_key, user_id):
    """Get JWT token using OAuth flow as per Shelly documentation"""
    print(f"Attempting OAuth authentication with Shelly Cloud...")
    print(f"User API URL: {user_api_url}")
    print(f"API Key: {api_key[:10]}...")
    
    try:
        # Extract hostname from user_api_url
        from urllib.parse import urlparse
        parsed_url = urlparse(user_api_url)
        hostname = parsed_url.hostname
        print(f"Parsed hostname: {hostname}", flush=True)
        
        if not hostname:
            print(f"Invalid user_api_url format: {user_api_url}", flush=True)
            return None
        
        # # Try to decode the API key as a JWT to get user_api_url
        # jwt_payload = decode_jwt_payload(api_key)
        # print(f"Decoded JWT payload: {jwt_payload}")
        # if jwt_payload and 'user_api_url' in jwt_payload:
        #     # API key is already a JWT token
        #     print("API key is already a JWT token")
        #     return api_key
        
        # If not a JWT, try OAuth flow
        print("API key is not a JWT, trying OAuth flow...", flush=True)
        
        # Use the client_id 'shelly-diy' for DIY enthusiasts as per documentation
        oauth_url = f"https://{hostname}/oauth/auth"
        oauth_params = {
            'client_id': 'shelly-diy',  # Use DIY client ID as per documentation
            'grant_type': 'code',
            'code': api_key
        }
        print(f"OAuth URL: {oauth_url}", flush=True)
        print(f"OAuth params: {oauth_params}", flush=True)
        
        try:
            resp = requests.post(oauth_url, params=oauth_params, timeout=10)
            print(f"OAuth response status: {resp.status_code}", flush=True)
            print(f"OAuth response headers: {resp.headers}", flush=True)
            print(f"OAuth response text: {resp.text}", flush=True)
        except Exception as req_exc:
            print(f"Exception during OAuth request: {req_exc}", flush=True)
            return None
        
        if resp.status_code == 200:
            try:
                data = resp.json()
                print(f"OAuth response JSON: {data}")
            except Exception as json_exc:
                print(f"Failed to parse OAuth response as JSON: {json_exc}")
                return None
            access_token = data.get('access_token')
            if access_token:
                print(f"OAuth access_token obtained: {access_token[:20]}...")
                # Save the JWT token
                db[Collections.SETTINGS].update_one(
                    {"user_id": str(user_id)},
                    {"$set": {"jwt": access_token, "updated_at": datetime.utcnow()}},
                    upsert=True
                )
                return access_token
            else:
                print(f"No access_token in OAuth response: {data}")
        else:
            print(f"OAuth failed with status {resp.status_code}: {resp.text}")
            if resp.status_code == 400:
                print("400 Bad Request: This usually means the code is invalid, expired, or already used.")
            if resp.status_code == 401:
                print("401 Unauthorized: The API key is invalid or expired. Please refresh your Shelly Cloud API key.")
                print("Go to https://my.shelly.cloud and generate a new API key, then update your settings.")
            if resp.status_code == 404:
                print("404 Not Found: The OAuth endpoint may be wrong or the server is incorrect.")
            if resp.status_code >= 500:
                print("5xx Server Error: Shelly Cloud server may be down or having issues.")
    except Exception as e:
        print(f"OAuth flow failed: {e}")
    
    print("All authentication methods failed")
    return None

def shelly_ws_listener(token, sid):
    """Connect to Shelly Cloud WebSocket for real-time device updates"""
    print(f"Connecting to Shelly Cloud WebSocket for session {sid}")
    
    try:
        # Get user ID from session
        session_data = user_ws_threads.get(sid)
        if not session_data or not isinstance(session_data, dict):
            print(f"No valid session data found for sid {sid}")
            socketio.emit("shelly_error", {"error": "No valid session found. Please reconnect."}, room=sid)
            return
            
        user_id = session_data.get('user_id')
        if not user_id:
            print(f"No user_id found in session data for sid {sid}")
            socketio.emit("shelly_error", {"error": "User not authenticated. Please log in again."}, room=sid)
            return
        
        print(f"Session data: {session_data}")
        print(f"User ID: {user_id}, Type: {type(user_id)}")
        
        # Convert user_id to ObjectId if it's a string
        try:
            if isinstance(user_id, str):
                user_id = ObjectId(user_id)
        except Exception as e:
            print(f"Failed to convert user_id to ObjectId: {e}")
            socketio.emit("shelly_error", {"error": "Invalid user ID format"}, room=sid)
            return
        
        # Get user's Shelly settings
        print(f"Looking for settings for user_id: {user_id} (type: {type(user_id)})")
        
        # Try both ObjectId and string versions
        settings = db[Collections.SETTINGS].find_one({'user_id': user_id})
        if not settings:
            # Try with string version
            settings = db[Collections.SETTINGS].find_one({'user_id': str(user_id)})
            print(f"Tried string version, settings found: {settings}")
        
        print(f"Settings found: {settings}")
        
        if not settings:
            print(f"No settings found for user {user_id}")
            socketio.emit("shelly_error", {"error": "Please configure your Shelly Cloud settings first. Go to Settings and add your API Key and User Link."}, room=sid)
            return
        
        print(f"Settings keys: {list(settings.keys()) if settings else 'None'}")
        
        if 'jwt' not in settings or 'userLink' not in settings:
            print(f"Missing Shelly Oauth key for user {user_id}")
            print(f"Available keys: {list(settings.keys())}")
            socketio.emit("shelly_error", {"error": "Please configure your Shelly Cloud settings. You need Shelly oauth key."}, room=sid)
            return
        
        apiKey = settings['apiKey']
        user_api_url = settings['userLink']
        
        # Extract hostname from userLink (e.g., "https://shelly-176-eu.shelly.cloud" -> "shelly-176-eu.shelly.cloud")
        from urllib.parse import urlparse
        parsed_url = urlparse(user_api_url)
        hostname = parsed_url.hostname
        
        if not hostname:
            print(f"Invalid userLink format: {user_api_url}")
            socketio.emit("shelly_error", {"error": "Invalid userLink format. Please check your User Link in Settings."}, room=sid)
            return
        
        # Check if user has any devices configured
        user_devices = db[Collections.DEVICES].find({'user_id': user_id})
        device_count = user_devices.count()
        
        if device_count == 0:
            # Try with string version
            user_devices = db[Collections.DEVICES].find({'user_id': str(user_id)})
            device_count = user_devices.count()
            print(f"Tried string version, device count: {device_count}", flush=True)
        
        if device_count == 0:
            print(f"No devices found for user {user_id}")
            socketio.emit("shelly_error", {"error": "No devices found. Please sync your devices first by visiting the Devices page."}, room=sid)
            return
        
        print(f"Found {device_count} devices for user {user_id}", flush=True)
        
        # Get JWT from settings or fetch a new one if missing/expired
        jwt_token = settings.get('jwt')
        print(f"JWT from settings: {'Present' if jwt_token else 'Missing'}", flush=True)
        
        # Force refresh JWT if it's the same as API key (which means it's not a real JWT)
        if jwt_token and jwt_token == apiKey:
            print("Cached JWT is same as API key, forcing refresh...", flush=True)
            jwt_token = None
        
        # Check if JWT token is expired
        if jwt_token:
            try:
                jwt_payload = decode_jwt_payload(jwt_token)
                if jwt_payload:
                    # Check if token has expired (iat + exp)
                    iat = jwt_payload.get('iat', 0)
                    exp = jwt_payload.get('exp', 0)
                    current_time = int(time.time())
                    
                    if exp and current_time > exp:
                        print(f"JWT token expired. Exp: {exp}, Current: {current_time}", flush=True)
                        jwt_token = None
                    elif iat and (current_time - iat) > 3600:  # Refresh if older than 1 hour
                        print(f"JWT token is old. Iat: {iat}, Current: {current_time}", flush=True)
                        jwt_token = None
                    else:
                        print(f"JWT token is valid. Exp: {exp}, Current: {current_time}", flush=True)
                else:
                    print("Failed to decode JWT payload, forcing refresh", flush=True)
                    jwt_token = None
            except Exception as e:
                print(f"Error checking JWT validity: {e}", flush=True)
                jwt_token = None
        
        if not jwt_token:
            print("No valid JWT found in settings, fetching new JWT...", flush=True)
            jwt_token = get_shelly_jwt(user_api_url, apiKey, user_id)
            if not jwt_token:
                print("Failed to obtain JWT, emitting error")
                socketio.emit("shelly_error", {"error": "Failed to obtain JWT from Shelly Cloud. Your API key may be expired or invalid. Please refresh your Shelly Cloud API key at https://my.shelly.cloud and update your settings."}, room=sid)
                return
        else:
            print("Using cached JWT from settings.", flush=True)
        
        print(f"Connecting to Shelly Cloud WebSocket at {hostname}", flush=True)
        print(f"Using JWT: {jwt_token[:20]}...", flush=True)
        socketio.emit("shelly_connected", {"message": f"Connecting to Shelly Cloud WebSocket"}, room=sid)
        
        # Use the correct WebSocket URL format from documentation
        # wss://<shelly_cloud_server>:6113/shelly/wss/hk_sock?t=<ACCESS_TOKEN>
        ws_url = f"wss://{hostname}:6113/shelly/wss/hk_sock?t={jwt_token}"
        
        def on_message(ws, message):
            try:
                data = json.loads(message)
                print(f"Received Shelly WebSocket message: {data}", flush=True)
                
                # Handle different event types as per documentation
                event_type = data.get('event')
                
                if event_type == 'Shelly:StatusOnChange':
                    # Status change event
                    device_info = data.get('device', {})
                    status_data = data.get('status', {})
                    
                    device_id = device_info.get('id')
                    device_code = device_info.get('code')
                    device_gen = device_info.get('gen')
                    
                    print(f"Status change for device {device_id} ({device_code}, {device_gen})", flush=True)
                    
                    # Create update message
                    update_message = {
                        "event": "Shelly:StatusOnChange",
                        "device_id": hex(int(device_id))[2:],
                        "device_id_key": device_id,
                        "device_code": device_code,
                        "device_gen": device_gen,
                        "status": status_data,
                        "timestamp": datetime.utcnow().isoformat()
                    }

                    print(f"Hello, {update_message}", flush=True);                    
                    socketio.emit("device_update", update_message, room=sid)
                    
                elif event_type == 'Shelly:Online':
                    # Online/offline event
                    device_info = data.get('device', {})
                    is_online = data.get('online', 0) == 1
                    
                    device_id = device_info.get('id')
                    device_code = device_info.get('code')
                    device_gen = device_info.get('gen')
                    
                    print(f"Device {device_id} ({device_code}, {device_gen}) online status: {is_online}")
                    
                    update_message = {
                        "event": "Shelly:Online",
                        "device_id": hex(int(device_id))[2:],
                        "device_id_key": device_id,
                        "device_code": device_code,
                        "device_gen": device_gen,
                        "online": is_online,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                    
                    socketio.emit("device_update", update_message, room=sid)
                    
                elif event_type == 'Shelly:CommandResponse':
                    # Command response event
                    device_id = data.get('deviceId')
                    trid = data.get('trid')
                    response_data = data.get('data')
                    
                    print(f"Command response for device {device_id}, transaction {trid}")
                    
                    update_message = {
                        "event": "Shelly:CommandResponse",
                        "device_id": hex(int(device_id))[2:],
                        "device_id_key": device_id,
                        "trid": trid,
                        "data": response_data,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                    
                    socketio.emit("device_update", update_message, room=sid)
                    
                else:
                    # Forward unknown events as-is
                    print(f"Unknown event type: {event_type}")
                    socketio.emit("device_update", data, room=sid)
                
            except json.JSONDecodeError as e:
                print(f"Failed to parse Shelly WebSocket message: {e}")
            except Exception as e:
                print(f"Error processing Shelly WebSocket message: {e}")
        
        def on_error(ws, error):
            print(f"Shelly WebSocket error: {error}", flush=True)
            print(f"Error type: {type(error)}", flush=True)
            socketio.emit("shelly_error", {"error": str(error)}, room=sid)
        
        def on_close(ws, close_status_code, close_msg):
            print(f"Shelly WebSocket closed: {close_status_code} - {close_msg}", flush=True)
            print(f"Close status code: {close_status_code}", flush=True)
            print(f"Close message: {close_msg}", flush=True)
            
            # If token is broken, try to refresh it
            if close_status_code == 4401:  # Token-Broken
                print("Token-Broken error detected, attempting to refresh JWT...", flush=True)
                # Clear the old JWT token
                # db[Collections.SETTINGS].update_one(
                #     {"user_id": str(user_id)},
                #     {"$unset": {"jwt": 1}, "$set": {"updated_at": datetime.utcnow()}}
                # )
                # Try to get a new JWT
                new_jwt = get_shelly_jwt(user_api_url, jwt_token, user_id)
                if new_jwt:
                    print(f"Successfully refreshed JWT, attempting to reconnect... {new_jwt}", flush=True)
                    # Reconnect with new token
                    time.sleep(2)  # Wait a bit before reconnecting
                    start_shelly_listener(new_jwt, sid)
                    return
            
            socketio.emit("shelly_disconnected", {"message": "Disconnected from Shelly Cloud"}, room=sid)

            # Reconnect after 5-10 seconds
            if sid in user_ws_threads:
                time.sleep(5 + random.random() * 5)
                print(f"Attempting to reconnect to Shelly Cloud WebSocket...")
                start_shelly_listener("dummy_token", sid)
        
        def on_open(ws):
            print(f"Connected to Shelly Cloud WebSocket!")
            socketio.emit("shelly_connected", {"message": "Connected to Shelly Cloud WebSocket"}, room=sid)
        
        # Create WebSocket connection
        ws = websocket.WebSocketApp(
            ws_url,
            on_open=on_open,
            on_message=on_message,
            on_error=on_error,
            on_close=on_close
        )
        
        # Store the WebSocket connection
        user_ws_threads[sid] = {
            'user_id': user_id,
            'ws': ws
        }
        
        # Start WebSocket connection in a separate thread
        ws.run_forever()
        
    except Exception as e:
        print(f"Failed to connect to Shelly Cloud WebSocket: {e}")
        socketio.emit("shelly_error", {"error": f"Connection failed: {str(e)}"}, room=sid)

def start_shelly_listener(token, sid):
    """Start Shelly Cloud polling for a specific user session"""
    print(f"Starting Shelly listener for session {sid}")
    print(f"Current sessions: {list(user_ws_threads.keys())}")
    print(f"Session data for {sid}: {user_ws_threads.get(sid)}")
    
    # Don't clear the session data, just start the listener
    # The session data contains the user_id which we need
    
    # Start polling in a separate thread
    t = threading.Thread(target=shelly_ws_listener, args=(token, sid))
    t.daemon = True
    t.start()

# WebSocket event for client connection
@socketio.on('connect')
def handle_connect():
    print(f'Client connected with SID: {request.sid}')
    emit('connected', {'message': 'Connected to Shelly WebSocket'})
    
    # Don't start Shelly listener until user authenticates
    # The listener will be started in the authenticate event

# WebSocket event for authentication
@socketio.on('authenticate')
def handle_authenticate(data):
    """Handle WebSocket authentication with JWT token"""
    try:
        token = data.get('token')
        if not token:
            emit('error', {'error': 'No token provided'})
            return
        
        # Decode JWT token to get user ID
        decoded = decode_token(token)
        user_id = decoded['sub']
        
        sid = request.sid
        print(f"Authenticating user {user_id} for session {sid}")
        
        # Store user_id in session for later use
        user_ws_threads[sid] = {'user_id': user_id, 'thread': None}
        print(f"Stored session data: {user_ws_threads[sid]}")
        print(f"All sessions: {list(user_ws_threads.keys())}")
        
        # Join user to their room
        join_room(user_id)
        emit('authenticated', {'message': 'Successfully authenticated'})
        
        # Start device status polling for this user
        start_shelly_listener("dummy_token", sid)
        
    except Exception as e:
        print(f"Authentication error: {e}")
        emit('error', {'error': f'Authentication failed: {str(e)}'})

# WebSocket event for client disconnection
@socketio.on('disconnect')
def handle_disconnect():
    sid = request.sid
    print(f'Client disconnected: {sid}')
    # Clean up the Shelly WebSocket connection
    if sid in user_ws_threads:
        session_data = user_ws_threads[sid]
        if isinstance(session_data, dict) and 'ws' in session_data:
            # Close the WebSocket connection
            ws = session_data['ws']
            if hasattr(ws, 'close'):
                ws.close()
        user_ws_threads.pop(sid, None)


@webhook_ns.route('/oauth')
class ShellyOAuthWebhook(Resource):
    def get(self):
        code = request.args.get('code') or request.form.get('code')
        state = request.args.get('state') or request.form.get('state')
        url = request.args.get('url') or request.form.get('url')
        if not code or not state:
            return jsonify({'success': False, 'error': 'Missing code or state in callback.'}), 400

        user_settings = db[Collections.SETTINGS].find_one({'oauth_state': state})

        if not user_settings:
            return jsonify({'success': False, 'error': 'Invalid state or user_id. No matching user found.'}), 400

        db[Collections.SETTINGS].update_one(
            # {'user_id': user_id},
            {'oauth_state': state},
            {'$set': {'jwt': code, 'updated_at': datetime.utcnow()}},
            upsert=True
        )

        if not url:
            return jsonify({'success': True, 'message': 'Authorization code received and saved!'})

        return redirect(url)


# API Routes
@auth_ns.route('/register')
class Register(Resource):
    @auth_ns.expect(models['register'])
    @auth_ns.response(201, 'User created successfully')
    @auth_ns.response(400, 'Missing email or password')
    @auth_ns.response(409, 'User already exists')
    def post(self):
        data = request.get_json()
        import re
        if not data or not data.get('email') or not data.get('password'):
            api.abort(400, 'Missing email or password')
        # Email format validation (simple regex)
        email_regex = r'^[\w\.-]+@[\w\.-]+\.\w+$'
        if not re.match(email_regex, data['email']):
            api.abort(400, 'Invalid email format')
        # Password length validation
        if len(data['password']) < 5:
            api.abort(400, 'Password must be at least 5 characters long')
        if db[Collections.USERS].find_one({'email': data['email']}):
            api.abort(409, 'User already exists')
        hashed = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
        user = {
            'email': data['email'],
            'password': hashed,
            'name': data.get('name', ''),
            'role': 'user',
            'is_active': True,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        db[Collections.USERS].insert_one(user)
        # Send welcome email if possible
        try:
            msg = Message(
                'Welcome to Shelly App! 🏠',
                sender=app.config['MAIL_USERNAME'] or 'noreply@shelly-app.com',
                recipients=[data['email']]
            )
            msg.body = f"""
Welcome to Shelly App!

Hi {data.get('name', 'there')},

Thank you for registering with Shelly App! Your account has been created successfully.

You can now:
- Log in to your dashboard
- Connect your Shelly devices
- Monitor your home automation in real-time

If you have any questions, please don't hesitate to contact our support team.

Best regards,
The Shelly App Team
            """
            mail.send(msg)
            print(f'Welcome email sent successfully to {data["email"]}')
        except Exception as e:
            print(f'Failed to send welcome email to {data["email"]}: {e}')
            # Don't fail the registration if email fails
        return {'message': 'User created successfully'}, 201

@auth_ns.route('/login')
class Login(Resource):
    @auth_ns.expect(models['login'])
    @auth_ns.response(200, 'Login successful', models['login_response'])
    @auth_ns.response(400, 'Missing email or password')
    @auth_ns.response(400, 'Invalid email or password')
    def post(self):
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            api.abort(400, 'Missing email or password')
        
        user = db[Collections.USERS].find_one({'email': data['email']})
        
        if not user or not bcrypt.checkpw(data['password'].encode('utf-8'), user['password']):
            api.abort(400, 'Invalid email or password')
        
        # Update last login
        db[Collections.USERS].update_one(
            {'_id': user['_id']},
            {
                '$set': {
                    'last_login': datetime.utcnow(),
                    'updated_at': datetime.utcnow()
                }
            }
        )
        # Set access token to 10 years
        access_token = create_access_token(identity=str(user['_id']), expires_delta=timedelta(days=365*10))
        return {
            'access_token': access_token, # 10 year expiration
            'user': {
                'email': user['email'],
                'name': user.get('name', ''),
                'role': user.get('role', 'user'),
                'created_at': user.get('created_at').isoformat() if user.get('created_at') else None
            }
        }

@auth_ns.route('/forgot-password')
class ForgotPassword(Resource):
    @auth_ns.expect(models['forgot_password'])
    @auth_ns.response(200, 'OTP sent successfully')
    @auth_ns.response(400, 'Email is required')
    @auth_ns.response(400, 'User not found')
    @auth_ns.response(500, 'Failed to send OTP email')
    def post(self):
        data = request.get_json()
        
        if not data or not data.get('email'):
            api.abort(400, 'Email is required')
        
        user = db[Collections.USERS].find_one({'email': data['email']})
        if not user:
            api.abort(400, 'User not found')
        
        otp = generate_otp()
        otp_expiry = datetime.utcnow() + timedelta(minutes=15)
        
        reset_request = {
            'email': data['email'],
            'otp': otp,
            'expiry': otp_expiry,
            'used': False,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        db[Collections.PASSWORD_RESETS].update_one(
            {'email': data['email']},
            {'$set': reset_request},
            upsert=True
        )
        
        try:
            msg = Message(
                'Password Reset Request - Shelly App 🔐',
                sender=app.config['MAIL_USERNAME'] or 'noreply@shelly-app.com',
                recipients=[data['email']]
            )
            msg.body = f"""
Password Reset Request

Hi {user.get('name', 'there')},

You requested a password reset for your Shelly App account.

Your OTP (One-Time Password) is: {otp}

This OTP will expire in 15 minutes for security reasons.

If you didn't request this password reset, please ignore this email.

Best regards,
The Shelly App Team
            """
            mail.send(msg)
            print(f'Password reset OTP sent successfully to {data["email"]}')
            return {'message': 'OTP sent successfully'}, 200
        except Exception as e:
            print(f'Failed to send OTP email to {data["email"]}: {e}')
            api.abort(500, 'Failed to send OTP email')

@auth_ns.route('/verify-otp')
class VerifyOTP(Resource):
    @auth_ns.expect(models['verify_otp'])
    @auth_ns.response(200, 'OTP verified successfully')
    @auth_ns.response(400, 'Invalid or expired OTP')
    def post(self):
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('otp'):
            api.abort(400, 'Email and OTP are required')
        
        reset_request = db[Collections.PASSWORD_RESETS].find_one({
            'email': data['email'],
            'otp': data['otp'],
            'used': False,
            'expiry': {'$gt': datetime.utcnow()}
        })
        
        if not reset_request:
            api.abort(400, 'Invalid or expired OTP')
        
        db[Collections.PASSWORD_RESETS].update_one(
            {'_id': reset_request['_id']},
            {
                '$set': {
                    'used': True,
                    'updated_at': datetime.utcnow()
                }
            }
        )
        
        reset_token = create_access_token(
            identity=str(reset_request['_id']),
            expires_delta=timedelta(minutes=15)
        )
        
        return {
            'message': 'OTP verified successfully',
            'reset_token': reset_token
        }

@auth_ns.route('/reset-password')
class ResetPassword(Resource):
    @auth_ns.expect(models['reset_password'])
    @auth_ns.response(200, 'Password reset successfully')
    @auth_ns.response(400, 'New password is required')
    @auth_ns.response(400, 'Invalid reset request')
    @jwt_required()
    def post(self):
        data = request.get_json()
        
        if not data or not data.get('password'):
            api.abort(400, 'New password is required')
        
        reset_request_id = ObjectId(get_jwt_identity())
        reset_request = db[Collections.PASSWORD_RESETS].find_one({
            '_id': reset_request_id,
            'used': True
        })

        if not reset_request:
            api.abort(400, 'Invalid reset request')
        
        hashed = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
        db[Collections.USERS].update_one(
            {'email': reset_request['email']},
            {
                '$set': {
                    'password': hashed,
                    'updated_at': datetime.utcnow()
                }
            }
        )
        
        db[Collections.PASSWORD_RESETS].delete_one({'_id': reset_request_id})
        
        return {'message': 'Password reset successfully'}

@user_ns.route('')
class User(Resource):
    @user_ns.doc(security='Bearer Auth')
    @user_ns.response(200, 'User retrieved successfully', models['user_response'])
    @user_ns.response(404, 'User not found')
    @jwt_required()
    def get(self):
        current_user_id = get_jwt_identity()
        try:
            user = db[Collections.USERS].find_one({'_id': ObjectId(current_user_id)})
            if not user:
                api.abort(404, 'User not found')
            
            return {
                'email': user['email'],
                'name': user.get('name', ''),
                'role': user.get('role', 'user'),
                'created_at': user.get('created_at').isoformat() if user.get('created_at') else None
            }
        except Exception as e:
            api.abort(400, f'Invalid user ID format: {str(e)}')

@settings_ns.route('')
class Settings(Resource):
    @settings_ns.doc(security='Bearer Auth')
    @settings_ns.response(200, 'Settings retrieved successfully', models['settings'])
    @settings_ns.response(404, 'Settings not found')
    @jwt_required()
    def get(self):
        """Get user settings"""
        user_id = get_jwt_identity()
        settings = db[Collections.SETTINGS].find_one({'user_id': user_id})
        
        if not settings:
            return {'userLink': '', 'apiKey': ''}
        
        return {
            'jwt': settings.get('jwt', ''),
            'userLink': settings.get('userLink', ''),
            'apiKey': settings.get('apiKey', '')
        }

    @settings_ns.doc(security='Bearer Auth')
    @settings_ns.expect(models['settings'])
    @settings_ns.response(200, 'Settings updated successfully')
    @jwt_required()
    def post(self):
        """Update user settings"""
        user_id = get_jwt_identity()
        data = request.get_json()
        
        print(f"Saving settings for user_id: {user_id} (type: {type(user_id)})")
        
        settings = {
            'user_id': user_id,
            'userLink': data.get('userLink', ''),
            'apiKey': data.get('apiKey', ''),
            'updated_at': datetime.utcnow()
        }
        
        db[Collections.SETTINGS].update_one(
            {'user_id': user_id},
            {'$set': settings},
            upsert=True
        )
        
        print(f"Settings saved successfully for user_id: {user_id}")
        return {'message': 'Settings updated successfully'}

@devices_ns.route('')
class Devices(Resource):
    @devices_ns.doc(security='Bearer Auth')
    @devices_ns.response(200, 'Devices retrieved and synchronized successfully', [models['device']])
    @devices_ns.response(404, 'Settings not found for user')
    @devices_ns.response(500, 'Failed to fetch devices from Shelly Cloud')
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        print(f"Devices endpoint - user_id: {user_id} (type: {type(user_id)})")
        
        settings = db[Collections.SETTINGS].find_one({'user_id': user_id})
        
        if not settings or 'userLink' not in settings or 'apiKey' not in settings:
            api.abort(404, 'Settings not found for user. Please configure your Shelly Cloud API URL and key.')
        
        # First request: Get list of devices
        shelly_url = f"{settings['userLink'].strip('/')}/interface/device/list?auth_key={settings['apiKey']}"
        
        try:
            response = requests.get(shelly_url)
            response.raise_for_status()
            data = response.json()
        except requests.exceptions.RequestException as e:
            api.abort(500, f'Failed to fetch devices from Shelly Cloud: {e}')
        except ValueError:
            api.abort(500, f"Could not decode JSON response from Shelly. Response text: {response.text}")
            
        if not data.get('isok'):
            error_message = data.get('error', 'The Shelly Cloud API returned an unsuccessful response.')
            api.abort(500, f"Shelly Cloud API Error: {error_message}")
            
        if 'data' not in data or 'devices' not in data['data']:
            api.abort(500, 'Invalid response data structure from Shelly Cloud API. The "data" or "devices" key is missing.')
            
        devices_from_api = data['data']['devices']
        api_device_ids = list(devices_from_api.keys())
        
        # Second request: Get real-time status for all devices
        status_data = {}
        if api_device_ids:
            try:
                shelly_status_url = f"https://shelly-176-eu.shelly.cloud/v2/devices/api/get?auth_key={settings['apiKey']}"
                status_body = {
                    "ids": api_device_ids,
                    "select": ["status"]
                }
                status_response = requests.post(shelly_status_url, json=status_body)
                status_response.raise_for_status()
                status_list = status_response.json()
                
                # Create a map of device_id to status
                for device_status in status_list:
                    if isinstance(device_status, dict) and 'id' in device_status:
                        status_data[device_status['id']] = device_status.get('status', {})
                        
            except Exception as e:
                print(f"Warning: Failed to fetch device status: {e}")
                # Continue without status data if it fails
        
        # Merge device data with status data
        merged_devices = []
        for device_id, device_data in devices_from_api.items():
            # Get status for this device
            device_status = status_data.get(device_id, {})
            
            # Extract state and connection status from the status data
            sensor_state = device_status.get("sensor", {}).get("state")
            wifi_connected = device_status.get("wifi_sta", {}).get("connected", False)
            
            # Create merged device object - preserve original structure exactly
            merged_device = device_data.copy()  # Keep all original fields
            
            # Add our new fields
            merged_device['state'] = sensor_state  # open/closed
            merged_device['status'] = "connected" if wifi_connected else "disconnected"
            merged_device['user_id'] = user_id
            merged_device['last_sync'] = datetime.utcnow()
            
            # Store in database
            db[Collections.DEVICES].update_one(
                {'id': device_id, 'user_id': user_id},
                {'$set': merged_device},
                upsert=True
            )
            
            # Prepare for response (keep original structure + new fields)
            response_device = merged_device.copy()
            response_device['last_sync'] = response_device['last_sync'].isoformat()
            merged_devices.append(response_device)

        # Remove devices that are no longer in the API response
        db[Collections.DEVICES].delete_many({
            'user_id': user_id,
            'id': {'$nin': api_device_ids}
        })
        
        # Return in original format: { "isok": true, "data": { "devices": {...} } }
        devices_dict = {}
        for device in merged_devices:
            devices_dict[device['id']] = device
            
        return {
            "isok": True,
            "data": {
                "devices": devices_dict
            }
        }

@devices_ns.route('/<device_id>')
class DeviceStatus(Resource):
    @devices_ns.doc(security='Bearer Auth')
    @devices_ns.response(200, 'Device status retrieved successfully')
    @devices_ns.response(401, 'Shelly API token not set in user settings')
    @devices_ns.response(404, 'Device not found')
    @devices_ns.response(500, 'Failed to fetch device status from Shelly Cloud')
    @jwt_required()
    def get(self, device_id):
        """Get specific device status from Shelly Cloud"""
        user_id = get_jwt_identity()
        
        # Get user's Shelly API token
        token = get_user_token(user_id)
        if not token:
            api.abort(401, 'Shelly API token not set in user settings')
        
        # Get device info from our database
        device = db[Collections.DEVICES].find_one({
            'id': device_id,
            'user_id': user_id
        })
        
        if not device:
            api.abort(404, 'Device not found')
        
        # Fetch status from Shelly Cloud API
        shelly_status_url = f"https://shelly-176-eu.shelly.cloud/v2/devices/api/get?auth_key={token}"
        status_body = {
            "ids": [device_id],
            "select": ["status"]
        }
        
        try:
            response = requests.post(shelly_status_url, json=status_body)
            response.raise_for_status()
            status_data = response.json()
            
            if not status_data or not isinstance(status_data, list) or len(status_data) == 0:
                api.abort(404, 'No status found for device')
            
            status_info = status_data[0].get("status", {})
            
            # Extract state and connection status
            sensor_state = status_info.get("sensor", {}).get("state")
            wifi_connected = status_info.get("wifi_sta", {}).get("connected", False)
            
            # Compose result
            result = {
                "id": device.get("id"),
                "name": device.get("name"),
                "type": device.get("type"),
                "category": device.get("category"),
                "room_id": device.get("room_id"),
                "state": sensor_state,  # open/close
                "status": "connected" if wifi_connected else "disconnected",
                "last_sync": device.get("last_sync"),
                "full_status": status_info  # Include full status for debugging
            }
            # Fix: Convert last_sync to ISO string if it's a datetime
            if isinstance(result.get("last_sync"), datetime):
                result["last_sync"] = result["last_sync"].isoformat()
            return result
            
        except requests.exceptions.RequestException as e:
            api.abort(500, f'Failed to fetch device status from Shelly Cloud: {e}')
        except ValueError as e:
            api.abort(500, f'Invalid response from Shelly Cloud API: {e}')

@shelly_ns.route('/oauth-url')
class ShellyOAuthURL(Resource):
    """Get OAuth URL for Shelly Cloud authentication, with JWT in redirect_uri"""
    @shelly_ns.doc(security='Bearer Auth')
    @shelly_ns.response(200, 'OAuth URL generated successfully')
    @jwt_required()
    def get(self):
        try:
            # Generate a random state parameter for security
            state = ''.join(random.choices(string.ascii_letters + string.digits, k=32))
            user_jwt = get_jwt()
            user_id = get_jwt_identity()
            # Use the current user's JWT as the identifier in the callback URL
            access_token = request.headers.get('Authorization', '').replace('Bearer ', '')
            # Build the redirect_uri with the JWT
            # redirect_uri = f"http://localhost:9000/api/webhook/oauth"
            redirect_uri = f"https://api.shellydashboard.com/api/webhook/oauth"
            oauth_url = f"https://my.shelly.cloud/oauth_login.html?client_id=shelly-diy&redirect_uri={redirect_uri}&state={state}"
            # Store state in settings for later verification
            db[Collections.SETTINGS].update_one(
                {"user_id": str(user_id)},
                {"$set": {"oauth_state": state, "updated_at": datetime.utcnow()}},
                upsert=True
            )
            return {
                "oauth_url": oauth_url,
                "state": state,
                "redirect_uri": redirect_uri,
                "instructions": [
                    "1. Click the OAuth URL to go to Shelly Cloud.",
                    "2. Log in and approve access.",
                    "3. You will be redirected to the backend callback, and your code will be saved automatically."
                ]
            }
        except Exception as e:
            print(f"Error generating OAuth URL: {e}")
            return {"error": "Failed to generate OAuth URL"}, 500

@shelly_ns.route('/disconnect')
class ShellyDisconnect(Resource):
    """Disconnect from Shelly Cloud by removing JWT token"""
    
    @shelly_ns.doc(security='Bearer Auth')
    @shelly_ns.response(200, 'Disconnected successfully')
    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        print(f"Disconnecting user: {user_id}")
        
        try:
            # Remove JWT token from settings
            result = db[Collections.SETTINGS].update_one(
                {'user_id': str(user_id)},
                {'$unset': {'jwt': 1}, '$set': {'updated_at': datetime.utcnow()}}
            )
            
            if result.modified_count > 0:
                print(f"Successfully disconnected user {user_id}")
                return {
                    'success': True,
                    'message': 'Successfully disconnected from Shelly Cloud'
                }
            else:
                print(f"No settings found for user {user_id}")
                return {
                    'success': False,
                    'message': 'No connection found to disconnect'
                }
        except Exception as e:
            print(f"Error disconnecting user {user_id}: {e}")
            return {
                'success': False,
                'message': 'Failed to disconnect from Shelly Cloud'
            }, 500

@shelly_ns.route('/reset')
class ShellyReset(Resource):
    """Reset Shelly Cloud connection by removing all Shelly-related settings"""
    
    @shelly_ns.doc(security='Bearer Auth')
    @shelly_ns.response(200, 'Reset successfully')
    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        print(f"Resetting Shelly connection for user: {user_id}")
        
        try:
            # Remove all Shelly-related fields from settings
            result = db[Collections.SETTINGS].update_one(
                {'user_id': str(user_id)},
                {
                    '$unset': {
                        'jwt': 1,
                        # 'oauth_state': 1
                    },
                    '$set': {'updated_at': datetime.utcnow()}
                }
            )
            
            if result.modified_count > 0:
                print(f"Successfully reset Shelly connection for user {user_id}")
                return {
                    'success': True,
                    'message': 'Successfully reset Shelly Cloud connection'
                }
            else:
                print(f"No settings found for user {user_id}")
                return {
                    'success': False,
                    'message': 'No connection found to reset'
                }
        except Exception as e:
            print(f"Error resetting Shelly connection for user {user_id}: {e}")
            return {
                'success': False,
                'message': 'Failed to reset Shelly Cloud connection'
            }, 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 9000))
    socketio.run(app, host="0.0.0.0", port=port, debug=True) 
