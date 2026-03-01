import { useState, useEffect } from 'react';
import JobCreationForm from '../components/JobCreationForm';
import { getLatestJobs } from '../api/jobsApi';

const AdminPage = () => {
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecentJobs = async () => {
    try {
      const { jobs } = await getLatestJobs();
      setRecentJobs(jobs);
    } catch (error) {
      console.error('Error fetching recent jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentJobs();
    
    // Poll for new jobs every 30 seconds
    const interval = setInterval(fetchRecentJobs, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleJobCreated = (newJob) => {
    setRecentJobs(prev => [newJob, ...prev]);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Admin Dashboard</h1>
      
      <JobCreationForm onJobCreated={handleJobCreated} />
      
      <div style={{ marginTop: '40px' }}>
        <h2>Recent Jobs (Last Hour)</h2>
        {loading ? (
          <p>Loading recent jobs...</p>
        ) : recentJobs.length === 0 ? (
          <p>No jobs posted in the last hour.</p>
        ) : (
          <div>
            {recentJobs.map(job => (
              <div
                key={job._id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '15px',
                  margin: '10px 0',
                  backgroundColor: '#f9f9f9'
                }}
              >
                <h3>{job.title}</h3>
                <p><strong>Company:</strong> {job.company}</p>
                <p><strong>Location:</strong> {job.location}</p>
                <p><strong>Type:</strong> {job.type}</p>
                {job.salary && (
                  <p><strong>Salary:</strong> {
                    typeof job.salary === 'object' && job.salary.min && job.salary.max
                      ? `${job.salary.currency || '$'}${job.salary.min} - ${job.salary.currency || '$'}${job.salary.max}`
                      : job.salary
                  }</p>
                )}
                <p><strong>Posted:</strong> {new Date(job.createdAt).toLocaleString()}</p>
                <p><strong>Description:</strong> {job.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;