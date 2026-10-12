/**
 * Diff MOT À MOT de deux textes du jeu, en SEGMENTS — la règle de
 * `DiffHighlight.tsx`, descendue ici pour être partagée : le composant React
 * de l'admin et la page de quick (`scripts/quick/ui/tabs/extractor.js`) rendent
 * les mêmes segments, chacun dans son markup.
 *
 * PUR : ni DOM, ni React, ni I/O. Les balises `<color=#…>` du jeu sont
 * RETIRÉES pour comparer (une couleur qui change n'est pas un mot qui change)
 * et RENDUES par segment (`color`) : le texte garde son apparence en jeu.
 *
 * L'appariement est glouton à courte fenêtre (vingt mots) : un mot qui
 * réapparaît plus loin dans l'autre texte est un déplacement, pas une
 * réécriture de tout ce qui le précède. Les blancs sont des « mots » comme les
 * autres (`split(/(\s+)/)`) : ils restent dans le rendu.
 */

/** Un morceau de texte : inchangé, retiré (côté existant) ou ajouté (côté extrait). */
export interface WordSegment {
  kind: 'same' | 'removed' | 'added';
  text: string;
  /** La couleur d'une balise `<color=#…>` du jeu qui enveloppe ce morceau. */
  color?: string;
}

/** Le texte sans ses balises `<color>` : ce que l'on compare. */
export function stripColorTags(s: string): string {
  return s.replace(/<\/?color[^>]*>/g, '');
}

/** La fenêtre de l'appariement glouton : au-delà, un mot est tenu pour changé. */
const LOOKAHEAD = 20;

/**
 * Marque (true = changé) chaque mot des deux listes, par appariement glouton à
 * courte fenêtre. Les deux listes avancent ensemble ; sur un désaccord, on
 * cherche le mot courant de l'une un peu plus loin dans l'autre.
 */
export function markWords(aWords: string[], bWords: string[]): [boolean[], boolean[]] {
  const aMarks: boolean[] = new Array<boolean>(aWords.length).fill(false);
  const bMarks: boolean[] = new Array<boolean>(bWords.length).fill(false);

  let ai = 0;
  let bi = 0;
  const max = Math.max(aWords.length, bWords.length);
  while (ai < aWords.length || bi < bWords.length) {
    if (ai < aWords.length && bi < bWords.length && aWords[ai] === bWords[bi]) {
      ai++;
      bi++;
      continue;
    }
    let foundA = -1;
    let foundB = -1;
    for (let look = 1; look < Math.min(LOOKAHEAD, max); look++) {
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

  return [aMarks, bMarks];
}

/**
 * Le texte ORIGINAL (balises comprises) découpé en segments : chaque run de
 * caractères qui partage un même état (changé ou non) et une même couleur. Les
 * balises elles-mêmes ne sont pas rendues — leur couleur l'est.
 */
export function segmentText(
  original: string,
  words: string[],
  marks: boolean[],
  changed: WordSegment['kind'],
): WordSegment[] {
  const stripped = stripColorTags(original);
  // Les caractères changés, dans le texte SANS balises : les mots y sont
  // cherchés dans l'ordre, chacun après le précédent.
  const charDiff: boolean[] = new Array<boolean>(stripped.length).fill(false);
  let pos = 0;
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const idx = stripped.indexOf(word, pos);
    if (idx < 0) continue;
    if (marks[i]) for (let j = idx; j < idx + word.length; j++) charDiff[j] = true;
    pos = idx + word.length;
  }

  const out: WordSegment[] = [];
  let strippedIdx = 0;
  let currentColor: string | null = null;
  let i = 0;
  while (i < original.length) {
    const open = /^<color=(#[0-9a-fA-F]{3,8})>/.exec(original.slice(i));
    if (open) {
      currentColor = open[1];
      i += open[0].length;
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
      if ((charDiff[strippedIdx] ?? false) !== isDiff) break;
      run += original[i];
      i++;
      strippedIdx++;
    }
    out.push({ kind: isDiff ? changed : 'same', text: run, ...(color ? { color } : {}) });
  }
  return out;
}

/** Les deux textes en segments : l'existant (ses retraits), l'extrait (ses ajouts). */
export function diffWords(
  existing: string,
  extracted: string,
): { existing: WordSegment[]; extracted: WordSegment[] } {
  const aWords = stripColorTags(existing).split(/(\s+)/);
  const bWords = stripColorTags(extracted).split(/(\s+)/);
  const [aMarks, bMarks] = markWords(aWords, bWords);
  return {
    existing: segmentText(existing, aWords, aMarks, 'removed'),
    extracted: segmentText(extracted, bWords, bMarks, 'added'),
  };
}

/** Un texte seul, sans diff : ses runs de couleur (pour une feuille d'arbre). */
export function colorSegments(text: string): WordSegment[] {
  const words = stripColorTags(text).split(/(\s+)/);
  return segmentText(text, words, new Array<boolean>(words.length).fill(false), 'same');
}
