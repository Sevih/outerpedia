/**
 * COLLECTE 4-COMICS — peuple `.assets-staging/images/4-comics` pour que
 * `assets:push` envoie les BD sur R2 (webp d'affichage + MANIFESTE). Même étage
 * que la collecte images/audio/wallpapers : source éditoriale → staging → push.
 *
 * Source, jamais la V2 : `.editorial/comics/<LANG>/` (originaux png/jpg faits
 * main, ramenés en V3). On convertit en webp (recette projet `quality: 90`),
 * PLUS une vignette `<stem>.thumb.webp` (360 px, q75) pour la grille de la
 * galerie : les planches pleine taille pèsent ~450 Ko pièce et la page en
 * rendait ~50 → 22 Mo (audit Sitebulb 20/07). La lightbox garde la pleine
 * taille.
 *
 * MANIFESTE RUNTIME (décision Sevih) : on écrit AUSSI `images/4-comics/comics.json`
 * dans le staging → poussé sur R2 à côté des images. La page le lit à la requête
 * (revalidate), donc ajouter une BD = `pnpm images` et elle apparaît SANS
 * redéploiement. Le push purge l'edge sur cette clé → manifeste frais aussitôt.
 *
 * Idempotent : on ne reconvertit que si le webp cible manque ou si l'original a
 * changé (mtime). Pool absent → no-op sans erreur (pas encore de BD déposée),
 * pour ne pas casser `pnpm images`.
 *
 * Exécution : `pnpm assets:collect-comics` (ou via `pnpm images`).
 */
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
// sharp 0.35 : typings en `export =` — le type `Sharp` s'importe nommé, l'accès
// namespace `sharp.Sharp` ne compile plus.
import sharp, { type Sharp } from 'sharp';
import { STAGING_DIR } from './stage';
import { buildComics } from '../generators/comics';

const EDITORIAL = resolve('.editorial/comics');
const DEST = resolve(STAGING_DIR, 'images/4-comics');
const LANGS = ['EN', 'JP', 'KR'] as const;
const SRC_RE = /\.(png|jpe?g)$/i;

/** Largeur des vignettes de grille (cellules ~250 px, marge rétina raisonnable). */
const THUMB_WIDTH = 360;

/** Convertit les originaux d'un dossier de langue en webp + vignette (idempotent par mtime). */
async function collectLang(lang: string): Promise<{ made: number; skipped: number }> {
  const srcDir = join(EDITORIAL, lang);
  if (!existsSync(srcDir)) return { made: 0, skipped: 0 };
  const destDir = join(DEST, lang);
  mkdirSync(destDir, { recursive: true });
  let made = 0;
  let skipped = 0;
  for (const f of readdirSync(srcDir)) {
    if (!SRC_RE.test(f)) continue;
    const from = join(srcDir, f);
    const targets: Array<[string, () => Sharp]> = [
      [join(destDir, f.replace(SRC_RE, '.webp')), () => sharp(from).webp({ quality: 90 })],
      [
        join(destDir, f.replace(SRC_RE, '.thumb.webp')),
        // `withoutEnlargement` : un original plus étroit que 360 px reste tel quel.
        () =>
          sharp(from)
            .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
            .webp({ quality: 75 }),
      ],
    ];
    for (const [to, make] of targets) {
      if (existsSync(to) && statSync(to).mtimeMs >= statSync(from).mtimeMs) {
        skipped++;
        continue;
      }
      await make().toFile(to);
      made++;
    }
  }
  return { made, skipped };
}

export async function collectComics(): Promise<{ made: number; skipped: number }> {
  let made = 0;
  let skipped = 0;
  for (const lang of LANGS) {
    const r = await collectLang(lang);
    made += r.made;
    skipped += r.skipped;
  }
  // Manifeste runtime : la même liste que `comics.json`, poussée sur R2 pour que
  // la page la lise sans redéploiement. Écrit tant qu'une BD existe (sinon on ne
  // crée pas un dossier vide dans le staging).
  const manifest = buildComics();
  if (Object.values(manifest).some((l) => l.length)) {
    mkdirSync(DEST, { recursive: true });
    writeFileSync(join(DEST, 'comics.json'), JSON.stringify(manifest, null, 2) + '\n');
  }
  return { made, skipped };
}

collectComics().then(({ made, skipped }) => {
  if (made || skipped) console.log(`4-comics → ${made} converties, ${skipped} à jour`);
});
