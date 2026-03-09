import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function CompleteProfile() {
  const { currentUser, completeProfile } = useAuth();
  const navigate = useNavigate();
  
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!role) {
      setError('Please select a role.');
      return;
    }
    if (!phone) {
      setError('Please enter your phone number.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      const profileData = {
        id: currentUser.uid,
        name: currentUser.displayName || 'Anonymous User',
        email: currentUser.email,
        role: role, // 'donor' or 'trust'
        phone: phone,
        // Location would typically go here
      };

      await completeProfile(currentUser.uid, profileData);
      
      if (role === 'donor') {
        navigate('/donor');
      } else {
        navigate('/trust');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to create profile.');
    } finally {
      setLoading(false);
    }
  }

  // If they somehow got here without being logged in with Google first
  if (!currentUser) {
    navigate('/login');
    return null;
  }

  return (
    <div className="container flex items-center justify-center p-4" style={{ minHeight: '80vh' }}>
      <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="card-body">
          <h2 style={{ marginBottom: 'var(--spacing-2)' }}>Complete Your Profile</h2>
          <p style={{ marginBottom: 'var(--spacing-6)' }}>Tell us a bit more about yourself to get started.</p>
          
          {error && (
            <div style={{ backgroundColor: 'var(--error-color)', color: 'white', padding: 'var(--spacing-2)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-4)', width: '100%' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">I am registering as a:</label>
              <div className="flex gap-4" style={{ marginTop: 'var(--spacing-2)' }}>
                <div 
                  className={`card ${role === 'donor' ? 'selected' : ''}`}
                  style={{ 
                    flex: 1, 
                    cursor: 'pointer', 
                    border: role === 'donor' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                    boxShadow: role === 'donor' ? '0 0 0 1px var(--primary-color)' : 'none'
                  }}
                  onClick={() => setRole('donor')}
                >
                  <div className="card-body" style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1.25rem' }}>Donor</h3>
                    <p style={{ fontSize: '0.875rem', marginTop: 'var(--spacing-1)' }}>I want to donate excess food.</p>
                  </div>
                </div>

                <div 
                  className={`card ${role === 'trust' ? 'selected' : ''}`}
                  style={{ 
                    flex: 1, 
                    cursor: 'pointer', 
                    border: role === 'trust' ? '2px solid var(--secondary-color)' : '1px solid var(--border-color)',
                    boxShadow: role === 'trust' ? '0 0 0 1px var(--secondary-color)' : 'none'
                  }}
                  onClick={() => setRole('trust')}
                >
                  <div className="card-body" style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1.25rem' }}>Trust / NGO</h3>
                    <p style={{ fontSize: '0.875rem', marginTop: 'var(--spacing-1)' }}>I want to accept food donations.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phone">Phone Number</label>
              <input 
                id="phone"
                type="tel" 
                className="form-control" 
                placeholder="e.g. +1 234 567 8900" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: 'var(--spacing-4)' }}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Complete Registration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
