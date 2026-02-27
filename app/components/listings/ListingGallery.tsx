'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Heart, Share2 } from 'lucide-react';

interface ListingGalleryProps {
  images: string[];
  onFavoriteChange?: (isFavorite: boolean) => void;
}

export function ListingGallery({ images, onFavoriteChange }: ListingGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const displayImages = images && images.length > 0 ? images : ['/placeholder.jpg'];

  const handleFavoriteClick = () => {
    setIsFavorite(!isFavorite);
    onFavoriteChange?.(!isFavorite);
  };

  return (
    <div className="bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Main Image */}
        <div className="relative w-full h-96 md:h-screen md:max-h-150">
          {displayImages[selectedImageIndex] ? (
            <Image
              src={displayImages[selectedImageIndex]}
              alt="Listing image"
              fill
              className="w-full h-full object-cover"
              priority={true}
              placeholder="blur"
              blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Crect fill='%23374151' width='800' height='600'/%3E%3C/svg%3E"
            />
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <span className="text-gray-400">No image available</span>
            </div>
          )}

          {/* Controls Overlay */}
          <div className="absolute top-4 right-4 flex space-x-2">
            <button
              onClick={handleFavoriteClick}
              className="p-3 bg-white rounded-full hover:bg-gray-100 transition"
            >
              <Heart
                size={20}
                className={isFavorite ? 'fill-red-500 text-red-500' : ''}
              />
            </button>
            <button className="p-3 bg-white rounded-full hover:bg-gray-100 transition">
              <Share2 size={20} />
            </button>
          </div>

          {/* Image Counter */}
          {displayImages.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm">
              {selectedImageIndex + 1} / {displayImages.length}
            </div>
          )}
        </div>

        {/* Thumbnail Gallery */}
        {displayImages.length > 1 && (
          <div className="px-4 py-4 flex space-x-2 overflow-x-auto">
            {displayImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`shrink-0 relative w-24 h-24 rounded-lg overflow-hidden border-2 transition ${
                  selectedImageIndex === index
                    ? 'border-primary-500'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {image ? (
                  <Image
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="w-full h-full object-cover"
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Crect fill='%23d1d5db' width='96' height='96'/%3E%3C/svg%3E"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-400 flex items-center justify-center">
                    <span className="text-xs text-gray-600">No image</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}