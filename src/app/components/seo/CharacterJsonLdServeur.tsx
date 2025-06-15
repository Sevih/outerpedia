// components/CharacterJsonLdServer.tsx (🚫 no 'use client')
type CharacterJsonLd = {
  "@context": string;
  "@type": "VideoGameCharacter";
  name: string;
  image: string;
  description: string;
  url: string;
  characterAttribute: { "@type": "Thing"; name: string }[];
  mainEntityOfPage: { "@type": "WebPage"; "@id": string };
  game: { "@type": "VideoGame"; name: string };
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
