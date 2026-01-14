'use client';

import Image from 'next/image';
import Link from 'next/link';
import allCharacters from '@/data/_allCharacters.json';
import { toKebabCase } from '@/utils/formatText';
import abbrevData from '@/data/abbrev.json';
import { useI18n } from '@/lib/contexts/I18nContext'
import { l, lRec } from '@/lib/localize'
import { getAvailableLanguages } from '@/tenants/config'
import type { Localized } from '@/types/common'

type AbbrevEntry = string | Localized;
const abbrev = abbrevData as Record<string, AbbrevEntry>;
// Alias possibles

type Props = {
  name: string; // alias ou Fullname
  size?: number; // taille optionnelle (par défaut 50)
  deco?: string
};

export default function CharacterInlineStacked({ name, size = 50, deco }: Props) {
  const { lang } = useI18n()
  const fullName = name;

  // Find character by checking all language variants
  const char = allCharacters.find(c => {
    // Check base name
    if (c.Fullname === fullName) return true

    // Check all language variants
    const languages = getAvailableLanguages()
    for (const lng of languages) {
      if (lng === 'en') continue
      const localizedName = l(c as Record<string, unknown>, 'Fullname', lng)
      if (localizedName === fullName) return true
    }
    return false
  });

  const italic = deco ? deco : ""
  if (!char) return <span className="text-red-500">{name}</span>;

  const slug = toKebabCase(char.Fullname);
  const imagePath = `/images/characters/atb/IG_Turn_${char.ID}.webp`;
  const ab = abbrev[char.Fullname];
  const display =
   ab
     ? (typeof ab === 'string' ? ab : lRec(ab, lang))   // string → EN, object → localisé
     : l(char, 'Fullname', lang);

  return (
    <Link
      href={`/characters/${slug}`}
      className="flex flex-col items-center text-center text-sky-400 hover:text-sky-300 transition-colors"
    >

      <div
        className="relative mb-1"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <Image
          src={imagePath}
          alt={l(char, 'Fullname', lang)}
          fill
          sizes={`${size}px`}
          className="object-contain"
        />
      </div>
      <span className={`truncate w-full leading-tight ${italic}`} title={l(char, 'Fullname', lang)}>
        {display}
      </span>
    </Link>
  );
}
