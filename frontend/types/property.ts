export type Property = {
  id: string;
  title: string;
  price: number;
  currency: string;
  address: string;
  city: string;
  postcode: string;
  beds: number;
  baths?: number;
  tenure?: string;
  yield?: number;
  description?: string;
  image: string;
  images?: string[];
  sourceUrl: string;
  isHighYield?: boolean;
  floorArea?: number;
  estimatedMonthlyRent?: number;
  estimatedAnnualRent?: number;
  features?: string[];
};

export interface PropertyFilters {
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  beds?: number;
  yield?: number;
  page?: number;
}

