import { createContext, useContext, useState, useEffect } from 'react';
import { authService, userService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const userData = await userService.getCurrentUser();
      setUser(userData);
    } catch (err) {
      console.error('Error loading user:', err);
      localStorage.removeItem('access_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      const data = await authService.login(credentials);
      await loadUser();
      return data;
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const data = await authService.register(userData);
      return data;
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
      throw err;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const forgotPassword = async (email) => {
    try {
      setError(null);
      const data = await authService.forgotPassword(email);
      return data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset email');
      throw err;
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      setError(null);
      const data = await authService.verifyOTP(email, otp);
      return data;
    } catch (err) {
      setError(err.response?.data?.error || 'OTP verification failed');
      throw err;
    }
  };

  const resetPassword = async (password, resetToken) => {
    try {
      setError(null);
      const data = await authService.resetPassword(password, resetToken);
      return data;
    } catch (err) {
      setError(err.response?.data?.error || 'Password reset failed');
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    verifyOTP,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 