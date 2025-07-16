from flask_restx import fields
from datetime import datetime

# Base Models
class BaseModel:
    created_at = fields.DateTime(description='Creation timestamp', default=datetime.utcnow)
    updated_at = fields.DateTime(description='Last update timestamp', default=datetime.utcnow)

# API Models
def create_models(api):
    # User Models
    user_model = api.model('User', {
        'email': fields.String(required=True, description='User email', example='user@example.com'),
        'password': fields.String(required=True, description='Hashed password'),
        'name': fields.String(description='User name', example='John Doe'),
        'role': fields.String(description='User role', default='user', enum=['user', 'admin']),
        'is_active': fields.Boolean(description='User active status', default=True),
        'last_login': fields.DateTime(description='Last login timestamp'),
        'created_at': fields.DateTime(description='Creation timestamp'),
        'updated_at': fields.DateTime(description='Last update timestamp')
    })

    # Component Model
    component_model = api.model('Component', {
        'id': fields.String(required=True, description='Component ID'),
        'name': fields.String(required=True, description='Component name'),
        'type': fields.String(required=True, description='Component type'),
        'status': fields.String(description='Component status'),
        'location': fields.String(description='Component location'),
        'last_seen': fields.DateTime(description='Last seen timestamp'),
        'created_at': fields.DateTime(description='Creation timestamp'),
        'updated_at': fields.DateTime(description='Last update timestamp')
    })

    device_model = api.model('Device', {
        '_id': fields.String(readonly=True, description='The unique identifier of a device'),
        'id': fields.String(required=True, description='Device ID from Shelly Cloud'),
        'type': fields.String(required=True, description='Device type'),
        'name': fields.String(required=True, description='Device name'),
        'category': fields.String(description='Device category'),
        'room_id': fields.Integer(description='Room ID'),
        'user_id': fields.String(required=True, description='The user this device belongs to'),
        'last_sync': fields.DateTime(description='Last synchronization timestamp'),
    })

    # Settings Model
    settings_model = api.model('Settings', {
        'userLink': fields.String(required=True, description='User link for Shelly Cloud API', example='https://shelly-176-eu.shelly.cloud/interface/device/list'),
        'apiKey': fields.String(required=True, description='API key for Shelly Cloud API', example='MzA4...'),
        'jwt': fields.String(description='JWT token for Shelly Cloud WebSocket'),
        'created_at': fields.DateTime(description='Creation timestamp'),
        'updated_at': fields.DateTime(description='Last update timestamp'),
    })

    # Password Reset Models
    password_reset_model = api.model('PasswordReset', {
        'email': fields.String(required=True, description='User email', example='user@example.com'),
        'otp': fields.String(required=True, description='One-time password'),
        'expiry': fields.DateTime(required=True, description='OTP expiry timestamp'),
        'used': fields.Boolean(description='Whether OTP has been used', default=False),
        'created_at': fields.DateTime(description='Creation timestamp'),
        'updated_at': fields.DateTime(description='Last update timestamp'),
    })

    # API Response Models
    user_response_model = api.model('UserResponse', {
        'email': fields.String(description='User email', example='user@example.com'),
        'name': fields.String(description='User name', example='John Doe'),
        'role': fields.String(description='User role', enum=['user', 'admin']),
        'created_at': fields.DateTime(description='Account creation date')
    })

    login_response_model = api.model('LoginResponse', {
        'access_token': fields.String(description='JWT access token'),
        'user': fields.Nested(user_response_model)
    })

    # API Request Models
    register_model = api.model('Register', {
        'email': fields.String(required=True, description='User email', example='user@example.com'),
        'password': fields.String(required=True, description='User password'),
        'name': fields.String(description='User name', example='John Doe')
    })

    login_model = api.model('Login', {
        'email': fields.String(required=True, description='User email', example='user@example.com'),
        'password': fields.String(required=True, description='User password')
    })

    forgot_password_model = api.model('ForgotPassword', {
        'email': fields.String(required=True, description='User email', example='user@example.com')
    })

    verify_otp_model = api.model('VerifyOTP', {
        'email': fields.String(required=True, description='User email', example='user@example.com'),
        'otp': fields.String(required=True, description='OTP code', min_length=6, max_length=6)
    })

    reset_password_model = api.model('ResetPassword', {
        'password': fields.String(required=True, description='New password')
    })

    return {
        'user': user_model,
        'component': component_model,
        'device': device_model,
        'settings': settings_model,
        'password_reset': password_reset_model,
        'user_response': user_response_model,
        'login_response': login_response_model,
        'register': register_model,
        'login': login_model,
        'forgot_password': forgot_password_model,
        'verify_otp': verify_otp_model,
        'reset_password': reset_password_model
    }

# MongoDB Collection Names
class Collections:
    USERS = 'users'
    PASSWORD_RESETS = 'password_resets'
    SETTINGS = 'settings'
    COMPONENTS = 'components'
    DEVICES = 'devices' 