/**
 * Étoile de rareté inline + interpolation `{star}` des textes éditoriaux —
 * le marqueur historique pour glisser l'icône d'étoile du jeu au
 * milieu d'une phrase (« au moins un Héros 2{star} »).
 */
import { Fragment } from 'react';
import { img } from '@/lib/images';

/**
 * Libellé accessible = le caractère « ★ » lui-même : le lecteur d'écran le
 * prononce dans SA langue (« étoile noire », « black star »…), là où un mot
 * anglais en dur resterait anglais — et l'icône vit au milieu de textes
 * éditoriaux qu'aucun dictionnaire `t()` n'accompagne.
 */
export function StarIcon({ size = 14 }: { size?: number }) {
  return (
    <span
      className="relative inline-flex align-middle"
      style={{ width: size, height: size }}
      role="img"
      aria-label="★"
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
