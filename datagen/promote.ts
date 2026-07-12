/**
 * PROMOTION extrait → validé (`pnpm datagen:promote [--apply]`).
 *
 * `data/extracted/`  = la PROPOSITION (sortie de `datagen:build`, gitignoré) ;
 * `data/generated/`  = la donnée VALIDÉE, committée et servie par le site.
 *
 * Sans `--apply` : montre le diff par fichier, au niveau ENTITÉ (clés
 * ajoutées / modifiées / retirées), et ne touche à rien — c'est l'écran de
 * revue. Avec `--apply` : copie les fichiers différents octet à octet (le
 * format de build est conservé → diffs git minimaux).
 *
 * La promotion est GLOBALE (les glossaires/skills/équipement sont transverses
 * et doivent rester cohérents entre eux) ; pour intégrer UN perso sans le
 * reste, passer par l'intégration ciblée de l'admin (`integrateCharacter`).
 *
 * Exception : `--only <fichier> [...]` promeut uniquement les fichiers cités
 * (chemins relatifs à data/extracted). Réservé aux fichiers AUTONOMES (sans
 * réfs croisées vers glossaires/skills — ex. `unlock-content.json`) quand un
 * autre domaine est en chantier et ne doit pas partir avec.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { formatJson } from './lib/json';

const SRC = resolve('data/extracted');
const DST = resolve('data/generated');

/**
 * Fichiers à RÉTENTION d'entités : une clé déjà VALIDÉE n'est jamais supprimée
 * par la promotion, même si le jeu a purgé ses lignes — les guides référencent
 * des boss par id, parfois anciens, et l'apply est AUTOMATIQUE en dev
 * (`pnpm dev`). Les clés absentes de la proposition sont réinjectées à
 * l'apply et signalées ; leur retrait reste une décision humaine (édition git).
 * `encounters.json` (donjons référencés par les `spawns` des monstres) est
 * retenu pour la même raison : un monstre retenu garde des réfs résolvables.
 */
const RETAIN_ENTITIES = new Set(['monsters.json', 'monster-skills.json', 'encounters.json']);

/**
 * Sous-dossier des états FIGÉS de boss (`pnpm datagen:version-boss`) : du
 * validé pur, sans équivalent extrait par construction — hors périmètre du
 * signalement « orphelin ».
 */
const isArchive = (rel: string): boolean => rel.startsWith('monster-archive/');

/** Tous les .json d'un dossier (récursif), chemins relatifs POSIX. */
function walk(dir: string, base = dir): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full, base));
    else if (name.endsWith('.json')) out.push(relative(base, full).replace(/\\/g, '/'));
  }
  return out.sort();
}

/** Diff au niveau entité pour un Record<string, …> (sinon comptage brut). */
function entityDiff(a: unknown, b: unknown): string {
  const isRec = (v: unknown): v is Record<string, unknown> =>
    Boolean(v) && typeof v === 'object' && !Array.isArray(v);
  if (!isRec(a) || !isRec(b)) return 'contenu modifié';
  const added: string[] = [];
  const removed: string[] = [];
  let changed = 0;
  for (const k of Object.keys(b)) if (!(k in a)) added.push(k);
  for (const k of Object.keys(a)) {
    if (!(k in b)) removed.push(k);
    else if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) changed++;
  }
  const parts: string[] = [];
  const list = (xs: string[]) =>
    xs.length > 6 ? `${xs.slice(0, 6).join(', ')}, …` : xs.join(', ');
  if (added.length) parts.push(`+${added.length} (${list(added)})`);
  if (changed) parts.push(`~${changed}`);
  if (removed.length) parts.push(`−${removed.length} (${list(removed)})`);
  return parts.join(' · ') || 'reformatage seul';
}

async function main(): Promise<void> {
  const apply = process.argv.includes('--apply');
  // `--only a.json b.json` : promotion ciblée (cf. en-tête).
  const onlyIdx = process.argv.indexOf('--only');
  const only =
    onlyIdx === -1
      ? null
      : new Set(process.argv.slice(onlyIdx + 1).filter((a) => !a.startsWith('--')));
  if (only && !only.size) {
    console.error('--only : au moins un fichier attendu (relatif à data/extracted).');
    process.exit(1);
  }
  if (!existsSync(SRC)) {
    console.error('data/extracted/ absent — lance d’abord `pnpm datagen:build`.');
    process.exit(1);
  }

  let files = walk(SRC);
  if (only) {
    const unknown = [...only].filter((f) => !files.includes(f));
    if (unknown.length) {
      console.error(`--only : introuvable(s) dans data/extracted : ${unknown.join(', ')}`);
      process.exit(1);
    }
    files = files.filter((f) => only.has(f));
  }
  // En promotion ciblée, le reste du monde est volontairement hors périmètre.
  const dstOnly = only ? [] : walk(DST).filter((f) => !files.includes(f) && !isArchive(f));
  let identical = 0;
  const diffs: string[] = [];

  for (const rel of files) {
    const src = readFileSync(join(SRC, rel), 'utf8');
    const dstPath = join(DST, rel);
    const dst = existsSync(dstPath) ? readFileSync(dstPath, 'utf8') : undefined;

    // Rétention : réinjecte dans la proposition les entités validées que
    // l'extraction ne produit plus (format CANONIQUE, comme build → la
    // comparaison octet à octet ci-dessous ne voit que du contenu).
    let out = src;
    let retained: string[] = [];
    if (dst !== undefined && RETAIN_ENTITIES.has(rel)) {
      const a = JSON.parse(dst) as Record<string, unknown>;
      const b = JSON.parse(src) as Record<string, unknown>;
      retained = Object.keys(a).filter((k) => !(k in b));
      if (retained.length) {
        const merged: Record<string, unknown> = { ...b };
        for (const k of retained) merged[k] = a[k];
        out = await formatJson(merged);
      }
    }

    if (dst === out) {
      identical++;
      continue;
    }
    const label =
      dst === undefined
        ? 'NOUVEAU fichier'
        : entityDiff(JSON.parse(dst) as unknown, JSON.parse(out) as unknown) +
          (retained.length ? ` · ${retained.length} retenue(s), jamais supprimées` : '');
    diffs.push(`  ${rel.padEnd(34)} ${label}`);
    if (apply) {
      mkdirSync(dirname(dstPath), { recursive: true });
      writeFileSync(dstPath, out);
    }
  }

  console.log(
    `promotion extrait → validé : ${identical} identique(s), ${diffs.length} différent(s)`,
  );
  for (const d of diffs) console.log(d);
  // Fichiers validés sans équivalent extrait : jamais supprimés d'office —
  // signalés pour décision humaine (entité retirée du jeu ? renommage ?).
  for (const rel of dstOnly)
    console.log(`  ⚠ ${rel} — validé sans équivalent extrait (à trancher)`);

  if (!diffs.length) return;
  console.log(
    apply
      ? '\n✔ appliqué — vérifie /admin, la CLI de cohérence et les tests avant de committer.'
      : '\n(dry-run — rien n’a été écrit ; relance avec --apply pour valider)',
  );
}

main().catch((e) => {
  console.error(`\n\x1b[31mErreur : ${e?.message ?? e}\x1b[0m`);
  process.exit(1);
});
