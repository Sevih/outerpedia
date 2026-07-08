/**
 * getNews — scrape des notes de patch officielles (WordPress OuterPlane) →
 * `data/patch-notes/posts.json` + `buff-events.json`. Les images sont converties
 * en WebP et stockées CONTENT-ADDRESSED (hash de l'URL) dans le pool
 * `.assets-staging/images/patch-notes/` (poussé sur R2 par `pnpm images`) : une
 * image réutilisée sur N posts n'est stockée et téléchargée qu'UNE fois, jamais
 * re-pull. Port de la V2, autonome.
 *
 * Usage :
 *   pnpm getNews                 # fetch incrémental (ancré sur le post le + récent)
 *   pnpm getNews --limit=5       # dev : borne le nombre de posts par page
 *   pnpm getNews --force-since=2025-01-01   # re-scrape depuis une date
 *
 * Incrémental : on ré-ancre par langue sur le post le plus récent qu'on a déjà,
 * et on filtre sur `modified_after` (le site ré-édite d'anciens posts).
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join, basename, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import * as cheerio from 'cheerio';
import sharp from 'sharp';

const WP_API = 'https://annoucements.outerplane.vagames.co.kr/wp-json/wp/v2/posts';
const USER_AGENT = 'Outerpedia/1.0 (https://outerpedia.com; community wiki)';
const DELAY_API = 500;
const DELAY_IMAGE = 150;

const OUT_DIR = resolve('data/patch-notes');
// Pool d'assets poussé sur R2 par `pnpm images` (NON committé, cf. .gitignore).
// `assets:collect` ne purge pas ce dossier → nos images y survivent ; `assets:push`
// (rclone copy) les envoie sur le bucket. En dev, la route `/images/*` les sert
// depuis ce même staging.
const IMG_DIR = resolve('.assets-staging/images/patch-notes');

const argLimit = process.argv.find((a) => a.startsWith('--limit='));
const DEV_LIMIT = argLimit ? Number(argLimit.split('=')[1]) : 0;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type LangDef = { lang: string; parentCategoryId: number };
const LANGUAGES: LangDef[] = [
  { lang: 'en', parentCategoryId: 11 },
  { lang: 'kr', parentCategoryId: 26 },
  { lang: 'jp', parentCategoryId: 28 },
];

/** WP category id → type normalisé. */
const CATEGORY_TYPE_MAP: Record<number, string> = {
  20: 'update',
  22: 'notice',
  18: 'event',
  43: 'devnote',
  145: 'known-issue',
  46: 'update',
  37: 'notice',
  38: 'event',
  47: 'devnote',
  146: 'known-issue',
  44: 'update',
  39: 'notice',
  40: 'event',
  45: 'devnote',
  147: 'known-issue',
  148: 'media',
  149: 'media',
  150: 'media',
};

type PatchNotePost = {
  id: number;
  date: string;
  modified: string;
  slug: string;
  lang: string;
  type: string;
  title: string;
  content: string;
};
type PatchNotesData = { posts: PatchNotePost[] };

// --- In-game Buff Event schedule (widget d'accueil) --------------------------

type BuffScheduleEntry = { date: string; type: string; raw: string };

const BUFF_TYPE_MATCHERS: { type: string; test: RegExp }[] = [
  { type: 'frog-gold', test: /frog hall[^]*gold|gold[^]*frog hall/i },
  { type: 'frog-food', test: /frog hall[^]*food|food[^]*frog hall/i },
  { type: 'ark-raid', test: /ark raid/i },
  { type: 'special-ecology', test: /ecology/i },
  { type: 'special-identification', test: /identification/i },
  { type: 'doppelganger', test: /doppel/i },
  { type: 'kate-workshop', test: /kate/i },
  { type: 'story-survey', test: /survey/i },
  { type: 'evolution-stone', test: /evolution stone/i },
  { type: 'bounty-hunter', test: /bounty/i },
  { type: 'bandit-chase', test: /bandit/i },
];

function matchBuffType(text: string): string {
  for (const { type, test } of BUFF_TYPE_MATCHERS) if (test.test(text)) return type;
  return 'other';
}

const DAY_MS = 86_400_000;

/** Résout une cellule de date de buff ("05/06(Wed)"…) en YYYY-MM-DD, ancrée sur la date du post. */
function parseBuffDate(cell: string, postDate: string): string | null {
  const m = cell.match(/(\d{1,2})\s*\/\s*(\d{1,2})/);
  if (!m) return null;
  const month = parseInt(m[1], 10);
  const day = parseInt(m[2], 10);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const anchor = Date.parse(`${postDate}T00:00:00Z`);
  const year = new Date(anchor).getUTCFullYear();
  let d = Date.UTC(year, month - 1, day);
  if (anchor - d > 60 * DAY_MS) d = Date.UTC(year + 1, month - 1, day);
  else if (d - anchor > 300 * DAY_MS) d = Date.UTC(year - 1, month - 1, day);
  return new Date(d).toISOString().slice(0, 10);
}

function deriveBuffEvents(posts: PatchNotePost[]): BuffScheduleEntry[] {
  const buffPosts = posts
    .filter((p) => p.lang === 'en' && /In-game Buff.*Event/i.test(p.title))
    .sort((a, b) => a.date.localeCompare(b.date));
  const byDate = new Map<string, BuffScheduleEntry>();
  for (const post of buffPosts) {
    const $ = cheerio.load(post.content);
    const $table = $('table').first();
    let buffCol = 2;
    $table
      .find('tr')
      .first()
      .find('td, th')
      .each((i, c) => {
        if (/^buff$/i.test($(c).text().trim())) buffCol = i;
      });
    $table.find('tr').each((_i, tr) => {
      const cells = $(tr).find('td, th');
      if (cells.length <= buffCol) return;
      const first = $(cells[0]).text().trim();
      if (/^date$/i.test(first)) return;
      const date = parseBuffDate(first, post.date);
      if (!date) return;
      const raw = $(cells[buffCol]).text().trim();
      if (!raw) return;
      byDate.set(date, { date, type: matchBuffType(raw), raw });
    });
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

// --- Helpers -----------------------------------------------------------------

const FETCH_OPTS: RequestInit = { headers: { 'User-Agent': USER_AGENT } };

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, FETCH_OPTS);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${url}`);
  return res.json() as Promise<T>;
}

async function downloadImage(url: string, destPath: string): Promise<boolean> {
  if (existsSync(destPath)) return false;
  const res = await fetch(url, FETCH_OPTS);
  if (!res.ok) return false;
  const input = Buffer.from(await res.arrayBuffer());
  // Conversion en WebP (allège le stockage). `animated` préserve les GIF animés.
  const webp = await sharp(input, { animated: true }).webp({ quality: 90 }).toBuffer();
  writeFileSync(destPath, webp);
  return true;
}

function resolveType(categoryIds: number[]): string {
  for (const id of categoryIds) {
    const type = CATEGORY_TYPE_MAP[id];
    if (type && type !== 'media') return type;
  }
  return 'notice';
}

function decodeEntities(text: string): string {
  return cheerio.load(`<span>${text}</span>`)('span').text();
}

/**
 * Clé CONTENT-ADDRESSED d'une image : hash de son URL source. Une même URL
 * (souvent réutilisée sur des dizaines de posts) donne TOUJOURS la même clé →
 * stockée une seule fois, référencée partout, jamais re-téléchargée. Extension
 * `.webp` car tout est converti à la volée (cf. `downloadImage`).
 */
function imageKey(url: string): string {
  return createHash('sha1').update(url).digest('hex').slice(0, 16) + '.webp';
}

/** Nettoie le HTML WP : réécrit les <img> vers le store partagé, remplace <video> par un lien, purge les classes wp-*. */
function sanitizeHTML(html: string): { html: string; images: { url: string; key: string }[] } {
  const $ = cheerio.load(html);
  const images: { url: string; key: string }[] = [];
  $('img').each((_i, el) => {
    const src = $(el).attr('src');
    if (!src) return;
    const key = imageKey(src);
    images.push({ url: src, key });
    $(el).attr('src', `/images/patch-notes/${key}`);
    $(el).removeAttr('loading').removeAttr('decoding').removeAttr('srcset').removeAttr('sizes');
    if ($(el).attr('class')) $(el).removeAttr('class');
  });
  $('video').each((_i, el) => {
    const src = $(el).attr('src');
    if (!src) return;
    const filename = decodeURIComponent(basename(new URL(src).pathname));
    $(el).replaceWith(
      `<a href="${src}" target="_blank" rel="noopener noreferrer" class="pn-video-link">▶ ${filename}</a>`,
    );
  });
  $('[class]').each((_i, el) => {
    const cleaned = ($(el).attr('class') || '')
      .split(/\s+/)
      .filter((c) => !c.startsWith('wp-') && !c.startsWith('has-') && !c.startsWith('is-style-'))
      .join(' ')
      .trim();
    if (cleaned) $(el).attr('class', cleaned);
    else $(el).removeAttr('class');
  });
  return { html: $('body').html() || '', images };
}

/** Écrit en JSON indenté seulement si le contenu diffère (évite de churner le fichier committé). */
async function writeJsonIfChanged(path: string, data: unknown): Promise<boolean> {
  const json = JSON.stringify(data, null, 2) + '\n';
  let current: string | null = null;
  try {
    current = await readFile(path, 'utf-8');
  } catch {
    /* absent → écrire */
  }
  if (current === json) return false;
  writeFileSync(path, json);
  return true;
}

type WPPost = {
  id: number;
  date: string;
  modified: string;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  categories: number[];
};

async function main(): Promise<void> {
  mkdirSync(OUT_DIR, { recursive: true });
  mkdirSync(IMG_DIR, { recursive: true });
  const outputPath = join(OUT_DIR, 'posts.json');
  // Clés d'images déjà traitées CE run (dédup inter-posts : une image partagée
  // par N posts n'est testée/téléchargée qu'une fois). `downloadImage` gère en
  // plus la dédup inter-runs via `existsSync`.
  const seenKeys = new Set<string>();

  let existing: PatchNotesData = { posts: [] };
  try {
    existing = JSON.parse(await readFile(outputPath, 'utf-8')) as PatchNotesData;
  } catch {
    /* premier run */
  }

  const forceSinceArg = process.argv.find((a) => a.startsWith('--force-since='));
  if (forceSinceArg) {
    const sinceDate = forceSinceArg.split('=')[1];
    const before = existing.posts.length;
    existing.posts = existing.posts.filter((p) => p.date < sinceDate);
    console.log(
      `[getNews] --force-since=${sinceDate} : ${before - existing.posts.length} posts retirés, re-scrape…`,
    );
  }

  const byId = new Map<number, PatchNotePost>(existing.posts.map((p) => [p.id, p]));
  let newCount = 0;
  let updatedCount = 0;
  let imgCount = 0;

  for (const { lang, parentCategoryId } of LANGUAGES) {
    const perPage = DEV_LIMIT || 100;
    const newestForLang = existing.posts
      .filter((p) => p.lang === lang)
      .reduce((max, p) => (p.date > max ? p.date : max), '');
    const coldStart = newestForLang === '';
    const anchor = coldStart ? '' : `${newestForLang}T00:00:00`;
    const cutoffMs = coldStart ? -Infinity : Date.parse(anchor);
    const queryFilter = coldStart ? '' : `&modified_after=${anchor}&orderby=modified&order=desc`;

    let page = 1;
    let hasMore = true;
    while (hasMore) {
      const url = `${WP_API}?categories=${parentCategoryId}&per_page=${perPage}&page=${page}${queryFilter}&_fields=id,date,modified,slug,title,content,categories`;
      let posts: WPPost[];
      try {
        if (page > 1 || lang !== 'en') await sleep(DELAY_API);
        posts = await fetchJSON<WPPost[]>(url);
      } catch {
        break; // 400 sur page vide
      }

      for (const post of posts) {
        const known = byId.get(post.id);
        if (known && known.modified === post.modified) continue;
        const type = resolveType(post.categories);
        if (type === 'media') continue;

        const { html, images } = sanitizeHTML(post.content.rendered);
        for (const { url, key } of images) {
          if (seenKeys.has(key)) continue; // déjà traité ce run
          seenKeys.add(key);
          try {
            if (await downloadImage(url, join(IMG_DIR, key))) {
              imgCount++;
              await sleep(DELAY_IMAGE);
            }
          } catch {
            /* image cassée → ignore */
          }
        }

        byId.set(post.id, {
          id: post.id,
          date: post.date.split('T')[0],
          modified: post.modified,
          slug: post.slug,
          lang,
          type,
          title: decodeEntities(post.title.rendered),
          content: html,
        });
        if (known) updatedCount++;
        else newCount++;
      }

      const oldestMs = posts.length ? Date.parse(posts[posts.length - 1].modified) : Infinity;
      if (posts.length < perPage || oldestMs < cutoffMs || DEV_LIMIT > 0) hasMore = false;
      else page++;
    }
  }

  const allPosts = [...byId.values()].sort((a, b) => b.date.localeCompare(a.date));
  const postsWritten = await writeJsonIfChanged(outputPath, { posts: allPosts });
  const buffSchedule = deriveBuffEvents(allPosts);
  const buffWritten = await writeJsonIfChanged(join(OUT_DIR, 'buff-events.json'), {
    schedule: buffSchedule,
  });

  const changed = [postsWritten && 'posts.json', buffWritten && 'buff-events.json'].filter(Boolean);
  console.log(
    `${allPosts.length} posts (${newCount} new, ${updatedCount} updated), ${imgCount} images, ` +
      `${buffSchedule.length} buff days${changed.length ? ` — écrit ${changed.join(', ')}` : ' — aucun changement'}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
