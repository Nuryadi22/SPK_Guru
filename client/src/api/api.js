import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor untuk menyematkan token JWT pada setiap request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('spk_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor response untuk menangani token kadaluarsa
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('spk_token');
        localStorage.removeItem('spk_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
