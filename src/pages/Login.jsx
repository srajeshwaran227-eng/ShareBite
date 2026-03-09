import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent]   = useState(false);

  const { loginWithEmail, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  function getFriendlyError(code) {
    switch (code) {
      case 'auth/user-not-found':         return 'No account found with this email.';
      case 'auth/wrong-password':         return 'Incorrect password. Try forgot password below.';
      case 'auth/invalid-email':          return 'Invalid email address.';
      case 'auth/invalid-credential':
      case 'auth/INVALID_LOGIN_CREDENTIALS':
      case 'INVALID_LOGIN_CREDENTIALS':   return 'Wrong email or password. If you signed up with Google, use the button below.';
      case 'auth/too-many-requests':      return 'Too many attempts. Please wait and try again.';
      case 'auth/user-disabled':          return 'This account has been disabled.';
      case 'auth/popup-closed-by-user':
      case 'auth/cancelled-popup-request':return 'Google sign-in cancelled.';
      default:                            return `Sign in failed. (${code || 'unknown'})`;
    }
  }

  async function handleEmailLogin(e) {
    e.preventDefault();
    if (!email || !password) { setError('Please enter email and password.'); return; }
    try {
      setError(''); setResetSent(false); setLoading(true);
      const result = await loginWithEmail(email, password);
      navigate(result.isNewUser ? '/complete-profile' : '/');
    } catch (err) {
      console.error('Firebase error:', err.code, err.message);
      setError(getFriendlyError(err.code));
    } finally { setLoading(false); }
  }

  async function handleGoogleLogin() {
    try {
      setError(''); setLoading(true);
      const result = await loginWithGoogle();
      navigate(result.isNewUser ? '/complete-profile' : '/');
    } catch (err) {
      console.error('Google error:', err.code, err.message);
      setError(getFriendlyError(err.code));
    } finally { setLoading(false); }
  }

  async function handleForgotPassword() {
    if (!email) { setError('Enter your email above first.'); return; }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true); setError('');
    } catch (err) { setError(getFriendlyError(err.code)); }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #F5F0E8 0%, #EDE8DC 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative blobs */}
      <div style={{ position:'absolute', top:'-60px', right:'-60px', width:'220px', height:'220px', borderRadius:'50%', background:'rgba(232,98,42,0.08)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-80px', left:'-60px', width:'280px', height:'280px', borderRadius:'50%', background:'rgba(58,140,63,0.08)', pointerEvents:'none' }} />

      {/* Logo + branding */}
      <div style={{ textAlign:'center', marginBottom:'2rem' }}>
        <div style={{
          width:'100px', height:'100px',
          background:'linear-gradient(135deg, #E8622A, #F9A825)',
          borderRadius:'28px',
          display:'flex', alignItems:'center', justifyContent:'center',
          margin:'0 auto 1rem',
          boxShadow:'0 8px 28px rgba(232,98,42,0.35)'
        }}>
          <img src="/logo.png" alt="ShareBite" style={{ width:'70px', height:'70px', objectFit:'contain' }} />
        </div>
        <h1 style={{ color:'#2C3E1F', fontSize:'2rem', fontWeight:800, letterSpacing:'-0.5px' }}>
          Share<span style={{ color:'#E8622A' }}>Bite</span>
        </h1>
        <p style={{ color:'#5A6B3A', fontSize:'0.9rem', marginTop:'4px' }}>Share Food, Spread Happiness</p>
      </div>

      {/* Card */}
      <div style={{
        background:'#fff',
        borderRadius:'24px',
        padding:'2rem',
        width:'100%',
        maxWidth:'380px',
        boxShadow:'0 8px 40px rgba(0,0,0,0.1)',
        border:'1px solid #E8E0D0'
      }}>
        {error && (
          <div style={{ background:'#FEE2E2', color:'#B91C1C', padding:'0.6rem 1rem', borderRadius:'12px', fontSize:'0.85rem', marginBottom:'1rem', textAlign:'center' }}>
            {error}
          </div>
        )}
        {resetSent && (
          <div style={{ background:'#DCFCE7', color:'#15803D', padding:'0.6rem 1rem', borderRadius:'12px', fontSize:'0.85rem', marginBottom:'1rem', textAlign:'center' }}>
            ✅ Reset email sent! Check your inbox.
          </div>
        )}

        <form onSubmit={handleEmailLogin} style={{ display:'flex', flexDirection:'column', gap:'0.9rem' }}>
          {/* Email */}
          <div>
            <input
              className="form-control"
              type="email"
              placeholder="Email / Phone"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ borderRadius:'12px' }}
              required
            />
          </div>

          {/* Password */}
          <div style={{ position:'relative' }}>
            <input
              className="form-control"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ borderRadius:'12px', paddingRight:'2.8rem' }}
              required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#9EAD82', cursor:'pointer', display:'flex' }}>
              {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>

          {/* Login btn */}
          <button type="submit" disabled={loading}
            style={{
              padding:'0.75rem', background:'#E8622A', color:'#fff',
              fontWeight:800, fontSize:'1rem', border:'none',
              borderRadius:'12px', cursor:'pointer',
              boxShadow:'0 4px 14px rgba(232,98,42,0.4)',
              transition:'all 0.2s', marginTop:'0.25rem'
            }}>
            {loading ? 'Signing in…' : 'Login'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', margin:'1rem 0' }}>
          <div style={{ flex:1, height:'1px', background:'#E8E0D0' }} />
          <span style={{ color:'#9EAD82', fontSize:'0.8rem', fontWeight:600 }}>Or Login with</span>
          <div style={{ flex:1, height:'1px', background:'#E8E0D0' }} />
        </div>

        {/* Google btn */}
        <button type="button" onClick={handleGoogleLogin} disabled={loading}
          style={{
            width:'100%', padding:'0.75rem',
            background:'#fff', border:'1.5px solid #E8E0D0',
            borderRadius:'12px', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', gap:'10px',
            fontWeight:700, fontSize:'0.95rem', color:'#2C3E1F',
            transition:'all 0.2s', fontFamily:'Nunito, sans-serif'
          }}>
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        {/* Forgot password */}
        <div style={{ textAlign:'center', marginTop:'1rem' }}>
          <a href="#" onClick={e => { e.preventDefault(); handleForgotPassword(); }}
            style={{ color:'#9EAD82', fontSize:'0.8rem', textDecoration:'none', fontWeight:600 }}>
            forgot password ?
          </a>
        </div>
      </div>

      {/* Dots indicator */}
      <div style={{ display:'flex', gap:'6px', marginTop:'1.5rem' }}>
        <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#E8622A' }} />
        <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#D9D0C0' }} />
        <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#D9D0C0' }} />
      </div>
    </div>
  );
}
