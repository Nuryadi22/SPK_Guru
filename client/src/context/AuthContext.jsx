import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('spk_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('spk_user');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('spk_user');
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token: receivedToken, user: receivedUser } = response.data;

      localStorage.setItem('spk_token', receivedToken);
      localStorage.setItem('spk_user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);

      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal masuk ke sistem. Silakan periksa koneksi Anda.';
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('spk_token');
    localStorage.removeItem('spk_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'admin',
    isKepalaSekolah: user?.role === 'kepala_sekolah',
    login,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
};
