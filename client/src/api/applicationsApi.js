const API_BASE_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const applicationsApi = {
  // Get all applications
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/applications`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch applications');
    return response.json();
  },

  // Create new application
  create: async (applicationData) => {
    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(applicationData)
    });
    if (!response.ok) throw new Error('Failed to create application');
    return response.json();
  },

  // Update application
  update: async (id, updateData) => {
    const response = await fetch(`${API_BASE_URL}/applications/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData)
    });
    if (!response.ok) throw new Error('Failed to update application');
    return response.json();
  },

  // Delete application
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/applications/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete application');
    return response.json();
  },

  // Get applications that need follow-up
  getFollowUps: async () => {
    const response = await fetch(`${API_BASE_URL}/applications/follow-ups`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch follow-up applications');
    return response.json();
  },

  // Get application count for a job
  getJobApplicationCount: async (jobId) => {
    const response = await fetch(`${API_BASE_URL}/applications/job/${jobId}/count`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch application count');
    return response.json();
  }
};