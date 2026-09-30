import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { generateCsrfToken, setCsrfCookie, isCsrfCookieValid } from '@/lib/csrf'

const PUBLIC_AUTH_PAGES = ['/admin/login', '/admin/forgot-password', '/admin/reset-password']

// Ensure the response carries a VALID CSRF cookie. Reissues when the cookie is
// missing OR fails verification (e.g. a stale cookie signed with a rotated key),
// so a bad cookie can never permanently block logins/mutations.
async function withFreshCsrf(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.next()
  if (!(await isCsrfCookieValid(request))) {
    setCsrfCookie(response, await generateCsrfToken())
  }
  return response
}

// The raw Vercel domain serves an exact copy of the site — send page visits to
// the real domain so Google indexes one version. API routes are excluded by the
// matcher, so webhooks and the cron keep working on either host.
const LEGACY_HOST = 'enauwi-resort.vercel.app'
const CANONICAL_ORIGIN = 'https://www.enauwibeachresort.org'

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  if (request.headers.get('host') === LEGACY_HOST && (request.method === 'GET' || request.method === 'HEAD')) {
    return NextResponse.redirect(`${CANONICAL_ORIGIN}${pathname}${search}`, 308)
  }

  // Only protect /admin/* and /staff/* routes (not API routes — those protect themselves)
  const isAdminRoute = pathname.startsWith('/admin')
  const isStaffRoute = pathname.startsWith('/staff')

  // Public pages + public auth pages: just ensure a valid CSRF cookie exists
  if ((!isAdminRoute && !isStaffRoute) || PUBLIC_AUTH_PAGES.includes(pathname)) {
    return withFreshCsrf(request)
  }

  const session = await getSessionFromRequest(request)

  if (!session) {
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Authenticated pages: ensure a valid CSRF cookie for mutations
  return withFreshCsrf(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon|images|logo|icon|api/).*)'],
}
