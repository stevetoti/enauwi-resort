import { NextResponse } from 'next/server'
import { generateCsrfToken, setCsrfCookie } from '@/lib/csrf'

/** GET /api/auth/csrf — generates a CSRF token, sets it as a cookie, and returns it */
export async function GET() {
  const token = await generateCsrfToken()
  const response = NextResponse.json({ csrfToken: token })
  setCsrfCookie(response, token)
  return response
}
