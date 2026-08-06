/**
 * Extracteur DAMAGE #4 — CIBLES PvE : les monstres visés par les presets du
 * calculateur (stats brutes, immunités, kit pour les passifs défensifs, break).
 *
 * CLÉ DE LIAISON — l'ID de monstre (`MonsterTemplet.ID`) : c'est déjà la clé
 * des presets de l'UI (`${encounterId}:${bossId}`, cf. le wrapper serveur du
 * calculateur), de `data/generated/monsters.json` et des tables brutes. Aucune
 * clé nouvelle n'est inventée.
 *
 * SPAWNS NON RÉ-EXTRAITS (décision de conception, 03/08/2026) : les contextes
 * de rencontre (niveau réel, `SpawnAdvantageRate_*` ‰, PV de boss, paliers)
 * vivent déjà EN BRUT dans `data/generated/encounters.json` — la couche preset
 * les fournit au moteur comme ENTRÉES DE SCÉNARIO (report-inputs § 3.3), et la
 * formule partagée `statAt` (src/lib/monster-stats, vérifiée in-game) fait
 * l'interpolation niveau + adv. Re-jointer ici les 11 tables de contenu aurait
 * créé une DEUXIÈME liste de contenus à curer en concurrence avec l'affichage.
 * `TransLevel` des paliers = niveau du palier SUIVANT (chaîne de level-up des
 * boss à score, 0 = dernier), PAS une transcendance — vérifié binaire
 * 03/08/2026 (`CCustomBossData.ChangeNextLevelData` : seul `BaseLevel` passe
 * à `set_Level`, `TransLevel` ne gate que « y a-t-il un palier suivant »).
 *
 * BUFFS DE PALIER (`rankBuffIds`) : à chaque changement de palier le jeu
 * applique la `BuffList` du templet de palier via `CreateBuff` (même listing
 * binaire) — les passifs de rang (ex. « Pénétration +30 % » de la
 * Singularity) sont de VRAIS buffs. On collecte les `OptionID` des 4 tables
 * de palier (schéma partagé `CCustomBossLevelTemplet`) pour la fermeture de
 * l'extracteur buffs ; QUELS buffs s'appliquent à quel palier reste porté par
 * les presets (`encounters.json`, champ `options` des rangs).
 *
 * KIT SANS CHAÎNES DE HITS : la jointure `SkillID` des persos n'existe pas
 * côté monstres (`MonsterDamageTemplet` : 0 ligne sur 961 ne la porte — les
 * hits monstres suivent la seule convention d'ID), et le rapport ne calcule
 * JAMAIS les dégâts de la cible (report-inputs § 1) : on extrait le kit pour
 * ses `BuffID` (passifs défensifs — réductions, auras, enrage) et ses types,
 * pas ses hits.
 *
 * GARDE DE SORTIE : tout monstre d'une rencontre peuplée et non retirée
 * d'`encounters.json` est émis — boss ET renforts (preuve d'intégration, même
 * philosophie que `roster.ts`). Historique : boss seuls jusqu'au 06/08/2026 ;
 * le picker story liste désormais les VAGUES complètes d'un stage (demande
 * Sevih), donc chaque monstre spawné doit être ciblable en preset. La cible
 * manuelle couvre ce qui ne spawne nulle part.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { groupBy, indexBy, loadTable, num, splitCsv, type Row } from '../lib/tables';
import { COMBAT_STAT_PAIRS, type DamageSkillLevel, type DamageStatPair } from './characters';

/** Un skill de monstre — mêmes niveaux bruts que les persos, SANS hits. */
export interface DamageTargetSkill {
  id: string;
  type: string;
  subType: string;
  targetTeamType: string;
  rangeType: string;
  levels: DamageSkillLevel[];
}

/** Enrage (`RageTemplet`, indexé par monstre) — paliers bruts. */
export interface DamageTargetRage {
  /** `HP_RATE` (‰ des PV max), `LOSE_HP_VALUE`, `TURN_COUNT`. */
  trigger: string;
  steps: { value: number; duration: number }[];
  /** Buffs posés à l'état BREAK (CSV éclaté) — ils changent les dégâts reçus. */
  breakBuffIds: string[];
}

/** Une cible de preset (`MonsterTemplet`, valeurs brutes). */
export interface DamageTarget {
  id: string;
  element: string;
  class: string;
  subClass: string;
  race: string;
  basicStar: number;
  /** Paires Min/Max présentes au templet (mêmes colonnes que les persos). */
  baseStats: Record<string, DamageStatPair>;
  /** `BT_*` bloqués (CSV éclaté) — CheckResist court-circuité (spec § 5). */
  buffImmune?: string[];
  /** `ST_*` bloqués côté débuffs de stats. */
  statBuffImmune?: string[];
  rage?: DamageTargetRage;
  /** Slot templet (`Skill_<n>`) → ID de skill. */
  skills: { slot: number; id: string }[];
}

export interface DamageTargetsData {
  targets: Record<string, DamageTarget>;
  skills: Record<string, DamageTargetSkill>;
  /** `OptionID` des tables de palier (buffs de rang, cf. en-tête) — distincts, triés. */
  rankBuffIds: string[];
}

/** Tables de palier au schéma `CCustomBossLevelTemplet` (colonne `OptionID`). */
const RANK_TABLES = [
  'GuildDungeonLevelTemplet',
  'WorldBossGradeTemplet',
  'SingularityGradeTemplet',
  'EventRankChallengeTemplet',
] as const;

/** Nombre max de slots `Skill_<n>` au templet monstre (colonnes 1..23 en 1.4.9). */
const MAX_SKILL_SLOTS = 23;

/**
 * IDs des monstres (boss ET renforts) des rencontres vivantes — la preuve
 * d'intégration. `encounters.json` illisible → warn + `null` (pas de filtre),
 * comme roster.ts : on filtre sur une preuve, jamais sur une absence.
 */
export function presetMonsterIds(): Set<string> | null {
  try {
    const raw = readFileSync(resolve('data/generated/encounters.json'), 'utf8');
    const encounters = JSON.parse(raw) as Record<
      string,
      { retired?: boolean; monsters?: { id: string; role?: string }[] }
    >;
    const ids = new Set<string>();
    for (const ref of Object.values(encounters)) {
      if (ref.retired || !ref.monsters?.length) continue;
      for (const m of ref.monsters) ids.add(m.id);
    }
    if (ids.size) return ids;
    console.warn('⚠ encounters.json sans monstre — extraction targets SANS filtre.');
    return null;
  } catch {
    console.warn('⚠ data/generated/encounters.json illisible — extraction targets SANS filtre.');
    return null;
  }
}

export function buildDamageTargets(): DamageTargetsData {
  const gate = presetMonsterIds();
  const templet = loadTable('MonsterTemplet').filter((m) => !gate || gate.has(m.ID));
  const skillTemplet = indexBy(loadTable('MonsterSkillTemplet'));
  const levelsBySkill = groupBy(loadTable('MonsterSkillLevelTemplet'), 'SkillID');
  const rageByMonster = indexBy(loadTable('RageTemplet'));

  const buildSkill = (id: string): DamageTargetSkill => {
    const s = skillTemplet.get(id);
    const levels: DamageSkillLevel[] = (levelsBySkill.get(id) ?? [])
      .map((l: Row) => ({
        level: num(l.SkillLevel),
        damageFactor: num(l.DamageFactor),
        wgReduce: num(l.WGReduce),
        buffIds: splitCsv(l.BuffID),
        cool: num(l.Cool),
        startCool: num(l.StartCool),
      }))
      .sort((a, b) => a.level - b.level);
    return {
      id,
      type: s?.SkillType ?? '',
      subType: s?.SkillSubType ?? '',
      targetTeamType: s?.TargetTeamType ?? '',
      rangeType: s?.RangeType ?? '',
      levels,
    };
  };

  const targets: Record<string, DamageTarget> = {};
  const skills: Record<string, DamageTargetSkill> = {};
  for (const m of templet) {
    const baseStats: Record<string, DamageStatPair> = {};
    for (const stat of COMBAT_STAT_PAIRS) {
      const min = num(m[`${stat}_Min`]);
      const max = num(m[`${stat}_Max`]);
      if (min !== 0 || max !== 0) baseStats[stat] = { min, max };
    }

    const targetSkills: DamageTarget['skills'] = [];
    for (let slot = 1; slot <= MAX_SKILL_SLOTS; slot++) {
      const sid = m[`Skill_${slot}`];
      if (!sid || sid === '0') continue;
      targetSkills.push({ slot, id: sid });
      if (!skills[sid]) skills[sid] = buildSkill(sid);
    }

    const buffImmune = splitCsv(m.BuffImmune);
    const statBuffImmune = splitCsv(m.StatBuffImmune);
    const rage = rageByMonster.get(m.ID);
    const rageSteps: DamageTargetRage['steps'] = [];
    if (rage) {
      for (const i of [1, 2] as const) {
        const value = num(rage[`TriggerValue${i}`]);
        if (value) rageSteps.push({ value, duration: num(rage[`RageDuration${i}`]) });
      }
    }

    targets[m.ID] = {
      id: m.ID,
      element: m.Element ?? '',
      class: m.Class ?? '',
      subClass: m.SubClass ?? '',
      race: m.Race ?? '',
      basicStar: num(m.BasicStar),
      baseStats,
      ...(buffImmune.length ? { buffImmune } : {}),
      ...(statBuffImmune.length ? { statBuffImmune } : {}),
      ...(rage && rage.TriggerType
        ? {
            rage: {
              trigger: rage.TriggerType,
              steps: rageSteps,
              breakBuffIds: splitCsv(rage.BreakBuffID).filter((b) => b !== '0'),
            },
          }
        : {}),
      skills: targetSkills,
    };
  }

  const rankRefs = new Set<string>();
  for (const table of RANK_TABLES)
    for (const r of loadTable(table))
      for (const b of splitCsv(r.OptionID)) if (b !== '0') rankRefs.add(b);
  // Tri ORDINAL : sortie canonique committée, indépendante de la locale.
  const rankBuffIds = [...rankRefs].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

  return { targets, skills, rankBuffIds };
}
