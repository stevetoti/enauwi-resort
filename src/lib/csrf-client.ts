/** Read the CSRF token from the cookie (set by middleware) */
export function getCsrfToken(): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(/(?:^|;\s*)enauwi_csrf=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : ''
}

/** Get headers object with CSRF token included */
export function csrfHeaders(extra?: Record<string, string>): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-csrf-token': getCsrfToken(),
    ...extra,
  }
}
