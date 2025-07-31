import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const publicPaths = ['/login', '/api/auth', '/api/firebase', '/_next', '/favicon.ico'];
  
  // Check if the current path is public
  const isPublicPath = publicPaths.some(publicPath => 
    path.startsWith(publicPath)
  );

  // For Firebase auth, we'll let the client-side handle authentication
  // The middleware will only redirect to login for non-public paths
  // The actual auth check will be done in the components using useAuth()
  
  // If the path is public, allow access
  if (isPublicPath) {
    return NextResponse.next();
  }

  // For now, allow all requests and let client-side auth handle the redirects
  // This is because Firebase auth state is managed on the client side
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