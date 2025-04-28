'use client'

import React from 'react'

type Props = {
  fullname: string;
  layout?: 'absolute' | 'normal';
};

const PREFIX_STYLES: Record<string, string> = {
  'Gnosis': 'text-xs',
  'Demiurge': 'text-[10px]',
  'Monad': 'text-xs',
  "Holy Night's Blessing": 'text-[10px]',
  'Kitsune of Eternity': 'text-[10px]',
  'Ais': 'text-[18px]',
  'Poolside Trickster': 'text-[10px]',


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
  'Demiurge': 'text-[21px]',
  'Monad': 'text-[21px]',
  "Holy Night's Blessing": 'text-[21px]',
  'Kitsune of Eternity': 'text-[21px]',
  'Poolside Trickster': 'text-[21px]',
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
      {prefix && (
        <div className={`${prefixSize} custom-text-shadow mb-[-2px]`}>
          {prefix}
        </div>
      )}
      {/* ICI on utilise un vrai h1 pour le nom principal */}
      <h1 className={`${nameSize} font-bold custom-text-shadow`}>
        {name}
      </h1>
    </div>
  );
}
