# Shelly App

A system for monitoring Shelly devices with a Python backend and Vue.js frontend.

## Project Structure

- `backend/`: Python FastAPI backend server
- `frontend/`: Vue.js frontend application

## Setup Instructions


### Using Docker

```
docker compose up --build --force-recreate
```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the backend server:
   ```bash
   python main.py
   ```

The backend server will run on http://localhost:9009

### Frontend Setup

1. Navigate to the front directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run serve
   ```

The frontend will be available at http://localhost:3000


## API Endpoints

### Backend API

- `POST /devices`: Add a new device
- `GET /devices`: List all devices
- `DELETE /devices/{device_id}`: Remove a device
- `WS /ws`: WebSocket endpoint for real-time updates

## Features

- Real-time device status monitoring
- Add/remove devices
- WebSocket-based updates
- Responsive dashboard
- Device status visualization

