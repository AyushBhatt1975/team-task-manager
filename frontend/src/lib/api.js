import axios from 'axios';

// Ensure VITE_API_URL is properly formatted without a trailing slash
const rawBaseURL = import.meta.env.VITE_API_URL || '/api';
// Ensure it ends with /api if it doesn't already, and remove trailing slash
let baseURL = rawBaseURL.trim();
if (baseURL.startsWith('http') && !baseURL.endsWith('/api') && !baseURL.includes('/api/')) {
  baseURL = baseURL.replace(/\/$/, '') + '/api';
}
baseURL = baseURL.replace(/\/$/, '');

console.log(`[API] Initialized with baseURL: ${baseURL}`);

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to log all outgoing requests and attach token
api.interceptors.request.use((config) => {
  // Fix URL joining (avoid double slashes or missing slashes)
  const cleanUrl = config.url.startsWith('/') ? config.url : `/${config.url}`;
  const fullUrl = config.baseURL ? `${config.baseURL.replace(/\/$/, '')}${cleanUrl}` : cleanUrl;
  
  console.log(`[API Request] ${config.method.toUpperCase()} ${fullUrl}`);
  
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally and log errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { config, response } = error;
    const fullUrl = config.baseURL ? `${config.baseURL.replace(/\/$/, '')}${config.url}` : config.url;
    
    console.error(`[API Error] ${config.method.toUpperCase()} ${fullUrl}`);
    if (response) {
      console.error(`[API Error] Status: ${response.status}`);
      console.error(`[API Error] Data:`, response.data);
    } else {
      console.error(`[API Error] Message: ${error.message}`);
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
