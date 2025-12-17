'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Autoplay from 'embla-carousel-autoplay';
import PropertyCard from '@/components/PropertyCard';
import EnquiryModal from '@/components/EnquiryModal';
import { Property } from '@/types/property';
import { getProperties } from '@/lib/getProperties';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export default function HomePage() {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const carouselPlugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true }),
  );

  useEffect(() => {
    async function loadProperties() {
      const properties = await getProperties();
      const sorted = [...properties]
        .sort((a, b) => (b.yield || 0) - (a.yield || 0))
        .slice(0, 4);
      setFeaturedProperties(sorted);
    }
    loadProperties();
  }, []);

  const handleEnquire = (property: Property) => {
    setSelectedProperty(property);
    setIsEnquiryModalOpen(true);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-navy to-[#0a1a33] text-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-accent-gold text-primary-navy px-4 py-1 rounded-full text-sm font-semibold mb-4">
                Invest in UK Student Property
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 leading-tight">
                Own High-Yield UK Properties From Anywhere
              </h1>
              <p className="text-lg text-gray-200 mb-8 leading-relaxed">
                Discover affordable UK property investments near top universities. 
                Low entry prices, high rental yields, and full end-to-end support 
                for global investors.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/properties"
                  className="bg-accent-gold text-primary-navy px-8 py-4 rounded-lg font-semibold hover:bg-opacity-90 transition-all text-center"
                >
                  Browse Properties
                </Link>
                <Link
                  href="/contact"
                  className="bg-white bg-opacity-10 text-white px-8 py-4 rounded-lg font-semibold hover:bg-opacity-20 transition-all text-center border border-white border-opacity-20"
                >
                  Book a Call
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -top-4 -right-4 w-full h-full bg-accent-gold opacity-20 rounded-2xl" />
                <div className="relative bg-white rounded-2xl p-6 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-muted uppercase tracking-wide">Bradford · BD7</p>
                      <p className="text-2xl font-heading font-semibold text-primary-navy mt-1">
                        £78,500
                      </p>
                    </div>
                    <span className="bg-yield-high-bg text-yield-high-text text-xs font-semibold px-3 py-1 rounded-full">
                      🔥 High Yield
                    </span>
                  </div>
                  <div className="rounded-xl overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600"
                      alt="Featured property"
                      width={540}
                      height={360}
                      className="w-full h-60 object-cover"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-background-light rounded-xl py-3">
                      <p className="text-xs text-text-muted">Beds</p>
                      <p className="text-lg font-heading font-semibold text-text-dark">3</p>
                    </div>
                    <div className="bg-background-light rounded-xl py-3">
                      <p className="text-xs text-text-muted">Yield</p>
                      <p className="text-lg font-heading font-semibold text-accent-gold">8.4%</p>
                    </div>
                    <div className="bg-background-light rounded-xl py-3">
                      <p className="text-xs text-text-muted">Rent</p>
                      <p className="text-lg font-heading font-semibold text-text-dark">£525/mo</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card-bg rounded-2xl p-6 shadow-md hover:shadow-lg transition-all">
              <div className="text-4xl mb-4"></div>
              <h3 className="text-xl font-heading font-semibold text-text-dark mb-2">
                Low Entry Prices
              </h3>
              <p className="text-text-muted">
                Properties starting from £60k–£100k, making UK property investment accessible.
              </p>
            </div>
            <div className="bg-card-bg rounded-2xl p-6 shadow-md hover:shadow-lg transition-all">
              <div className="text-4xl mb-4"></div>
              <h3 className="text-xl font-heading font-semibold text-text-dark mb-2">
                Near UK Universities
              </h3>
              <p className="text-text-muted">
                Strategic locations close to major universities for consistent rental demand.
              </p>
            </div>
            <div className="bg-card-bg rounded-2xl p-6 shadow-md hover:shadow-lg transition-all">
              <div className="text-4xl mb-4"></div>
              <h3 className="text-xl font-heading font-semibold text-text-dark mb-2">
                Full End-to-End Support
              </h3>
              <p className="text-text-muted">
                We handle purchase, renovation, and management so you can invest with confidence.
              </p>
            </div>
            <div className="bg-card-bg rounded-2xl p-6 shadow-md hover:shadow-lg transition-all">
              <div className="text-4xl mb-4"></div>
              <h3 className="text-xl font-heading font-semibold text-text-dark mb-2">
                High Yield Student Lets
              </h3>
              <p className="text-text-muted">
                Strong rental yields typically 7–10%+ from student accommodation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Carousel */}
      {featuredProperties.length > 0 && (
        <section className="py-16 bg-background-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-heading font-bold text-text-dark mb-8 text-center">
              Featured Properties
            </h2>

            <Carousel
              plugins={[carouselPlugin.current]}
              className="w-full"
              onMouseEnter={carouselPlugin.current.stop}
              onMouseLeave={carouselPlugin.current.reset}
            >
              <CarouselContent>
                {featuredProperties.map((property) => (
                  <CarouselItem
                    key={property.id}
                    className="md:basis-1/2 lg:basis-1/3"
                  >
                    <div className="p-2">
                      <PropertyCard
                        property={property}
                        onEnquire={handleEnquire}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>

            <div className="text-center mt-8">
              <Link
                href="/properties"
                className="inline-block bg-primary-navy text-white px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
              >
                View All Properties
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-heading font-bold text-text-dark mb-12 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-gold rounded-full flex items-center justify-center text-2xl font-bold text-primary-navy mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-heading font-semibold text-text-dark mb-2">
                Browse Investments
              </h3>
              <p className="text-text-muted">
                Explore our curated selection of high-yield properties near UK universities.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-gold rounded-full flex items-center justify-center text-2xl font-bold text-primary-navy mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-heading font-semibold text-text-dark mb-2">
                We Handle Purchase & Renovation
              </h3>
              <p className="text-text-muted">
                Our team manages the entire process from purchase to property preparation.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-gold rounded-full flex items-center justify-center text-2xl font-bold text-primary-navy mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-heading font-semibold text-text-dark mb-2">
                You Earn Rent in GBP
              </h3>
              <p className="text-text-muted">
                Start receiving rental income in British Pounds from day one.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Strip */}
      <section className="py-16 bg-primary-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-heading font-bold mb-4">
            Ready to explore high-yield UK properties?
          </h2>
          <p className="text-lg text-gray-200 mb-8">
            Start your investment journey today with properties that deliver strong returns.
          </p>
          <Link
            href="/properties"
            className="inline-block bg-accent-gold text-primary-navy px-8 py-4 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
          >
            View Properties
          </Link>
        </div>
      </section>

      <EnquiryModal
        property={selectedProperty}
        isOpen={isEnquiryModalOpen}
        onClose={() => setIsEnquiryModalOpen(false)}
      />
    </>
  );
}