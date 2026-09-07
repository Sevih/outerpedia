import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadCuratedJson } from '@/lib/data/disk';

// Écritures réelles dans un tmp : `process.cwd()` y est redirigé (même
// procédé que `admin/store-fixture`, non importable ici — frontière admin/).
const root = mkdtempSync(join(tmpdir(), 'disk-'));
const FILE = join(root, 'data/curated/short-names.json');
const REL = 'curated/short-names.json';
vi.spyOn(process, 'cwd').mockReturnValue(root);

beforeEach(() => {
  rmSync(join(root, 'data'), { recursive: true, force: true });
  mkdirSync(join(root, 'data/curated'), { recursive: true });
});
afterAll(() => rmSync(root, { recursive: true, force: true }));

describe('loadCuratedJson', () => {
  it('fichier absent → le repli, sans lever', () => {
    expect(loadCuratedJson(REL, { vide: true })).toEqual({ vide: true });
  });

  it('JSON cassé → LÈVE en nommant le fichier (jamais un {} silencieux)', () => {
    writeFileSync(FILE, '{ "a": 1, }');
    expect(() => loadCuratedJson(REL, {})).toThrow(/curated\/short-names\.json : JSON invalide/);
  });

  it('voit une réécriture immédiate (read-merge-write des stores admin)', () => {
    writeFileSync(FILE, JSON.stringify({ a: 1 }));
    expect(loadCuratedJson(REL, {})).toEqual({ a: 1 });
    writeFileSync(FILE, JSON.stringify({ a: 1, b: 2 }));
    expect(loadCuratedJson(REL, {})).toEqual({ a: 1, b: 2 });
  });
});
