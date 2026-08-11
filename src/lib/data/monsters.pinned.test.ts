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

const LIVE_ID = '4086023';
const PIN = `${LIVE_ID}@1`;

/**
 * Une réf de statut et un id d'effet que le VRAI glossaire ne connaît pas : ils
 * ne peuvent donc être résolus que par les sources de l'archive. C'est ce qui
 * rend la démonstration sans ambiguïté.
 */
const TT = 'TOOLTIP-DE-TEST';
const EFF = 'EFFET-DE-TEST';

/** Un skill qui applique un statut nommé, donc une chip à résoudre. */
const chipSkill = (name: string) =>
  ({
    id: 's1',
    type: 'monster_1',
    name: dict(name),
    maxLevel: 1,
    levels: [{ level: 1 }],
    effects: [{ type: 'BT_TEST', family: 'stat', category: 'buff', tooltip: TT, target: 'enemy' }],
  }) as unknown as Skill;

let root: string;

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), 'monsters-pinned-'));
  const gen = join(root, 'data/generated');
  mkdirSync(join(gen, 'monster-archive'), { recursive: true });
  mkdirSync(join(root, 'data/curated'), { recursive: true });

  // Table VIVANTE : le boss après sa refonte.
  writeFileSync(
    join(gen, 'monsters.json'),
    JSON.stringify({ [LIVE_ID]: monster('Dahlia (live)', ['s1']) }),
  );
  writeFileSync(join(gen, 'monster-skills.json'), JSON.stringify({ s1: chipSkill('Skill LIVE') }));
  // Le glossaire du LIVE est complet mais ignore `TT` : rien ne le résout hors
  // de l'archive.
  writeFileSync(
    join(gen, 'glossaries.json'),
    JSON.stringify({
      effects: {},
      effectByTooltip: {},
      effectByLabel: {},
      effectByKey: { buff: {}, debuff: {} },
      statScales: {},
      modes: {},
    }),
  );
  writeFileSync(join(gen, 'encounters.json'), JSON.stringify({}));
  writeFileSync(join(root, 'data/curated/monster-skills.json'), JSON.stringify({}));

  // ARCHIVE : le même boss AVANT la refonte — même id de skill, autre contenu,
  // et SES PROPRES sources de résolution (ce qui nomme ses buffs).
  const entry: MonsterArchiveEntry = {
    id: LIVE_ID,
    version: 1,
    ref: 'abc1234',
    committedAt: '2026-01-01T00:00:00Z',
    label: 'avant la maj 1.11',
    monster: monster('Dahlia (figée)', ['s1']),
    skills: { s1: chipSkill('Skill FIGÉ') },
    sources: {
      glossary: {
        effects: {
          [EFF]: {
            id: EFF,
            name: dict('Statut D’ÉPOQUE'),
            desc: dict(''),
            icon: '',
            isDebuff: false,
            origin: 'tooltip',
            tooltips: [TT],
          },
        },
        effectByTooltip: { [TT]: EFF },
        effectByLabel: {},
        effectByKey: { buff: {}, debuff: {} },
      },
      curatedEffects: {},
    },
  } as unknown as MonsterArchiveEntry;
  writeFileSync(join(gen, `monster-archive/${PIN}.json`), JSON.stringify(entry));

  vi.spyOn(process, 'cwd').mockReturnValue(root);
});

afterAll(() => {
  vi.restoreAllMocks();
  rmSync(root, { recursive: true, force: true });
});

// APRÈS la redirection : le module lit au disque à chaque appel, mais on garde
// l'ordre du bac à sable des stores — c'est l'habitude du dépôt.
const { getMonster, getMonsterSkills, getBossView, pinResolver } = await import('./monsters');

/**
 * ÉPINGLAGE D'UN GUIDE VERSIONNÉ — le cas où le guide ne NOMME pas son boss.
 *
 * Joint challenge, world boss et guild raid désignent un COMBAT : leurs monstres
 * sont résolus au rendu depuis `encounters.json`, il n'y a aucun id à réécrire
 * dans le guide. Le pin vit donc dans une liste à part (`pinned` du `config.json`
 * de la version) et c'est le RENDU qui doit faire passer chaque id au travers.
 * Sans ça, versionner un boss de mode versionné ne change rigoureusement rien à
 * l'écran — l'archive existe et personne ne la lit.
 */
describe('pinResolver — la liste `pinned` d’une version', () => {
  it('sans liste, ne touche à rien', () => {
    expect(pinResolver()('4548161')).toBe('4548161');
    expect(pinResolver([])('4548161')).toBe('4548161');
  });

  it('épingle le monstre nommé par la liste', () => {
    expect(pinResolver(['4548161@1'])('4548161')).toBe('4548161@1');
  });

  it('la liste est CREUSE : un monstre absent reste LIVE', () => {
    // C'est ce qui fait qu'un combat à trois difficultés n'oblige pas à figer
    // les trois, et surtout : zéro migration sur les guides existants.
    const pin = pinResolver(['4548161@1']);
    expect(pin('4548171')).toBe('4548171');
    expect(pin('4548181')).toBe('4548181');
  });

  it('un id DÉJÀ épinglé n’est pas retouché', () => {
    // Le guide a tranché lui-même : la liste ne le contredit pas.
    expect(pinResolver(['4548161@1'])('4548161@2')).toBe('4548161@2');
  });

  it('deux pins du même monstre : le PREMIER gagne', () => {
    // Erreur de contenu ; prendre le second silencieusement la rendrait
    // invisible, et le guide afficherait un état sans qu'on sache pourquoi.
    expect(pinResolver(['4548161@1', '4548161@2'])('4548161')).toBe('4548161@1');
  });

  it('plusieurs monstres épinglés d’un même combat', () => {
    // Le cas normal d'un joint challenge : trois difficultés, trois monstres
    // DIFFÉRENTS — les figer tous demande trois entrées.
    const pin = pinResolver(['4548161@1', '4548171@1', '4548181@1']);
    expect(['4548161', '4548171', '4548181'].map(pin)).toEqual([
      '4548161@1',
      '4548171@1',
      '4548181@1',
    ]);
  });
});

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

  it('résout ses statuts avec les SOURCES de l’archive, pas le glossaire courant', () => {
    // Le cœur de l'affaire. Un skill ne stocke qu'une RÉFÉRENCE de statut : sans
    // les sources figées, le boss d'époque emprunterait au glossaire
    // d'aujourd'hui — libellés actuels, et chips muettes pour les réfs
    // supprimées depuis. Ici le glossaire courant ignore `TT` : seul le pin sait
    // le nommer.
    const pinned = getBossView(PIN)!;
    expect(pinned.statuses[TT]?.name.en).toBe('Statut D’ÉPOQUE');

    const live = getBossView(LIVE_ID)!;
    expect(live.statuses[TT]).toBeUndefined();
  });

  it('la vue épinglée porte bien le kit et le nom d’époque', () => {
    const v = getBossView(PIN)!;
    expect(v.name.en).toBe('Dahlia (figée)');
    expect(v.skills.map((s) => s.name.en)).toEqual(['Skill FIGÉ']);
    expect(v.id).toBe(PIN);
  });

  it('un pin SANS archive lève en nommant le fichier attendu', () => {
    // Plutôt qu'un `undefined` qui ferait dire à l'appelant « absent de
    // monsters.json » — faux, et qui envoie chercher au mauvais endroit.
    expect(() => getMonster(`${LIVE_ID}@99`)).toThrow(/monster-archive\/4086023@99\.json/);
  });
});
