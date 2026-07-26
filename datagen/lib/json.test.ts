/**
 * readCuratedJson — le contrat qui distingue les DEUX cas que les anciens
 * `try { parse } catch { vide }` confondaient : fichier absent (OK, undefined)
 * vs JSON cassé (throw nommant le fichier). Fichiers réels dans un tmpdir —
 * aucune dépendance à `.gamedata` ni à `data/` (CI-safe).
 */
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { readCuratedJson, writeJson } from './json';

// Le helper résout relativement au cwd : on repasse les chemins absolus du
// tmpdir en relatif pour exercer le même chemin de code que les vrais appels.
const dir = mkdtempSync(join(tmpdir(), 'curated-json-'));
const rel = (name: string): string => relative(process.cwd(), join(dir, name));

afterAll(() => rmSync(dir, { recursive: true, force: true }));

describe('readCuratedJson', () => {
  it('fichier absent → undefined (pas de curation, cas normal)', () => {
    expect(readCuratedJson(rel('inexistant.json'))).toBeUndefined();
  });

  it('JSON valide → objet parsé', () => {
    writeFileSync(join(dir, 'ok.json'), '{ "a": 1, "_doc": "note" }\n');
    expect(readCuratedJson<{ a: number }>(rel('ok.json'))).toEqual({ a: 1, _doc: 'note' });
  });

  it('JSON cassé → throw nommant le fichier (jamais un vide silencieux)', () => {
    writeFileSync(join(dir, 'casse.json'), '{ "a": 1, }\n'); // virgule traînante
    const path = rel('casse.json');
    expect(() => readCuratedJson(path)).toThrowError(path);
    expect(() => readCuratedJson(path)).toThrowError(/JSON invalide/);
  });

  it('fichier tronqué (sauvegarde interrompue) → throw aussi', () => {
    writeFileSync(join(dir, 'tronque.json'), '{ "a": {');
    expect(() => readCuratedJson(rel('tronque.json'))).toThrowError(/JSON invalide/);
  });

  it('fichier vide → throw (un curé vide légitime est `{}`, pas 0 octet)', () => {
    writeFileSync(join(dir, 'vide.json'), '');
    expect(() => readCuratedJson(rel('vide.json'))).toThrowError(/JSON invalide/);
  });
});

describe('writeJson — écriture atomique (F1)', () => {
  it('round-trip : ce qui est écrit se relit à l’identique', async () => {
    const p = rel('write-rt.json');
    await writeJson(p, { b: 2, a: 1, _doc: 'note' });
    expect(readCuratedJson<Record<string, unknown>>(p)).toEqual({ b: 2, a: 1, _doc: 'note' });
  });

  it('ne laisse AUCUN fichier `.tmp` derrière (le temporaire est renommé)', async () => {
    const p = rel('write-clean.json');
    await writeJson(p, { x: 1 });
    expect(existsSync(join(dir, 'write-clean.json.tmp'))).toBe(false);
  });

  it('écrase une cible existante (rename atomique sur cible présente)', async () => {
    const p = rel('write-over.json');
    await writeJson(p, { v: 1 });
    await writeJson(p, { v: 2 });
    expect(readCuratedJson<{ v: number }>(p)).toEqual({ v: 2 });
  });
});
