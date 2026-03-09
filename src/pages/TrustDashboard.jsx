import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { getDistance } from '../utils/distance';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Phone, Navigation, CheckCircle, Mail, Bell } from 'lucide-react';

const VIEWS = { home: 'home', nearby: 'nearby' };

export default function TrustDashboard() {
  const { userProfile } = useAuth();
  const [availablePosts, setAvailablePosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(VIEWS.home);

  useEffect(() => {
    const q = query(collection(db, 'foodPosts'), where('status', '==', 'available'));
    const unsub = onSnapshot(q, snap => {
      let posts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (userProfile?.location) {
        posts = posts.map(p => {
          if (p.location) {
            const dist = getDistance(userProfile.location.lat, userProfile.location.lng, p.location.lat, p.location.lng);
            return { ...p, distance: dist };
          }
          return p;
        }).filter(p => {
          const expired = p.createdAt && (Date.now() - p.createdAt.toMillis() > 3*60*60*1000);
          return !expired && (p.distance === undefined || p.distance <= 10);
        });
        posts.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
      }
      setAvailablePosts(posts);
      setLoading(false);
    });
    return unsub;
  }, [userProfile]);

  async function handleAccept(postId) {
    try {
      await updateDoc(doc(db, 'foodPosts', postId), {
        status: 'accepted',
        acceptedBy:      userProfile.id,
        acceptedByName:  userProfile.name,
        acceptedByPhone: userProfile.phone || '',
        acceptedByEmail: userProfile.email || '',
      });
      alert('✅ Accepted! Donor has been notified.');
    } catch (e) { console.error(e); alert('Failed. Try again.'); }
  }

  const firstName  = userProfile?.name?.split(' ')[0] || 'there';
  const initials   = (userProfile?.name||'?').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  const defaultCenter = userProfile?.location || { lat: 20.5937, lng: 78.9629 };
  const indiaBounds   = [[6.4626999, 68.1097],[35.513327, 97.3953586]];

  if (view === VIEWS.nearby) return (
    <div style={{ maxWidth:'480px', margin:'0 auto', minHeight:'100vh', background:'#F5F0E8', paddingBottom:'80px' }}>
      <div className="page-header">
        <button className="page-back-btn" onClick={() => setView(VIEWS.home)}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <h2>Donations Map</h2>
      </div>
      <div style={{ padding:'0 1.25rem' }}>
        <div style={{ borderRadius:'16px', overflow:'hidden', height:'400px', boxShadow:'0 4px 16px rgba(0,0,0,0.1)' }}>
          <MapContainer
            center={[defaultCenter.lat || defaultCenter[0], defaultCenter.lng || defaultCenter[1]]}
            zoom={userProfile?.location ? 11 : 5}
            maxBounds={indiaBounds} maxBoundsViscosity={1.0} minZoom={4}
            style={{ height:'100%', width:'100%' }}>
            <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {userProfile?.location && <Marker position={[userProfile.location.lat, userProfile.location.lng]}><Popup><strong>Your Location</strong></Popup></Marker>}
            {availablePosts.map(p => p.location && (
              <Marker key={p.id} position={[p.location.lat, p.location.lng]}>
                <Popup>
                  <strong>{p.food_name}</strong><br/>Qty: {p.quantity}<br/>
                  <button onClick={() => handleAccept(p.id)} style={{ marginTop:'8px', padding:'4px 10px', background:'#3A8C3F', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer' }}>Accept</button>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth:'480px', margin:'0 auto', minHeight:'100vh', background:'#F5F0E8', paddingBottom:'80px' }}>
      {/* Top bar */}
      <div className="top-bar">
        <div>
          <div className="greeting">NGO Dashboard</div>
          <h3>Welcome, {firstName}! 🤝</h3>
        </div>
        <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
          <button onClick={() => setView(VIEWS.nearby)} style={{ background:'rgba(255,255,255,0.2)', border:'none', borderRadius:'50%', width:'38px', height:'38px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#fff' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v2m0 16v2"/></svg>
          </button>
          <div className="avatar" style={{ width:'38px', height:'38px', fontSize:'0.9rem' }}>{initials}</div>
        </div>
      </div>

      <div style={{ padding:'0 1.25rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem' }}>
          <h3 style={{ fontSize:'1rem' }}>Available Food ({availablePosts.length})</h3>
          <button onClick={() => setView(VIEWS.nearby)} style={{ background:'none', border:'none', color:'#E8622A', fontWeight:700, fontSize:'0.82rem', cursor:'pointer', fontFamily:'Nunito,sans-serif' }}>View Map</button>
        </div>

        {loading ? <p style={{ color:'#9EAD82' }}>Loading nearby donations…</p>
        : availablePosts.length === 0 ? (
          <div className="card" style={{ textAlign:'center', padding:'2rem' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:'0.5rem' }}>🍽️</div>
            <p style={{ color:'#9EAD82' }}>No food donations nearby right now.</p>
            <p style={{ fontSize:'0.8rem', color:'#9EAD82', marginTop:'0.25rem' }}>You'll be notified when food is posted within 10 km.</p>
          </div>
        ) : availablePosts.map(post => (
          <div key={post.id} className="card" style={{ marginBottom:'0.75rem', overflow:'hidden' }}>
            {post.image_url && <img src={post.image_url} alt={post.food_name} style={{ width:'100%', height:'160px', objectFit:'cover' }}/>}
            <div className="card-body">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.4rem' }}>
                <h3 style={{ fontSize:'1rem', margin:0 }}>{post.food_name}</h3>
                {post.distance !== undefined && (
                  <span className="badge badge-green">{post.distance.toFixed(1)} km</span>
                )}
              </div>
              <p style={{ fontSize:'0.85rem', marginBottom:'0.4rem' }}>Qty: <strong>{post.quantity}</strong>
                {post.food_type && <span className={`badge ${post.food_type==='veg'?'badge-green':'badge-orange'}`} style={{ marginLeft:'8px' }}>{post.food_type}</span>}
              </p>
              <p style={{ fontSize:'0.8rem', color:'#9EAD82', marginBottom:'0.75rem' }}>
                Donor: {post.donor_name}
              </p>
              <div style={{ display:'flex', gap:'0.5rem' }}>
                <button onClick={() => handleAccept(post.id)}
                  style={{ flex:1, padding:'0.6rem', background:'#3A8C3F', color:'#fff', border:'none', borderRadius:'10px', fontWeight:700, fontFamily:'Nunito,sans-serif', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', fontSize:'0.85rem' }}>
                  <CheckCircle size={15}/> Accept Food
                </button>
                {post.location && (
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${post.location.lat},${post.location.lng}`}
                    target="_blank" rel="noreferrer"
                    style={{ padding:'0.6rem 0.8rem', background:'rgba(232,98,42,0.1)', border:'1.5px solid #E8622A', borderRadius:'10px', color:'#E8622A', display:'flex', alignItems:'center' }}>
                    <Navigation size={16}/>
                  </a>
                )}
                {post.contact && (
                  <a href={`tel:${post.contact}`}
                    style={{ padding:'0.6rem 0.8rem', background:'rgba(58,140,63,0.1)', border:'1.5px solid #3A8C3F', borderRadius:'10px', color:'#3A8C3F', display:'flex', alignItems:'center' }}>
                    <Phone size={16}/>
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
