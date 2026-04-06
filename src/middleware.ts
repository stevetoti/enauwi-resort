import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { generateCsrfToken, setCsrfCookie, CSRF_COOKIE } from '@/lib/csrf'

const PUBLIC_AUTH_PAGES = ['/admin/login', '/admin/forgot-password', '/admin/reset-password']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /admin/* and /staff/* routes (not API routes — those protect themselves)
  const isAdminRoute = pathname.startsWith('/admin')
  const isStaffRoute = pathname.startsWith('/staff')

  if (!isAdminRoute && !isStaffRoute) {
    // For public pages: ensure a CSRF cookie exists (for forms like contact, booking)
    if (!request.cookies.get(CSRF_COOKIE)?.value) {
      const token = await generateCsrfToken()
      const response = NextResponse.next()
      setCsrfCookie(response, token)
      return response
    }
    return NextResponse.next()
  }

  // Allow public auth pages without session
  if (PUBLIC_AUTH_PAGES.includes(pathname)) {
    // Ensure CSRF cookie for login/forgot-password forms
    if (!request.cookies.get(CSRF_COOKIE)?.value) {
      const token = await generateCsrfToken()
      const response = NextResponse.next()
      setCsrfCookie(response, token)
      return response
    }
    return NextResponse.next()
  }

  const session = await getSessionFromRequest(request)

  if (!session) {
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Ensure CSRF cookie for authenticated pages
  if (!request.cookies.get(CSRF_COOKIE)?.value) {
    const token = await generateCsrfToken()
    const response = NextResponse.next()
    setCsrfCookie(response, token)
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon|images|logo|icon|api/).*)'],
}
