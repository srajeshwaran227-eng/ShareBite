import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { MapPin, Image as ImageIcon, Loader2 } from 'lucide-react';

export default function FoodUploadForm({ onSuccess }) {
  const { userProfile } = useAuth();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    foodName: '',
    quantity: '',
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  function handleImageChange(e) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  function getLocation() {
    setIsLocating(true);
    setLocationError('');
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsLocating(false);
      },
      () => {
        setLocationError('Unable to retrieve your location. Please allow location access.');
        setIsLocating(false);
      }
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!location) {
      setError('Please detect your location first.');
      return;
    }
    if (!imageFile) {
      setError('Please provide a photo of the food.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      // 1. Upload image to Firebase Storage
      const storageRef = ref(storage, `food_images/${Date.now()}_${imageFile.name}`);
      const uploadResult = await uploadBytes(storageRef, imageFile);
      const imageUrl = await getDownloadURL(uploadResult.ref);

      // 2. Save data to Firestore
      const postData = {
        food_name: formData.foodName,
        quantity: formData.quantity,
        image_url: imageUrl,
        donor_id: userProfile.id,
        donor_name: userProfile.name,
        contact: userProfile.phone,
        location: location,
        status: 'available',
        createdAt: serverTimestamp() // Used for 3-hour expiration
      };

      await addDoc(collection(db, 'foodPosts'), postData);
      
      // Reset form on success
      setFormData({ foodName: '', quantity: '' });
      setImageFile(null);
      setImagePreview('');
      setLocation(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      if (onSuccess) onSuccess();

    } catch (err) {
      console.error('Error submitting food post: ', err);
      setError('Failed to upload food post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="card">
      <div className="card-body">
        <h3 style={{ marginBottom: 'var(--spacing-4)' }}>Donate Food</h3>
        
        {error && (
          <div style={{ backgroundColor: 'var(--error-color)', color: 'white', padding: 'var(--spacing-2)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-4)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="foodName">Food Name</label>
            <input 
              id="foodName"
              className="form-control"
              value={formData.foodName}
              onChange={(e) => setFormData({...formData, foodName: e.target.value})}
              placeholder="e.g. 5 loaves of bread, Rice and Curry"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="quantity">Quantity (e.g., kg, pieces, meals)</label>
            <input 
              id="quantity"
              className="form-control"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              placeholder="e.g. 2 kg, 10 meals"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Food Photo</label>
            <div 
              style={{ 
                border: '2px dashed var(--border-color)', 
                borderRadius: 'var(--radius-md)',
                padding: 'var(--spacing-4)',
                textAlign: 'center',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleImageChange}
              />
              
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} 
                />
              ) : (
                <div className="flex-col items-center justify-center" style={{ color: 'var(--text-secondary)' }}>
                  <ImageIcon size={32} style={{ marginBottom: 'var(--spacing-2)' }} />
                  <p>Click to upload a photo</p>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location Pickup</label>
            {location ? (
              <div className="flex items-center gap-2" style={{ color: 'var(--success-color)', fontSize: '0.875rem' }}>
                <MapPin size={16} />
                <span>Location detected successfully</span>
              </div>
            ) : (
              <div>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={getLocation}
                  disabled={isLocating}
                  style={{ width: '100%', gap: 'var(--spacing-2)' }}
                >
                  {isLocating ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
                  {isLocating ? 'Detecting Location...' : 'Detect My Location'}
                </button>
                {locationError && <p style={{ color: 'var(--error-color)', fontSize: '0.75rem', marginTop: 'var(--spacing-1)' }}>{locationError}</p>}
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: 'var(--spacing-4)' }}
            disabled={isSubmitting || !location || !imageFile}
          >
            {isSubmitting ? 'Uploading...' : 'Publish Food Donation'}
          </button>
        </form>
      </div>
    </div>
  );
}
