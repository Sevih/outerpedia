/**
 * CONTRAT PUBLIC des recommandations d'équipement — `GET /api/reco/:id`.
 *
 * Consommé par l'app desktop Gear Solver (repo séparé) pour sa fonction « Get
 * preset » : elle traduit cette réponse en filtres de solveur. La FORME est un
 * contrat gelé, repris tel quel de la V2 — ne pas la changer sans prévenir en
 * face, l'app parse chaque champ.
 *
 * Deux traductions séparent le curé V3 de ce que l'app attend :
 *
 *  1. VOCABULAIRE DE STATS. Le curé écrit les libellés d'affichage du wiki
 *     (« ATK% », « CHD ») ; le solveur ne connaît que ses clés moteur
 *     (`atkPct`, `critDmg`) et rejette tout le reste en « unknown stat ».
 *
 *  2. PALIER D'ÉQUIPEMENT. Le curé référence le membre BAS de famille (id 4,
 *     « Surefire Greatsword » 1★) parce que c'est la famille qui s'affiche sur
 *     le wiki. L'app, elle, résout l'effet unique via l'INVENTAIRE du joueur
 *     (`game.equipment[itemId].setId`), où l'objet possédé est le 6★ (id 754).
 *     On émet donc l'id canonique du palier max — exactement ce que la V2
 *     produisait, qui joignait par nom sur une table réduite aux 6★.
 *     Les variantes par classe (Briareos/Gorgon : 5 objets distincts, un passif
 *     chacun) sont déjà au palier max : elles passent telles quelles, et sont
 *     désormais RÉSOLUES — la V2 les renvoyait à `itemId: null`, ce qui faisait
 *     sauter le filtre d'effet côté app.
 */
import type { GearBuild, GearPresets, LangDict, SetComboPiece } from '@contracts';
import { loadGearPresets, loadGearReco } from '@/lib/data/gear-reco';
import { withClassSuffix } from '@/lib/data/equipment';
import weaponsData from '@data/generated/equipment/weapon.json';
import accessoryData from '@data/generated/equipment/accessory.json';
import setsData from '@data/generated/equipment/sets.json';
import familiesData from '@data/generated/equipment/families.json';
import passivesData from '@data/generated/equipment/passives.json';

/** Une pièce recommandée, dans le vocabulaire du solveur. */
export interface RecoGearStat {
  name: string;
  /** `GearPiece.itemId` du jeu, au palier MAX. `null` = non résolu (l'app
   *  saute le filtre d'effet et prévient). */
  itemId: number | null;
  /** Informatif seulement : plusieurs effets partagent la même icône. */
  effectIcon: string | null;
  /** OR-list de main stats acceptables pour cette pièce. */
  mainStat: string[];
}

/** Une condition d'un combo de sets (les conditions d'un combo sont en ET). */
export interface RecoSetStat {
  name: string;
  /** `armorSetId` en chaîne. `null` → l'app droppe le combo ENTIER. */
  setId: string | null;
  count: number;
}

export interface StructuredRecoBuild {
  /** OR-list d'alternatives. */
  Weapon?: RecoGearStat[];
  Amulet?: RecoGearStat[];
  /** OR-list de combos, chaque combo étant une ET-list de conditions. */
  Set?: RecoSetStat[][];
  /** Tiers ORDONNÉS, ex æquo dans un même tier. Tier 0 = priorité max. */
  SubstatPrio?: string[][];
}

export interface StructuredCharacterReco {
  id: string;
  builds: Record<string, StructuredRecoBuild>;
}

interface EquipEntry {
  name: LangDict;
  star?: number;
  classLimit?: string | null;
  passives?: { id: string }[];
}
interface FamilyEntry {
  id: string;
  topId: string;
  ids: string[];
  stars: number[];
  classLimits: string[];
}

const WEAPONS = weaponsData as unknown as Record<string, EquipEntry>;
const AMULETS = accessoryData as unknown as Record<string, EquipEntry>;
const SETS = setsData as unknown as Record<string, { name: { en: string } }>;
const PASSIVES = passivesData as unknown as Record<string, { icon?: string }>;
const FAMILIES = familiesData as unknown as {
  weapon: FamilyEntry[];
  accessory: FamilyEntry[];
};

/**
 * Libellé de stat du wiki → clé moteur du solveur (sa table `GAME_STAT`,
 * `gear-solver/packages/core/src/stats.ts`). Les alias historiques (crc, chd,
 * res, dmgRed) ne sont PAS acceptés en face : la traduction se fait ici.
 */
const STAT_KEY: Record<string, string> = {
  ATK: 'atk',
  'ATK%': 'atkPct',
  HP: 'hp',
  'HP%': 'hpPct',
  DEF: 'def',
  'DEF%': 'defPct',
  CHC: 'critRate', // ST_CRITICAL_RATE
  CHD: 'critDmg', // ST_CRITICAL_DMG_RATE
  SPD: 'spd', // ST_SPEED
  EFF: 'eff', // ST_BUFF_CHANCE
  RES: 'effRes', // ST_BUFF_RESIST
  'PEN%': 'pen', // ST_PIERCE_POWER_RATE
  'DMG UP%': 'dmgUp', // ST_DMG_BOOST
  'DMG RED%': 'dmgReduce', // ST_DMG_REDUCE_RATE
  'CDMG RED%': 'critDmgReduce', // ST_E_CRI_DMG_REDUCE
};

/** Libellé → clé moteur ; le libellé brut est conservé s'il est inconnu (le
 *  solveur le rejettera bruyamment plutôt que de filtrer sur du faux). */
function toStatKey(label: string): string {
  return STAT_KEY[label] ?? label;
}

/** « PEN%/CHD » → `['pen', 'critDmg']` (alternatives acceptables). */
function parseMainStat(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean)
    .map(toStatKey);
}

/** « ATK>CHC=EFF>CHD » → tiers ordonnés de clés ex æquo. */
function parseSubstatPrio(value: string | undefined): string[][] | undefined {
  if (!value) return undefined;
  const tiers = value
    .split('>')
    .map((tier) =>
      tier
        .split('=')
        .map((s) => s.trim())
        .filter(Boolean)
        .map(toStatKey),
    )
    .filter((tier) => tier.length > 0);
  return tiers.length > 0 ? tiers : undefined;
}

// Index membre → famille, construit une fois : les tables et `families.json`
// sont du GÉNÉRÉ importé statiquement, il ne bouge pas sous le process (à
// l'inverse du curé, relu au FS à chaque appel).
const familyOfMember = new Map<string, FamilyEntry>();
for (const fams of [FAMILIES.weapon, FAMILIES.accessory]) {
  for (const f of fams) for (const id of f.ids) familyOfMember.set(id, f);
}

/**
 * Id du palier MAX pour un membre référencé — cf. l'en-tête. Un membre déjà au
 * palier max garde le sien : c'est le cas des variantes par classe (5 objets
 * distincts d'une même famille) et des familles mono-palier (Bloody Edge, 5★
 * sans 6★), que `topId` écraserait toutes sur un seul id.
 */
function canonicalId(id: string, table: Record<string, EquipEntry>): string | null {
  const entry = table[id];
  if (!entry) return null;
  const family = familyOfMember.get(id);
  if (!family) return id;
  return entry.star === Math.max(...family.stars) ? id : family.topId;
}

function resolveGear(
  pick: { id: string; mainStat?: string },
  table: Record<string, EquipEntry>,
): RecoGearStat {
  const mainStat = parseMainStat(pick.mainStat);
  // Référence `!nom` non arbitrée dans l'admin : on la remonte telle quelle
  // plutôt que de la taire — l'app affiche un warning et saute ce filtre.
  if (pick.id.startsWith('!')) {
    return { name: pick.id.slice(1), itemId: null, effectIcon: null, mainStat };
  }
  const canonical = canonicalId(pick.id, table);
  const entry = canonical ? table[canonical] : undefined;
  if (!canonical || !entry) {
    return { name: pick.id, itemId: null, effectIcon: null, mainStat };
  }
  // Variante par classe : le nom nu est ambigu (5 objets s'appellent
  // « Briareos's Recklessness »), on suffixe comme partout ailleurs en V3.
  const family = familyOfMember.get(canonical);
  const name =
    family && family.classLimits.length > 1 && entry.classLimit
      ? withClassSuffix(entry.name, entry.classLimit).en
      : entry.name.en;
  const passiveId = entry.passives?.[0]?.id;
  return {
    name,
    itemId: Number(canonical),
    effectIcon: (passiveId ? PASSIVES[passiveId]?.icon : undefined) ?? null,
    mainStat,
  };
}

/** Nom court du set : le curé et la V2 disent « Speed », la table « Speed Set ». */
function setName(setId: string): string {
  const raw = SETS[setId]?.name.en;
  return raw ? raw.replace(/\s+set$/i, '') : setId;
}

/** Traduit des builds BRUTS (presets `$` résolus au passage) vers le contrat. */
export function toStructuredBuilds(
  rawBuilds: GearBuild[],
  presets: GearPresets,
): Record<string, StructuredRecoBuild> {
  const builds: Record<string, StructuredRecoBuild> = {};
  for (const build of rawBuilds) {
    const combos: SetComboPiece[][] = (build.sets ?? []).map(
      (c) => c.pieces ?? (c.preset ? (presets.sets[c.preset] ?? []) : []),
    );
    const substats = build.substats?.startsWith('$')
      ? presets.substats[build.substats.slice(1)]
      : build.substats;
    builds[build.name] = {
      Weapon: (build.weapons ?? []).map((w) => resolveGear(w, WEAPONS)),
      Amulet: (build.amulets ?? []).map((a) => resolveGear(a, AMULETS)),
      Set: combos.map((combo) =>
        combo.map((piece) => ({
          name: setName(piece.set),
          // Un set inconnu de la table est un id à qui on ne peut pas se fier :
          // `null` fait dropper le combo ENTIER côté app, ce qui vaut mieux
          // qu'une contrainte posée sur un set qui n'existe pas.
          setId: SETS[piece.set] ? piece.set : null,
          count: piece.count,
        })),
      ),
      SubstatPrio: parseSubstatPrio(substats),
    };
  }
  return builds;
}

/**
 * Recos d'un personnage au contrat public — `null` quand il n'en a AUCUNE
 * (l'app en fait un 404 et affiche « pas de preset », distinct d'une panne).
 */
export function getRecoStatPriorities(id: string): StructuredCharacterReco | null {
  const rawBuilds = loadGearReco()[id];
  if (!rawBuilds?.length) return null;
  const builds = toStructuredBuilds(rawBuilds, loadGearPresets());
  if (!Object.keys(builds).length) return null;
  return { id, builds };
}
