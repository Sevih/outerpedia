/**
 * Invariant du sync : LE REPLI EST CE QUI EST EN LIGNE.
 *
 * Le repli committé (`data/generated/comics.json`) est la seule source de la
 * galerie en dev et le filet quand R2 ne répond pas. On vérifie donc surtout ce
 * qu'il NE FAIT PAS : recopier un pool local que personne ne peut encore
 * servir. Le juge est le sha1 de `pushed.json`, pas la présence du fichier.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { MANIFEST_KEY, syncComicsSeed, type SyncPaths } from './sync-comics-seed';

const dir = mkdtempSync(join(tmpdir(), 'comics-seed-'));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

const sha1 = (s: string): string => createHash('sha1').update(Buffer.from(s)).digest('hex');
/** Même écriture que `collect-comics` : 2 espaces + newline finale. */
const manifestText = (data: Record<string, string[]>): string =>
  JSON.stringify(data, null, 2) + '\n';

let n = 0;
/** Monte un cas complet ; `live` = ce que `pushed.json` déclare en ligne. */
function setup(opts: {
  manifest?: string;
  live?: string | null;
  seed?: string;
}): SyncPaths & { read: () => string | null } {
  const base = join(dir, `case-${n++}`);
  mkdirSync(base, { recursive: true });
  const paths: SyncPaths = {
    manifest: join(base, 'comics.json'),
    pushed: join(base, 'pushed.json'),
    seed: join(base, 'seed.json'),
  };
  if (opts.manifest !== undefined) writeFileSync(paths.manifest, opts.manifest);
  writeFileSync(
    paths.pushed,
    JSON.stringify(
      opts.live === null || opts.live === undefined ? {} : { [MANIFEST_KEY]: opts.live },
    ),
  );
  if (opts.seed !== undefined) writeFileSync(paths.seed, opts.seed);
  return {
    ...paths,
    read: () => {
      try {
        return readFileSync(paths.seed, 'utf8');
      } catch {
        return null;
      }
    },
  };
}

const POOL = manifestText({ EN: ['a', 'b'], JP: ['a'], KR: ['a'] });
const OLD = manifestText({ EN: ['a'], JP: ['a'], KR: ['a'] });

describe('syncComicsSeed — le repli suit R2, jamais le local', () => {
  it('manifeste confirmé en ligne : le repli est réécrit à l’identique', () => {
    const c = setup({ manifest: POOL, live: sha1(POOL), seed: OLD });
    expect(syncComicsSeed(c)).toBe('mis à jour');
    expect(c.read()).toBe(POOL);
  });

  it('manifeste PAS confirmé sur R2 : le repli ne bouge pas', () => {
    // Le cas qui compte : push interrompu entre la conversion et le transfert.
    // Publier ici annoncerait des BD que R2 ne sert pas encore.
    const c = setup({ manifest: POOL, live: sha1(OLD), seed: OLD });
    expect(syncComicsSeed(c)).toBe('non-poussé');
    expect(c.read()).toBe(OLD);
  });

  it('clé absente de pushed.json : rien poussé, rien synchronisé', () => {
    const c = setup({ manifest: POOL, live: null, seed: OLD });
    expect(syncComicsSeed(c)).toBe('non-poussé');
    expect(c.read()).toBe(OLD);
  });

  it('pas de manifeste (pool vide, ou retenu par le garde-fou) : no-op', () => {
    const c = setup({ live: null, seed: OLD });
    expect(syncComicsSeed(c)).toBe('absent');
    expect(c.read()).toBe(OLD);
  });

  it('repli déjà aligné : aucune réécriture annoncée', () => {
    const c = setup({ manifest: POOL, live: sha1(POOL), seed: POOL });
    expect(syncComicsSeed(c)).toBe('à jour');
  });

  it('premier repli (fichier encore inexistant) : créé', () => {
    const c = setup({ manifest: POOL, live: sha1(POOL) });
    expect(syncComicsSeed(c)).toBe('mis à jour');
    expect(c.read()).toBe(POOL);
  });
});
