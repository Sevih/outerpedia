'use client';

import Image from 'next/image';
import Link from 'next/link';
import allCharacters from '@/data/_allCharacters.json';
import { toKebabCase } from '@/utils/formatText';
import abbrevData from '@/data/abbrev.json';
import { useI18n } from '@/lib/contexts/I18nContext'
import { l } from '@/lib/localize'
import { lRec } from '@/lib/localize'


type AbbrevEntry = string | { en: string; jp?: string; kr?: string };
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
  const char = allCharacters.find(c =>
    [c.Fullname, c.Fullname_jp, c.Fullname_kr].includes(fullName)
  );

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
