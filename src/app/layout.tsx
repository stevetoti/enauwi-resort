import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "E'Nauwi Beach Resort | Family-Friendly Island Retreat in Malekula, Vanuatu",
  description:
    "E'Nauwi Beach Resort is a family-friendly island retreat on Malekula Island, Vanuatu. Comfortable beachfront bungalows, calm lagoon waters, kayaking, snorkeling, and genuine island hospitality await families, couples, and groups.",
  keywords:
    "Vanuatu resort, Malekula Island, beach resort, family-friendly accommodation, Pacific Islands, island retreat, snorkeling, kayaking, lagoon, Melanesian hospitality",
  openGraph: {
    title: "E'Nauwi Beach Resort | Malekula Island, Vanuatu",
    description:
      "A family-friendly island retreat with calm lagoon waters and beautiful island views on Malekula.",
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
