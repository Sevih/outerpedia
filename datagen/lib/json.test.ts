/**
 * readCuratedJson — le contrat qui distingue les DEUX cas que les anciens
 * `try { parse } catch { vide }` confondaient : fichier absent (OK, undefined)
 * vs JSON cassé (throw nommant le fichier). Fichiers réels dans un tmpdir —
 * aucune dépendance à `.gamedata` ni à `data/` (CI-safe).
 */
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { readCuratedJson } from './json';

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
