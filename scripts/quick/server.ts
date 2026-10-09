/**
 * quick — le petit outil de tous les jours (`pnpm quick`, ou l'icône du bureau).
 *
 * Un serveur HTTP local de quelques routes et UNE page (`ui/`, un fichier par
 * onglet, assemblée à la requête — cf. `ui-serve.ts`) : voir d'abord ce qui
 * demande une action (le tableau de bord, qui ne fait que lire), mettre à jour
 * un code promo ou une bannière, déposer une 4-comic, ajouter une vidéo, régler
 * les rangs, éditer les recos d'équipement d'un perso, écrire un message
 * Discord que le bot poste, curer un nom court ou des alias de recherche, curer
 * un effet (son nom, sa description, son icône, sa famille — ou en créer un),
 * tenir la fiche d'un perso (rangs, rôle, paliers, priorité de skills, tags), tenir
 * le journal du site (le changelog, par gabarits), lire une table brute du jeu
 * (« Tables du jeu »). Tous committent, sauf le message Discord et les deux
 * écrans qui ne font que lire (le tableau de bord, les tables du jeu) ;
 * « Pousser », dans l'en-tête, pousse `main`. Et, à chaque patch du jeu, la
 * chaîne des données — rafraîchir, relire la promotion, promouvoir,
 * committer —, lancée de la section « Patch », sa
 * sortie à l'écran (cf. `patch.ts`).
 * Rien d'autre. Le panneau admin complet reste la référence pour tout le reste
 * — il exige `pnpm dev`, donc un `clean:all` et un refresh complet des données
 * du jeu, ce qui n'a aucun sens pour changer quatre lignes de JSON.
 *
 * PAS de Next, pas de build, pas de dépendance ajoutée : `node:http` sert une
 * page statique et quelques JSON, la logique vit dans `actions.ts` qui rappelle
 * les stores de l'admin. Démarrage ~1 s.
 *
 * `.env.local` est chargé à la main (tsx ne le fait pas, contrairement à Next) :
 * sans R2_* la publication des codes promo et des bannières est sautée, sans
 * YOUTUBE_API_KEY l'onglet vidéos ne résout plus les métadonnées, sans DISCORD_BOT_TOKEN
 * l'onglet Discord rédige et prévisualise mais n'envoie pas, et n'importe pas
 * les anciens résumés (cf. `discord.ts`), sans DEEPL_API_KEY ni ANTHROPIC_API_KEY
 * « Traduire » (Gear reco, Journal du site) répond qu'il n'a pas de clé.
 *
 * DÉJÀ LANCÉ : le port est tenu par l'instance précédente, on se contente
 * d'ouvrir le navigateur dessus. Double-cliquer l'icône deux fois ne crée donc
 * pas deux serveurs.
 */
// EN PREMIER, avant tout import qui tirerait l'admin : cf. `env.ts`.
import './env';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { hostname } from 'node:os';
import { dirname, extname, resolve } from 'node:path';
import { loadEnvLocal } from '@datagen/lib/env';
import {
  BANNERS_DEPS,
  CHANGELOG_DEPS,
  CHANGELOG_DISK,
  CHARACTER_SHEET_DEPS,
  EFFECTS_DEPS,
  GAME_TABLES_DISK,
  GEAR_RECO_DEPS,
  NAMES_DEPS,
  TRANSLATE_DEPS,
  addComics,
  addVideo,
  bannersState,
  changelogState,
  characterRoster,
  characterSheetState,
  currentCoupons,
  dashboardState,
  effectNewId,
  effectsSearch,
  effectsState,
  fillChangelogTemplate,
  fitNames,
  gameTableSchema,
  gameTablesState,
  gearRecoState,
  gitState,
  namesState,
  parseTarget,
  previewChangelogEntry,
  previewGearBuilds,
  previewInline,
  pushMain,
  queryGameTable,
  rankState,
  rewardOptions,
  saveBannerList,
  saveChangelogList,
  saveCharacterSheet,
  saveCouponList,
  saveEffects,
  saveGearReco,
  saveNames,
  saveRanks,
  searchRewards,
  searchVideos,
  translateNotes,
  videoTargets,
  type CharacterSheetChanges,
  type ComicBatch,
  type EffectChange,
  type GitState,
  type NameChange,
  type Outcome,
  type RankChange,
  type Report,
} from './actions';
import {
  REQUEST_BUDGET,
  REQUEST_EXAMPLES,
  REQUEST_EXAMPLES_MAX,
  discordSession,
  draftRequest,
  embedForm,
  embedTemplate,
  historyState,
  latestNotes,
  mergeHistory,
  noteSrcdoc,
  officialUrl,
  parseHistory,
  parsePalette,
  patchTemplate,
  requestExamples,
  requestNote,
  standardEmojis,
  type Draft,
  type HistoryFile,
  type Mode,
  type NotePost,
} from './discord';
import { COMIC_LANGS } from '@datagen/generators/comics';
import { QUICK_HOST, isAllowedOrigin, isAllowedRemote, parsePeers } from './lan';
import {
  busyError,
  busyRefusal,
  commitPlan,
  patchState,
  promotePlan,
  refreshPlan,
  runGesture,
  stopJob,
  type Planned,
} from './patch';
import { assemblePage, resolveUiFile } from './ui-serve';
import { childEnv, draftModel, proposeDraft, runClaude } from './claude-draft';
import { acquirePatchJob } from '@/lib/admin/patch-runner';
import { getCharacterListItems } from '@/lib/data/characters';
import type { Banner, PromoCode } from '@/lib/admin/promo-banner-store';
import type { GearBuild } from '@contracts';

// Les stores lisent `process.env` (écrits pour Next, qui charge .env.local seul).
for (const [k, v] of Object.entries(loadEnvLocal())) process.env[k] ??= v;

const PORT = Number(process.env.QUICK_PORT ?? 4747);
/**
 * Les postes de dev (`DEV_PEERS`, cf. scripts/dev-caddy.mjs). Déclarés, quick
 * écoute sur le réseau pour que le Caddy de l'autre PC le relaie ; sinon il
 * reste sur la boucle locale. Les gardes sont dans `lan.ts`.
 */
const PEERS = parsePeers(process.env.DEV_PEERS);
/** La page : `index.html`, `tabs/<onglet>.html`, et ce que `GET /ui/…` sert. */
const UI = resolve(import.meta.dirname, 'ui');
/** Les outils d'édition de l'onglet Discord : un module que la page importe tel quel. */
const EDITOR = resolve(import.meta.dirname, 'discord-editor.mjs');
/** La palette d'emojis de l'onglet Discord, retouchée à la main. */
const PALETTE = resolve(import.meta.dirname, 'discord-palette.json');

/** Relue à chaque état, comme la page : la retoucher et rafraîchir suffit. */
function palette(): ReturnType<typeof parsePalette> {
  try {
    return parsePalette(JSON.parse(readFileSync(PALETTE, 'utf8')));
  } catch (e: unknown) {
    return { groups: [], error: `discord-palette.json illisible : ${String(e)}` };
  }
}

/**
 * Les consignes de « copier la demande », relues à chaque clic : un fichier
 * versionné que Sevih retouche à la main.
 */
const PROMPT = resolve(import.meta.dirname, 'discord-prompt.md');
/**
 * Les anciens résumés importés de Discord, appariés à leur note — donnée
 * LOCALE (`.quick/` est hors de git) : ni jeton ni rien d'autre que ces paires.
 */
const HISTORY = resolve('.quick/discord-history.json');

/** Absent ou illisible : pas d'historique — un nouvel import le refait. */
function readHistory(): HistoryFile | null {
  try {
    return parseHistory(JSON.parse(readFileSync(HISTORY, 'utf8')));
  } catch {
    return null;
  }
}

/**
 * Écrit à côté puis RENOMME (atomique sur un même disque) : une coupure en
 * cours d'écriture ne laisse pas un historique tronqué à la place du bon.
 */
function writeHistory(history: HistoryFile): void {
  mkdirSync(dirname(HISTORY), { recursive: true });
  const tmp = `${HISTORY}.${process.pid}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(history, null, 2)}\n`);
  renameSync(tmp, HISTORY);
}

// Le jeton du bot reste dans cet objet : aucune route ne le renvoie. Le
// serveur de `DISCORD_GUILD_ID` n'est que celui proposé au premier lancement.
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

const mode = (v: unknown): Mode => (v === 'embed' ? 'embed' : 'simple');

/**
 * Ce que la page joint à CHAQUE demande de l'onglet Discord : le texte, le mode
 * et son formulaire, le serveur où poster, les serveurs dont on prend les emojis.
 */
const draft = (b: Record<string, unknown>): Draft => ({
  text: String(b.text ?? ''),
  mode: mode(b.mode),
  embed: embedForm(b.embed),
  guildId: String(b.guildId ?? ''),
  emojiGuilds: strings(b.emojiGuilds),
});

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
 * poussées R2, purge d'edge, commit git) et leur journal existait déjà — mais
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

/**
 * Ce que rend un geste qui committe (et « Pousser »), avec l'état de git APRÈS
 * lui : la page y lit le compte du bouton « Pousser », sans rien redemander.
 * Joint même à un échec — un lot de rangs à moitié refusé a committé le reste.
 */
async function withGit<T extends Outcome>(run: T | Promise<T>): Promise<T & { git: GitState }> {
  return { ...(await run), git: gitState() };
}

/**
 * Un geste de la section « Patch » : un plan refusé répond 400, un travail déjà
 * en cours 409 — rien n'est lancé. Sinon la commande part, chaque ligne de sa
 * sortie est un `step` du flux, et `done` porte son issue (avec l'état de git
 * quand `git` : le commit, pour le compte de « Pousser »).
 */
async function patchGesture(res: ServerResponse, plan: Planned, git = false): Promise<void> {
  if ('error' in plan) return json(res, { ok: false, log: [plan.error] }, 400);
  const busy = busyRefusal();
  if (busy) return json(res, busy, 409);
  await stream(res, (report) => {
    const run = runGesture(plan, report);
    return git ? withGit(run) : run;
  });
}

interface RequestBody {
  noteId?: unknown;
  examples?: unknown;
}

/** La demande de premier jet pour une note : consignes, exemples, note, gabarit. */
async function requestFor(b: RequestBody) {
  const posts = await patchPosts();
  const post = posts.find((p) => p.lang === 'en' && String(p.id) === String(b.noteId ?? ''));
  if (!post) return { error: 'note inconnue', status: 404 };
  let instructions: string;
  try {
    instructions = readFileSync(PROMPT, 'utf8');
  } catch (e: unknown) {
    return { error: `scripts/quick/discord-prompt.md illisible : ${String(e)}`, status: 500 };
  }
  const wanted = Number.isInteger(b.examples)
    ? Math.min(REQUEST_EXAMPLES_MAX, Math.max(0, Number(b.examples)))
    : REQUEST_EXAMPLES;
  const history = readHistory();
  const state = historyState(history);
  return {
    ...draftRequest({
      instructions,
      examples: requestExamples(history, posts, wanted, String(post.id)),
      note: requestNote(post),
      template: patchTemplate(officialUrl(post)),
    }),
    wanted,
    budget: REQUEST_BUDGET,
    // De quoi dire POURQUOI il n'y a pas d'exemple, le cas échéant.
    summaries: state.count,
    paired: state.paired,
  };
}

async function route(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);

  if (req.method === 'GET' && url.pathname === '/') {
    // Relu et assemblé à chaque requête : éditer l'UI et rafraîchir suffit, pas
    // de redémarrage.
    const page = assemblePage(readFileSync(resolve(UI, 'index.html'), 'utf8'), (tab) => {
      const file = resolve(UI, 'tabs', `${tab}.html`);
      return existsSync(file) ? readFileSync(file, 'utf8') : null;
    });
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(page);
    return;
  }

  if (req.method === 'GET' && url.pathname.startsWith('/ui/')) {
    // Styles et modules de la page. `no-store`, comme l'éditeur ci-dessous :
    // rafraîchir doit suffire là aussi.
    const hit = resolveUiFile(UI, url.pathname.slice('/ui/'.length));
    if (!hit || !statSync(hit.file, { throwIfNoEntry: false })?.isFile())
      return json(res, { error: 'fichier inconnu' }, 404);
    res.writeHead(200, { 'content-type': hit.type, 'cache-control': 'no-store' });
    res.end(readFileSync(hit.file));
    return;
  }

  if (req.method === 'GET' && url.pathname === '/discord-editor.mjs') {
    // Relu à chaque requête, comme la page ; `no-store` : un module est mis en
    // cache par son adresse, et rafraîchir doit suffire là aussi.
    res.writeHead(200, {
      'content-type': 'text/javascript; charset=utf-8',
      'cache-control': 'no-store',
    });
    res.end(readFileSync(EDITOR, 'utf8'));
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
      // Plusieurs BD partent dans UN corps : la page refuse d'elle-même ce que
      // `body` couperait.
      maxUpload: MAX_BODY,
      targets: videoTargets(),
      hasYoutubeKey: Boolean(process.env.YOUTUBE_API_KEY),
      hasR2: Boolean(process.env.R2_BUCKET),
      hasDiscord: Boolean(process.env.DISCORD_BOT_TOKEN),
      // L'en-tête de la page : le poste qui sert, son port, et d'où viennent
      // les images (icônes d'items, d'éléments, de classes, portraits).
      host: hostname(),
      port: PORT,
      imgBase: IMG_BASE,
      // Le bouton « Pousser » : la branche et ses commits en attente.
      git: gitState(),
    });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/git') {
    // L'état de git seul, sans attendre R2 comme `/api/state` — et sans réseau.
    json(res, gitState());
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/dashboard') {
    // L'accueil : l'inbox de l'admin, git, la version du jeu, les échéances.
    // Relu à chaque appel ; un bloc illisible est `null` avec sa raison dans
    // `errors`, les autres sont servis — pas un 500.
    json(res, await dashboardState());
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/push') {
    // « Pousser » : le seul geste qui pousse. Les enregistrements committent
    // (`commitPaths`), celui-ci envoie ce qui attend — et lance la CI. Sous le
    // verrou de la section « Patch » : pousser pendant une promotion ou un
    // commit serait un non-sens.
    const release = acquirePatchJob('git push');
    if (!release) return json(res, { ok: false, error: busyError() }, 409);
    try {
      await stream(res, (report) => withGit(pushMain(report)));
    } finally {
      release();
    }
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/patch/state') {
    // Ce que la section « Patch » montre au repos : le travail en cours, la
    // source, les versions, la reprise qui attend, le dépôt. Relu à chaque appel.
    json(res, patchState());
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/patch/refresh') {
    // `pnpm datagen:patch` : pull, dump si le code a changé, extract, build,
    // promote en DRY. Jamais `--apply` par ici (cf. `refreshPlan`).
    await patchGesture(res, refreshPlan(await body<unknown>(req).catch(() => null)));
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/patch/promote') {
    // `{ apply: false }` : le dry-run, la revue ; `{ apply: true }` : la promotion.
    await patchGesture(res, promotePlan(await body<unknown>(req).catch(() => null)));
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/patch/commit') {
    // `pnpm commit --no-push` : contrôles, bump, images sur R2, commit LOCAL.
    await patchGesture(res, commitPlan(await body<unknown>(req).catch(() => null)), true);
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/patch/stop') {
    // « Arrêter » : SIGTERM au travail lancé d'ici. Le flux du geste se clôt seul.
    const out = stopJob();
    json(res, out, out.ok ? 200 : 409);
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/coupons') {
    const { list, etag } = await body<{ list: PromoCode[]; etag: string | null }>(req);
    if (!etag)
      return json(res, { ok: false, log: ['Liste non chargée depuis R2 : recharger.'] }, 409);
    await stream(res, (report) => withGit(saveCouponList(list, etag, report)));
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/banners/state') {
    // Lu du disque à chaque appel, comme les rangs : `banner.json`, le jour UTC,
    // le roster, et ce que la table du jeu sait de plus (`game` à `null` et
    // `gameError` quand `.gamedata/parsed/` n'a pas la table — pas un 500).
    json(res, bannersState());
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/banners') {
    // La liste est l'ÉTAT COMPLET, comme dans l'admin ; `changed` nomme les
    // bannières qui ont bougé, pour le message de commit.
    const { list, changed } = await body<{ list: Banner[]; changed?: unknown }>(req);
    await stream(res, (report) =>
      withGit(saveBannerList(list, strings(changed), BANNERS_DEPS, report)),
    );
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/changelog/state') {
    // Lu du disque à chaque appel, comme les bannières : `changelog.json`, le
    // jour UTC, le roster, les gabarits et les libellés des types et des liens.
    json(res, changelogState());
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/changelog/fill') {
    // Un gabarit rempli (`?template=update&guide=…`, `?template=character&character=<id>`) :
    // de quoi poser une entrée en tête de liste. Rien ne s'écrit ; un gabarit
    // ou un perso inconnu : 400 `{ error }`.
    const { template, ...values } = Object.fromEntries(url.searchParams);
    const out = fillChangelogTemplate(template, values, CHANGELOG_DISK.today());
    json(res, out, 'error' in out ? 400 : 200);
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/changelog/preview') {
    // L'aperçu : une entrée en cours d'édition, rendue comme la page
    // `/changelog` la montrera, dans la langue demandée. Rien ne s'écrit. Un
    // corps illisible ou un type inconnu : 400 `{ error }`, que le bloc affiche.
    const b = await body<{ entry?: unknown; lang?: unknown } | null>(req).catch(() => null);
    const out = await previewChangelogEntry(b?.entry, b?.lang);
    json(res, out, 'error' in out ? 400 : 200);
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/changelog') {
    // La liste est l'ÉTAT COMPLET, comme dans l'admin ; `changed` porte les
    // titres des entrées qui ont bougé, pour le message de commit. Pas de R2 :
    // le site lit le fichier au build.
    const { list, changed } = await body<{ list?: unknown; changed?: unknown }>(req);
    await stream(res, (report) =>
      withGit(saveChangelogList(list, strings(changed), CHANGELOG_DEPS, report)),
    );
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/comics') {
    const { batches } = await body<{ batches: ComicBatch[] }>(req);
    await stream(res, (report) => withGit(addComics(batches, report)));
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
    await stream(res, (report) => withGit(addVideo(parsed, input, label, report)));
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/ranks') {
    // À part de `/api/state` : celui-ci attend R2 (les codes promo), et l'onglet
    // se recharge après chaque enregistrement — le disque fait foi.
    // La sous-classe du roster part avec chaque ligne : la table en montre l'icône.
    const ranks = rankState();
    const subClass = new Map(getCharacterListItems().map((c) => [c.id, c.subClass ?? '']));
    json(res, {
      ...ranks,
      rows: ranks.rows.map((row) => ({ ...row, subClass: subClass.get(row.id) ?? '' })),
    });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/ranks') {
    const { changes } = await body<{ changes: RankChange[] }>(req);
    await stream(res, (report) => withGit(saveRanks(changes, report)));
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/character/roster') {
    // Le roster de la « Fiche perso », pour son picker de héros : lu une fois
    // par la page, pas à chaque perso ouvert.
    json(res, characterRoster());
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/character/state') {
    // La fiche du perso de `?id=`, lue du disque à chaque appel : sa ligne du
    // roster, son entrée curée entière, ses rangs et les listes de leurs menus,
    // ce que les tags inline peuvent viser, son kit (cartes de skills, chips
    // masquées et ajoutées, catalogue des effets).
    const out = await characterSheetState(url.searchParams.get('id') ?? '');
    if ('error' in out) return json(res, { error: out.error }, 404);
    json(res, out);
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/character') {
    // UN enregistrement pour toute la fiche : les rangs par le plan de Rangs,
    // puis les champs hors rangs (pros / cons et synergies compris, leurs tags
    // inline contrôlés), puis les chips de skills, puis un commit au nom du perso.
    const { id, changes } = await body<{ id: string; changes: CharacterSheetChanges }>(req);
    await stream(res, (report) =>
      withGit(saveCharacterSheet(String(id ?? ''), changes, CHARACTER_SHEET_DEPS, report)),
    );
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/character/preview') {
    // L'aperçu des pros, des cons et des raisons de synergie en cours de
    // saisie : chaque texte en segments, tels que le site les rend dans la
    // langue demandée. Rien ne s'écrit. Un corps illisible ou une forme
    // fausse : 400 `{ error }`, que la page affiche.
    const b = await body<{ texts?: unknown; lang?: unknown } | null>(req).catch(() => null);
    const out = await previewInline(b?.texts, b?.lang);
    json(res, out, 'error' in out ? 400 : 200);
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/gear-reco/state') {
    // Lu du disque à chaque appel, comme les rangs : roster, presets, listes
    // des sélecteurs et icônes de stat (`statIcons`, pour l'aperçu), plus les
    // builds du perso de `?id=` quand il est donné.
    const id = url.searchParams.get('id') ?? undefined;
    const state = gearRecoState(id);
    if (id !== undefined && !state.roster.some((c) => c.id === id))
      return json(res, { error: `perso inconnu : ${id}` }, 404);
    json(res, state);
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/gear-reco') {
    const { id, builds } = await body<{ id: string; builds: GearBuild[] }>(req);
    await stream(res, (report) =>
      withGit(saveGearReco(String(id ?? ''), builds, GEAR_RECO_DEPS, report)),
    );
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/gear-reco/preview') {
    // L'aperçu : les builds en cours d'édition, résolus comme la fiche perso
    // les montrera, dans la langue demandée. Rien ne s'écrit. Un corps
    // illisible ou une forme fausse : 400 `{ error }`, que le bloc affiche —
    // jamais le 500 du `catch` de `createServer`.
    const b = await body<{ builds?: unknown; lang?: unknown } | null>(req).catch(() => null);
    const out = await previewGearBuilds(b?.builds, b?.lang);
    json(res, out, 'error' in out ? 400 : 200);
    return;
  }

  if (
    req.method === 'POST' &&
    (url.pathname === '/api/translate' || url.pathname === '/api/gear-reco/translate')
  ) {
    // « Traduire » : des textes anglais vers les cinq autres langues, d'UN
    // appel — les notes d'un perso (Gear reco, sous son adresse d'origine, qui
    // reste), le titre et les puces d'une entrée du journal. Rien ne s'écrit
    // ici — la page pose le résultat dans son modèle, « Enregistrer » fait le
    // reste. Sans clé ou sur un refus du moteur : `{ error }`, que le bouton
    // affiche.
    const { texts } = await body<{ texts?: unknown }>(req);
    const out = await translateNotes(strings(texts), TRANSLATE_DEPS);
    json(res, out, 'error' in out ? 500 : 200);
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/gamedata/tables') {
    // Le catalogue de `.gamedata/parsed/` et, par table, qui la lit. L'usage est
    // calculé une fois par processus ; `?recompute=1` (« Recalculer ») relit
    // les sources. Sans données du jeu : liste vide et `error`, pas un 500.
    json(res, gameTablesState(GAME_TABLES_DISK, url.searchParams.has('recompute')));
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/gamedata/table') {
    // Une page d'une table brute (`?name=&q=&col=&exact=&page=&resolve=`) : la
    // recherche et la pagination de l'admin, au serveur. Nom invalide : 400 ;
    // table inconnue : 404.
    const { name = '', ...query } = Object.fromEntries(url.searchParams);
    const out = queryGameTable(name, query);
    if ('error' in out) return json(res, { error: out.error }, out.status);
    json(res, out);
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/gamedata/schema') {
    // Le schéma effectif d'une table et ses liens croisés, sans ses lignes.
    const out = gameTableSchema(url.searchParams.get('name') ?? '');
    if ('error' in out) return json(res, { error: out.error }, out.status);
    json(res, out);
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/names/state') {
    // Lu du disque à chaque appel, comme les rangs : le roster, ses noms, son
    // nom court, ses alias, et le verdict « déborde » du site, par langue.
    json(res, namesState());
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/names/fit') {
    // Le verdict en direct de la saisie : la règle du site, rien ne s'écrit.
    const b = await body<{ texts?: unknown } | null>(req).catch(() => null);
    json(res, fitNames(b?.texts));
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/names') {
    const { changes } = await body<{ changes: NameChange[] }>(req);
    await stream(res, (report) => withGit(saveNames(changes, NAMES_DEPS, report)));
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/effects/state') {
    // Lu du disque à chaque appel, comme les noms : le catalogue des effets
    // tel que l'admin le range (paires buff ↔ debuff, orphelins), l'extrait et
    // l'entrée curée de chacun, les familles, les langues, le dossier d'icônes.
    json(res, effectsState());
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/effects/search') {
    // La recherche (`?q=`) : la règle de l'admin, jouée au serveur. Par effet
    // qui répond, le champ qui a répondu. Rien ne s'écrit.
    json(res, effectsSearch(url.searchParams.get('q')));
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/effects/id') {
    // « ＋ effet » : l'id que donnerait la saisie (`?raw=`), et s'il est pris.
    json(res, effectNewId(url.searchParams.get('raw')));
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/effects') {
    // Un lot d'entrées curées (une création = `create`, sur un id nouveau) :
    // le store de l'admin par effet, puis un commit du fichier curé.
    const { changes } = await body<{ changes: EffectChange[] }>(req);
    await stream(res, (report) => withGit(saveEffects(changes, EFFECTS_DEPS, report)));
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/discord/state') {
    // `?reload=1` : le bouton « recharger la liste » — tout ce qui a été lu de
    // Discord est oublié et relu.
    json(res, {
      ...(await discord.state(url.searchParams.has('reload'))),
      notes: latestNotes(await patchPosts()),
      standard: standardEmojis(),
      palette: palette(),
      history: historyState(readHistory()),
      requestExamples: { default: REQUEST_EXAMPLES, max: REQUEST_EXAMPLES_MAX },
    });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/discord/channels') {
    json(res, await discord.channels(url.searchParams.get('guild') ?? ''));
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/discord/emojis') {
    // Les emojis des serveurs COCHÉS, et d'eux seuls ; chacun lu une fois.
    const { guilds } = await body<{ guilds?: unknown }>(req);
    json(res, await discord.emojis(strings(guilds)));
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/discord/note') {
    const id = url.searchParams.get('id');
    const post = (await patchPosts()).find((p) => p.lang === 'en' && String(p.id) === id);
    if (!post) return json(res, { error: 'note inconnue' }, 404);
    const link = officialUrl(post);
    json(res, {
      url: link,
      srcdoc: noteSrcdoc(post.content),
      template: patchTemplate(link),
      embedTemplate: embedTemplate(link),
    });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/discord/history') {
    // L'état lu dans le fichier : rien n'est demandé à Discord.
    json(res, historyState(readHistory()));
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/discord/history') {
    // « importer mes anciens résumés » : LIT l'historique du salon choisi, et
    // n'écrit que `.quick/discord-history.json`.
    const b = await body<Record<string, unknown>>(req);
    const posts = await patchPosts();
    await stream(res, async (report) => {
      const out = await discord.history(
        { guildId: String(b.guildId ?? ''), channelId: String(b.channelId ?? '') },
        posts,
        report,
      );
      if (!out.history) return { ok: out.ok, log: out.log };
      const merged = mergeHistory(readHistory(), out.history);
      writeHistory(merged);
      const written = `écrit dans .quick/discord-history.json — ${merged.summaries.length} résumé(s) en tout.`;
      report(written);
      return { ok: true, log: [...out.log, written], history: historyState(merged) };
    });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/discord/request') {
    // « copier la demande » : le texte à coller dans claude.ai. Tout vient du
    // disque — consignes, historique, notes — et RIEN ne part sur le réseau.
    const r = await requestFor(await body<RequestBody>(req));
    json(res, 'error' in r ? { error: r.error } : r, 'error' in r ? r.status : 200);
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/discord/draft') {
    // « proposer un brouillon » : la MÊME demande, donnée à Claude Code lancé
    // sans fenêtre, sous l'abonnement de Sevih (cf. `claude-draft.ts`).
    const r = await requestFor(await body<RequestBody>(req));
    if ('error' in r) return json(res, { ok: false, log: [r.error] }, r.status);
    const model = draftModel(process.env.QUICK_DRAFT_MODEL);
    const env = childEnv(process.env, Object.keys(loadEnvLocal()));
    await stream(res, (report) =>
      proposeDraft(r.text, { run: (prompt) => runClaude(prompt, { model, env }), model }, report),
    );
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
    json(res, discord.preview(draft(await body<Record<string, unknown>>(req))));
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/discord/send') {
    const b = await body<Record<string, unknown>>(req);
    await stream(res, (report) =>
      discord.send(
        {
          ...draft(b),
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
    const posted = (b.posted && typeof b.posted === 'object' ? b.posted : {}) as Record<
      string,
      unknown
    >;
    await stream(res, (report) =>
      discord.edit(
        {
          ...draft(b),
          channelId: String(b.channelId ?? ''),
          suppressEmbeds: b.suppressEmbeds !== false,
          ids: strings(b.ids),
          // Où et comment le message est parti : la page l'a gardé à l'envoi.
          posted: {
            guildId: String(posted.guildId ?? ''),
            channelId: String(posted.channelId ?? ''),
            mode: mode(posted.mode),
          },
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
  if (!isAllowedRemote(req.socket.remoteAddress, PEERS)) {
    json(
      res,
      { ok: false, log: ['adresse refusée : quick ne répond qu’aux postes de DEV_PEERS'] },
      403,
    );
    return;
  }
  if (req.method !== 'GET' && !isAllowedOrigin(req.headers.origin, PORT)) {
    json(
      res,
      { ok: false, log: ['origine refusée : cette requête ne vient pas de la page de quick'] },
      403,
    );
    return;
  }
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

server.listen(PORT, PEERS.length ? '0.0.0.0' : '127.0.0.1', () => {
  console.log(`quick → http://localhost:${PORT}/`);
  if (PEERS.length)
    console.log(`        https://${QUICK_HOST}/ depuis les deux PC (${PEERS.join(', ')})`);
  if (!process.argv.includes('--no-open')) openBrowser();
});
