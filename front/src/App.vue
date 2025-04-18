<template>
  <div class="container mt-4">
    <h1 class="mb-4">Shelly Device Monitor</h1>
    
    <!-- Device Management -->
    <div class="card mb-4">
      <div class="card-header">
        <h2>Add New Device</h2>
      </div>
      <div class="card-body">
        <form @submit.prevent="addDevice" class="row g-3">
          <div class="col-md-3">
            <input v-model="newDevice.id" type="text" class="form-control" placeholder="Device ID" required>
          </div>
          <div class="col-md-3">
            <input v-model="newDevice.type" type="text" class="form-control" placeholder="Device Type" required>
          </div>
          <div class="col-md-3">
            <input v-model="newDevice.ip" type="text" class="form-control" placeholder="IP Address" required>
          </div>
          <div class="col-md-2">
            <input v-model="newDevice.port" type="number" class="form-control" placeholder="Port" required>
          </div>
          <div class="col-md-1">
            <button type="submit" class="btn btn-primary">Add</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Device List -->
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h2>Devices</h2>
        <div class="status-summary">
          <span class="badge bg-success me-2">Open: {{ openCount }}</span>
          <span class="badge bg-danger">Closed: {{ closedCount }}</span>
        </div>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>IP</th>
                <th>Port</th>
                <th>Status</th>
                <th>Last Update</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="device in devices" :key="device.id" :class="getRowClass(device)">
                <td>{{ device.id }}</td>
                <td>{{ device.type }}</td>
                <td>{{ device.ip }}</td>
                <td>{{ device.port }}</td>
                <td>
                  <span :class="getStatusClass(device)">
                    {{ getStatusText(device) }}
                  </span>
                </td>
                <td>{{ device.lastUpdate || 'Never' }}</td>
                <td>
                  <button @click="removeDevice(device.id)" class="btn btn-danger btn-sm">Remove</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const BACKEND_URL = process.env.VUE_APP_BACKEND_URL || 'http://localhost:8000';

export default {
  name: 'App',
  data() {
    return {
      devices: [],
      newDevice: {
        id: '',
        type: '',
        ip: '',
        port: 8080
      },
      ws: null
    }
  },
  computed: {
    openCount() {
      return this.devices.filter(device => this.getStatusText(device) === 'Open').length;
    },
    closedCount() {
      return this.devices.filter(device => this.getStatusText(device) === 'Closed').length;
    }
  },
  methods: {
    async addDevice() {
      try {
        await axios.post(`${BACKEND_URL}/devices`, this.newDevice);
        this.newDevice = { id: '', type: '', ip: '', port: 8080 };
        this.fetchDevices();
      } catch (error) {
        console.error('Error adding device:', error);
      }
    },
    async removeDevice(deviceId) {
      try {
        await axios.delete(`${BACKEND_URL}/devices/${deviceId}`);
        this.fetchDevices();
      } catch (error) {
        console.error('Error removing device:', error);
      }
    },
    async fetchDevices() {
      try {
        const response = await axios.get(`${BACKEND_URL}/devices`);
        this.devices = response.data;
      } catch (error) {
        console.error('Error fetching devices:', error);
      }
    },
    getStatusClass(device) {
      if (!device.status) return 'badge bg-secondary';
      const isOn = device.status.relays?.[0]?.ison;
      return isOn ? 'badge bg-success' : 'badge bg-danger';
    },
    getStatusText(device) {
      if (!device.status) return 'Unknown';
      const isOn = device.status.relays?.[0]?.ison;
      return isOn ? 'Open' : 'Closed';
    },
    getRowClass(device) {
      if (!device.status) return '';
      const isOn = device.status.relays?.[0]?.ison;
      return isOn ? 'table-success' : 'table-danger';
    },
    setupWebSocket() {
      const wsUrl = BACKEND_URL.replace('http', 'ws') + '/ws';
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const device = this.devices.find(d => d.id === data.device_id);
        if (device) {
          device.status = data.status;
          device.lastUpdate = new Date().toLocaleTimeString();
        }
      };

      this.ws.onclose = () => {
        setTimeout(() => this.setupWebSocket(), 1000);
      };
    }
  },
  mounted() {
    this.fetchDevices();
    this.setupWebSocket();
  }
}
</script>

<style>
.badge {
  padding: 0.5em 1em;
  font-size: 0.9em;
}
.status-summary {
  font-size: 1.1em;
}
.table-success, .table-danger {
  transition: background-color 0.3s ease;
}
</style> 