/**
 * Shared constants across the application
 */

// Fallback images for properties without cached images
export const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
  'https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?w=800',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
];

// API Configuration
export const SCRAPER_API_BASE_URL = process.env.NEXT_PUBLIC_SCRAPER_API_BASE_URL || 'http://localhost:8001/api';
export const DATA_SOURCE = process.env.NEXT_PUBLIC_DATA_SOURCE || 'scraper';
export const EXTERNAL_API_BASE_URL = process.env.NEXT_PUBLIC_EXTERNAL_API_BASE_URL || '';

// Yield Calculator
export const DAILY_CALCULATION_LIMIT = 3;
export const LIMIT_STORAGE_KEY = 'yieldCalculatorLimit';

// Pagination
export const ITEMS_PER_PAGE = 6;

// Navigation
export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/properties', label: 'Properties' },
  { href: '/yield-calculator', label: 'Yield Calculator' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

