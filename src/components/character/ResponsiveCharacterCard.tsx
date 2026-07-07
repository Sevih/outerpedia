'use client';

import { useMediaQuery } from '@/hooks/useMediaQuery';
import { CharacterCard, type CharacterCardProps, type CharacterCardSize } from './CharacterCard';

/** Taille par breakpoint (portage V2) : sm mobile, md ≥768px, lg ≥1024px. */
export function ResponsiveCharacterCard(props: Omit<CharacterCardProps, 'size'>) {
  const isMd = useMediaQuery('(min-width: 768px)');
  const isLg = useMediaQuery('(min-width: 1024px)');
  const size: CharacterCardSize = isLg ? 'lg' : isMd ? 'md' : 'sm';
  return <CharacterCard {...props} size={size} />;
}
