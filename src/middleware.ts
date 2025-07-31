import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const publicPaths = ['/login', '/api/auth', '/api/firebase'];
  
  // Check if the current path is public
  const isPublicPath = publicPaths.some(publicPath => 
    path.startsWith(publicPath)
  );

  // Get the token from cookies or headers
  const token = request.cookies.get('access_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  // Check for Firebase auth token
  const firebaseToken = request.cookies.get('firebase_token')?.value;

  // If the path is public, allow access
  if (isPublicPath) {
    return NextResponse.next();
  }

  // If there's no token and no Firebase token and the path is not public, redirect to login
  if (!token && !firebaseToken) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If there's a token (either custom or Firebase), allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 