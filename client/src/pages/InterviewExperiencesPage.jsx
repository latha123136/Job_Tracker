import React, { useState, useEffect } from 'react';
import { interviewsApi } from '../api/interviewsApi';

const InterviewExperiencesPage = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    interviewDate: new Date().toISOString().split('T')[0],
    interviewType: 'Technical',
    difficulty: 'Medium',
    outcome: 'Pending',
    questions: '',
    experience: '',
    feedback: '',
    type: 'Off-campus',
    location: '',
    result: 'In Progress',
    visibility: 'Private'
  });

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const data = await interviewsApi.getAll();
      setExperiences(data);
    } catch (error) {
      console.error('Error fetching experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingExperience) {
        await interviewsApi.update(editingExperience._id, formData);
      } else {
        await interviewsApi.create(formData);
      }
      fetchExperiences();
      resetForm();
    } catch (error) {
      console.error('Error saving experience:', error);
    }
  };

  const handleEdit = (experience) => {
    setEditingExperience(experience);
    setFormData({
      company: experience.company || '',
      position: experience.position || '',
      interviewDate: experience.interviewDate ? new Date(experience.interviewDate).toISOString().split('T')[0] : '',
      interviewType: experience.interviewType || 'Technical',
      difficulty: experience.difficulty || 'Medium',
      outcome: experience.outcome || 'Pending',
      questions: experience.questions || '',
      experience: experience.experience || '',
      feedback: experience.feedback || '',
      type: experience.type || 'Off-campus',
      location: experience.location || '',
      result: experience.result || 'In Progress',
      visibility: experience.visibility || 'Private'
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this interview experience?')) {
      try {
        await interviewsApi.delete(id);
        fetchExperiences();
      } catch (error) {
        console.error('Error deleting experience:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      company: '',
      position: '',
      interviewDate: new Date().toISOString().split('T')[0],
      interviewType: 'Technical',
      difficulty: 'Medium',
      outcome: 'Pending',
      questions: '',
      experience: '',
      feedback: '',
      type: 'Off-campus',
      location: '',
      result: 'In Progress',
      visibility: 'Private'
    });
    setEditingExperience(null);
    setShowForm(false);
  };

  const getOutcomeColor = (outcome) => {
    switch (outcome) {
      case 'Selected': return '#10b981';
      case 'Rejected': return '#ef4444';
      case 'Pending': return '#f59e0b';
      default: return '#64748b';
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

  if (loading) {
    return (
      <div className="flex flex-center" style={{ minHeight: '400px' }}>
        <div className="loading"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-between mb-4">
        <h1>🎯 Interview Experiences</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '❌ Cancel' : '➕ Add Experience'}
        </button>
      </div>

      {/* Experiences List */}
      <div className="card mb-4">
        <div className="card-header">
          <h3>📝 Your Interview Experiences ({experiences.length})</h3>
        </div>
        {experiences.length === 0 ? (
          <div className="text-center" style={{ padding: '40px', color: '#64748b' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎯</div>
            <h3>No interview experiences yet!</h3>
            <p>Start tracking your interview journey by adding your first experience.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {experiences.map((experience) => (
              <div key={experience._id} className="card" style={{ margin: 0 }}>
                <div className="flex flex-between">
                  <div style={{ flex: 1 }}>
                    <div className="flex gap-4" style={{ alignItems: 'center', marginBottom: '12px' }}>
                      <h3 style={{ margin: 0, color: '#1e293b' }}>
                        {experience.company} - {experience.position}
                      </h3>
                      <span 
                        className="badge"
                        style={{ 
                          background: `${getOutcomeColor(experience.outcome)}20`,
                          color: getOutcomeColor(experience.outcome)
                        }}
                      >
                        {experience.outcome}
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
                    </div>
                    <div style={{ color: '#64748b', marginBottom: '12px' }}>
                      <strong>Type:</strong> {experience.interviewType} | 
                      <strong> Date:</strong> {experience.interviewDate ? new Date(experience.interviewDate).toLocaleDateString() : 'Not specified'} |
                      <strong> Interview Type:</strong> {experience.type || 'Off-campus'} |
                      <strong> Result:</strong> {experience.result || 'In Progress'}
                      {experience.location && (
                        <><strong> | Location:</strong> {experience.location}</>
                      )}
                      <span 
                        className="badge"
                        style={{ 
                          marginLeft: '8px',
                          background: experience.visibility === 'Public' ? '#10b98120' : '#64748b20',
                          color: experience.visibility === 'Public' ? '#10b981' : '#64748b'
                        }}
                      >
                        {experience.visibility || 'Private'}
                      </span>
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
                  </div>
                  <div className="flex gap-4">
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleEdit(experience)}
                      style={{ padding: '8px 12px', fontSize: '14px' }}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleDelete(experience._id)}
                      style={{ padding: '8px 12px', fontSize: '14px' }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-header">
            <h3>{editingExperience ? '✏️ Edit Experience' : '➕ Add Interview Experience'}</h3>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2 gap-4">
              <div className="input-group">
                <label>Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  placeholder="e.g., Google, Microsoft"
                  required
                />
              </div>
              <div className="input-group">
                <label>Position</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                  placeholder="e.g., Software Engineer, Frontend Developer"
                  required
                />
              </div>
              <div className="input-group">
                <label>Interview Date</label>
                <input
                  type="date"
                  value={formData.interviewDate}
                  onChange={(e) => setFormData({...formData, interviewDate: e.target.value})}
                />
              </div>
              <div className="input-group">
                <label>Interview Type</label>
                <select
                  value={formData.interviewType}
                  onChange={(e) => setFormData({...formData, interviewType: e.target.value})}
                >
                  <option value="Technical">Technical</option>
                  <option value="Behavioral">Behavioral</option>
                  <option value="System Design">System Design</option>
                  <option value="HR">HR</option>
                  <option value="Final">Final</option>
                </select>
              </div>
              <div className="input-group">
                <label>Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div className="input-group">
                <label>Outcome</label>
                <select
                  value={formData.outcome}
                  onChange={(e) => setFormData({...formData, outcome: e.target.value})}
                >
                  <option value="Pending">Pending</option>
                  <option value="Selected">Selected</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div className="input-group">
                <label>Interview Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="Off-campus">Off-campus</option>
                  <option value="On-campus">On-campus</option>
                  <option value="Referral">Referral</option>
                </select>
              </div>
              <div className="input-group">
                <label>Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="e.g., Remote, Bangalore, New York"
                />
              </div>
              <div className="input-group">
                <label>Result</label>
                <select
                  value={formData.result}
                  onChange={(e) => setFormData({...formData, result: e.target.value})}
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Selected">Selected</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
            <div className="input-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={formData.visibility === 'Public'}
                  onChange={(e) => setFormData({...formData, visibility: e.target.checked ? 'Public' : 'Private'})}
                />
                Make this experience public (others can see it in the public library)
              </label>
            </div>
            <div className="input-group">
              <label>Questions Asked</label>
              <textarea
                value={formData.questions}
                onChange={(e) => setFormData({...formData, questions: e.target.value})}
                placeholder="List the questions that were asked during the interview..."
                rows="4"
              />
            </div>
            <div className="input-group">
              <label>Interview Experience</label>
              <textarea
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})}
                placeholder="Describe your overall interview experience..."
                rows="4"
              />
            </div>
            <div className="input-group">
              <label>Feedback/Notes</label>
              <textarea
                value={formData.feedback}
                onChange={(e) => setFormData({...formData, feedback: e.target.value})}
                placeholder="Any feedback received or personal notes..."
                rows="3"
              />
            </div>
            <div className="flex gap-4">
              <button type="submit" className="btn btn-success">
                {editingExperience ? '💾 Update Experience' : '➕ Add Experience'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                ❌ Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default InterviewExperiencesPage;