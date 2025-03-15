import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware will redirect API requests to Firebase functions when deployed
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // If this is an API route, redirect to Firebase functions
  if (pathname.startsWith('/api/')) {
    // In a real deployment, you would redirect to your Firebase functions URL
    // For now, we'll just return a 404 response
    return new NextResponse(
      JSON.stringify({ error: 'API routes are not available in static exports' }),
      {
        status: 404,
        headers: {
          'content-type': 'application/json',
        },
      }
    );
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/api/:path*',
}; 