// components/CharacterJsonLdServer.tsx (🚫 no 'use client')
type CharacterJsonLd = {
  "@context": "https://schema.org";
  "@type": "VideoGame";
  name: string;
  url: string;
  character: {
    "@type": "Person"; // ou "Thing" si non humanoïde (optionnel mais pas recommandé)
    name: string;
    description: string;
    image: string;
    url: string;
    characterAttribute?: { "@type": "Thing"; name: string }[];
  };
  mainEntityOfPage: { "@type": "WebPage"; "@id": string };
};


export default function CharacterJsonLdServer({ jsonLd }: { jsonLd: CharacterJsonLd })  {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd),
      }}
    />
  );
}
