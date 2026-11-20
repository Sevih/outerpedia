/**
 * restart — « Relancer quick » : le serveur se remplace par un quick neuf.
 *
 * POURQUOI. quick lit une partie des données au démarrage (les imports JSON,
 * la liste des personnages…) : après une intégration ou une promotion, il ne
 * voit les nouvelles données qu'une fois relancé. La relance passait par un
 * arrêt du processus à la main.
 *
 * COMMENT. Le serveur répond, ferme son port (`server.close` et les connexions
 * ouvertes avec), lance un nouveau quick avec les MÊMES arguments et le même
 * environnement, puis se termine. Le nouveau processus est l'enfant direct du
 * node qui sert (`execPath`, `execArgv` — le chargeur de tsx — et `argv`) :
 *
 *   - sa sortie est HÉRITÉE (`stdio: 'inherit'`) : le journal du lanceur
 *     (`launch.sh`, une redirection) ou la console (`launch.cmd`) continue ;
 *   - il reste dans le groupe de contrôle du parent : sous un scope systemd
 *     utilisateur (`systemd-run --user --scope …`), il y reste, et le scope
 *     survit au parent tant qu'il tourne (vérifié sur systemd 259) ;
 *   - PAS `detached` : sous Windows, il ouvrirait une nouvelle console.
 *
 * L'environnement transmis est celui que quick a REÇU (`LAUNCH_ENV` de
 * `env.ts`), pas `process.env` : celui-ci porte `.env.local`, que le nouveau
 * quick relit lui-même — une clé retouchée entre-temps est donc prise. S'y
 * ajoute la marque `RESTART_MARK` : elle dit au nouveau quick qu'il succède à
 * un autre, donc d'ATTENDRE le port (`portBusy`) au lieu de conclure « déjà
 * lancé », et de ne pas rouvrir le navigateur (la page se recharge seule).
 *
 * REFUS. Pas de relance pendant un geste : un travail de la section « Patch »
 * ou « Pousser » (le verrou de l'admin, `runningPatchJob`), ou n'importe quel
 * geste qui stream sa réponse — tous ceux qui committent, envoient sur R2 ou
 * postent sur Discord passent par `stream()` de `server.ts`, qui les compte
 * (`createGestures`).
 *
 * Tout est injecté (`spawn`, le serveur, `exit`) : les tests jouent la relance
 * sans rien lancer.
 */
import type { SpawnOptions } from 'node:child_process';

/**
 * Le code de sortie de l'ANCIEN quick, une fois le nouveau parti : `launch.cmd`
 * y lit « relancé » et ne dit pas « Le serveur s'est arrêté » au-dessus d'un
 * quick qui continue dans la même console. tsx rend le code de son enfant.
 */
export const RESTART_EXIT_CODE = 3;

/** Un environnement de processus (sans le `NODE_ENV` obligatoire des types de Next). */
export type Env = Record<string, string | undefined>;

/** La marque posée dans l'environnement du quick relancé. */
export const RESTART_MARK = 'QUICK_RESTARTED';

/**
 * Lit la marque et l'EFFACE de chaque environnement donné : elle ne vaut que
 * pour ce démarrage, ni pour les commandes que quick lance, ni pour la relance
 * suivante (qui la repose).
 */
export function takeRestartMark(...envs: Env[]): boolean {
  const marked = envs.some((env) => env[RESTART_MARK] === '1');
  for (const env of envs) delete env[RESTART_MARK];
  return marked;
}

// ------------------------------------------------------ les gestes en cours

/** Les gestes qui courent, par libellé (la route qui les a lancés). */
export interface Gestures {
  /** Compte `run` comme un geste le temps qu'il court, même s'il échoue. */
  track<T>(label: string, run: () => Promise<T>): Promise<T>;
  /** Les libellés des gestes en cours, dans l'ordre de lancement. */
  running(): string[];
}

export function createGestures(): Gestures {
  const current = new Map<number, string>();
  let seq = 0;
  return {
    async track(label, run) {
      const id = ++seq;
      current.set(id, label);
      try {
        return await run();
      } finally {
        current.delete(id);
      }
    },
    running: () => [...current.values()],
  };
}

/** Ce qui empêche la relance : le verrou de « Patch », les gestes en cours. */
export interface Busy {
  /** Le libellé du travail sous le verrou de l'admin (`runningPatchJob`). */
  patchJob: string | undefined;
  /** Les gestes en cours (`Gestures.running`). */
  gestures: string[];
  /** Une relance déjà acceptée : une seconde lancerait DEUX nouveaux quick. */
  restarting?: boolean;
}

/** Le refus (409) d'une relance, ou `null` : rien ne court, elle peut partir. */
export function restartRefusal(busy: Busy): { ok: false; error: string } | null {
  if (busy.restarting) return { ok: false, error: 'Relance déjà en cours.' };
  const what = [...(busy.patchJob === undefined ? [] : [busy.patchJob]), ...busy.gestures];
  if (!what.length) return null;
  return {
    ok: false,
    error: `Relance refusée : un geste est en cours (${what.join(', ')}) — attends sa fin.`,
  };
}

// ------------------------------------------------------ la relance

/** La commande du nouveau quick : le même node, ses options, son script, ses arguments. */
export interface Launch {
  execPath: string;
  execArgv: readonly string[];
  /** `process.argv` : `[node, script, ...arguments]`. */
  argv: readonly string[];
  /** L'environnement reçu au lancement (`LAUNCH_ENV`). */
  env: NodeJS.ProcessEnv;
  cwd: string;
}

export function restartCommand(launch: Launch): {
  command: string;
  args: string[];
  options: SpawnOptions;
} {
  return {
    command: launch.execPath,
    args: [...launch.execArgv, ...launch.argv.slice(1)],
    options: {
      cwd: launch.cwd,
      env: { ...launch.env, [RESTART_MARK]: '1' },
      stdio: 'inherit',
      detached: false,
    },
  };
}

/** Ce que la relance demande au serveur HTTP (`node:http` le fournit). */
export interface Closable {
  close(done?: (err?: Error) => void): unknown;
  closeAllConnections(): void;
}

/** Ce que la relance demande au processus lancé : de dire s'il est parti. */
export interface Spawned {
  once(event: 'spawn', listener: () => void): unknown;
  once(event: 'error', listener: (err: Error) => void): unknown;
}

export interface RestartDeps extends Launch {
  server: Closable;
  spawn: (command: string, args: string[], options: SpawnOptions) => Spawned;
  exit: (code: number) => void;
  say: (line: string) => void;
  /**
   * Relu une fois le port fermé : un geste parti entre la réponse et la
   * fermeture (une requête déjà lue sur une autre connexion) va au bout avant
   * que le processus ne sorte — couper un commit en son milieu est ce que le
   * refus évite.
   */
  busy?: () => Busy;
  /** Au-delà, on n'attend plus la fermeture des connexions : le port est rendu dès `close`. */
  closeTimeoutMs?: number;
  /** Le pas de la relecture de `busy`. */
  pollMs?: number;
}

/**
 * Libère le port, lance le nouveau quick, puis se termine — dans cet ordre.
 * Le nouveau parti (`spawn`), le processus sort en `RESTART_EXIT_CODE` ; s'il
 * n'a pas pu partir,
 * en 1, avec la raison dans la sortie (le port est déjà rendu : rien ne
 * servirait de rester).
 */
export async function restartQuick(deps: RestartDeps): Promise<void> {
  const { command, args, options } = restartCommand(deps);
  deps.say('quick : relance demandée — fermeture du port…');
  await new Promise<void>((done) => {
    const timer = setTimeout(done, deps.closeTimeoutMs ?? 3000);
    deps.server.close(() => {
      clearTimeout(timer);
      done();
    });
    // Les connexions gardées ouvertes (keep-alive de Caddy, 125 s) retiendraient
    // `close` : elles sont coupées, la réponse de la relance est déjà partie.
    deps.server.closeAllConnections();
  });
  for (let said = false; deps.busy && restartRefusal(deps.busy()); said = true) {
    if (!said) deps.say('quick : un geste court encore, la relance attend sa fin…');
    await new Promise((done) => setTimeout(done, deps.pollMs ?? 100));
  }
  deps.say('quick : port libéré, démarrage du nouveau quick.');
  const child = deps.spawn(command, args, options);
  await new Promise<void>((done) => {
    child.once('spawn', () => {
      deps.exit(RESTART_EXIT_CODE);
      done();
    });
    child.once('error', (e) => {
      deps.say(`quick : relance impossible — ${e.message}. Relance-le à la main.`);
      deps.exit(1);
      done();
    });
  });
}

/**
 * La réponse de `POST /api/restart` : le refus (409) pendant un geste, sinon
 * l'accord (200) avec le PID qui sert — la page attend d'en voir un autre sur
 * `GET /api/ping` pour se recharger. `restart` : la relance est à lancer une
 * fois la réponse partie.
 */
export function restartAnswer(
  busy: Busy,
  pid: number,
): {
  status: 200 | 409;
  body: { ok: boolean; error?: string; log?: string[]; pid?: number };
  restart: boolean;
} {
  const refusal = restartRefusal(busy);
  if (refusal) return { status: 409, body: refusal, restart: false };
  return {
    status: 200,
    body: { ok: true, log: ['quick redémarre…'], pid },
    restart: true,
  };
}

/** Ce que le nouveau quick fait d'un port encore pris, au `tries`-ième refus. */
export function portBusy(
  tries: number,
  port: number,
  max = PORT_RETRIES,
): { retry: boolean; say: string | null } {
  if (tries > max)
    return {
      retry: false,
      say: `quick : relance abandonnée — le port ${port} est toujours pris après ${(max * PORT_RETRY_MS) / 1000} s. Un autre processus le tient ; arrête-le, puis relance quick.`,
    };
  return {
    retry: true,
    say: tries === 1 ? `quick : le port ${port} n'est pas encore libre, nouvel essai…` : null,
  };
}

/** Le nouveau quick réessaie le port toutes les `PORT_RETRY_MS`, `PORT_RETRIES` fois (10 s). */
export const PORT_RETRY_MS = 250;
export const PORT_RETRIES = 40;
