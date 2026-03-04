import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RecommendationsPage.css';

const RecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(
        'http://localhost:5000/api/recommendations/jobs',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecommendations(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyToJob = async (jobId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/applications',
        { jobId, status: 'Applied' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Application submitted successfully!');
      fetchRecommendations();
    } catch (error) {
      console.error('Error applying to job:', error);
      alert('Failed to submit application');
    }
  };

  if (loading) return <div className="loading">Finding perfect matches...</div>;

  return (
    <div className="recommendations-page">
      <h1>🎯 Job Recommendations</h1>
      <p className="subtitle">Jobs matched to your skills and experience</p>

      {recommendations.length === 0 ? (
        <div className="no-recommendations">
          <h3>No recommendations available</h3>
          <p>Update your profile with skills and experience to get personalized job recommendations</p>
        </div>
      ) : (
        <div className="recommendations-grid">
          {recommendations.map(({ job, matchScore, matchedSkills, missingSkills }) => (
            <div key={job._id} className="recommendation-card">
              <div className="match-score">
                <div className="score-circle" style={{ 
                  background: `conic-gradient(#27ae60 ${matchScore * 3.6}deg, #ecf0f1 0deg)` 
                }}>
                  <div className="score-inner">
                    <span className="score-value">{matchScore}%</span>
                    <span className="score-label">Match</span>
                  </div>
                </div>
              </div>

              <div className="job-info">
                <h2>{job.title}</h2>
                <h3>{job.company}</h3>
                <div className="job-meta">
                  <span>📍 {job.location}</span>
                  <span>💼 {job.type}</span>
                  <span>🏢 {job.mode}</span>
                </div>

                {job.salary && (
                  <div className="salary">
                    💰 {job.salary.currency} {job.salary.min?.toLocaleString()} - {job.salary.max?.toLocaleString()}
                  </div>
                )}

                <div className="skills-section">
                  <div className="matched-skills">
                    <h4>✅ Matched Skills ({matchedSkills.length})</h4>
                    <div className="skills-tags">
                      {matchedSkills.map(skill => (
                        <span key={skill} className="skill-tag matched">{skill}</span>
                      ))}
                    </div>
                  </div>

                  {missingSkills.length > 0 && (
                    <div className="missing-skills">
                      <h4>📚 Skills to Learn ({missingSkills.length})</h4>
                      <div className="skills-tags">
                        {missingSkills.map(skill => (
                          <span key={skill} className="skill-tag missing">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="card-actions">
                  <button 
                    className="apply-btn"
                    onClick={() => applyToJob(job._id)}
                  >
                    Apply Now
                  </button>
                  <a 
                    href={job.applicationUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="view-btn"
                  >
                    View Details
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendationsPage;
