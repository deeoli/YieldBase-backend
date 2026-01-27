/**
 * Image utility functions for property images
 */
import { FALLBACK_IMAGES } from './constants';
import { SCRAPER_API_BASE_URL } from './constants';

/**
 * Get a unique fallback image based on property ID
 */
export function getFallbackImage(propertyId: string): string {
  const index = parseInt(propertyId.replace(/\D/g, ''), 10) || 0;
  return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
}

/**
 * Normalize image URL - converts relative backend paths to absolute URLs
 */
export function normalizeImageUrl(url: string | null | undefined, fallback?: string): string {
  const defaultFallback = fallback || FALLBACK_IMAGES[0];
  
  if (!url) return defaultFallback;
  
  // If it's already a full URL, use it as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a backend image path (/images/...), prepend the backend base URL
  if (url.startsWith('/images/')) {
    const baseUrl = SCRAPER_API_BASE_URL.endsWith('/') 
      ? SCRAPER_API_BASE_URL.slice(0, -1) 
      : SCRAPER_API_BASE_URL;
    return `${baseUrl}${url}`;
  }
  
  // Handle /api/images/ paths
  if (url.startsWith('/api/images/')) {
    const baseUrl = SCRAPER_API_BASE_URL.endsWith('/') 
      ? SCRAPER_API_BASE_URL.slice(0, -1) 
      : SCRAPER_API_BASE_URL;
    return `${baseUrl}${url}`;
  }
  
  return url;
}

/**
 * Get multiple fallback images for thumbnails when no real images exist
 */
export function getFallbackImageSet(propertyId: string, count: number = 4): string[] {
  const primaryFallback = getFallbackImage(propertyId);
  const fallbackIndex = FALLBACK_IMAGES.indexOf(primaryFallback);
  
  const images: string[] = [];
  for (let i = 0; i < count; i++) {
    const index = (fallbackIndex + i) % FALLBACK_IMAGES.length;
    images.push(FALLBACK_IMAGES[index]);
  }
  
  return images;
}

/**
 * Process property images array - normalize URLs, dedupe, and add fallbacks if needed
 */
export function processPropertyImages(
  images: string[] | null | undefined,
  propertyId: string,
  fallback?: string
): string[] {
  const defaultFallback = fallback || getFallbackImage(propertyId);
  
  if (!images || images.length === 0) {
    return getFallbackImageSet(propertyId, 4);
  }
  
  const normalized = images
    .map(img => normalizeImageUrl(img, defaultFallback))
    .filter(img =>
      img &&
      img.trim() !== '' &&
      !img.includes('media.rightmove.co.uk')  // Block hotlinked Rightmove images (they 404)
    );
  
  // Deduplicate images while preserving order
  const deduped = Array.from(new Set(normalized));
  
  return deduped.length > 0 ? deduped : getFallbackImageSet(propertyId, 4);
}

