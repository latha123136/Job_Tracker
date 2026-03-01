import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { loginUser } from '../api/authApi';

const RecruiterLoginPage = () => {
  const { login, setLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginUser(form);
      if (data.user.role !== 'recruiter' && data.user.role !== 'admin') {
        setError('Access denied. This portal is for recruiters and admins only.');
        setLoading(false);
        return;
      }
      login(data.user, data.token);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(-45deg, #1e3a8a, #3730a3, #7c3aed, #be185d)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 15s ease infinite',
      padding: '20px'
    }}>
      <style>
        {`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏢</div>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #1e3a8a, #7c3aed)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px'
          }}>
            Recruiter Portal
          </h2>
          <p style={{ color: '#64748b', fontSize: '16px' }}>
            Sign in to manage job postings
          </p>
        </div>
        
        {error && (
          <div style={{
            marginBottom: '20px',
            padding: '10px',
            background: '#fef2f2',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            color: '#dc2626'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="email"
              name="email"
              placeholder="📧 Recruiter Email"
              value={form.email}
              onChange={onChange}
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '16px',
                background: 'rgba(255, 255, 255, 0.8)'
              }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <input
              type="password"
              name="password"
              placeholder="🔒 Password"
              value={form.password}
              onChange={onChange}
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '16px',
                background: 'rgba(255, 255, 255, 0.8)'
              }}
              required
            />
          </div>
          
          <button 
            type="submit" 
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #1e3a8a, #7c3aed)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Sign In as Recruiter
          </button>
        </form>
        
        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          padding: '20px 0',
          borderTop: '1px solid #e2e8f0'
        }}>
          <p style={{ color: '#64748b', margin: '0 0 10px 0' }}>
            Need a recruiter account?{' '}
            <Link to="/recruiter/register" style={{ color: '#1e3a8a', textDecoration: 'none', fontWeight: '600' }}>
              Register here
            </Link>
          </p>
          <Link to="/login" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px' }}>
            ← Back to User Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecruiterLoginPage;