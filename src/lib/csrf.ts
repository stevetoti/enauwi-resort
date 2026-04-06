import { SignJWT, jwtVerify } from 'jose'
import { NextRequest, NextResponse } from 'next/server'

const CSRF_COOKIE = 'enauwi_csrf'
const CSRF_HEADER = 'x-csrf-token'
const CSRF_MAX_AGE = 60 * 60 * 4 // 4 hours

function getCsrfSecret() {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'csrf-fallback'
  return new TextEncoder().encode(secret + '-csrf')
}

/** Generate a CSRF token and set it as a cookie on the response */
export async function generateCsrfToken(): Promise<string> {
  return new SignJWT({ purpose: 'csrf' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${CSRF_MAX_AGE}s`)
    .sign(getCsrfSecret())
}

/** Set CSRF cookie on a response (readable by JS so client can send it back in header) */
export function setCsrfCookie(response: NextResponse, token: string): void {
  response.cookies.set(CSRF_COOKIE, token, {
    httpOnly: false, // Must be readable by JavaScript
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: CSRF_MAX_AGE,
    path: '/',
  })
}

/** Validate CSRF: token in header must match token in cookie, and both must be valid JWTs */
export async function validateCsrf(request: NextRequest): Promise<boolean> {
  const cookieToken = request.cookies.get(CSRF_COOKIE)?.value
  const headerToken = request.headers.get(CSRF_HEADER)

  if (!cookieToken || !headerToken) return false
  if (cookieToken !== headerToken) return false

  try {
    await jwtVerify(headerToken, getCsrfSecret())
    return true
  } catch {
    return false
  }
}

/** Middleware helper: returns 403 if CSRF is invalid */
export async function requireCsrf(request: NextRequest): Promise<NextResponse | null> {
  const valid = await validateCsrf(request)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid or missing CSRF token' }, { status: 403 })
  }
  return null
}

export { CSRF_COOKIE, CSRF_HEADER }
