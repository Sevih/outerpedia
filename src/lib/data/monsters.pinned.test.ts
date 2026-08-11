/**
 * Résolution des ids ÉPINGLÉS `<id>@<n>` — l'état FIGÉ d'un boss.
 *
 * Le geste « Versionner » de l'admin écrit `data/generated/monster-archive/`
 * depuis longtemps, mais RIEN ne savait relire ces fichiers : `getMonster` ne
 * regardait que la table vivante. Épingler un guide sur une version archivée
 * l'aurait donc fait JETER au rendu (`BossEncounters`/`AdventureSeasons` lèvent
 * sur un monstre absent). Ces tests ferment ce trou et le gardent fermé.
 *
 * Ce qui doit rester vrai : un id VIVANT (sans `@`) se comporte exactement comme
 * avant — c'est ce qui rend la bascule sans risque pour les 31 sites d'appel.
 *
 * Lecture réelle au disque via une redirection de `process.cwd()` : `loadDataJson`
 * résout son chemin à CHAQUE appel, donc le bac à sable suffit — rien n'est écrit
 * dans le dépôt.
 */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { Monster, MonsterArchiveEntry, Skill } from '@contracts';

const dict = (en: string) => ({ en, jp: en, kr: en, zh: en });
const monster = (name: string, skills: string[]) =>
  ({ name: dict(name), skills, element: 'fire', icon: 'MT_X' }) as unknown as Monster;
const skill = (name: string) => ({ name: dict(name) }) as unknown as Skill;

const LIVE_ID = '4086023';
const PIN = `${LIVE_ID}@1`;

let root: string;

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), 'monsters-pinned-'));
  const gen = join(root, 'data/generated');
  mkdirSync(join(gen, 'monster-archive'), { recursive: true });

  // Table VIVANTE : le boss après sa refonte.
  writeFileSync(
    join(gen, 'monsters.json'),
    JSON.stringify({ [LIVE_ID]: monster('Dahlia (live)', ['s1']) }),
  );
  writeFileSync(join(gen, 'monster-skills.json'), JSON.stringify({ s1: skill('Skill LIVE') }));

  // ARCHIVE : le même boss AVANT la refonte — même id de skill, autre contenu.
  const entry: MonsterArchiveEntry = {
    id: LIVE_ID,
    version: 1,
    ref: 'abc1234',
    committedAt: '2026-01-01T00:00:00Z',
    label: 'avant la maj 1.11',
    monster: monster('Dahlia (figée)', ['s1']),
    skills: { s1: skill('Skill FIGÉ') },
  };
  writeFileSync(join(gen, `monster-archive/${PIN}.json`), JSON.stringify(entry));

  vi.spyOn(process, 'cwd').mockReturnValue(root);
});

afterAll(() => {
  vi.restoreAllMocks();
  rmSync(root, { recursive: true, force: true });
});

// APRÈS la redirection : le module lit au disque à chaque appel, mais on garde
// l'ordre du bac à sable des stores — c'est l'habitude du dépôt.
const { getMonster, getMonsterSkills } = await import('./monsters');

describe('id VIVANT — rien ne change', () => {
  it('est servi par la table vivante', () => {
    expect(getMonster(LIVE_ID)?.name.en).toBe('Dahlia (live)');
  });

  it('ses skills viennent du catalogue vivant', () => {
    const m = getMonster(LIVE_ID)!;
    expect(getMonsterSkills(m, LIVE_ID).map((s) => s.name.en)).toEqual(['Skill LIVE']);
  });

  it('un id inconnu rend `undefined` (et ne lève pas)', () => {
    expect(getMonster('nexistepas')).toBeUndefined();
  });
});

describe('id ÉPINGLÉ — l’état figé', () => {
  it('rend le monstre ARCHIVÉ, pas le vivant', () => {
    expect(getMonster(PIN)?.name.en).toBe('Dahlia (figée)');
  });

  it('rend les skills ARCHIVÉS — même id, contenu d’époque', () => {
    // LE piège que le paramètre `id` de `getMonsterSkills` empêche : les ids de
    // skills survivent à une refonte, seul leur contenu change. Sans le pin, on
    // afficherait les skills du NOUVEAU boss sous l'entité figée, en silence.
    const m = getMonster(PIN)!;
    expect(getMonsterSkills(m, PIN).map((s) => s.name.en)).toEqual(['Skill FIGÉ']);
  });

  it('ne masque pas la version vivante du même boss', () => {
    // Les deux coexistent : c'est tout l'intérêt (une version du guide décrit
    // l'ancien état, la suivante le nouveau).
    expect(getMonster(LIVE_ID)?.name.en).toBe('Dahlia (live)');
  });

  it('un pin SANS archive lève en nommant le fichier attendu', () => {
    // Plutôt qu'un `undefined` qui ferait dire à l'appelant « absent de
    // monsters.json » — faux, et qui envoie chercher au mauvais endroit.
    expect(() => getMonster(`${LIVE_ID}@99`)).toThrow(/monster-archive\/4086023@99\.json/);
  });
});
