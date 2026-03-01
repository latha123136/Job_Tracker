import React, { useState, useEffect } from 'react';
import { interviewsApi } from '../api/interviewsApi';

const PublicInterviewLibraryPage = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    company: '',
    role: '',
    difficulty: '',
    result: '',
    type: ''
  });

  useEffect(() => {
    fetchPublicExperiences();
  }, [filters]);

  const fetchPublicExperiences = async () => {
    try {
      setLoading(true);
      const data = await interviewsApi.getAllPublic(filters);
      setExperiences(data);
    } catch (error) {
      console.error('Error fetching public experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return '#10b981';
      case 'Medium': return '#f59e0b';
      case 'Hard': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getResultColor = (result) => {
    switch (result) {
      case 'Selected': return '#10b981';
      case 'Rejected': return '#ef4444';
      case 'In Progress': return '#f59e0b';
      default: return '#64748b';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-center" style={{ minHeight: '400px' }}>
        <div className="loading"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h1>📚 Public Interview Library</h1>
        <p style={{ color: '#64748b', marginTop: '8px' }}>
          Browse interview experiences shared by the community
        </p>
      </div>

      {/* Filters Section */}
      <div className="card mb-4">
        <div className="card-header">
          <h3>🔍 Search & Filter</h3>
        </div>
        <div className="grid grid-5 gap-4">
          <div className="input-group">
            <label>Company</label>
            <input
              type="text"
              placeholder="Search by company"
              value={filters.company}
              onChange={(e) => setFilters({...filters, company: e.target.value})}
            />
          </div>
          <div className="input-group">
            <label>Role</label>
            <input
              type="text"
              placeholder="Search by role"
              value={filters.role}
              onChange={(e) => setFilters({...filters, role: e.target.value})}
            />
          </div>
          <div className="input-group">
            <label>Difficulty</label>
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          <div className="input-group">
            <label>Result</label>
            <select
              value={filters.result}
              onChange={(e) => setFilters({...filters, result: e.target.value})}
            >
              <option value="">All Results</option>
              <option value="Selected">Selected</option>
              <option value="Rejected">Rejected</option>
              <option value="In Progress">In Progress</option>
            </select>
          </div>
          <div className="input-group">
            <label>Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
            >
              <option value="">All Types</option>
              <option value="On-campus">On-campus</option>
              <option value="Off-campus">Off-campus</option>
              <option value="Referral">Referral</option>
            </select>
          </div>
        </div>
      </div>

      {/* Experiences List */}
      <div className="card">
        <div className="card-header">
          <h3>📝 Public Interview Experiences ({experiences.length})</h3>
        </div>
        {experiences.length === 0 ? (
          <div className="text-center" style={{ padding: '40px', color: '#64748b' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📚</div>
            <h3>No public experiences found!</h3>
            <p>Try adjusting your filters or check back later for new experiences.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {experiences.map((experience) => (
              <div key={experience._id} className="card" style={{ margin: 0 }}>
                <div>
                  <div className="flex gap-4" style={{ alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ margin: 0, color: '#1e293b' }}>
                      {experience.company} - {experience.position}
                    </h3>
                    <span 
                      className="badge"
                      style={{ 
                        background: `${getResultColor(experience.result)}20`,
                        color: getResultColor(experience.result)
                      }}
                    >
                      {experience.result || 'In Progress'}
                    </span>
                    <span 
                      className="badge"
                      style={{ 
                        background: `${getDifficultyColor(experience.difficulty)}20`,
                        color: getDifficultyColor(experience.difficulty)
                      }}
                    >
                      {experience.difficulty}
                    </span>
                    <span className="badge" style={{ background: '#10b98120', color: '#10b981' }}>
                      Public
                    </span>
                  </div>
                  <div style={{ color: '#64748b', marginBottom: '12px' }}>
                    <strong>Type:</strong> {experience.interviewType} | 
                    <strong> Date:</strong> {experience.interviewDate ? new Date(experience.interviewDate).toLocaleDateString() : 'Not specified'} |
                    <strong> Interview Type:</strong> {experience.type || 'Off-campus'}
                    {experience.location && (
                      <><strong> | Location:</strong> {experience.location}</>
                    )}
                  </div>
                  {experience.questions && (
                    <div style={{ marginBottom: '8px' }}>
                      <strong style={{ color: '#1e293b' }}>Questions:</strong>
                      <p style={{ margin: '4px 0', color: '#64748b' }}>{experience.questions}</p>
                    </div>
                  )}
                  {experience.experience && (
                    <div style={{ marginBottom: '8px' }}>
                      <strong style={{ color: '#1e293b' }}>Experience:</strong>
                      <p style={{ margin: '4px 0', color: '#64748b' }}>{experience.experience}</p>
                    </div>
                  )}
                  {experience.feedback && (
                    <div>
                      <strong style={{ color: '#1e293b' }}>Feedback:</strong>
                      <p style={{ margin: '4px 0', color: '#64748b' }}>{experience.feedback}</p>
                    </div>
                  )}
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '12px' }}>
                    Shared by {experience.userId?.name || 'Anonymous'} ({experience.userId?.role || 'User'}) on {new Date(experience.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicInterviewLibraryPage;