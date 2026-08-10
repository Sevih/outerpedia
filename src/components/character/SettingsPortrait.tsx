'use client';

/**
 * LES FEUILLES CLIENTES DES PORTRAITS — le seul endroit où les réglages du site
 * (`site-settings`) touchent une image de perso.
 *
 * `CharacterCard` et `CharacterPortrait` restent des composants SERVEUR : ils
 * délèguent leur image à ces deux feuilles, qui lisent le store et remplacent
 * l'id de BASE par le modèle de costume choisi. Passer un `ModelNameID` à la
 * place d'un `CharacterID` suffit — toutes les fabriques d'URL (`CT_`, `FI_`)
 * nomment leurs fichiers par ce même id, et la couverture est vérifiée à
 * l'extraction (104 modèles, aucun manquant).
 *
 * Le portrait ANIMÉ est chargé PARESSEUSEMENT : `portrait-fx.json` et le moteur
 * WebGL pèsent lourd, et le réglage est désactivé par défaut — personne ne paie
 * ce chunk sans l'avoir demandé. Pendant le chargement, le portrait statique
 * tient la place (mêmes props), la bascule est invisible.
 *
 * L'effet animé suit le PERSONNAGE, pas le modèle affiché : la table du jeu
 * (`CharacterExtraTemplet.ThumbnailEffect`) est par perso, et poser un skin ne
 * fait pas disparaître la parure (vécu : 2020059 sur 2000059 éteignait
 * l'effet quand il se résolvait sur l'id d'art). D'où `fxId` : l'art vient du
 * skin, l'effet du perso.
 */

import { lazy, Suspense } from 'react';
import { Portrait, type PortraitProps } from './Portrait';
import { Thumbnail, type ThumbnailProps } from '@/components/ui/Thumbnail';
import { useSiteSettings } from '@/lib/site-settings';

const AnimatedPortrait = lazy(() =>
  import('./AnimatedPortrait').then((m) => ({ default: m.AnimatedPortrait })),
);

/** Le grand portrait d'une carte, réglages appliqués (skin + animation). */
export function CardPortrait(props: Omit<PortraitProps, 'fx'>) {
  const { animatedPortraits, skins } = useSiteSettings();
  const id = skins[props.id] ?? props.id;
  if (!animatedPortraits) return <Portrait {...props} id={id} />;
  return (
    <Suspense fallback={<Portrait {...props} id={id} />}>
      <AnimatedPortrait {...props} id={id} fxId={props.id} />
    </Suspense>
  );
}

/** La vignette carrée d'un perso, skin appliqué (pas d'animation à ce format). */
export function CardThumbnail(props: Omit<Extract<ThumbnailProps, { kind: 'character' }>, 'kind'>) {
  const { skins } = useSiteSettings();
  const id = skins[props.id] ?? props.id;
  return <Thumbnail {...props} kind="character" id={id} />;
}
