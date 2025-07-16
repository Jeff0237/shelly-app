export interface Sensor {
  id: string
  name: string
  type: 'door' | 'window' | 'other'
  location: string
  isOpen: boolean
  battery: number // 0-100
  signal: number // 0-100
  lastUpdate: string // ISO string
}

export interface SensorStatus {
  isOpen: boolean
  battery?: number
  signal?: number
  lastUpdate?: string
}

export interface SensorGroup {
  id: string
  name: string
  sensorIds: string[]
}

export interface ActivityLogEntry {
  id: string
  sensorId: string
  sensorName: string
  timestamp: string // ISO string
  event: 'opened' | 'closed' | 'battery_low' | 'connection_lost' | 'connection_restored'
  details?: string
}

export interface Settings {
  darkMode: 'auto' | 'light' | 'dark'
  refreshInterval: number // in seconds
  notificationsEnabled: boolean
  batteryWarningThreshold: number // 0-100
}


export enum StatusTypes {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum ComponentTypes {
  FLOOR = 'floor',
  DOOR = 'door',
  WINDOW = 'window',
  ROOM = 'room'
}

// Interfaces
export interface ComponentContract {
  id: number|string;
  label: string;
  type: ComponentTypes|string;
  status: StatusTypes|string;
  roomId: string;
  floorId: string;
}

export interface Room {
  id: number|string;
  label: string;
  floorId: string;
}

export interface Floor {
  id: number|string;
  label: string;
}

// --- Shelly Device Interfaces ---
export interface DeviceStatus {
  mqtt?: { connected: boolean };
  actions_stats?: { skipped: number };
  act_reasons?: string[];
  cloud?: { enabled: boolean; connected: boolean };
  bat?: { value: number; voltage: number };
  accel?: { tilt: number; vibration: number };
  time?: string;
  tmp?: { tF: number; value: number; units: string; is_valid: boolean; tC: number };
  wifi_sta?: { ssid: string; rssi: number; connected: boolean; ip: string };
  update?: { status: string; has_update: boolean; new_version: string; old_version: string };
  ram_free?: number;
  fs_free?: number;
  has_update?: boolean;
  serial?: number;
  ram_total?: number;
  is_valid?: boolean;
  unixtime?: number;
  lux?: { value: number; is_valid: boolean; illumination: string };
  mac?: string;
  fs_size?: number;
  cfg_changed_cnt?: number;
  uptime?: number;
  sensor?: { state: 'open' | 'closed' | string; is_valid: boolean };
  sensor_error?: number;
}

export interface DeviceSettings {
  time?: string;
  vibration_sensitivity?: number;
  lng?: number;
  wifi_sta?: {
    enabled?: boolean;
    dns?: string | null;
    mask?: string | null;
    ssid?: string | null;
    ipv4_method?: string;
    ip?: string | null;
    gw?: string | null;
  };
  vibration_enabled?: boolean;
  debug_enable?: boolean;
  cloud?: { enabled: boolean; connected: boolean };
  mqtt?: {
    enable?: boolean;
    server?: string;
    clean_session?: boolean;
    id?: string;
    keep_alive?: number;
    reconnect_timeout_max?: number;
    retain?: boolean;
    update_period?: number;
    reconnect_timeout_min?: number;
    max_qos?: number;
    user?: string;
  };
  temperature_offset?: number;
  reverse_open_close?: boolean;
  tilt_calibrated?: boolean;
  twilight_threshold?: number;
  tzautodetect?: boolean;
  tz_dst?: boolean;
  led_status_disable?: boolean;
  pon_wifi_reset?: boolean;
  unixtime?: number;
  lux_wakeup_enable?: boolean;
  device?: {
    hostname?: string;
    type?: string;
    mac?: string;
    sleep_mode?: boolean;
  };
  discoverable?: boolean;
  tz_dst_auto?: boolean;
  timezone?: string | null;
  wifi_sta1?: {
    enabled?: boolean;
    dns?: string | null;
    mask?: string | null;
    ssid?: string | null;
    ipv4_method?: string;
    ip?: string | null;
    gw?: string | null;
  };
  lat?: number;
  dark_threshold?: number;
  sntp?: { server?: string; enabled?: boolean };
  coiot?: { enabled?: boolean; update_period?: number; peer?: string };
  wifi_ap?: { enabled?: boolean; key?: string; ssid?: string };
  sleep_mode?: { period?: number; unit?: string };
  actions?: { names?: string[]; active?: boolean };
  allow_cross_origin?: boolean;
  fw?: string;
  build_info?: { build_version?: string; build_timestamp?: string; build_id?: string };
  sensors?: { temperature_unit?: string; temperature_threshold?: number };
  login?: { enabled?: boolean; unprotected?: boolean; username?: string };
  tz_utc_offset?: number;
  name?: string | null;
  pin_code?: string;
  tilt_enabled?: boolean;
}

export interface Device {
  _id?: string; // MongoDB ID, optional
  id: string; // Device ID from Shelly
  type: string;
  category?: string;
  name: string;
  room_id?: number | null;
  user_id?: string;
  last_sync?: string; // ISO string
  state?: 'open' | 'closed' | string; // Device state (open/closed)
  status?: 'connected' | 'disconnected' | string; // Connection status
  position?: number | null;
  gen?: number | null;
  channel?: number | null;
  channels_count?: number | null;
  mode?: string | null;
  image?: string | null;
  backgroundColor?: string | null;
  icon?: string | null;
  cloud_online?: boolean | null;
  modified?: number | null;
  ip?: string | null;
  ssid?: string | null;
  status_details?: DeviceStatus | null; // Full status details
  settings?: DeviceSettings | null;
  [key: string]: any; // Allow extra properties for flexibility
}
