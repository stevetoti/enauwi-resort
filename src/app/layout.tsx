import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
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
      "/images/resort/beach-resort-overview.jpg",
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="overflow-x-hidden">{children}</body>
    </html>
  );
}
