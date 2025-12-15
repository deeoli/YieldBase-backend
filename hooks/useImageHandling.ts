/**
 * Custom hook for handling property images with error handling
 */
import { useState, useEffect, useCallback } from 'react';
import { processPropertyImages, getFallbackImage } from '@/lib/imageUtils';

interface UseImageHandlingOptions {
  images?: string[] | null;
  propertyId: string;
  fallback?: string;
}

export function useImageHandling({ images, propertyId, fallback }: UseImageHandlingOptions) {
  const [displayImages, setDisplayImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [allImagesFailed, setAllImagesFailed] = useState(false);

  const fallbackImage = fallback || getFallbackImage(propertyId);

  useEffect(() => {
    const processed = processPropertyImages(images, propertyId, fallbackImage);
    setDisplayImages(processed);
    setCurrentImageIndex(0);
    setImageErrors(new Set());
    setAllImagesFailed(false);
  }, [images, propertyId, fallbackImage]);

  const handleImageError = useCallback((index: number) => {
    setImageErrors(prev => new Set(prev).add(index));
    
    // If all images failed, mark as failed
    const newErrors = new Set(imageErrors).add(index);
    if (newErrors.size >= displayImages.length) {
      setAllImagesFailed(true);
    }
  }, [displayImages.length, imageErrors]);

  const currentImage = displayImages[currentImageIndex] || fallbackImage;
  const hasNextImage = currentImageIndex < displayImages.length - 1;
  const hasPreviousImage = currentImageIndex > 0;

  const nextImage = useCallback(() => {
    if (hasNextImage) {
      setCurrentImageIndex(prev => prev + 1);
    }
  }, [hasNextImage]);

  const previousImage = useCallback(() => {
    if (hasPreviousImage) {
      setCurrentImageIndex(prev => prev - 1);
    }
  }, [hasPreviousImage]);

  const selectImage = useCallback((index: number) => {
    if (index >= 0 && index < displayImages.length) {
      setCurrentImageIndex(index);
    }
  }, [displayImages.length]);

  return {
    displayImages,
    currentImage,
    currentImageIndex,
    imageErrors,
    allImagesFailed,
    fallbackImage,
    handleImageError,
    nextImage,
    previousImage,
    selectImage,
    hasNextImage,
    hasPreviousImage,
  };
}

