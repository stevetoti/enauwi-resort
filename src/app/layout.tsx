import type { Metadata } from "next";
import "./globals.css";
import { getSiteSEO } from "@/lib/seo-settings";
import { Analytics } from "@/components/Analytics";

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
  title: "E'Nauwi Beach Resort | Family-Friendly Island Retreat in Efate, Vanuatu",
  description:
    "E'Nauwi Beach Resort is a family-friendly island retreat on Efate Island, Vanuatu. Comfortable beachfront bungalows, calm lagoon waters, kayaking, snorkeling, and genuine island hospitality await families, couples, and groups.",
  keywords:
    "Vanuatu resort, Efate Island, beach resort, family-friendly accommodation, Pacific Islands, island retreat, snorkeling, kayaking, lagoon, Melanesian hospitality",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: "E'Nauwi Beach Resort | Efate Island, Vanuatu",
    description:
      "A family-friendly island retreat with calm lagoon waters and beautiful island views on Efate.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "E'Nauwi Beach Resort aerial view - turquoise lagoon and palm trees on Efate Island, Vanuatu",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "E'Nauwi Beach Resort | Efate Island, Vanuatu",
    description: "A family-friendly island retreat with calm lagoon waters and beautiful island views.",
    images: ["/images/og-image.jpg"],
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
