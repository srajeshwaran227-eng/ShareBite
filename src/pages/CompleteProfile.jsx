import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function CompleteProfile() {
  const { currentUser, completeProfile } = useAuth();
  const navigate = useNavigate();

  const [role, setRole]     = useState('');
  const [phone, setPhone]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  if (!currentUser) { navigate('/login'); return null; }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!role)  { setError('Please select a role.'); return; }
    if (!phone) { setError('Please enter your phone number.'); return; }
    try {
      setError(''); setLoading(true);
      const profileData = {
        id:    currentUser.uid,
        name:  currentUser.displayName || 'Anonymous',
        email: currentUser.email,
        role, phone,
      };
      await completeProfile(currentUser.uid, profileData);
      navigate(role === 'donor' ? '/donor' : '/trust');
    } catch (err) {
      console.error(err);
      setError('Failed to create profile. Please try again.');
    } finally { setLoading(false); }
  }

  return (
    <div style={{
      minHeight:'100vh', background:'linear-gradient(180deg,#F5F0E8 0%,#EDE8DC 100%)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem'
    }}>
      <div style={{
        background:'#fff', borderRadius:'24px', padding:'2rem',
        width:'100%', maxWidth:'420px',
        boxShadow:'0 8px 40px rgba(0,0,0,0.1)', border:'1px solid #E8E0D0'
      }}>
        {/* Logo strip */}
        <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
          <div style={{
            width:'70px', height:'70px',
            background:'linear-gradient(135deg,#E8622A,#F9A825)',
            borderRadius:'18px', margin:'0 auto 0.75rem',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 4px 16px rgba(232,98,42,0.3)'
          }}>
            <img src="/logo.png" alt="ShareBite" style={{ width:'48px', height:'48px', objectFit:'contain' }}/>
          </div>
          <h2 style={{ fontSize:'1.4rem', color:'#2C3E1F' }}>Complete Your Profile</h2>
          <p style={{ fontSize:'0.85rem', color:'#9EAD82', marginTop:'4px' }}>Tell us who you are to get started</p>
        </div>

        {error && <div style={{ background:'#FEE2E2', color:'#B91C1C', padding:'0.5rem 1rem', borderRadius:'10px', marginBottom:'1rem', fontSize:'0.85rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {/* Role selection */}
          <div>
            <label style={{ display:'block', fontWeight:700, fontSize:'0.85rem', color:'#5A6B3A', marginBottom:'0.5rem' }}>I am registering as a:</label>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
              {[
                { val:'donor', emoji:'🍱', label:'Donor', sub:'I donate food' },
                { val:'trust', emoji:'🤝', label:'Trust / NGO', sub:'I accept donations' },
              ].map(opt => (
                <button key={opt.val} type="button" onClick={() => setRole(opt.val)}
                  style={{
                    padding:'1rem 0.75rem', border:`2px solid ${role===opt.val ? '#E8622A' : '#E8E0D0'}`,
                    borderRadius:'14px', background:role===opt.val ? 'rgba(232,98,42,0.06)' : '#fff',
                    cursor:'pointer', transition:'all 0.2s', textAlign:'center', fontFamily:'Nunito,sans-serif'
                  }}>
                  <div style={{ fontSize:'1.8rem' }}>{opt.emoji}</div>
                  <div style={{ fontWeight:800, fontSize:'0.9rem', color:'#2C3E1F', marginTop:'4px' }}>{opt.label}</div>
                  <div style={{ fontSize:'0.75rem', color:'#9EAD82' }}>{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Phone */}
          <div>
            <label style={{ display:'block', fontWeight:700, fontSize:'0.85rem', color:'#5A6B3A', marginBottom:'0.5rem' }}>Phone Number</label>
            <input
              type="tel" placeholder="+91 98765 43210"
              value={phone} onChange={e => setPhone(e.target.value)}
              required
              style={{
                width:'100%', padding:'0.65rem 1rem',
                background:'#fff', border:'1.5px solid #D9D0C0',
                borderRadius:'999px', fontFamily:'Nunito,sans-serif',
                fontSize:'0.95rem', color:'#2C3E1F',
                outline:'none', transition:'border 0.2s'
              }}
              onFocus={e => e.target.style.borderColor='#E8622A'}
              onBlur={e => e.target.style.borderColor='#D9D0C0'}
            />
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            style={{
              padding:'0.8rem', background:loading ? '#D9D0C0' : '#E8622A',
              color:'#fff', border:'none', borderRadius:'12px',
              fontWeight:800, fontSize:'1rem', cursor:loading?'not-allowed':'pointer',
              fontFamily:'Nunito,sans-serif', transition:'all 0.2s',
              boxShadow:loading?'none':'0 4px 14px rgba(232,98,42,0.4)'
            }}>
            {loading ? 'Saving…' : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  );
}
