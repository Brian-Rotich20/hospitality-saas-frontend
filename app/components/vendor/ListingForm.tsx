'use client';

import React, { useState } from 'react';
import { Listing } from '../../lib/types';
import { AlertCircle, Upload, X } from 'lucide-react';

interface ListingFormProps {
  initialData?: Listing;
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
  isEditing?: boolean;
}

const CATEGORIES = [
  { value: 'event_venue',    label: 'Event Venue'      },
  { value: 'catering',       label: 'Catering Service' },
  { value: 'accommodation',  label: 'Accommodation'    },
  { value: 'other',          label: 'Other'            },
];

const AMENITIES_OPTIONS = [
  'WiFi', 'Parking', 'Air Conditioning', 'Heating', 'Kitchen',
  'Bar', 'Dance Floor', 'Sound System', 'Projector',
  'Wheelchair Accessible', 'Free Cancellation', 'Pet Friendly',
];

const inp: React.CSSProperties = {
  width: '100%', padding: '9px 12px', border: '1px solid #E5E7EB',
  borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff',
  boxSizing: 'border-box', fontFamily: 'DM Sans, system-ui, sans-serif',
  color: '#111827',
};
const lbl: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: '#374151',
  display: 'block', marginBottom: 5,
};
const section: React.CSSProperties = {
  background: '#fff', border: '1px solid #E5E7EB',
  borderRadius: 12, padding: '20px 22px', marginBottom: 16,
};

export function ListingForm({ initialData, onSubmit, loading = false, isEditing = false }: ListingFormProps) {
  // ✅ Read from flat backend fields
  const [formData, setFormData] = useState({
    title:         initialData?.title        ?? '',
    description:   initialData?.description  ?? '',
    category:      initialData?.category     ?? '',
    address:       initialData?.address      ?? '',   // ✅ flat field
    city:          initialData?.city         ?? '',   // ✅ flat field
    capacity:      initialData?.capacity     ?? '',
    startingPrice: initialData?.basePrice    ?? '',   // ✅ basePrice → local startingPrice
    amenities:     initialData?.amenities    ?? [],
  });

  const [newImages,        setNewImages]        = useState<File[]>([]);
  // ✅ existing photos come from listing.photos not listing.images
  const [previewUrls,      setPreviewUrls]      = useState<string[]>(initialData?.photos ?? []);
  const [existingUrls,     setExistingUrls]     = useState<string[]>(initialData?.photos ?? []);
  const [selectedAmenities,setSelectedAmenities]= useState<string[]>(initialData?.amenities ?? []);
  const [formError,        setFormError]        = useState<string | null>(null);
  const [amenitiesOpen,    setAmenitiesOpen]    = useState(false);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length + previewUrls.length > 5) {
      setFormError('Maximum 5 images allowed'); return;
    }
    setNewImages(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrls(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    const url = previewUrls[index];
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    // If it was an existing URL (not a blob preview), remove from existingUrls
    if (existingUrls.includes(url)) {
      setExistingUrls(prev => prev.filter(u => u !== url));
    } else {
      // Remove from newImages by matching order of non-existing previews
      const newOnlyPreviews = previewUrls.filter(u => !existingUrls.includes(u));
      const newIndex = newOnlyPreviews.indexOf(url);
      if (newIndex !== -1) {
        setNewImages(prev => prev.filter((_, i) => i !== newIndex));
      }
    }
  };

  const toggleAmenity = (a: string) =>
    setSelectedAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate
    if (!formData.title.trim())                                          { setFormError('Title is required');                   return; }
    if (formData.description.trim().length < 50)                         { setFormError('Description must be at least 50 characters'); return; }
    if (!formData.category)                                              { setFormError('Category is required');                return; }
    if (!formData.address.trim())                                        { setFormError('Address is required');                 return; }
    if (formData.address.trim().length < 10)                             { setFormError('Address must be at least 10 characters'); return; }
    if (!formData.city.trim())                                           { setFormError('City is required');                    return; }
    if (!formData.capacity || parseInt(String(formData.capacity)) < 1)  { setFormError('Capacity must be at least 1');         return; }
    if (!formData.startingPrice || parseFloat(String(formData.startingPrice)) <= 0) { setFormError('Price must be greater than 0'); return; }
    if (!isEditing && previewUrls.length === 0)                         { setFormError('At least one image is required');      return; }

    await onSubmit({
      ...formData,
      amenities:     selectedAmenities,
      newImages,        // new File[] to upload
      existingPhotos: existingUrls, // ✅ existing Cloudinary URLs to keep
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ fontFamily: 'DM Sans, system-ui, sans-serif' }}>

      {/* Form error */}
      {formError && (
        <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 9, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#991B1B' }}>
          <AlertCircle size={14} /> {formError}
        </div>
      )}

      {/* ── Basic Info ── */}
      <div style={section}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 16px', letterSpacing: '-0.01em' }}>Basic Information</p>

        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Listing Title *</label>
          <input name="title" value={formData.title} onChange={handleInput} disabled={loading}
            placeholder="e.g. Elegant Wedding Venue in Nairobi" style={inp} />
          <span style={{ fontSize: 11, color: '#9CA3AF' }}>Be specific and descriptive (50–100 characters)</span>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Description * <span style={{ color: '#9CA3AF', fontWeight: 400 }}>({formData.description.length} chars, min 50)</span></label>
          <textarea name="description" value={formData.description} onChange={handleInput} disabled={loading}
            rows={5} placeholder="Describe your listing — features, highlights, what makes it special..."
            style={{ ...inp, resize: 'none' }} />
        </div>

        <div>
          <label style={lbl}>Category *</label>
          <select name="category" value={formData.category} onChange={handleInput} disabled={loading} style={inp}>
            <option value="">Select a category</option>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>

      {/* ── Location ── */}
      <div style={section}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>Location</p>

        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Street Address * <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(min 10 chars)</span></label>
          <input name="address" value={formData.address} onChange={handleInput} disabled={loading}
            placeholder="e.g. 123 Main Street, Westlands, Nairobi" style={inp} />
        </div>

        <div>
          <label style={lbl}>City *</label>
          <input name="city" value={formData.city} onChange={handleInput} disabled={loading}
            placeholder="e.g. Nairobi" style={inp} />
        </div>
      </div>

      {/* ── Details ── */}
      <div style={section}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>Details</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={lbl}>Capacity (Guests) *</label>
            <input type="number" name="capacity" value={formData.capacity} onChange={handleInput}
              disabled={loading} min="1" placeholder="e.g. 200" style={inp} />
          </div>
          <div>
            <label style={lbl}>Starting Price (KSh) *</label>
            <input type="number" name="startingPrice" value={formData.startingPrice} onChange={handleInput}
              disabled={loading} min="1" step="500" placeholder="e.g. 50000" style={inp} />
          </div>
        </div>
      </div>

      {/* ── Images ── */}
      <div style={section}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>Photos</p>

        {/* Upload zone */}
        <label style={{
          display: 'block', border: '2px dashed #E5E7EB', borderRadius: 10, padding: '28px 20px',
          textAlign: 'center', cursor: previewUrls.length >= 5 || loading ? 'not-allowed' : 'pointer',
          opacity: previewUrls.length >= 5 || loading ? 0.6 : 1, transition: 'border-color 0.2s',
        }}>
          <input type="file" multiple accept="image/*" onChange={handleImageUpload}
            disabled={loading || previewUrls.length >= 5} style={{ display: 'none' }} />
          <Upload size={26} color="#9CA3AF" style={{ margin: '0 auto 8px' }} />
          <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 4px', fontWeight: 500 }}>Click to select photos</p>
          <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>Max 5 photos · JPG, PNG, WebP</p>
        </label>

        {/* Previews */}
        {previewUrls.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, marginBottom: 8 }}>{previewUrls.length} / 5 photos</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
              {previewUrls.map((url, i) => (
                <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden', background: '#F3F4F6' }}>
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {i === 0 && (
                    <span style={{ position: 'absolute', bottom: 4, left: 4, fontSize: 9, fontWeight: 700, background: '#111827', color: '#fff', padding: '2px 6px', borderRadius: 4 }}>Cover</span>
                  )}
                  <button type="button" onClick={() => handleRemoveImage(i)}
                    style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Amenities ── */}
      <div style={section}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>Amenities</p>

        <div style={{ position: 'relative' }}>
          <button type="button" onClick={() => setAmenitiesOpen(!amenitiesOpen)}
            style={{ ...inp, textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
            <span style={{ color: selectedAmenities.length > 0 ? '#111827' : '#9CA3AF' }}>
              {selectedAmenities.length > 0 ? `${selectedAmenities.length} selected` : 'Select amenities...'}
            </span>
            <span style={{ fontSize: 10, color: '#9CA3AF' }}>{amenitiesOpen ? '▲' : '▼'}</span>
          </button>

          {amenitiesOpen && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 20, padding: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
                {AMENITIES_OPTIONS.map(a => (
                  <label key={a} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#374151' }}>
                    <input type="checkbox" checked={selectedAmenities.includes(a)} onChange={() => toggleAmenity(a)}
                      style={{ width: 14, height: 14, accentColor: '#111827' }} />
                    {a}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {selectedAmenities.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {selectedAmenities.map(a => (
              <span key={a} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: '#F3F4F6', borderRadius: 20, fontSize: 12, color: '#374151', fontWeight: 500 }}>
                {a}
                <button type="button" onClick={() => toggleAmenity(a)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0, display: 'flex' }}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Submit ── */}
      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <button type="submit" disabled={loading} style={{
          flex: 1, padding: '11px 20px', border: 'none', borderRadius: 9,
          background: loading ? '#9CA3AF' : '#111827', color: '#fff',
          fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit',
        }}>
          {loading ? 'Saving...' : isEditing ? 'Update Listing' : 'Create Listing'}
        </button>
        <button type="button" onClick={() => window.history.back()} disabled={loading} style={{
          flex: 1, padding: '11px 20px', border: '1px solid #E5E7EB', borderRadius: 9,
          background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          Cancel
        </button>
      </div>
    </form>
  );
}