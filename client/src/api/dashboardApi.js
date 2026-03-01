import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getDashboardSummary = async (token) => {
  const res = await axios.get(`${API_BASE}/dashboard/summary`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};