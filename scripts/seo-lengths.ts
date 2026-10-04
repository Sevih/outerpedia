/**
 * MESURE des titres et descriptions sur le site SERVI
 * (`pnpm exec tsx scripts/seo-lengths.ts`).
 *
 * Remplace le passage par Sitebulb (décision Sevih du 03/10) : on lit ce que le
 * site répond réellement, pas ce que le code croit produire. Le script ne
 * corrige rien, il compte et il classe.
 *
 *   1. lit le sitemap de l'hôte (`/sitemap.xml`) ;
 *   2. récupère chaque page AVEC RETENUE : 4 requêtes de front au plus, un
 *      `User-Agent` qui dit qui il est, arrêt net au premier 429 ou au second
 *      5xx (un 5xx isolé est rejoué une fois, après une pause) ;
 *   3. relève `<title>` et `<meta name="description">` et classe : titre de
 *      moins de 30 ou de plus de 60 caractères, description de moins de 70 ou
 *      de plus de 160, description absente, doublons exacts ;
 *   4. écrit un rapport Markdown daté dans `docs/seo&audit/`, groupé par type
 *      de page, avec les dix pires de chaque groupe.
 *
 *   pnpm exec tsx scripts/seo-lengths.ts                               hôte anglais
 *   pnpm exec tsx scripts/seo-lengths.ts --host https://fr.outerpedia.com
 *
 * Le sitemap est le même sur tous les hôtes (`<loc>` en langue par défaut,
 * une `xhtml:link` par langue) : pour un hôte de langue, on prend l'alternate
 * qui porte son origine.
 */
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { format as prettierFormat, resolveConfig } from 'prettier';
import { isMain } from '@datagen/lib/is-main';
import { TITLE_MAX_LENGTH } from '@/lib/seo';
import { writeTextAtomic } from '../datagen/lib/json';

const DEFAULT_HOST = 'https://outerpedia.com';
const USER_AGENT =
  'outerpedia-seo-lengths/1.0 (https://outerpedia.com; mesure interne des titres et descriptions)';
const OUT_DIR = resolve(process.cwd(), 'docs/seo&audit');

/** Requêtes de front, au plus. */
const CONCURRENCY = 4;
/** Pause avant de rejouer la page qui a répondu 5xx. */
const RETRY_DELAY_MS = 5000;
const TIMEOUT_MS = 30_000;
/** Lignes par tableau du rapport : les pires, pas les milliers. */
const WORST = 10;
/** Au-delà, une cellule de tableau est coupée (une description de 400
 * caractères rend le tableau illisible ; sa longueur reste affichée). */
const CELL_MAX = 200;

/**
 * Bornes en caractères (entités décodées, espaces repliés). Le plafond du titre
 * est celui de `createPageMetadata`, qui retire « | Outerpedia » au-delà.
 */
export const LIMITS = {
  title: { min: 30, max: TITLE_MAX_LENGTH },
  description: { min: 70, max: 160 },
} as const;

export type Issue =
  | 'title-missing'
  | 'title-short'
  | 'title-long'
  | 'title-duplicate'
  | 'description-missing'
  | 'description-short'
  | 'description-long'
  | 'description-duplicate';

/** Ordre des colonnes du rapport. */
export const ISSUES: readonly Issue[] = [
  'title-missing',
  'title-short',
  'title-long',
  'title-duplicate',
  'description-missing',
  'description-short',
  'description-long',
  'description-duplicate',
];

const ISSUE_LABEL: Record<Issue, string> = {
  'title-missing': 'Titre absent',
  'title-short': `Titre < ${LIMITS.title.min}`,
  'title-long': `Titre > ${LIMITS.title.max}`,
  'title-duplicate': 'Titre en double',
  'description-missing': 'Description absente',
  'description-short': `Description < ${LIMITS.description.min}`,
  'description-long': `Description > ${LIMITS.description.max}`,
  'description-duplicate': 'Description en double',
};

export type PageMeta = { url: string; title: string | null; description: string | null };

export type MeasuredPage = PageMeta & {
  /** Type de page, cf. `pageGroup`. */
  group: string;
  titleLength: number;
  descriptionLength: number;
  issues: Issue[];
  /** Gravité cumulée, pour classer « les pires » (cf. `classify`). */
  score: number;
};

export type Duplicate = { text: string; urls: string[] };

export type Classification = {
  pages: MeasuredPage[];
  duplicateTitles: Duplicate[];
  duplicateDescriptions: Duplicate[];
};

// ---------------------------------------------------------------------------
// Extraction
// ---------------------------------------------------------------------------

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

/** Décode les entités HTML en UNE passe (`&amp;lt;` reste `&lt;`). */
export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, body: string) => {
    if (body[0] !== '#') return NAMED_ENTITIES[body.toLowerCase()] ?? whole;
    const code =
      body[1] === 'x' || body[1] === 'X'
        ? parseInt(body.slice(2), 16)
        : parseInt(body.slice(1), 10);
    return Number.isFinite(code) && code > 0 && code <= 0x10ffff
      ? String.fromCodePoint(code)
      : whole;
  });
}

/** Texte tel qu'un moteur le lit : entités décodées, espaces repliés. Vide = absent. */
function cleanText(raw: string): string | null {
  const text = decodeEntities(raw).replace(/\s+/g, ' ').trim();
  return text === '' ? null : text;
}

/** Longueur en CARACTÈRES (points de code) : un emoji ou un kanji hors BMP compte pour un. */
export function textLength(text: string | null): number {
  return text === null ? 0 : [...text].length;
}

const ATTR_RE = /([^\s"'=<>/]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;

function attributes(tag: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const m of tag.matchAll(ATTR_RE)) {
    attrs[m[1].toLowerCase()] ??= m[2] ?? m[3] ?? m[4] ?? '';
  }
  return attrs;
}

/**
 * `<title>` et `<meta name="description">` d'une page, `null` si absent ou vide.
 *
 * On ne se limite PAS au `<head>` : Next peut émettre les métadonnées dans le
 * corps quand il les diffuse en flux (pages dynamiques, agent qui n'est pas un
 * robot connu). En échange il faut écarter les `<title>` des `<svg>` (libellé
 * d'accessibilité d'une icône) et le contenu des `<script>`.
 */
export function extractMeta(html: string): { title: string | null; description: string | null } {
  const doc = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script\b[\s\S]*?<\/script\s*>/gi, '')
    .replace(/<svg\b[\s\S]*?<\/svg\s*>/gi, '');

  const titleMatch = /<title\b[^>]*>([\s\S]*?)<\/title\s*>/i.exec(doc);
  const title = titleMatch ? cleanText(titleMatch[1]) : null;

  let description: string | null = null;
  for (const m of doc.matchAll(/<meta\b[^>]*>/gi)) {
    const attrs = attributes(m[0]);
    if (attrs.name?.toLowerCase() !== 'description') continue;
    description = cleanText(attrs.content ?? '');
    break;
  }
  return { title, description };
}

/**
 * URLs du sitemap à lire sur `host`. Par `<url>` : le `<loc>` s'il est sur cet
 * hôte, sinon l'alternate `xhtml:link` qui l'est (hôte de langue), sinon le
 * chemin du `<loc>` rejoué sur l'hôte (sitemap bâti pour une autre origine).
 */
export function parseSitemap(xml: string, host: string): string[] {
  const origin = new URL(host).origin;
  const sameOrigin = (u: string): boolean => {
    try {
      return new URL(u).origin === origin;
    } catch {
      return false;
    }
  };
  const urls = new Set<string>();
  for (const block of xml.matchAll(/<url\b[^>]*>([\s\S]*?)<\/url\s*>/gi)) {
    const locMatch = /<loc\b[^>]*>([\s\S]*?)<\/loc\s*>/i.exec(block[1]);
    if (!locMatch) continue;
    const loc = decodeEntities(locMatch[1].trim());
    const alternates = [...block[1].matchAll(/<xhtml:link\b[^>]*>/gi)]
      .map((m) => attributes(m[0]).href)
      .filter((href): href is string => !!href)
      .map(decodeEntities);
    const onHost = [loc, ...alternates].find(sameOrigin);
    if (onHost) {
      urls.add(onHost);
      continue;
    }
    try {
      const u = new URL(loc);
      urls.add(`${origin}${u.pathname === '/' ? '' : u.pathname}${u.search}`);
    } catch {
      // `<loc>` illisible : rien à lire.
    }
  }
  return [...urls];
}

// ---------------------------------------------------------------------------
// Classement
// ---------------------------------------------------------------------------

/**
 * Type de page = gabarit d'URL : le premier segment, puis une étoile par segment
 * suivant (`/characters/*` pour une fiche, `/guides/*` pour une catégorie, une
 * étoile de plus pour un guide). Les pages à un seul segment (accueil, listes,
 * outils — routés à plat) forment le groupe `/*` : une par gabarit, elles n'ont
 * pas de « type » à elles seules.
 */
export function pageGroup(url: string): string {
  const segments = new URL(url).pathname.split('/').filter(Boolean);
  if (segments.length <= 1) return '/*';
  return `/${segments[0]}${'/*'.repeat(segments.length - 1)}`;
}

function duplicates(pages: PageMeta[], pick: (p: PageMeta) => string | null): Duplicate[] {
  const byText = new Map<string, string[]>();
  for (const p of pages) {
    const text = pick(p);
    if (text === null) continue;
    const urls = byText.get(text);
    if (urls) urls.push(p.url);
    else byText.set(text, [p.url]);
  }
  return [...byText]
    .filter(([, urls]) => urls.length > 1)
    .map(([text, urls]) => ({ text, urls }))
    .sort((a, b) => b.urls.length - a.urls.length || a.text.localeCompare(b.text));
}

/** Écart RELATIF à la borne franchie (0 dans la plage) : 15 pour 30 vaut 80 pour 160. */
function deviation(length: number, { min, max }: { min: number; max: number }): number {
  if (length < min) return (min - length) / min;
  if (length > max) return (length - max) / max;
  return 0;
}

/**
 * Classe les pages. Doublon = texte EXACTEMENT identique (après repli des
 * espaces) sur deux URLs, tous groupes confondus.
 *
 * `score` ordonne « les pires » : 2 par champ absent (pire que n'importe quelle
 * longueur), l'écart relatif à la borne pour un champ trop court ou trop long,
 * 0,5 par doublon — un doublon de bonne longueur passe après un titre de trois
 * caractères, avant un titre à 29.
 */
export function classify(metas: PageMeta[]): Classification {
  const duplicateTitles = duplicates(metas, (p) => p.title);
  const duplicateDescriptions = duplicates(metas, (p) => p.description);
  const dupTitle = new Set(duplicateTitles.map((d) => d.text));
  const dupDescription = new Set(duplicateDescriptions.map((d) => d.text));

  const pages = metas.map((meta): MeasuredPage => {
    const titleLength = textLength(meta.title);
    const descriptionLength = textLength(meta.description);
    const issues: Issue[] = [];
    let score = 0;

    if (meta.title === null) {
      issues.push('title-missing');
      score += 2;
    } else {
      if (titleLength < LIMITS.title.min) issues.push('title-short');
      if (titleLength > LIMITS.title.max) issues.push('title-long');
      score += deviation(titleLength, LIMITS.title);
      if (dupTitle.has(meta.title)) {
        issues.push('title-duplicate');
        score += 0.5;
      }
    }

    if (meta.description === null) {
      issues.push('description-missing');
      score += 2;
    } else {
      if (descriptionLength < LIMITS.description.min) issues.push('description-short');
      if (descriptionLength > LIMITS.description.max) issues.push('description-long');
      score += deviation(descriptionLength, LIMITS.description);
      if (dupDescription.has(meta.description)) {
        issues.push('description-duplicate');
        score += 0.5;
      }
    }

    return {
      ...meta,
      group: pageGroup(meta.url),
      titleLength,
      descriptionLength,
      issues: ISSUES.filter((i) => issues.includes(i)),
      score,
    };
  });

  return { pages, duplicateTitles, duplicateDescriptions };
}

// ---------------------------------------------------------------------------
// Collecte
// ---------------------------------------------------------------------------

export type Fetched = { status: number; html: string | null };

/** Page lue mais pas mesurée (ni 200, ni HTML). */
export type Skipped = { url: string; status: number };

/** La collecte s'arrête : le serveur demande de ralentir ou va mal. */
export class CrawlStopped extends Error {}

export type CrawlOptions = {
  fetchPage: (url: string) => Promise<Fetched>;
  concurrency?: number;
  retryDelayMs?: number;
  onProgress?: (done: number, total: number) => void;
};

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/**
 * Lit les pages, `concurrency` de front au plus. ARRÊT NET (`CrawlStopped`,
 * plus aucune requête lancée) au premier 429, et au second 5xx de la collecte :
 * le premier est rejoué une fois après `retryDelayMs`, donc un 5xx qui se
 * répète — sur la même page ou sur une autre — arrête tout. Une erreur réseau
 * (délai dépassé, connexion coupée) compte comme un 5xx.
 */
export async function crawl(
  urls: string[],
  { fetchPage, concurrency = CONCURRENCY, retryDelayMs = RETRY_DELAY_MS, onProgress }: CrawlOptions,
): Promise<{ metas: PageMeta[]; skipped: Skipped[] }> {
  const metas: (PageMeta | null)[] = urls.map(() => null);
  const skipped: Skipped[] = [];
  let next = 0;
  let done = 0;
  let serverErrors = 0;
  // Dans un objet : les workers l'écrivent chacun de leur côté, TypeScript ne
  // doit pas le croire figé à `null`.
  const state: { stop: CrawlStopped | null } = { stop: null };

  /** Une tentative ; `null` = 5xx ou erreur réseau, déjà comptée. */
  const attempt = async (url: string): Promise<Fetched | null> => {
    let res: Fetched;
    try {
      res = await fetchPage(url);
    } catch (err) {
      res = { status: 599, html: null };
      console.warn(`  erreur réseau sur ${url} : ${err instanceof Error ? err.message : err}`);
    }
    if (res.status === 429) {
      state.stop ??= new CrawlStopped(`429 sur ${url} : le serveur demande de ralentir.`);
      return null;
    }
    if (res.status >= 500) {
      serverErrors += 1;
      if (serverErrors > 1) {
        state.stop ??= new CrawlStopped(`${res.status} sur ${url} : second 5xx de la collecte.`);
      }
      return null;
    }
    return res;
  };

  const worker = async (): Promise<void> => {
    while (!state.stop && next < urls.length) {
      const i = next++;
      const url = urls[i];
      let res = await attempt(url);
      if (!res && !state.stop) {
        await sleep(retryDelayMs);
        if (!state.stop) res = await attempt(url);
      }
      if (!res) return; // `state.stop` est posé : 429, ou 5xx répété
      if (res.status === 200 && res.html !== null) metas[i] = { url, ...extractMeta(res.html) };
      else skipped.push({ url, status: res.status });
      done += 1;
      onProgress?.(done, urls.length);
    }
  };

  await Promise.all(Array.from({ length: Math.min(concurrency, urls.length) }, worker));
  if (state.stop) throw state.stop;
  return { metas: metas.filter((m): m is PageMeta => m !== null), skipped };
}

async function fetchPage(url: string): Promise<Fetched> {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/xhtml+xml' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const isHtml = (res.headers.get('content-type') ?? '').includes('html');
  if (res.status !== 200 || !isHtml) {
    await res.body?.cancel();
    return { status: res.status, html: null };
  }
  return { status: 200, html: await res.text() };
}

// ---------------------------------------------------------------------------
// Rapport
// ---------------------------------------------------------------------------

/** Texte dans une cellule de tableau Markdown : `|` échappé, coupe au-delà de `CELL_MAX`. */
function cell(text: string | null): string {
  if (text === null) return '—';
  const chars = [...text];
  const shown = chars.length > CELL_MAX ? `${chars.slice(0, CELL_MAX).join('')}…` : text;
  return shown.replace(/\\/g, '\\\\').replace(/\|/g, '\\|');
}

const pathOf = (url: string): string => new URL(url).pathname;

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

/** « min / médiane / max » des longueurs présentes (les absents ne comptent pas). */
function spread(lengths: number[]): string {
  const present = lengths.filter((n) => n > 0);
  if (present.length === 0) return '—';
  return `${Math.min(...present)} / ${median(present)} / ${Math.max(...present)}`;
}

function duplicateSection(title: string, dups: Duplicate[]): string[] {
  const pages = dups.reduce((n, d) => n + d.urls.length, 0);
  const lines = [`### ${title} : ${dups.length} texte(s), ${pages} page(s)`, ''];
  if (dups.length === 0) return [...lines, 'Aucun.', ''];
  lines.push('| Pages | Texte | Exemples |', '| ---: | --- | --- |');
  for (const d of dups.slice(0, WORST)) {
    const examples = d.urls.slice(0, 3).map((u) => `\`${pathOf(u)}\``);
    const more = d.urls.length > 3 ? ` (+${d.urls.length - 3})` : '';
    lines.push(`| ${d.urls.length} | ${cell(d.text)} | ${examples.join(', ')}${more} |`);
  }
  if (dups.length > WORST) lines.push('', `… et ${dups.length - WORST} autre(s) texte(s).`);
  return [...lines, ''];
}

export function renderReport(input: {
  host: string;
  date: string;
  total: number;
  classification: Classification;
  skipped: Skipped[];
}): string {
  const { host, date, total, classification, skipped } = input;
  const { pages, duplicateTitles, duplicateDescriptions } = classification;
  const count = (list: MeasuredPage[], issue: Issue): number =>
    list.filter((p) => p.issues.includes(issue)).length;

  const groups = [...new Set(pages.map((p) => p.group))]
    .map((name) => ({ name, pages: pages.filter((p) => p.group === name) }))
    .sort((a, b) => b.pages.length - a.pages.length || a.name.localeCompare(b.name));

  const lines: string[] = [
    `# Titres et descriptions — ${new URL(host).host}, ${date}`,
    '',
    `> Produit par \`scripts/seo-lengths.ts\` (\`pnpm exec tsx scripts/seo-lengths.ts --host ${host}\`) :`,
    '> ne pas éditer à la main, relancer. Mesuré sur le site servi, page par page',
    '> depuis son sitemap.',
    '>',
    `> Bornes, en caractères : titre ${LIMITS.title.min} à ${LIMITS.title.max},`,
    `> description ${LIMITS.description.min} à ${LIMITS.description.max}. Doublon = texte exactement`,
    '> identique sur deux URLs. Type de page = gabarit d’URL ; `/*` réunit les pages',
    '> à un seul segment (accueil, listes, outils).',
    '',
    `${total} URL(s) au sitemap, ${pages.length} mesurée(s), ${skipped.length} non mesurée(s) ;`,
    `${pages.filter((p) => p.issues.length > 0).length} page(s) avec au moins un écart.`,
    '',
    '## Vue d’ensemble',
    '',
    `| Type de page | Pages | Avec écart | ${ISSUES.map((i) => ISSUE_LABEL[i]).join(' | ')} |`,
    `| --- | ---: | ---: | ${ISSUES.map(() => '---:').join(' | ')} |`,
    ...groups.map(
      (g) =>
        `| \`${g.name}\` | ${g.pages.length} | ${g.pages.filter((p) => p.issues.length > 0).length} | ${ISSUES.map((i) => count(g.pages, i)).join(' | ')} |`,
    ),
    `| **Total** | ${pages.length} | ${pages.filter((p) => p.issues.length > 0).length} | ${ISSUES.map((i) => count(pages, i)).join(' | ')} |`,
    '',
  ];

  for (const g of groups) {
    const flagged = g.pages
      .filter((p) => p.issues.length > 0)
      .sort((a, b) => b.score - a.score || a.url.localeCompare(b.url));
    lines.push(
      `## \`${g.name}\` — ${g.pages.length} page(s), ${flagged.length} avec écart`,
      '',
      `Longueurs (min / médiane / max) : titre ${spread(g.pages.map((p) => p.titleLength))} ;`,
      `description ${spread(g.pages.map((p) => p.descriptionLength))}.`,
      '',
    );
    if (flagged.length === 0) {
      lines.push('Aucun écart.', '');
      continue;
    }
    const present = ISSUES.filter((i) => count(g.pages, i) > 0);
    lines.push(present.map((i) => `${ISSUE_LABEL[i]} : ${count(g.pages, i)}`).join(' · '), '');
    lines.push(
      flagged.length > WORST ? `Les ${WORST} pires sur ${flagged.length} :` : 'Toutes les pages :',
      '',
      '| Page | Titre | Car. | Description | Car. | Écarts |',
      '| --- | --- | ---: | --- | ---: | --- |',
      ...flagged
        .slice(0, WORST)
        .map(
          (p) =>
            `| \`${pathOf(p.url)}\` | ${cell(p.title)} | ${p.titleLength} | ${cell(p.description)} | ${p.descriptionLength} | ${p.issues.map((i) => ISSUE_LABEL[i]).join(', ')} |`,
        ),
      '',
    );
  }

  lines.push('## Doublons exacts', '');
  lines.push(...duplicateSection('Titres', duplicateTitles));
  lines.push(...duplicateSection('Descriptions', duplicateDescriptions));

  if (skipped.length > 0) {
    lines.push('## Pages non mesurées', '', 'Au sitemap, mais ni 200 ni HTML :', '');
    for (const s of skipped.slice(0, WORST)) lines.push(`- \`${pathOf(s.url)}\` — ${s.status}`);
    if (skipped.length > WORST) lines.push(`- … et ${skipped.length - WORST} autre(s).`);
    lines.push('');
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Point d'entrée
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const hostArg = argv.indexOf('--host');
  if (hostArg > -1 && !argv[hostArg + 1]) {
    console.error('`--host` exige une origine (ex. `--host https://fr.outerpedia.com`).');
    process.exit(1);
  }
  let host: string;
  try {
    host = new URL(hostArg > -1 ? argv[hostArg + 1] : DEFAULT_HOST).origin;
  } catch {
    console.error(`Hôte invalide : "${argv[hostArg + 1]}" (attendu une origine https://…).`);
    process.exit(1);
  }

  const sitemapUrl = `${host}/sitemap.xml`;
  const sitemapRes = await fetch(sitemapUrl, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!sitemapRes.ok) {
    console.error(`Sitemap illisible : ${sitemapRes.status} sur ${sitemapUrl}.`);
    process.exit(1);
  }
  const urls = parseSitemap(await sitemapRes.text(), host);
  if (urls.length === 0) {
    console.error(`Aucune URL dans ${sitemapUrl}.`);
    process.exit(1);
  }
  console.log(`${urls.length} URL(s) dans ${sitemapUrl} — ${CONCURRENCY} requêtes de front.`);

  let collected: Awaited<ReturnType<typeof crawl>>;
  try {
    collected = await crawl(urls, {
      fetchPage,
      onProgress: (done, total) => {
        if (done % 50 === 0 || done === total) console.log(`  ${done}/${total}`);
      },
    });
  } catch (err) {
    if (!(err instanceof CrawlStopped)) throw err;
    console.error(`Arrêt : ${err.message} Aucun rapport écrit.`);
    process.exit(1);
  }

  // Date LOCALE (`sv-SE` formate en `YYYY-MM-DD`), comme `stamp-guides`.
  const date = new Intl.DateTimeFormat('sv-SE').format(new Date()).slice(0, 10);
  const classification = classify(collected.metas);
  const outPath = resolve(OUT_DIR, `titres-descriptions-${new URL(host).host}-${date}.md`);
  const markdown = renderReport({
    host,
    date,
    total: urls.length,
    classification,
    skipped: collected.skipped,
  });
  mkdirSync(OUT_DIR, { recursive: true });
  // Sortie prettier-canonique : le hook de commit ne réécrit pas les tableaux.
  writeTextAtomic(
    outPath,
    await prettierFormat(markdown, { ...(await resolveConfig(outPath)), filepath: outPath }),
  );

  const flagged = classification.pages.filter((p) => p.issues.length > 0).length;
  console.log(
    `${classification.pages.length} page(s) mesurée(s), ${flagged} avec écart, ${collected.skipped.length} non mesurée(s).`,
  );
  console.log(`Rapport : ${outPath}`);
}

if (isMain(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
