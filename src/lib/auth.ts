import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const SESSION_COOKIE = 'enauwi_session'
const SESSION_MAX_AGE = 60 * 60 * 24 // 24 hours

interface StaffSession {
  id: string
  email: string
  name: string
  role: string
  role_id: string
  permissions: Record<string, Record<string, boolean>>
}

function getJwtSecret() {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  return new TextEncoder().encode(secret)
}

// Create a signed JWT for a staff member
export async function createSessionToken(staff: StaffSession): Promise<string> {
  return new SignJWT({
    sub: staff.id,
    email: staff.email,
    name: staff.name,
    role: staff.role,
    role_id: staff.role_id,
    permissions: staff.permissions,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getJwtSecret())
}

// Verify and decode a session JWT
export async function verifySessionToken(token: string): Promise<StaffSession | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    return {
      id: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
      role_id: payload.role_id as string,
      permissions: (payload.permissions as Record<string, Record<string, boolean>>) || {},
    }
  } catch {
    return null
  }
}

// Set the session cookie on a response
export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })
}

// Clear the session cookie
export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
}

// Get session from cookies (for server components)
export async function getSession(): Promise<StaffSession | null> {
  const cookieStore = cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifySessionToken(token)
}

// Get session from request (for API routes and middleware)
export async function getSessionFromRequest(request: NextRequest): Promise<StaffSession | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifySessionToken(token)
}

// API route auth guard — returns staff session or 401 response
export async function requireAuth(request: NextRequest): Promise<StaffSession | NextResponse> {
  const session = await getSessionFromRequest(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return session
}

// Check if session has a specific permission
export function sessionHasPermission(
  session: StaffSession,
  module: string,
  action: string
): boolean {
  const modulePerm = session.permissions?.[module]
  if (!modulePerm) return false
  return Boolean(modulePerm[action])
}

export type { StaffSession }
export { SESSION_COOKIE }
