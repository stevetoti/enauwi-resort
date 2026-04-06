import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomBytes, createHash } from 'crypto'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { requireCsrf } from '@/lib/csrf'

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    // CSRF check
    const csrfError = await requireCsrf(request)
    if (csrfError) return csrfError

    // Rate limit: 3 password reset requests per IP per 5 minutes
    const ip = getClientIp(request)
    const rateLimitResult = checkRateLimit(ip, { id: 'forgot-password', limit: 3, windowSeconds: 300 })
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many reset requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rateLimitResult.retryAfter) } }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Find staff member by email
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('id, email, name')
      .eq('email', email.toLowerCase())
      .single()

    // Always return success to prevent email enumeration
    if (staffError || !staff) {
      return NextResponse.json({ success: true, message: 'If account exists, reset link sent' })
    }

    // Generate reset token — store hash in DB, send raw token in email
    const resetToken = randomBytes(32).toString('hex')
    const tokenHash = hashToken(resetToken)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1)

    await supabase
      .from('staff')
      .update({
        reset_token: tokenHash,
        reset_token_expires: expiresAt.toISOString()
      })
      .eq('id', staff.id)

    // Send reset email with the RAW token (not the hash)
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://enauwi-resort.vercel.app'}/admin/reset-password?token=${resetToken}`

    try {
      await fetch(`${request.nextUrl.origin}/api/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'password_reset',
          data: {
            email: staff.email,
            name: staff.name,
            resetUrl,
          },
        }),
      })
    } catch {
      // Email send failure is non-fatal — user can request again
    }

    return NextResponse.json({ success: true, message: 'If account exists, reset link sent' })
  } catch {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
