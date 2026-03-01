import React, { useState, useEffect } from 'react';
import { applicationsApi } from '../api/applicationsApi';
import './ApplicationsBoardPage.css';

const ApplicationsBoardPage = () => {
  const [applications, setApplications] = useState([]);
  const [followUpApps, setFollowUpApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingApp, setEditingApp] = useState(null);

  const columns = ['Applied', 'OA', 'Interview', 'Offer', 'Rejected'];

  useEffect(() => {
    fetchApplications();
    fetchFollowUps();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await applicationsApi.getAll();
      setApplications(data);
    } catch (err) {
      setError('Failed to fetch applications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowUps = async () => {
    try {
      const data = await applicationsApi.getFollowUps();
      setFollowUpApps(data);
    } catch (err) {
      console.error('Failed to fetch follow-ups:', err);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const updatedApp = await applicationsApi.update(appId, { status: newStatus });
      setApplications(prev => 
        prev.map(app => app._id === appId ? updatedApp : app)
      );
    } catch (err) {
      setError('Failed to update application status');
      console.error(err);
    }
  };

  const handleFollowUpUpdate = async (appId, followUpDate) => {
    try {
      const updatedApp = await applicationsApi.update(appId, { 
        followUpDate, 
        reminderStatus: followUpDate ? 'Pending' : 'None' 
      });
      setApplications(prev => 
        prev.map(app => app._id === appId ? updatedApp : app)
      );
      fetchFollowUps(); // Refresh follow-ups
    } catch (err) {
      setError('Failed to update follow-up date');
      console.error(err);
    }
  };

  const markFollowUpDone = async (appId) => {
    try {
      const updatedApp = await applicationsApi.update(appId, { reminderStatus: 'Done' });
      setApplications(prev => 
        prev.map(app => app._id === appId ? updatedApp : app)
      );
      fetchFollowUps(); // Refresh follow-ups
    } catch (err) {
      setError('Failed to mark follow-up as done');
      console.error(err);
    }
  };

  const getApplicationsByStatus = (status) => {
    return applications.filter(app => app.status === status);
  };

  const getColumnColor = (status) => {
    const colors = {
      'Applied': '#e3f2fd',
      'OA': '#fff3e0', 
      'Interview': '#f3e5f5',
      'Offer': '#e8f5e8',
      'Rejected': '#ffebee'
    };
    return colors[status] || '#f5f5f5';
  };

  if (loading) return <div className="loading">Loading applications...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="applications-board">
      <h1>Applications Board</h1>
      
      {/* Follow-up Reminders Section */}
      {followUpApps.length > 0 && (
        <div className="follow-up-section" style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <h3 style={{ color: '#856404', margin: '0 0 12px 0' }}>🔔 Follow up today on these applications:</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {followUpApps.map(app => (
              <div key={app._id} style={{
                backgroundColor: 'white',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #ffeaa7',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <strong>{app.jobId?.title || 'Unknown Position'}</strong> at {app.jobId?.company || 'Unknown Company'}
                  <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                    Follow-up due: {new Date(app.followUpDate).toLocaleDateString()}
                  </div>
                </div>
                <button 
                  onClick={() => markFollowUpDone(app._id)}
                  style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  ✓ Mark Done
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="kanban-board">
        {columns.map(status => (
          <div key={status} className="kanban-column" style={{ backgroundColor: getColumnColor(status) }}>
            <div className="column-header">
              <h3>{status}</h3>
              <span className="count">{getApplicationsByStatus(status).length}</span>
            </div>
            <div className="column-content">
              {getApplicationsByStatus(status).map(app => (
                <div key={app._id} className="application-card">
                  <h4>{app.jobId?.title || 'Unknown Position'}</h4>
                  <p className="company">{app.jobId?.company || 'Unknown Company'}</p>
                  <p className="location">{app.jobId?.location || 'Unknown Location'}</p>
                  <p className="date">Applied: {new Date(app.appliedDate).toLocaleDateString()}</p>
                  {app.notes && <p className="notes">{app.notes}</p>}
                  
                  {/* Follow-up Date Section */}
                  <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                    <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>
                      Follow-up Date:
                    </label>
                    <input
                      type="date"
                      value={app.followUpDate ? new Date(app.followUpDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleFollowUpUpdate(app._id, e.target.value || null)}
                      style={{
                        width: '100%',
                        padding: '4px',
                        fontSize: '12px',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                    {app.followUpDate && (
                      <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                        Status: {app.reminderStatus || 'None'}
                        {app.reminderStatus === 'Pending' && new Date(app.followUpDate) <= new Date() && (
                          <span style={{ color: '#dc3545', fontWeight: 'bold' }}> (Due!)</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <select 
                    value={app.status} 
                    onChange={(e) => handleStatusChange(app._id, e.target.value)}
                    className="status-select"
                  >
                    {columns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApplicationsBoardPage;