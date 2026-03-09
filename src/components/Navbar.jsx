import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, UtensilsCrossed, MapPin, Bell, User } from 'lucide-react';

export default function Navbar() {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    try { await logout(); navigate('/login'); }
    catch (e) { console.error(e); }
  }

  // Don't show nav on login / complete-profile
  if (!currentUser || !userProfile) return null;

  const path = location.pathname;

  const navItems = [
    { to: '/',        icon: <Home size={22}/>,             label: 'Home' },
    { to: '/donor',   icon: <UtensilsCrossed size={22}/>,  label: 'Donate' },
    { to: '/trust',   icon: <MapPin size={22}/>,           label: 'Nearby' },
    { to: '/profile', icon: <User size={22}/>,             label: 'Profile' },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map(item => {
        const active = item.to === '/' ? path === '/' : path.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`bottom-nav-item${active ? ' active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        );
      })}
      <button className="bottom-nav-item" onClick={handleLogout}>
        <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        <span>Logout</span>
      </button>
    </nav>
  );
}
