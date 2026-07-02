import { unstable_cache } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase'

export interface SiteSEO {
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
  googleAnalyticsId?: string
  facebookPixelId?: string
  facebookDomainVerification?: string
  googleSiteVerification?: string
}

// Reads the admin-managed SEO/analytics settings (Admin → SEO).
// Cached for 5 minutes so it doesn't hit the DB on every page render,
// and wrapped so a read failure can never break the site layout.
export const getSiteSEO = unstable_cache(
  async (): Promise<SiteSEO> => {
    try {
      const { data } = await supabaseAdmin
        .from('site_settings')
        .select('value')
        .eq('key', 'seo')
        .single()
      return (data?.value as SiteSEO) || {}
    } catch {
      return {}
    }
  },
  ['site-seo'],
  { revalidate: 300, tags: ['site-seo'] }
)
