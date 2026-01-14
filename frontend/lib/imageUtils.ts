/**
 * Image utility functions for property images
 */
import { FALLBACK_IMAGES } from './constants';
import { SCRAPER_API_BASE_URL } from './constants';

/**
 * Get a unique fallback image based on property ID
 */
export function getFallbackImage(propertyId: string): string {
  const digits = propertyId.replace(/\D/g, '');
  let index: number;
  if (digits.length > 0) {
    index = Number(digits) % FALLBACK_IMAGES.length;
  } else {
    // Deterministic string hash when no digits exist in the id
    let hash = 0;
    for (let i = 0; i < propertyId.length; i++) {
      hash = (hash * 31 + propertyId.charCodeAt(i)) >>> 0;
    }
    index = hash % FALLBACK_IMAGES.length;
  }
  return FALLBACK_IMAGES[index];
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
  
  // Handle /api/images/ paths (avoid double /api)
  if (url.startsWith('/api/images/')) {
    // If SCRAPER_API_BASE_URL already ends with /api, strip it for image URLs
    const base = SCRAPER_API_BASE_URL.endsWith('/api')
      ? SCRAPER_API_BASE_URL.slice(0, -4)
      : SCRAPER_API_BASE_URL;
    const baseUrl = base.endsWith('/')
      ? base.slice(0, -1)
      : base;
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
 * Process property images array - normalize URLs and add fallbacks if needed
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
    .filter(img => img && img.trim() !== '');
  
  return normalized.length > 0 ? normalized : getFallbackImageSet(propertyId, 4);
}

