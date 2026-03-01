import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export const getAuthHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// Get all active jobs including external jobs (public)
export const getJobs = async (params = {}) => {
  const res = await axios.get(`${API_BASE}/jobs/all`, { params });
  return { jobs: res.data };
};

// Get only internal jobs
export const getInternalJobs = async (params = {}) => {
  const res = await axios.get(`${API_BASE}/jobs`, { params });
  return { jobs: res.data };
};

// Get job by ID
export const getJobById = async (id) => {
  const res = await axios.get(`${API_BASE}/jobs/${id}`);
  return res.data;
};

// Check if job is new (posted in last hour)
export const isJobNew = (job) => {
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);
  return new Date(job.createdAt) > oneHourAgo;
};



// Get recent jobs (last 30 days)
export const getRecentJobs = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const res = await axios.get(`${API_BASE}/jobs`, {
    params: {
      recent: true,
      since: thirtyDaysAgo.toISOString()
    }
  });
  return { jobs: res.data };
};

// Get jobs posted in the last hour (for real-time indicators)
export const getLatestJobs = async () => {
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);
  
  const res = await axios.get(`${API_BASE}/jobs`, {
    params: {
      since: oneHourAgo.toISOString()
    }
  });
  return { jobs: res.data };
};

// Create new job (admin/recruiter only)
export const createJob = async (token, jobData) => {
  const res = await axios.post(`${API_BASE}/jobs`, jobData, getAuthHeaders(token));
  return res.data;
};

// Get recruiter's jobs
export const getRecruiterJobs = async (token) => {
  const res = await axios.get(`${API_BASE}/jobs/my/jobs`, getAuthHeaders(token));
  return res.data;
};

// Update job (recruiter only)
export const updateJob = async (token, jobId, jobData) => {
  const res = await axios.put(`${API_BASE}/jobs/${jobId}`, jobData, getAuthHeaders(token));
  return res.data;
};

// Delete job (recruiter only)
export const deleteJob = async (token, jobId) => {
  const res = await axios.delete(`${API_BASE}/jobs/${jobId}`, getAuthHeaders(token));
  return res.data;
};