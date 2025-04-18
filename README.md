# Shelly Device Monitor

A system for monitoring Shelly devices with a Python backend and Vue.js frontend.

## Project Structure

- `backend/`: Python FastAPI backend server
- `front/`: Vue.js frontend application
- `devices/`: Shelly device simulators

## Setup Instructions

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

The backend server will run on http://localhost:8000

### Frontend Setup

1. Navigate to the front directory:
   ```bash
   cd front
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run serve
   ```

The frontend will be available at http://localhost:8080

### Running Device Simulators

1. In a separate terminal, run a Shelly device simulator:
   ```bash
   node bin/fake-shelly --device SHSW-1 --id DOOR1 --port 8081
   ```

2. Run another device simulator:
   ```bash
   node bin/fake-shelly --device SHSW-1 --id DOOR2 --port 8082
   ```

## Using the System

1. Open the frontend application in your browser
2. Add devices using the form:
   - ID: DOOR1
   - Type: SHSW-1
   - IP: localhost
   - Port: 8081

3. The dashboard will show all devices and their current status
4. Status updates will be received in real-time through WebSocket

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

# fake-shelly
fake-shelly is a simple server that simulates [Shelly](https://shelly.cloud) devices.
It has HTTP and CoAP support and can be used to test other pieces of software that work with Shelly devices.

## Usage
Clone this repository, then run `$ bin/fake-shelly <device-type>`.

Available device types are:
* SHBLB-1
* SHDM-1
* SHEM
* SHHT-1
* SHPLG-1
* SHPLG-S
* SHPLG2-1
* SHRGBW2-color
* SHRGBW2-white
* SHSEN-1
* SHSW-1
* SHSW-PM
* SHSW-21
* SHSW-21-roller
* SHSW-25
* SHSW-25-roller
* SHSW-44
* SHWT-1


node bin/fake-shelly --device SHSW-1 --id ABC123 --port 8086

node bin/fake-shelly --device SHPLG-1 --id DEF456 --port 8087

node bin/fake-shelly --device SHRGBW2 --id GHI789 --port 8088


const devices = [
//    { id: 'DOOR1', port: 8081, name: 'Front Door' },
//    { id: 'DOOR2', port: 8082, name: 'Back Door' },
//    { id: 'WINDOW1', port: 8083, name: 'Living Room Window' },
//    { id: 'WINDOW2', port: 8084, name: 'Bedroom Window' }
    { id: 'ABC123', port: 8086, name: 'Bedroom 1' },
    { id: 'DEF456', port: 8087, name: 'Bedroom 2' },
    { id: 'GHI789', port: 8088, name: 'Bedroom 3' },
];



node test-toggle.js toggle ABC123



127.0.0.1


cd backend
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
python main.py


node bin/fake-shelly --device SHSW-1 --id DOOR1 --port 8081
node bin/fake-shelly --device SHSW-1 --id DOOR2 --port 8082
node bin/fake-shelly --device SHSW-1 --id DOOR1 --port 8086




{ id: 'DOOR1', port: 8081, name: 'Front Door' },
{ id: 'DOOR2', port: 8082, name: 'Back Door' },
{ id: 'WINDOW1', port: 8083, name: 'Living Room Window' },
{ id: 'WINDOW2', port: 8084, name: 'Bedroom Window' }


