import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { isJobNew, deleteJob, updateJob } from '../api/jobsApi';
import { applicationsApi } from '../api/applicationsApi';

const JobCard = ({ job, isRecruiterView = false, onJobUpdated, onApplicationSubmit }) => {
  const { user, token } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applicationCount, setApplicationCount] = useState(0);
  const [editData, setEditData] = useState({
    title: job.title,
    company: job.company,
    location: job.location,
    type: job.type,
    mode: job.mode,
    description: job.description,
    salary: job.salary || '',
    status: job.status
  });

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user || user.role !== 'applicant') {
      alert('Please login as an applicant to apply for jobs.');
      return;
    }

    setIsApplying(true);
    try {
      await applicationsApi.create({
        jobId: job._id,
        status: 'Applied',
        appliedDate: new Date().toISOString(),
        notes: `Applied for ${job.title} at ${job.company}`
      });
      
      alert('Application submitted successfully!');
      if (onApplicationSubmit) onApplicationSubmit(job._id);
      
      // Still redirect to external URL if available
      if (job.applicationUrl && job.applicationUrl !== '#') {
        window.open(job.applicationUrl, '_blank');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  // Fetch application count for recruiters
  React.useEffect(() => {
    if (isRecruiterView && user?.role === 'recruiter') {
      const fetchApplicationCount = async () => {
        try {
          const { count } = await applicationsApi.getJobApplicationCount(job._id);
          setApplicationCount(count);
        } catch (error) {
          console.error('Error fetching application count:', error);
        }
      };
      fetchApplicationCount();
    }
  }, [job._id, isRecruiterView, user?.role]);

  // Refresh application count when onApplicationSubmit is called
  React.useEffect(() => {
    if (onApplicationSubmit && isRecruiterView && user?.role === 'recruiter') {
      const refreshCount = async () => {
        try {
          const { count } = await applicationsApi.getJobApplicationCount(job._id);
          setApplicationCount(count);
        } catch (error) {
          console.error('Error refreshing application count:', error);
        }
      };
      
      // Listen for application submissions
      const interval = setInterval(refreshCount, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [job._id, onApplicationSubmit, isRecruiterView, user?.role]);

  if (!job) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const isApplicant = user?.role === 'applicant';
  const jobIsNew = isJobNew(job);

  return (
    <div style={{
      border: jobIsNew ? '2px solid #28a745' : '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '20px',
      margin: '15px 0',
      backgroundColor: jobIsNew ? '#f8fff8' : '#fff',
      boxShadow: jobIsNew ? '0 4px 8px rgba(40, 167, 69, 0.2)' : '0 2px 4px rgba(0,0,0,0.1)',
      position: 'relative',
      animation: jobIsNew ? 'newJobGlow 3s ease-in-out' : 'none'
    }}>
      {jobIsNew && (
        <div style={{
          position: 'absolute',
          top: '-1px',
          right: '15px',
          backgroundColor: '#28a745',
          color: 'white',
          padding: '4px 12px',
          borderRadius: '0 0 8px 8px',
          fontSize: '12px',
          fontWeight: 'bold',
          animation: 'pulse 2s infinite'
        }}>
          🆕 NEW
        </div>
      )}
      
      <style>
        {`
          @keyframes newJobGlow {
            0% { box-shadow: 0 4px 8px rgba(40, 167, 69, 0.2); }
            50% { box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4); }
            100% { box-shadow: 0 4px 8px rgba(40, 167, 69, 0.2); }
          }
        `}
      </style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{job.title}</h3>
          <p style={{ margin: '5px 0', fontSize: '16px', fontWeight: '500', color: '#007bff' }}>
            {job.company}
          </p>
          <p style={{ margin: '5px 0', color: '#666' }}>
            📍 {job.location} • {job.type} • {job.mode}
          </p>
          <p style={{ margin: '10px 0', color: '#555', lineHeight: '1.5' }}>
            {job.description.substring(0, 200)}...
          </p>
          
          {job.externalSource === 'mock_api' && (
            <div style={{
              backgroundColor: '#fff3cd',
              color: '#856404',
              padding: '8px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              margin: '10px 0',
              border: '1px solid #ffeaa7'
            }}>
              💡 This is demo data for testing purposes
            </div>
          )}
          
          {job.skills && job.skills.length > 0 && (
            <div style={{ margin: '10px 0' }}>
              <strong>Skills: </strong>
              {job.skills.map((skill, index) => (
                <span key={index} style={{
                  display: 'inline-block',
                  backgroundColor: '#f0f0f0',
                  padding: '2px 8px',
                  margin: '2px',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}>
                  {skill}
                </span>
              ))}
            </div>
          )}

          {job.salary && (job.salary.min || job.salary.max) && (
            <p style={{ margin: '5px 0', color: '#28a745', fontWeight: '500' }}>
              💰 {job.salary.min && `$${job.salary.min.toLocaleString()}`}
              {job.salary.min && job.salary.max && ' - '}
              {job.salary.max && `$${job.salary.max.toLocaleString()}`}
              {job.salary.currency && job.salary.currency !== 'USD' && ` ${job.salary.currency}`}
            </p>
          )}

          <div style={{ margin: '10px 0', fontSize: '14px', color: '#666' }}>
            <span style={{ color: jobIsNew ? '#28a745' : '#666', fontWeight: jobIsNew ? 'bold' : 'normal' }}>
              Posted: {formatDate(job.createdAt)}
              {jobIsNew && ' ⚡'}
            </span>
            {job.applicationDeadline && (
              <span style={{ marginLeft: '15px' }}>
                Deadline: {formatDate(job.applicationDeadline)}
              </span>
            )}
            <span style={{ 
              marginLeft: '15px',
              backgroundColor: job.source === 'external' ? '#17a2b8' : '#6c757d',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: '500'
            }}>
              {job.source === 'external' ? '🌐 External' : '🏢 Internal'}
              {job.externalSource && job.externalSource === 'mock_api' ? ' • Demo Data' : job.externalSource && ` • ${job.externalSource}`}
            </span>
          </div>
        </div>

        <div style={{ marginLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {isRecruiterView && user?.role === 'recruiter' ? (
            <>
              <button
                onClick={() => setIsEditing(!isEditing)}
                style={{
                  backgroundColor: isEditing ? '#6c757d' : '#ffc107',
                  color: isEditing ? 'white' : '#212529',
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500'
                }}
              >
                {isEditing ? '❌ Cancel' : '✏️ Edit'}
              </button>
              <button
                onClick={handleDelete}
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500'
                }}
              >
                🗑️ Delete
              </button>
              <div style={{
                padding: '8px',
                backgroundColor: job.status === 'Active' ? '#d4edda' : '#f8d7da',
                borderRadius: '5px',
                fontSize: '12px',
                textAlign: 'center',
                color: job.status === 'Active' ? '#155724' : '#721c24'
              }}>
                {job.status === 'Active' ? '✅ Active' : '❌ Inactive'}
              </div>
              <div style={{
                padding: '8px',
                backgroundColor: '#e3f2fd',
                borderRadius: '5px',
                fontSize: '12px',
                textAlign: 'center',
                color: '#1565c0',
                fontWeight: 'bold'
              }}>
                👥 {applicationCount} Applicants
              </div>
            </>
          ) : (
            <>
              {job.applicationUrl && job.applicationUrl !== '#' && (
                <button
                  onClick={handleApply}
                  disabled={isApplying}
                  style={{
                    backgroundColor: isApplying ? '#6c757d' : (job.source === 'external' ? '#17a2b8' : '#007bff'),
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    border: 'none',
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'inline-block',
                    minWidth: '120px',
                    cursor: isApplying ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isApplying ? '⏳ Applying...' : (job.source === 'external' ? (job.externalSource === 'mock_api' ? '🔍 Search Similar Jobs' : '🌐 Apply External') : '📝 Apply Now')}
                </button>
              )}
              
              {(!job.applicationUrl || job.applicationUrl === '#') && (
                <div style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'inline-block',
                  minWidth: '120px',
                  opacity: 0.6
                }}>
                  No Apply Link
                </div>
              )}
            </>
          )}
          
          {job.views > 0 && (
            <div style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
              👁️ {job.views} views
            </div>
          )}
        </div>
      </div>

      
      {isEditing && (
        <div style={{
          marginTop: '20px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <h4 style={{ marginBottom: '15px', color: '#333' }}>Edit Job</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Title:</label>
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData({...editData, title: e.target.value})}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Company:</label>
              <input
                type="text"
                value={editData.company}
                onChange={(e) => setEditData({...editData, company: e.target.value})}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Location:</label>
              <input
                type="text"
                value={editData.location}
                onChange={(e) => setEditData({...editData, location: e.target.value})}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Status:</label>
              <select
                value={editData.status}
                onChange={(e) => setEditData({...editData, status: e.target.value})}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Description:</label>
            <textarea
              value={editData.description}
              onChange={(e) => setEditData({...editData, description: e.target.value})}
              rows="3"
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleUpdate}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              💾 Save Changes
            </button>
            <button
              onClick={() => setIsEditing(false)}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
  
  async function handleDelete() {
    if (window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      try {
        await deleteJob(token, job._id);
        alert('Job deleted successfully!');
        if (onJobUpdated) onJobUpdated();
      } catch (error) {
        alert('Error deleting job: ' + (error.response?.data?.message || error.message));
      }
    }
  }
  
  async function handleUpdate() {
    try {
      await updateJob(token, job._id, editData);
      alert('Job updated successfully!');
      setIsEditing(false);
      if (onJobUpdated) onJobUpdated();
    } catch (error) {
      alert('Error updating job: ' + (error.response?.data?.message || error.message));
    }
  }
};

export default JobCard;