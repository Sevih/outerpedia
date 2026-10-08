/**
 * Recherche de la liste des effets — celle de l'admin (`/admin/editor/effects`)
 * et celle de l'onglet « Effets » de quick, qui l'appelle depuis son serveur.
 *
 * Fichier PUR, sans lecture disque : le serveur y prépare la botte de foin de
 * chaque effet (`effectHaystack`), le composant client y filtre le catalogue à
 * chaque frappe (`filterEffectCatalog`). La saisie latine passe par
 * `normalizeSearchText` — la même normalisation que la palette du site.
 *
 * LA RÈGLE. Une sous-chaîne cherchée dans tous les champs à la fois trouvait
 * sans dire pourquoi : « tes » sortait « Increased Speed », par le milieu de
 * son nom français (« Vitesse accrue »). Elle est remplacée par une règle qui
 * se lit, et qui NOMME le champ qui a répondu (`EffectMatch`) :
 *
 *   - la saisie est découpée en MOTS (lettres et chiffres ; `_`, `|` et
 *     l'espace séparent), et chacun doit COMMENCER un mot du champ — dans le
 *     même champ, peu importe l'ordre. Un mot ne se trouve donc plus par son
 *     milieu : « tes » n'attrape ni « Vitesse » ni `BT_ATTACK_SPEED`, mais
 *     attraperait `…_TEST`. « bt_sp » trouve `BT_STAT|ST_SPEED` ;
 *   - cette règle vaut pour l'`id`, les clés éditoriales (`BT_*` et alias), et
 *     les noms ANGLAIS puis FRANÇAIS — les deux langues que la saisie latine
 *     vise. L'espagnol n'est pas cherché ;
 *   - le japonais, le coréen et le chinois ne répondent que si la saisie porte
 *     un caractère de LEUR écriture (kana, hangul, idéogrammes), et alors par
 *     sous-chaîne : ces écritures n'ont pas de mots à l'espace.
 *
 * Le premier champ qui répond est rendu, dans l'ordre où il explique le mieux
 * la ligne : l'id exact, le nom anglais, le nom français, une clé (égale avant
 * préfixe), l'id par son début, puis les noms des autres écritures.
 */
import type { Lang } from '@/lib/i18n/config';
import { normalizeSearchText } from '@/lib/search-text';

/** Ce que la recherche lit d'un effet : id, clés éditoriales, nom par langue. */
export interface EffectSearchFields {
  id: string;
  /** Clés `BT_*` de l'index généré + `keys` curées. */
  keys: readonly string[];
  name: Record<string, string>;
}

/**
 * Le champ qui a répondu : `id`, `key` (une clé éditoriale) ou `name.<langue>`.
 * `all` : la saisie était vide — tout répond, aucun champ en particulier.
 */
export type EffectMatchField = 'all' | 'id' | 'key' | `name.${string}`;

/** Pourquoi un effet sort : le champ, et sa valeur telle qu'elle est écrite. */
export interface EffectMatch {
  field: EffectMatchField;
  value: string;
}

/** Les langues cherchées par MOTS, dans l'ordre où elles répondent. */
const WORD_LANGS: readonly Lang[] = ['en', 'fr'];

/**
 * Les langues cherchées par leur ÉCRITURE : la saisie doit en porter un
 * caractère. Les idéogrammes sont communs au chinois et au japonais.
 */
const SCRIPT_LANGS: Partial<Record<Lang, RegExp>> = {
  jp: /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u,
  kr: /\p{Script=Hangul}/u,
  zh: /\p{Script=Han}/u,
};

/** Sépare le champ de sa valeur dans une ligne de la botte de foin. */
const FIELD_SEP = '\t';

/**
 * Botte de foin d'un effet : ses champs cherchables, un par ligne, chacun
 * ÉTIQUETÉ (`id`, `key`, `name.<langue>`) et gardé tel qu'il est écrit — c'est
 * `effectMatches` qui normalise, pour pouvoir rendre la valeur d'origine. Une
 * saisie ne contient ni saut de ligne ni tabulation : aucune correspondance ne
 * chevauche deux champs.
 */
export function effectHaystack(e: EffectSearchFields): string {
  const fields: [string, string][] = [
    ['id', e.id],
    ...e.keys.map((k): [string, string] => ['key', k]),
    ...Object.entries(e.name).map(([lang, name]): [string, string] => [`name.${lang}`, name]),
  ];
  return fields
    .map(([field, value]) => [
      field,
      String(value ?? '')
        .replace(/\s+/g, ' ')
        .trim(),
    ])
    .filter(([, value]) => value)
    .map(([field, value]) => `${field}${FIELD_SEP}${value}`)
    .join('\n');
}

/** Les mots d'un texte normalisé : suites de lettres et de chiffres. */
const wordsOf = (s: string): string[] =>
  normalizeSearchText(s)
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);

/**
 * Le repli des écritures cherchées par sous-chaîne : casse et formes pleine
 * chasse, RIEN d'autre. `normalizeSearchText` y retirerait les marques de
 * voisement des kana (ピ → ヒ) et l'allongement (ー), des « diacritiques » pour
 * Unicode : « スピ » trouverait « ミスヒット ».
 */
const foldScript = (s: string): string => s.normalize('NFKC').toLowerCase().trim();

/** Chaque mot de la saisie commence un mot du champ. */
const startsWords = (needle: string[], value: string): boolean => {
  const words = wordsOf(value);
  return needle.every((n) => words.some((w) => w.startsWith(n)));
};

/**
 * Le champ de l'effet qui répond à la saisie, ou `null`. Une saisie vide garde
 * tout (`field: 'all'`).
 */
export function effectMatches(haystack: string, query: string): EffectMatch | null {
  const needle = normalizeSearchText(query);
  if (!needle) return { field: 'all', value: '' };

  const fields = haystack.split('\n').map((line): EffectMatch => {
    const cut = line.indexOf(FIELD_SEP);
    return { field: line.slice(0, cut) as EffectMatchField, value: line.slice(cut + 1) };
  });
  const of = (field: EffectMatchField): EffectMatch[] => fields.filter((f) => f.field === field);
  const words = wordsOf(query);
  const byWords = (f: EffectMatch): boolean => words.length > 0 && startsWords(words, f.value);
  const equal = (f: EffectMatch): boolean => normalizeSearchText(f.value) === needle;

  const found =
    of('id').find(equal) ??
    WORD_LANGS.map((l) => of(`name.${l}`).find(byWords)).find(Boolean) ??
    of('key').find(equal) ??
    of('key').find(byWords) ??
    of('id').find(byWords);
  if (found) return found;

  // Les autres écritures : chaque morceau de la saisie, où qu'il soit dans le nom.
  const parts = foldScript(query).split(/\s+/);
  for (const f of fields) {
    if (!f.field.startsWith('name.')) continue;
    if (!SCRIPT_LANGS[f.field.slice('name.'.length) as Lang]?.test(query)) continue;
    const name = foldScript(f.value);
    if (parts.every((p) => name.includes(p))) return f;
  }
  return null;
}

/** Le catalogue tel que la page le range : paires miroir, puis orphelins. */
export interface EffectCatalog<T> {
  pairs: { buff: T; debuff: T }[];
  orphanBuffs: T[];
  orphanDebuffs: T[];
}

/**
 * Filtre le catalogue sur une saisie. Une PAIRE reste entière dès qu'un de ses
 * deux membres correspond (on cherche un effet, on veut voir son miroir) ; les
 * deux colonnes d'orphelins se filtrent chacune de son côté.
 */
export function filterEffectCatalog<T extends { haystack: string }>(
  catalog: EffectCatalog<T>,
  query: string,
): EffectCatalog<T> {
  if (!normalizeSearchText(query)) return catalog;
  const hit = (e: T) => effectMatches(e.haystack, query) !== null;
  return {
    pairs: catalog.pairs.filter((p) => hit(p.buff) || hit(p.debuff)),
    orphanBuffs: catalog.orphanBuffs.filter(hit),
    orphanDebuffs: catalog.orphanDebuffs.filter(hit),
  };
}
