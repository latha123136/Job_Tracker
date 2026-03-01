import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import JobCreationForm from '../components/JobCreationForm';
import { getRecruiterJobs } from '../api/jobsApi';
import JobCard from '../components/JobCard';
import { getDashboardSummary } from '../api/dashboardApi';
import { codingLogsApi } from '../api/codingLogsApi';
import { applicationsApi } from '../api/applicationsApi';

const DashboardPage = () => {
  const { user, token } = useContext(AuthContext);
  const [recruiterJobs, setRecruiterJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [codingStats, setCodingStats] = useState(null);
  const [followUpApps, setFollowUpApps] = useState([]);
  const [applicationStats, setApplicationStats] = useState(null);

  useEffect(() => {
    if (user?.role === 'recruiter') {
      fetchRecruiterJobs();
    } else if (user?.role === 'jobseeker') {
      fetchDashboardData();
      fetchCodingStats();
      fetchFollowUps();
      fetchApplicationStats();
    }
  }, [user]);

  const fetchRecruiterJobs = async () => {
    try {
      setLoading(true);
      const jobs = await getRecruiterJobs(token);
      setRecruiterJobs(jobs);
    } catch (error) {
      console.error('Error fetching recruiter jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const data = await getDashboardSummary(token);
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchCodingStats = async () => {
    try {
      const stats = await codingLogsApi.getStats();
      setCodingStats(stats);
    } catch (error) {
      console.error('Error fetching coding stats:', error);
    }
  };

  const fetchFollowUps = async () => {
    try {
      const data = await applicationsApi.getFollowUps();
      setFollowUpApps(data);
    } catch (error) {
      console.error('Error fetching follow-ups:', error);
    }
  };

  const fetchApplicationStats = async () => {
    try {
      const applications = await applicationsApi.getAll();
      const stats = {
        total: applications.length,
        applied: applications.filter(app => app.status === 'Applied').length,
        oa: applications.filter(app => app.status === 'OA').length,
        interview: applications.filter(app => app.status === 'Interview').length,
        offer: applications.filter(app => app.status === 'Offer').length,
        rejected: applications.filter(app => app.status === 'Rejected').length
      };
      setApplicationStats(stats);
    } catch (error) {
      console.error('Error fetching application stats:', error);
    }
  };

  const markFollowUpDone = async (appId) => {
    try {
      await applicationsApi.update(appId, { reminderStatus: 'Done' });
      fetchFollowUps(); // Refresh follow-ups
    } catch (error) {
      console.error('Failed to mark follow-up as done:', error);
    }
  };

  const getWeakTopics = () => {
    if (!codingStats || !codingStats.topicCounts) return [];
    
    const weakTopics = [];
    Object.keys(codingStats.topicCounts).forEach(topic => {
      const total = codingStats.topicCounts[topic];
      const needsRevision = codingStats.topicNeedsRevision[topic] || 0;
      const revisionRate = needsRevision / total;
      
      if (revisionRate > 0.4 && total >= 2) {
        weakTopics.push({ topic, needsRevision, total, revisionRate });
      }
    });
    
    return weakTopics.sort((a, b) => b.revisionRate - a.revisionRate);
  };

  const handleJobCreated = (newJob) => {
    setRecruiterJobs(prev => [newJob, ...prev]);
    setShowJobForm(false);
  };

  if (user?.role === 'recruiter') {
    return (
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ margin: 0, color: '#333' }}>Recruiter Dashboard</h1>
            <p style={{ color: '#666', margin: '5px 0 0 0' }}>Welcome back, {user?.name}!</p>
          </div>
          <button
            onClick={() => setShowJobForm(!showJobForm)}
            style={{
              backgroundColor: showJobForm ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            {showJobForm ? '❌ Cancel' : '➕ Post New Job'}
          </button>
        </div>

        {showJobForm && (
          <div style={{ marginBottom: '30px' }}>
            <JobCreationForm onJobCreated={handleJobCreated} />
          </div>
        )}

        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#333', marginBottom: '20px' }}>Your Posted Jobs ({recruiterJobs.length})</h2>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '18px', color: '#666' }}>Loading your jobs...</div>
            </div>
          ) : recruiterJobs.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 40px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>💼</div>
              <p style={{ fontSize: '20px', color: '#666', marginBottom: '10px' }}>No jobs posted yet</p>
              <p style={{ color: '#888', marginBottom: '20px' }}>Start by creating your first job posting!</p>
              <button
                onClick={() => setShowJobForm(true)}
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                ➕ Post Your First Job
              </button>
            </div>
          ) : (
            <div>
              {recruiterJobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  isRecruiterView={true}
                  onJobUpdated={fetchRecruiterJobs}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Job seeker dashboard
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ color: '#333', marginBottom: '10px' }}>Dashboard</h1>
          <p style={{ color: '#666', margin: 0 }}>Welcome back, {user?.name}!</p>
        </div>
        {dashboardData && (
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '12px',
            border: '2px solid #007bff',
            textAlign: 'center',
            minWidth: '200px'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#007bff', marginBottom: '5px' }}>
              {dashboardData.readinessScore}%
            </div>
            <div style={{ fontSize: '14px', color: '#666', fontWeight: '600' }}>
              Placement Readiness Score
            </div>
          </div>
        )}
      </div>
      
      {applicationStats && (
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #e9ecef',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '30px'
        }}>
          <h3 style={{ color: '#333', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
            📊 Application Statistics
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
            gap: '15px',
            marginBottom: '20px'
          }}>
            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#007bff', marginBottom: '5px' }}>
                {applicationStats.total}
              </div>
              <div style={{ fontSize: '12px', color: '#666', fontWeight: '600' }}>Total Applied</div>
            </div>
            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1976d2', marginBottom: '5px' }}>
                {applicationStats.applied}
              </div>
              <div style={{ fontSize: '12px', color: '#666', fontWeight: '600' }}>Applied</div>
            </div>
            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#fff3e0', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f57c00', marginBottom: '5px' }}>
                {applicationStats.oa}
              </div>
              <div style={{ fontSize: '12px', color: '#666', fontWeight: '600' }}>OA</div>
            </div>
            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f3e5f5', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#7b1fa2', marginBottom: '5px' }}>
                {applicationStats.interview}
              </div>
              <div style={{ fontSize: '12px', color: '#666', fontWeight: '600' }}>Interview</div>
            </div>
            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#388e3c', marginBottom: '5px' }}>
                {applicationStats.offer}
              </div>
              <div style={{ fontSize: '12px', color: '#666', fontWeight: '600' }}>Offer</div>
            </div>
            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#ffebee', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d32f2f', marginBottom: '5px' }}>
                {applicationStats.rejected}
              </div>
              <div style={{ fontSize: '12px', color: '#666', fontWeight: '600' }}>Rejected</div>
            </div>
          </div>
          
          {applicationStats.total > 0 && (
            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
              <div style={{ fontSize: '14px', color: '#0369a1', marginBottom: '5px' }}>
                Success Rate: {Math.round((applicationStats.offer / applicationStats.total) * 100)}% • 
                Interview Rate: {Math.round(((applicationStats.interview + applicationStats.offer) / applicationStats.total) * 100)}%
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Follow-up Reminders */}
      {followUpApps.length > 0 && (
        <div style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '30px'
        }}>
          <h3 style={{ color: '#856404', marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
            🔔 Follow-up Reminders ({followUpApps.length})
          </h3>
          <p style={{ color: '#856404', marginBottom: '15px', fontSize: '14px' }}>
            You have applications that need follow-up today:
          </p>
          <div style={{ display: 'grid', gap: '12px' }}>
            {followUpApps.map(app => (
              <div key={app._id} style={{
                backgroundColor: 'white',
                padding: '15px',
                borderRadius: '8px',
                border: '1px solid #ffeaa7',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>
                    {app.jobId?.title || 'Unknown Position'} at {app.jobId?.company || 'Unknown Company'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    Follow-up due: {new Date(app.followUpDate).toLocaleDateString()}
                    {app.jobId?.location && ` • ${app.jobId.location}`}
                  </div>
                </div>
                <button 
                  onClick={() => markFollowUpDone(app._id)}
                  style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  ✓ Mark Done
                </button>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '15px', textAlign: 'center' }}>
            <a 
              href="/applications" 
              style={{
                color: '#856404',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              View All Applications →
            </a>
          </div>
        </div>
      )}
      
      {/* Coding Weak Topics Analysis */}
      {codingStats && codingStats.total > 0 && (
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #e9ecef',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '30px'
        }}>
          <h3 style={{ color: '#333', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
            📊 Coding Topics Analysis
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {/* Problems per Topic */}
            <div>
              <h4 style={{ color: '#666', marginBottom: '15px' }}>Problems per Topic</h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {Object.entries(codingStats.topicCounts)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([topic, count]) => (
                  <div key={topic} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '1px solid #f1f3f4'
                  }}>
                    <span style={{ color: '#333' }}>{topic}</span>
                    <span style={{ 
                      fontWeight: 'bold', 
                      color: '#007bff',
                      backgroundColor: '#e3f2fd',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Weak Topics */}
            <div>
              <h4 style={{ color: '#666', marginBottom: '15px' }}>⚠️ Topics Needing Attention</h4>
              {getWeakTopics().length > 0 ? (
                <div>
                  <p style={{ color: '#666', fontSize: '14px', marginBottom: '12px' }}>
                    You seem weak in topics with high revision rates:
                  </p>
                  {getWeakTopics().slice(0, 3).map(({ topic, needsRevision, total, revisionRate }) => (
                    <div key={topic} style={{
                      padding: '10px 12px',
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '8px',
                      marginBottom: '8px'
                    }}>
                      <div style={{ fontWeight: 'bold', color: '#dc2626', marginBottom: '4px' }}>
                        {topic}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {needsRevision}/{total} need revision ({Math.round(revisionRate * 100)}%)
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  padding: '20px',
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎉</div>
                  <p style={{ color: '#0369a1', margin: 0, fontSize: '14px' }}>
                    Great job! No weak topics detected.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        <div style={{ 
          border: '1px solid #e9ecef', 
          padding: '30px', 
          borderRadius: '12px',
          backgroundColor: '#f8f9fa',
          textAlign: 'center',
          transition: 'transform 0.2s ease'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>💻</div>
          <h3 style={{ color: '#333', marginBottom: '10px' }}>Coding Logs</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>Track your coding practice and progress</p>
          {codingStats && codingStats.total > 0 && (
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '15px' }}>
              {codingStats.total} problems logged
            </div>
          )}
          <a href="/coding-logs" style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600'
          }}>View Logs</a>
        </div>
        
        <div style={{ 
          border: '1px solid #e9ecef', 
          padding: '30px', 
          borderRadius: '12px',
          backgroundColor: '#f8f9fa',
          textAlign: 'center',
          transition: 'transform 0.2s ease'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎯</div>
          <h3 style={{ color: '#333', marginBottom: '10px' }}>Interviews</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>Log and track your interview experiences</p>
          <a href="/interviews" style={{
            backgroundColor: '#28a745',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600'
          }}>View Interviews</a>
        </div>
        
        <div style={{ 
          border: '1px solid #e9ecef', 
          padding: '30px', 
          borderRadius: '12px',
          backgroundColor: '#f8f9fa',
          textAlign: 'center',
          transition: 'transform 0.2s ease'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>💼</div>
          <h3 style={{ color: '#333', marginBottom: '10px' }}>Job Search</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>Browse and apply to available positions</p>
          <a href="/jobs" style={{
            backgroundColor: '#6f42c1',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600'
          }}>Browse Jobs</a>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;