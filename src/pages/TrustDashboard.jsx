import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { getDistance } from '../utils/distance';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Phone, Navigation, Clock, CheckCircle } from 'lucide-react';

export default function TrustDashboard() {
  const { userProfile } = useAuth();
  const [availablePosts, setAvailablePosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to all available food posts
    const q = query(
      collection(db, 'foodPosts'),
      where('status', '==', 'available')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // If trust has a location, filter by distance (< 10km) and add distance prop
      let filteredPosts = posts;
      if (userProfile?.location) {
        filteredPosts = posts.map(post => {
          if (post.location) {
            const distance = getDistance(
              userProfile.location.lat, 
              userProfile.location.lng,
              post.location.lat,
              post.location.lng
            );
            return { ...post, distance };
          }
          return post;
        }).filter(post => {
          // Check expiration (3 hours)
          const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
          const isExpired = post.createdAt && (Date.now() - post.createdAt.toMillis() > THREE_HOURS_MS);
          
          return !isExpired && (post.distance === undefined || post.distance <= 10);
        });
        
        // Sort by closest
        filteredPosts.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
      }

      setAvailablePosts(filteredPosts);
      setLoading(false);
    });

    return unsubscribe;
  }, [userProfile]);

  async function handleAccept(postId) {
    try {
      const postRef = doc(db, 'foodPosts', postId);
      await updateDoc(postRef, {
        status: 'accepted',
        acceptedBy: userProfile.id,
        acceptedByName: userProfile.name
      });
      alert('Food donation accepted successfully! The donor has been notified.');
    } catch (error) {
      console.error("Error accepting food:", error);
      alert('Failed to accept this donation. Please try again.');
    }
  }

  const defaultCenter = userProfile?.location || { lat: 40.7128, lng: -74.0060 };

  return (
    <div className="container" style={{ maxWidth: '1200px' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-6)' }}>
        <div>
          <h2 style={{ color: 'var(--secondary-color)' }}>Trust / NGO Dashboard</h2>
          <p>Available food donations nearby.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 'var(--spacing-6)' }}>
        
        {/* Left Column: Feed */}
        <div className="flex-col gap-4">
          <h3 style={{ marginBottom: 'var(--spacing-4)' }}>Available Food ({availablePosts.length})</h3>
          
          {loading ? (
            <p>Loading nearby donations...</p>
          ) : availablePosts.length === 0 ? (
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                <p>No food donations available nearby at the moment.</p>
                <p style={{ fontSize: '0.875rem', marginTop: 'var(--spacing-2)' }}>We will notify you when new food is posted within 10km.</p>
              </div>
            </div>
          ) : (
            availablePosts.map(post => (
              <div key={post.id} className="card">
                {post.image_url && (
                  <img 
                    src={post.image_url} 
                    alt={post.food_name}
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                  />
                )}
                <div className="card-body">
                  <div className="flex justify-between items-start" style={{ marginBottom: 'var(--spacing-2)' }}>
                    <h3 style={{ margin: 0 }}>{post.food_name}</h3>
                    {post.distance !== undefined && (
                      <span style={{ 
                        backgroundColor: 'var(--secondary-light)', 
                        color: 'var(--secondary-color)',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {post.distance.toFixed(1)} km away
                      </span>
                    )}
                  </div>
                  
                  <p style={{ fontWeight: '500', marginBottom: 'var(--spacing-2)' }}>Quantity: {post.quantity}</p>
                  
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-4)' }}>
                    <p style={{ marginBottom: 'var(--spacing-1)' }}><strong>Donor:</strong> {post.donor_name}</p>
                    <div className="flex items-center gap-1" style={{ marginBottom: 'var(--spacing-1)' }}>
                      <Phone size={14} /> <span>{post.contact}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      className="btn btn-secondary" 
                      style={{ flex: 1, gap: 'var(--spacing-2)' }}
                      onClick={() => handleAccept(post.id)}
                    >
                      <CheckCircle size={16} />
                      Accept Food
                    </button>
                    {post.location && (
                      <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${post.location.lat},${post.location.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline"
                        style={{ padding: '0 var(--spacing-4)' }}
                        title="Get Directions"
                      >
                        <Navigation size={18} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Map Overview */}
        <div>
          <h3 style={{ marginBottom: 'var(--spacing-4)' }}>Donations Map</h3>
          <div className="card" style={{ height: '500px', position: 'sticky', top: '100px' }}>
            <MapContainer 
              center={[defaultCenter.lat, defaultCenter.lng]} 
              zoom={11} 
              style={{ height: '100%', width: '100%', zIndex: 1 }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {userProfile?.location && (
                <Marker position={[userProfile.location.lat, userProfile.location.lng]}>
                  <Popup><strong>Your Location</strong></Popup>
                </Marker>
              )}

              {availablePosts.map(post => (
                post.location && (
                  <Marker key={post.id} position={[post.location.lat, post.location.lng]}>
                    <Popup>
                      <strong>{post.food_name}</strong><br/>
                      Qty: {post.quantity}<br/>
                      <button 
                        onClick={() => handleAccept(post.id)}
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '0.75rem', marginTop: 'var(--spacing-2)' }}
                      >
                        Accept
                      </button>
                    </Popup>
                  </Marker>
                )
              ))}
            </MapContainer>
          </div>
        </div>
        
      </div>
    </div>
  );
}
