import type { Metadata } from "next";
import "./globals.css";
import { getSiteSEO } from "@/lib/seo-settings";
import { Analytics } from "@/components/Analytics";
import { publicPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSiteSEO();
  const other: Record<string, string> = {};
  if (seo.facebookDomainVerification) {
    other["facebook-domain-verification"] = seo.facebookDomainVerification;
  }
  return {
    ...baseMetadata,
    verification: {
      ...(seo.googleSiteVerification ? { google: seo.googleSiteVerification } : {}),
      ...(Object.keys(other).length ? { other } : {}),
    },
  };
}

const baseMetadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://www.enauwibeachresort.org'),
  ...publicPageMetadata('/'),
  alternates: undefined,
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const seo = await getSiteSEO();
  return (
    <html lang="en" className="scroll-smooth">
      <body className="overflow-x-hidden">
        {children}
        <Analytics gaId={seo.googleAnalyticsId} pixelId={seo.facebookPixelId} />
      </body>
    </html>
  );
}
