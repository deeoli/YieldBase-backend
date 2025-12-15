import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message, propertyId } = body;

    // Validate required fields
    if (!name || !email || !message || !propertyId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Log the enquiry (in production, you would send this to a webhook, database, or email service)
    console.log('Property Enquiry:', {
      name,
      email,
      phone,
      message,
      propertyId,
      timestamp: new Date().toISOString(),
    });

    // In production, you might:
    // - Send to webhook: await fetch(WEBHOOK_URL, { method: 'POST', body: JSON.stringify(...) })
    // - Save to database
    // - Send email notification
    // - Integrate with CRM

    return NextResponse.json(
      { success: true, message: 'Enquiry submitted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in /api/enquiry:', error);
    return NextResponse.json(
      { error: 'Failed to submit enquiry' },
      { status: 500 }
    );
  }
}

