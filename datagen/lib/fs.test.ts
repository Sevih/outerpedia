/**
 * rmTree — supprime un arbre réel dans un tmpdir, tolère le chemin absent, et
 * transmet bien les options de nouvel essai à `rmSync` (espion qui délègue au
 * vrai `node:fs`). L'EPERM lui-même n'est pas simulé : c'est Node qui réessaie.
 */
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { rmTree } from './fs';

vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs')>();
  return { ...actual, rmSync: vi.fn(actual.rmSync) };
});

const dir = mkdtempSync(join(tmpdir(), 'rm-tree-'));

afterAll(() => rmSync(dir, { recursive: true, force: true }));
// Corps en bloc : une fonction RENVOYÉE par beforeEach est prise pour un
// nettoyage — `mockClear()` renvoie l’espion, vitest appellerait `rmSync()`.
beforeEach(() => {
  vi.mocked(rmSync).mockClear();
});

describe('rmTree', () => {
  it('supprime un arbre entier (sous-dossiers et fichiers)', () => {
    const root = join(dir, 'arbre');
    mkdirSync(join(root, 'a/b'), { recursive: true });
    writeFileSync(join(root, 'a/b/f.txt'), 'x');
    writeFileSync(join(root, 'g.txt'), 'y');
    rmTree(root);
    expect(existsSync(root)).toBe(false);
  });

  it('chemin absent → rien à faire, pas de throw', () => {
    expect(() => rmTree(join(dir, 'inexistant'))).not.toThrow();
  });

  it('passe récursif, force et les nouveaux essais par défaut à rmSync', () => {
    const path = join(dir, 'defauts');
    rmTree(path);
    expect(rmSync).toHaveBeenCalledWith(path, {
      recursive: true,
      force: true,
      maxRetries: 5,
      retryDelay: 200,
    });
  });

  it('les options surchargent les défauts', () => {
    const path = join(dir, 'surcharge');
    rmTree(path, { maxRetries: 1, retryDelay: 10 });
    expect(rmSync).toHaveBeenCalledWith(path, {
      recursive: true,
      force: true,
      maxRetries: 1,
      retryDelay: 10,
    });
  });
});
