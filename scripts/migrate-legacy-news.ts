/**
 * migrate-legacy-news — migration ONE-SHOT de l'archive patch-notes Smilegate
 * (ère Stove, close en 2025) depuis la V2 :
 *
 *   - `data/patch-notes/legacy-posts.json` copié verbatim (806 posts EN,
 *     archive figée — aucun scrape futur, contrairement à `posts.json`/getNews) ;
 *   - les images RÉFÉRENCÉES par le contenu (src="/images/news/legacy/…", déjà
 *     toutes en .webp) copiées de `public/` V2 vers `.assets-staging/` →
 *     poussées sur R2 par `pnpm assets:push`. Collecte DATA-DRIVEN : le dossier
 *     V2 contient ~2× plus de fichiers (originaux jpg/png, orphelins) qui ne
 *     sont PAS embarqués.
 *
 * Idempotent (copies sautées si présentes). Après le push, R2 + pushed.json
 * sont l'état durable : le staging peut être nettoyé, `assets-push` ne
 * supprime jamais à distance.
 *
 * Usage : `pnpm exec tsx scripts/migrate-legacy-news.ts` puis `pnpm assets:push`.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { v2Dir } from '../datagen/lib/env';

const STAGING = resolve('.assets-staging');
const DEST_JSON = resolve('data/patch-notes/legacy-posts.json');

const srcJson = join(v2Dir(), 'data/patch-notes/legacy-posts.json');
const raw = readFileSync(srcJson, 'utf8');
const { posts } = JSON.parse(raw) as { posts: { content: string }[] };

// Toutes les images du pool legacy référencées par le contenu.
const srcs = new Set<string>();
for (const post of posts) {
  for (const m of post.content.matchAll(/src="(\/images\/news\/legacy\/[^"]+)"/g)) srcs.add(m[1]);
}

let copied = 0;
let uptodate = 0;
let bytes = 0;
const missing: string[] = [];
for (const src of srcs) {
  const from = join(v2Dir(), 'public', src);
  if (!existsSync(from)) {
    missing.push(src);
    continue;
  }
  const to = join(STAGING, src);
  if (existsSync(to)) {
    uptodate++;
    continue;
  }
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(from, to);
  bytes += readFileSync(to).length;
  copied++;
}

writeFileSync(DEST_JSON, raw);

console.log(
  `legacy-news → ${posts.length} posts copiés, images : ${copied} copiées ` +
    `(${Math.round(bytes / 1024 / 1024)} Mo), ${uptodate} à jour, ${missing.length} INTROUVABLES`,
);
if (missing.length) {
  console.error('Sources manquantes dans la V2 :');
  for (const m of missing.slice(0, 20)) console.error('  ' + m);
  process.exitCode = 1;
}
