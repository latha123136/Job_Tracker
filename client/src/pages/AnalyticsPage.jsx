import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AnalyticsPage.css';

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const { data } = await axios.get(
        `http://localhost:5000/api/analytics/applications?timeRange=${timeRange}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:5000/api/analytics/export/csv',
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'applications.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  if (loading) return <div className="loading">Loading analytics...</div>;
  if (!analytics) return <div>No data available</div>;

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h1>Application Analytics</h1>
        <div className="analytics-controls">
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
          <button onClick={exportToCSV} className="export-btn">
            📊 Export CSV
          </button>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="stat-card">
          <h3>Total Applications</h3>
          <div className="stat-value">{analytics.totalApplications}</div>
        </div>

        <div className="stat-card">
          <h3>Success Rate</h3>
          <div className="stat-value">{analytics.successRate}%</div>
        </div>

        <div className="stat-card">
          <h3>Interviews</h3>
          <div className="stat-value">{analytics.byStatus.Interview || 0}</div>
        </div>

        <div className="stat-card">
          <h3>Offers</h3>
          <div className="stat-value">{analytics.byStatus.Offer || 0}</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Applications by Status</h3>
          <div className="chart-content">
            {Object.entries(analytics.byStatus).map(([status, count]) => (
              <div key={status} className="bar-item">
                <span className="bar-label">{status}</span>
                <div className="bar-container">
                  <div 
                    className="bar-fill" 
                    style={{ width: `${(count / analytics.totalApplications) * 100}%` }}
                  />
                  <span className="bar-value">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3>Applications by Job Type</h3>
          <div className="chart-content">
            {Object.entries(analytics.byJobType).map(([type, count]) => (
              <div key={type} className="bar-item">
                <span className="bar-label">{type}</span>
                <div className="bar-container">
                  <div 
                    className="bar-fill" 
                    style={{ width: `${(count / analytics.totalApplications) * 100}%` }}
                  />
                  <span className="bar-value">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3>Applications by Mode</h3>
          <div className="chart-content">
            {Object.entries(analytics.byMode).map(([mode, count]) => (
              <div key={mode} className="bar-item">
                <span className="bar-label">{mode}</span>
                <div className="bar-container">
                  <div 
                    className="bar-fill" 
                    style={{ width: `${(count / analytics.totalApplications) * 100}%` }}
                  />
                  <span className="bar-value">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3>Top Companies</h3>
          <div className="chart-content">
            {Object.entries(analytics.topCompanies)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([company, count]) => (
                <div key={company} className="bar-item">
                  <span className="bar-label">{company}</span>
                  <div className="bar-container">
                    <div 
                      className="bar-fill" 
                      style={{ width: `${(count / analytics.totalApplications) * 100}%` }}
                    />
                    <span className="bar-value">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
