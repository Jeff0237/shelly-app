import { defineStore } from 'pinia';
import { deviceService } from '../services/api';
import type { Device } from '../types';
import { websocketService } from '../services/websocket';
import { toRaw } from 'vue';

interface DeviceStatus {
  deviceId: string;
  online: boolean;
  battery?: number;
  temperature?: number;
  humidity?: number;
  lastUpdate: string;
  state?: string; // open/closed
}

export const useDeviceStore = defineStore('device', {
  state: () => ({
    devices: [] as Device[],
    loading: false,
    error: null as string | null,
    deviceStatuses: {} as Record<string, DeviceStatus>,
    isConnected: false,
    onStatusAlert: null as ((payload: any) => void) | null,
  }),
  
  getters: {
    getDeviceStatus: (state) => (deviceId: string) => {
      if (!deviceId || !state.deviceStatuses) return null;
      return state.deviceStatuses[deviceId] || null;
    },
    
    onlineDevices: (state) => {
      return state.devices.filter(device => {
        const status = state.deviceStatuses[device.id];
        return status?.online === true;
      });
    },
    
    offlineDevices: (state) => {
      return state.devices.filter(device => {
        const status = state.deviceStatuses[device.id];
        return status?.online === false;
      });
    },
    
    openedDevices: (state) => {
      return state.devices.filter(device => {
        const status = state.deviceStatuses[device.id];
        return status?.state === 'open';
      });
    },
    
    closedDevices: (state) => {
      return state.devices.filter(device => {
        const status = state.deviceStatuses[device.id];
        return status?.state === 'closed';
      });
    }
  },
  
  actions: {
    async loadDevices() {
      this.loading = true;
      this.error = null;
      try {
        this.devices = [];
        let data = await deviceService.getDevices();
        
        // Handle new response format: { isok: true, data: { devices: {...} } }
        if (data.isok && data.data && data.data.devices) {
          let _devices = data.data.devices;

          await this.refreshDevicesState(_devices);
        } else {
          console.error('Invalid response format:', data);
          this.error = 'Invalid response format from server';
        }
      } catch (e: any) {
        this.error = e.message || 'Erreur lors du chargement des devices';
      } finally {
        this.loading = false;
      }
    },

    async refreshDevicesState(devices: any = null) {
      let _devices = [];
      if (devices) {
        _devices = Object.values(devices);
      } else {
        _devices = toRaw(this.devices) ?? [];
      }

      this.devices = [];
      _devices?.forEach((device: any) => {
        this.devices.push(device);
        
        if (!this.deviceStatuses[device.id]) {
          this.deviceStatuses[device.id] = {
            deviceId: device.id,
            online: device.status === 'connected',
            lastUpdate: new Date().toISOString(),
            state: device.state || 'closed',
          };
        } else {
          // Update existing status with new data
          this.deviceStatuses[device.id] = {
            ...this.deviceStatuses[device.id],
            online: device.status === 'connected',
            state: device.state || this.deviceStatuses[device.id].state,
            lastUpdate: device.last_sync || new Date().toISOString(),
          };
        }
      });
    },

    async connectWebSocket() {
      try {
        // Connect to WebSocket (no token required for polling service)
        websocketService.connect();
        this.isConnected = false;

        websocketService.on('connected', () => {
          this.isConnected = true;
        });

        websocketService.on('shelly_error', () => {
          this.isConnected = false;
        });

        websocketService.on('shelly_disconnected', () => {
          this.isConnected = false;
        });

        websocketService.on('device_update', (payload: any) => {
          if (payload?.event === 'Shelly:StatusOnChange') {
            // Handle different Shelly WebSocket message formats
            let deviceId = null;
            let sensorState = payload.status?.sensor?.state === 'close' ? 'closed' : 'open';
            let wifiConnected = false;
            
            // Format 1: Direct device update with device_id
            if (payload.device_id) {
              deviceId = payload.device_id;
//              sensorState = payload.status?.sensor?.state;
              wifiConnected = payload.status?.wifi_sta?.connected || false;
            }
            // // Format 2: Shelly Cloud WebSocket format
            // else if (payload.id) {
            //   deviceId = payload.id;
            //   sensorState = payload.status?.sensor?.state;
            //   wifiConnected = payload.status?.wifi_sta?.connected || false;
            // }
            // Format 3: Shelly event format
            // else if (payload.src && payload.dst) {
            //   deviceId = payload.src;
            //   if (payload.events && payload.events.length > 0) {
            //     const event = payload.events[0];
            //     if (event.component === 'sensor') {
            //       sensorState = event.info?.state;
            //     }
            //   }
            //   wifiConnected = true; // Assume connected if we get events
            // }
            
            if (deviceId) {
              let _devices = toRaw(this.devices);
              // Update the specific device in the devices list
              const deviceIndex = _devices.findIndex(device => device.id === deviceId);
              if (deviceIndex !== -1) {
                // Update the device's state and status
                _devices[deviceIndex] = {
                  ..._devices[deviceIndex],
                  state: sensorState || _devices[deviceIndex].state || 'closed',
                  status: wifiConnected ? 'connected' : 'disconnected',
                  last_sync: new Date().toISOString(),
                };
              }

              this.refreshDevicesState(_devices)

              // // Update the device status
              // this.deviceStatuses[deviceId] = {
              //   ...this.deviceStatuses[deviceId],
              //   deviceId: deviceId,
              //   state: sensorState || this.deviceStatuses[deviceId]?.state || 'closed',
              //   online: wifiConnected,
              //   lastUpdate: new Date().toISOString(),
              // };
              
              // console.log('Updated device status for:', deviceId, 'State:', sensorState);
              if (this.onStatusAlert) {
                // console.log('Calling status alert callback with:', { device_id: deviceId, state: sensorState });
                this.onStatusAlert({ device_id: deviceId, state: sensorState });
              }
        } else {
              console.log('Could not extract device ID from payload:', payload);
            }
          }
        });

        websocketService.on('error', (data) => {
          this.isConnected = false;
         console.log('WebSocket error:', data);
        });

      } catch (error) {
        this.isConnected = false;
        console.error('Failed to connect WebSocket:', error);
      }
    },

    disconnectWebSocket() {
      websocketService.disconnect();
      this.isConnected = false;
    },

    updateDeviceStatus(deviceId: string, status: DeviceStatus) {
      this.deviceStatuses[deviceId] = status;
    },

    setStatusAlertCallback(cb: (payload: any) => void) {
      this.onStatusAlert = cb;
    },

    async fetchDeviceStatus(deviceId: string) {
      try {
        const status = await deviceService.getDeviceStatus(deviceId);
        // Update the device status in our store
        this.deviceStatuses[deviceId] = {
          deviceId: deviceId,
          online: status.status === 'connected',
          state: status.state,
          lastUpdate: new Date().toISOString(),
        };
        return status;
      } catch (error) {
        console.error('Failed to get device status:', error);
        throw error;
      }
    },
  },
});
