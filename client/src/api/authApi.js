import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Configure axios defaults
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add request interceptor to include auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const registerUser = async (data) => {
  try {
    console.log('Registering user with data:', data);
    const res = await axios.post(`${API_BASE}/auth/register`, data);
    console.log('Registration successful:', res.data);
    return res.data;
  } catch (error) {
    console.error('Registration API Error:', error.response?.data || error.message);
    console.error('Full error:', error);
    throw error;
  }
};

export const loginUser = async (data) => {
  try {
    console.log('Logging in user with data:', data);
    const res = await axios.post(`${API_BASE}/auth/login`, data);
    console.log('Login successful:', res.data);
    return res.data;
  } catch (error) {
    console.error('Login API Error:', error.response?.data || error.message);
    console.error('Full error:', error);
    throw error;
  }
};

export const testConnection = async () => {
  try {
    const res = await axios.get(`${API_BASE.replace('/api', '')}`);
    console.log('Server connection test:', res.data);
    return res.data;
  } catch (error) {
    console.error('Server connection failed:', error.message);
    throw error;
  }
};