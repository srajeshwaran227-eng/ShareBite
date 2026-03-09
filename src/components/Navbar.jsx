import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, LogOut, Activity } from 'lucide-react';

export default function Navbar() {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  }

  return (
    <nav style={{ 
      padding: 'var(--spacing-6) var(--spacing-4)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'transparent'
    }}>
      <div className="container flex items-center justify-between" style={{ padding: 0 }}>
        
        {currentUser && userProfile ? (
          <>
            <div style={{ 
              width: '40px', height: '40px', 
              borderRadius: '50%', background: 'var(--surface-glass)', 
              border: '1px solid var(--border-glass)', 
              boxShadow: 'var(--primary-glow)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              <User size={18} color="var(--primary-color)" />
            </div>

            <button 
              onClick={handleLogout}
              style={{ 
                width: '40px', height: '40px', 
                borderRadius: '50%', background: 'var(--surface-glass)', 
                border: '1px solid var(--border-glass)', 
                boxShadow: 'var(--primary-glow)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--primary-color)',
                backdropFilter: 'blur(10px)'
              }}
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <>
            <div style={{ visibility: 'hidden', width: '40px' }} />
            <Link to="/login" style={{ 
                width: '40px', height: '40px', 
                borderRadius: '50%', background: 'var(--surface-glass)', 
                border: '1px solid var(--border-glass)', 
                boxShadow: 'var(--primary-glow)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none',
                backdropFilter: 'blur(10px)'
            }}>
              <Activity size={18} color="var(--primary-color)" />
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
