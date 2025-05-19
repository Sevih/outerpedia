'use client';

import Image from 'next/image';
import Link from 'next/link';
import allCharacters from '@/data/_allCharacters.json';
import { toKebabCase } from '@/utils/formatText';
import abbrevData from '@/data/abbrev.json';

const abbrev = abbrevData as Record<string, string>;
// Alias possibles
const characterNameMap: Record<string, string> = {
  Meva: 'Monad Eva',
  DStella: 'Demiurge Stella',
  Dstella: 'Demiurge Stella',
  Val: 'Valentine',
  // Ajoute d'autres alias ici si besoin
};

type Props = {
  name: string; // alias ou Fullname
  size?: number; // taille optionnelle (par défaut 50)
  deco?: string
};

export default function CharacterInlineStacked({ name, size = 50, deco }: Props) {
  const fullName = characterNameMap[name] ?? name;
  const char = allCharacters.find(c => c.Fullname === fullName);
  const italic = deco ? deco : ""
  if (!char) return <span className="text-red-500">{name}</span>;

  const slug = toKebabCase(char.Fullname);
  const imagePath = `/images/characters/atb/IG_Turn_${char.ID}.webp`;

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
          alt={char.Fullname}
          fill
          sizes={`${size}px`}
          className="object-contain"
        />
      </div>
      <span className={`truncate w-full leading-tight ${italic}`}>
        {abbrev[char.Fullname] ?? char.Fullname}
      </span>

    </Link>
  );
}
