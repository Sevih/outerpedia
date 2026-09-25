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
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { isMain } from './lib/is-main';
import { formatJson, writeTextAtomic } from './lib/json';
import { GAME_LANGS, emptyDict } from './lib/lang';
import { isUnreleasedCharacterAsset } from './lib/released';

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
 * CATALOGUES d'assets à rétention d'ENTRÉES : `wallpapers.json` et
 * `bgm_mapping.json` ne sont pas des records d'entités mais des LISTES dérivées
 * d'un pool extrait du jeu (`.gamedata/extracted/{wallpapers,audio}`), reconstruit
 * de zéro à chaque patch. Un asset que le jeu retire de ses bundles sort donc du
 * pool, puis du catalogue proposé — alors que son fichier, lui, est TOUJOURS
 * servi (le push R2 ne supprime jamais rien, cf. scripts/assets-push.mjs). Vécu
 * le 08/09/2026 : trois fonds d'événement (`T_Event_BG_015/017/029`) et l'art de
 * PNJ `IMG_3000032` ont quitté `/wallpapers` sans que personne ne le décide.
 *
 * Même geste que `RETAIN_ENTITIES`, par entrée : une entrée validée que la
 * proposition ne produit plus est réinjectée en FIN de sa liste, marquée
 * `retired: true` — le front la range sous l'onglet « archivé » de son outil.
 * Trois garde-fous propres aux assets :
 *   - HÉBERGÉ : on ne retient qu'une entrée dont le fichier figure dans
 *     `pushed.json` (le registre de ce qui est sur R2) — retenue sans fichier,
 *     elle serait un lien mort ;
 *   - PERSO INTÉGRÉ : `isUnreleasedCharacterAsset` s'applique aussi aux
 *     retenues. C'est ce filtre — pas le jeu — qui a sorti `IMG_2710005` & co
 *     le 22/09 : ces trois-là ne sont PAS à retenir ;
 *   - LISTE VIDE : une liste proposée VIDE signifie « pool absent, jamais
 *     scanné » (le générateur rend `[]` sans extraction locale), pas « tout
 *     retiré » — le validé passe alors tel quel, sans marquage. Une liste
 *     ABSENTE de la proposition (catégorie supprimée du générateur) n'est en
 *     revanche pas retenue : c'est un choix de code, pas un retrait du jeu.
 */
type CatalogEntry = Record<string, unknown>;
interface CatalogSpec {
  /** Les listes du fichier (`name` = catégorie, ou '' pour un tableau nu). */
  lists: (data: unknown) => Array<{ name: string; items: CatalogEntry[] }>;
  /** Reconstruit le fichier à partir des listes (même forme que l'entrée). */
  assemble: (lists: Array<{ name: string; items: CatalogEntry[] }>) => unknown;
  /** Identité d'une entrée dans sa liste. */
  key: (entry: CatalogEntry) => string;
  /** Clé R2 du fichier servi — le garde-fou HÉBERGÉ la cherche dans `pushed.json`. */
  hostedKey: (list: string, entry: CatalogEntry) => string;
  /** Nom d'asset soumis au filtre perso (cf. `lib/released`), s'il y a lieu. */
  characterAsset?: (entry: CatalogEntry) => string;
}
export const RETAIN_CATALOGS: Record<string, CatalogSpec> = {
  'wallpapers.json': {
    lists: (d) =>
      Object.entries(d as Record<string, CatalogEntry[]>).map(([name, items]) => ({ name, items })),
    assemble: (lists) => Object.fromEntries(lists.map((l) => [l.name, l.items])),
    key: (e) => String(e.f),
    // Mêmes chemins que `src/lib/wallpapers.ts` : HeroFullArt réutilise les
    // full-arts perso (sauf ses versions archivées `@n`, dans le namespace
    // wallpaper), les `Full:*` partagent le dossier `Full`.
    hostedKey: (list, e) =>
      list === 'HeroFullArt' && !/@\d+$/.test(String(e.f))
        ? `images/characters/full/${e.f}.webp`
        : `images/download/${list.startsWith('Full') ? 'Full' : list}/${e.f}.webp`,
    characterAsset: (e) => String(e.f),
  },
  'bgm_mapping.json': {
    lists: (d) => [{ name: '', items: d as CatalogEntry[] }],
    assemble: (lists) => lists[0]?.items ?? [],
    key: (e) => String(e.file),
    hostedKey: (_list, e) => `audio/bgm/${e.file}.mp3`,
  },
};

/** Clés de `pushed.json` (ce qui est sur R2), lues une fois par process. */
let pushedKeys: Set<string> | undefined;
function isPushed(key: string): boolean {
  if (!pushedKeys) {
    const path = resolve('datagen/assets/pushed.json');
    pushedKeys = new Set(
      existsSync(path)
        ? Object.keys(JSON.parse(readFileSync(path, 'utf8')) as Record<string, string>)
        : [],
    );
  }
  return pushedKeys.has(key);
}

/** Garde-fous injectables de la rétention de catalogue (défauts = réels). */
export interface CatalogGuards {
  /** Le fichier est-il hébergé (clé R2 présente dans `pushed.json`) ? */
  hosted?: (key: string) => boolean;
  /** L'asset porte-t-il l'id d'un perso non intégré ? */
  unreleased?: (stem: string) => boolean;
}

/**
 * Cœur de la rétention de CATALOGUE (cf. `RETAIN_CATALOGS`) : pour chaque liste
 * de la proposition, réinjecte en fin les entrées validées qu'elle ne porte plus,
 * marquées `retired: true` — si leur fichier est hébergé et qu'elles ne sont pas
 * l'asset d'un perso non intégré. Idempotent ; une entrée REVENUE dans la
 * proposition reprend celle-ci (donc perd le flag). `retained` = clés retenues,
 * `dropped` = clés retirées par le jeu mais NON retenues (avec le motif).
 */
export function applyCatalogRetention(
  committed: unknown,
  extracted: unknown,
  spec: CatalogSpec,
  guards: CatalogGuards = {},
): { merged: unknown; retained: string[]; dropped: string[] } {
  const hosted = guards.hosted ?? isPushed;
  const unreleased = guards.unreleased ?? isUnreleasedCharacterAsset;
  const committedLists = new Map(spec.lists(committed).map((l) => [l.name, l.items]));
  const retained: string[] = [];
  const dropped: string[] = [];
  const label = (name: string, key: string) => (name ? `${name}/${key}` : key);

  const lists = spec.lists(extracted).map(({ name, items }) => {
    const prev = committedLists.get(name);
    if (!prev?.length) return { name, items };
    // Liste proposée vide = pool non scanné, pas un retrait : validé tel quel.
    if (!items.length) return { name, items: prev };
    const present = new Set(items.map(spec.key));
    const extra: CatalogEntry[] = [];
    for (const entry of prev) {
      const key = spec.key(entry);
      if (present.has(key)) continue;
      if (!hosted(spec.hostedKey(name, entry))) {
        dropped.push(`${label(name, key)} (absent de R2)`);
        continue;
      }
      const asset = spec.characterAsset?.(entry);
      if (asset && unreleased(asset)) {
        dropped.push(`${label(name, key)} (perso non intégré)`);
        continue;
      }
      retained.push(label(name, key));
      extra.push({ ...entry, retired: true });
    }
    return { name, items: extra.length ? [...items, ...extra] : items };
  });
  return { merged: spec.assemble(lists), retained, dropped };
}

/**
 * Validés PURS, sans équivalent extrait PAR CONSTRUCTION — hors périmètre du
 * signalement « orphelin » (qui ne doit lever que sur un vrai résidu) :
 *   - `monster-archive/` : états FIGÉS de boss (`pnpm datagen:version-boss`) ;
 *   - `comics.json` : les 4-cut comics sont FAITES MAIN (aucune table du jeu
 *     ne les décrit) et `buildComics` n'est délibérément PAS câblé dans
 *     `build.ts` — la liste servie est le manifeste R2 lu à la requête, ce
 *     fichier n'étant que le repli committé (cf. tools/_contents/4-comics).
 *     Il était signalé à CHAQUE promote, bruit qui masque les vrais orphelins.
 *   - `damage/` : produit par le pipeline DÉDIÉ `datagen/damage/build.ts`
 *     (source = binaire du jeu, pas les tables — cf. spec damage-calculator),
 *     jamais par `build.ts` ;
 *   - `video-meta.json` : produit à la demande par `pnpm datagen:video-meta`.
 */
const isPureCurated = (rel: string): boolean =>
  rel.startsWith('monster-archive/') ||
  rel.startsWith('damage/') ||
  rel === 'comics.json' ||
  rel === 'video-meta.json';

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
        ? { ...(completeLangDicts(entry) as Record<string, unknown>), retired: true }
        : entry;
  }
  return { merged, retained };
}

/**
 * Une entité retenue a été produite par un datagen d'AVANT : ses dicts de
 * langue portent les langues de l'époque. Quand le jeu en gagne (fr et es le
 * 23/09/2026), le validé se met à mélanger deux formes de `LangDict` — le
 * contrat n'en admet qu'une, et `tsc` refuse le JSON committé. On complète donc
 * à VIDE les langues apparues depuis (le jeu ne parle plus de ces entités, il
 * n'y a pas de texte à aller chercher) ; `lRec` replie un vide sur l'anglais.
 *
 * Reconnaissance d'un dict de langue : un objet dont les clés sont TOUTES des
 * codes de `GAME_LANGS`, qui porte `en`, et dont les valeurs sont des chaînes —
 * rien d'autre dans la donnée n'a cette forme. Récursif, sans liste de champs.
 */
export function completeLangDicts(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(completeLangDicts);
  if (!v || typeof v !== 'object') return v;
  const o = v as Record<string, unknown>;
  const keys = Object.keys(o);
  const isLangDict =
    keys.length > 0 &&
    'en' in o &&
    keys.every((k) => (GAME_LANGS as readonly string[]).includes(k)) &&
    keys.every((k) => typeof o[k] === 'string');
  if (isLangDict) return { ...emptyDict(), ...o };
  return Object.fromEntries(keys.map((k) => [k, completeLangDicts(o[k])]));
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
 * (`characters-slug-to-id`). Une réf qui SURVIT au retrait (id insécable : buff
 * d'EE `BID_CEQUIP_<id>`, icône de costume, clés de vars de skill) fait RETENIR
 * le fichier — non promu, nommé `⛔` avec ses ids — pendant que le reste du lot
 * se promeut : le « jamais publié » est garanti à l'octet près sans qu'un perso
 * datamined avant sa sortie bloque toute promotion (décision Sevih 2026-08-12).
 * Mutation en place ; retourne les ids effectivement écartés.
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
  /** Garde-fous de la rétention de catalogue (cf. `RETAIN_CATALOGS`) — tests. */
  catalogGuards?: CatalogGuards;
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
   * Ces fichiers sont RETENUS (jamais écrits par l'apply, listés `⛔`) pendant
   * que le reste du lot se promeut — un perso complet datamined avant sa
   * sortie ne bloque ni `pnpm dev` (dry-run) ni la promotion en lot.
   */
  violations: string[];
}

/**
 * Le flux complet de promotion (revue OU apply). Lève une `Error` sur entrée
 * invalide (src absent, fichier `--only` inconnu) — le wrapper CLI la traduit
 * en sortie code 1 ; les tests l'attrapent directement.
 */
export async function promote(opts: PromoteOptions = {}): Promise<PromoteResult> {
  const { src = SRC, dst = DST, apply = false, only = null, catalogGuards } = opts;

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
    let dropped: string[] = [];
    if (dstText !== undefined && RETAIN_ENTITIES.has(rel)) {
      const r = applyRetention(
        JSON.parse(dstText) as Record<string, unknown>,
        JSON.parse(srcText) as Record<string, unknown>,
      );
      retained = r.retained;
      if (retained.length) out = await formatJson(r.merged);
    } else if (dstText !== undefined && rel in RETAIN_CATALOGS) {
      // Catalogues d'assets (wallpapers, OST) : rétention par ENTRÉE — un asset
      // retiré du jeu reste servi (R2 ne supprime rien), donc reste catalogué.
      const r = applyCatalogRetention(
        JSON.parse(dstText) as unknown,
        JSON.parse(srcText) as unknown,
        RETAIN_CATALOGS[rel],
        catalogGuards,
      );
      retained = r.retained;
      dropped = r.dropped;
      // Réécrit dès qu'une liste vide a été remplacée par le validé (pool non
      // scanné) : `merged` peut alors différer de la proposition sans retenue.
      if (JSON.stringify(r.merged) !== JSON.stringify(JSON.parse(srcText)))
        out = await formatJson(r.merged);
    }

    // Garde perso : écarte les persos non intégrés, puis VERROUILLE — une réf
    // survivante (bornée par des non-chiffres : `2400015` ne matche pas dans
    // `24000151`) RETIENT le fichier : il n'est pas promu, le reste du lot si.
    let stripped: string[] = [];
    let residue: string[] = [];
    if (unintegrated.size) {
      if ([...unintegrated].some((id) => out.includes(id))) {
        const data = JSON.parse(out) as unknown;
        stripped = stripUnintegratedCharacters(data, unintegrated);
        if (stripped.length) out = await formatJson(data);
        for (const id of stripped) strippedAll.add(id);
      }
      residue = [...unintegrated].filter((id) => new RegExp(`(?<!\\d)${id}(?!\\d)`).test(out));
      if (residue.length) violations.push(`${rel} : ${residue.join(', ')}`);
    }

    if (dstText === out) {
      identical++;
      continue;
    }
    // Réf survivante → fichier RETENU (décision Sevih 2026-08-12) : le refus
    // était tout-ou-rien, donc un perso complet datamined AVANT sa sortie
    // (bagage aux ids insécables : buff d'EE, icône de costume, vars de skill)
    // bloquait TOUTE promotion en lot jusqu'à sa release. La garantie « jamais
    // publié » reste à l'octet près : ce fichier-ci ne part pas ; il rattrapera
    // son retard à l'intégration du perso.
    if (residue.length) {
      diffs.push(
        `  ${rel.padEnd(34)} ⛔ RETENU (non promu) — réf(s) de perso non intégré : ${residue.join(', ')}`,
      );
      continue;
    }
    const notes =
      (retained.length ? ` · ${retained.length} retenue(s), jamais supprimées` : '') +
      (dropped.length
        ? ` · ${dropped.length} retirée(s) NON retenue(s) : ${dropped.join(', ')}`
        : '') +
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
    console.warn(
      '⚠ perso(s) non intégré(s) encore référencé(s) après écartement — fichier(s) RETENU(S), ' +
        'le reste du lot se promeut. Intégrer via l’admin pour les débloquer :\n  ' +
        violations.join('\n  '),
    );
  }
  for (const { path, text } of pending) {
    mkdirSync(dirname(path), { recursive: true });
    writeTextAtomic(path, text); // un Ctrl-C ici ne laisse pas un generated tronqué
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
  const result = await promote({ apply, only });

  // RE-DÉRIVATION (cf. datagen/sync-derived.ts) : un apply qui a changé la
  // donnée intégrée doit rejouer damage + solver, qui la LISENT. `--skip-sync`
  // est réservé à refresh.ts (son étape damage complète suit). Un `--only` ne
  // synchronise que s'il a promu une des ENTRÉES de la couche dérivée.
  const DERIVED_INPUTS = ['characters.json', 'skills.json', 'monsters.json', 'encounters.json'];
  const touchesDerived = !only || DERIVED_INPUTS.some((f) => only.has(f));
  if (apply && result.diffs.length > 0 && touchesDerived && !process.argv.includes('--skip-sync')) {
    const { syncDerived } = await import('./sync-derived');
    await syncDerived();
  }
}

// Garde d'exécution directe : importer ce module depuis les tests ne doit
// PAS déclencher une promotion.
if (isMain(import.meta.url)) {
  main().catch((e) => {
    console.error(`\n\x1b[31mErreur : ${e?.message ?? e}\x1b[0m`);
    process.exit(1);
  });
}
