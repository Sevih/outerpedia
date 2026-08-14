/**
 * Générateur — DATES DE SORTIE DES PERSOS (`character-release.json`).
 *
 * Sert le tri de `/characters` et le bloc `meta` de la fiche perso. Contrat
 * volontairement minimal : `id → "YYYY-MM-DD"`, rien d'autre — la provenance
 * de chaque date reste dans le diagnostic (exécution directe, plus bas).
 *
 * SOURCE : l'archive des notes de mise à jour, COMMITTÉE dans le repo
 * (`data/patch-notes/`) — la génération ne dépend d'aucun scrape en ligne.
 * 89 notes utiles : `patchnotes` (ère Smilegate, 05/2023 → 09/2025) et `update`
 * EN (ère major9, depuis 10/2025).
 *
 * CE QU'ON LIT — pas le titre de la section (7 gabarits successifs, de
 * « New Hero, Rin, Drop Rate Up! » à « New Demiurge Hero [Demiurge Saeran]
 * Arrives »), mais la FICHE officielle qu'elle contient :
 *
 *     # Name: Fran        ＊Name: Viella
 *     # Schedule: 07/29/25 (Tue) after the maintenance – …
 *                         ＊Period: After maintenance on Oct 23, 2025 (Thu) ~ …
 *
 * On retient le PREMIER jour de la période. Pour les Demiurge (recrutement
 * premium) la borne de fin ne décrit qu'une fenêtre de rate-up : ils restent
 * pullables en permanence dès leur ajout — ne rien en déduire.
 *
 * CHAÎNE DE REPLI quand une section n'a pas de fiche datée :
 *   1. fiches des sections VOISINES du même post (une collab sort ses trois
 *      persos le même jour ; les Core Fusion partagent le post d'un autre) ;
 *   2. maintenance annoncée en INTRO (« the in-game update scheduled for
 *      02/24(Tue) ») — plus sûre que le titre du post, qui porte parfois le
 *      jour où la maintenance COMMENCE et non celui où l'update arrive ;
 *   3. titre du post, en dernier recours.
 * Mesuré sur l'archive : là où intro et titre coexistent ils divergent 3 fois,
 * et l'intro a raison les 3 fois (la note du 2023-08-14 s'intitule « 8/15 » et
 * annonce « Wednesday, August 16 » — la fiche de Sterope confirme le 16).
 *
 * CE QUI N'EST PAS UNE SOURCE :
 *   - `RecruitGroupTemplet` : avant 09/2023 ses `StartDate` sont 8 à 26 jours
 *     EN AVANCE sur les notes (dates internes/KR antérieures au lancement
 *     global — la table date Rin au 2023-04-27 quand la note du 2023-06-19
 *     écrit « Rin (Added on 5/23) »). Utilisée en contrôle, jamais en source ;
 *   - les posts d'ÉVÉNEMENT (`[Event] X Rate Up!`), publiés en cours de
 *     bannière, 8 à 26 jours après la sortie ;
 *   - la date du POST : l'archive major9 a été rechargée dans le désordre
 *     après le transfert de service (la note de Viella est datée du 2025-11-02
 *     et couvre la maintenance du 10/23).
 *
 * CE QUE L'ARCHIVE NE PEUT PAS DONNER, et qui vit donc dans
 * `data/curated/character-release.json` :
 *   - le ROSTER DE LANCEMENT — les Update Notice ne commencent qu'au
 *     2023-05-01, le lancement global est du 2023-04-19 (pré-registration
 *     jusqu'au 28/03, « Laplace Recruitment Chance Increase (4/19 Update) »
 *     posté le 18/04) ;
 *   - le TROU DU TRANSFERT DE SERVICE — l'archive Smilegate s'arrête au
 *     2025-09-22, celle de major9 démarre au 2025-10-02.
 *
 * GARDE-FOU : un perso sans date d'aucune source fait échouer la génération.
 * Sans ça le trou revient en silence au prochain patch.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { isMain } from '../lib/is-main';
import { readCuratedJson } from '../lib/json';
import { buildCharacters } from '../extractor/specs/character';
import type { Character } from '../extractor/specs/character';

/** `data/generated/character-release.json` — id de perso → jour de sortie. */
export type CharacterReleaseFile = Record<string, string>;

/** Une note de l'archive (les champs qu'on lit). */
export interface NotePost {
  date: string;
  type: string;
  lang?: string;
  title: string;
  content: string;
}

/** Overlay curé : ce que la dérivation ne sait pas. */
interface ReleaseCurated {
  releases: Record<string, string>;
}

const ARCHIVES = ['data/patch-notes/legacy-posts.json', 'data/patch-notes/posts.json'];

/** Les 89 notes de MAJ de l'archive, triées par date de publication. */
export function loadUpdateNotes(): NotePost[] {
  const all: NotePost[] = [];
  for (const path of ARCHIVES) {
    const { posts } = JSON.parse(readFileSync(resolve(path), 'utf8')) as { posts: NotePost[] };
    all.push(...posts);
  }
  return all
    .filter((p) => p.type === 'patchnotes' || (p.type === 'update' && p.lang === 'en'))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ─── HTML → lignes lisibles ──────────────────────────────────────────────────

/**
 * Dé-tague en ne coupant QUE sur les frontières de bloc. Remplacer toutes les
 * balises par un saut de ligne casse les titres de section : le HTML écrit
 * `<strong>1.</strong> <strong>New Hero, Aer…</strong>`, et « 1. » se retrouve
 * seul sur sa ligne. Les échappements markdown de l'archive (`\#`, `\-`, `\.`)
 * sont défaits au passage.
 */
export function plainLines(html: string): string[] {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|tr|table|ul|ol|blockquote|figure)>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#8217;|&rsquo;|&#39;|&lsquo;/g, "'")
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\\([#\-.*[\]()])/g, '$1')
    .replace(/\*\*/g, '')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[ \t\u00a0]+/g, ' ')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

// ─── dates ───────────────────────────────────────────────────────────────────

const MONTHS = 'jan feb mar apr may jun jul aug sep oct nov dec'.split(' ');
const iso = (y: number, m: number, d: number): string =>
  `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

/** Année absente : celle qui rapproche le plus de la date du post (rollover). */
function pickYear(month: number, day: number, postDate: string): number {
  const py = Number(postDate.slice(0, 4));
  const ref = Date.parse(postDate);
  return [py - 1, py, py + 1]
    .map((y) => ({ y, gap: Math.abs(Date.parse(iso(y, month, day)) - ref) }))
    .sort((a, b) => a.gap - b.gap)[0].y;
}

/**
 * Premier jour d'une période officielle. Six écritures cohabitent dans
 * l'archive : `7/4`, `12/19/23`, `11/21/2023`, `24/10/22` (YY/MM/DD, vu en
 * 10/2024 seulement), `2026/08/12`, `Oct 23, 2025`. La désambiguïsation du
 * numérique se fait sur le premier nombre : 4 chiffres → année ; > 12 → année
 * sur 2 chiffres ; sinon mois.
 */
export function parseNoteDate(raw: string | null | undefined, postDate: string): string | null {
  if (!raw) return null;
  const txt = raw.replace(/\u00a0/g, ' ');
  const named = txt.match(/\b([A-Za-z]{3,9})\.?\s+(\d{1,2})(?:\s*,)?\s*(\d{4})?/);
  const numeric = txt.match(/(\d{1,4})\s*[/.]\s*(\d{1,2})(?:\s*[/.]\s*(\d{2,4}))?/);

  // Le numérique prime s'il apparaît avant le mois nommé.
  const useNamed =
    named &&
    (!numeric || named.index! < numeric.index!) &&
    MONTHS.includes(named[1].slice(0, 3).toLowerCase());
  if (useNamed) {
    const month = MONTHS.indexOf(named![1].slice(0, 3).toLowerCase()) + 1;
    const day = Number(named![2]);
    const year = named![3] ? Number(named![3]) : pickYear(month, day, postDate);
    return iso(year, month, day);
  }
  if (!numeric) return null;

  const [a, b, c] = [numeric[1], numeric[2], numeric[3]];
  let year: number;
  let month: number;
  let day: number;
  if (c === undefined) {
    month = Number(a);
    day = Number(b);
    year = pickYear(month, day, postDate);
  } else if (a.length === 4) {
    [year, month, day] = [Number(a), Number(b), Number(c)];
  } else if (Number(a) > 12) {
    [year, month, day] = [2000 + Number(a), Number(b), Number(c)];
  } else {
    [year, month, day] = [Number(c) < 100 ? 2000 + Number(c) : Number(c), Number(a), Number(b)];
  }
  return month >= 1 && month <= 12 && day >= 1 && day <= 31 ? iso(year, month, day) : null;
}

// ─── découpage en sections ───────────────────────────────────────────────────

/**
 * Titre de section : « 1. … ». Le lookahead `(?!\d)` écarte les cellules de
 * tableau de taux (« 1.25% » lu comme « section 1, titre 25% », ce qui coupait
 * la section de Demiurge Stella avant sa fiche). L'espace avant le point est
 * toléré : une note écrit « 1 . New Hero [Primine] ».
 */
const HEAD = /^(\d{1,2})\s*[.\uff0e]\s*(?!\d)(.+)$/;
const NEW_HERO = /^New\b/i;
const NOT_HERO =
  /World Boss|Guild Raid|appearing through|Event Dungeon|Content Added|Joint Challenge/i;
/** « 3. [Core Fusion] Hero Added – [Lisha] » — jamais de fiche : ils ne sortent pas en bannière. */
const CORE_FUSION =
  /Core Fusion\]?\s*(?:Hero\s*)?(?:System\s*)?(?:Added|Addition)\s*[-\u2013\u2014]\s*(.+)$/i;

const KEYS =
  'Name|Element|Battle Type|Sub\\s?-?\\s?class|Schedule|Pickup Period|Recruit Period|Available Period|Period';
const FIELD = new RegExp(`^[#\uff0a*\u2022\u203b]\\s*(${KEYS})\\s*[:\uff1a]?\\s*(.*)$`, 'i');
const DATE_FIELD = /^((Pickup|Recruit|Available)\s+)?(Schedule|Period)$/i;
/**
 * Les champs sont parfois COLLÉS sur une seule ligne — « # Battle Type: Mage#
 * Subclass: Wizard# Schedule: 1/30 … » (Regina, 2024-01-29). On rétablit une
 * ligne par champ avant de découper en sections.
 */
const GLUED = new RegExp(`(?=[#\uff0a*\u2022\u203b]\\s*(?:${KEYS})\\s*[:\uff1a])`, 'gi');

export interface NoteSection {
  head: string;
  body: string[];
}

export function splitSections(lines: string[]): NoteSection[] {
  const out: NoteSection[] = [];
  let cur: NoteSection | null = null;
  for (const raw of lines) {
    for (const line of raw
      .split(GLUED)
      .map((s) => s.trim())
      .filter(Boolean)) {
      const h = line.match(HEAD);
      if (h) out.push((cur = { head: h[2].trim(), body: [] }));
      else if (cur) cur.body.push(line);
    }
  }
  return out;
}

/** Nettoie un libellé officiel (crochets de campagne, deux-points, ponctuation). */
export function cleanLabel(s: string): string {
  return s
    .replace(/[[\]]/g, '')
    .replace(/^[\s:\uff1a]+/, '')
    .replace(/[,!.\s]+$/, '')
    .trim();
}

/** Nom du perso quand la section n'a pas de champ `Name:`. */
export function labelFromHead(head: string): string | null {
  const bracket = head.match(/\[([^\]]+)\]/);
  if (bracket) return bracket[1].trim();
  const dash = head.match(/(?:Drop Rate Up|Rate.?Up)\s*[-\u2013\u2014]\s*(.+)$/i);
  if (dash) return cleanLabel(dash[1]);
  const m = head.match(
    /New\s+(?:\w+\s+)?(?:Heroe?s?|Boss)\s*[,:]?\s*(.+?)(?:\s*,?\s*(?:Drop Rate Up|Rate.?Up|Recruitment|Arrives|Pickup|Now Live).*)?$/i,
  );
  return m ? cleanLabel(m[1]) : null;
}

/** « 6/7 (Wed) Update Notice », « [Update] 2026/08/12(Wed) Patch Note ». */
export function titleDate(title: string, postDate: string): string | null {
  return parseNoteDate(title.replace(/\(.*?(Edited|Added|Update)\b.*?\)/gi, ' '), postDate);
}

const INTRO =
  /(?:update scheduled for|update scheduled on|following the maintenance on|maintenance on)\s+([^.,\n]{3,40}(?:,\s*[A-Za-z]+\s+\d{1,2})?)/i;

/**
 * Jour de maintenance annoncé AVANT la première section (« We would like to
 * inform you of the in-game update scheduled for 02/24(Tue) »). Deux garde-fous
 * indispensables : ne lire que l'entête (sinon on attrape la fin de bannière
 * d'un autre perso, « maintenance on 5/6 will begin at 20:00 UTC »), et exiger
 * que la date soit voisine du post (une note du 2025-12-01 recopie par erreur
 * l'intro de la précédente, « scheduled for 11/18 »).
 */
export function maintenanceDate(lines: string[], postDate: string): string | null {
  const first = lines.findIndex((l) => HEAD.test(l));
  const intro = lines.slice(0, first > 0 ? first : 12).join(' ');
  const m = intro.match(INTRO);
  const date = m ? parseNoteDate(m[1], postDate) : null;
  if (!date) return null;
  const gap = (Date.parse(date) - Date.parse(postDate)) / 86_400_000;
  return gap >= -12 && gap <= 10 ? date : null;
}

// ─── extraction ──────────────────────────────────────────────────────────────

/** D'où sort la date — pour le diagnostic, pas pour le fichier produit. */
export type ReleaseSource = 'fiche' | 'voisines' | 'intro' | 'titre';

export interface ReleaseHit {
  /** Libellé officiel complet (« Demiurge Stella », « Gnosis Beth »). */
  label: string;
  date: string | null;
  source: ReleaseSource;
  post: string;
  title: string;
  head: string;
  /** La section parle d'une core-fusion : elle vise le 2700xxx, pas l'homonyme de base. */
  coreFusion: boolean;
}

export function extractHits(notes: NotePost[]): ReleaseHit[] {
  const hits: ReleaseHit[] = [];
  /** post → maintenance annoncée en intro. */
  const maintenance: Record<string, string | null> = {};

  for (const p of notes) {
    const lines = plainLines(p.content);
    maintenance[p.date] ??= maintenanceDate(lines, p.date);

    for (const s of splitSections(lines)) {
      const cf = s.head.match(CORE_FUSION);
      if (cf) {
        hits.push({
          label: cleanLabel(cf[1]),
          date: null, // comblée plus bas
          source: 'fiche',
          post: p.date,
          title: p.title,
          head: s.head,
          coreFusion: true,
        });
        continue;
      }
      if (!NEW_HERO.test(s.head) || NOT_HERO.test(s.head)) continue;

      // Première fiche de la section : le champ `Name:`, puis le champ de date.
      let label: string | null = null;
      let dateRaw: string | null = null;
      const extras: string[] = [];
      for (let i = 0; i < s.body.length; i++) {
        const f = s.body[i].match(FIELD);
        if (!f) continue;
        const value = f[2].trim() || s.body[i + 1] || '';
        if (/^Name$/i.test(f[1])) {
          if (label === null) label = cleanLabel(value);
          else extras.push(cleanLabel(value));
        } else if (DATE_FIELD.test(f[1]) && dateRaw === null && label !== null) {
          dateRaw = value;
        }
      }
      label ??= labelFromHead(s.head);
      if (!label) continue; // « New Side Story », « New Packages Added »…

      // Une section au pluriel annonce plusieurs persos (« New 2★ Heroes
      // Ritri and Lyla ») ; au singulier, les `Name:` suivants sont les
      // reprises listées dessous.
      const labels = /Heroe?s\b/i.test(s.head) ? [label, ...extras] : [label];
      for (const one of labels.flatMap((l) => l.split(/\s+and\s+/i)).map(cleanLabel)) {
        hits.push({
          label: one,
          date: parseNoteDate(dateRaw, p.date),
          source: 'fiche',
          post: p.date,
          title: p.title,
          head: s.head,
          coreFusion: false,
        });
      }
    }
  }

  // Repli — seules les fiches font foi pour amorcer les « sections voisines ».
  const sameDay: Record<string, Set<string>> = {};
  for (const h of hits) {
    if (h.date) (sameDay[h.post] ??= new Set()).add(h.date);
  }
  for (const h of hits) {
    if (h.date) continue;
    const siblings = [...(sameDay[h.post] ?? [])];
    if (siblings.length === 1) {
      h.date = siblings[0];
      h.source = 'voisines';
    } else if (maintenance[h.post]) {
      h.date = maintenance[h.post];
      h.source = 'intro';
    } else {
      h.date = titleDate(h.title, h.post);
      h.source = 'titre';
    }
  }
  return hits;
}

// ─── appariement au roster ───────────────────────────────────────────────────

export interface RosterEntry {
  id: string;
  /** Libellé officiel complet, tel que les notes l'écrivent. */
  label: string;
  coreFusion: boolean;
}

/**
 * Le jeu affiche `nickname + name` quand `showNickName` est posé — c'est
 * exactement le libellé des notes (« Demiurge Stella », « Holy Night's
 * Blessing Dianne »). Les core-fusion, elles, portent le MÊME nom que leur
 * base : seul le contexte de la section les distingue.
 */
export function buildRoster(characters: Record<string, Character>): RosterEntry[] {
  return Object.values(characters).map((c) => ({
    id: c.id,
    label: c.showNickName && c.nickname ? `${c.nickname.en} ${c.name.en}` : c.name.en,
    coreFusion: Boolean(c.originalCharacter),
  }));
}

const VALIDATED = resolve('data/generated/characters.json');

/**
 * Persos INTÉGRÉS — même garde que la promotion (`promote.ts` § garde perso) et
 * que `lib/released.ts` : le jeu embarque les persos des patchs À VENIR (le
 * `2400015` du jour de la mesure, sans même un nom) et on ne leur cherche pas
 * de date de sortie — sinon le garde-fou ci-dessous casse la génération pour un
 * perso que le wiki ne publie pas encore.
 *
 * « Non intégré » = absent du `characters.json` VALIDÉ. Sans le validé sous la
 * main (CI, dépôt frais, bootstrap), AUCUN filtrage : on ne filtre que sur une
 * PREUVE de non-intégration, jamais sur une absence de donnée.
 */
export function keepIntegrated(roster: RosterEntry[]): RosterEntry[] {
  let ids: Set<string>;
  try {
    ids = new Set(Object.keys(JSON.parse(readFileSync(VALIDATED, 'utf8')) as object));
  } catch {
    return roster;
  }
  return ids.size ? roster.filter((r) => ids.has(r.id)) : roster;
}

const norm = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[`\u2018\u2019]/g, "'")
    .replace(/[^a-z0-9' -]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Résout un libellé de note vers un id — appariement EXCLUSIF, jamais partiel. */
export function matchRoster(
  label: string,
  coreFusion: boolean,
  roster: RosterEntry[],
): RosterEntry | undefined {
  const wanted = norm(label);
  const same = roster.filter((r) => norm(r.label) === wanted);
  return coreFusion ? same.find((r) => r.coreFusion) : (same.find((r) => !r.coreFusion) ?? same[0]);
}

// ─── produit ─────────────────────────────────────────────────────────────────

export interface ReleaseBuild {
  releases: CharacterReleaseFile;
  /** Provenance par id — diagnostic, hors fichier produit. */
  sources: Record<string, ReleaseSource | 'curé'>;
  /** Entrées curées qui répètent la dérivation : à retirer du curé. */
  redundant: string[];
}

/**
 * Dérive, puis laisse le curé écraser : c'est la décision humaine qui tranche,
 * et c'est le seul moyen de corriger une dérivation fausse sans toucher au code.
 */
export function composeReleases(
  hits: ReleaseHit[],
  roster: RosterEntry[],
  curated: Record<string, string>,
): ReleaseBuild {
  const releases: CharacterReleaseFile = {};
  const sources: Record<string, ReleaseSource | 'curé'> = {};

  // Une reprise peut re-citer un perso : la PREMIÈRE date gagne.
  for (const h of hits) {
    if (!h.date) continue;
    const hit = matchRoster(h.label, h.coreFusion, roster);
    if (!hit) continue;
    if (!releases[hit.id] || h.date < releases[hit.id]) {
      releases[hit.id] = h.date;
      sources[hit.id] = h.source;
    }
  }

  const redundant: string[] = [];
  for (const [id, date] of Object.entries(curated)) {
    if (releases[id] === date) redundant.push(id);
    releases[id] = date;
    sources[id] = 'curé';
  }

  const known = new Set(roster.map((r) => r.id));
  const sorted: CharacterReleaseFile = {};
  for (const id of Object.keys(releases).sort()) {
    if (known.has(id)) sorted[id] = releases[id];
  }
  return { releases: sorted, sources, redundant };
}

/**
 * Dérive les dates pour CE roster — le point d'entrée commun à la génération
 * globale et à l'intégration ciblée de l'admin. LÈVE si l'un des persos n'a de
 * date d'aucune source : c'est le garde-fou du brief, sans lui le trou revient
 * en silence au prochain patch.
 */
export function releasesForRoster(roster: RosterEntry[]): CharacterReleaseFile {
  const curated =
    readCuratedJson<ReleaseCurated>('data/curated/character-release.json')?.releases ?? {};
  const { releases, redundant } = composeReleases(extractHits(loadUpdateNotes()), roster, curated);

  const missing = roster.filter((r) => !releases[r.id]);
  if (missing.length) {
    throw new Error(
      `character-release : ${missing.length} perso(s) sans date d'aucune source — ` +
        `ajoute-les à data/curated/character-release.json :\n  ` +
        missing.map((r) => `${r.id} ${r.label}`).join('\n  '),
    );
  }
  if (redundant.length) {
    console.warn(
      `⚠ data/curated/character-release.json : ${redundant.length} entrée(s) que la ` +
        `dérivation retrouve déjà (${redundant.join(', ')}) — à retirer.`,
    );
  }
  return releases;
}

/**
 * Dates pour un `characters.json` donné — appelé par l'INTÉGRATION CIBLÉE de
 * l'admin avec le committé déjà fusionné, pour que le nouveau perso ait sa date
 * le jour même plutôt qu'au prochain `datagen:build`. Pas de filtre
 * d'intégration ici : le fichier passé EST le validé.
 */
export function releasesFor(characters: Record<string, Character>): CharacterReleaseFile {
  return releasesForRoster(buildRoster(characters));
}

export function buildCharacterRelease(): CharacterReleaseFile {
  return releasesForRoster(keepIntegrated(buildRoster(buildCharacters().characters)));
}

// Exécution directe : diagnostic (provenance de chaque date, non-appariés).
if (isMain(import.meta.url)) {
  const roster = keepIntegrated(buildRoster(buildCharacters().characters));
  const curated =
    readCuratedJson<ReleaseCurated>('data/curated/character-release.json')?.releases ?? {};
  const hits = extractHits(loadUpdateNotes());
  const { releases, sources } = composeReleases(hits, roster, curated);
  const label = Object.fromEntries(roster.map((r) => [r.id, r.label]));

  const tally: Record<string, number> = {};
  for (const id of Object.keys(releases)) tally[sources[id]] = (tally[sources[id]] ?? 0) + 1;
  console.log(`${Object.keys(releases).length} / ${roster.length} persos datés`);
  for (const [k, n] of Object.entries(tally).sort())
    console.log(`  ${String(n).padStart(3)}  ${k}`);

  const unresolved = hits.filter((h) => h.date && !matchRoster(h.label, h.coreFusion, roster));
  console.log(`\n${unresolved.length} libellé(s) non apparié(s) :`);
  for (const u of unresolved) console.log(`  « ${u.label} » (${u.post} — ${u.head.slice(0, 60)})`);

  console.log('\n--- dates');
  for (const [id, date] of Object.entries(releases).sort((a, b) => a[1].localeCompare(b[1]))) {
    console.log(`  ${date}  ${id}  ${(label[id] ?? '?').padEnd(36)} ${sources[id]}`);
  }
}
