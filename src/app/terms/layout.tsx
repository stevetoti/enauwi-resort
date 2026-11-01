import { publicPageMetadata } from '@/lib/seo'

export const metadata = publicPageMetadata('/terms')

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
