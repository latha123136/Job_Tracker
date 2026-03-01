import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { registerUser } from '../api/authApi';

const RecruiterRegisterPage = () => {
  const { login, setLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    company: '', 
    position: '', 
    role: 'recruiter' 
  });
  const [error, setError] = useState('');

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await registerUser(form);
      login(data.user, data.token);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
        maxWidth: '450px',
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
            Join as Recruiter
          </h2>
          <p style={{ color: '#64748b', fontSize: '16px' }}>
            Create your recruiter account
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
              type="text"
              name="name"
              placeholder="👤 Full Name"
              value={form.name}
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
              type="email"
              name="email"
              placeholder="📧 Work Email"
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
          
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              name="company"
              placeholder="🏢 Company Name"
              value={form.company}
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
              type="text"
              name="position"
              placeholder="💼 Your Position"
              value={form.position}
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
            Create Recruiter Account
          </button>
        </form>
        
        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          padding: '20px 0',
          borderTop: '1px solid #e2e8f0'
        }}>
          <p style={{ color: '#64748b', margin: '0 0 10px 0' }}>
            Already have an account?{' '}
            <Link to="/recruiter/login" style={{ color: '#1e3a8a', textDecoration: 'none', fontWeight: '600' }}>
              Sign in here
            </Link>
          </p>
          <Link to="/register" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px' }}>
            ← Register as Job Seeker
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecruiterRegisterPage;