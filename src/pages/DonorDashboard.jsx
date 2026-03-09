import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import FoodUploadForm from '../components/FoodUploadForm';
import NearbyNGOsMap from '../components/NearbyNGOsMap';
import { Clock, CheckCircle, Phone, Mail } from 'lucide-react';

export default function DonorDashboard() {
  const { userProfile } = useAuth();
  const [activePosts, setActivePosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile) return;

    // Listen to user's food posts
    const q = query(
      collection(db, 'foodPosts'),
      where('donor_id', '==', userProfile.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setActivePosts(posts);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching my posts:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [userProfile]);

  return (
    <div className="container" style={{ maxWidth: '1000px' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-6)' }}>
        <div>
          <h2 style={{ color: 'var(--primary-color)' }}>Donor Dashboard</h2>
          <p>Welcome, {userProfile?.name}!</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-6)' }}>
        
        {/* Left Column: Upload Form */}
        <div>
          <FoodUploadForm onSuccess={() => alert('Food donation published successfully!')} />
        </div>

        {/* Right Column: Map & My Active Posts */}
        <div className="flex-col gap-6" style={{ gap: 'var(--spacing-6)' }}>
          
          <div>
            <h3 style={{ marginBottom: 'var(--spacing-4)' }}>Nearby NGOs & Trusts</h3>
            <NearbyNGOsMap userLocation={null} />
          </div>

          <div>
            <h3 style={{ marginBottom: 'var(--spacing-4)' }}>My Donations</h3>
            
            {loading ? (
              <p>Loading your donations...</p>
            ) : activePosts.length === 0 ? (
              <div className="card">
                <div className="card-body" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <p>You haven't posted any food donations yet.</p>
                  <p style={{ fontSize: '0.875rem', marginTop: 'var(--spacing-2)' }}>Use the form to share excess food with nearby NGOs.</p>
                </div>
              </div>
            ) : (
              <div className="flex-col gap-4">
                {activePosts.map(post => {
                  const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
                  const isExpired = post.createdAt && (Date.now() - post.createdAt.toMillis() > THREE_HOURS_MS);
                  
                  return (
                    <div key={post.id} className="card" style={{ display: 'flex', flexDirection: 'row', opacity: isExpired ? 0.6 : 1 }}>
                      <img 
                        src={post.image_url} 
                        alt={post.food_name}
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                      />
                      <div className="card-body" style={{ padding: 'var(--spacing-3)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <h4 style={{ marginBottom: 'var(--spacing-1)' }}>{post.food_name} {isExpired && "(Expired)"}</h4>
                        <p style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-2)' }}>Qty: {post.quantity}</p>
                        
                        <div className="flex items-center gap-1" style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: '500',
                          color: isExpired ? 'var(--text-secondary)' : post.status === 'available' ? 'var(--warning-color)' : 'var(--success-color)'
                        }}>
                          {isExpired ? (
                            <><Clock size={14} /> <span>Expired</span></>
                          ) : post.status === 'available' ? (
                            <><Clock size={14} /> <span>Available</span></>
                          ) : (
                            <div className="flex-col gap-2" style={{ width: '100%' }}>
                              <div className="flex items-center gap-1">
                                <CheckCircle size={14} /> 
                                <span>Accepted by {post.acceptedByName}</span>
                              </div>
                              <div className="flex gap-2" style={{ marginTop: 'var(--spacing-2)' }}>
                                {post.acceptedByPhone && (
                                  <a href={`tel:${post.acceptedByPhone}`} className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.75rem', gap: '4px' }}>
                                    <Phone size={12} /> Call/SMS
                                  </a>
                                )}
                                {post.acceptedByEmail && (
                                  <a href={`mailto:${post.acceptedByEmail}`} className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.75rem', gap: '4px' }}>
                                    <Mail size={12} /> Email
                                  </a>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
