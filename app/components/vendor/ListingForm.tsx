'use client';

import React, { useState } from 'react';
import { Listing } from '../../lib/types';
import { AlertCircle, Upload, X, Plus } from 'lucide-react';

interface ListingFormProps {
  initialData?: Listing;
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
  isEditing?: boolean;
}

const CATEGORIES = [
  { value: 'event_venue', label: 'Event Venue' },
  { value: 'catering', label: 'Catering Service' },
  { value: 'accommodation', label: 'Accommodation' },
];

const AMENITIES_OPTIONS = [
  'WiFi',
  'Parking',
  'Air Conditioning',
  'Heating',
  'Kitchen',
  'Bar',
  'Dance Floor',
  'Sound System',
  'Projector',
  'Wheelchair Accessible',
  'Free Cancellation',
  'Pet Friendly',
];

export function ListingForm({
  initialData,
  onSubmit,
  loading = false,
  isEditing = false,
}: ListingFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    address: initialData?.location?.address || '',
    city: initialData?.location?.city || '',
    capacity: initialData?.capacity || '',
    startingPrice: initialData?.startingPrice || '',
    amenities: initialData?.amenities || [],
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>(
    initialData?.images || []
  );
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    initialData?.amenities || []
  );
  const [error, setError] = useState<string | null>(null);
  const [showAmenitiesDropdown, setShowAmenitiesDropdown] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'capacity' || name === 'startingPrice' ? value : value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length + imagePreviewUrls.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    setImages((prev) => [...prev, ...files]);

    // Create preview URLs
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrls((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
    if (index < images.length) {
      setImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }
    if (!formData.category) {
      setError('Category is required');
      return;
    }
    if (!formData.address.trim()) {
      setError('Address is required');
      return;
    }
    if (!formData.city.trim()) {
      setError('City is required');
      return;
    }
    if (!formData.capacity || parseInt(formData.capacity) < 1) {
      setError('Capacity must be at least 1');
      return;
    }
    if (!formData.startingPrice || parseFloat(formData.startingPrice) < 0) {
      setError('Price must be greater than 0');
      return;
    }

    if (!isEditing && imagePreviewUrls.length === 0) {
      setError('At least one image is required');
      return;
    }

    try {
      const submitData = {
        ...formData,
        capacity: parseInt(formData.capacity),
        startingPrice: parseFloat(formData.startingPrice),
        amenities: selectedAmenities,
        images: imagePreviewUrls,
        newImages: images,
      };

      await onSubmit(submitData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save listing'
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-red-700">{error}</div>
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Listing Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g., Elegant Wedding Venue in Nairobi"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Be specific and descriptive (50-100 characters)
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe your listing in detail. Include features, highlights, and what makes it special."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            rows={6}
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Minimum 50 characters (current: {formData.description.length})
          </p>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={loading}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Location</h2>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address *
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="e.g., 123 Main Street, Westlands"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={loading}
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City *
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            placeholder="e.g., Nairobi"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={loading}
          />
        </div>
      </div>

      {/* Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Details</h2>

        <div className="grid grid-cols-2 gap-6">
          {/* Capacity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capacity (Guests) *
            </label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleInputChange}
              placeholder="e.g., 500"
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={loading}
            />
          </div>

          {/* Starting Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Starting Price (KSh) *
            </label>
            <input
              type="number"
              name="startingPrice"
              value={formData.startingPrice}
              onChange={handleInputChange}
              placeholder="e.g., 50000"
              min="0"
              step="1000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Images</h2>

        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition">
          <Upload size={32} className="mx-auto text-gray-400 mb-2" />
          <p className="text-gray-600 mb-2">Drag and drop your images here</p>
          <p className="text-sm text-gray-500 mb-4">or</p>
          <label className="inline-block">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              disabled={loading || imagePreviewUrls.length >= 5}
              className="hidden"
            />
            <span className="px-4 py-2 bg-primary-600 text-white rounded-lg cursor-pointer hover:bg-primary-700 inline-block">
              Select Images
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-4">
            Maximum 5 images. Supported formats: JPG, PNG, WebP
          </p>
        </div>

        {/* Image Previews */}
        {imagePreviewUrls.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">
              {imagePreviewUrls.length} / 5 Images
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {imagePreviewUrls.map((url, index) => (
                <div
                  key={index}
                  className="relative w-full h-24 rounded-lg overflow-hidden bg-gray-100"
                >
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Amenities */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Amenities</h2>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAmenitiesDropdown(!showAmenitiesDropdown)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-left flex justify-between items-center hover:bg-gray-50"
          >
            <span className="text-gray-700">
              {selectedAmenities.length > 0
                ? `${selectedAmenities.length} selected`
                : 'Select amenities...'}
            </span>
            <span>{showAmenitiesDropdown ? '▲' : '▼'}</span>
          </button>

          {showAmenitiesDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
              <div className="p-4 grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {AMENITIES_OPTIONS.map((amenity) => (
                  <label
                    key={amenity}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selected Amenities Tags */}
        {selectedAmenities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedAmenities.map((amenity) => (
              <div
                key={amenity}
                className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
              >
                <span>{amenity}</span>
                <button
                  type="button"
                  onClick={() => handleAmenityToggle(amenity)}
                  className="hover:text-primary-900"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className={`flex-1 py-3 px-6 rounded-lg font-semibold text-white transition ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700'
          }`}
        >
          {loading ? 'Saving...' : isEditing ? 'Update Listing' : 'Create Listing'}
        </button>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex-1 py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}