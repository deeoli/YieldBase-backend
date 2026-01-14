import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Property } from '@/types/property';
import { formatPrice } from '@/lib/formatUtils';
import { getFallbackImage } from '@/lib/imageUtils';
import { SCRAPER_API_BASE_URL } from '@/lib/constants';

interface PropertyCardProps {
  property: Property;
  showEnquire?: boolean;
  onEnquire?: (property: Property) => void;
}

export default function PropertyCard({ property, showEnquire = true, onEnquire }: PropertyCardProps) {
  const isHighYield = property.isHighYield ?? ((property.yield || 0) >= 8);
  const fallbackImage = getFallbackImage(property.id);
  
  // Build image candidates in priority (no fallback in this list):
  // A) cached single image_path -> `${SCRAPER_API_BASE_URL}/images/<filename>`
  // B) cached image_paths[] -> same conversion
  // C) remote main image (property.image) with cache-buster if Rightmove
  // D) remote gallery images (property.images) with cache-buster if Rightmove
  const raw: any = property as any;
  const candidates: string[] = [];
  const toRightmoveCb = (url: string) =>
    url.includes('media.rightmove.co.uk') ? (url.includes('?') ? `${url}&cb=${property.id}` : `${url}?cb=${property.id}`) : url;
  const toCachedUrl = (p: string) => {
    const file = (p || '').split(/[\\\\/]/).pop() as string || '';
    return file ? `${SCRAPER_API_BASE_URL}/images/${encodeURIComponent(file)}` : '';
  };
  if (typeof raw?.image_path === 'string' && raw.image_path) {
    const u = toCachedUrl(raw.image_path);
    if (u) {
      candidates.push(u);
    }
  }
  if (Array.isArray(raw?.image_paths)) {
    for (const p of raw.image_paths as any[]) {
      if (typeof p === 'string') {
        const u = toCachedUrl(p);
        if (u) {
          candidates.push(u);
        }
      }
    }
  }
  if (typeof property.image === 'string' && property.image) {
    candidates.push(toRightmoveCb(property.image));
  }
  if (Array.isArray(property.images)) {
    for (const u of property.images as any[]) {
      if (typeof u === 'string') {
        candidates.push(toRightmoveCb(u));
      }
    }
  }
  const isAllowedUrl = (u: string) =>
    (u.startsWith('http') || u.startsWith('/api/images/')) && !u.includes('media_cache') && !u.includes('\\');
  const allImages = Array.from(new Set(candidates.filter(isAllowedUrl)));
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [useFallback, setUseFallback] = useState(false);
  
  // Determine which image to show; only use fallback after exhausting real URLs
  const currentImage = allImages.length > 0 ? allImages[currentImageIndex] : null;
  const imgSrc = useFallback || !currentImage ? fallbackImage : (currentImage as string);

  const handleImageError = () => {
    // Try next image in the array if available
    if (currentImageIndex < allImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else {
      // All images failed, use fallback
      setUseFallback(true);
    }
  };

  // Check if image URL is from Rightmove (might be expired/404) or backend
  // Use regular img tag for Rightmove images and backend images to avoid Next.js optimization issues
  const isRightmoveImage = imgSrc.includes('media.rightmove.co.uk');
  const isBackendImage = imgSrc.includes('/api/images/');
  const useRegularImg = isRightmoveImage || isBackendImage;

  const hasCity = !!property.city && property.city !== 'Unknown';
  const hasPostcode = !!property.postcode;

  return (
    <div className="bg-card-bg rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <div className="relative h-[220px] w-full bg-gray-200">
        {useRegularImg ? (
          <img
            src={imgSrc}
            alt={property.title}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <Image
            src={imgSrc}
            alt={property.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={handleImageError}
          />
        )}
        {isHighYield && (
          <div className="absolute top-3 right-3 bg-yield-high-bg text-yield-high-text px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <span role="img" aria-label="high yield">
              🔥
            </span>
            High Yield
          </div>
        )}
      </div>

      <div className="p-6">
        {(hasCity || hasPostcode) && (
          <div className="text-sm text-text-muted mb-1">
            {[hasCity ? property.city : null, hasPostcode ? property.postcode : null]
              .filter(Boolean)
              .join(', ')}
          </div>
        )}

        <h3 className="text-lg font-heading font-semibold text-text-dark mb-2 line-clamp-2">
          {property.title}
        </h3>

        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-heading font-bold text-primary-navy">
            {formatPrice(property.price, property.currency)}
          </div>
          {property.yield && (
            <div className="text-right">
              <div className="text-sm text-text-muted">Yield</div>
              <div className="text-lg font-semibold text-accent-gold">{property.yield.toFixed(1)}%</div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-text-muted mb-4">
          <span>{property.beds} bed</span>
          {property.baths !== undefined && <span>{property.baths} bath</span>}
        </div>

        <div className="flex gap-2">
          <Link
            href={`/properties/${property.id}`}
            className="flex-1 bg-primary-navy text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors text-center"
          >
            View Details
          </Link>
          {showEnquire && (
            <button
              onClick={() => onEnquire?.(property)}
              className="flex-1 bg-accent-gold text-primary-navy px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
            >
              Enquire
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
