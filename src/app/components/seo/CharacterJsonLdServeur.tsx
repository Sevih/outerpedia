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
    birthDate?: string;         // ex: "March 15" or "2000-03-15"
    height?: string;            // ex: "167 cm"
    weight?: string;            // ex: "55 kg"
    jobTitle?: string;          // ex: "Sweeper Defender"
    skills?: string[];          // ex: ["Shield Bash", "Flame Strike"]
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
