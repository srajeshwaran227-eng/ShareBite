import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, getDocs } from 'firebase/firestore';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const usersSnap = await getDocs(query(collection(db, 'users')));
        const postsSnap = await getDocs(query(collection(db, 'foodPosts')));
        
        setUsers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setPosts(postsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching admin data:", err);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="container p-4">
      <h2 style={{ marginBottom: 'var(--spacing-6)' }}>Admin Panel</h2>
      
      {loading ? (
        <p>Loading platform data...</p>
      ) : (
        <div className="flex-col gap-6" style={{ gap: 'var(--spacing-6)' }}>
          <div className="flex gap-4">
            <div className="card" style={{ flex: 1 }}>
              <div className="card-body text-center">
                <h3>Total Users</h3>
                <p style={{ fontSize: '2rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>{users.length}</p>
              </div>
            </div>
            <div className="card" style={{ flex: 1 }}>
              <div className="card-body text-center">
                <h3>Donors</h3>
                <p style={{ fontSize: '2rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>{users.filter(u => u.role === 'donor').length}</p>
              </div>
            </div>
            <div className="card" style={{ flex: 1 }}>
              <div className="card-body text-center">
                <h3>Trusts/NGOs</h3>
                <p style={{ fontSize: '2rem', color: 'var(--secondary-color)', fontWeight: 'bold' }}>{users.filter(u => u.role === 'trust').length}</p>
              </div>
            </div>
            <div className="card" style={{ flex: 1 }}>
              <div className="card-body text-center">
                <h3>Total Posts</h3>
                <p style={{ fontSize: '2rem', color: 'var(--warning-color)', fontWeight: 'bold' }}>{posts.length}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 style={{ marginBottom: 'var(--spacing-4)' }}>Recent Users</h3>
            <div className="card" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: 'var(--spacing-3)' }}>Name</th>
                    <th style={{ padding: 'var(--spacing-3)' }}>Email</th>
                    <th style={{ padding: 'var(--spacing-3)' }}>Role</th>
                    <th style={{ padding: 'var(--spacing-3)' }}>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {users.slice(0, 10).map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: 'var(--spacing-3)' }}>{u.name}</td>
                      <td style={{ padding: 'var(--spacing-3)' }}>{u.email}</td>
                      <td style={{ padding: 'var(--spacing-3)' }}>
                        <span style={{ 
                          padding: '2px 8px', 
                          borderRadius: '12px', 
                          fontSize: '0.75rem',
                          backgroundColor: u.role === 'donor' ? 'var(--primary-light)' : 'var(--secondary-light)',
                          color: u.role === 'donor' ? 'var(--primary-color)' : 'var(--secondary-color)'
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: 'var(--spacing-3)' }}>{u.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
