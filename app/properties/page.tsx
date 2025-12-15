'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PropertyCard from '@/components/PropertyCard';
import EnquiryModal from '@/components/EnquiryModal';
import { Property } from '@/types/property';
import { getProperties } from '@/lib/getProperties';

const ITEMS_PER_PAGE = 6;

function PropertiesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const pageFromUrl = Number(searchParams.get('page')) || 1;
  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  const initialFilters = {
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    beds: searchParams.get('beds') || '',
    city: searchParams.get('city') || '',
    yield: searchParams.get('yield') || '',
  };
  const [formFilters, setFormFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  const loadProperties = useCallback(async () => {
    setLoading(true);
    try {
      const filterParams: any = {};
      if (appliedFilters.minPrice) filterParams.minPrice = Number(appliedFilters.minPrice);
      if (appliedFilters.maxPrice) filterParams.maxPrice = Number(appliedFilters.maxPrice);
      if (appliedFilters.beds) filterParams.beds = Number(appliedFilters.beds);
      if (appliedFilters.city) filterParams.city = appliedFilters.city;
      if (appliedFilters.yield) filterParams.yield = Number(appliedFilters.yield);

      const data = await getProperties(filterParams);
      setAllProperties(data);
      // Reset to page 1 when filters change
      setCurrentPage(1);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  // Calculate paginated properties
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProperties = allProperties.slice(startIndex, endIndex);
  const totalPages = Math.ceil(allProperties.length / ITEMS_PER_PAGE);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  // Sync page from URL on mount
  useEffect(() => {
    const urlPage = Number(searchParams.get('page')) || 1;
    if (urlPage !== currentPage) {
      setCurrentPage(urlPage);
    }
  }, [searchParams]);

  const updateURL = (newFilters: typeof appliedFilters, page: number = 1) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.append(key, value);
      }
    });
    if (page > 1) {
      params.append('page', String(page));
    }
    const query = params.toString();
    router.push(query ? `/properties?${query}` : '/properties');
  };

  const handleFilterChange = (key: string, value: string) => {
    setFormFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    const emptyFilters = { minPrice: '', maxPrice: '', beds: '', city: '', yield: '' };
    setFormFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setCurrentPage(1);
    router.push('/properties');
  };

  const handleApply = () => {
    setAppliedFilters(formFilters);
    setCurrentPage(1);
    updateURL(formFilters, 1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      updateURL(appliedFilters, newPage);
      // Scroll to top of properties grid
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleEnquire = (property: Property) => {
    setSelectedProperty(property);
    setIsEnquiryModalOpen(true);
  };

  return (
    <>
      <div className="bg-white border-b border-border-grey">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-heading font-bold text-text-dark mb-6">
            Browse Properties
          </h1>

          {/* Filter Bar */}
          <div className="bg-background-light rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">
                  Min Price
                </label>
                <input
                  type="number"
                  placeholder="£60,000"
                  value={formFilters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="w-full px-4 py-2 border border-border-grey rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">
                  Max Price
                </label>
                <input
                  type="number"
                  placeholder="£150,000"
                  value={formFilters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="w-full px-4 py-2 border border-border-grey rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">
                  Beds
                </label>
                <select
                  value={formFilters.beds}
                  onChange={(e) => handleFilterChange('beds', e.target.value)}
                  className="w-full px-4 py-2 border border-border-grey rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent"
                >
                  <option value="">Any</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="City"
                  value={formFilters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="w-full px-4 py-2 border border-border-grey rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">
                  Yield
                </label>
                <select
                  value={formFilters.yield}
                  onChange={(e) => handleFilterChange('yield', e.target.value)}
                  className="w-full px-4 py-2 border border-border-grey rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent"
                >
                  <option value="">Any</option>
                  <option value="7">&gt;7%</option>
                  <option value="8">&gt;8%</option>
                  <option value="10">&gt;10%</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <button
                onClick={handleApply}
                className="bg-primary-navy text-white px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
              >
                Apply Filters
              </button>
              <button onClick={handleReset} className="text-primary-navy font-semibold hover:underline">
                Reset filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy"></div>
            <p className="mt-4 text-text-muted">Loading properties...</p>
          </div>
        ) : allProperties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-text-muted">No properties found matching your criteria.</p>
            <button
              onClick={handleReset}
              className="mt-4 text-primary-navy hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onEnquire={handleEnquire}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-border-grey rounded-lg hover:bg-background-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-text-muted">
                    Page {currentPage} of {totalPages}
                  </span>
                  {totalPages > 1 && (
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                        // Show first page, last page, current page, and pages around current
                        if (
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                                pageNum === currentPage
                                  ? 'bg-primary-navy text-white'
                                  : 'border border-border-grey hover:bg-background-light text-text-dark'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (
                          pageNum === currentPage - 2 ||
                          pageNum === currentPage + 2
                        ) {
                          return (
                            <span key={pageNum} className="px-2 text-text-muted">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-border-grey rounded-lg hover:bg-background-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <EnquiryModal
        property={selectedProperty}
        isOpen={isEnquiryModalOpen}
        onClose={() => setIsEnquiryModalOpen(false)}
      />
    </>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy"></div>
          <p className="mt-4 text-text-muted">Loading...</p>
        </div>
      </div>
    }>
      <PropertiesContent />
    </Suspense>
  );
}

