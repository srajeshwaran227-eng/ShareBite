import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

// Note: Requires leaflet CSS in index.html or imported
export default function NearbyNGOsMap({ userLocation }) {
  const [ngos, setNgos] = useState([]);
  const defaultCenter = [40.7128, -74.0060]; // fallback NYC

  useEffect(() => {
    async function fetchNgos() {
      const q = query(collection(db, 'users'), where('role', '==', 'trust'));
      const snapshot = await getDocs(q);
      const ngoList = snapshot.docs
        .map(doc => doc.data())
        .filter(data => data.location); // Must have a location set
        
      setNgos(ngoList);
    }
    
    fetchNgos();
  }, []);

  const center = userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter;

  return (
    <div className="card" style={{ height: '400px', overflow: 'hidden' }}>
      <MapContainer 
        center={center} 
        zoom={userLocation ? 12 : 2} 
        style={{ height: '100%', width: '100%', zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User Location Marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>
              <strong>You are here</strong>
            </Popup>
          </Marker>
        )}

        {/* NGO Markers */}
        {ngos.map((ngo, idx) => (
          <Marker key={ngo.id || idx} position={[ngo.location.lat, ngo.location.lng]}>
            <Popup>
              <strong>{ngo.name}</strong><br/>
              Phone: {ngo.phone}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
