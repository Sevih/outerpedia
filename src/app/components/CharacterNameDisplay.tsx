'use client'

import React from 'react'

type Props = {
  fullname: string;
  layout?: 'absolute' | 'normal';
};

const PREFIX_STYLES: Record<string, string> = {
  'Gnosis': 'text-xs',
  'Omega': 'text-xs',
  'Demiurge': 'text-[10px]',
  'Monad': 'text-xs',
  "Holy Night's Blessing": 'text-[10px]',
  'Kitsune of Eternity': 'text-[10px]',
  'Ais': 'text-[18px]',
  'Poolside Trickster': 'text-[10px]',
  "Summer Knight's Dream": 'text-[9px]',
}

const ABBR_STYLES: Record<string, string> = {
  Gnosis: 'G.',
  Omega: 'O.',
  Demiurge: 'D.',
  Monad: 'M.',
  "Holy Night's Blessing": 'HNB ',
  'Kitsune of Eternity': 'KoE ',
  'Poolside Trickster': 'PT ',
  "Tamamo-no-Mae": 'Tamamo',
  "Summer Knight's Dream": 'S.',
}

const NAME_STYLES: Record<string, string> = {
  'Wallenstein': 'text-[15px] pb-1',
  'Bell Cranel': 'text-[16px] pb-1',
  'Flamberge': 'text-[17px] pb-1',
  'Francesca': 'text-[17px] pb-1',
  'Hanbyul Lee': 'text-[14px] pb-1',
  "Tamamo-no-Mae": 'text-[11px] pb-1',

}

const PREFIX_STYLES_BIG: Record<string, string> = {
  'Gnosis': 'text-[21px]',
  'Omega': 'text-[21px]',
  'Demiurge': 'text-[21px]',
  'Monad': 'text-[21px]',
  "Holy Night's Blessing": 'text-[21px]',
  'Kitsune of Eternity': 'text-[21px]',
  'Poolside Trickster': 'text-[21px]',
  "Summer Knight's Dream": 'text-[21px]',
}

const NAME_STYLES_BIG: Record<string, string> = {

}


export function CharacterNameDisplay({ fullname, layout = 'absolute' }: Props) {
  const matchedPrefix = Object.keys(PREFIX_STYLES).find((prefix) =>
    fullname.startsWith(`${prefix} `)
  );
  let prefix = '';
  let name = fullname;

  if (matchedPrefix) {
    prefix = matchedPrefix;
    name = fullname.replace(`${prefix} `, '');
  }

  const prefixSize = matchedPrefix ? PREFIX_STYLES[matchedPrefix] : '';
  const nameSize = NAME_STYLES[name] || 'text-lg';

  // 🛠️ Correction ici : typage forcé React.CSSProperties
  const style: React.CSSProperties = layout === 'absolute'
    ? { position: 'absolute', bottom: '1.25rem', left: '0.625rem', zIndex: 30 }
    : {};

  return (
    <div style={style} className="text-white custom-text-shadow text-left leading-tight">
      {prefix && (
        <div className={`${prefixSize} mb-[-2px]`}>{prefix}</div>
      )}
      <div className={`${nameSize}`}>{name}</div>
    </div>
  );
}

export function CharacterNameDisplayBig({ fullname }: Props) {
  const matchedPrefix = Object.keys(PREFIX_STYLES_BIG).find((prefix) =>
    fullname.startsWith(`${prefix} `)
  );
  let prefix = '';
  let name = fullname;

  if (matchedPrefix) {
    prefix = matchedPrefix;
    name = fullname.replace(`${prefix} `, '');
  }

  const prefixSize = matchedPrefix ? PREFIX_STYLES_BIG[matchedPrefix] : '';
  const nameSize = NAME_STYLES_BIG[name] || 'text-4xl';

  return (
    <div className="flex flex-col text-white leading-tight mb-2">
      {/* ICI on utilise un vrai h1 pour le nom principal */}
      <h2 className={`${nameSize} font-bold custom-text-shadow h1_custom`}>
        {prefix && (
          <div className={`${prefixSize} custom-text-shadow mb-[-2px]`}>
            {prefix}
          </div>
        )}
        {name}
      </h2>
    </div>
  );
}

export function CharacterNameDisplayCompact({ fullname }: Props) {
  const matchedPrefix = Object.keys(PREFIX_STYLES).find((prefix) =>
    fullname.startsWith(`${prefix} `)
  );

  let prefix = '';
  let name = fullname;

  if (matchedPrefix) {
    prefix = matchedPrefix;
    name = fullname.replace(`${prefix} `, '');
  }

  // tailles réduites
  const prefixSize = matchedPrefix ? 'text-[9px]' : 'text-[9px]';
  const nameSize = NAME_STYLES[name] || 'text-[11px]';

  return (
    <div className="text-white custom-text-shadow leading-tight px-1 text-center truncate">
      {prefix && (
        <div className={`${prefixSize} mb-[-1px]`}>{prefix}</div>
      )}
      <div className={`${nameSize} font-medium`}>{name}</div>
    </div>
  );
}

//carousel compact
function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function CharacterNameDisplayCompactCarousel({ fullname }: Props) {
  // remplace toutes les occurrences, en priorisant les clés les plus longues
  let displayName = fullname
  for (const [key, abbr] of Object.entries(ABBR_STYLES).sort((a, b) => b[0].length - a[0].length)) {
    const rx = new RegExp(`\\b${escapeRegExp(key)}\\b`, 'g')
    displayName = displayName.replace(rx, abbr)
  }
  // nettoie les doubles espaces potentiels (ex: abbr avec espace final)
  displayName = displayName.replace(/\s+/g, ' ').trim()

  return (
    <div className="text-white custom-text-shadow leading-tight px-1 text-left truncate">
      <div className="text-[11px] font-medium">{displayName}</div>
    </div>
  )
}


export function CharacterNameDisplayBigNoH({ fullname }: Props) {
  const matchedPrefix = Object.keys(PREFIX_STYLES_BIG).find((prefix) =>
    fullname.startsWith(`${prefix} `)
  );

  let prefix = '';
  let name = fullname;

  if (matchedPrefix) {
    prefix = matchedPrefix;
    name = fullname.replace(`${prefix} `, '');
  }

  const prefixSize = matchedPrefix ? PREFIX_STYLES_BIG[matchedPrefix] : '';
  const nameSize = NAME_STYLES_BIG[name] || 'text-4xl'; // remplace par une logique si tu veux le rendre dynamique

  // Titre SEO complet
  const seoTitle = `${fullname} – Outerplane Character Guide, Build & Equipment`;

  return (
    <>
      {/* H1 caché pour SEO */}
      <h1 className="sr-only">{seoTitle}</h1>

      {/* Titre visible */}
      <div className="flex flex-col text-white leading-tight mb-2 h1_custom">
        {prefix && (
          <span className={`${prefixSize} custom-text-shadow mb-[-2px]`}>
            {prefix}
          </span>
        )}
        <span
          className={`${nameSize} font-bold custom-text-shadow`}
          style={{
            fontWeight: 600,
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '3rem',
          }}
        >
          {name}
        </span>
      </div>
    </>
  );
}
