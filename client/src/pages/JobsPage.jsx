import React, { useState, useEffect } from 'react';
import { getJobs } from '../api/jobsApi';
import JobCard from '../components/JobCard';
import socketService from '../api/socketService';

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [newJobsCount, setNewJobsCount] = useState(0);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);

  useEffect(() => {
    fetchJobs();
    
    // Connect to socket for real-time updates
    if (isRealTimeEnabled) {
      const socket = socketService.connect();
      
      const handleNewJob = (newJob) => {
        if (newJob.status === 'Active') {
          setJobs(prevJobs => [newJob, ...prevJobs]);
          setNewJobsCount(prev => prev + 1);
          
          // Show notification
          if (Notification.permission === 'granted') {
            new Notification('New Job Posted!', {
              body: `${newJob.title} at ${newJob.company}`,
              icon: '/vite.svg'
            });
          }
        }
      };
      
      const handleJobUpdated = (updatedJob) => {
        setJobs(prevJobs => 
          prevJobs.map(job => 
            job._id === updatedJob._id ? updatedJob : job
          )
        );
      };
      
      socketService.onNewJob(handleNewJob);
      socketService.onJobUpdated(handleJobUpdated);
      
      // Request notification permission
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
      
      return () => {
        socketService.offNewJob(handleNewJob);
        socketService.offJobUpdated(handleJobUpdated);
      };
    }
  }, [isRealTimeEnabled]);

  const fetchJobs = async (params = {}) => {
    try {
      setLoading(true);
      const data = await getJobs(params);
      const jobsList = data.jobs || [];
      
      // Sort jobs to show recruiter-added (internal) jobs at the top
      const sortedJobs = jobsList.sort((a, b) => {
        // Internal jobs (added by recruiters) come first
        if (a.source === 'internal' && b.source !== 'internal') return -1;
        if (b.source === 'internal' && a.source !== 'internal') return 1;
        
        // Then sort by creation date (newest first)
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      setJobs(sortedJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const searchParams = {};
    
    if (searchTerm.trim()) {
      searchParams.search = searchTerm.trim();
    }
    if (locationFilter.trim()) {
      searchParams.location = locationFilter.trim();
    }
    if (typeFilter) {
      searchParams.type = typeFilter;
    }
    if (sourceFilter) {
      searchParams.source = sourceFilter;
    }

    fetchJobs(searchParams);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setTypeFilter('');
    setSourceFilter('');
    fetchJobs();
  };

  const resetNewJobsCount = () => {
    setNewJobsCount(0);
  };

  const toggleRealTime = () => {
    setIsRealTimeEnabled(!isRealTimeEnabled);
    if (!isRealTimeEnabled) {
      socketService.disconnect();
    }
  };

  const [showFilters, setShowFilters] = useState(false);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#333', margin: 0 }}>Available Jobs</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {newJobsCount > 0 && (
            <div 
              onClick={resetNewJobsCount}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '20px',
                fontSize: '14px',
                cursor: 'pointer',
                animation: 'pulse 2s infinite'
              }}
            >
              🆕 {newJobsCount} new job{newJobsCount > 1 ? 's' : ''}
            </div>
          )}
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', color: '#666' }}>Real-time updates:</span>
            <button
              onClick={toggleRealTime}
              style={{
                backgroundColor: isRealTimeEnabled ? '#28a745' : '#6c757d',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '15px',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                backgroundColor: isRealTimeEnabled ? '#90EE90' : '#ccc',
                animation: isRealTimeEnabled ? 'blink 1.5s infinite' : 'none'
              }}></span>
              {isRealTimeEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>
      
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0.3; }
          }
        `}
      </style>
      
      {/* Filter Toggle Button */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            backgroundColor: '#f8f9fa',
            color: '#333',
            border: '1px solid #e9ecef',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          🔍 {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Collapsible Search Form */}
      {showFilters && (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px',
          border: '1px solid #e9ecef'
        }}>
          <form onSubmit={handleSearch}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              marginBottom: '15px'
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Job Title or Keywords:
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="e.g. Software Engineer, React, Python"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Location:
                </label>
                <input
                  type="text"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  placeholder="e.g. New York, Remote"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Job Type:
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">All Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Job Source:
                </label>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">All Sources</option>
                  <option value="internal">Internal Jobs</option>
                  <option value="external">External Jobs</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                🔍 Search Jobs
              </button>
              <button
                type="button"
                onClick={clearFilters}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Clear Filters
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Job Listings */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '18px', color: '#666' }}>Loading available jobs...</div>
          <div style={{ marginTop: '10px', color: '#888' }}>Please wait while we fetch the latest opportunities</div>
        </div>
      ) : (
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '20px', 
            padding: '15px 0',
            borderBottom: '2px solid #e9ecef'
          }}>
            <div>
              <h2 style={{ margin: 0, color: '#333', fontSize: '20px' }}>
                {jobs.length} Available Position{jobs.length !== 1 ? 's' : ''}
              </h2>
              <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
                Fresh opportunities updated in real-time
              </p>
            </div>
            {isRealTimeEnabled && (
              <span style={{ 
                fontSize: '12px', 
                color: '#28a745',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: '#f8fff8',
                padding: '8px 12px',
                borderRadius: '15px',
                border: '1px solid #28a745'
              }}>
                <span style={{ 
                  width: '6px', 
                  height: '6px', 
                  borderRadius: '50%', 
                  backgroundColor: '#28a745',
                  animation: 'blink 1.5s infinite'
                }}></span>
                Live updates active
              </span>
            )}
          </div>
          
          {jobs.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 40px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>💼</div>
              <p style={{ fontSize: '20px', color: '#666', marginBottom: '10px' }}>No jobs available right now</p>
              <p style={{ color: '#888', marginBottom: '20px' }}>Check back later for new opportunities or try adjusting your search filters.</p>
              {!showFilters && (
                <button
                  onClick={() => setShowFilters(true)}
                  style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  🔍 Try Search Filters
                </button>
              )}
            </div>
          ) : (
            <div>
              {jobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  onApplicationSubmit={() => {
                    // Refresh applications or show success message
                    console.log('Application submitted successfully');
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobsPage;