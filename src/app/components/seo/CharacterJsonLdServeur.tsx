// components/CharacterJsonLdServer.tsx (🚫 no 'use client')
type CharacterJsonLd = {
  "@context": "https://schema.org";
  "@type": "VideoGame";
  name: string;
  url: string;
  character: {
    "@type": "Person";
    name: string;
    description: string;
    image: string;
    url: string;
    birthDate?: string; // ex: "2001-12-31"
    height?: string; // ex: "167 cm"
    weight?: string; // ex: "55 kg"
  };
  mainEntityOfPage: {
    "@type": "WebPage";
    "@id": string;
  };
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
