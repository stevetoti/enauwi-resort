// Canonical public facts about the resort, shared by metadata, sitemap and
// structured data (JSON-LD) so every SEO surface says the same thing.
export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.enauwibeachresort.org').replace(/\/$/, '')
export const SITE_NAME = "E'Nauwi Beach Resort"
export const SITE_PHONE = '+678 22170'
export const SITE_EMAIL = 'reservation@enauwibeachresort.com'
export const SITE_SOCIALS = [
  'https://www.facebook.com/EnauwiBeachResort',
  'https://www.instagram.com/enauwibeachresort',
]

// Structured data for the homepage — tells Google this is a resort (hotel),
// where it is and how to contact it. Only verifiable facts; no invented
// ratings, prices or coordinates.
export function resortJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Resort',
        '@id': `${SITE_URL}/#resort`,
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        logo: `${SITE_URL}/logo-enauwi.png`,
        image: [`${SITE_URL}/images/og-image.jpg`],
        description:
          "A family-friendly beachfront resort on Efate Island, Vanuatu, with bungalows on a calm lagoon, a swimming pool, kayaking, snorkelling, a restaurant and bar, and conference facilities.",
        telephone: SITE_PHONE,
        email: SITE_EMAIL,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'South East Efate',
          addressRegion: 'Shefa Province',
          addressCountry: 'VU',
        },
        checkinTime: '14:00',
        checkoutTime: '10:00',
        currenciesAccepted: 'VUV',
        amenityFeature: [
          'Beachfront bungalows',
          'Swimming pool',
          'Restaurant',
          'Bar',
          'Kayaks',
          'Snorkelling',
          'Conference room',
        ].map((name) => ({ '@type': 'LocationFeatureSpecification', name, value: true })),
        sameAs: SITE_SOCIALS,
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: SITE_NAME,
        publisher: { '@id': `${SITE_URL}/#resort` },
      },
    ],
  }
}
