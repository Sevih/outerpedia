'use client';

import { diffWords, type WordSegment } from '@/lib/admin/diff-words';

/**
 * Diff MOT À MOT de deux textes, conscient des balises `<color>` du jeu.
 * Porté de l'ancien admin, recâblé sur nos tokens sémantiques (danger/success) au
 * lieu des couleurs Tailwind en dur. `existing` en rouge, `extracted` en vert.
 *
 * La règle (appariement, balises) vit dans `diff-words.ts`, partagée avec la
 * page de quick ; ici on ne fait que poser les segments.
 */

const delClass = 'bg-danger/25 text-danger';
const addClass = 'bg-success/25 text-success';
const sameClass = 'text-content-subtle';

function Segments({ segments }: { segments: WordSegment[] }) {
  return segments.map((s, i) => {
    const cls = s.kind === 'same' ? sameClass : s.kind === 'removed' ? delClass : addClass;
    return s.color ? (
      <span key={i} className={cls} style={{ color: s.color }}>
        {s.text}
      </span>
    ) : (
      <span key={i} className={cls}>
        {s.text}
      </span>
    );
  });
}

export function DiffHighlight({ existing, extracted }: { existing: string; extracted: string }) {
  const words = diffWords(existing, extracted);

  return (
    <div className="space-y-1.5">
      <div className="bg-danger/5 rounded px-2 py-1.5 text-xs leading-relaxed break-all whitespace-pre-wrap">
        <span className="text-danger mr-1.5 font-semibold opacity-70">existant</span>
        <Segments segments={words.existing} />
      </div>
      <div className="bg-success/5 rounded px-2 py-1.5 text-xs leading-relaxed break-all whitespace-pre-wrap">
        <span className="text-success mr-1.5 font-semibold opacity-70">extrait</span>
        <Segments segments={words.extracted} />
      </div>
    </div>
  );
}
