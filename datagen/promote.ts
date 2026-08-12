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
 * GARDE PERSO : la réciproque est VERROUILLÉE — un perso que l'admin n'a pas
 * intégré ne part JAMAIS avec une promotion, même globale (cf.
 * `stripUnintegratedCharacters`).
 *
 * Exception : `--only <fichier> [...]` promeut uniquement les fichiers cités
 * (chemins relatifs à data/extracted). Réservé aux fichiers AUTONOMES (sans
 * réfs croisées vers glossaires/skills — ex. `unlock-content.json`) quand un
 * autre domaine est en chantier et ne doit pas partir avec. GARDE-FOU : citer
 * un membre du trio à rétention (`RETAIN_ENTITIES`) entraîne les deux autres —
 * ils forment une unité référentielle, un seul promu casse les invariants.
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
 * Validés PURS, sans équivalent extrait PAR CONSTRUCTION — hors périmètre du
 * signalement « orphelin » (qui ne doit lever que sur un vrai résidu) :
 *   - `monster-archive/` : états FIGÉS de boss (`pnpm datagen:version-boss`) ;
 *   - `comics.json` : les 4-cut comics sont FAITES MAIN (aucune table du jeu
 *     ne les décrit) et `buildComics` n'est délibérément PAS câblé dans
 *     `build.ts` — la liste servie est le manifeste R2 lu à la requête, ce
 *     fichier n'étant que le repli committé (cf. tools/_contents/4-comics).
 *     Il était signalé à CHAQUE promote, bruit qui masque les vrais orphelins.
 */
const isPureCurated = (rel: string): boolean =>
  rel.startsWith('monster-archive/') || rel === 'comics.json';

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
 *
 * Chaque entité retenue est MARQUÉE `retired: true` : le jeu a retiré ce
 * contenu, l'entrée est une ARCHIVE — les invariants « vivants » (tests de
 * spawn inverse d'encounters) l'exemptent, et le front peut un jour l'afficher
 * comme telle. Idempotent : une archive déjà marquée se re-marque à
 * l'identique (l'entité revenue dans l'extraction reprend la proposition,
 * donc perd le flag).
 */
export function applyRetention(
  committed: Record<string, unknown>,
  extracted: Record<string, unknown>,
): { merged: Record<string, unknown>; retained: string[] } {
  const retained = Object.keys(committed).filter((k) => !(k in extracted));
  const merged: Record<string, unknown> = { ...extracted };
  for (const k of retained) {
    const entry = committed[k];
    merged[k] =
      entry && typeof entry === 'object' && !Array.isArray(entry)
        ? { ...entry, retired: true }
        : entry;
  }
  return { merged, retained };
}

/**
 * GARDE PERSO — un personnage n'entre dans le validé QUE par l'intégration
 * ciblée de l'admin (`integrateCharacter`), JAMAIS par la promotion globale
 * (décision Sevih 2026-07-28 : le jeu embarque les persos des patchs À VENIR —
 * `2400015` le jour de la mesure, sans même un nom, donc slug vide — et un
 * `promote --apply` global les aurait publiés).
 *
 * « Non intégré » = clé du `characters.json` PROPOSÉ absente du `characters.json`
 * VALIDÉ. Sans l'un des deux fichiers sous la main (bootstrap, promotion
 * partielle), aucun filtrage — on ne filtre que sur une PREUVE de
 * non-intégration, même philosophie que `lib/released.ts`.
 *
 * Le retrait est GÉNÉRIQUE (récursif, aucune liste de fichiers à tenir) :
 * dans tout record, une entrée dont la CLÉ est un id non intégré saute
 * (`characters`, `characters-list`, `damage-scaling`, `progression.premium`…),
 * de même qu'une entrée dont la VALEUR est exactement cet id
 * (`characters-slug-to-id`). Une réf qui SURVIT au retrait (id dans un tableau,
 * forme nouvelle d'un futur générateur) fait REFUSER la promotion entière en
 * nommant fichier + ids : le « jamais » est garanti par erreur bloquante, pas
 * par convention. Mutation en place ; retourne les ids effectivement écartés.
 */
export function stripUnintegratedCharacters(data: unknown, ids: ReadonlySet<string>): string[] {
  const removed = new Set<string>();
  const visit = (v: unknown): void => {
    if (Array.isArray(v)) {
      for (const e of v) visit(e);
      return;
    }
    if (!v || typeof v !== 'object') return;
    const rec = v as Record<string, unknown>;
    for (const [k, val] of Object.entries(rec)) {
      if (ids.has(k) || (typeof val === 'string' && ids.has(val))) {
        removed.add(ids.has(k) ? k : (val as string));
        delete rec[k];
      } else visit(val);
    }
  };
  visit(data);
  return [...removed].sort();
}

/** Clés du `characters.json` d'un dossier, ou `null` s'il n'y en a pas. */
function characterIds(dir: string): Set<string> | null {
  const path = join(dir, 'characters.json');
  if (!existsSync(path)) return null;
  return new Set(Object.keys(JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>));
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
  /** Ids de persos non intégrés écartés de la promotion (garde perso). */
  strippedCharacters: string[];
  /**
   * Réfs de persos non intégrés SURVIVANT à l'écartement (`fichier : ids`).
   * En apply c'est un refus bloquant (l'erreur est levée avant d'écrire) ; en
   * dry-run la revue continue et les liste — un nouveau perso du jeu ne doit
   * pas mettre `pnpm dev` en panne (c'est l'admin, servi par le dev, qui
   * permet justement de l'intégrer).
   */
  violations: string[];
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
    // Le trio à rétention est une UNITÉ RÉFÉRENTIELLE (monsters → skills de
    // monstres, spawns → donjons) : en promouvoir UN seul coupe des réfs — le
    // vécu du 21/07 : monsters.json promu seul = 57 donjons orphelins et 41
    // skills pendants, détectés par les invariants d'encounters.test. Citer un
    // membre entraîne les autres (présents dans la proposition).
    const scope = new Set(only);
    if ([...only].some((f) => RETAIN_ENTITIES.has(f))) {
      for (const f of RETAIN_ENTITIES) if (files.includes(f)) scope.add(f);
    }
    files = files.filter((f) => scope.has(f));
  }
  // En promotion ciblée, le reste du monde est volontairement hors périmètre.
  const orphans = only ? [] : walk(dst).filter((f) => !files.includes(f) && !isPureCurated(f));

  // Garde perso : nouveaux ids de la proposition, inconnus du validé (cf.
  // `stripUnintegratedCharacters`). Sans les deux fichiers, pas de filtrage.
  const srcChars = characterIds(src);
  const dstChars = characterIds(dst);
  const unintegrated = new Set(
    srcChars && dstChars ? [...srcChars].filter((id) => !dstChars.has(id)) : [],
  );

  let identical = 0;
  const diffs: string[] = [];
  const strippedAll = new Set<string>();
  const violations: string[] = [];
  // Écritures DIFFÉRÉES à après le verrou perso : une promotion refusée ne
  // laisse RIEN d'écrit (tout-ou-rien), jamais un validé à moitié promu.
  const pending: Array<{ path: string; text: string }> = [];

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

    // Garde perso : écarte les persos non intégrés, puis VERROUILLE — une réf
    // survivante (bornée par des non-chiffres : `2400015` ne matche pas dans
    // `24000151`) refuse la promotion entière, générateur à corriger.
    let stripped: string[] = [];
    if (unintegrated.size) {
      if ([...unintegrated].some((id) => out.includes(id))) {
        const data = JSON.parse(out) as unknown;
        stripped = stripUnintegratedCharacters(data, unintegrated);
        if (stripped.length) out = await formatJson(data);
        for (const id of stripped) strippedAll.add(id);
      }
      const residue = [...unintegrated].filter((id) =>
        new RegExp(`(?<!\\d)${id}(?!\\d)`).test(out),
      );
      if (residue.length) violations.push(`${rel} : ${residue.join(', ')}`);
    }

    if (dstText === out) {
      identical++;
      continue;
    }
    const notes =
      (retained.length ? ` · ${retained.length} retenue(s), jamais supprimées` : '') +
      (stripped.length
        ? ` · ${stripped.length} perso(s) non intégré(s) écarté(s) : ${stripped.join(', ')}`
        : '');
    const label =
      dstText === undefined
        ? `NOUVEAU fichier${notes}`
        : entityDiff(JSON.parse(dstText) as unknown, JSON.parse(out) as unknown) + notes;
    diffs.push(`  ${rel.padEnd(34)} ${label}`);
    if (apply) pending.push({ path: dstPath, text: out });
  }

  if (violations.length) {
    const msg =
      'perso(s) non intégré(s) encore référencé(s) après écartement — promotion REFUSÉE, ' +
      'rien n’a été écrit. Intégrer via l’admin, ou corriger le générateur fautif :\n  ' +
      violations.join('\n  ');
    // Apply : refus bloquant, rien n'écrire — inchangé. Dry-run : rien n'allait
    // être écrit de toute façon → AVERTIR au lieu d'échouer, sinon une MAJ du
    // jeu (nouveau perso, ex. Saeran 2026-07-27) met `pnpm dev` en panne… qui
    // est précisément l'outil d'intégration (deadlock de flux).
    if (apply) throw new Error(msg);
    console.warn(`⚠ ${msg}\n  (dry-run : la revue continue ; l’apply, lui, refusera)`);
  }
  for (const { path, text } of pending) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, text);
  }

  console.log(
    `promotion extrait → validé : ${identical} identique(s), ${diffs.length} différent(s)`,
  );
  for (const d of diffs) console.log(d);
  // Fichiers validés sans équivalent extrait : jamais supprimés d'office —
  // signalés pour décision humaine (entité retirée du jeu ? renommage ?).
  for (const rel of orphans)
    console.log(`  ⚠ ${rel} — validé sans équivalent extrait (à trancher)`);
  // Toujours signalé, même quand les fichiers finissent identiques (re-run) :
  // l'écran de revue doit dire QUI a été écarté et pourquoi il ne partira pas.
  if (strippedAll.size)
    console.log(
      `  ⛔ perso(s) non intégré(s), jamais promu(s) : ${[...strippedAll].sort().join(', ')} — intégration via l'admin uniquement`,
    );

  if (diffs.length) {
    console.log(
      apply
        ? '\n✔ appliqué — vérifie /admin, la CLI de cohérence et les tests avant de committer.'
        : '\n(dry-run — rien n’a été écrit ; relance avec --apply pour valider)',
    );
  }
  return { identical, diffs, orphans, strippedCharacters: [...strippedAll].sort(), violations };
}

async function main(): Promise<void> {
  const apply = process.argv.includes('--apply');
  // `--only a.json b.json` : promotion ciblée (cf. en-tête). La liste s'arrête
  // au PROCHAIN flag — avant, `--only a.json --apply b.json` absorbait aussi
  // `b.json` situé après le flag (filtre au lieu de borne).
  const onlyIdx = process.argv.indexOf('--only');
  const rest = onlyIdx === -1 ? [] : process.argv.slice(onlyIdx + 1);
  const stop = rest.findIndex((a) => a.startsWith('--'));
  const only = onlyIdx === -1 ? null : new Set(stop === -1 ? rest : rest.slice(0, stop));
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
