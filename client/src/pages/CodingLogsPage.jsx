import React, { useState, useEffect } from 'react';
import { codingLogsApi } from '../api/codingLogsApi';

const CodingLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    topic: 'Other',
    status: 'Solved',
    date: new Date().toISOString().split('T')[0]
  });
  const [stats, setStats] = useState(null);

  const topics = ['Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming', 'Sorting', 'Searching', 'Hash Tables', 'Stacks', 'Queues', 'Recursion', 'Backtracking', 'Greedy', 'Math', 'Bit Manipulation', 'Other'];
  const statuses = ['Solved', 'Partially Solved', 'Needs Revision', 'Stuck'];


  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, []);



  const fetchLogs = async () => {
    try {
      const data = await codingLogsApi.getAll();
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await codingLogsApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLog) {
        await codingLogsApi.update(editingLog._id, formData);
      } else {
        await codingLogsApi.create(formData);
      }
      fetchLogs();
      fetchStats();
      resetForm();
    } catch (error) {
      console.error('Error saving log:', error);
    }
  };

  const handleEdit = (log) => {
    setEditingLog(log);
    setFormData({
      title: log.title || '',
      description: log.description || '',
      topic: log.topic || 'Other',
      status: log.status || 'Solved',
      date: log.date ? new Date(log.date).toISOString().split('T')[0] : ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this log?')) {
      try {
        await codingLogsApi.delete(id);
        fetchLogs();
        fetchStats();
      } catch (error) {
        console.error('Error deleting log:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      topic: 'Other',
      status: 'Solved',
      date: new Date().toISOString().split('T')[0]
    });
    setEditingLog(null);
    setShowForm(false);
  };

  const getWeakTopics = () => {
    if (!stats || !stats.topicCounts) return [];
    
    const weakTopics = [];
    Object.keys(stats.topicCounts).forEach(topic => {
      const total = stats.topicCounts[topic];
      const needsRevision = stats.topicNeedsRevision[topic] || 0;
      const revisionRate = needsRevision / total;
      
      if (revisionRate > 0.4 && total >= 2) { // 40% or more need revision and at least 2 problems
        weakTopics.push({ topic, needsRevision, total, revisionRate });
      }
    });
    
    return weakTopics.sort((a, b) => b.revisionRate - a.revisionRate);
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
        <h1>🧑‍💻 Coding Practice Logs</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '❌ Cancel' : '➕ Add New Log'}
        </button>
      </div>

      {/* Weak Topics Analysis */}
      {stats && stats.total > 0 && (
        <div className="card mb-4">
          <div className="card-header">
            <h3>📊 Topic Analysis</h3>
          </div>
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {/* Problems per Topic Chart */}
            <div>
              <h4>Problems per Topic</h4>
              {Object.entries(stats.topicCounts).map(([topic, count]) => (
                <div key={topic} className="flex flex-between" style={{ padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                  <span>{topic}</span>
                  <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>{count}</span>
                </div>
              ))}
            </div>
            
            {/* Weak Topics */}
            <div>
              <h4>⚠️ Topics Needing Attention</h4>
              {getWeakTopics().length > 0 ? (
                <div>
                  <p style={{ color: '#64748b', marginBottom: '12px' }}>You seem weak in topics with high revision rates:</p>
                  {getWeakTopics().map(({ topic, needsRevision, total, revisionRate }) => (
                    <div key={topic} style={{ 
                      padding: '8px 12px', 
                      backgroundColor: '#fef2f2', 
                      border: '1px solid #fecaca', 
                      borderRadius: '6px', 
                      marginBottom: '8px' 
                    }}>
                      <strong style={{ color: '#dc2626' }}>{topic}</strong>: {needsRevision}/{total} need revision ({Math.round(revisionRate * 100)}%)
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#16a34a' }}>🎉 Great job! No weak topics detected.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Logs List */}
      <div className="card mb-4">
        <div className="card-header">
          <h3>📝 Your Coding Logs ({logs.length})</h3>
        </div>
        {logs.length === 0 ? (
          <div className="text-center" style={{ padding: '40px', color: '#64748b' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📝</div>
            <h3>No coding logs yet!</h3>
            <p>Start tracking your coding practice by adding your first log.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {logs.map((log) => (
              <div key={log._id} className="card" style={{ margin: 0 }}>
                <div className="flex flex-between">
                  <div className="flex gap-4" style={{ alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '2rem' }}>
                      💻
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="flex gap-4" style={{ alignItems: 'center', marginBottom: '8px' }}>
                        <h3 style={{ margin: 0, color: '#1e293b' }}>{log.title}</h3>
                      </div>
                      <div style={{ color: '#64748b', marginBottom: '8px' }}>
                        <strong>Date:</strong> {log.date ? new Date(log.date).toLocaleDateString() : 'Not specified'}
                      </div>
                      <div style={{ color: '#64748b', marginBottom: '8px' }}>
                        <strong>Topic:</strong> <span style={{ 
                          backgroundColor: '#e0f2fe', 
                          color: '#0277bd', 
                          padding: '2px 8px', 
                          borderRadius: '12px', 
                          fontSize: '12px' 
                        }}>{log.topic || 'Other'}</span>
                        <strong style={{ marginLeft: '16px' }}>Status:</strong> <span style={{ 
                          backgroundColor: log.status === 'Solved' ? '#e8f5e8' : log.status === 'Needs Revision' ? '#fef2f2' : '#fff3cd', 
                          color: log.status === 'Solved' ? '#2e7d32' : log.status === 'Needs Revision' ? '#d32f2f' : '#f57c00', 
                          padding: '2px 8px', 
                          borderRadius: '12px', 
                          fontSize: '12px' 
                        }}>{log.status || 'Solved'}</span>
                      </div>
                      <div style={{ color: '#64748b', marginBottom: '8px' }}>
                        <p>{log.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleEdit(log)}
                      style={{ padding: '8px 12px', fontSize: '14px' }}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleDelete(log._id)}
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
            <h3>{editingLog ? '✏️ Edit Log' : '➕ Add New Coding Log'}</h3>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., Solved Two Sum Problem"
                required
              />
            </div>
            <div className="input-group">
              <label>Topic</label>
              <select
                value={formData.topic}
                onChange={(e) => setFormData({...formData, topic: e.target.value})}
                required
              >
                {topics.map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                required
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe what you learned or worked on..."
                rows="4"
                required
              />
            </div>
            <div className="input-group">
              <label>Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>
            <div className="flex gap-4">
              <button type="submit" className="btn btn-success">
                {editingLog ? '💾 Update Log' : '➕ Add Log'}
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

export default CodingLogsPage;