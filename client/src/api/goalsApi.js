const API_BASE = 'http://localhost:5000/api';

export const goalsApi = {
  // Get all goals
  getAll: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/goals`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch goals');
    return response.json();
  },

  // Get goals with auto-calculated progress
  getWithProgress: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/goals/with-progress`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch goals with progress');
    return response.json();
  },

  // Create a new goal
  create: async (goalData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/goals`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(goalData),
    });
    if (!response.ok) throw new Error('Failed to create goal');
    return response.json();
  },

  // Update a goal
  update: async (id, goalData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/goals/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(goalData),
    });
    if (!response.ok) throw new Error('Failed to update goal');
    return response.json();
  },

  // Delete a goal
  delete: async (id) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/goals/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to delete goal');
    return response.json();
  },
};