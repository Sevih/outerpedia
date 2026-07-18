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
 *
 * La logique cœur est exportée (`promote`, `applyRetention`) avec chemins
 * injectables : c'est elle qui est couverte par `promote.test.ts` — l'apply
 * est destructif, on ne le teste pas sur les vrais dossiers.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { isMain } from './lib/is-main';
import { formatJson } from './lib/json';

const SRC = resolve('data/extracted');
const DST = resolve('data/generated');

/**
 * Fichiers à RÉTENTION d'entités : une clé déjà VALIDÉE n'est jamais supprimée
 * par la promotion, même si le jeu a purgé ses lignes — les guides référencent
 * des boss par id, parfois anciens. Les clés absentes de la proposition sont
 * réinjectées à l'apply et signalées ; leur retrait reste une décision humaine
 * (édition git). `encounters.json` (donjons référencés par les `spawns` des
 * monstres) est retenu pour la même raison : un monstre retenu garde des réfs
 * résolvables. NB : `promote --apply` est désormais un geste MANUEL (le `pnpm
 * dev` ne promeut plus automatiquement — cf. scripts/dev-refresh.ts).
 */
export const RETAIN_ENTITIES = new Set(['monsters.json', 'monster-skills.json', 'encounters.json']);

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

/**
 * Cœur de la rétention : réinjecte dans la proposition (`extracted`) les
 * entités déjà validées (`committed`) qu'elle ne produit plus. L'ordre des
 * clés est celui de la proposition, entités retenues APPENDUES en fin —
 * même geste que l'intégration ciblée → diff git minimal et stable.
 */
export function applyRetention(
  committed: Record<string, unknown>,
  extracted: Record<string, unknown>,
): { merged: Record<string, unknown>; retained: string[] } {
  const retained = Object.keys(committed).filter((k) => !(k in extracted));
  const merged: Record<string, unknown> = { ...extracted };
  for (const k of retained) merged[k] = committed[k];
  return { merged, retained };
}

export interface PromoteOptions {
  /** Dossier de la proposition (défaut `data/extracted`). Injectable pour les tests. */
  src?: string;
  /** Dossier du validé (défaut `data/generated`). Injectable pour les tests. */
  dst?: string;
  /** Écrire réellement (sinon dry-run de revue). */
  apply?: boolean;
  /** Promotion ciblée : fichiers relatifs à `src` (cf. en-tête). */
  only?: ReadonlySet<string> | null;
}

export interface PromoteResult {
  /** Nombre de fichiers identiques octet à octet (après rétention). */
  identical: number;
  /** Lignes de diff affichées (une par fichier différent). */
  diffs: string[];
  /** Fichiers validés sans équivalent extrait (à trancher à la main). */
  orphans: string[];
}

/**
 * Le flux complet de promotion (revue OU apply). Lève une `Error` sur entrée
 * invalide (src absent, fichier `--only` inconnu) — le wrapper CLI la traduit
 * en sortie code 1 ; les tests l'attrapent directement.
 */
export async function promote(opts: PromoteOptions = {}): Promise<PromoteResult> {
  const { src = SRC, dst = DST, apply = false, only = null } = opts;

  if (!existsSync(src)) {
    throw new Error('data/extracted/ absent — lance d’abord `pnpm datagen:build`.');
  }

  let files = walk(src);
  if (only) {
    const unknown = [...only].filter((f) => !files.includes(f));
    if (unknown.length) {
      throw new Error(`--only : introuvable(s) dans data/extracted : ${unknown.join(', ')}`);
    }
    files = files.filter((f) => only.has(f));
  }
  // En promotion ciblée, le reste du monde est volontairement hors périmètre.
  const orphans = only ? [] : walk(dst).filter((f) => !files.includes(f) && !isArchive(f));
  let identical = 0;
  const diffs: string[] = [];

  for (const rel of files) {
    const srcText = readFileSync(join(src, rel), 'utf8');
    const dstPath = join(dst, rel);
    const dstText = existsSync(dstPath) ? readFileSync(dstPath, 'utf8') : undefined;

    // Rétention : réinjecte dans la proposition les entités validées que
    // l'extraction ne produit plus (format CANONIQUE, comme build → la
    // comparaison octet à octet ci-dessous ne voit que du contenu).
    let out = srcText;
    let retained: string[] = [];
    if (dstText !== undefined && RETAIN_ENTITIES.has(rel)) {
      const r = applyRetention(
        JSON.parse(dstText) as Record<string, unknown>,
        JSON.parse(srcText) as Record<string, unknown>,
      );
      retained = r.retained;
      if (retained.length) out = await formatJson(r.merged);
    }

    if (dstText === out) {
      identical++;
      continue;
    }
    const label =
      dstText === undefined
        ? 'NOUVEAU fichier'
        : entityDiff(JSON.parse(dstText) as unknown, JSON.parse(out) as unknown) +
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
  for (const rel of orphans)
    console.log(`  ⚠ ${rel} — validé sans équivalent extrait (à trancher)`);

  if (diffs.length) {
    console.log(
      apply
        ? '\n✔ appliqué — vérifie /admin, la CLI de cohérence et les tests avant de committer.'
        : '\n(dry-run — rien n’a été écrit ; relance avec --apply pour valider)',
    );
  }
  return { identical, diffs, orphans };
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
  await promote({ apply, only });
}

// Garde d'exécution directe : importer ce module depuis les tests ne doit
// PAS déclencher une promotion.
if (isMain(import.meta.url)) {
  main().catch((e) => {
    console.error(`\n\x1b[31mErreur : ${e?.message ?? e}\x1b[0m`);
    process.exit(1);
  });
}
