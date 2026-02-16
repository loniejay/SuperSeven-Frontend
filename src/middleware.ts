import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authToken = request.cookies.get('authToken')?.value || request.headers.get('authorization')?.split(' ')[1];
  const isAuthenticated = Boolean(authToken)
  let role = request.cookies.get('user_role')?.value

  // Public routes
  const publicRoutes = ['/login', '/register']
  
  // Skip middleware for static files and API routes
  if (
    publicRoutes.includes(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    /\.(ico|svg|png|jpg|jpeg|css|js)$/.test(pathname)
  ) {
    if (isAuthenticated && publicRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // Handle logout case explicitly
  if (pathname === '/logout') {
    const response = NextResponse.redirect(new URL('/login', request.url));
    // Clear cookies in the response
    response.cookies.delete('authToken');
    response.cookies.delete('user_role');
    response.cookies.delete('XSRF-TOKEN');
    return response;
  }

  // If no auth token but has role cookie (inconsistent state)
  if (!authToken && role) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('user_role');
    return response;
  }

  // If no auth token, redirect to login
  if (!authToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect if role is missing
 if (!role) {
    // Don't set error param to avoid infinite redirects
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Owner: No restrictions
  if (role === 'Owner') {
    return NextResponse.next()
  }

  // Secretary: Block billing routes
  if (role === 'Secretary') {
    if (pathname.startsWith('/billing')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // Editor/Photographer: Strict allowlist
  if (role === 'Editor' || role === 'Photographer') {
    const allowedPaths = ['/', '/workload', '/settings']
    const isAllowed = allowedPaths.some(
      path => pathname === path || pathname.startsWith(`${path}/`)
    )

    if (!isAllowed) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // Client: Specific allowed routes
  if (role === 'Client' || role === 'Coordinator') {
    const allowedPaths = ['/', '/booking', '/package', '/billing', '/settings']
    const isAllowed = allowedPaths.some(
      path => pathname === path || pathname.startsWith(`${path}/`)
    )

    if (!isAllowed) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // Fallback for unknown roles
  return NextResponse.redirect(new URL('/', request.url))
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:ico|svg|png|jpg|jpeg|css|js)).*)',
  ],
}