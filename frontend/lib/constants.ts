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
  'https://images.unsplash.com/photo-1505691723518-36a5ac3b2d52?w=800',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800',
  'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800',
  'https://images.unsplash.com/photo-1502005229762-cf1b2da7c74f?w=800',
  'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800',
  'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
  'https://images.unsplash.com/photo-1444418776041-9c7e33cc5a9c?w=800',
  'https://images.unsplash.com/photo-1451976664376-cb1bfab35d23?w=800',
  'https://images.unsplash.com/photo-1493666438817-866a91353ca9?w=800',
  'https://images.unsplash.com/photo-1490195117352-aa267f47f2f2?w=800',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
  'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800',
  'https://images.unsplash.com/photo-1520880867055-1e30d1cb001c?w=800',
  'https://images.unsplash.com/photo-1501183638710-841dd1904471?w=800',
  'https://images.unsplash.com/photo-1497366216540-94aef0b6b826?w=800',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800',
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800',
  'https://images.unsplash.com/photo-1537726235470-8504e3beef77?w=800',
  'https://images.unsplash.com/photo-1472220625704-91e1462799b2?w=800',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800',
  'https://images.unsplash.com/photo-1499914485622-0b66d4fa0f0e?w=800',
];

// API Configuration
export const SCRAPER_API_BASE_URL = process.env.NEXT_PUBLIC_SCRAPER_API_BASE_URL || 'http://localhost:8001/api';
export const DATA_SOURCE = process.env.NEXT_PUBLIC_DATA_SOURCE || 'scraper';
export const EXTERNAL_API_BASE_URL = process.env.NEXT_PUBLIC_EXTERNAL_API_BASE_URL || SCRAPER_API_BASE_URL;

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

