/**
 * Tests du générateur encounters — les DEUX registres actés (TODO 17/07) :
 *
 *   1. CŒURS PURS en synthétique : la traversée donjon → groupes → unités
 *      (`spawnGroupIds`/`spawnUnits`/`dungeonSpawnedMonsters`) encode des
 *      pièges réels — positions CSV (95 donjons), slots ID1..3 (bug historique
 *      de sources.ts), dédup dans l'ordre des tables. Aucune table requise.
 *
 *   2. INVARIANTS RÉFÉRENTIELS sur `data/generated/` committé (modèle
 *      towers.test.ts / tags.test.ts) : chaque référence croisée d'encounters
 *      (monstre d'un donjon, table de butin, geas, spawn inverse) doit pointer
 *      quelque chose qui existe — une dérive du générateur n'a AUCUN symptôme
 *      visible sinon (page qui rend un trou, jointure qui rate en silence).
 *
 * La suite tourne SANS `.gamedata` (contrainte CI) : rien ici n'appelle
 * `buildEncounters()` ni `loadTable`.
 */
import { describe, expect, it } from 'vitest';
import encountersData from '../../data/generated/encounters.json';
import glossariesData from '../../data/generated/glossaries.json';
import monstersData from '../../data/generated/monsters.json';
import type { Row } from '../lib/tables';
import {
  dungeonSpawnedMonsters,
  spawnGroupIds,
  spawnUnits,
  type DungeonMonster,
  type DungeonRef,
  type GuildRaidGeas,
  type MonsterSpawn,
  type RankOption,
  type RewardTable,
} from './encounters';

// ─── 1. Cœurs purs (synthétique) ─────────────────────────────────────────────

describe('spawnGroupIds — positions CSV', () => {
  it('lit les 3 positions et ÉCLATE les CSV (95 donjons réels en portent)', () => {
    const d: Row = { SpawnID_Pos0: '401010011, 401010012', SpawnID_Pos1: '5', SpawnID_Pos2: '' };
    expect(spawnGroupIds(d)).toEqual(['401010011', '401010012', '5']);
  });

  it('colonnes absentes → aucun groupe (pas de crash)', () => {
    expect(spawnGroupIds({})).toEqual([]);
  });
});

describe('spawnUnits — slots ID0..ID3', () => {
  it('lit les QUATRE slots (le bug historique de sources.ts ne lisait qu’ID0)', () => {
    const rows: Row[] = [{ ID0: 'a', ID1: 'b', ID2: 'c', ID3: 'd' }];
    expect(spawnUnits(rows)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('éclate les CSV et dédoublonne dans l’ordre des tables', () => {
    const rows: Row[] = [{ ID0: 'a, b' }, { ID0: 'b', ID1: 'c' }];
    expect(spawnUnits(rows)).toEqual(['a', 'b', 'c']);
  });
});

describe('dungeonSpawnedMonsters — traversée complète', () => {
  const spawnsByGroup = new Map<string, Row[]>([
    ['g1', [{ ID0: 'm1', ID1: 'm2' }]],
    ['g2', [{ ID0: 'm2, m3' }]],
  ]);

  it('donjon → groupes → unités, dédupliqué inter-groupes', () => {
    const d: Row = { SpawnID_Pos0: 'g1', SpawnID_Pos1: 'g2' };
    expect(dungeonSpawnedMonsters(d, spawnsByGroup)).toEqual(['m1', 'm2', 'm3']);
  });

  it('donjon absent → accumulateur rendu tel quel', () => {
    expect(dungeonSpawnedMonsters(undefined, spawnsByGroup)).toEqual([]);
  });

  it('`into` ACCUMULE sur plusieurs donjons (usage content-schedule)', () => {
    const acc: string[] = [];
    dungeonSpawnedMonsters({ SpawnID_Pos0: 'g1' }, spawnsByGroup, acc);
    dungeonSpawnedMonsters({ SpawnID_Pos0: 'g2' }, spawnsByGroup, acc);
    expect(acc).toEqual(['m1', 'm2', 'm3']);
  });

  it('groupe inconnu du donjon → ignoré sans bruit', () => {
    expect(dungeonSpawnedMonsters({ SpawnID_Pos0: 'inconnu' }, spawnsByGroup)).toEqual([]);
  });
});

// ─── 2. Invariants sur la donnée committée ───────────────────────────────────

// Au BUILD, EncountersData est ÉCLATÉ : `dungeons` → encounters.json ;
// modes/rankOptions/rewardTables/geas → glossaries.json ; les spawns inverses
// (MonsterEncounters) sont fusionnés dans chaque monstre de monsters.json.
const dungeons = encountersData as unknown as Record<string, DungeonRef>;
const glossaries = glossariesData as unknown as {
  rankOptions: Record<string, RankOption>;
  rewardTables: Record<string, RewardTable>;
  geas: Record<string, GuildRaidGeas>;
};
const monsters = monstersData as unknown as Record<string, { spawns?: MonsterSpawn[] }>;
const monsterIds = new Set(Object.keys(monsters));
const dungeonEntries = Object.entries(dungeons);

describe('encounters.json — invariants référentiels', () => {
  it('chaque monstre d’un donjon existe dans monsters.json', () => {
    const orphans: string[] = [];
    for (const [id, d] of dungeonEntries) {
      for (const m of d.monsters ?? []) {
        if (!monsterIds.has(m.id)) orphans.push(`${id} → ${m.id}`);
      }
    }
    expect(orphans).toEqual([]);
  });

  it('chaque réf de butin (reward/rewardWin/rewardLose) existe dans rewardTables', () => {
    const missing: string[] = [];
    for (const [id, d] of dungeonEntries) {
      for (const ref of [d.reward, d.rewardWin, d.rewardLose]) {
        if (ref && !glossaries.rewardTables[ref]) missing.push(`${id} → ${ref}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('chaque geas de récompense (guild raid) existe dans le glossaire geas', () => {
    const missing: string[] = [];
    for (const [id, d] of dungeonEntries) {
      for (const g of d.geasRewards ?? []) {
        if (!glossaries.geas[g]) missing.push(`${id} → ${g}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('chaque option de palier (ranks) existe dans rankOptions', () => {
    const missing: string[] = [];
    for (const [id, d] of dungeonEntries) {
      for (const r of d.ranks ?? []) {
        for (const o of r.options ?? []) {
          if (!glossaries.rankOptions[o]) missing.push(`${id} → ${o}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it('vagues : tout-ou-rien par donjon, 1-based, non-décroissantes', () => {
    // Contrat de `DungeonMonster.wave` : ÉMIS SEULEMENT si le donjon a
    // plusieurs groupes (absent = combat en une vague), et la dédup garde la
    // PREMIÈRE occurrence d'un monstre — des trous dans la séquence sont donc
    // légitimes (une vague entière de doublons disparaît de la liste). Ce qui
    // doit tenir : pas de mélange avec/sans dans un même donjon, valeurs ≥ 1,
    // ordre du tableau = ordre d'engagement (non-décroissant).
    const bad: string[] = [];
    for (const [id, d] of dungeonEntries) {
      const ms = (d.monsters ?? []) as DungeonMonster[];
      if (!ms.length) continue;
      const withWave = ms.filter((m) => m.wave !== undefined);
      if (withWave.length !== 0 && withWave.length !== ms.length) {
        bad.push(`${id} : mélange avec/sans wave`);
        continue;
      }
      let prev = 1;
      for (const m of withWave) {
        if (m.wave! < 1 || m.wave! < prev) {
          bad.push(`${id} : vague ${prev} → ${m.wave}`);
          break;
        }
        prev = m.wave!;
      }
    }
    expect(bad).toEqual([]);
  });

  it('spawns inverses : chaque spawn d’un monstre pointe un donjon extrait', () => {
    const orphans: string[] = [];
    for (const [mid, m] of Object.entries(monsters)) {
      for (const s of m.spawns ?? []) {
        if (!dungeons[s.dungeon]) orphans.push(`${mid} → ${s.dungeon}`);
      }
    }
    expect(orphans).toEqual([]);
  });

  it('cohérence aller-retour : un monstre listé par un donjon a le spawn inverse', () => {
    const missing: string[] = [];
    for (const [id, d] of dungeonEntries) {
      // ARCHIVE (`retired`, posé par la rétention de promote) : le jeu a retiré
      // ce donjon, les spawns de ses monstres — recalculés sur le présent — ne
      // pointent légitimement plus vers lui. L'invariant ne vaut que pour le
      // contenu VIVANT.
      if (d.retired) continue;
      for (const m of d.monsters ?? []) {
        const spawns = monsters[m.id]?.spawns ?? [];
        if (!spawns.some((s) => s.dungeon === id)) missing.push(`${id} → ${m.id}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('un `group` est partagé par ≥ 1 donjon et ne mélange pas les modes de contenu', () => {
    // Un même combat à plusieurs difficultés reste dans la même famille de
    // mode (guild_raid_* / tower_* …) : un `group` qui traverserait deux
    // contenus différents casserait BossEncounters (sélecteur de difficulté).
    const byGroup = new Map<string, DungeonRef[]>();
    for (const d of Object.values(dungeons)) {
      if (d.group) byGroup.set(d.group, [...(byGroup.get(d.group) ?? []), d]);
    }
    expect(byGroup.size).toBeGreaterThan(0);
    const mixed: string[] = [];
    for (const [g, refs] of byGroup) {
      const families = new Set(refs.map((r) => r.mode.split('_')[0]));
      if (families.size > 1) mixed.push(`${g} : ${[...families].join(', ')}`);
    }
    expect(mixed).toEqual([]);
  });
});
