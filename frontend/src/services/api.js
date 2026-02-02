import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Test connection to backend
export const testConnection = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('API connection error:', error);
    throw error;
  }
};

// Request endpoints
export const submitRequest = async (requestData) => {
  const response = await api.post('/api/requests', requestData);
  return response.data;
};

export default api;