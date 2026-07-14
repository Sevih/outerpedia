/**
 * Tests de la logique de PROMOTION (`promote.ts`) — la partie la plus
 * destructive du datagen : l'apply réécrit `data/generated` (le committé) et
 * tourne AUTOMATIQUEMENT en dev (`pnpm dev`). On vérifie donc les invariants
 * qui protègent la donnée validée :
 *   - RÉTENTION : une entité déjà validée n'est JAMAIS supprimée par l'apply ;
 *   - STABILITÉ : re-lancer l'apply ne produit aucun diff (idempotence) ;
 *   - `--only` : rien d'autre que les fichiers cités n'est touché ;
 *   - ORPHELINS : signalés (jamais supprimés), archive de boss exclue.
 *
 * Tout tourne sur des dossiers temporaires via les chemins injectables de
 * `promote()` — les vrais `data/extracted` / `data/generated` ne sont pas lus.
 */
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { formatJson } from './lib/json';
import { applyRetention, promote } from './promote';

let src: string;
let dst: string;

beforeEach(() => {
  src = mkdtempSync(join(tmpdir(), 'promote-src-'));
  dst = mkdtempSync(join(tmpdir(), 'promote-dst-'));
  // La sortie console de promote (écran de revue) n'est pas l'objet des tests.
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  rmSync(src, { recursive: true, force: true });
  rmSync(dst, { recursive: true, force: true });
  vi.restoreAllMocks();
});

/** Écrit un JSON au format CANONIQUE (celui de build/promote) dans `dir`. */
async function put(dir: string, rel: string, data: unknown): Promise<void> {
  const path = join(dir, rel);
  mkdirSync(join(path, '..'), { recursive: true });
  writeFileSync(path, await formatJson(data));
}

const read = (dir: string, rel: string): Record<string, unknown> =>
  JSON.parse(readFileSync(join(dir, rel), 'utf8')) as Record<string, unknown>;

describe('applyRetention — cœur pur de la rétention', () => {
  it('réinjecte les clés validées absentes de la proposition, en fin', () => {
    const committed = { old: { hp: 1 }, kept: { hp: 2 } };
    const extracted = { kept: { hp: 3 }, fresh: { hp: 4 } };
    const { merged, retained } = applyRetention(committed, extracted);
    expect(retained).toEqual(['old']);
    // La proposition fait foi pour les clés communes ; les retenues arrivent APRÈS
    // (ordre stable → diff git minimal).
    expect(Object.keys(merged)).toEqual(['kept', 'fresh', 'old']);
    expect(merged.kept).toEqual({ hp: 3 });
    expect(merged.old).toEqual({ hp: 1 });
  });

  it('ne retient rien quand la proposition couvre tout le validé', () => {
    const { merged, retained } = applyRetention({ a: 1 }, { a: 2, b: 3 });
    expect(retained).toEqual([]);
    expect(merged).toEqual({ a: 2, b: 3 });
  });
});

describe('promote — rétention à l’apply', () => {
  it('ne supprime JAMAIS une entité validée absente de la proposition (monsters.json)', async () => {
    await put(dst, 'monsters.json', { boss_old: { name: 'Old' }, boss_shared: { name: 'v1' } });
    await put(src, 'monsters.json', { boss_shared: { name: 'v2' }, boss_new: { name: 'New' } });

    const res = await promote({ src, dst, apply: true });

    const out = read(dst, 'monsters.json');
    // La clé retenue survit, la commune est mise à jour, la nouvelle entre.
    expect(out.boss_old).toEqual({ name: 'Old' });
    expect(out.boss_shared).toEqual({ name: 'v2' });
    expect(out.boss_new).toEqual({ name: 'New' });
    // Et la rétention est signalée dans l'écran de revue.
    expect(res.diffs.join('\n')).toContain('1 retenue(s), jamais supprimées');
  });

  it('applique la rétention à tous les fichiers RETAIN_ENTITIES', async () => {
    for (const rel of ['monster-skills.json', 'encounters.json']) {
      await put(dst, rel, { kept_key: { v: 1 } });
      await put(src, rel, { other: { v: 2 } });
    }
    await promote({ src, dst, apply: true });
    expect(read(dst, 'monster-skills.json').kept_key).toEqual({ v: 1 });
    expect(read(dst, 'encounters.json').kept_key).toEqual({ v: 1 });
  });

  it('supprime bien les clés des fichiers SANS rétention (glossaires & co)', async () => {
    // Contre-épreuve : la rétention est une exception, pas le régime général.
    await put(dst, 'glossary.json', { gone: 1, kept: 2 });
    await put(src, 'glossary.json', { kept: 2 });
    await promote({ src, dst, apply: true });
    expect(read(dst, 'glossary.json')).toEqual({ kept: 2 });
  });
});

describe('promote — stabilité au re-run', () => {
  it('un 2e apply ne voit plus aucun diff (y compris avec rétention)', async () => {
    await put(dst, 'monsters.json', { boss_old: { name: 'Old' } });
    await put(src, 'monsters.json', { boss_new: { name: 'New' } });
    await put(src, 'skills.json', { s1: { power: 10 } }); // nouveau fichier

    const first = await promote({ src, dst, apply: true });
    expect(first.diffs).toHaveLength(2);

    const bytes = readFileSync(join(dst, 'monsters.json'), 'utf8');
    const second = await promote({ src, dst, apply: true });
    // Idempotence : la réinjection produit octet à octet le fichier déjà écrit.
    expect(second.diffs).toHaveLength(0);
    expect(second.identical).toBe(2);
    expect(readFileSync(join(dst, 'monsters.json'), 'utf8')).toBe(bytes);
  });
});

describe('promote — --only', () => {
  it('ne touche pas les autres fichiers et suspend le signalement orphelin', async () => {
    await put(src, 'unlock-content.json', { u1: { v: 2 } });
    await put(src, 'glossary.json', { g1: { v: 2 } });
    await put(dst, 'unlock-content.json', { u1: { v: 1 } });
    await put(dst, 'glossary.json', { g1: { v: 1 } });
    await put(dst, 'orphan.json', { o: 1 });

    const res = await promote({ src, dst, apply: true, only: new Set(['unlock-content.json']) });

    expect(read(dst, 'unlock-content.json')).toEqual({ u1: { v: 2 } });
    // Hors périmètre : ni écrit, ni signalé.
    expect(read(dst, 'glossary.json')).toEqual({ g1: { v: 1 } });
    expect(res.orphans).toEqual([]);
  });

  it('refuse un fichier --only inconnu de la proposition', async () => {
    await put(src, 'a.json', {});
    await expect(promote({ src, dst, only: new Set(['nope.json']) })).rejects.toThrow(
      /introuvable/,
    );
  });
});

describe('promote — orphelins', () => {
  it('signale les fichiers validés sans équivalent extrait, sans les supprimer', async () => {
    await put(src, 'a.json', { x: 1 });
    await put(dst, 'a.json', { x: 1 });
    await put(dst, 'orphan.json', { o: 1 });

    const res = await promote({ src, dst, apply: true });
    expect(res.orphans).toEqual(['orphan.json']);
    // Signalé pour décision humaine, jamais supprimé d'office.
    expect(read(dst, 'orphan.json')).toEqual({ o: 1 });
  });

  it('exclut monster-archive/ du signalement (états figés, sans équivalent par construction)', async () => {
    await put(src, 'a.json', { x: 1 });
    await put(dst, 'monster-archive/boss-2024.json', { frozen: true });
    await put(dst, 'orphan.json', { o: 1 });

    const res = await promote({ src, dst });
    expect(res.orphans).toEqual(['orphan.json']);
  });
});

describe('promote — dry-run et entrées invalides', () => {
  it('sans --apply, ne modifie rien sur disque', async () => {
    await put(src, 'a.json', { x: 2 });
    await put(dst, 'a.json', { x: 1 });
    const res = await promote({ src, dst });
    expect(res.diffs).toHaveLength(1);
    expect(read(dst, 'a.json')).toEqual({ x: 1 });
  });

  it('lève si le dossier source est absent', async () => {
    await expect(promote({ src: join(src, 'nope'), dst })).rejects.toThrow(/absent/);
  });
});
