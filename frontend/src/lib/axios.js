import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use((config) => {
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : null;
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default api;
