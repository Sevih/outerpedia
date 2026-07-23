/**
 * Invariants du générateur progression sur `data/generated/progression.json`
 * committé (modèle singularity/towers) : la section « Base Stats » des fiches
 * dérive silencieusement d'une demi-douzaine de tables (évolutions, limit
 * breaks, premium, codex, quirks d'éveil, passif de transcendance) — une dérive
 * du générateur rendrait des paliers faux sans aucun symptôme.
 *
 * Le générateur n'a pas de cœur pur module-level (tout est en closures sur les
 * tables) → pas de test synthétique, comme singularity. Tourne SANS `.gamedata`
 * (rien n'appelle buildProgression).
 *
 * NB : `premium`/`evoRewards` sont un SUR-ENSEMBLE de characters.json — le
 * générateur itère TOUS les `CT_PC` (skins/formes/NPC compris) là où
 * characters.json est filtré (curé). Les entrées en trop sont inertes (l'app
 * interroge par id de perso réel) → pas de cross-ref d'id ici.
 */
import { describe, expect, it } from 'vitest';
import progressionData from '../../data/generated/progression.json';
import type { ProgressionData } from './progression';

const p = progressionData as unknown as ProgressionData;

// Vocabulaires fermés des groupes d'éveil (cf. AWAKENING_* du générateur).
const ELEMENTS = new Set(['earth', 'water', 'fire', 'light', 'dark']);
const CLASSES = new Set(['defender', 'striker', 'ranger', 'mage', 'healer']);
const SUBCLASSES = new Set([
  'attacker',
  'bruiser',
  'wizard',
  'enchanter',
  'vanguard',
  'tactician',
  'sweeper',
  'phalanx',
  'reliever',
  'sage',
]);

describe('progression.json — évolutions & limit breaks', () => {
  it('échelles d’évolution non vides, `ev` strictement croissant', () => {
    const bad: string[] = [];
    expect(Object.keys(p.evolutions).length).toBeGreaterThan(0);
    for (const [rarity, rungs] of Object.entries(p.evolutions)) {
      let prev = -1;
      for (const r of rungs) {
        if (r.ev <= prev) bad.push(`${rarity} : ev ${r.ev} après ${prev}`);
        prev = r.ev;
      }
    }
    expect(bad).toEqual([]);
  });

  it('limit breaks : clé `<rareté>_<élément>`, steps triés, maxLevel non décroissant', () => {
    const bad: string[] = [];
    expect(Object.keys(p.limitBreak).length).toBeGreaterThan(0);
    for (const [key, steps] of Object.entries(p.limitBreak)) {
      const [, el] = key.split('_');
      if (!ELEMENTS.has(el)) bad.push(`${key} : élément « ${el} »`);
      let prevStep = -1;
      let prevMax = -1;
      for (const s of steps) {
        if (s.step <= prevStep) bad.push(`${key} : step ${s.step} après ${prevStep}`);
        prevStep = s.step;
        if (s.maxLevel < prevMax) bad.push(`${key} : maxLevel ${s.maxLevel} < ${prevMax}`);
        prevMax = s.maxLevel;
      }
    }
    expect(bad).toEqual([]);
  });
});

describe('progression.json — codex & premium', () => {
  it('codex : index 0 nul, chaque cran porte atk/def/hp numériques', () => {
    expect(p.codex[0]).toEqual({ atk: 0, def: 0, hp: 0 });
    const bad = p.codex.filter(
      (c) => typeof c.atk !== 'number' || typeof c.def !== 'number' || typeof c.hp !== 'number',
    );
    expect(bad).toEqual([]);
  });

  it('premium : mode ∈ {flat,rate}, stat renseignée', () => {
    const bad: string[] = [];
    for (const [id, pr] of Object.entries(p.premium)) {
      if (pr.mode !== 'flat' && pr.mode !== 'rate') bad.push(`${id} : mode « ${pr.mode} »`);
      if (!pr.stat) bad.push(`${id} : sans stat`);
    }
    expect(bad).toEqual([]);
  });
});

describe('progression.json — quirks (arbres d’éveil)', () => {
  it('groupes keyés par un slug connu, chaque bloc a stat[]/buff[] valides', () => {
    const bad: string[] = [];
    const checkBlock = (label: string, block: { stat: unknown[]; buff: unknown[] }) => {
      if (!Array.isArray(block.stat) || !Array.isArray(block.buff))
        bad.push(`${label} : bloc mal formé`);
    };
    for (const [k, b] of Object.entries(p.quirks.elemental)) {
      if (!ELEMENTS.has(k)) bad.push(`elemental « ${k} »`);
      checkBlock(`elemental/${k}`, b);
    }
    for (const [k, b] of Object.entries(p.quirks.class)) {
      if (!CLASSES.has(k)) bad.push(`class « ${k} »`);
      checkBlock(`class/${k}`, b);
    }
    for (const [k, b] of Object.entries(p.quirks.subclass)) {
      if (!SUBCLASSES.has(k)) bad.push(`subclass « ${k} »`);
      checkBlock(`subclass/${k}`, b);
    }
    expect(bad).toEqual([]);
  });

  it('chaque StatBonus (quirks) : applying ∈ {add,rate}', () => {
    const bad: string[] = [];
    const groups = [p.quirks.elemental, p.quirks.class, p.quirks.subclass];
    for (const g of groups) {
      for (const [k, block] of Object.entries(g)) {
        for (const s of [...block.stat, ...block.buff]) {
          if (s.applying !== 'add' && s.applying !== 'rate')
            bad.push(`${k} : applying « ${s.applying} »`);
        }
      }
    }
    expect(bad).toEqual([]);
  });
});

describe('progression.json — skill8 (transcendance)', () => {
  it('niveau → bonus, applying ∈ {add,rate}', () => {
    const bad: string[] = [];
    for (const [sid, byLevel] of Object.entries(p.skill8)) {
      for (const [lvl, bonuses] of Object.entries(byLevel)) {
        for (const b of bonuses) {
          if (b.applying !== 'add' && b.applying !== 'rate')
            bad.push(`${sid}/${lvl} : applying « ${b.applying} »`);
        }
      }
    }
    expect(bad).toEqual([]);
  });
});
