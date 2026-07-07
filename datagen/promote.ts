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
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const SRC = resolve('data/extracted');
const DST = resolve('data/generated');

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

function main(): void {
  const apply = process.argv.includes('--apply');
  if (!existsSync(SRC)) {
    console.error('data/extracted/ absent — lance d’abord `pnpm datagen:build`.');
    process.exit(1);
  }

  const files = walk(SRC);
  const dstOnly = walk(DST).filter((f) => !files.includes(f));
  let identical = 0;
  const diffs: string[] = [];

  for (const rel of files) {
    const src = readFileSync(join(SRC, rel), 'utf8');
    const dstPath = join(DST, rel);
    const dst = existsSync(dstPath) ? readFileSync(dstPath, 'utf8') : undefined;
    if (dst === src) {
      identical++;
      continue;
    }
    const label =
      dst === undefined
        ? 'NOUVEAU fichier'
        : entityDiff(JSON.parse(dst) as unknown, JSON.parse(src) as unknown);
    diffs.push(`  ${rel.padEnd(34)} ${label}`);
    if (apply) {
      mkdirSync(dirname(dstPath), { recursive: true });
      copyFileSync(join(SRC, rel), dstPath);
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

main();
