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
    <nav className="navbar" style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'rgba(10, 10, 10, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
      <div className="container flex justify-between items-center" style={{ height: '70px' }}>
        <Link to="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
           <img src="/logo.png" alt="ShareBite Logo" style={{ height: '40px', objectFit: 'contain' }} />
        </Link>
        <div className="flex items-center gap-4">
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
            <Link to="/login" className="btn btn-primary" style={{ padding: '8px 20px', borderRadius: '50px', fontSize: '0.875rem' }}>Login</Link>
          </>
        )}
        </div>
      </div>
    </nav>
  );
}
