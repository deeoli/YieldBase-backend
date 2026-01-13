import { Property, PropertyFilters } from '@/types/property';
import { DATA_SOURCE, SCRAPER_API_BASE_URL, EXTERNAL_API_BASE_URL } from './constants';

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

function normalizeProperty(data: any): Property {
  const city = data.city || data.address?.city || 'Unknown';
  const postcode = data.postcode || data.address?.postcode || '';
  const price = Number(data.price ?? data.listPrice ?? 0);
  const beds = Number(data.beds ?? data.bedrooms ?? 0);
  const baths = data.baths ?? data.bathrooms;
  const yieldValue = data.yield ?? data.yieldPercentage ?? data.grossYield;
  const normalizedYield = yieldValue !== undefined ? Number(yieldValue) : undefined;
  const currency = (data.currency || data.priceCurrency || 'GBP').toUpperCase();
  
  const propertyId = String(data.id || data._id || generateId());

  // Images: use backend-provided URLs only, never local filesystem paths
  const isAllowedUrl = (u: any): u is string =>
    typeof u === 'string' &&
    (u.startsWith('http') || u.startsWith('/api/images/')) &&
    !u.includes('media_cache') &&
    !u.includes('\\');

  const rawImages: any[] = Array.isArray(data.images) ? data.images : [];
  const filteredImages: string[] = rawImages.filter(isAllowedUrl);

  const mainImageCandidate = isAllowedUrl(data.image) ? data.image : (filteredImages[0] || '');
  const mainImage = typeof mainImageCandidate === 'string' ? mainImageCandidate : '';
  const imageGallery = filteredImages;

  const buildAddress = (): string => {
    if (typeof data.address === 'string') return data.address;
    if (data.fullAddress) return data.fullAddress;
    const street = data.address?.street || data.street;
    return [street, city, postcode].filter(Boolean).join(', ');
  };

  return {
    id: String(data.id || data._id || generateId()),
    title: data.title || data.name || `${city} Investment Property`,
    price,
    currency,
    address: buildAddress(),
    city,
    postcode,
    beds,
    baths: baths !== undefined ? Number(baths) : undefined,
    tenure: data.tenure,
    yield: normalizedYield,
    description: data.description || data.details || '',
    image: mainImage,
    images: imageGallery,
    sourceUrl: data.sourceUrl || data.originalListingUrl || data.url || '#',
    isHighYield: normalizedYield !== undefined ? normalizedYield >= 8 : Boolean(data.isHighYield),
    floorArea: data.floorArea ? Number(data.floorArea) : undefined,
    estimatedMonthlyRent: data.estimatedRent
      ? Number(data.estimatedRent)
      : data.estimatedMonthlyRent
      ? Number(data.estimatedMonthlyRent)
      : undefined,
    estimatedAnnualRent: data.estimatedAnnualRent
      ? Number(data.estimatedAnnualRent)
      : data.estimatedRent
      ? Number(data.estimatedRent) * 12
      : undefined,
    features: Array.isArray(data.features) ? data.features : undefined,
  };
}

function buildQueryString(filters?: PropertyFilters): string {
  if (!filters) return '';

  const params = new URLSearchParams();
  if (filters.minPrice) params.append('minPrice', String(filters.minPrice));
  if (filters.maxPrice) params.append('maxPrice', String(filters.maxPrice));
  if (filters.city) params.append('city', filters.city);
  if (filters.beds) params.append('beds', String(filters.beds));
  if (filters.yield) params.append('yield', String(filters.yield));
  if (filters.page) params.append('page', String(filters.page));

  const query = params.toString();
  return query ? `?${query}` : '';
}

export async function getProperties(filters?: PropertyFilters): Promise<Property[]> {
  try {
    let url = '';

    // TEMP LOGS: Inspect environment and URL resolution
    // eslint-disable-next-line no-console
    console.log('[getProperties] config', {
      DATA_SOURCE,
      SCRAPER_API_BASE_URL,
      EXTERNAL_API_BASE_URL,
      filters,
    });

    if (DATA_SOURCE === 'scraper' && SCRAPER_API_BASE_URL) {
      url = `${SCRAPER_API_BASE_URL}/properties${buildQueryString(filters)}`;
    } else if (DATA_SOURCE === 'api' && EXTERNAL_API_BASE_URL) {
      url = `${EXTERNAL_API_BASE_URL}/properties${buildQueryString(filters)}`;
    } else {
      // Fallback: return mock data for development
      return getMockProperties(filters);
    }

    // eslint-disable-next-line no-console
    console.log('[getProperties] fetching', { url });
    const response = await fetch(url, {
      cache: 'no-store',
    });

    // eslint-disable-next-line no-console
    console.log('[getProperties] response', { status: response.status, ok: response.ok });
    if (!response.ok) {
      console.error(`Failed to fetch properties: ${response.statusText}`);
      return getMockProperties(filters);
    }

    const data = await response.json();
    const properties = Array.isArray(data) ? data : (data.properties || data.data || []);

    return properties.map(normalizeProperty);
  } catch (error) {
    console.error('Error fetching properties:', error);
    return getMockProperties(filters);
  }
}

export async function getPropertyById(id: string): Promise<Property | null> {
  try {
    let url = '';

    if (DATA_SOURCE === 'scraper' && SCRAPER_API_BASE_URL) {
      url = `${SCRAPER_API_BASE_URL}/properties/${id}`;
    } else if (DATA_SOURCE === 'api' && EXTERNAL_API_BASE_URL) {
      url = `${EXTERNAL_API_BASE_URL}/properties/${id}`;
    } else {
      // Fallback: return mock data
      const mockProperties = getMockProperties();
      return mockProperties.find((p) => p.id === id) || null;
    }

    const response = await fetch(url, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return normalizeProperty(data);
  } catch (error) {
    console.error('Error fetching property:', error);
    const mockProperties = getMockProperties();
    return mockProperties.find((p) => p.id === id) || null;
  }
}

// Mock data for development/testing
function getMockProperties(filters?: PropertyFilters): Property[] {
  const mockProperties: Property[] = [
    {
      id: '1',
      title: 'Modern 3-Bedroom House Near University',
      price: 75000,
      currency: 'GBP',
      address: '24 Campus View, Bradford',
      city: 'Bradford',
      postcode: 'BD7 1DP',
      beds: 3,
      baths: 2,
      tenure: 'Freehold',
      yield: 8.5,
      description:
        'A beautifully maintained 3-bedroom property perfect for student accommodation. Located within walking distance of the university campus.',
      image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
      images: [
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
      ],
      sourceUrl: '#',
      isHighYield: true,
      floorArea: 1200,
      estimatedMonthlyRent: 530,
      estimatedAnnualRent: 530 * 12,
      features: ['Garden', 'Parking', 'Modern Kitchen'],
    },
    {
      id: '2',
      title: 'Spacious 2-Bedroom Student Property',
      price: 95000,
      currency: 'GBP',
      address: '12 Oxford Road, Manchester',
      city: 'Manchester',
      postcode: 'M13 9PL',
      beds: 2,
      baths: 1,
      tenure: 'Leasehold',
      yield: 7.2,
      description:
        'Well-located 2-bedroom property ideal for student lets. Close to public transport and university facilities.',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
      ],
      sourceUrl: '#',
      isHighYield: false,
      floorArea: 850,
      estimatedMonthlyRent: 570,
      estimatedAnnualRent: 570 * 12,
    },
    {
      id: '3',
      title: '4-Bedroom House with High Yield',
      price: 120000,
      currency: 'GBP',
      address: '8 Clarendon Terrace, Leeds',
      city: 'Leeds',
      postcode: 'LS2 8JT',
      beds: 4,
      baths: 2,
      tenure: 'Freehold',
      yield: 9.8,
      description:
        'Excellent 4-bedroom property with strong rental yield potential. Perfect for multiple student tenants.',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      images: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      ],
      sourceUrl: '#',
      isHighYield: true,
      floorArea: 1500,
      estimatedMonthlyRent: 980,
      estimatedAnnualRent: 980 * 12,
      features: ['Large Garden', 'Double Parking', 'Modern Bathroom'],
    },
    {
      id: '4',
      title: 'Affordable 3-Bedroom Investment',
      price: 65000,
      currency: 'GBP',
      address: '3 City Gate, Bradford',
      city: 'Bradford',
      postcode: 'BD1 1AA',
      beds: 3,
      baths: 1,
      tenure: 'Freehold',
      yield: 8.2,
      description: 'Great value 3-bedroom property in a popular student area. Strong rental demand.',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'],
      sourceUrl: '#',
      isHighYield: true,
      floorArea: 1100,
      estimatedMonthlyRent: 445,
      estimatedAnnualRent: 445 * 12,
    },
    {
      id: '5',
      title: 'Premium 2-Bedroom Apartment',
      price: 110000,
      currency: 'GBP',
      address: '19 City Tower, Manchester',
      city: 'Manchester',
      postcode: 'M1 1AD',
      beds: 2,
      baths: 2,
      tenure: 'Leasehold',
      yield: 6.5,
      description: 'Modern 2-bedroom apartment in city center location. High-quality finish throughout.',
      image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
      images: ['https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800'],
      sourceUrl: '#',
      isHighYield: false,
      floorArea: 900,
      estimatedMonthlyRent: 595,
      estimatedAnnualRent: 595 * 12,
    },
    {
      id: '6',
      title: 'Student HMO Opportunity',
      price: 105000,
      currency: 'GBP',
      address: '52 Otley Road, Leeds',
      city: 'Leeds',
      postcode: 'LS6 2PA',
      beds: 5,
      baths: 2,
      tenure: 'Freehold',
      yield: 10.5,
      description: 'Large 5-bedroom property ideal for HMO conversion. Excellent yield potential.',
      image: 'https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?w=800',
      images: ['https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?w=800'],
      sourceUrl: '#',
      isHighYield: true,
      floorArea: 1800,
      estimatedMonthlyRent: 920,
      estimatedAnnualRent: 920 * 12,
      features: ['Large Property', 'HMO Potential', 'Garden'],
    },
  ];

  // Apply filters
  let filtered = [...mockProperties];

  if (filters?.minPrice) {
    filtered = filtered.filter((p) => p.price >= filters.minPrice!);
  }
  if (filters?.maxPrice) {
    filtered = filtered.filter((p) => p.price <= filters.maxPrice!);
  }
  if (filters?.city) {
    filtered = filtered.filter((p) =>
      p.city.toLowerCase().includes(filters.city!.toLowerCase()),
    );
  }
  if (filters?.beds) {
    filtered = filtered.filter((p) => p.beds >= filters.beds!);
  }
  if (filters?.yield) {
    filtered = filtered.filter((p) => (p.yield || 0) >= filters.yield!);
  }

  return filtered;
}

