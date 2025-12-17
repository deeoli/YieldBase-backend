import { NextRequest, NextResponse } from 'next/server';
import { getProperties } from '@/lib/getProperties';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const filters: any = {};
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const city = searchParams.get('city');
    const beds = searchParams.get('beds');
    const yieldValue = searchParams.get('yield');
    const page = searchParams.get('page');

    if (minPrice) filters.minPrice = Number(minPrice);
    if (maxPrice) filters.maxPrice = Number(maxPrice);
    if (city) filters.city = city;
    if (beds) filters.beds = Number(beds);
    if (yieldValue) filters.yield = Number(yieldValue);
    if (page) filters.page = Number(page);

    const properties = await getProperties(filters);
    
    return NextResponse.json(properties, { status: 200 });
  } catch (error) {
    console.error('Error in /api/properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

