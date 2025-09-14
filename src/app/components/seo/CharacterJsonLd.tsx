'use client';

import React from 'react';
import Head from 'next/head';

interface CharacterJsonLdProps {
  name: string;
  description: string;
  image: string;
  url: string;
  element: string;
  charClass: string;
  subClass: string;
}

const CharacterJsonLd: React.FC<CharacterJsonLdProps> = ({
  name,
  description,
  image,
  url,
  element,
  charClass,
  subClass,
}) => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoGameCharacter",
    "name": name,
    "url": url,
    "image": image,
    "description": description,
    "characterAttribute": [
      { "@type": "Thing", "name": element },
      { "@type": "Thing", "name": charClass },
      { "@type": "Thing", "name": subClass }
    ],
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    "game": {
      "@type": "VideoGame",
      "name": "Outerplane"
    }
  };

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </Head>
  );
};

export default CharacterJsonLd;
