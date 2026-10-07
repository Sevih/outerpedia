/**
 * quick/ui/comics-group — à quelle BD et à quelle langue appartient une planche,
 * d'après son nom de fichier.
 *
 * UN FICHIER, DEUX LECTEURS, comme `discord-editor.mjs` : l'onglet « 4-comics »
 * le charge tel quel (`/ui/comics-group.mjs`) pour ranger ce qu'on y glisse, et
 * `actions.ts` l'importe pour nommer les BD dans son commit — c'est par ses
 * `comicLangOf` et `groupComics` que les tests le couvrent. D'où le `.mjs`, du
 * JavaScript nu typé par JSDoc (`checkJs` de `scripts/tsconfig.json`) : une
 * copie dans la page ne serait pas testée, et rangerait un jour autrement que
 * le serveur ne nomme.
 *
 * PUR, et sans liste de langues à lui : elle arrive en argument — `COMIC_LANGS`
 * côté serveur, `state.langs` côté page (la même, rendue par `/api/state`).
 */

/**
 * Le radical d'une planche et la langue que dit son nom : `_EN`, `_JP`, `_KR`
 * JUSTE AVANT l'extension, sans égard à la casse (`outerplane_comic04_kr.png`).
 * Tout autre nom n'a pas de langue, et son radical est le nom sans l'extension
 * (`outerplane_comic01.jpg`, `yami_EN_.png`).
 *
 * @template {string} L
 * @param {string} name
 * @param {readonly L[]} langs
 * @returns {{ stem: string, lang: L | null }}
 */
export function splitComicName(name, langs) {
  const dot = name.lastIndexOf('.');
  const base = dot > 0 ? name.slice(0, dot) : name;
  const m = dot > 0 ? /^(.+)_([a-z]+)$/i.exec(base) : null;
  const tag = m?.[2].toUpperCase();
  const lang = langs.find((l) => l === tag);
  return m && lang ? { stem: m[1], lang } : { stem: base, lang: null };
}

/**
 * Les planches regroupées par BD (le radical), dans l'ordre d'arrivée, une case
 * par langue. La langue d'une planche : celle qu'on lui a donnée à la main
 * (`lang`), sinon celle de son nom, sinon `fallback`.
 *
 * Une case ne tient qu'UNE planche : la seconde du même radical dans la même
 * langue ouvre une ligne de plus — elle reste visible, à corriger ou à retirer,
 * au lieu de remplacer l'autre sans un mot.
 *
 * @template {string} L
 * @template {{ name: string, lang?: L }} F
 * @param {readonly F[]} files
 * @param {readonly L[]} langs
 * @param {L} fallback
 * @returns {{ stem: string, slots: Partial<Record<L, F>> }[]}
 */
export function groupByStem(files, langs, fallback) {
  /** @type {{ stem: string, slots: Partial<Record<L, F>> }[]} */
  const groups = [];
  for (const file of files) {
    const named = splitComicName(file.name, langs);
    const lang = file.lang ?? named.lang ?? fallback;
    let group = groups.find((g) => g.stem === named.stem && !g.slots[lang]);
    if (!group) groups.push((group = { stem: named.stem, slots: {} }));
    group.slots[lang] = file;
  }
  return groups;
}
