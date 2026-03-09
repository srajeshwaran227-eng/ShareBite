import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../firebase';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { MapPin, Loader2, Camera } from 'lucide-react';
import { getDistance } from '../utils/distance';

export default function FoodUploadForm({ onSuccess }) {
  const { userProfile } = useAuth();
  const fileInputRef = useRef(null);

  const [foodName, setFoodName]       = useState('');
  const [quantity, setQuantity]       = useState('');
  const [foodType, setFoodType]       = useState('veg');
  const [imageFile, setImageFile]     = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [location, setLocation]       = useState(null);
  const [locationError, setLocationError] = useState('');
  const [isLocating, setIsLocating]   = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]             = useState('');

  function handleImageChange(e) {
    if (e.target.files?.[0]) {
      const f = e.target.files[0];
      setImageFile(f);
      setImagePreview(URL.createObjectURL(f));
    }
  }

  function getLocation() {
    setIsLocating(true); setLocationError('');
    if (!navigator.geolocation) { setLocationError('Geolocation not supported.'); setIsLocating(false); return; }
    navigator.geolocation.getCurrentPosition(
      p => { setLocation({ lat: p.coords.latitude, lng: p.coords.longitude }); setIsLocating(false); },
      () => { setLocationError('Allow location access and try again.'); setIsLocating(false); }
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!location)   { setError('Please detect your location first.'); return; }
    if (!imageFile)  { setError('Please provide a food photo.'); return; }
    try {
      setIsSubmitting(true); setError('');
      const storageRef = ref(storage, `food_images/${Date.now()}_${imageFile.name}`);
      const uploaded   = await uploadBytes(storageRef, imageFile);
      const imageUrl   = await getDownloadURL(uploaded.ref);

      await addDoc(collection(db, 'foodPosts'), {
        food_name:   foodName,
        quantity,
        food_type:   foodType,
        image_url:   imageUrl,
        donor_id:    userProfile.id,
        donor_name:  userProfile.name,
        contact:     userProfile.phone,
        donor_email: userProfile.email || '',
        location,
        status:      'available',
        createdAt:   serverTimestamp(),
      });

      // Notify nearby trusts
      try {
        const snap = await getDocs(query(collection(db, 'users'), where('role', '==', 'trust')));
        const nearby = snap.docs.filter(d => {
          const t = d.data();
          return t.location && getDistance(location.lat, location.lng, t.location.lat, t.location.lng) <= 10;
        });
        if (nearby.length > 0) alert(`✅ Notified ${nearby.length} nearby NGO(s)!`);
      } catch (e) { console.error(e); }

      // Reset
      setFoodName(''); setQuantity(''); setFoodType('veg');
      setImageFile(null); setImagePreview(''); setLocation(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setError('Upload failed. Please try again.');
    } finally { setIsSubmitting(false); }
  }

  return (
    <div className="card">
      <div className="card-body">
        <h3 style={{ marginBottom:'1rem', color:'#2C3E1F' }}>🍱 Post a Food Donation</h3>

        {error && <div style={{ background:'#FEE2E2', color:'#B91C1C', padding:'0.5rem 1rem', borderRadius:'10px', marginBottom:'1rem', fontSize:'0.85rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Food name */}
          <div className="form-group">
            <label className="form-label">Food Name</label>
            <input className="form-control" placeholder="e.g. Rice and Curry, Bread…" value={foodName}
              onChange={e => setFoodName(e.target.value)} required />
          </div>

          {/* Quantity */}
          <div className="form-group">
            <label className="form-label">Quantity</label>
            <input className="form-control" placeholder="e.g. 2 kg, 10 meals…" value={quantity}
              onChange={e => setQuantity(e.target.value)} required />
          </div>

          {/* Veg / Non-veg */}
          <div className="form-group">
            <label className="form-label">Food Type</label>
            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
              <span style={{ fontSize:'0.9rem', color:'#5A6B3A' }}>Food Type:</span>
              <div className="toggle-group">
                <button type="button" className={`toggle-btn${foodType==='veg' ? ' active-veg' : ''}`}
                  onClick={() => setFoodType('veg')}>Veg</button>
                <button type="button" className={`toggle-btn${foodType==='nonveg' ? ' active-nonveg' : ''}`}
                  onClick={() => setFoodType('nonveg')}>Non-Veg</button>
              </div>
            </div>
          </div>

          {/* Photo upload */}
          <div className="form-group">
            <label className="form-label">Upload Photo</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed #D9D0C0', borderRadius:'14px',
                padding:'1rem', textAlign:'center', cursor:'pointer',
                background:'#FAFAF7', position:'relative', overflow:'hidden',
                minHeight:'100px', display:'flex', alignItems:'center', justifyContent:'center'
              }}>
              <input type="file" ref={fileInputRef} style={{ display:'none' }} accept="image/*" onChange={handleImageChange} />
              {imagePreview
                ? <img src={imagePreview} alt="preview" style={{ width:'100%', maxHeight:'180px', objectFit:'cover', borderRadius:'10px' }}/>
                : <div style={{ color:'#9EAD82', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px' }}>
                    <Camera size={28}/>
                    <span style={{ fontSize:'0.85rem' }}>Tap to upload photo</span>
                  </div>
              }
            </div>
          </div>

          {/* Location */}
          <div className="form-group">
            <label className="form-label">Pickup Location</label>
            {location ? (
              <div style={{ display:'flex', alignItems:'center', gap:'8px', color:'#3A8C3F', fontSize:'0.9rem', fontWeight:600 }}>
                <MapPin size={16}/> Location detected ✓
                <button type="button" onClick={() => setLocation(null)} style={{ marginLeft:'auto', background:'none', border:'none', color:'#9EAD82', cursor:'pointer', fontSize:'0.75rem' }}>Change</button>
              </div>
            ) : (
              <div>
                <button type="button" onClick={getLocation} disabled={isLocating}
                  style={{
                    width:'100%', padding:'0.6rem 1rem',
                    background:'transparent', border:'1.5px solid #E8622A',
                    borderRadius:'999px', color:'#E8622A', fontWeight:700,
                    fontFamily:'Nunito,sans-serif', cursor:'pointer',
                    display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                    fontSize:'0.9rem', transition:'all 0.2s'
                  }}>
                  {isLocating ? <Loader2 size={16} style={{ animation:'spin 1s linear infinite' }}/> : <MapPin size={16}/>}
                  {isLocating ? 'Detecting…' : 'Detect My Location'}
                </button>
                {locationError && <p style={{ color:'#E53935', fontSize:'0.78rem', marginTop:'4px' }}>{locationError}</p>}
              </div>
            )}
          </div>

          {/* Submit */}
          <button type="submit" disabled={isSubmitting || !location || !imageFile}
            style={{
              width:'100%', padding:'0.8rem',
              background: (isSubmitting || !location || !imageFile) ? '#D9D0C0' : '#E8622A',
              color:'#fff', border:'none', borderRadius:'12px',
              fontWeight:800, fontSize:'1rem', cursor:'pointer',
              fontFamily:'Nunito,sans-serif', transition:'all 0.2s',
              marginTop:'0.5rem',
              boxShadow: (!isSubmitting && location && imageFile) ? '0 4px 14px rgba(232,98,42,0.4)' : 'none',
            }}>
            {isSubmitting ? 'Uploading…' : '📤 Post Donation'}
          </button>
        </form>
      </div>
    </div>
  );
}
