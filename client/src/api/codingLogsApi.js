const API_BASE = 'http://localhost:5000/api';

export const codingLogsApi = {
  // Get all coding logs for the user
  getAll: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/coding-logs`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch coding logs');
    return response.json();
  },

  // Create a new coding log
  create: async (logData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/coding-logs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logData),
    });
    if (!response.ok) throw new Error('Failed to create coding log');
    return response.json();
  },

  // Update a coding log
  update: async (id, logData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/coding-logs/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logData),
    });
    if (!response.ok) throw new Error('Failed to update coding log');
    return response.json();
  },

  // Delete a coding log
  delete: async (id) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/coding-logs/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to delete coding log');
    return response.json();
  },

  // Get coding statistics for weak topic detection
  getStats: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/coding-logs/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch coding stats');
    return response.json();
  },
};