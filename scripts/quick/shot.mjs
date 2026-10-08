/**
 * quick/shot — le banc de captures de la page de quick : un PNG par onglet.
 *
 *   node scripts/quick/shot.mjs
 *   node scripts/quick/shot.mjs --port 4799 --tabs coupons,ranks --out /tmp/quick-shots/avant
 *
 * Options : `--port 4747` (le quick à photographier), `--tabs a,b` (défaut :
 * tous ceux du menu), `--out <dossier>` (défaut `<tmp>/quick-shots/<horodatage>/`),
 * `--size 1440x1000`, `--settle 2500` (ms laissées aux `fetch` de la page),
 * `--hash <fragment>` (posé tel quel derrière l'adresse : un onglet qui lit son
 * hash s'ouvre sur un état précis, ex. `--tabs gear --hash gear/2000095`).
 *
 * POURQUOI. Un agent qui retouche l'interface ne regarde pas l'écran : ce script
 * est son œil. Il suppose un quick DÉJÀ lancé — à part, sans jeton ni poste
 * déclaré : `DISCORD_BOT_TOKEN= DEV_PEERS= QUICK_PORT=4799 pnpm quick --no-open`.
 *
 * COMMENT. Firefox sans tête prend sa capture à l'événement `load`, donc AVANT
 * que la page ait reçu ses données : tables et listes seraient vides. Un petit
 * relais HTTP local se met entre les deux. Il transmet tout à quick, sauf la
 * page, qu'il sert après deux retouches (`openTab`) :
 *
 *   - l'onglet demandé est ouvert DANS LE HTML (`hidden` des sections) — aucun
 *     clic à simuler : `lib.js` ouvre au démarrage la section que le HTML
 *     laisse visible, et pose le menu d'après elle ;
 *   - une image `/__settle?ms=…` est posée avant `</body>`. Le relais n'y
 *     répond qu'après le délai : `load` attend les images, la capture aussi.
 *
 * RIEN NE S'ÉCRIT PAR ICI. Chaque enregistrement de quick committe, et son
 * bouton « Pousser » pousse `main` : le relais ne laisse passer que les
 * lectures (`GET`, et les `POST` qui ne font que lire, cf. `READ_ONLY_POSTS`)
 * et refuse le reste lui-même — `POST /api/push` compris.
 *
 * Du `.mjs` sans dépendance, lancé par `node`, typé par JSDoc (`checkJs` de
 * `scripts/tsconfig.json`). Le relais et Firefox sont arrêtés par leur
 * poignée, jamais par un `pkill -f` (il tue le shell qui le tape).
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { createServer, request } from 'node:http';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';

const SCRIPT = resolve(import.meta.dirname, 'shot.mjs');
const FIREFOX = process.env.FIREFOX_BIN || 'firefox';
/** Une capture qui n'aboutit pas en une minute n'aboutira pas. */
const SHOT_TIMEOUT = 60_000;
/** GIF transparent d'un pixel : la réponse, différée, de `/__settle`. */
const PIXEL = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
/**
 * Les `POST` que la page émet en se chargeant et qui ne font que LIRE (l'aperçu
 * du brouillon, les emojis des serveurs cochés, l'aperçu des builds d'un
 * perso, le verdict « déborde » d'un nom court saisi). Sans eux l'onglet
 * Discord serait photographié sur une erreur, et les cartes de Gear reco sur
 * un aperçu refusé.
 */
export const READ_ONLY_POSTS = new Set([
  '/api/discord/preview',
  '/api/discord/emojis',
  '/api/gear-reco/preview',
  '/api/names/fit',
]);

const SECTION = /<section id="tab-([a-z0-9-]+)"(?: hidden)?>/g;

/**
 * Les onglets de la page — ses sections, dans l'ordre.
 * @param {string} html
 */
export function tabsOf(html) {
  return [...html.matchAll(SECTION)].map((m) => m[1]);
}

/**
 * La page, avec l'onglet `tab` ouvert et l'image d'attente posée.
 * @param {string} html
 * @param {string} tab
 * @param {number} settle Délai en ms avant que `load` puisse partir.
 */
export function openTab(html, tab, settle) {
  if (!tabsOf(html).includes(tab)) throw new Error(`onglet inconnu : « ${tab} »`);
  if (!html.includes('</body>')) throw new Error('page sans </body> : rien où poser l’attente');
  return html
    .replace(SECTION, (_, name) => `<section id="tab-${name}"${name === tab ? '' : ' hidden'}>`)
    .replace('</body>', `<img src="/__settle?ms=${settle}" alt="" hidden />\n</body>`);
}

/**
 * La page telle que quick la sert. Une chaîne vide si rien ne répond.
 * @param {number} port
 */
async function quickPage(port) {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/`, { signal: AbortSignal.timeout(5000) });
    return res.ok ? await res.text() : '';
  } catch {
    return '';
  }
}

/**
 * Le relais : la page retouchée, l'image d'attente, et le reste transmis à quick.
 * @param {number} port Le port de quick.
 * @param {number} settle
 */
function relay(port, settle) {
  return createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1');

    if (req.method === 'GET' && url.pathname === '/') {
      quickPage(port).then(
        (html) => {
          try {
            const page = openTab(html, url.searchParams.get('tab') ?? '', settle);
            res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
            res.end(page);
          } catch (e) {
            res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
            res.end(String(e));
          }
        },
        () => res.destroy(),
      );
      return;
    }

    if (req.method === 'GET' && url.pathname === '/__settle') {
      const ms = Number(url.searchParams.get('ms')) || 0;
      setTimeout(() => {
        res.writeHead(200, { 'content-type': 'image/gif', 'cache-control': 'no-store' });
        res.end(PIXEL);
      }, ms);
      return;
    }

    if (req.method !== 'GET' && !READ_ONLY_POSTS.has(url.pathname)) {
      res.writeHead(403, { 'content-type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: false, log: ['banc de captures : lecture seule'] }));
      return;
    }

    // `Origin` porterait l'adresse du relais, que quick refuse (cf. `lan.ts`).
    // Sans lui, la requête est celle d'un outil local — ce qu'est ce relais.
    const headers = { ...req.headers };
    delete headers.origin;
    const up = request(
      { host: '127.0.0.1', port, method: req.method, path: req.url, headers },
      (r) => {
        res.writeHead(r.statusCode ?? 502, r.headers);
        r.pipe(res);
      },
    );
    up.on('error', () => res.destroy());
    req.pipe(up);
  });
}

/**
 * Lance Firefox sans tête sur `url` et attend son PNG. Profil JETABLE : un
 * profil déjà ouvert ailleurs (le Firefox de tous les jours) refuse de démarrer.
 * @param {{ url: string, file: string, profile: string, width: number, height: number }} shot
 * @returns {Promise<string | null>} `null` si la capture est là, sinon ce qui a manqué.
 */
function capture({ url, file, profile, width, height }) {
  return new Promise((done) => {
    mkdirSync(profile, { recursive: true });
    rmSync(file, { force: true });
    const child = spawn(
      FIREFOX,
      [
        '--headless',
        '--profile',
        profile,
        `--window-size=${width},${height}`,
        '--screenshot',
        file,
        url,
      ],
      { stdio: 'ignore' },
    );
    const timer = setTimeout(() => child.kill('SIGKILL'), SHOT_TIMEOUT);
    child.on('error', (e) => {
      clearTimeout(timer);
      done(`${FIREFOX} ne se lance pas : ${e.message}`);
    });
    child.on('exit', (code, signal) => {
      clearTimeout(timer);
      done(
        existsSync(file)
          ? null
          : signal
            ? `Firefox arrêté après ${SHOT_TIMEOUT / 1000} s, sans capture`
            : `Firefox a rendu ${code}, sans capture`,
      );
    });
  });
}

async function main() {
  const { values } = parseArgs({
    options: {
      port: { type: 'string', default: '4747' },
      tabs: { type: 'string' },
      out: { type: 'string' },
      size: { type: 'string', default: '1440x1000' },
      settle: { type: 'string', default: '2500' },
      hash: { type: 'string' },
    },
  });
  const port = Number(values.port);
  const settle = Number(values.settle);
  const size = /^(\d+)x(\d+)$/.exec(values.size);
  if (!Number.isInteger(port) || !Number.isFinite(settle) || settle < 0 || !size)
    throw new Error(
      'options : --port 4747 --size 1440x1000 --settle 2500 --tabs a,b --hash <fragment> --out <dossier>',
    );

  const html = await quickPage(port);
  if (!html)
    throw new Error(
      `quick ne répond pas sur http://127.0.0.1:${port}/ — le lancer d'abord, à part :\n` +
        `  DISCORD_BOT_TOKEN= DEV_PEERS= QUICK_PORT=${port} pnpm quick --no-open`,
    );
  const known = tabsOf(html);
  const tabs = values.tabs ? values.tabs.split(',').filter(Boolean) : known;
  const unknown = tabs.filter((t) => !known.includes(t));
  if (unknown.length)
    throw new Error(`onglet inconnu : ${unknown.join(', ')} — la page a ${known.join(', ')}`);

  const stamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const out = resolve(values.out ?? join(tmpdir(), 'quick-shots', stamp));
  mkdirSync(out, { recursive: true });
  const profiles = mkdtempSync(join(tmpdir(), 'quick-shot-'));

  const server = relay(port, settle);
  await new Promise((ready) => server.listen(0, '127.0.0.1', () => ready(undefined)));
  const address = server.address();
  const relayPort = address && typeof address === 'object' ? address.port : 0;

  let failed = 0;
  try {
    // L'un après l'autre : six Firefox à la fois se disputeraient le serveur
    // local, et le délai d'attente ne voudrait plus rien dire.
    for (const tab of tabs) {
      const file = join(out, `${tab}.png`);
      const error = await capture({
        url: `http://127.0.0.1:${relayPort}/?tab=${tab}${values.hash ? `#${values.hash}` : ''}`,
        file,
        profile: join(profiles, tab),
        width: Number(size[1]),
        height: Number(size[2]),
      });
      if (error) failed++;
      console.log(error ? `✗ ${tab} — ${error}` : `✓ ${tab} → ${file}`);
    }
  } finally {
    server.closeAllConnections();
    server.close();
    rmSync(profiles, { recursive: true, force: true });
  }
  if (failed) throw new Error(`${failed} capture(s) manquante(s) sur ${tabs.length}`);
}

if (process.argv[1] && resolve(process.argv[1]) === SCRIPT)
  main().catch((e) => {
    console.error(e instanceof Error ? e.message : String(e));
    process.exit(1);
  });
