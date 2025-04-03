import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware will redirect API requests to Firebase functions when deployed
export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /about, /blog/first-post)
  const pathname = request.nextUrl.pathname;

  // When deployed to Firebase, redirect API requests to Firebase Functions
  if (pathname.startsWith('/api/')) {
    return NextResponse.json(
      { success: false, message: 'API routes are not available in static exports' },
      { status: 404 }
    );
  }

  // If it's not an api route, continue with the request
  return NextResponse.next();
}

// Middleware comentado temporalmente para permitir la exportación estática
export const config = {
  matcher: '/api/:path*',
}; 