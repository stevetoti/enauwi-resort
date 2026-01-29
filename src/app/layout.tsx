import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "E'Nauwi Beach Resort | Luxury Island Paradise in Malekula, Vanuatu",
  description:
    "Experience the untouched beauty of Malekula Island at E'Nauwi Beach Resort. Luxury beachfront bungalows, world-class snorkeling, authentic Melanesian culture, and pristine white sand beaches await you in Vanuatu's hidden paradise.",
  keywords:
    "Vanuatu resort, Malekula Island, beach resort, luxury accommodation, Pacific Islands, island paradise, snorkeling, Melanesian culture",
  openGraph: {
    title: "E'Nauwi Beach Resort | Malekula Island, Vanuatu",
    description:
      "Your luxury island paradise awaits on the pristine shores of Malekula.",
    images: [
      "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=1200&q=80",
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
