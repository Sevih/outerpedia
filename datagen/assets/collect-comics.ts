/**
 * COLLECTE 4-COMICS — peuple `.assets-staging/images/4-comics` pour que
 * `assets:push` envoie les BD sur R2 (webp d'affichage + MANIFESTE). Même étage
 * que la collecte images/audio/wallpapers : source éditoriale → staging → push.
 *
 * Source unique : `.editorial/comics/<LANG>/` (originaux png/jpg faits
 * main, ramenés ici). On convertit en webp (recette projet `quality: 90`),
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
 * pour ne pas casser `pnpm images`. Pool PARTIEL (machine désynchronisée) → les
 * webp partent, mais le manifeste est retenu : cf. le garde-fou dans
 * `collectComics`, et `editorial:pull` pour tenir le pool à jour partout.
 *
 * Exécution : `pnpm assets:collect-comics` (ou via `pnpm images`).
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
// sharp 0.35 : typings en `export =` — le type `Sharp` s'importe nommé, l'accès
// namespace `sharp.Sharp` ne compile plus.
import sharp, { type Sharp } from 'sharp';
import { STAGING_DIR } from './stage';
import { buildComics, removedStems } from '../generators/comics';

const EDITORIAL = resolve('.editorial/comics');
/** Seed committé : la trace VERSIONNÉE du pool complet (garde-fou, cf. plus bas). */
const SEED = resolve('data/generated/comics.json');
/** État du push (`clé → sha1`), committé : dit ce que R2 SERT réellement. */
const PUSHED = resolve('datagen/assets/pushed.json');
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

/** Nombre total de stems d'un catalogue, toutes langues (tolérant à un JSON étranger). */
function totalStems(catalog: unknown): number {
  if (!catalog || typeof catalog !== 'object') return 0;
  return Object.values(catalog).reduce<number>((n, l) => n + (Array.isArray(l) ? l.length : 0), 0);
}

/**
 * Un stem est-il SERVI par R2 ? Ses DEUX dérivés doivent être confirmés poussés
 * (pleine taille + vignette de grille) dans l'état committé du push — la seule
 * preuve disponible hors ligne de ce que le bucket contient.
 */
function isServed(pushed: Record<string, unknown>, lang: string, stem: string): boolean {
  const base = `images/4-comics/${lang}/${stem}`;
  return !!pushed[`${base}.webp`] && !!pushed[`${base}.thumb.webp`];
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
  if (!totalStems(manifest)) return { made, skipped };
  // GARDE-FOU — le manifeste décrit le pool LOCAL et écrase celui de R2. Publier
  // depuis une machine au pool incomplet (`.editorial/` est gitignoré, donc absent
  // d'un clone frais et divergent entre PC) amputerait la galerie : les webp
  // resteraient sur R2, mais plus personne ne les demanderait.
  //
  // La référence est le SEED COMMITTÉ, que `sync-comics-seed` réaligne sur le
  // manifeste réellement EN LIGNE après chaque push — c'est donc une trace fiable
  // de ce que sert la galerie, disponible hors ligne.
  //
  // On compare les ENSEMBLES DE STEMS, pas leurs tailles : un pool qui échange
  // 3 BD contre 3 autres passait le test des comptes (cf. `removedStems`).
  const seed: unknown = existsSync(SEED) ? JSON.parse(readFileSync(SEED, 'utf8')) : {};
  const removed = removedStems(manifest, seed);
  if (removed.size && !process.argv.includes('--force')) {
    // RÉCONCILIATION plutôt que blocage. Le manifeste n'est qu'une LISTE DE NOMS :
    // une BD dont les webp sont déjà sur R2 continue d'être servie même si son
    // ORIGINAL manque ici. On la garde donc au catalogue au lieu de l'effacer —
    // sinon publier une nouvelle BD depuis une machine exigerait d'avoir toutes
    // les autres, ce qui bloquait le portable sur un `editorial:push` du fixe
    // inaccessible (cas du 2026-08-21).
    const pushed: Record<string, unknown> = existsSync(PUSHED)
      ? JSON.parse(readFileSync(PUSHED, 'utf8'))
      : {};
    const kept: string[] = [];
    const orphans: string[] = [];
    for (const [lang, stems] of removed) {
      if (!(LANGS as readonly string[]).includes(lang)) continue;
      const list = manifest[lang as (typeof LANGS)[number]];
      for (const stem of stems) {
        if (isServed(pushed, lang, stem)) {
          list.push(stem);
          kept.push(`${lang} : ${stem}`);
        } else {
          orphans.push(`${lang} : ${stem}`);
        }
      }
      // Le catalogue doit rester TRIÉ (invariant gravé dans comics.test).
      list.sort();
    }
    if (kept.length) {
      console.log(
        `  ${kept.length} BD servie(s) par R2 sans original local — CONSERVÉE(S) au manifeste :\n` +
          kept.map((k) => `      ${k}`).join('\n') +
          '\n  (leurs originaux ne sont pas sur R2 : `pnpm editorial:push` depuis la\n' +
          '   machine qui les détient, quand elle sera accessible.)',
      );
    }
    // ORPHELINES : ni original ici, ni dérivé sur R2. Les lister donnerait des
    // 404 ; les taire les effacerait. On retient tout le manifeste — c'est le
    // seul cas qui exige vraiment l'autre machine.
    if (orphans.length) {
      console.warn(
        `⚠ 4-comics : ${orphans.length} BD au catalogue n'ont NI original local NI dérivé sur R2 :\n` +
          orphans.map((o) => `      ${o}`).join('\n') +
          '\n  manifeste NON écrit (publier d’ici les ferait disparaître).\n' +
          '  → `pnpm editorial:pull`, ou `--force` si le retrait est VOLONTAIRE.',
      );
      const stale = join(DEST, 'comics.json');
      if (existsSync(stale)) {
        rmSync(stale, { force: true });
        console.warn('  (manifeste périmé retiré du staging : rien ne sera poussé)');
      }
      return { made, skipped };
    }
  }
  mkdirSync(DEST, { recursive: true });
  writeFileSync(join(DEST, 'comics.json'), JSON.stringify(manifest, null, 2) + '\n');
  return { made, skipped };
}

collectComics().then(({ made, skipped }) => {
  if (made || skipped) console.log(`4-comics → ${made} converties, ${skipped} à jour`);
});
