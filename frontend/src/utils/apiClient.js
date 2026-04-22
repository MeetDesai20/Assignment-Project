import axios from 'axios';
import { notifyWarning } from './toast';

// Set base URL for API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || '';

    // Only treat explicit auth/session checks as a logout signal.
    // Protected feature calls (like subscription checkout) should show an error
    // without wiping the user's session from localStorage.
    if (
      error.response?.status === 401 &&
      /\/auth\/(me|login|signup)$/i.test(requestUrl)
    ) {
      notifyWarning('Session expired. Please log in again.');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
