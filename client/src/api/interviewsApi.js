const API_BASE = 'http://localhost:5000/api';

export const interviewsApi = {
  // Get all interview experiences for the user
  getAll: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/interviews`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch interviews');
    return response.json();
  },

  // Create a new interview experience
  create: async (interviewData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/interviews`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(interviewData),
    });
    if (!response.ok) throw new Error('Failed to create interview experience');
    return response.json();
  },

  // Update an interview experience
  update: async (id, interviewData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/interviews/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(interviewData),
    });
    if (!response.ok) throw new Error('Failed to update interview experience');
    return response.json();
  },

  // Delete an interview experience
  delete: async (id) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/interviews/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to delete interview experience');
    return response.json();
  },

  // Get public interview experiences (no auth required)
  getPublic: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) queryParams.append(key, filters[key]);
    });
    
    const response = await fetch(`${API_BASE}/interviews/public?${queryParams}`);
    if (!response.ok) throw new Error('Failed to fetch public interviews');
    return response.json();
  },

  // Get all public interview experiences for registered users
  getAllPublic: async (filters = {}) => {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) queryParams.append(key, filters[key]);
    });
    
    const response = await fetch(`${API_BASE}/interviews/all?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch all public interviews');
    return response.json();
  },
};