<script setup lang="ts">
import { useSensorStore } from '../stores/sensorStore'

const sensorStore = useSensorStore()

// This is a simple placeholder for a floor plan view
// In a real application, you would use a proper SVG map or canvas drawing
</script>

<template>
  <div class="floor-plan-view">
    <h1>Laboratory Floor Plan</h1>
    
    <div class="layout-note">
      <p>This is a placeholder for the interactive floor plan view. In a production application, this would display an actual floor plan of the laboratory with sensors shown in their physical locations.</p>
    </div>
    
    <div class="floor-plan-container">
      <div class="plan-area">
        <!-- Simple mockup of a floor plan -->
        <div class="building-outline">
          <div class="room" data-label="Lab 1">
            <div 
              v-for="sensor in sensorStore.sensors.filter(s => s.location === 'First Floor' && s.name.includes('Lab 1'))"
              :key="sensor.id"
              class="sensor-marker"
              :class="{ 'open': sensor.isOpen }"
              :title="`${sensor.name}: ${sensor.isOpen ? 'Open' : 'Closed'}`"
            ></div>
          </div>
          <div class="room" data-label="Lab 2">
            <div 
              v-for="sensor in sensorStore.sensors.filter(s => s.location === 'First Floor' && s.name.includes('Lab 2'))"
              :key="sensor.id"
              class="sensor-marker"
              :class="{ 'open': sensor.isOpen }"
              :title="`${sensor.name}: ${sensor.isOpen ? 'Open' : 'Closed'}`"
            ></div>
          </div>
          <div class="corridor"></div>
          <div class="room" data-label="Storage">
            <div 
              v-for="sensor in sensorStore.sensors.filter(s => s.location === 'Basement')"
              :key="sensor.id"
              class="sensor-marker"
              :class="{ 'open': sensor.isOpen }"
              :title="`${sensor.name}: ${sensor.isOpen ? 'Open' : 'Closed'}`"
            ></div>
          </div>
          <div class="room" data-label="Office">
            <div 
              v-for="sensor in sensorStore.sensors.filter(s => s.location === 'Second Floor')"
              :key="sensor.id"
              class="sensor-marker"
              :class="{ 'open': sensor.isOpen }"
              :title="`${sensor.name}: ${sensor.isOpen ? 'Open' : 'Closed'}`"
            ></div>
          </div>
          <div class="entrance" data-label="Main Entrance">
            <div 
              v-for="sensor in sensorStore.sensors.filter(s => s.name.includes('Main Entrance'))"
              :key="sensor.id"
              class="sensor-marker entrance-marker"
              :class="{ 'open': sensor.isOpen }"
              :title="`${sensor.name}: ${sensor.isOpen ? 'Open' : 'Closed'}`"
            ></div>
          </div>
          <div class="emergency-exit" data-label="Emergency Exit">
            <div 
              v-for="sensor in sensorStore.sensors.filter(s => s.name.includes('Emergency Exit'))"
              :key="sensor.id"
              class="sensor-marker emergency-marker"
              :class="{ 'open': sensor.isOpen }"
              :title="`${sensor.name}: ${sensor.isOpen ? 'Open' : 'Closed'}`"
            ></div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="floor-plan-legend">
      <div class="legend-item">
        <div class="legend-marker closed"></div>
        <span>Closed Sensor</span>
      </div>
      <div class="legend-item">
        <div class="legend-marker open"></div>
        <span>Open Sensor</span>
      </div>
      <div class="legend-item">
        <div class="legend-marker entrance-marker"></div>
        <span>Main Entrance</span>
      </div>
      <div class="legend-item">
        <div class="legend-marker emergency-marker"></div>
        <span>Emergency Exit</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.floor-plan-view {
  max-width: 1000px;
  margin: 0 auto;
}

.layout-note {
  background-color: var(--color-primary-light);
  padding: var(--space-4);
  border-radius: var(--radius);
  margin-bottom: var(--space-6);
  color: white;
}

.floor-plan-container {
  background-color: white;
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow);
  margin-bottom: var(--space-6);
}

.plan-area {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  position: relative;
}

.building-outline {
  border: 3px solid var(--color-neutral-700);
  height: 100%;
  position: relative;
  padding: var(--space-2);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: var(--space-3);
}

.room {
  border: 2px solid var(--color-neutral-500);
  border-radius: var(--radius);
  padding: var(--space-4);
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-content: flex-start;
}

.room::after {
  content: attr(data-label);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.875rem;
  color: var(--color-neutral-400);
  pointer-events: none;
}

.corridor {
  grid-column: 2;
  grid-row: span 2;
  background-color: var(--color-neutral-200);
  position: relative;
}

.entrance {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 20px;
  background-color: var(--color-primary);
  display: flex;
  justify-content: center;
  align-items: center;
}

.emergency-exit {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 60px;
  background-color: var(--color-error);
  display: flex;
  justify-content: center;
  align-items: center;
}

.sensor-marker {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: var(--color-success);
  border: 2px solid white;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all var(--transition-base);
}

.sensor-marker.open {
  background-color: var(--color-error);
  animation: pulse 2s infinite;
}

.entrance-marker {
  background-color: var(--color-primary);
}

.emergency-marker {
  background-color: var(--color-error-dark);
}

.entrance-marker.open, 
.emergency-marker.open {
  background-color: var(--color-error);
}

.floor-plan-legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.legend-marker {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid var(--color-neutral-300);
}

.legend-marker.closed {
  background-color: var(--color-success);
}

.legend-marker.open {
  background-color: var(--color-error);
}

.legend-marker.entrance-marker {
  background-color: var(--color-primary);
}

.legend-marker.emergency-marker {
  background-color: var(--color-error-dark);
}

@media (prefers-color-scheme: dark) {
  .layout-note {
    background-color: var(--color-primary-dark);
  }
  
  .floor-plan-container {
    background-color: var(--color-neutral-800);
  }
  
  .corridor {
    background-color: var(--color-neutral-700);
  }
  
  .building-outline {
    border-color: var(--color-neutral-600);
  }
  
  .room {
    border-color: var(--color-neutral-600);
  }
  
  .sensor-marker {
    border-color: var(--color-neutral-800);
  }
  
  .legend-marker {
    border-color: var(--color-neutral-700);
  }
}
</style>