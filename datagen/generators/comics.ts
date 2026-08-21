/**
 * Générateur — catalogue des 4-CUT COMICS (`/4-comics`).
 *
 * Produit `comics.json` : `{ EN: [stem…], JP: […], KR: […] }` — la liste, par
 * langue d'ORIGINE de la BD, des noms de fichiers (sans extension) à servir.
 *
 * Ces BD sont FAITES MAIN : elles n'existent pas dans les fichiers du jeu. On
 * les RAMÈNE ici (jamais de pointeur externe) dans `.editorial/comics/<LANG>/`
 * (gitignoré → R2, comme l'éditorial wallpapers). Le catalogue se maintient
 * seul : déposer une image dans le bon dossier suffit, aucune liste à tenir.
 *
 * On scanne les ORIGINAUX (png/jpg) : le générateur ne dépend donc pas de la
 * conversion webp (`assets:collect-comics`), et un stem apparaît dès l'ajout de
 * la source. webp et original partagent le stem → même clé côté page.
 *
 * AUCUN writer dans `build.ts` — contrairement au reste de `data/generated/`.
 * `buildComics` n'y est délibérément PAS câblé (cf. `promote.ts`,
 * `isPureCurated`) : la liste SERVIE est le manifeste écrit par
 * `assets:collect-comics` dans le staging, poussé sur R2 par `pnpm images` et
 * lu à la requête, si bien qu'une BD ajoutée apparaît sans redéploiement.
 *
 * `data/generated/comics.json` n'est donc QUE le repli committé — servi quand
 * R2 est injoignable, et SEULE source en dev (`NEXT_PUBLIC_IMG_BASE` y est
 * vide, cf. tools/_contents/4-comics). Il est réaligné sur ce qui est en ligne
 * par `assets:sync-comics-seed`, dernier maillon de `pnpm images`. Ce docblock
 * a annoncé `datagen:build` jusqu'au 2026-08-15 : c'était faux, et le repli
 * avait dérivé à 27 BD contre 31 en ligne — invisible en prod, trompeur en dev.
 *
 * L'exécution directe IMPRIME pour revue : elle n'écrit rien.
 */
import { existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { isMain } from '../lib/is-main';

/** Langues d'origine des BD (propriété de l'ART, pas de la langue du site). */
export const COMIC_LANGS = ['EN', 'JP', 'KR'] as const;
export type ComicLang = (typeof COMIC_LANGS)[number];
export type ComicsData = Record<ComicLang, string[]>;

/** Pool éditorial rapatrié (une image = une BD, rangée par langue). */
const EDITORIAL = resolve('.editorial/comics');

/** Formats sources acceptés (originaux faits main + webp éventuel déjà converti). */
const IMAGE_RE = /\.(png|jpe?g|webp)$/i;

/** Stems (sans extension), dédoublonnés et triés, d'un dossier de langue. */
function scanLang(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const stems = new Set<string>();
  for (const f of readdirSync(dir)) {
    if (!IMAGE_RE.test(f)) continue;
    stems.add(f.replace(IMAGE_RE, ''));
  }
  return [...stems].sort();
}

/** Stems par langue d'un catalogue, tolérant à un JSON étranger (repli relu du disque). */
function stemsByLang(catalog: unknown): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>();
  if (!catalog || typeof catalog !== 'object') return out;
  for (const [lang, list] of Object.entries(catalog)) {
    if (Array.isArray(list)) {
      out.set(lang, new Set(list.filter((s): s is string => typeof s === 'string')));
    }
  }
  return out;
}

/**
 * Ce qu'un catalogue local RETIRERAIT d'un catalogue de référence : les stems
 * que la référence porte et que le pool local n'a pas, par langue (vide = aucun
 * retrait, donc publication sans perte).
 *
 * COMPARER DES ENSEMBLES, PAS DES COMPTES. Le garde-fou d'origine mesurait des
 * tailles : il a laissé passer le cas du 2026-08-21 — un pool de 31 BD par
 * langue face à 31 en ligne, mais PAS LES MÊMES (3 nouvelles d'un côté, 3
 * anciennes de l'autre, jamais poussées en original). L'échange à somme nulle
 * aurait effacé trois BD de la galerie sans qu'aucun compteur ne bouge.
 */
export function removedStems(local: unknown, reference: unknown): Map<string, string[]> {
  const here = stemsByLang(local);
  const out = new Map<string, string[]>();
  for (const [lang, refStems] of stemsByLang(reference)) {
    const mine = here.get(lang) ?? new Set<string>();
    const gone = [...refStems].filter((s) => !mine.has(s));
    if (gone.length) out.set(lang, gone);
  }
  return out;
}

/** Construit le catalogue des BD, par langue d'origine. */
export function buildComics(): ComicsData {
  const out = {} as ComicsData;
  for (const lang of COMIC_LANGS) out[lang] = scanLang(join(EDITORIAL, lang));
  return out;
}

// Exécution directe = REVUE (impression) ; writer canonique = `datagen:build`.
if (isMain(import.meta.url)) {
  console.log(JSON.stringify(buildComics(), null, 2));
}
