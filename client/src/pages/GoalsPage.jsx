import React, { useState, useEffect } from 'react';
import { goalsApi } from '../api/goalsApi';

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Other',
    targetValue: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    priority: 'Medium'
  });

  const categories = ['Coding', 'Applications', 'Interview', 'Other'];
  const priorities = ['Low', 'Medium', 'High'];

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const data = await goalsApi.getWithProgress();
      setGoals(data);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGoal) {
        await goalsApi.update(editingGoal._id, formData);
      } else {
        await goalsApi.create(formData);
      }
      fetchGoals();
      resetForm();
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title || '',
      category: goal.category || 'Other',
      targetValue: goal.targetValue || '',
      startDate: goal.startDate ? new Date(goal.startDate).toISOString().split('T')[0] : '',
      endDate: goal.endDate ? new Date(goal.endDate).toISOString().split('T')[0] : '',
      priority: goal.priority || 'Medium'
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await goalsApi.delete(id);
        fetchGoals();
      } catch (error) {
        console.error('Error deleting goal:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'Other',
      targetValue: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      priority: 'Medium'
    });
    setEditingGoal(null);
    setShowForm(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#dc2626';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#16a34a';
      case 'In Progress': return '#2563eb';
      case 'Not Started': return '#6b7280';
      default: return '#6b7280';
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
        <h1>🎯 Goals & Progress</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '❌ Cancel' : '➕ Add New Goal'}
        </button>
      </div>

      {/* Goals List */}
      <div className="card mb-4">
        <div className="card-header">
          <h3>📋 Your Goals ({goals.length})</h3>
        </div>
        {goals.length === 0 ? (
          <div className="text-center" style={{ padding: '40px', color: '#64748b' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎯</div>
            <h3>No goals set yet!</h3>
            <p>Start by setting your first goal to track your progress.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {goals.map((goal) => (
              <div key={goal._id} className="card" style={{ margin: 0 }}>
                <div className="flex flex-between">
                  <div style={{ flex: 1 }}>
                    <div className="flex gap-4" style={{ alignItems: 'center', marginBottom: '12px' }}>
                      <h3 style={{ margin: 0, color: '#1e293b' }}>{goal.title}</h3>
                      <span style={{
                        backgroundColor: getPriorityColor(goal.priority),
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {goal.priority}
                      </span>
                      <span style={{
                        backgroundColor: getStatusColor(goal.status),
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}>
                        {goal.status}
                      </span>
                    </div>
                    
                    <div style={{ marginBottom: '12px' }}>
                      <div className="flex gap-4" style={{ alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ color: '#64748b' }}>
                          <strong>Category:</strong> {goal.category}
                        </span>
                        <span style={{ color: '#64748b' }}>
                          <strong>Progress:</strong> {goal.calculatedCurrentValue || 0} / {goal.targetValue}
                        </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div style={{
                        width: '100%',
                        height: '8px',
                        backgroundColor: '#e2e8f0',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        marginBottom: '8px'
                      }}>
                        <div style={{
                          width: `${goal.progressPercentage || 0}%`,
                          height: '100%',
                          backgroundColor: goal.status === 'Completed' ? '#16a34a' : '#3b82f6',
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                      
                      <div style={{ fontSize: '14px', color: '#64748b' }}>
                        {Math.round(goal.progressPercentage || 0)}% Complete
                      </div>
                    </div>
                    
                    {(goal.startDate || goal.endDate) && (
                      <div style={{ color: '#64748b', fontSize: '14px' }}>
                        {goal.startDate && <span><strong>Start:</strong> {new Date(goal.startDate).toLocaleDateString()}</span>}
                        {goal.startDate && goal.endDate && <span> | </span>}
                        {goal.endDate && <span><strong>End:</strong> {new Date(goal.endDate).toLocaleDateString()}</span>}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-4">
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleEdit(goal)}
                      style={{ padding: '8px 12px', fontSize: '14px' }}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleDelete(goal._id)}
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
            <h3>{editingGoal ? '✏️ Edit Goal' : '➕ Add New Goal'}</h3>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., Solve 100 coding problems"
                required
              />
            </div>
            <div className="input-group">
              <label>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                required
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>Target Value</label>
              <input
                type="number"
                value={formData.targetValue}
                onChange={(e) => setFormData({...formData, targetValue: e.target.value})}
                placeholder="e.g., 100"
                required
              />
            </div>
            <div className="input-group">
              <label>Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                required
              >
                {priorities.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label>End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
              />
            </div>
            <div className="flex gap-4">
              <button type="submit" className="btn btn-success">
                {editingGoal ? '💾 Update Goal' : '➕ Add Goal'}
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

export default GoalsPage;