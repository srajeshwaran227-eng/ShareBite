import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Activity, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e) {
    if (e) e.preventDefault();
    try {
      setError('');
      setLoading(true);
      const result = await loginWithGoogle();
      
      if (result.isNewUser) {
        navigate('/complete-profile');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container flex items-center justify-center p-4" style={{ minHeight: '80vh', flexDirection: 'column' }}>
      
      <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(74, 222, 128, 0.3)',
          boxShadow: '0 0 40px rgba(74, 222, 128, 0.4), inset 0 0 20px rgba(74, 222, 128, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '60px',
          backdropFilter: 'blur(10px)'
      }}>
        <Activity size={50} color="var(--primary-color)" />
      </div>
      
      <div style={{ width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
        
        {error && (
          <div style={{ backgroundColor: 'var(--error-color)', color: 'white', padding: 'var(--spacing-2) var(--spacing-4)', borderRadius: 'var(--radius-full)', textAlign: 'center', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <div>
            <input 
              className="form-control"
              type="text"
              placeholder="user name or email"
              style={{ textAlign: 'center' }}
            />
          </div>
          
          <div style={{ position: 'relative' }}>
            <input 
              className="form-control"
              type={showPassword ? "text" : "password"}
              placeholder="password"
              style={{ textAlign: 'center' }}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button 
            type="submit"
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: 'var(--spacing-2)', boxShadow: '0 0 25px rgba(34, 197, 94, 0.5)' }}
            disabled={loading}
          >
            {loading ? 'signing in...' : 'login'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: 'var(--spacing-2)' }}>
          <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.75rem' }}>forgot password ?</a>
        </div>
        
      </div>
    </div>
  );
}
