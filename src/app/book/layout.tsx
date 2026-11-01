import { publicPageMetadata } from '@/lib/seo'

export const metadata = publicPageMetadata('/book')

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
