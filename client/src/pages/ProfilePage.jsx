import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, token, login } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('view');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    college: '',
    branch: '',
    year: '',
    skills: '',
    phone: '',
    experience: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        college: user.college || '',
        branch: user.branch || '',
        year: user.year || '',
        skills: Array.isArray(user.skills) ? user.skills.join(', ') : (user.skills || ''),
        phone: user.phone || '',
        experience: user.experience || ''
      });
    }
  }, [user]);

  const updateProfile = async (data) => {
    const response = await fetch('http://localhost:5000/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  };

  const changePassword = async (data) => {
    const response = await fetch('http://localhost:5000/api/auth/change-password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to change password');
    }
    return response.json();
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const updatedUser = await updateProfile({
        ...profileData,
        skills: profileData.skills.split(',').map(s => s.trim()).filter(s => s)
      });
      login(updatedUser.user, token);
      setMessage('Profile updated successfully!');
      setActiveTab('view');
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('Error: New passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setMessage('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const tabStyle = (isActive) => ({
    padding: '12px 24px',
    border: 'none',
    backgroundColor: isActive ? '#007bff' : '#f8f9fa',
    color: isActive ? 'white' : '#666',
    cursor: 'pointer',
    borderRadius: '8px 8px 0 0',
    fontSize: '14px',
    fontWeight: '600'
  });

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#333', marginBottom: '30px' }}>👤 My Profile</h1>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '2px', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('view')}
          style={tabStyle(activeTab === 'view')}
        >
          View Profile
        </button>
        <button
          onClick={() => setActiveTab('edit')}
          style={tabStyle(activeTab === 'edit')}
        >
          Edit Profile
        </button>
        <button
          onClick={() => setActiveTab('password')}
          style={tabStyle(activeTab === 'password')}
        >
          Change Password
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div style={{
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px',
          backgroundColor: message.includes('Error') ? '#f8d7da' : '#d4edda',
          color: message.includes('Error') ? '#721c24' : '#155724',
          border: `1px solid ${message.includes('Error') ? '#f5c6cb' : '#c3e6cb'}`
        }}>
          {message}
        </div>
      )}

      {/* View Profile Tab */}
      {activeTab === 'view' && (
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #e9ecef',
          borderRadius: '0 8px 8px 8px',
          padding: '30px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ fontWeight: '600', color: '#333', display: 'block', marginBottom: '5px' }}>Name:</label>
              <p style={{ margin: 0, color: '#666', padding: '8px 0' }}>{user?.name || 'Not provided'}</p>
            </div>
            <div>
              <label style={{ fontWeight: '600', color: '#333', display: 'block', marginBottom: '5px' }}>Email:</label>
              <p style={{ margin: 0, color: '#666', padding: '8px 0' }}>{user?.email || 'Not provided'}</p>
            </div>
            <div>
              <label style={{ fontWeight: '600', color: '#333', display: 'block', marginBottom: '5px' }}>College:</label>
              <p style={{ margin: 0, color: '#666', padding: '8px 0' }}>{user?.college || 'Not provided'}</p>
            </div>
            <div>
              <label style={{ fontWeight: '600', color: '#333', display: 'block', marginBottom: '5px' }}>Branch:</label>
              <p style={{ margin: 0, color: '#666', padding: '8px 0' }}>{user?.branch || 'Not provided'}</p>
            </div>
            <div>
              <label style={{ fontWeight: '600', color: '#333', display: 'block', marginBottom: '5px' }}>Year:</label>
              <p style={{ margin: 0, color: '#666', padding: '8px 0' }}>{user?.year || 'Not provided'}</p>
            </div>
            <div>
              <label style={{ fontWeight: '600', color: '#333', display: 'block', marginBottom: '5px' }}>Phone:</label>
              <p style={{ margin: 0, color: '#666', padding: '8px 0' }}>{user?.phone || 'Not provided'}</p>
            </div>
          </div>
          <div style={{ marginTop: '20px' }}>
            <label style={{ fontWeight: '600', color: '#333', display: 'block', marginBottom: '5px' }}>Skills:</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
              {(Array.isArray(user?.skills) ? user.skills : (user?.skills || '').split(','))
                .filter(skill => skill.trim())
                .map((skill, index) => (
                <span key={index} style={{
                  backgroundColor: '#e3f2fd',
                  color: '#1976d2',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {skill.trim()}
                </span>
              ))}
              {(!user?.skills || (Array.isArray(user.skills) ? user.skills.length === 0 : !user.skills.trim())) && (
                <span style={{ color: '#666', fontStyle: 'italic' }}>No skills added</span>
              )}
            </div>
          </div>
          {user?.experience && (
            <div style={{ marginTop: '20px' }}>
              <label style={{ fontWeight: '600', color: '#333', display: 'block', marginBottom: '5px' }}>Experience:</label>
              <p style={{ margin: 0, color: '#666', padding: '8px 0' }}>{user.experience}</p>
            </div>
          )}
        </div>
      )}

      {/* Edit Profile Tab */}
      {activeTab === 'edit' && (
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #e9ecef',
          borderRadius: '0 8px 8px 8px',
          padding: '30px'
        }}>
          <form onSubmit={handleProfileUpdate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontWeight: '600', color: '#333', display: 'block', marginBottom: '5px' }}>Name:</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ fontWeight: '600', color: '#333', display: 'block', marginBottom: '5px' }}>Email:</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ fontWeight: '600', color: '#333', display: 'block', marginBottom: '5px' }}>College:</label>
                <input
                  type="text"
                  value={profileData.college}
                  onChange={(e) => setProfileData({...profileData, college: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ fontWeight: '600', color: '#333', display: 'block', marginBottom: '5px' }}>Branch:</label>
                <input
                  type="text"
                  value={profileData.branch}
                  onChange={(e) => setProfileData({...profileData, branch: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ fontWeight: '600', color: '#333', display: 'block', marginBottom: '5px' }}>Year:</label>
                <input
                  type="number"
                  value={profileData.year}
                  onChange={(e) => setProfileData({...profileData, year: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  min="1"
                  max="6"
                />
              </div>
              <div>
                <label style={{ fontWeight: '600', color: '#333', display: 'block', marginBottom: '5px' }}>Phone:</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: '600', color: '#333', display: 'block', marginBottom: '5px' }}>Skills (comma separated):</label>
              <input
                type="text"
                value={profileData.skills}
                onChange={(e) => setProfileData({...profileData, skills: e.target.value})}
                placeholder="e.g., JavaScript, React, Node.js"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: '600', color: '#333', display: 'block', marginBottom: '5px' }}>Experience:</label>
              <textarea
                value={profileData.experience}
                onChange={(e) => setProfileData({...profileData, experience: e.target.value})}
                rows="3"
                placeholder="Brief description of your experience..."
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: loading ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              {loading ? '⏳ Updating...' : '💾 Update Profile'}
            </button>
          </form>
        </div>
      )}

      {/* Change Password Tab */}
      {activeTab === 'password' && (
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #e9ecef',
          borderRadius: '0 8px 8px 8px',
          padding: '30px'
        }}>
          <form onSubmit={handlePasswordChange}>
            <div style={{ maxWidth: '400px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: '600', color: '#333', display: 'block', marginBottom: '5px' }}>Current Password:</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: '600', color: '#333', display: 'block', marginBottom: '5px' }}>New Password:</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  required
                  minLength="6"
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: '600', color: '#333', display: 'block', marginBottom: '5px' }}>Confirm New Password:</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: loading ? '#6c757d' : '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                {loading ? '⏳ Changing...' : '🔒 Change Password'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;