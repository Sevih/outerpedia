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
