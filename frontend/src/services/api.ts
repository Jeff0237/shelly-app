import axios from 'axios';

export interface UserSettings {
  userLink: string;
  apiKey: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'https://api.shellydashboard.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: async (userData: object) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  login: async (credentials: {email: string, password: string}) => {
    const response = await api.post('/api/auth/login', credentials);
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response.data;
  },

  verifyOTP: async (email: string, otp: string) => {
    const response = await api.post('/api/auth/verify-otp', { email, otp });
    return response.data;
  },

  resetPassword: async (password: string, resetToken: string) => {
    const response = await api.post('/api/auth/reset-password', { password }, {
      headers: {
        Authorization: `Bearer ${resetToken}`
      }
    });
    return response.data;
  }
};

export const deviceService = {
  getDevices: async () => {
    const response = await api.get('/api/devices');
    return response.data;
  },

  getDeviceStatus: async (deviceId: string) => {
    const response = await api.get(`/api/devices/${deviceId}`);
    return response.data;
  }
};

export const userService = {
  getCurrentUser: async () => {
    const response = await api.get('/api/user');
    return response.data;
  }
};

export const settingsService = {
  getUserSettings: async () => {
    const response = await api.get('/api/settings');
    return response.data;
  },

  updateUserSettings: async (settings: object) => {
    const response = await api.post('/api/settings', settings);
    return response.data;
  },

  disconnectShelly: async () => {
    const response = await api.post('/api/shelly/disconnect');
    return response.data;
  },

  resetShelly: async () => {
    const response = await api.post('/api/shelly/reset');
    return response.data;
  },

  connectShelly: async () => {
    const response = await api.get('/api/shelly/oauth-url');
    return response.data;
  }
};

export default api;
