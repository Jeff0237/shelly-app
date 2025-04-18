from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import json
import requests
from typing import List, Dict
import logging
import socket
from contextlib import closing

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store connected WebSocket clients
connected_clients: List[WebSocket] = []

# Store registered devices
devices: Dict[str, Dict] = {}

class Device(BaseModel):
    id: str
    type: str
    ip: str
    port: int

@app.post("/devices")
async def add_device(device: Device):
    """Add a new device to monitor"""
    device_id = device.id
    devices[device_id] = {
        "id": device.id,
        "type": device.type,
        "ip": device.ip,
        "port": device.port,
        "status": None
    }
    
    # Start monitoring the device
    asyncio.create_task(monitor_device(device_id))
    
    return {"message": f"Device {device_id} added successfully"}

@app.get("/devices")
async def list_devices():
    """List all registered devices"""
    return list(devices.values())

@app.delete("/devices/{device_id}")
async def remove_device(device_id: str):
    """Remove a device from monitoring"""
    if device_id in devices:
        del devices[device_id]
        return {"message": f"Device {device_id} removed successfully"}
    return {"message": f"Device {device_id} not found"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Handle WebSocket connections"""
    await websocket.accept()
    connected_clients.append(websocket)
    try:
        while True:
            # Keep the connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        connected_clients.remove(websocket)

async def monitor_device(device_id: str):
    """Monitor a device's status"""
    device = devices[device_id]
    while device_id in devices:
        try:
            # Get device status
            response = requests.get(f"http://{device['ip']}:{device['port']}/status")
            if response.status_code == 200:
                status = response.json()
                if device["status"] != status:
                    device["status"] = status
                    # Notify all connected clients
                    await broadcast_status(device_id, status)
        except Exception as e:
            logger.error(f"Error monitoring device {device_id}: {str(e)}")
        
        # Wait before next check
        await asyncio.sleep(1)

async def broadcast_status(device_id: str, status: Dict):
    """Broadcast device status to all connected clients"""
    message = {
        "device_id": device_id,
        "status": status
    }
    for client in connected_clients:
        try:
            await client.send_text(json.dumps(message))
        except Exception as e:
            logger.error(f"Error broadcasting to client: {str(e)}")

def find_free_port(start_port: int = 8000, max_attempts: int = 10) -> int:
    """Find a free port starting from start_port"""
    for port in range(start_port, start_port + max_attempts):
        with closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as sock:
            try:
                sock.bind(('0.0.0.0', port))
                return port
            except OSError:
                continue
    raise RuntimeError(f"Could not find a free port after {max_attempts} attempts")

if __name__ == "__main__":
    import uvicorn
    
    # Try to find a free port
    try:
        port = find_free_port()
        logger.info(f"Starting server on port {port}")
        uvicorn.run(app, host="0.0.0.0", port=port)
    except RuntimeError as e:
        logger.error(str(e)) 