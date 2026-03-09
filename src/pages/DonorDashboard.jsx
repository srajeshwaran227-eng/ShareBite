import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import FoodUploadForm from '../components/FoodUploadForm';
import NearbyNGOsMap from '../components/NearbyNGOsMap';
import { Clock, CheckCircle, Phone, Mail, ChevronRight, Bell } from 'lucide-react';

const VIEWS = { home: 'home', donate: 'donate', nearby: 'nearby', donations: 'donations', profile: 'profile' };

export default function DonorDashboard() {
  const { userProfile, logout } = useAuth();
  const [view, setView] = useState(VIEWS.home);
  const [activePosts, setActivePosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    if (!userProfile) return;
    const q = query(
      collection(db, 'foodPosts'),
      where('donor_id', '==', userProfile.id),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      setActivePosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingPosts(false);
    }, err => { console.error(err); setLoadingPosts(false); });
    return unsub;
  }, [userProfile]);

  const firstName = userProfile?.name?.split(' ')[0] || 'there';
  const initials  = (userProfile?.name || '?').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();

  // ── ACTION CARDS ────────────────────────────────────────────
  const actionCards = [
    { label:'Donate Food',       emoji:'🍱', bg:'icon-orange', view: VIEWS.donate },
    { label:'Find Nearby Food',  emoji:'📍', bg:'icon-green',  view: VIEWS.nearby },
    { label:'NGOs / Volunteers', emoji:'🤝', bg:'icon-yellow', view: VIEWS.nearby },
    { label:'My Donations',      emoji:'📋', bg:'icon-teal',   view: VIEWS.donations },
  ];

  // ── HOME ────────────────────────────────────────────────────
  if (view === VIEWS.home) return (
    <div style={{ maxWidth:'480px', margin:'0 auto', minHeight:'100vh', background:'#F5F0E8', paddingBottom:'80px' }}>
      {/* Top bar */}
      <div className="top-bar">
        <div>
          <div className="greeting">Good day!</div>
          <h3>Welcome, {firstName}! 👋</h3>
        </div>
        <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
          <button onClick={() => {}} style={{ background:'rgba(255,255,255,0.2)', border:'none', borderRadius:'50%', width:'38px', height:'38px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#fff' }}>
            <Bell size={18}/>
          </button>
          <div className="avatar" style={{ width:'38px', height:'38px', fontSize:'0.9rem' }}>{initials}</div>
        </div>
      </div>

      <div style={{ padding:'0 1.25rem' }}>
        {/* Search */}
        <div className="search-bar" style={{ marginBottom:'1.5rem' }}>
          <svg width="16" height="16" fill="none" stroke="#9EAD82" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input placeholder="Search food donations..." />
          <div style={{ width:'32px', height:'32px', background:'#E8622A', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </div>
        </div>

        {/* Action grid */}
        <div className="action-grid" style={{ marginBottom:'1.5rem' }}>
          {actionCards.map(ac => (
            <button key={ac.label} className="action-card" onClick={() => setView(ac.view)} style={{ border:'none', textAlign:'left' }}>
              <div className={`action-card-icon ${ac.bg}`}>{ac.emoji}</div>
              <div className="action-card-label">{ac.label}</div>
            </button>
          ))}
        </div>

        {/* Recent donations preview */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem' }}>
          <h3 style={{ fontSize:'1rem' }}>Recent Donations</h3>
          <button onClick={() => setView(VIEWS.donations)} style={{ background:'none', border:'none', color:'#E8622A', fontWeight:700, fontSize:'0.85rem', cursor:'pointer', fontFamily:'Nunito,sans-serif', display:'flex', alignItems:'center', gap:'2px' }}>See all <ChevronRight size={14}/></button>
        </div>

        {loadingPosts ? (
          <p style={{ color:'#9EAD82', fontSize:'0.9rem' }}>Loading…</p>
        ) : activePosts.length === 0 ? (
          <div className="card" style={{ textAlign:'center', padding:'1.5rem' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:'0.5rem' }}>🍽️</div>
            <p style={{ fontSize:'0.9rem', color:'#9EAD82' }}>No donations yet. Share your first meal!</p>
            <button className="btn btn-primary" onClick={() => setView(VIEWS.donate)} style={{ marginTop:'1rem', padding:'0.6rem 1.2rem', fontSize:'0.85rem', borderRadius:'12px' }}>Donate Now</button>
          </div>
        ) : (
          activePosts.slice(0,3).map(post => {
            const isExpired = post.createdAt && (Date.now() - post.createdAt.toMillis() > 3*60*60*1000);
            return (
              <div key={post.id} className="list-item" style={{ marginBottom:'0.75rem' }}>
                {post.image_url
                  ? <img src={post.image_url} alt={post.food_name} style={{ width:'44px', height:'44px', borderRadius:'10px', objectFit:'cover', flexShrink:0 }}/>
                  : <div className="list-item-icon">🍱</div>
                }
                <div className="list-item-content">
                  <strong>{post.food_name} {isExpired && <span style={{ color:'#9EAD82', fontSize:'0.75rem' }}>(Expired)</span>}</strong>
                  <span>{post.quantity} • {isExpired ? 'Expired' : post.status === 'available' ? '🟡 Available' : '✅ Accepted'}</span>
                </div>
                <ChevronRight size={16} color="#D9D0C0"/>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  // ── DONATE ──────────────────────────────────────────────────
  if (view === VIEWS.donate) return (
    <div style={{ maxWidth:'480px', margin:'0 auto', minHeight:'100vh', background:'#F5F0E8', paddingBottom:'80px' }}>
      <div className="page-header">
        <button className="page-back-btn" onClick={() => setView(VIEWS.home)}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <h2>Donate Food</h2>
      </div>
      <div style={{ padding:'0 1.25rem' }}>
        <FoodUploadForm onSuccess={() => setView(VIEWS.home)} />
      </div>
    </div>
  );

  // ── NEARBY ──────────────────────────────────────────────────
  if (view === VIEWS.nearby) return (
    <div style={{ maxWidth:'480px', margin:'0 auto', minHeight:'100vh', background:'#F5F0E8', paddingBottom:'80px' }}>
      <div className="page-header">
        <button className="page-back-btn" onClick={() => setView(VIEWS.home)}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <h2>Nearby Food</h2>
        <div style={{ marginLeft:'auto' }}>
          <button style={{ background:'rgba(255,255,255,0.2)', border:'none', borderRadius:'50%', width:'34px', height:'34px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#fff' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M2 12h2m16 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          </button>
        </div>
      </div>
      <div style={{ padding:'0 1.25rem' }}>
        <NearbyNGOsMap userLocation={null} />
      </div>
    </div>
  );

  // ── MY DONATIONS ────────────────────────────────────────────
  if (view === VIEWS.donations) return (
    <div style={{ maxWidth:'480px', margin:'0 auto', minHeight:'100vh', background:'#F5F0E8', paddingBottom:'80px' }}>
      <div className="page-header">
        <button className="page-back-btn" onClick={() => setView(VIEWS.home)}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <h2>My Donations</h2>
      </div>
      <div style={{ padding:'0 1.25rem' }}>
        {loadingPosts ? <p>Loading…</p> : activePosts.length === 0 ? (
          <div className="card" style={{ textAlign:'center', padding:'2rem' }}>
            <div style={{ fontSize:'3rem' }}>🍽️</div>
            <p style={{ marginTop:'0.5rem' }}>No donations yet.</p>
          </div>
        ) : activePosts.map(post => {
          const isExpired = post.createdAt && (Date.now() - post.createdAt.toMillis() > 3*60*60*1000);
          return (
            <div key={post.id} className="card" style={{ marginBottom:'0.75rem', display:'flex', flexDirection:'row', overflow:'hidden' }}>
              {post.image_url
                ? <img src={post.image_url} alt={post.food_name} style={{ width:'90px', height:'90px', objectFit:'cover', flexShrink:0 }}/>
                : <div style={{ width:'90px', height:'90px', background:'#F0EDE6', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', flexShrink:0 }}>🍱</div>
              }
              <div className="card-body" style={{ padding:'0.75rem', flex:1 }}>
                <strong style={{ display:'block', marginBottom:'3px' }}>{post.food_name} {isExpired && '(Expired)'}</strong>
                <span style={{ fontSize:'0.8rem', color:'#9EAD82' }}>Qty: {post.quantity}</span>
                <div style={{ marginTop:'6px', display:'flex', gap:'6px', flexWrap:'wrap' }}>
                  {isExpired ? (
                    <span className="badge badge-orange">Expired</span>
                  ) : post.status === 'available' ? (
                    <span className="badge badge-orange">Available</span>
                  ) : (
                    <>
                      <span className="badge badge-green">✅ Accepted by {post.acceptedByName}</span>
                      <div style={{ display:'flex', gap:'4px', marginTop:'4px' }}>
                        {post.acceptedByPhone && <a href={`tel:${post.acceptedByPhone}`} className="btn btn-outline" style={{ padding:'2px 10px', fontSize:'0.72rem', borderRadius:'8px' }}><Phone size={11}/> Call</a>}
                        {post.acceptedByEmail && <a href={`mailto:${post.acceptedByEmail}`} className="btn btn-outline" style={{ padding:'2px 10px', fontSize:'0.72rem', borderRadius:'8px' }}><Mail size={11}/> Mail</a>}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return null;
}
