import { createHash, timingSafeEqual } from 'crypto'

// /api/email/send is server-to-server only. Every internal caller sends this header;
// the route rejects requests without it, so the endpoint cannot be used from the
// internet to send resort-branded emails (it was an open relay until 2026-11-08).
// The key is derived from the service-role secret, so no extra env var is needed and
// it changes automatically if that secret is rotated.
export const INTERNAL_EMAIL_HEADER = 'x-internal-email-key'

function internalEmailKey(): string {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!secret) return ''
  return createHash('sha256').update(`enauwi-internal-email:${secret}`).digest('hex')
}

/** Headers for an internal fetch to /api/email/send. */
export function internalEmailHeaders(): Record<string, string> {
  return { 'Content-Type': 'application/json', [INTERNAL_EMAIL_HEADER]: internalEmailKey() }
}

/** True only when the request carries the correct internal key (fails closed). */
export function isInternalEmailRequest(provided: string | null): boolean {
  const expected = internalEmailKey()
  if (!expected || !provided || provided.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
}
