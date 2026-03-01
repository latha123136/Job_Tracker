import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './HomePage.css';

const HomePage = () => {
  const { user } = useContext(AuthContext);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const heroImages = [
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
  ];

  useEffect(() => {
    document.body.classList.add('homepage');
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 12000);

    return () => {
      clearInterval(interval);
      document.body.classList.remove('homepage');
    };
  }, [heroImages.length]);

  return (
    <div className={`homepage ${user ? 'with-navbar' : ''}`}>
      {/* Header - only show for non-authenticated users */}
      {!user && (
        <header className="header">
          <div className="header-content">
            <div className="logo">
              <h2>JobTracker Pro</h2>
            </div>
            <nav className="nav">
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link btn-primary">Register</Link>
            </nav>
          </div>
        </header>
      )}

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`hero-image ${index === currentImageIndex ? 'active' : ''}`}
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
          <div className="hero-overlay" />
        </div>
        
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Track Your <span className="gradient-text">Dream Job</span> Journey
            </h1>
            <p className="hero-subtitle">
              Organize applications, prepare for interviews, and land your perfect role with our comprehensive job tracking platform.
            </p>
            {!user && (
              <div className="hero-cta">
                <Link to="/register" className="btn btn-primary btn-large">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose JobTracker Pro?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Application Tracking</h3>
              <p>Keep track of all your job applications in one organized dashboard</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💼</div>
              <h3>Interview Management</h3>
              <p>Schedule and prepare for interviews with our comprehensive tools</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Progress Analytics</h3>
              <p>Visualize your job search progress with detailed analytics</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Goal Setting</h3>
              <p>Set and achieve your career goals with our tracking system</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Job Search?</h2>
            <p>Join thousands of professionals who have streamlined their job hunting process</p>
            <Link to="/register" className="btn btn-primary btn-large">
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>JobTracker Pro</h3>
              <p>Your ultimate job search companion</p>
            </div>
            <div className="footer-section">
              <h4>Features</h4>
              <ul>
                <li><a href="#applications">Application Tracking</a></li>
                <li><a href="#interviews">Interview Management</a></li>
                <li><a href="#analytics">Progress Analytics</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li><a href="#help">Help Center</a></li>
                <li><a href="#contact">Contact Us</a></li>
                <li><a href="#privacy">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 JobTracker Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;