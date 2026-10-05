/**
 * dev-caddy — tient UN Caddy local en service sur ce poste, avec `Caddyfile.dev`.
 *
 *   node scripts/dev-caddy.mjs            (`pnpm dev:caddy`, et `pnpm dev`)
 *   node scripts/dev-caddy.mjs --install  (`pnpm dev:caddy:install`, une fois par PC)
 *
 * DEUX PC, UN SERVEUR. Le fixe et le portable ont chacun leurs hosts
 * (`*.outerpedia.local` → 127.0.0.1) et leur Caddy, avec SA propre CA. Le
 * Caddyfile vise d'abord le serveur local (Next, quick), puis celui de l'autre
 * PC : celui qui lance `pnpm dev` ou `pnpm quick` sert donc les deux, sans DNS
 * ni certificat à partager. Encore faut-il qu'un Caddy tourne sur le PC qui
 * REGARDE, où rien n'est lancé — d'où `--install`, qui le démarre à l'ouverture
 * de session.
 *
 * Ce script ne lance donc JAMAIS un second Caddy : si l'un répond déjà (le
 * service de session, ou un autre `pnpm dev`), il lui fait relire la config du
 * dépôt (`caddy reload`) puis attend ; quand il disparaît, il prend le relais.
 * Les deux lanceurs (service et `pnpm dev`) se passent ainsi la main seuls.
 *
 * L'autre PC se déclare dans `.env.local`, par `DEV_PEERS` : les adresses des
 * DEUX postes, la même ligne partout — chacun retire les siennes. Sans elle,
 * Caddy ne sert que le serveur local, comme avant.
 *
 * Du `.mjs` sans dépendance, lancé par `node` : `pnpm dev` commence par
 * supprimer `node_modules` (`clean:all`), un service qui passerait par tsx
 * ne redémarrerait pas pendant ce temps.
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir, networkInterfaces } from 'node:os';
import { resolve } from 'node:path';

const repo = resolve(import.meta.dirname, '..');
const SCRIPT = resolve(repo, 'scripts/dev-caddy.mjs');
/** L'API d'admin de Caddy, sur son adresse par défaut : elle dit si un Caddy tourne. */
const ADMIN = 'http://127.0.0.1:2019/config/';

/** `.env.local`, parse minimal KEY=VALUE (cf. datagen/lib/env.ts) ; `process.env` prime. */
function envLocal() {
  /** @type {Record<string, string>} */
  const out = {};
  const path = resolve(repo, '.env.local');
  if (!existsSync(path)) return out;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.trim().match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].trim().replace(/^(["'])(.*)\1$/, '$2');
  }
  return out;
}

/**
 * Les adresses de l'AUTRE poste : `DEV_PEERS` moins celles de cette machine.
 * @param {string | undefined} devPeers
 * @param {string[]} ownAddresses
 */
export function peersOf(devPeers, ownAddresses) {
  const own = new Set(ownAddresses);
  return (devPeers ?? '').split(/[\s,]+/).filter((a) => a && !own.has(a));
}

function ownAddresses() {
  return Object.values(networkInterfaces())
    .flatMap((list) => list ?? [])
    .filter((i) => i.family === 'IPv4')
    .map((i) => i.address);
}

/** L'environnement passé à Caddy : les amonts de l'autre PC, lus par le Caddyfile. */
function caddyEnv() {
  const env = { ...envLocal(), ...process.env };
  const peers = peersOf(env.DEV_PEERS, ownAddresses());
  /** @param {string | number} port */
  const upstreams = (port) => peers.map((p) => `${p}:${port}`).join(' ');
  return {
    peers,
    env: {
      ...process.env,
      OUTERPEDIA_PEERS: upstreams(env.OUTERPEDIA_PORT ?? 3000),
      QUICK_PEERS: upstreams(env.QUICK_PORT ?? 4747),
    },
  };
}

async function caddyUp() {
  try {
    return (await fetch(ADMIN, { signal: AbortSignal.timeout(800) })).ok;
  } catch {
    return false;
  }
}

/** @param {number} ms */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** @type {import('node:child_process').ChildProcess | null} */
let child = null;
let stopping = false;
for (const signal of /** @type {const} */ (['SIGINT', 'SIGTERM'])) {
  process.on(signal, () => {
    stopping = true;
    if (child) child.kill(signal);
    else process.exit(0);
  });
}

/**
 * `caddy run`, jusqu'à sa sortie. Rend la durée de vie, en ms.
 * @param {NodeJS.ProcessEnv} env
 * @returns {Promise<number>}
 */
function run(env) {
  const started = Date.now();
  return new Promise((done) => {
    const proc = spawn('caddy', ['run', '--config', 'Caddyfile.dev'], {
      cwd: repo,
      env,
      stdio: 'inherit',
    });
    child = proc;
    proc.on('error', (e) => {
      console.error(`caddy introuvable ou illançable : ${e.message}`);
      process.exit(1);
    });
    proc.on('exit', () => {
      child = null;
      done(Date.now() - started);
    });
  });
}

async function serve() {
  const { peers, env } = caddyEnv();
  console.log(
    peers.length
      ? `autre PC : ${peers.join(', ')} — servi d'ici si ce poste ne lance rien`
      : 'DEV_PEERS absent de .env.local : Caddy ne sert que ce poste',
  );
  let quickFailures = 0;
  for (;;) {
    if (await caddyUp()) {
      // Un Caddy tient déjà le poste : il relit la config du dépôt, et on attend.
      const res = spawnSync('caddy', ['reload', '--config', 'Caddyfile.dev'], {
        cwd: repo,
        env,
        encoding: 'utf8',
      });
      console.log(
        res.status === 0
          ? 'Caddy déjà en service sur ce poste — config relue, rien à lancer'
          : `Caddy déjà en service, mais la relecture a échoué :\n${res.stderr}`,
      );
      while (!stopping && (await caddyUp())) await sleep(5000);
      if (stopping) process.exit(0);
      continue;
    }
    const lived = await run(env);
    if (stopping) process.exit(0);
    // Sortie immédiate = port pris ou config refusée : on réessaie, de moins en
    // moins souvent (personne d'autre ne relance ce script sous Windows).
    quickFailures = lived < 3000 ? quickFailures + 1 : 0;
    await sleep(quickFailures > 5 ? 30_000 : 1500);
  }
}

/** Démarrage à l'ouverture de session : unité systemd utilisateur, ou script du dossier Démarrage. */
function install() {
  if (process.platform === 'win32') {
    const appData = process.env.APPDATA;
    if (!appData) throw new Error('APPDATA absent de l’environnement.');
    const file = resolve(
      appData,
      'Microsoft/Windows/Start Menu/Programs/Startup/outerpedia-caddy.vbs',
    );
    // Un .vbs plutôt qu'un raccourci : `Run …, 0` lance node SANS fenêtre de
    // console. UTF-16 avec BOM, le seul encodage que wscript lit sûrement
    // quand un chemin porte un accent.
    const vbs = `CreateObject("WScript.Shell").Run """${process.execPath}"" ""${SCRIPT}""", 0, False\r\n`;
    writeFileSync(file, `﻿${vbs}`, 'utf16le');
    spawn('wscript.exe', [file], { detached: true, stdio: 'ignore' }).unref();
    console.log(`Démarrage de session installé et lancé : ${file}`);
    return;
  }
  const dir = resolve(homedir(), '.config/systemd/user');
  const file = resolve(dir, 'outerpedia-caddy.service');
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    file,
    `[Unit]
Description=Caddy local d'outerpedia (outerpedia.local servi par ce PC ou par l'autre)

[Service]
ExecStart=/usr/bin/env node "${SCRIPT}"
Restart=always
RestartSec=5

[Install]
WantedBy=default.target
`,
    'utf8',
  );
  for (const args of [['daemon-reload'], ['enable', '--now', 'outerpedia-caddy.service']]) {
    const res = spawnSync('systemctl', ['--user', ...args], { stdio: 'inherit' });
    if (res.status !== 0) throw new Error(`systemctl --user ${args.join(' ')} a échoué.`);
  }
  console.log(`Service de session installé et lancé : ${file}`);
  console.log('Journal : journalctl --user -u outerpedia-caddy -f');
}

// Garde d'exécution directe : le test importe `peersOf` sans rien lancer.
if (process.argv[1] && resolve(process.argv[1]) === SCRIPT) {
  if (process.argv.includes('--install')) install();
  else await serve();
}
