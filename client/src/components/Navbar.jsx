import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Notifications from './Notifications';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navStyle = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    padding: '16px 24px',
    borderBottom: '1px solid rgba(226, 232, 240, 0.3)',
    marginBottom: '0',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 1000
  };

  const containerStyle = {
    width: '100%',
    padding: '0 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const leftSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '32px'
  };

  const logoStyle = {
    fontSize: '26px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textDecoration: 'none',
    letterSpacing: '-0.5px',
    transition: 'all 0.3s ease'
  };

  const navLinksStyle = {
    display: 'flex',
    gap: '32px',
    alignItems: 'center'
  };

  const linkStyle = (path) => ({
    padding: '10px 18px',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    background: location.pathname === path ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent',
    color: location.pathname === path ? 'white' : '#64748b',
    transform: location.pathname === path ? 'translateY(-2px)' : 'none',
    boxShadow: location.pathname === path ? '0 8px 25px rgba(102, 126, 234, 0.4)' : 'none',
    border: location.pathname === path ? 'none' : '1px solid transparent'
  });

  const userSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  };

  const userNameStyle = {
    fontWeight: '600',
    color: '#1e293b',
    padding: '10px 18px',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
    borderRadius: '25px',
    fontSize: '14px',
    border: '1px solid rgba(102, 126, 234, 0.2)',
    backdropFilter: 'blur(10px)'
  };

  const logoutBtnStyle = {
    padding: '10px 18px',
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontSize: '14px',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
  };

  return (
    <nav style={navStyle}>
      <div style={containerStyle}>
        <div style={leftSectionStyle}>
          <Link 
            to="/" 
            style={logoStyle}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          >
            🚀 JobTracker
          </Link>
          
          {user && (
            <div style={navLinksStyle}>
              <Link 
                to="/dashboard" 
                style={linkStyle('/dashboard')}
                onMouseEnter={(e) => {
                  if (location.pathname !== '/dashboard') {
                    e.target.style.background = 'rgba(102, 126, 234, 0.1)';
                    e.target.style.color = '#667eea';
                    e.target.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (location.pathname !== '/dashboard') {
                    e.target.style.background = 'transparent';
                    e.target.style.color = '#64748b';
                    e.target.style.transform = 'translateY(0)';
                  }
                }}
              >
                📊 Dashboard
              </Link>

              {user.role !== 'recruiter' && (
                <>
                  <Link 
                    to="/applications" 
                    style={linkStyle('/applications')}
                    onMouseEnter={(e) => {
                      if (location.pathname !== '/applications') {
                        e.target.style.background = 'rgba(102, 126, 234, 0.1)';
                        e.target.style.color = '#667eea';
                        e.target.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (location.pathname !== '/applications') {
                        e.target.style.background = 'transparent';
                        e.target.style.color = '#64748b';
                        e.target.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    📋 Applications
                  </Link>
                  <Link 
                    to="/recommendations" 
                    style={linkStyle('/recommendations')}
                    onMouseEnter={(e) => {
                      if (location.pathname !== '/recommendations') {
                        e.target.style.background = 'rgba(102, 126, 234, 0.1)';
                        e.target.style.color = '#667eea';
                        e.target.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (location.pathname !== '/recommendations') {
                        e.target.style.background = 'transparent';
                        e.target.style.color = '#64748b';
                        e.target.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    🎯 Recommendations
                  </Link>
                  <Link 
                    to="/analytics" 
                    style={linkStyle('/analytics')}
                    onMouseEnter={(e) => {
                      if (location.pathname !== '/analytics') {
                        e.target.style.background = 'rgba(102, 126, 234, 0.1)';
                        e.target.style.color = '#667eea';
                        e.target.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (location.pathname !== '/analytics') {
                        e.target.style.background = 'transparent';
                        e.target.style.color = '#64748b';
                        e.target.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    📈 Analytics
                  </Link>
                  <Link 
                    to="/messages" 
                    style={linkStyle('/messages')}
                    onMouseEnter={(e) => {
                      if (location.pathname !== '/messages') {
                        e.target.style.background = 'rgba(102, 126, 234, 0.1)';
                        e.target.style.color = '#667eea';
                        e.target.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (location.pathname !== '/messages') {
                        e.target.style.background = 'transparent';
                        e.target.style.color = '#64748b';
                        e.target.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    💬 Messages
                  </Link>
                  <Link 
                    to="/goals" 
                    style={linkStyle('/goals')}
                    onMouseEnter={(e) => {
                      if (location.pathname !== '/goals') {
                        e.target.style.background = 'rgba(102, 126, 234, 0.1)';
                        e.target.style.color = '#667eea';
                        e.target.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (location.pathname !== '/goals') {
                        e.target.style.background = 'transparent';
                        e.target.style.color = '#64748b';
                        e.target.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    🎯 Goals
                  </Link>
                </>
              )}

              {user.role === 'recruiter' && (
                <Link 
                  to="/jobs" 
                  style={linkStyle('/jobs')}
                  onMouseEnter={(e) => {
                    if (location.pathname !== '/jobs') {
                      e.target.style.background = 'rgba(102, 126, 234, 0.1)';
                      e.target.style.color = '#667eea';
                      e.target.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (location.pathname !== '/jobs') {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#64748b';
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  💼 All Jobs
                </Link>
              )}
              
              {user.role === 'admin' && (
                <Link 
                  to="/admin" 
                  style={linkStyle('/admin')}
                  onMouseEnter={(e) => {
                    if (location.pathname !== '/admin') {
                      e.target.style.background = 'rgba(102, 126, 234, 0.1)';
                      e.target.style.color = '#667eea';
                      e.target.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (location.pathname !== '/admin') {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#64748b';
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  ⚙️ Admin
                </Link>
              )}
            </div>
          )}
        </div>

        <div style={userSectionStyle}>
          {user ? (
            <>
              <Notifications />
              {user.role !== 'recruiter' && (
                <Link 
                  to="/profile" 
                  style={{
                    ...linkStyle('/profile'),
                    marginRight: '16px'
                  }}
                  onMouseEnter={(e) => {
                    if (location.pathname !== '/profile') {
                      e.target.style.background = 'rgba(102, 126, 234, 0.1)';
                      e.target.style.color = '#667eea';
                      e.target.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (location.pathname !== '/profile') {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#64748b';
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  👤 Profile
                </Link>
              )}
              <button 
                onClick={handleLogout}
                style={logoutBtnStyle}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 24px rgba(239, 68, 68, 0.4)';
                  e.target.style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.2)';
                  e.target.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '12px' }}>
              <Link 
                to="/login" 
                className="btn btn-secondary"
                style={{
                  padding: '10px 18px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.3s ease'
                }}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="btn btn-primary"
                style={{
                  padding: '10px 18px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.3s ease'
                }}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
