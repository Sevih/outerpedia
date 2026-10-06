/**
 * Demandes PAR ENTITÉ extraites du manifest — `monsterAssetRequests` et
 * `equipmentAssetRequests`, que `buildAssetManifest` appelle lui-même et que le
 * staging restreint (`stage-entities.ts`) réutilise.
 *
 * Deux étages :
 *   - les fonctions seules, sur des fixtures (tourne partout) ;
 *   - l'ÉQUIVALENCE sur le catalogue du jour : les clés de vignette de monstre
 *     et de tuile d'équipement du manifest global doivent rester celles que les
 *     blocs produisaient AVANT l'extraction des fonctions. L'« avant » est ici
 *     ré-écrit à la main, bloc par bloc, sans passer par elles — c'est un
 *     oracle : si un bloc du manifest change de règle, c'est ici qu'on le dit.
 *     Demande les tables du jeu (le manifest les lit) : sauté sans elles.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { listGuides, readGuideVersionFile } from '../../src/lib/data/guides';
import { tablesStamp } from '../lib/tables';
import { buildAssetManifest, equipmentAssetRequests, monsterAssetRequests } from './manifest';

describe('monsterAssetRequests', () => {
  it('la vignette `MT_<icon>` en webp, domaine `ui` par défaut', () => {
    expect(monsterAssetRequests({ icon: '4013071' })).toEqual([
      {
        kind: 'image',
        key: 'images/ui/boss/MT_4013071.webp',
        candidates: ['MT_4013071'],
        domain: 'ui',
      },
    ]);
  });

  it('`png` ajoute la variante og, `domain` suit', () => {
    const requests = monsterAssetRequests({ icon: '4013071' }, { domain: 'guides', png: true });
    expect(requests.map((r) => [r.key, r.domain])).toEqual([
      ['images/ui/boss/MT_4013071.webp', 'guides'],
      ['images/ui/boss/MT_4013071.png', 'guides'],
    ]);
  });

  it('rien sans icône, ni pour un modèle de perso (« 2… » : face icon du domaine perso)', () => {
    expect(monsterAssetRequests({})).toEqual([]);
    expect(monsterAssetRequests({ icon: '' })).toEqual([]);
    expect(monsterAssetRequests({ icon: '2000002' }, { png: true })).toEqual([]);
  });
});

describe('equipmentAssetRequests', () => {
  const sword = { icon: 'TI_Equipment_Weapon_06', passives: [{ id: '1001' }, { id: '9999' }] };
  const passives = { '1001': { icon: 'TI_Icon_UO_Weapon_03' }, '1002': { icon: 'Other' } };

  it('la tuile de l’objet en webp ; `og` ajoute le PNG', () => {
    expect(equipmentAssetRequests(sword)).toEqual([
      {
        kind: 'image',
        key: 'images/equipment/TI_Equipment_Weapon_06.webp',
        candidates: ['TI_Equipment_Weapon_06'],
        domain: 'equipment',
      },
    ]);
    expect(equipmentAssetRequests(sword, { og: true }).map((r) => r.key)).toEqual([
      'images/equipment/TI_Equipment_Weapon_06.webp',
      'images/equipment/TI_Equipment_Weapon_06.png',
    ]);
  });

  it('avec le catalogue : les icônes de SES passifs seulement, passif inconnu ignoré', () => {
    expect(equipmentAssetRequests(sword, { passives }).map((r) => r.key)).toEqual([
      'images/equipment/TI_Equipment_Weapon_06.webp',
      'images/equipment/TI_Icon_UO_Weapon_03.webp',
    ]);
  });

  it('un set n’a que son icône ; un objet sans icône ne demande rien', () => {
    expect(equipmentAssetRequests({ icon: 'TI_Icon_Set_Enchant_01' }, { passives })).toHaveLength(
      1,
    );
    expect(equipmentAssetRequests({}, { og: true, passives })).toEqual([]);
  });
});

// --- équivalence sur le catalogue du jour -----------------------------------------

type Rec = Record<string, Record<string, unknown>>;
const load = (rel: string): Rec =>
  JSON.parse(readFileSync(resolve('data/generated', rel), 'utf8')) as Rec;

/** Vignettes de monstre (`MT_<icon>`) que les blocs du manifest demandaient. */
function monsterKeysBefore(): Set<string> {
  const keys = new Set<string>();
  const webp = (icon: unknown) => {
    if (typeof icon === 'string' && icon && !icon.startsWith('2'))
      keys.add(`images/ui/boss/MT_${icon}.webp`);
  };
  const monsters = load('monsters.json') as Record<
    string,
    { icon?: string; spawns?: { dungeon: string }[] } | undefined
  >;
  const encounters = load('encounters.json') as Record<
    string,
    { group?: string; monsters?: { id: string }[] }
  >;

  // Boss des sources d'équipement : l'icône brute, sans filtre « 2… ».
  for (const b of Object.values(load('equipment/bosses.json')))
    if (typeof b.icon === 'string' && b.icon) keys.add(`images/ui/boss/MT_${b.icon}.webp`);

  // Monstres référencés par une rencontre.
  for (const enc of Object.values(encounters))
    for (const ref of enc.monsters ?? []) webp(monsters[ref.id]?.icon);

  // Boss des guides (webp + PNG og) et variantes de difficulté de leurs groupes.
  const groupMonsters = new Map<string, Set<string>>();
  const groupOf = new Map<string, string>();
  for (const [did, d] of Object.entries(encounters)) {
    if (!d.group) continue;
    groupOf.set(did, d.group);
    const set = groupMonsters.get(d.group) ?? new Set<string>();
    for (const ref of d.monsters ?? []) set.add(ref.id);
    groupMonsters.set(d.group, set);
  }
  for (const g of listGuides()) {
    const boss = g.bossId ? monsters[g.bossId] : undefined;
    if (boss?.icon && !boss.icon.startsWith('2')) {
      keys.add(`images/ui/boss/MT_${boss.icon}.webp`);
      keys.add(`images/ui/boss/MT_${boss.icon}.png`);
    }
    const groups = new Set<string>();
    for (const s of boss?.spawns ?? []) {
      const grp = groupOf.get(s.dungeon);
      if (grp) groups.add(grp);
    }
    if (g.group && groupMonsters.has(g.group)) groups.add(g.group);
    for (const v of g.versions) {
      const cfg = readGuideVersionFile<Record<string, unknown>>(g, v.key, 'config.json');
      for (const val of Object.values(cfg ?? {}))
        if (typeof val === 'string' && groupMonsters.has(val)) groups.add(val);
    }
    for (const grp of groups)
      for (const id of groupMonsters.get(grp) ?? []) webp(monsters[id]?.icon);
  }

  // Monstres des tours.
  type Formations = { id: string }[][];
  const towers = load('towers.json') as unknown as Record<
    string,
    { floors?: { waves?: Formations; encounters?: Formations }[] }
  >;
  for (const tower of Object.values(towers))
    for (const floor of tower.floors ?? [])
      for (const wave of [...(floor.waves ?? []), ...(floor.encounters ?? [])])
        for (const unit of wave) webp(monsters[unit.id]?.icon);

  // Boss de la rotation Singularity.
  const rotation = load('singularity.json') as unknown as {
    groups: { bosses: { monsters: string[] }[] }[];
  };
  for (const g of rotation.groups)
    for (const b of g.bosses) for (const id of b.monsters) webp(monsters[id]?.icon);

  return keys;
}

/** Clés `images/equipment/*` que les blocs du manifest demandaient. */
function equipmentKeysBefore(): Set<string> {
  const keys = new Set<string>();
  const webp = (icon: unknown) => {
    if (typeof icon === 'string' && icon) keys.add(`images/equipment/${icon}.webp`);
  };
  const og = (icon: unknown) => {
    webp(icon);
    if (typeof icon === 'string' && icon) keys.add(`images/equipment/${icon}.png`);
  };
  const SLOTS = [
    'weapon',
    'accessory',
    'talisman',
    'helmet',
    'armor',
    'gloves',
    'shoes',
    'ee',
  ] as const;
  const tables = Object.fromEntries(SLOTS.map((s) => [s, load(`equipment/${s}.json`)])) as Record<
    (typeof SLOTS)[number],
    Rec
  >;
  const passives = load('equipment/passives.json');
  const passivesOf = (it: Record<string, unknown>) => {
    for (const ref of (it.passives as { id: string }[] | undefined) ?? [])
      webp(passives[ref.id]?.icon);
  };

  // Familles de wiki : palier max de chaque famille, PNG og et passifs.
  const families = load('equipment/families.json') as unknown as Record<
    'weapon' | 'accessory' | 'talisman',
    { topId: string; ids: string[]; wiki: boolean }[]
  >;
  for (const slot of ['weapon', 'accessory', 'talisman'] as const)
    for (const f of families[slot]) {
      if (!f.wiki) continue;
      const top = tables[slot][f.topId];
      for (const id of f.ids) {
        const it = tables[slot][id];
        if (it.star !== top.star) continue;
        og(it.icon);
        passivesOf(it);
      }
    }
  // EE : passifs de tous ; pièces d'armure uniques 6★ : PNG og.
  for (const it of Object.values(tables.ee)) passivesOf(it);
  for (const slot of ['helmet', 'armor', 'gloves', 'shoes'] as const)
    for (const it of Object.values(tables[slot]))
      if (it.grade === 'unique' && Number(it.star) >= 6) og(it.icon);
  // Toutes les tuiles en webp (la collecte « gear reco » en est un sous-ensemble).
  for (const slot of SLOTS) for (const it of Object.values(tables[slot])) webp(it.icon);
  for (const s of Object.values(load('equipment/sets.json'))) webp(s.icon);
  // Matériaux d'ascension Singularity (même namespace).
  const enhance = load('equipment/enhance.json') as unknown as {
    singularity: {
      activation: { materials: { icon: string }[] };
      steps: { materials: { icon: string }[] }[];
    };
  };
  for (const m of [
    ...enhance.singularity.activation.materials,
    ...enhance.singularity.steps.flatMap((s) => s.materials),
  ])
    webp(m.icon);

  return keys;
}

const HAS_GAME_TABLES = !tablesStamp(['CharacterTemplet', 'TextSystem']).includes('absent');

describe.skipIf(!HAS_GAME_TABLES)('manifest global — clés par entité inchangées', () => {
  const sorted = (keys: Iterable<string>) => [...keys].sort();
  const manifestKeys = () => buildAssetManifest().map((r) => r.key);

  it('vignettes de monstre `images/ui/boss/MT_<icon>` : la liste d’avant l’extraction', () => {
    // `MT_<chiffres>` = vignette D'UN monstre ; les calques partagés de la
    // vignette (`MT_Slot_*`, `MT_Element_*`, `MT_Class_*`) ne passent pas par
    // `monsterAssetRequests` et ne sont pas comparés ici.
    const actual = manifestKeys().filter((k) => /^images\/ui\/boss\/MT_\d+\.(webp|png)$/.test(k));
    expect(actual.length).toBeGreaterThan(0);
    expect(sorted(actual)).toEqual(sorted(monsterKeysBefore()));
  });

  it('tuiles et icônes de passifs `images/equipment/*` : la liste d’avant l’extraction', () => {
    const actual = manifestKeys().filter((k) => k.startsWith('images/equipment/'));
    expect(actual.length).toBeGreaterThan(0);
    expect(sorted(actual)).toEqual(sorted(equipmentKeysBefore()));
  });
});
