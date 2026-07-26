/**
 * readCuratedJson — le contrat qui distingue les DEUX cas que les anciens
 * `try { parse } catch { vide }` confondaient : fichier absent (OK, undefined)
 * vs JSON cassé (throw nommant le fichier). Fichiers réels dans un tmpdir —
 * aucune dépendance à `.gamedata` ni à `data/` (CI-safe).
 */
import { existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
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

  it('deux écritures CONCURRENTES du même fichier : ni corruption ni erreur', async () => {
    // ⚠ Ce test ne DÉMONTRE pas l'utilité du nom de temporaire unique : il passe
    // aussi avec un nom fixe (vérifié), parce qu'en intra-processus le couple
    // `writeFileSync`/`renameSync` est synchrone et ne rend jamais la main. Il
    // verrouille l'INVARIANT attendu de l'appelant — deux `writeJson` simultanés
    // se résolvent sans erreur et laissent un fichier cohérent (l'un des deux
    // contenus, jamais un mélange). Le vrai gain du pid est INTER-processus (dev
    // server ↔ CLI datagen), qui demanderait un vrai second processus à tester.
    const p = rel('write-concurrent.json');
    const a = { who: 'a', pad: 'x'.repeat(20_000) };
    const b = { who: 'b', pad: 'y'.repeat(20_000) };
    await expect(Promise.all([writeJson(p, a), writeJson(p, b)])).resolves.toBeDefined();

    const got = readCuratedJson<{ who: string; pad: string }>(p);
    expect(['a', 'b']).toContain(got?.who);
    // Contenu cohérent de bout en bout : pas deux moitiés recollées.
    expect(got?.pad).toBe((got?.who === 'a' ? 'x' : 'y').repeat(20_000));
  });

  it('écritures concurrentes : aucun `.tmp` résiduel', async () => {
    const p = rel('write-concurrent-clean.json');
    await Promise.all([1, 2, 3, 4, 5].map((v) => writeJson(p, { v })));
    expect(readdirSync(dir).filter((f) => f.endsWith('.tmp'))).toEqual([]);
  });

  it('échec d’écriture : le temporaire est nettoyé et l’erreur remonte', async () => {
    // Chemin dont le dossier parent n'existe pas → `writeFileSync` lève.
    const p = rel(join('absent', 'write-fail.json'));
    await expect(writeJson(p, { v: 1 })).rejects.toThrow();
    expect(readdirSync(dir).filter((f) => f.endsWith('.tmp'))).toEqual([]);
  });
});
