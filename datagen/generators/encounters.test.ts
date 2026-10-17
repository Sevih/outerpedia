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
 * `buildEncounters()`, et le seul bloc qui lit des tables du jeu (`loadTable`,
 * contextes de Monad Gate et d'infiltration rejoints au client) se saute
 * quand elles sont absentes.
 */
import { describe, expect, it } from 'vitest';
import encountersData from '../../data/generated/encounters.json';
import glossariesData from '../../data/generated/glossaries.json';
import rewardTablesData from '../../data/generated/reward-tables.json';
import monstersData from '../../data/generated/monsters.json';
import towersData from '../../data/generated/towers.json';
import { loadTable, splitCsv, tablesStamp, type Row } from '../lib/tables';
import type { TowersData } from './towers';
import {
  dungeonSpawnedMonsters,
  isFormationPool,
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

describe('isFormationPool — un groupe multi-lignes est un pool de formations', () => {
  it('une ligne = une vague jouée telle quelle ; plusieurs = formations ALTERNATIVES', () => {
    expect(isFormationPool([])).toBe(false);
    expect(isFormationPool([{ ID0: 'a' }])).toBe(false);
    expect(isFormationPool([{ ID0: 'a' }, { ID0: 'b' }])).toBe(true);
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
// modes/rankOptions/geas → glossaries.json ; `rewardTables` → reward-tables.json
// (sorti du glossaire le 2026-07-23, cf. build.ts) ; les spawns inverses
// (MonsterEncounters) sont fusionnés dans chaque monstre de monsters.json.
const dungeons = encountersData as unknown as Record<string, DungeonRef>;
const glossaries = glossariesData as unknown as {
  rankOptions: Record<string, RankOption>;
  geas: Record<string, GuildRaidGeas>;
};
const rewardTables = rewardTablesData as unknown as Record<string, RewardTable>;
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
        if (ref && !rewardTables[ref]) missing.push(`${id} → ${ref}`);
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

  it('vagues : tout-ou-rien par donjon, 1-based, non-décroissantes, counts ≥ 2', () => {
    // Contrat de `DungeonMonster.wave` : ÉMIS SEULEMENT si le donjon a
    // plusieurs groupes (absent = combat en une vague). La dédup est PAR
    // VAGUE (06/08/2026 — les vagues du calculateur) : un monstre répété DANS
    // sa vague porte `count` (≥ 2 quand présent, jamais 1 sérialisé), répété
    // sur plusieurs vagues il a une entrée par vague — un même (id, niveau)
    // ne se répète donc JAMAIS au sein d'une vague. Ce qui doit tenir en
    // plus : pas de mélange avec/sans dans un même donjon, valeurs ≥ 1,
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
      const seen = new Set<string>();
      for (const m of ms) {
        if (m.count !== undefined && m.count < 2) bad.push(`${id} : count ${m.count} sérialisé`);
        // Dans un pool, l'unité de dédup est la FORMATION (cf. test suivant).
        const key = `${m.wave ?? 1}|${m.formation ?? 0}|${m.id}|${m.level}`;
        if (seen.has(key)) bad.push(`${id} : doublon intra-vague ${key}`);
        seen.add(key);
      }
    }
    expect(bad).toEqual([]);
  });

  describe('formations alternatives — un pool n’est pas une vague (tour very hard)', () => {
    /** Formations d'un donjon : numéro → unités `id@niveau`, `count` déplié. */
    const formationsOf = (d: DungeonRef): string[][] => {
      const out: string[][] = [];
      for (const m of (d.monsters ?? []) as DungeonMonster[]) {
        if (m.formation === undefined) continue;
        const units = (out[m.formation - 1] ??= []);
        for (let i = 0; i < (m.count ?? 1); i++) units.push(`${m.id}@${m.level}`);
      }
      return out;
    };
    const pooled = dungeonEntries.filter(([, d]) =>
      ((d.monsters ?? []) as DungeonMonster[]).some((m) => m.formation !== undefined),
    );

    it('un pool aligne plusieurs formations, sans vague, un boss chacune', () => {
      // Le cas qui a révélé le défaut (40103001, very hard 1F) : les 12 lignes
      // du groupe sortaient aplaties en UNE vague de 35 entrées, trois adds
      // marqués « ×2 » parce qu'ils servent dans deux formations. La règle vaut
      // pour tout pool ; la composition exacte d'un étage, elle, suit les patchs.
      // (Le `count` DANS une formation est couvert par la parité avec
      // towers.json ci-dessous, qui le déplie.)
      const bad: string[] = [];
      for (const [id, d] of pooled) {
        const ms = d.monsters as DungeonMonster[];
        const formations = formationsOf(d);
        if (formations.length < 2) bad.push(`${id} : ${formations.length} formation(s)`);
        if (ms.some((m) => m.wave !== undefined)) bad.push(`${id} : vague dans un pool`);
        formations.forEach((_, i) => {
          const bosses = ms.filter((m) => m.formation === i + 1 && m.role === 'boss');
          if (bosses.length !== 1) bad.push(`${id} : formation ${i + 1}, ${bosses.length} boss`);
        });
      }
      expect(bad).toEqual([]);
    });

    it('émis sur les seuls étages very hard, tout-ou-rien, numéros 1..N en ordre', () => {
      // Un pool ailleurs que sur la tour very hard = donnée du jeu nouvelle :
      // les lecteurs (`encounterFormations`, picker du calculateur) sont à
      // revoir avant de laisser passer.
      expect(pooled.length).toBeGreaterThan(0);
      const bad: string[] = [];
      for (const [id, d] of pooled) {
        const ms = d.monsters as DungeonMonster[];
        if (d.mode !== 'tower_very_hard') bad.push(`${id} : pool en mode ${d.mode}`);
        if (ms.some((m) => m.formation === undefined)) bad.push(`${id} : mélange avec/sans`);
        let prev = 1;
        for (const m of ms) {
          const n = m.formation ?? 0;
          if (n !== prev && n !== prev + 1) bad.push(`${id} : formation ${prev} → ${n}`);
          prev = n;
        }
      }
      expect(bad).toEqual([]);
    });

    it('mêmes formations que `towers.json` (`encounters`), étage par étage', () => {
      // Deux générateurs, UNE règle (`isFormationPool`) : ils ne peuvent plus
      // raconter deux compositions différentes du même étage.
      const floors = (towersData as unknown as TowersData).tower_very_hard.floors;
      expect(floors.map((f) => f.dungeon).sort()).toEqual(pooled.map(([id]) => id).sort());
      for (const f of floors) {
        const expected = (f.encounters ?? []).map((u) => u.map((x) => `${x.id}@${x.level}`).sort());
        const actual = formationsOf(dungeons[f.dungeon]).map((u) => [...u].sort());
        expect(actual, f.dungeon).toEqual(expected);
      }
    });
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

// ─── 3. Contextes de nœud (Monad Gate, infiltration) ─────────────────────────

/** Clé d'un contexte de combat : niveau + adv (PV, ATK, DEF, VIT). */
const ctxKey = (level: number | undefined, adv: DungeonRef['adv']): string =>
  `${level ?? 0}|${adv?.hp ?? 0}|${adv?.atk ?? 0}|${adv?.def ?? 0}|${adv?.spd ?? 0}`;

describe('encounters.json — paliers de Monad Gate et adv d’infiltration', () => {
  it('un palier de Monad Gate a un niveau, ni nom, ni stage, ni PV, et aucun doublon', () => {
    const bad: string[] = [];
    for (const [id, d] of dungeonEntries) {
      if (d.mode !== 'monad_battle_1' || !d.ranks) continue;
      const keys = d.ranks.map((r) => ctxKey(r.level, r.adv));
      if (new Set(keys).size !== keys.length) bad.push(`${id} : doublon`);
      for (const r of d.ranks)
        if (!r.level || r.name !== undefined || r.stage !== undefined || r.hp !== undefined)
          bad.push(`${id} : ${JSON.stringify(r)}`);
    }
    expect(bad).toEqual([]);
  });

  it('`advLinked` ne se pose que sur un donjon d’infiltration qui a une adv', () => {
    const bad = dungeonEntries
      .filter(([, d]) => d.advLinked && (d.mode !== 'irregular_infiltrate' || !d.adv))
      .map(([id]) => id);
    expect(bad).toEqual([]);
  });
});

const HAS_GAME_TABLES = !tablesStamp([
  'MonadGateNodeTemplet',
  'IrregularInfiltrateNodeTemplet',
]).includes('absent');

/** Adv d'une ligne de nœud, au format de `DungeonAdv` (zéros absents). */
const advOfRow = (r: Row): DungeonRef['adv'] => {
  const adv: NonNullable<DungeonRef['adv']> = {};
  const n = (k: string) => Number(r[`SpawnAdvantageRate_${k}`] ?? 0);
  if (n('HP')) adv.hp = n('HP');
  if (n('Atk')) adv.atk = n('Atk');
  if (n('Def')) adv.def = n('Def');
  if (n('Spd')) adv.spd = n('Spd');
  return Object.keys(adv).length ? adv : undefined;
};

describe.skipIf(!HAS_GAME_TABLES)('contextes de nœud — rejoints aux tables du jeu', () => {
  it('Monad Gate : un palier par couple (niveau, adv) distinct des nœuds qui mènent au donjon', () => {
    // Les deux chemins du client : Row1..Row10 → stage → DungeonID, et nœud
    // d'événement → événement MGET_BATTLE (le combat garde le nœud hôte).
    const stages = new Map<string, Row[]>();
    for (const r of loadTable('MonadGateNodeStageTemplet'))
      stages.set(r.GroupID ?? '', [...(stages.get(r.GroupID ?? '') ?? []), r]);
    const events = new Map<string, Row[]>();
    for (const r of loadTable('MonadGateEventTemplet'))
      events.set(r.EventGroupID ?? '', [...(events.get(r.EventGroupID ?? '') ?? []), r]);
    const expected = new Map<string, Set<string>>();
    const add = (did: string | undefined, key: string) => {
      if (!did || dungeons[did]?.mode !== 'monad_battle_1') return;
      expected.set(did, (expected.get(did) ?? new Set()).add(key));
    };
    for (const n of loadTable('MonadGateNodeTemplet')) {
      const key = ctxKey(Number(n.MonadGateStageLevel ?? 0), advOfRow(n));
      for (let i = 1; i <= 10; i++)
        for (const s of stages.get(n[`Row${i}`] ?? '') ?? []) {
          add(s.DungeonID, key);
          if (s.NodeType === 'MGNT_EVENT')
            for (const ev of events.get(s.EventGroupID ?? '') ?? [])
              if (ev.EventType === 'MGET_BATTLE') add(ev.DungeonID, key);
        }
    }
    expect(expected.size).toBeGreaterThan(0);
    const diff: string[] = [];
    for (const [id, d] of dungeonEntries) {
      if (d.mode !== 'monad_battle_1') continue;
      const want = [...(expected.get(id) ?? [])].sort();
      const got = (d.ranks ?? []).map((r) => ctxKey(r.level, r.adv)).sort();
      if (JSON.stringify(want) !== JSON.stringify(got)) diff.push(id);
    }
    expect(diff).toEqual([]);
  });

  it('infiltration : l’adv du nœud seul, `advLinked` si et seulement si un nœud lié a une adv', () => {
    const nodes = loadTable('IrregularInfiltrateNodeTemplet');
    const byId = new Map(nodes.map((n) => [n.ID, n]));
    const node = new Map(nodes.filter((n) => n.NodeDungeonID).map((n) => [n.NodeDungeonID, n]));
    expect(node.size).toBeGreaterThan(0);
    const bad: string[] = [];
    for (const [id, d] of dungeonEntries) {
      if (d.mode !== 'irregular_infiltrate') continue;
      const n = node.get(id);
      if (!n) continue;
      if (ctxKey(0, d.adv) !== ctxKey(0, advOfRow(n))) bad.push(`${id} : adv`);
      const linked = splitCsv(n.LinkNode ?? '').some((l) => {
        const ln = byId.get(l);
        return ln !== undefined && advOfRow(ln) !== undefined;
      });
      if (Boolean(d.advLinked) !== linked) bad.push(`${id} : advLinked`);
    }
    expect(bad).toEqual([]);
  });
});
