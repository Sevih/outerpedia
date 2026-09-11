/**
 * quick — le petit outil de tous les jours (`pnpm quick`, ou l'icône du bureau).
 *
 * Un serveur HTTP local de quelques routes et UNE page : mettre à jour un code
 * promo, déposer une 4-comic, ajouter une vidéo. Rien d'autre. Le panneau admin
 * complet reste la référence pour tout le reste — il exige `pnpm dev`, donc un
 * `clean:all` et un refresh complet des données du jeu, ce qui n'a aucun sens
 * pour changer quatre lignes de JSON.
 *
 * PAS de Next, pas de build, pas de dépendance ajoutée : `node:http` sert une
 * page statique et quelques JSON, la logique vit dans `actions.ts` qui rappelle
 * les stores de l'admin. Démarrage ~1 s.
 *
 * `.env.local` est chargé à la main (tsx ne le fait pas, contrairement à Next) :
 * sans R2_* la publication des codes promo est sautée, sans YOUTUBE_API_KEY
 * l'onglet vidéos ne résout plus les métadonnées.
 *
 * DÉJÀ LANCÉ : le port est tenu par l'instance précédente, on se contente
 * d'ouvrir le navigateur dessus. Double-cliquer l'icône deux fois ne crée donc
 * pas deux serveurs.
 */
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { resolve } from 'node:path';
import { loadEnvLocal } from '@datagen/lib/env';
import {
  addComics,
  addVideo,
  currentCoupons,
  parseTarget,
  rewardOptions,
  saveCouponList,
  searchVideos,
  videoTargets,
  type ComicUpload,
} from './actions';
import { COMIC_LANGS } from '@datagen/generators/comics';
import type { PromoCode } from '@/lib/admin/promo-banner-store';

// Les stores lisent `process.env` (écrits pour Next, qui charge .env.local seul).
for (const [k, v] of Object.entries(loadEnvLocal())) process.env[k] ??= v;

const PORT = Number(process.env.QUICK_PORT ?? 4747);
const UI = resolve(import.meta.dirname, 'ui.html');

/** Corps JSON, plafonné — une planche de BD en base64 pèse déjà ~600 Ko. */
const MAX_BODY = 64 * 1024 * 1024;

async function body<T>(req: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const c of req) {
    size += (c as Buffer).length;
    if (size > MAX_BODY) throw new Error('Corps trop volumineux.');
    chunks.push(c as Buffer);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as T;
}

const json = (res: ServerResponse, data: unknown, status = 200): void => {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
};

async function route(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);

  if (req.method === 'GET' && url.pathname === '/') {
    // Relu à chaque requête : éditer l'UI et rafraîchir suffit, pas de redémarrage.
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(readFileSync(UI, 'utf8'));
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/state') {
    json(res, {
      coupons: currentCoupons(),
      rewards: rewardOptions(),
      langs: COMIC_LANGS,
      targets: videoTargets(),
      hasYoutubeKey: Boolean(process.env.YOUTUBE_API_KEY),
      hasR2: Boolean(process.env.R2_BUCKET),
    });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/coupons') {
    const list = await body<PromoCode[]>(req);
    json(res, await saveCouponList(list));
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/comics') {
    const { lang, files } = await body<{ lang: string; files: ComicUpload[] }>(req);
    json(res, await addComics(lang as (typeof COMIC_LANGS)[number], files));
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/youtube') {
    const q = url.searchParams.get('q')?.trim();
    if (!q) return json(res, { error: 'requête vide' }, 400);
    json(res, { candidates: await searchVideos(q) });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/video') {
    const { target, input, label } = await body<{ target: string; input: string; label?: string }>(
      req,
    );
    const parsed = parseTarget(target);
    if (!parsed) return json(res, { ok: false, log: [`Cible inconnue : ${target}`] }, 400);
    json(res, await addVideo(parsed, input, label));
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/quit') {
    // Lancé par l'icône, l'outil n'a PAS de fenêtre : sans ce bouton, l'arrêter
    // demandait un `pkill` (et le motif évident tue le shell qui le tape).
    // On répond d'abord, on coupe une fois la réponse partie.
    json(res, { ok: true, log: ['Serveur arrêté — cet onglet peut être fermé.'] });
    res.on('finish', () => {
      server.close();
      process.exit(0);
    });
    return;
  }

  json(res, { error: 'route inconnue' }, 404);
}

/**
 * Ouvre la page dans le navigateur par défaut (détaché : l'outil n'attend pas).
 *
 * L'ouvreur n'a pas de nom commun : `xdg-open` sous Linux, `start` sous Windows
 * — et `start` n'est pas un exécutable mais une COMMANDE INTERNE de cmd, d'où
 * le `cmd /c` et son premier argument vide (que `start` prend pour le titre de
 * fenêtre : sans lui, il avalerait l'URL comme titre et n'ouvrirait rien).
 */
function openBrowser(): void {
  const url = `http://localhost:${PORT}/`;
  const [cmd, args] =
    process.platform === 'win32' ? ['cmd', ['/c', 'start', '', url]] : ['xdg-open', [url]];
  spawn(cmd, args, { detached: true, stdio: 'ignore' }).unref();
}

const server = createServer((req, res) => {
  route(req, res).catch((e: unknown) => json(res, { ok: false, log: [String(e)] }, 500));
});

server.on('error', (e: NodeJS.ErrnoException) => {
  // Instance déjà en place : on lui rend la main plutôt que d'échouer.
  if (e.code === 'EADDRINUSE') {
    console.log(`quick tourne déjà sur ${PORT} — ouverture du navigateur.`);
    openBrowser();
    process.exit(0);
  }
  throw e;
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`quick → http://localhost:${PORT}/`);
  if (!process.argv.includes('--no-open')) openBrowser();
});
