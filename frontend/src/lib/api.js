import axios from 'axios';

// Ensure VITE_API_URL is properly formatted without a trailing slash
const rawBaseURL = import.meta.env.VITE_API_URL || '/api';
const baseURL = rawBaseURL.replace(/\/$/, '');

console.log(`[API] Initialized with baseURL: ${baseURL}`);

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
