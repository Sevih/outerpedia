'use client';

import type { ReactNode } from 'react';

/**
 * Diff MOT À MOT de deux textes, conscient des balises `<color>` du jeu.
 * Porté de l'admin V2, recâblé sur nos tokens sémantiques (danger/success) au
 * lieu des couleurs Tailwind en dur. `existing` en rouge, `extracted` en vert.
 */

function stripTags(s: string): string {
  return s.replace(/<\/?color[^>]*>/g, '');
}

/** Marque (true = changé) chaque mot, par appariement glouton à courte fenêtre. */
function diffWords(aWords: string[], bWords: string[]): [boolean[], boolean[]] {
  const aMarks: boolean[] = new Array(aWords.length).fill(false);
  const bMarks: boolean[] = new Array(bWords.length).fill(false);

  let ai = 0;
  let bi = 0;
  const max = Math.max(aWords.length, bWords.length);
  while (ai < aWords.length || bi < bWords.length) {
    if (ai < aWords.length && bi < bWords.length && aWords[ai] === bWords[bi]) {
      ai++;
      bi++;
    } else {
      let foundA = -1;
      let foundB = -1;
      for (let look = 1; look < Math.min(20, max); look++) {
        if (foundA === -1 && bi + look < bWords.length && aWords[ai] === bWords[bi + look])
          foundA = look;
        if (foundB === -1 && ai + look < aWords.length && aWords[ai + look] === bWords[bi])
          foundB = look;
        if (foundA !== -1 || foundB !== -1) break;
      }
      if (foundA !== -1 && (foundB === -1 || foundA <= foundB)) {
        for (let j = 0; j < foundA; j++) bMarks[bi + j] = true;
        bi += foundA;
      } else if (foundB !== -1) {
        for (let j = 0; j < foundB; j++) aMarks[ai + j] = true;
        ai += foundB;
      } else {
        if (ai < aWords.length) {
          aMarks[ai] = true;
          ai++;
        }
        if (bi < bWords.length) {
          bMarks[bi] = true;
          bi++;
        }
      }
    }
  }

  return [aMarks, bMarks];
}

/** Rend le texte original (balises couleur incluses) avec surlignage du diff. */
function renderWithDiffHighlight(
  original: string,
  words: string[],
  marks: boolean[],
  diffClass: string,
  sameClass: string,
): ReactNode[] {
  const stripped = stripTags(original);
  const charDiff: boolean[] = new Array(stripped.length).fill(false);

  let pos = 0;
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const idx = stripped.indexOf(word, pos);
    if (idx >= 0) {
      if (marks[i]) {
        for (let j = idx; j < idx + word.length; j++) charDiff[j] = true;
      }
      pos = idx + word.length;
    }
  }

  const result: ReactNode[] = [];
  let key = 0;
  let strippedIdx = 0;
  let currentColor: string | null = null;

  let i = 0;
  while (i < original.length) {
    const openMatch = original.slice(i).match(/^<color=(#[0-9a-fA-F]{3,8})>/);
    if (openMatch) {
      currentColor = openMatch[1];
      i += openMatch[0].length;
      continue;
    }
    if (original.slice(i, i + 8) === '</color>') {
      currentColor = null;
      i += 8;
      continue;
    }

    const isDiff = charDiff[strippedIdx] ?? false;
    const color = currentColor;
    let run = original[i];
    i++;
    strippedIdx++;

    while (i < original.length) {
      if (original[i] === '<') break;
      const nextDiff = charDiff[strippedIdx] ?? false;
      if (nextDiff !== isDiff) break;
      run += original[i];
      i++;
      strippedIdx++;
    }

    const cls = isDiff ? diffClass : sameClass;
    if (color) {
      result.push(
        <span key={key++} className={cls} style={{ color }}>
          {run}
        </span>,
      );
    } else {
      result.push(
        <span key={key++} className={cls}>
          {run}
        </span>,
      );
    }
  }

  return result;
}

export function DiffHighlight({ existing, extracted }: { existing: string; extracted: string }) {
  const aWords = stripTags(existing).split(/(\s+)/);
  const bWords = stripTags(extracted).split(/(\s+)/);
  const [aMarks, bMarks] = diffWords(aWords, bWords);

  const delClass = 'bg-danger/25 text-danger';
  const addClass = 'bg-success/25 text-success';
  const sameClass = 'text-content-subtle';

  return (
    <div className="space-y-1.5">
      <div className="bg-danger/5 rounded px-2 py-1.5 text-xs leading-relaxed break-all whitespace-pre-wrap">
        <span className="text-danger mr-1.5 font-semibold opacity-70">existant</span>
        {renderWithDiffHighlight(existing, aWords, aMarks, delClass, sameClass)}
      </div>
      <div className="bg-success/5 rounded px-2 py-1.5 text-xs leading-relaxed break-all whitespace-pre-wrap">
        <span className="text-success mr-1.5 font-semibold opacity-70">extrait</span>
        {renderWithDiffHighlight(extracted, bWords, bMarks, addClass, sameClass)}
      </div>
    </div>
  );
}
