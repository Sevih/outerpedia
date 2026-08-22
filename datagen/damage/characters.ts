/**
 * Extracteur DAMAGE #1a — PERSONNAGES JOUABLES : identité, stats de base,
 * évolution, kit offensif et chaînes de hits.
 *
 * Module SÉPARÉ des générateurs d'affichage (décision Sevih 26/07/2026,
 * principes actés dans docs/specs/damage-data-mapping.md § 9) : valeurs BRUTES
 * du jeu dans les unités des formules (‰, plats, IDs, enums `ST_*`/`CET_*`
 * tels quels) — aucun arrondi, aucun renommage cosmétique, aucune curation.
 * La mise en forme est le travail de l'UI du calculateur.
 *
 * Jointure skill → hits : la colonne `SkillID` de `CharacterDamageTemplet`
 * (CSV de skills servis par la même chaîne — ex. le S2 de base ET ses états
 * burst 1/2) couvre 1506/1542 lignes ; le reliquat sans `SkillID` est composé
 * de templets communs (`DT_*`, `Skip_Finish_*`) affectés par AnimationEvents
 * (spec formule § 12.4) — un skill à `DamageFactor > 0` sans aucune ligne de
 * hits est marqué `hitsUnresolved`, jamais comblé par une supposition.
 *
 * La clé de chaîne (`chain`/`hit`) est DÉRIVÉE de la convention d'ID
 * (`<charId>_Skill_<n>[_<variante>]_<hit>`) : c'est une indication, l'ID brut
 * fait foi et reste porté par chaque ligne.
 *
 * GARDE DE SORTIE : seuls les persos du roster validé sont émis — cf.
 * `roster.ts` (commun aux extracteurs damage).
 */
import { burstAPCosts } from '../lib/burst';
import { groupBy, indexBy, loadTable, num, bool, splitCsv, type Row } from '../lib/tables';
import { buildClipIndex, resolveSkillClips, type DamageSkillClip } from './clips';
import { integratedIds } from './roster';

/** Paire Min/Max d'une stat du templet (colonnes brutes, niveau 1 → max). */
export interface DamageStatPair {
  min: number;
  max: number;
}

/** Une ligne d'évolution (les bonus sont PLATS et se CUMULENT — spec § 17.3). */
export interface DamageEvolutionLine {
  level: number;
  rewards: { stat: string; value: number }[];
}

/** Un niveau de skill (`CharacterSkillLevelTemplet`, valeurs brutes). */
export interface DamageSkillLevel {
  level: number;
  /** ‰ de l'ATK — facteur TOTAL de la compétence (spec § 8.1). */
  damageFactor: number;
  wgReduce: number;
  /** Références `BuffTemplet` (résolues par l'extracteur buffs, à venir). */
  buffIds: string[];
  cool: number;
  startCool: number;
}

/** Une ligne de `CharacterDamageTemplet` (un hit, ou un templet multi-hit). */
export interface DamageHit {
  /** ID brut — fait foi (la clé `chain` n'est qu'une dérivation de convention). */
  id: string;
  /** Clé de chaîne dérivée (ID sans l'index de hit final). */
  chain: string;
  /** Index du hit dans la chaîne (1 si l'ID n'en porte pas). */
  hit: number;
  /** ‰ du facteur total du skill porté par ce hit (spec § 8.3). */
  damageFactor: number;
  damageType: string;
  multiHit: boolean;
  maxHitCount: number;
  isAdditive: boolean;
}

/** Un skill du kit (partagé entre persos pour les passifs de classe). */
export interface DamageSkill {
  id: string;
  /** `SKT_*` (FIRST, SECOND, ULTIMATE, BURST_1..3, STRIKE, BACKUP, passifs…). */
  type: string;
  subType: string;
  targetTeamType: string;
  rangeType: string;
  levels: DamageSkillLevel[];
  /**
   * Coûts d'AP des bursts 1/2/3 (`RequireAP` en CSV) — présent UNIQUEMENT sur
   * le skill « burstable » du perso (même signal que le générateur skills) :
   * les déclinaisons `SKT_BURST_1..3` se rattachent à SON slot (S1 chez
   * Caren/Valentine, S2 chez la plupart), pas à un slot supposé.
   */
  burstAP?: number[];
  /** Lignes de `CharacterDamageTemplet` dont `SkillID` référence ce skill. */
  hits: DamageHit[];
  /**
   * `DamageFactor > 0` à au moins un niveau mais AUCUNE ligne de hits par la
   * jointure `SkillID` : l'affectation vit dans les AnimationEvents (spec
   * § 12.4), non extraite — incertitude documentée, jamais comblée.
   */
  hitsUnresolved?: boolean;
  /**
   * Clips d'animation jouant les chaînes de ce skill (spec § 8.1 : le facteur
   * total et le rattrapage § 8.3 se calculent PAR CLIP) — séquence réelle des
   * `EventAttackStart`, facteurs résolus globalement. Cf. clips.ts.
   */
  clips?: DamageSkillClip[];
  /** Chaînes aux clips candidats AMBIGUS (règle 3 de clips.ts) — le moteur
   *  retombe sur l'heuristique § 12.4 pour ces états. */
  clipsUnresolvedChains?: string[];
}

/** Un personnage jouable (`Type == CT_PC`). */
export interface DamageCharacter {
  id: string;
  element: string;
  class: string;
  subClass: string;
  race: string;
  basicStar: number;
  /** Paires Min/Max présentes au templet, clés = noms de colonnes sans suffixe. */
  baseStats: Record<string, DamageStatPair>;
  evolution: DamageEvolutionLine[];
  /** Slot templet (`Skill_<n>`) → ID de skill. */
  skills: { slot: number; id: string }[];
}

export interface DamageCharactersData {
  characters: Record<string, DamageCharacter>;
  skills: Record<string, DamageSkill>;
}

/**
 * Stats de COMBAT du templet (celles que consomment CalcFinalStat et les
 * formules § 7/§ 8) — les paires hors calcul de dégâts (or, XP, BP) sont hors
 * périmètre (spec report-inputs § 4). `MonsterTemplet` porte les MÊMES
 * colonnes : l'extracteur targets réutilise cette liste.
 */
export const COMBAT_STAT_PAIRS = [
  'HP',
  'WG',
  'Speed',
  'Atk',
  'Def',
  'DMGReduceRate',
  'CriticalRate',
  'CriticalDMGRate',
  'PiercePower',
  'PiercePowerRate',
  'Vampiric',
  'HitHPRecovery',
  'Accuracy',
  'Avoid',
  'BuffChance',
  'BuffResist',
  'CounterRate',
  'AvoidAddCap',
  'AvoidSubtractCap',
  'DamageBoost',
  'EnemyCriticalDamageReduce',
] as const;

/** Nombre max de slots `Skill_<n>` au templet (colonnes 1..23 en 1.4.9). */
const MAX_SKILL_SLOTS = 23;

/**
 * Dérive (chaîne, index de hit) d'un ID de damage templet : l'index est le
 * `_<n>` final, avec un garde-fou pour ne pas manger le NUMÉRO DE SKILL des
 * chaînes mono-ligne sans index (`2000001_Skill_5` reste entier).
 */
export function chainOf(id: string): { chain: string; hit: number } {
  const m = id.match(/^(.*)_(\d+)$/);
  if (!m || /^\d+_Skill$/.test(m[1])) return { chain: id, hit: 1 };
  return { chain: m[1], hit: parseInt(m[2], 10) };
}

export function buildDamageCharacters(): DamageCharactersData {
  const roster = integratedIds();
  const templet = loadTable('CharacterTemplet').filter(
    (c) => c.Type === 'CT_PC' && (!roster || roster.has(c.ID)),
  );
  const skillTemplet = indexBy(loadTable('CharacterSkillTemplet'));
  const levelsBySkill = groupBy(loadTable('CharacterSkillLevelTemplet'), 'SkillID');
  const evolutionByChar = groupBy(loadTable('CharacterEvolutionStatTemplet'), 'CharacterID');

  // Hits par skill : une ligne CSV `SkillID=5502,5519,5520` sert la MÊME chaîne
  // à plusieurs skills (base + états burst) — elle est rattachée à chacun.
  const hitsBySkill = new Map<string, DamageHit[]>();
  for (const d of loadTable('CharacterDamageTemplet')) {
    const skillIds = splitCsv(d.SkillID);
    if (!skillIds.length) continue; // templets communs/skip → AnimationEvents (§ 12.4)
    const { chain, hit } = chainOf(d.ID);
    const row: DamageHit = {
      id: d.ID,
      chain,
      hit,
      damageFactor: num(d.DamageFactor),
      damageType: d.DamageType ?? '',
      multiHit: bool(d.MultiHit),
      maxHitCount: num(d.MaxHitCount),
      isAdditive: bool(d.IsAdditiveAttack),
    };
    for (const sid of skillIds) {
      const bucket = hitsBySkill.get(sid);
      if (bucket) bucket.push(row);
      else hitsBySkill.set(sid, [row]);
    }
  }

  const clipIndex = buildClipIndex();

  const buildSkill = (id: string): DamageSkill => {
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
    // Tri ORDINAL (pas localeCompare) : la sortie est canonique et committée —
    // elle ne doit pas dépendre de la locale de la machine qui la régénère.
    const ord = (x: string, y: string): number => (x < y ? -1 : x > y ? 1 : 0);
    const hits = (hitsBySkill.get(id) ?? [])
      .slice()
      .sort((a, b) => ord(a.chain, b.chain) || a.hit - b.hit || ord(a.id, b.id));
    const offensive = levels.some((l) => l.damageFactor > 0);
    // Burstable : règle PARTAGÉE avec le générateur skills (datagen/lib/burst)
    // — les deux artefacts doivent porter le même marqueur (garde croisée).
    const burstCosts = burstAPCosts(s?.RequireAP);
    return {
      id,
      type: s?.SkillType ?? '',
      subType: s?.SkillSubType ?? '',
      targetTeamType: s?.TargetTeamType ?? '',
      rangeType: s?.RangeType ?? '',
      levels,
      ...(burstCosts ? { burstAP: burstCosts } : {}),
      hits,
      ...(offensive && !hits.length ? { hitsUnresolved: true } : {}),
      ...resolveSkillClips(clipIndex, s?.TriggerName, s?.TriggerNameSkip, hits),
    };
  };

  const characters: Record<string, DamageCharacter> = {};
  const skills: Record<string, DamageSkill> = {};
  for (const c of templet) {
    const baseStats: Record<string, DamageStatPair> = {};
    for (const stat of COMBAT_STAT_PAIRS) {
      const min = num(c[`${stat}_Min`]);
      const max = num(c[`${stat}_Max`]);
      if (min !== 0 || max !== 0) baseStats[stat] = { min, max };
    }

    const evolution: DamageEvolutionLine[] = (evolutionByChar.get(c.ID) ?? [])
      .map((e: Row) => {
        const rewards: DamageEvolutionLine['rewards'] = [];
        for (let i = 1; i <= 3; i++) {
          const stat = e[`RewardStatType_${i}`];
          if (stat && stat !== 'ST_NONE') rewards.push({ stat, value: num(e[`RewardValue_${i}`]) });
        }
        return { level: num(e.EvolutionLevel), rewards };
      })
      .sort((a, b) => a.level - b.level);

    const charSkills: DamageCharacter['skills'] = [];
    for (let slot = 1; slot <= MAX_SKILL_SLOTS; slot++) {
      const sid = c[`Skill_${slot}`];
      if (!sid || sid === '0') continue;
      charSkills.push({ slot, id: sid });
      if (!skills[sid]) skills[sid] = buildSkill(sid);
    }

    characters[c.ID] = {
      id: c.ID,
      element: c.Element ?? '',
      class: c.Class ?? '',
      subClass: c.SubClass ?? '',
      race: c.Race ?? '',
      basicStar: num(c.BasicStar),
      baseStats,
      evolution,
      skills: charSkills,
    };
  }

  return { characters, skills };
}
