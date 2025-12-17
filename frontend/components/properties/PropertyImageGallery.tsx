/**
 * Property Image Gallery Component
 * Displays main image and thumbnails with error handling
 */
'use client';

import { useState } from 'react';
import { useImageHandling } from '@/hooks/useImageHandling';

interface PropertyImageGalleryProps {
  images?: string[] | null;
  propertyId: string;
  title: string;
  fallback?: string;
}

export default function PropertyImageGallery({
  images,
  propertyId,
  title,
  fallback,
}: PropertyImageGalleryProps) {
  const {
    displayImages,
    currentImage,
    currentImageIndex,
    handleImageError,
    selectImage,
  } = useImageHandling({ images, propertyId, fallback });

  return (
    <div>
      {/* Main Image */}
      <div className="relative aspect-video w-full mb-4 rounded-2xl overflow-hidden cursor-pointer bg-gray-200">
        <img
          key={`main-${currentImageIndex}-${Date.now()}`}
          src={currentImage}
          alt={title}
          className="w-full h-full object-cover"
          onError={() => handleImageError(currentImageIndex)}
        />
      </div>

      {/* Thumbnails */}
      {displayImages.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {displayImages.slice(0, 4).map((img, idx) => (
            <button
              key={idx}
              onClick={() => selectImage(idx)}
              className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                currentImageIndex === idx
                  ? 'border-accent-gold'
                  : 'border-transparent hover:border-border-grey'
              }`}
            >
              <img
                src={img}
                alt={`${title} ${idx + 1}`}
                className="w-full h-full object-cover"
                onError={() => handleImageError(idx)}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

