'use client';

import Image from 'next/image';
import Link from 'next/link';
import allCharacters from '@/data/_allCharacters.json';
import { toKebabCase } from '@/utils/formatText';
import { useTenant } from '@/lib/contexts/TenantContext';
import { l } from '@/lib/localize';

// Optionnel : mapping d'alias partiels vers Fullname
const characterNameMap: Record<string, string> = {
  Meva: 'Monad Eva',
  DStella: 'Demiurge Stella',
  Dstella: 'Demiurge Stella',
  Val: 'Valentine',
  // Ajoute d'autres alias ici si besoin
};

type Props = {
  name: string; // alias ou Fullname
};

export default function CharacterInlineTag({ name }: Props) {
  const { key: lang } = useTenant();

  // Recherche du personnage correspondant à l'alias
  const fullName = characterNameMap[name] ?? name;
  const char = allCharacters.find((c) => c.Fullname === fullName);

  if (!char) return <span className="text-red-500">{name}</span>;

  const localizedName = l(char, 'Fullname', lang);

  const slug = toKebabCase(char.Fullname); // slug reste basé sur l’anglais
  const imagePath = `/images/characters/atb/IG_Turn_${char.ID}.webp`;

  return (
    <>
      <Link
        href={`/characters/${slug}`}
        className="inline-block w-[50px] h-[50px] relative align-bottom mr-1"
      >
        <Image
          src={imagePath}
          alt={localizedName}
          sizes="50px"
          fill
          className="object-contain"
        />
      </Link>
      <Link
        href={`/characters/${slug}`}
        className="text-sky-400 hover:text-sky-300 underline-offset-2 hover:underline transition-colors"
      >
        {localizedName}
      </Link>
    </>
  );
}
