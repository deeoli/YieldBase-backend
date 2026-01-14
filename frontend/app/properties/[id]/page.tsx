'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Property } from '@/types/property';
import { getPropertyById } from '@/lib/getProperties';
import { normalizeImageUrl } from '@/lib/imageUtils';

export default function PropertyDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  // ALL HOOKS MUST BE AT THE TOP - before any conditional returns
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [allImagesFailed, setAllImagesFailed] = useState(false);
  const [currentMainImage, setCurrentMainImage] = useState<string>('');
  
  // Unique fallback images per property
  const FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
    'https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?w=800',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
  ];
  
  const getFallbackImage = (propId: string): string => {
    const index = parseInt(propId.replace(/\D/g, ''), 10) || 0;
    return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
  };
  
  const fallbackImage = getFallbackImage(id || '0');

  // Load property data
  useEffect(() => {
    async function loadProperty() {
      if (!id) return;
      try {
        const data = await getPropertyById(id);
        console.log('[PropertyDetail] Loaded property:', {
          id,
          hasImage: !!data?.image,
          imagesCount: data?.images?.length || 0,
          firstImage: data?.image,
          firstImages: data?.images?.slice(0, 3)
        });
        setProperty(data);
        if (data) {
          setFormData((prev) => ({
            ...prev,
            message: `Hi YieldBase team, I'm interested in "${data.title}" (${data.city}, ${data.postcode}). Please share the next steps.`,
          }));
        }
      } catch (error) {
        console.error('[PropertyDetail] Error loading property:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProperty();
  }, [id]);

  // Update main image when selection or property changes
  useEffect(() => {
    if (!property) {
      setCurrentMainImage(fallbackImage);
      return;
    }

    // Calculate images based on property
    const allImages = property.images && property.images.length > 0
      ? property.images.map((u) => normalizeImageUrl(u, fallbackImage))
      : property.image
      ? [normalizeImageUrl(property.image, fallbackImage)]
      : [];

    const validImages = allImages.filter(img => img && img.trim() !== '');
    
    // If no valid images, create multiple fallback images for thumbnails
    let displayImages: string[];
    if (validImages.length > 0) {
      displayImages = validImages;
    } else {
      // Use multiple fallback images so thumbnails can display
      displayImages = [
        fallbackImage,
        FALLBACK_IMAGES[(FALLBACK_IMAGES.indexOf(fallbackImage) + 1) % FALLBACK_IMAGES.length],
        FALLBACK_IMAGES[(FALLBACK_IMAGES.indexOf(fallbackImage) + 2) % FALLBACK_IMAGES.length],
        FALLBACK_IMAGES[(FALLBACK_IMAGES.indexOf(fallbackImage) + 3) % FALLBACK_IMAGES.length],
      ];
    }

    if (displayImages.length > 0) {
      const newImage = displayImages[selectedImageIndex] || displayImages[0];
      setCurrentMainImage(newImage);
      setAllImagesFailed(false);
    } else {
      setCurrentMainImage(fallbackImage);
    }
  }, [selectedImageIndex, property, fallbackImage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          propertyId: id,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setFormData({ name: '', email: '', phone: '', message: '' });
        }, 3000);
      }
    } catch (error) {
      console.error('Error submitting enquiry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy"></div>
          <p className="mt-4 text-text-muted">Loading property...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold text-text-dark mb-4">
            Property Not Found
          </h1>
          <Link
            href="/properties"
            className="text-primary-navy hover:underline"
          >
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  // Calculate images for rendering (only used after property is confirmed to exist)
  const allImages = property.images && property.images.length > 0
    ? property.images.map((u) => normalizeImageUrl(u, fallbackImage))
    : property.image
    ? [normalizeImageUrl(property.image, fallbackImage)]
    : [];

    const validImages = allImages.filter(img => img && img.trim() !== '');
    
    // If no valid images, create multiple fallback images for thumbnails
    let displayImages: string[];
    if (validImages.length > 0) {
      displayImages = validImages;
    } else {
      // Use multiple fallback images so thumbnails can display
      const fallbackIndex = FALLBACK_IMAGES.indexOf(fallbackImage);
      displayImages = [
        fallbackImage,
        FALLBACK_IMAGES[(fallbackIndex + 1) % FALLBACK_IMAGES.length],
        FALLBACK_IMAGES[(fallbackIndex + 2) % FALLBACK_IMAGES.length],
        FALLBACK_IMAGES[(fallbackIndex + 3) % FALLBACK_IMAGES.length],
      ];
    }

  const currencyFormatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: property.currency || 'GBP',
    maximumFractionDigits: 0,
  });

  const isHighYield = property.isHighYield ?? ((property.yield || 0) >= 8);
  const mainImage = allImagesFailed ? fallbackImage : (currentMainImage || fallbackImage);

  return (
    <>
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/properties"
            className="text-text-muted hover:text-primary-navy mb-4 inline-block"
          >
            ← Back to Properties
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left - Gallery */}
            <div>
              <div className="relative aspect-video w-full mb-4 rounded-2xl overflow-hidden cursor-pointer bg-gray-200"
                   onClick={() => setIsLightboxOpen(true)}>
                {mainImage && (
                  <img
                    key={`main-${selectedImageIndex}-${Date.now()}`}
                    src={mainImage}
                    alt={property.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      // Don't retry if it's already the fallback
                      if (target.src.includes('unsplash.com') || allImagesFailed) {
                        return;
                      }
                      
                      console.error(`[PropertyDetail] Image failed to load: ${mainImage}`);
                      const newErrors = new Set(imageErrors);
                      newErrors.add(selectedImageIndex);
                      setImageErrors(newErrors);
                      
                      // Try next image if available
                      let nextIndex = selectedImageIndex + 1;
                      while (nextIndex < displayImages.length && newErrors.has(nextIndex)) {
                        nextIndex++;
                      }
                      
                      if (nextIndex < displayImages.length) {
                        setSelectedImageIndex(nextIndex);
                      } else {
                        // All images failed, show fallback
                        setAllImagesFailed(true);
                        setCurrentMainImage(fallbackImage);
                        target.src = fallbackImage; // Force update
                      }
                    }}
                    onLoad={() => {
                      if (!mainImage.includes('unsplash.com')) {
                        console.log(`[PropertyDetail] Image loaded successfully: ${mainImage}`);
                      }
                    }}
                  />
                )}
              </div>
              {displayImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {displayImages.slice(0, 4).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === idx
                          ? 'border-accent-gold'
                          : 'border-transparent hover:border-border-grey'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${property.title} ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error(`[PropertyDetail] Thumbnail ${idx} failed: ${img}`);
                          // Replace with property-specific fallback image
                          const target = e.target as HTMLImageElement;
                          if (!target.src.includes('unsplash.com')) {
                            target.src = fallbackImage;
                          }
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right - Summary Panel */}
            <div>
              <div className="mb-4">
                <div className="text-sm text-text-muted mb-2">
                  {property.city}, {property.postcode} 🇬🇧
                </div>
                <h1 className="text-3xl font-heading font-bold text-text-dark mb-4">
                  {property.title}
                </h1>
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-4xl font-heading font-bold text-primary-navy">
                    {currencyFormatter.format(property.price)}
                  </div>
                  {property.yield && (
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-accent-gold">
                        {property.yield.toFixed(1)}% Yield
                      </span>
                      {isHighYield && (
                        <span className="bg-yield-high-bg text-yield-high-text px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                          🔥 High Yield
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-background-light rounded-xl p-6 mb-6">
                <ul className="space-y-2 text-text-dark">
                  <li className="flex items-center gap-2">
                    <span className="text-accent-gold">✓</span>
                    {property.beds} Bedrooms
                  </li>
                  {property.baths !== undefined && (
                    <li className="flex items-center gap-2">
                      <span className="text-accent-gold">✓</span>
                      {property.baths} Bathrooms
                    </li>
                  )}
                  {property.tenure && (
                    <li className="flex items-center gap-2">
                      <span className="text-accent-gold">✓</span>
                      Tenure: {property.tenure}
                    </li>
                  )}
                  {property.floorArea && (
                    <li className="flex items-center gap-2">
                      <span className="text-accent-gold">✓</span>
                      Floor Area: {property.floorArea} sq ft
                    </li>
                  )}
                  {property.estimatedMonthlyRent && (
                    <li className="flex items-center gap-2">
                      <span className="text-accent-gold">✓</span>
                      Estimated Rent: {currencyFormatter.format(property.estimatedMonthlyRent)}/month
                    </li>
                  )}
                  {property.features && property.features.length > 0 && (
                    <li className="flex items-center gap-2 text-text-muted">
                      <span className="text-accent-gold">✓</span>
                      Ideal for {property.features.join(', ')}
                    </li>
                  )}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={() => {
                    const form = document.getElementById('enquiry-form');
                    form?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex-1 bg-primary-navy text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
                >
                  Enquire About This Property
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Details Grid */}
      <div className="bg-background-light py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-heading font-bold text-text-dark mb-6">
            Key Details
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white rounded-xl p-4">
              <div className="text-sm text-text-muted mb-1">Bedrooms</div>
              <div className="text-xl font-heading font-semibold text-text-dark">
                {property.beds}
              </div>
            </div>
            {property.baths !== undefined && (
              <div className="bg-white rounded-xl p-4">
                <div className="text-sm text-text-muted mb-1">Bathrooms</div>
                <div className="text-xl font-heading font-semibold text-text-dark">
                  {property.baths}
                </div>
              </div>
            )}
            {property.tenure && (
              <div className="bg-white rounded-xl p-4">
                <div className="text-sm text-text-muted mb-1">Tenure</div>
                <div className="text-xl font-heading font-semibold text-text-dark">
                  {property.tenure}
                </div>
              </div>
            )}
            {property.floorArea && (
              <div className="bg-white rounded-xl p-4">
                <div className="text-sm text-text-muted mb-1">Floor Area</div>
                <div className="text-xl font-heading font-semibold text-text-dark">
                  {property.floorArea} sq ft
                </div>
              </div>
            )}
            {property.estimatedMonthlyRent && (
              <div className="bg-white rounded-xl p-4">
                <div className="text-sm text-text-muted mb-1">Est. Monthly Rent</div>
                <div className="text-xl font-heading font-semibold text-text-dark">
                  {currencyFormatter.format(property.estimatedMonthlyRent)}/mo
                </div>
              </div>
            )}
            {property.estimatedAnnualRent && (
              <div className="bg-white rounded-xl p-4">
                <div className="text-sm text-text-muted mb-1">Est. Annual Rent</div>
                <div className="text-xl font-heading font-semibold text-text-dark">
                  {currencyFormatter.format(property.estimatedAnnualRent)}
                </div>
              </div>
            )}
            {property.yield && (
              <div className="bg-white rounded-xl p-4">
                <div className="text-sm text-text-muted mb-1">Yield</div>
                <div className="text-xl font-heading font-semibold text-accent-gold">
                  {property.yield.toFixed(1)}%
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Investment Summary */}
      {property.description && (
        <div className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-heading font-bold text-text-dark mb-4">
              Investment Summary
            </h2>
            <p className="text-text-muted leading-relaxed max-w-3xl">
              {property.description}
            </p>
          </div>
        </div>
      )}

      {/* Location */}
      <div className="bg-white py-12 border-t border-border-grey">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-heading font-bold text-text-dark mb-4">
            Location
          </h2>
          <p className="text-text-muted">{property.address}</p>
        </div>
      </div>

      {/* Enquiry Form */}
      <div id="enquiry-form" className="bg-background-light py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-heading font-bold text-text-dark mb-6">
            Enquire About This Property
          </h2>
          {submitted ? (
            <div className="bg-yield-high-bg text-yield-high-text p-6 rounded-xl text-center">
              <div className="text-4xl mb-2">✓</div>
              <p className="text-lg font-semibold">Thank you for your enquiry!</p>
              <p>We&apos;ll get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-text-dark mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-border-grey rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-dark mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-border-grey rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-text-dark mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-border-grey rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-text-dark mb-1">
                  Message *
                </label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2 border border-border-grey rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-navy text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Enquiry'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 text-white text-2xl"
            aria-label="Close"
          >
            ×
          </button>
          <div className="relative max-w-5xl w-full h-full flex items-center justify-center">
            <Image
              src={mainImage}
              alt={property.title}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>
        </div>
      )}
    </>
  );
}

