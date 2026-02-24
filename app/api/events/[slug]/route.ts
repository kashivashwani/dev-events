import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/database/event.model';

/**
 * GET /api/events/[slug]
 * Fetches a single event by its slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  try {
    // Await params to access the slug
    const { slug } = await params;

    // Validate slug parameter
    if (!slug || typeof slug !== 'string' || slug.trim() === '') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid slug parameter' 
        },
        { status: 400 }
      );
    }

    // Establish database connection
    await connectDB();

    // Query event by slug
    const event = await Event.findOne({ slug: slug.toLowerCase().trim() })
      .select('-__v') // Exclude version key from response
      .lean(); // Convert to plain JavaScript object for better performance

    // Handle event not found
    if (!event) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Event with slug "${slug}" not found` 
        },
        { status: 404 }
      );
    }

    // Return successful response
    return NextResponse.json(
      { 
        success: true, 
        data: event 
      },
      { status: 200 }
    );
  } catch (error) {
    // Log error for debugging (in production, use proper logging service)
    console.error('Error fetching event:', error);

    // Handle unexpected errors
    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred while fetching the event' 
      },
      { status: 500 }
    );
  }
}
