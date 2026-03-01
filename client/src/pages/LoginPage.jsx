import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { loginUser } from '../api/authApi';

const LoginPage = () => {
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
      console.log('Attempting login with:', form);
      const data = await loginUser(form);
      console.log('Login successful:', data);
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Please make sure the backend is running on port 5000.');
      } else {
        console.error('Login failed:', err);
      setError(err.response?.data?.message || err.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #f5576c)',
    backgroundSize: '400% 400%',
    animation: 'gradientShift 15s ease infinite',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden'
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    position: 'relative',
    zIndex: 2
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '30px'
  };

  const titleStyle = {
    fontSize: '28px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '8px'
  };

  const subtitleStyle = {
    color: '#64748b',
    fontSize: '16px'
  };

  const inputGroupStyle = {
    marginBottom: '20px'
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    background: 'rgba(255, 255, 255, 0.8)'
  };

  const buttonStyle = {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '10px'
  };

  const linkContainerStyle = {
    textAlign: 'center',
    marginTop: '24px',
    padding: '20px 0',
    borderTop: '1px solid #e2e8f0'
  };

  const linkStyle = {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '600'
  };

  return (
    <>
      <style>
        {`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          .floating-shape {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
            animation: float 6s ease-in-out infinite;
          }
        `}
      </style>
      <div style={containerStyle}>
        <div className="floating-shape" style={{
          width: '120px',
          height: '120px',
          top: '15%',
          left: '15%',
          animationDelay: '0s'
        }}></div>
        <div className="floating-shape" style={{
          width: '80px',
          height: '80px',
          top: '60%',
          right: '20%',
          animationDelay: '3s'
        }}></div>
        <div className="floating-shape" style={{
          width: '60px',
          height: '60px',
          top: '25%',
          right: '15%',
          animationDelay: '1.5s'
        }}></div>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
          <h2 style={titleStyle}>Welcome Back</h2>
          <p style={subtitleStyle}>Sign in to your JobTracker account</p>
        </div>
        
        {error && (
          <div className="error" style={{ marginBottom: '20px' }}>
            {error}
          </div>
        )}
        
        <form onSubmit={onSubmit}>
          <div style={inputGroupStyle}>
            <input
              type="email"
              name="email"
              placeholder="📧 Email address"
              value={form.email}
              onChange={onChange}
              style={inputStyle}
              required
            />
          </div>
          
          <div style={inputGroupStyle}>
            <input
              type="password"
              name="password"
              placeholder="🔒 Password"
              value={form.password}
              onChange={onChange}
              style={inputStyle}
              required
            />
          </div>
          
          <button 
            type="submit" 
            style={buttonStyle}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 10px 20px rgba(102, 126, 234, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Sign In
          </button>
        </form>
        
        <div style={linkContainerStyle}>
          <p style={{ color: '#64748b', margin: '0 0 10px 0' }}>
            Don't have an account?{' '}
            <Link to="/register" style={linkStyle}>
              Create one here
            </Link>
          </p>
          <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
            Are you a recruiter?{' '}
            <Link to="/recruiter/login" style={{ ...linkStyle, fontSize: '14px' }}>
              Recruiter Portal →
            </Link>
          </p>
        </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
