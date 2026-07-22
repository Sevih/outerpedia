/**
 * Étoile de rareté inline + interpolation `{star}` des textes éditoriaux —
 * le marqueur que la V2 utilisait pour glisser l'icône d'étoile du jeu au
 * milieu d'une phrase (« au moins un Héros 2{star} »).
 */
import { Fragment } from 'react';
import { img } from '@/lib/images';

export function StarIcon({ size = 14 }: { size?: number }) {
  return (
    <span
      className="relative inline-flex align-middle"
      style={{ width: size, height: size }}
      role="img"
      aria-label="star"
    >
      <img src={img.star()} alt="" aria-hidden className="h-full w-full object-contain" />
    </span>
  );
}

/** Rend un texte éditorial en remplaçant chaque `{star}` par l'icône. */
export function StarText({ text }: { text: string }) {
  const parts = text.split('{star}');
  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {part}
          {i < parts.length - 1 && <StarIcon />}
        </Fragment>
      ))}
    </>
  );
}
