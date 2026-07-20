'use client';

import { useMediaQuery } from '@/hooks/useMediaQuery';
import { CharacterCard, type CharacterCardProps, type CharacterCardSize } from './CharacterCard';

/**
 * Taille par breakpoint (portage V2) : par défaut sm mobile, md ≥768px,
 * lg ≥1024px — surchargeable par `sizes` (la tierlist V2 servait `sm/sm/md`,
 * plus dense que la liste).
 *
 * Le SSR n'a pas de viewport : on force le palier ≥768px par défaut (au lieu du
 * mobile) — ces pages sont surtout consultées sur desktop, et partir du gabarit
 * médian réduit le layout-shift à l'hydratation. Mobile se recale ensuite.
 */
export function ResponsiveCharacterCard({
  sizes = { base: 'sm', md: 'md', lg: 'lg' },
  ...props
}: Omit<CharacterCardProps, 'size'> & {
  sizes?: { base: CharacterCardSize; md: CharacterCardSize; lg: CharacterCardSize };
}) {
  const isMd = useMediaQuery('(min-width: 768px)', true);
  const isLg = useMediaQuery('(min-width: 1024px)');
  const size: CharacterCardSize = isLg ? sizes.lg : isMd ? sizes.md : sizes.base;
  return <CharacterCard {...props} size={size} />;
}
