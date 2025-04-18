const axios = require('axios');

// Device configurations
const devices = [
//    { id: 'DOOR1', port: 8081, name: 'Front Door' },
//    { id: 'DOOR2', port: 8082, name: 'Back Door' },
//    { id: 'WINDOW1', port: 8083, name: 'Living Room Window' },
//    { id: 'WINDOW2', port: 8084, name: 'Bedroom Window' }
    { id: 'ABC123', port: 8086, name: 'Bedroom 1' },
    { id: 'DEF456', port: 8087, name: 'Bedroom 2' },
    { id: 'GHI789', port: 8088, name: 'Bedroom 3' }
];

async function toggleDevice(devicePort) {
    try {
        // First get current status
        const statusResponse = await axios.get(`http://localhost:${devicePort}/status`);
        const currentState = statusResponse.data.relays[0].ison;
        // Toggle the state
        const newState = !currentState;
        await axios.get(`http://localhost:${devicePort}/relay/0`, {
            params: {
                turn: newState ? 'on' : 'off'
            }
        });
        
        const device = devices.find(d => d.port === devicePort);
        console.log(`[${device.name}] Status changed to ${newState ? 'OPEN' : 'CLOSED'}`);
        return newState;
    } catch (error) {
        console.error(`Error toggling device on port ${devicePort}:`, error.message);
        return null;
    }
}

async function getDeviceStatus(devicePort) {
    try {
        const statusResponse = await axios.get(`http://localhost:${devicePort}/status`);
        console.log(statusResponse.data);
        return statusResponse.data.relays[0].ison;
    } catch (error) {
        console.error(`Error getting status for device on port ${devicePort}:`, error.message);
        return null;
    }
}

async function printAllStatuses() {
    console.log('\nCurrent Device Statuses:');
    console.log('------------------------');
    for (const device of devices) {
        const status = await getDeviceStatus(device.port);
        if (status !== null) {
            console.log(`[${device.name}] (${device.id}): ${status ? 'OPEN' : 'CLOSED'}`);
        }
    }
    console.log('------------------------\n');
}

// Command line interface
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        // If no arguments, show help
        console.log('\nUsage:');
        console.log('node test-toggle.js [command] [device]');
        console.log('\nCommands:');
        console.log('  toggle [device] - Toggle a specific device');
        console.log('  status         - Show status of all devices');
        console.log('  all            - Toggle all devices');
        console.log('\nDevices:');
        devices.forEach(device => {
            console.log(`  ${device.id} - ${device.name} (port ${device.port})`);
        });
    } else {
        const command = args[0].toLowerCase();
        
        if (command === 'status') {
            printAllStatuses();
        } else if (command === 'all') {
            console.log('Toggling all devices...');
            devices.forEach(device => toggleDevice(device.port));
        } else if (command === 'toggle' && args[1]) {
            const deviceId = args[1].toUpperCase();
            const device = devices.find(d => d.id === deviceId);
            if (device) {
                toggleDevice(device.port);
            } else {
                console.error(`Device ${deviceId} not found`);
            }
        } else {
            console.error('Invalid command or device');
        }
    }
}

module.exports = {
    toggleDevice,
    getDeviceStatus,
    printAllStatuses,
    devices
}; 