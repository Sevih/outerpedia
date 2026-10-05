/**
 * quick — le petit outil de tous les jours (`pnpm quick`, ou l'icône du bureau).
 *
 * Un serveur HTTP local de quelques routes et UNE page : mettre à jour un code
 * promo, déposer une 4-comic, ajouter une vidéo, régler les rangs, écrire un
 * message Discord que le bot poste. Rien d'autre. Le panneau admin
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
 * l'onglet vidéos ne résout plus les métadonnées, sans DISCORD_BOT_TOKEN
 * l'onglet Discord rédige et prévisualise mais n'envoie pas (cf. `discord.ts`).
 *
 * DÉJÀ LANCÉ : le port est tenu par l'instance précédente, on se contente
 * d'ouvrir le navigateur dessus. Double-cliquer l'icône deux fois ne crée donc
 * pas deux serveurs.
 */
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { extname, resolve } from 'node:path';
import { loadEnvLocal } from '@datagen/lib/env';
import {
  addComics,
  addVideo,
  currentCoupons,
  parseTarget,
  rankState,
  rewardOptions,
  saveCouponList,
  saveRanks,
  searchRewards,
  searchVideos,
  videoTargets,
  type ComicUpload,
  type RankChange,
  type Report,
} from './actions';
import {
  discordSession,
  latestNotes,
  noteSrcdoc,
  officialUrl,
  patchTemplate,
  type NotePost,
} from './discord';
import { COMIC_LANGS } from '@datagen/generators/comics';
import type { PromoCode } from '@/lib/admin/promo-banner-store';

// Les stores lisent `process.env` (écrits pour Next, qui charge .env.local seul).
for (const [k, v] of Object.entries(loadEnvLocal())) process.env[k] ??= v;

const PORT = Number(process.env.QUICK_PORT ?? 4747);
const UI = resolve(import.meta.dirname, 'ui.html');

// Le jeton du bot reste dans cet objet : aucune route ne le renvoie.
const discord = discordSession({
  token: process.env.DISCORD_BOT_TOKEN || undefined,
  guildId: process.env.DISCORD_GUILD_ID || undefined,
  fetch,
  sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
});

/**
 * Les notes officielles, chargées à la PREMIÈRE demande de l'onglet Discord :
 * 7 Mo de JSON que les quatre autres gestes ne lisent jamais, et qui n'ont pas
 * à peser sur le démarrage.
 */
let notePosts: Promise<NotePost[]> | null = null;
const patchPosts = (): Promise<NotePost[]> =>
  (notePosts ??= import('@/lib/data/patch-posts').then((m) => m.getPatchPosts()));

/** Images des notes : `get-news` les dépose ici, `pnpm images` les pousse sur R2. */
const NOTE_IMAGES = resolve('.assets-staging/images/patch-notes');
const IMG_BASE = process.env.NEXT_PUBLIC_IMG_BASE || 'https://img.outerpedia.com';
const IMAGE_TYPES = new Map([
  ['.webp', 'image/webp'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.gif', 'image/gif'],
]);

const strings = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];

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

/**
 * Réponse en NDJSON — une ligne JSON par étape, ÉCRITE DÈS QU'ELLE ARRIVE, puis
 * une dernière ligne `{ done: … }` qui porte le résultat complet.
 *
 * Les gestes prennent des dizaines de secondes (conversion webp, deux
 * poussées R2, purge d'edge, push git) et leur journal existait déjà — mais
 * rendu en BLOC au retour, il ne s'affichait qu'une fois tout fini. L'onglet
 * montrait donc un texte figé pendant deux minutes, sans rien qui distingue une
 * étape lente d'un plantage.
 *
 * `setNoDelay` : sans lui, Nagle peut garder une ligne de 40 octets le temps
 * d'en accumuler d'autres — c'est-à-dire exactement le temps qu'on veut couvrir.
 */
async function stream<T>(res: ServerResponse, run: (report: Report) => Promise<T>): Promise<void> {
  res.socket?.setNoDelay(true);
  res.writeHead(200, {
    'content-type': 'application/x-ndjson; charset=utf-8',
    'cache-control': 'no-store',
  });
  const line = (o: unknown): void => void res.write(`${JSON.stringify(o)}\n`);
  try {
    line({ done: await run((step, doing) => line(doing ? { step, doing: true } : { step })) });
  } catch (e: unknown) {
    // Les en-têtes sont partis : plus question de répondre en 500, l'échec passe
    // par le journal comme le reste (le `catch` de `createServer` ne pourrait
    // plus qu'échouer sur des en-têtes déjà envoyés).
    line({ done: { ok: false, log: [String(e)] } });
  }
  res.end();
}

async function route(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);

  if (req.method === 'GET' && url.pathname === '/') {
    // Relu à chaque requête : éditer l'UI et rafraîchir suffit, pas de redémarrage.
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(readFileSync(UI, 'utf8'));
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/state') {
    const coupons = await currentCoupons();
    json(res, {
      coupons: coupons.list,
      couponsEtag: coupons.etag,
      couponsError: coupons.error,
      rewards: rewardOptions(),
      langs: COMIC_LANGS,
      targets: videoTargets(),
      hasYoutubeKey: Boolean(process.env.YOUTUBE_API_KEY),
      hasR2: Boolean(process.env.R2_BUCKET),
    });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/coupons') {
    const { list, etag } = await body<{ list: PromoCode[]; etag: string | null }>(req);
    if (!etag)
      return json(res, { ok: false, log: ['Liste non chargée depuis R2 : recharger.'] }, 409);
    await stream(res, (report) => saveCouponList(list, etag, report));
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/comics') {
    const { lang, files } = await body<{ lang: string; files: ComicUpload[] }>(req);
    await stream(res, (report) => addComics(lang as (typeof COMIC_LANGS)[number], files, report));
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/rewards') {
    // Cherché ICI, pas dans la page : le classement par pertinence est celui du
    // picker de l'admin, et une seule copie ne peut pas diverger de l'autre.
    json(res, { hits: searchRewards(url.searchParams.get('q') ?? '') });
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
    await stream(res, (report) => addVideo(parsed, input, label, report));
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/ranks') {
    // À part de `/api/state` : celui-ci attend R2 (les codes promo), et l'onglet
    // se recharge après chaque enregistrement — le disque fait foi.
    json(res, rankState());
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/ranks') {
    const { changes } = await body<{ changes: RankChange[] }>(req);
    await stream(res, (report) => saveRanks(changes, report));
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/discord/state') {
    json(res, { ...(await discord.state()), notes: latestNotes(await patchPosts()) });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/discord/note') {
    const id = url.searchParams.get('id');
    const post = (await patchPosts()).find((p) => p.lang === 'en' && String(p.id) === id);
    if (!post) return json(res, { error: 'note inconnue' }, 404);
    const link = officialUrl(post);
    json(res, { url: link, srcdoc: noteSrcdoc(post.content), template: patchTemplate(link) });
    return;
  }

  if (req.method === 'GET' && url.pathname.startsWith('/images/patch-notes/')) {
    // Les images du cadre de la note. Le staging local d'abord : une note
    // scrapée ce matin n'est pas encore sur R2 (elle y part avec `pnpm commit`).
    // Sinon leur origine publique, par redirection — rien n'est relayé d'ici.
    const name = url.pathname.slice('/images/patch-notes/'.length);
    const type = IMAGE_TYPES.get(extname(name).toLowerCase());
    if (!type || !/^[A-Za-z0-9_-][A-Za-z0-9._-]*$/.test(name))
      return json(res, { error: 'image inconnue' }, 404);
    const file = resolve(NOTE_IMAGES, name);
    if (existsSync(file)) {
      res.writeHead(200, { 'content-type': type, 'cache-control': 'max-age=3600' });
      res.end(readFileSync(file));
    } else {
      res.writeHead(302, { location: `${IMG_BASE}/images/patch-notes/${name}` });
      res.end();
    }
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/discord/preview') {
    // Rendu ICI, pas dans la page : une seule implémentation du markdown de
    // Discord, celle que les tests couvrent — et la même conversion d'emojis
    // et le même découpage que l'envoi.
    const { text } = await body<{ text?: unknown }>(req);
    json(res, discord.preview(String(text ?? '')));
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/discord/send') {
    const b = await body<Record<string, unknown>>(req);
    await stream(res, (report) =>
      discord.send(
        {
          text: String(b.text ?? ''),
          channelId: String(b.channelId ?? ''),
          suppressEmbeds: b.suppressEmbeds !== false,
          already: strings(b.already),
          total: typeof b.total === 'number' ? b.total : undefined,
        },
        report,
      ),
    );
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/discord/edit') {
    const b = await body<Record<string, unknown>>(req);
    await stream(res, (report) =>
      discord.edit(
        {
          text: String(b.text ?? ''),
          channelId: String(b.channelId ?? ''),
          suppressEmbeds: b.suppressEmbeds !== false,
          ids: strings(b.ids),
        },
        report,
      ),
    );
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
