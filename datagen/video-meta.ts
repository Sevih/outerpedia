/**
 * video-meta — métadonnées YouTube des vidéos embarquées (`pnpm datagen:video-meta`).
 *
 * Schema.org exige `uploadDate` sur un VideoObject, qu'on n'écrit jamais à la
 * main : on le résout ici (YouTube Data API, part=snippet) et on le CACHE dans
 * `data/generated/video-meta.json` — lu par `VideoJsonLd` au rendu. Titre et
 * chaîne sont pris avec (affichage possible pour un id brut).
 *
 * Collecte DATA-DRIVEN (la V2 scannait les .tsx à la regex ; en V3 les vidéos
 * vivent dans la DONNÉE) : marche récursive des JSON de guides
 * (`_contents` — videos.json, content.json, versions/<clé>/config.json…) et du
 * curé personnages (`videos` par perso), à la recherche d'objets
 * `{ platform: 'youtube', id }`. Déposer une vidéo dans un guide suffit.
 *
 * INCRÉMENTAL : seuls les ids absents du cache sont interrogés (la plupart des
 * runs ne touchent pas l'API) ; les ids plus référencés nulle part sont
 * PURGÉS (même règle que les tables fantômes de convert.ts). Seed initial :
 * le cache V2 (169 entrées), transplanté verbatim.
 *
 * `YOUTUBE_API_KEY` (`.env.local`) : absent → warn et cache conservé tel quel,
 * jamais d'échec — le site rend simplement moins de VideoObject.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { envVar } from './lib/env';
import { walkFiles } from './lib/fs';
import { isMain } from './lib/is-main';

const GUIDES_DIR = resolve('src/app/[lang]/guides/_contents');
const CURATED_CHARACTERS = resolve('data/curated/characters.json');
const OUTPUT = resolve('data/generated/video-meta.json');
const API_URL = 'https://www.googleapis.com/youtube/v3/videos';

const YT_ID = /^[A-Za-z0-9_-]{11}$/;

export type VideoMeta = { uploadDate: string; title: string; author: string };

/** Collecte récursive des `{ platform: 'youtube', id }` d'une valeur JSON. */
function collectFrom(node: unknown, into: Set<string>): void {
  if (Array.isArray(node)) {
    for (const v of node) collectFrom(v, into);
    return;
  }
  if (!node || typeof node !== 'object') return;
  const o = node as Record<string, unknown>;
  if (o.platform === 'youtube' && typeof o.id === 'string' && YT_ID.test(o.id)) into.add(o.id);
  for (const v of Object.values(o)) collectFrom(v, into);
}

/** Tous les ids YouTube référencés par le contenu (guides + curé persos). */
export function collectVideoIds(): Set<string> {
  const ids = new Set<string>();
  walkFiles(GUIDES_DIR, (abs, rel) => {
    if (!rel.endsWith('.json')) return;
    try {
      collectFrom(JSON.parse(readFileSync(abs, 'utf8')), ids);
    } catch {
      /* JSON invalide : le scan des guides le signale déjà, pas ici */
    }
  });
  try {
    collectFrom(JSON.parse(readFileSync(CURATED_CHARACTERS, 'utf8')), ids);
  } catch {
    /* curé absent (checkout partiel) — les guides suffisent */
  }
  return ids;
}

async function fetchMeta(ids: string[], key: string): Promise<Map<string, VideoMeta>> {
  const out = new Map<string, VideoMeta>();
  // L'API accepte 50 ids par requête.
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    const url = `${API_URL}?part=snippet&id=${batch.join(',')}&key=${key}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`YouTube API : HTTP ${res.status} — ${await res.text()}`);
    const json = (await res.json()) as {
      items?: Array<{
        id: string;
        snippet?: { publishedAt?: string; title?: string; channelTitle?: string };
      }>;
    };
    for (const item of json.items ?? []) {
      const s = item.snippet;
      if (!s?.publishedAt) continue;
      out.set(item.id, {
        uploadDate: s.publishedAt,
        title: s.title ?? '',
        author: s.channelTitle ?? '',
      });
    }
  }
  return out;
}

export async function refreshVideoMeta(): Promise<void> {
  const referenced = collectVideoIds();
  let cache: Record<string, VideoMeta> = {};
  try {
    cache = JSON.parse(readFileSync(OUTPUT, 'utf8')) as Record<string, VideoMeta>;
  } catch {
    /* premier run : cache vide */
  }

  // Purge des fantômes (vidéo retirée d'un guide) — le cache reflète le contenu.
  const ghosts = Object.keys(cache).filter((id) => !referenced.has(id));
  for (const id of ghosts) delete cache[id];

  const missing = [...referenced].filter((id) => !cache[id]).sort();
  console.log(
    `video-meta : ${referenced.size} référencées · ${referenced.size - missing.length} en cache` +
      (ghosts.length ? ` · ${ghosts.length} purgée(s)` : ''),
  );

  if (missing.length) {
    const key = envVar('YOUTUBE_API_KEY');
    if (!key) {
      console.warn(
        `⚠ ${missing.length} vidéo(s) sans meta et YOUTUBE_API_KEY absent (.env.local) — ` +
          `leur VideoObject ne sortira pas (le rendu, lui, ne dépend pas du meta).`,
      );
    } else {
      const fetched = await fetchMeta(missing, key);
      for (const [id, meta] of fetched) cache[id] = meta;
      const notFound = missing.filter((id) => !fetched.has(id));
      console.log(
        `  ${fetched.size} récupérée(s)${notFound.length ? ` · introuvables : ${notFound.join(', ')}` : ''}`,
      );
    }
  }

  // Clés triées : diffs git stables.
  const sorted = Object.fromEntries(Object.entries(cache).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(OUTPUT, JSON.stringify(sorted, null, 2) + '\n');
  if (missing.length || ghosts.length) console.log(`✔ ${OUTPUT}`);
}

if (isMain(import.meta.url)) {
  refreshVideoMeta().catch((e) => {
    console.error(`✗ datagen:video-meta a échoué : ${e instanceof Error ? e.message : e}`);
    process.exit(1);
  });
}
