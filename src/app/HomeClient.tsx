'use client'

export default function HomeClient() {
  return (
    <>
      {/* SEO structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Outerpedia",
              "url": "https://outerpedia.com",
              "description":
                "Outerpedia is a complete database for the mobile RPG Outerplane. Discover characters, gear builds, exclusive equipment, sets and more."
            },
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Outerpedia",
              "url": "https://outerpedia.com",
              "logo": "https://outerpedia.com/images/icons/icon-192x192.png",
              "sameAs": ["https://discord.com/invite/keGhVQWsHv"],
              "description":
                "Fan-made wiki for Outerplane: tier list, character builds, equipment database and more."
            }
          ])
        }}
      />
    </>
  )
}
