'use client';

import React from 'react';

type Props = {
  name: string;
  description: string;
  image: string;
  url: string;
};

const CharacterJsonLd = ({ name, description, image, url }: Props) => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoGameCharacter',
    name,
    description,
    image,
    url,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};

export default CharacterJsonLd;
