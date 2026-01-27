import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Property } from '@/types/property';
import { formatPrice } from '@/lib/formatUtils';
import { normalizeImageUrl, getFallbackImage } from '@/lib/imageUtils';

interface PropertyCardProps {
  property: Property;
  showEnquire?: boolean;
  onEnquire?: (property: Property) => void;
}

export default function PropertyCard({ property, showEnquire = true, onEnquire }: PropertyCardProps) {
  const isHighYield = property.isHighYield ?? ((property.yield || 0) >= 8);
  const fallbackImage = getFallbackImage(property.id);
  
  // Get all available image URLs (prioritize property.image, then images array)
  // Remove duplicates while preserving order
  const imageSet = new Set<string>();
  if (property.image) imageSet.add(property.image);
  if (property.images) {
    property.images.forEach(img => {
      if (img) imageSet.add(img);
    });
  }
  const allImages = Array.from(imageSet);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [useFallback, setUseFallback] = useState(false);
  
  // Determine which image to show - normalize URLs
  const currentImage = allImages.length > 0 ? allImages[currentImageIndex] : null;
  const imgSrc = useFallback || !currentImage
    ? fallbackImage 
    : normalizeImageUrl(currentImage, fallbackImage);

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
        <div className="text-sm text-text-muted mb-1">
          {property.city && property.city !== 'Unknown' && property.postcode 
            ? `${property.city}, ${property.postcode}`
            : property.city && property.city !== 'Unknown'
            ? property.city
            : property.postcode || ''}
        </div>
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

