/**
 * env — accès à `.env.local` pour les CLI datagen (tsx ne charge PAS les .env,
 * contrairement à Next). Parse minimal KEY=VALUE, sans dépendance — même
 * approche que scripts/assets-push.mjs.
 *
 * Porte aussi la résolution du REPO V2 VOISIN : son nom dépend de la machine
 * (PC fixe : `../outerpedia-v2`, portable : `../outerpedia`) → `V2_DIR` dans
 * `.env.local` (cf. .env.example). `process.env` garde la priorité pour
 * permettre un override ponctuel en ligne de commande.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

let cache: Record<string, string> | null = null;

/** Parse minimal `.env.local` (KEY=VALUE), mémoïsé pour le run CLI. */
export function loadEnvLocal(): Record<string, string> {
  if (cache) return cache;
  const out: Record<string, string> = {};
  const path = resolve('.env.local');
  if (existsSync(path)) {
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!m) continue;
      let v = m[2].trim();
      // Quotes d'enrobage (convention dotenv) : `KEY="valeur"` doit donner
      // `valeur` — sinon les guillemets partent dans l'identifiant (R2…).
      if (v.length >= 2 && ((v[0] === '"' && v.endsWith('"')) || (v[0] === "'" && v.endsWith("'"))))
        v = v.slice(1, -1);
      out[m[1]] = v;
    }
  }
  cache = out;
  return out;
}

/** Une variable : `process.env` d'abord (override CLI), `.env.local` sinon. */
export function envVar(key: string): string | undefined {
  return process.env[key] ?? loadEnvLocal()[key];
}

/** Racine du repo V2 voisin (lecture seule, dev only). */
export function v2Dir(): string {
  return resolve(envVar('V2_DIR') ?? '../outerpedia-v2');
}

/** Pool d'images V2 — `V2_IMAGES_DIR` explicite prime, sinon dérivé de v2Dir(). */
export function v2ImagesDir(): string {
  const explicit = envVar('V2_IMAGES_DIR');
  return explicit ? resolve(explicit) : resolve(v2Dir(), 'public/images');
}
