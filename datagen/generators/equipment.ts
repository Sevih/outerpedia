/**
 * Générateur — équipement, découpé PAR SLOT (chaque slot a ses propres règles).
 *
 *   weapon / accessory   : gear stat + passif (Unique Option) + restriction de classe
 *   helmet / armor / gloves / shoes : gear stat pur (pas de passif ni de classe)
 *   talisman (ooparts)   : options à base de buffs + passif
 *   ee (exclusive)       : options à base de buffs + passif (lié à un perso)
 *
 * Catalogues TRANSVERSES (définis une fois, référencés par id) :
 *   pools[groupId]   : options résolues (stat/buff + poids de tirage)
 *   passives[id]     : Unique Option (nom + template + valeurs par niveau)
 *   breakLimits[key] : facteurs d'enchant par « étoile|grade »
 *
 * Entrées (tables du jeu) : ItemTemplet, TextItem, TextSkill, ItemOptionTemplet,
 *   ItemSpecialOptionTemplet, ItemBreakLimitTemplet, BuffTemplet.
 *
 * NOTE : `Rate` en base-10000 → poids de tirage = Rate/100 (%). Valeurs stat des
 * pools laissées brutes (OAT_RATE = /10 confirmé, décodage à appliquer ensuite).
 */
import { readFileSync } from 'node:fs';
import { resolve as resolvePath } from 'node:path';
import { bool, groupBy, indexBy, loadTable, num, numf, splitCsv } from '../lib/tables';
import { loadTextIndex, resolveText } from '../lib/text';
import { slugEnum } from '../lib/enums';
import { resolveClass } from '../lib/class';
import {
  buffRowAtLevel,
  buffValuesAt,
  fillPlaceholders,
  loadBuffIndex,
  type BuffValues,
} from '../lib/buff';
import {
  buildEffectGlossary,
  effectShape,
  mechanicLabelIndex,
  type EffectShape,
} from '../lib/effects';
import { formatStatValue } from '../lib/stats';
import { GAME_LANGS, type LangDict } from '../lib/lang';

type Row = ReturnType<typeof loadTable>[number];

/** Une option résolue (stat ou buff) avec son poids de tirage. */
export interface Option {
  stat: string; // slug du StatType (atk, def…) — 'none' si buff
  mode: 'flat' | 'rate' | 'none'; // OAT_ADD / OAT_RATE / OAT_NONE
  value: number; // OptionValue brut
  weight: number; // probabilité de tirage en % (Rate / 100)
  buff?: string; // BuffID (options IOT_BUFF)
  factor?: number; // OptionFactor : gain par niveau (EE)
  max?: number; // OptionMaxValue : plafond (EE)
  effects?: BuffEffect[]; // effets structurés du buff quand il s'ajoute à une stat propre (EE)
  /** Valeur par NIVEAU du buff (talisman/EE : croissance par table, pas par facteur). */
  levels?: number[];
  /**
   * Libellé OFFICIEL du buff conditionnel par élément (EE : « Reduced DMG
   * Taken vs Fire ») — résolu depuis `TextSystem` (`SYS_BT_<Type>_<TARGET|
   * OWNER>_<ELEMENT>` / `SYS_STAT_<StatType>_…`), l'élément venant du BuffID.
   */
  label?: LangDict;
}

/** Facteurs d'enchantement (break-limit) par palier. */
export interface BreakLimit {
  factors: number[];
  prices: number[];
}

/** Effet de buff résolu en structuré (prose jolie = futur classifier d'effets). */
export interface BuffEffect {
  type: string; // slug du Type de buff (dmg_reduce, stat, …)
  stat?: string; // slug du StatType si ≠ NONE
  mode: 'flat' | 'rate' | 'none';
  value: number; // valeur brute (rate = /10 à l'affichage)
}

/** Effet de set pour un nombre de pièces, null si aucun. Soit une stat, soit un buff (→ effets). */
export interface SetEffect {
  stat?: string; // slug du StatType (atk, def…)
  value?: string; // valeur formatée (ex. "30%")
  buff?: string; // BuffID source (effet basé sur un buff)
  effects?: BuffEffect[]; // effets structurés du buff (suit les BT_GROUP)
  desc?: LangDict; // description OFFICIELLE du jeu (bonus riches, DescID de la ligne de set)
}

/** Un tier de set : bonus 2 pièces / 4 pièces. */
export interface SetTier {
  '2p': SetEffect | null;
  '4p': SetEffect | null;
}

/** Un set d'armure : nom + icône + bonus par tier (index 0 = base, 1 = enchanté). */
export interface GameSet {
  name: LangDict;
  icon: string;
  tiers: SetTier[];
}

/** Passif (Unique Option) : template + valeurs par niveau, résolu via fillPlaceholders. */
export interface Passive {
  name: LangDict;
  desc: LangDict; // template : 1 phrase avec placeholders [Value]/[Rate]/[Turn]
  /**
   * Valeurs aux niveaux DÉCLARÉS du buff (`levels`, parallèle) — gear : un
   * palier par breakthrough (1..5) ; talisman/EE : les niveaux d'objet où le
   * buff change (souvent [1, 10]), PAS un par niveau d'amélioration.
   */
  values: BuffValues[];
  levels: number[];
  icon: string;
  buff: string;
  /**
   * Effets structurés des buffs du passif (classifier — même forme que les
   * skills) : alimente les chips buff/debuff de la carte EE/talisman.
   */
  effects?: EffectShape[];
}

interface Identity {
  name: LangDict;
  grade: string; // normal / magic / rare / unique
  star: number;
  icon: string;
  craftable: boolean; // IsCustomCraft
  // pas de `desc` : pour les ooparts (seuls porteurs de DescID), c'est le MÊME texte
  // que leur passif (qui le porte déjà, avec tous les niveaux) → redondant.
}

/**
 * Référence d'un palier de passif (Unique Option). Un item peut en porter
 * PLUSIEURS (tous les EE, une partie des talismans) : le 2e se débloque au
 * niveau `level` (ex. +10) et — c'est la table qui le dit — soit S'AJOUTE au
 * premier (`isAdd`), soit le REMPLACE (buff `_CHANGE`).
 */
export interface PassiveRef {
  id: string; // ref → passives
  level: number; // niveau d'objet de déblocage (1, 10…)
  isAdd: boolean; // true = s'ajoute au palier précédent ; false = le remplace
}

/** Arme / accessoire : gear stat avec passif + classe. */
export interface GearItem extends Identity {
  classLimit: string | null; // ref → classes (attacker/…), null = aucune restriction de classe
  main: string[]; // refs → pools (stat fixe et/ou pool aléatoire)
  sub: string | null; // ref → pools
  passives: PassiveRef[]; // paliers de passif (armes/amulettes : un seul)
  breakLimit: string | null; // ref → breakLimits
}

/** Armure (helmet/armor/gloves/shoes) : gear stat pur + set. */
export interface ArmorItem extends Identity {
  main: string[];
  sub: string | null;
  breakLimit: string | null;
  set: string | null; // ref → sets
}

/** Talisman : options à base de buffs + passif(s). */
export interface SpecialItem extends Identity {
  options: string[]; // refs → pools (options buff)
  passives: PassiveRef[];
  /** Type de points générés, DÉRIVÉ du buff du passif (BT_AP/CP_CHARGE). */
  mode?: 'AP' | 'CP';
}

/** EE (exclusive) : comme un talisman, mais restreint à un perso + niveau de confiance. */
export interface ExclusiveItem extends SpecialItem {
  character: string; // ref → personnage (CharacterLimit) : seul ce perso peut l'équiper
  trustLevel: number; // niveau de confiance requis (TrustLevelLimit)
}

/**
 * FAMILLE d'items : le jeu décline un même équipement en variantes techniques
 * (paliers d'étoiles, 6★ craftable, instances de drop 9xxxx, déclinaisons par
 * classe) sous un même nom. La règle de regroupement vit ICI (source unique) :
 * app, manifest d'assets et imports consomment `families.json`.
 */
export interface Family {
  /** Id canonique = plus petit id numérique du groupe (stable). */
  id: string;
  /** Membre représentatif (étoiles max) : porte nom/icône/passifs à afficher. */
  topId: string;
  /** Tous les membres, triés par id. */
  ids: string[];
  stars: number[];
  /** Restrictions de classe distinctes des membres (slugs). */
  classLimits: string[];
  /**
   * Item de wiki : grade unique au palier haut, OU rare 6★ (le palier
   * « budget » sans passif — Steel Sword/Necklace). Sinon item de leveling.
   */
  wiki: boolean;
}

export interface EquipmentData {
  weapon: Record<string, GearItem>;
  accessory: Record<string, GearItem>;
  helmet: Record<string, ArmorItem>;
  armor: Record<string, ArmorItem>;
  gloves: Record<string, ArmorItem>;
  shoes: Record<string, ArmorItem>;
  talisman: Record<string, SpecialItem>;
  ee: Record<string, ExclusiveItem>;
  families: {
    weapon: Family[];
    accessory: Family[];
    talisman: Family[];
  };
  pools: Record<string, Option[]>;
  passives: Record<string, Passive>;
  breakLimits: Record<string, BreakLimit>;
  sets: Record<string, GameSet>;
  // glossaires : slug d'enum → libellé localisé réel du jeu (slug ≠ terme du jeu, ex. unique→Legendary)
  grades: Record<string, LangDict>;
  classes: Record<string, LangDict>;
  /** Noms OFFICIELS des stats (`SYS_STAT_*` : « Counterattack Chance »…). */
  statNames: Record<string, LangDict>;
  /** Descriptions OFFICIELLES des stats (`SYS_STAT_DESC_*`) — rares (4). */
  statDescs: Record<string, LangDict>;
}

/** ItemSubType → nom de slot. */
const SLOT: Record<string, keyof EquipmentData> = {
  ITS_EQUIP_WEAPON: 'weapon',
  ITS_EQUIP_ACCESSORY: 'accessory',
  ITS_EQUIP_HELMET: 'helmet',
  ITS_EQUIP_ARMOR: 'armor',
  ITS_EQUIP_GLOVES: 'gloves',
  ITS_EQUIP_SHOES: 'shoes',
  ITS_EQUIP_OOPARTS: 'talisman',
  ITS_EQUIP_EXCLUSIVE: 'ee',
};

const optMode = (applying: string | undefined): Option['mode'] =>
  applying === 'OAT_RATE' ? 'rate' : applying === 'OAT_ADD' ? 'flat' : 'none';

/**
 * Élément de CONDITION d'un buff (`BuffConditionValue`) → nom d'enum.
 * ATTENTION : le suffixe du BuffID (`BID_CEQUIP_MAIN_DMG_REDUCE_FIRE`) est
 * l'élément du PORTEUR, pas celui de la condition — l'affichage suit la
 * condition. Mapping établi par bijection sur les 25 buffs CEQUIP
 * (suffixe EARTH → valeur 1, WATER → 2, DARK → 3, LIGHT → 4, FIRE → 0),
 * qui correspond à l'élément AVANTAGÉ du porteur (fire>earth>water>fire,
 * light↔dark) — validé contre l'affichage en jeu (K : « vs Earth »).
 */
const COND_ELEMENT: Record<string, string> = {
  '0': 'EARTH',
  '1': 'WATER',
  '2': 'FIRE',
  '3': 'LIGHT',
  '4': 'DARK',
};

/**
 * Libellé officiel d'un buff conditionnel par élément. Le jeu déclare la
 * condition (`BuffConditionType` TARGET/OWNER_ELEMENT + `BuffConditionValue`)
 * sur le buff et nomme l'affichage dans `TextSystem` :
 * `SYS_BT_DMG_REDUCE_TARGET_EARTH` → « Reduced DMG Taken vs Earth ».
 */
function conditionalLabel(
  system: Map<string, LangDict>,
  b: Row | undefined,
  buffId: string,
): LangDict | undefined {
  const cond = b?.BuffConditionType;
  if (!b || (cond !== 'TARGET_ELEMENT' && cond !== 'OWNER_ELEMENT')) return undefined;
  const el = COND_ELEMENT[b.BuffConditionValue ?? '0'] ?? '';
  const scope = cond === 'TARGET_ELEMENT' ? 'TARGET' : 'OWNER';
  const keys = [
    `SYS_${b.Type}_${scope}_${el}`,
    `SYS_STAT_${(b.StatType ?? '').replace(/^ST_/, '')}_${scope}_${el}`,
  ];
  for (const key of keys) {
    const t = resolveText(system, key);
    if (t.en) {
      const out = { ...t };
      for (const lang of GAME_LANGS) out[lang] = out[lang].replace(/\s*\\n\s*|\s*\n\s*/g, ' ');
      return out;
    }
  }
  console.warn(`⚠ libellé conditionnel introuvable pour ${buffId} (${keys.join(', ')})`);
  return undefined;
}

function resolveGroup(
  byGroup: Map<string, Row[]>,
  buffsByID: ReturnType<typeof loadBuffIndex>,
  resolveBuffEffects: (buffId: string, level: number) => BuffEffect[],
  system: Map<string, LangDict>,
  groupId: string,
): Option[] {
  const rows = byGroup.get(groupId) ?? [];
  return rows.map((o) => {
    const ownStat = !!o.StatType && o.StatType !== 'ST_NONE';

    let opt: Option;
    if (o.BuffID && !ownStat) {
      // Option purement buff (ooparts) : pas de stat propre → on lit la stat du buff (niveau 1).
      const id = o.BuffID.split(',')[0].trim();
      const levels = buffsByID.get(id) ?? [];
      const b = levels.find((r) => r.Level === '1') ?? levels[0];
      opt = {
        stat: slugEnum(b?.StatType),
        mode: optMode(b?.ApplyingType),
        value: num(b?.Value),
        weight: num(o.Rate) / 100,
      };
    } else {
      opt = {
        stat: slugEnum(o.StatType),
        mode: optMode(o.ApplyingType),
        value: num(o.OptionValue),
        weight: num(o.Rate) / 100,
      };
    }

    if (o.BuffID) {
      opt.buff = o.BuffID;
      // Croissance par niveau de buff (talisman/EE : UpgradeFactorforOP = 0,
      // la table des niveaux fait foi).
      const levels = (buffsByID.get(o.BuffID.split(',')[0].trim()) ?? [])
        .filter((b) => num(b.Level) > 0)
        .sort((a, b) => num(a.Level) - num(b.Level))
        .map((b) => num(b.Value));
      // Émis MÊME mono-niveau : un main de buff ne scale JAMAIS par le facteur
      // d'amélioration des armes (ooparts : enhanceFactor = 0 in-game) — sans
      // `levels`, l'app appliquait ×(1+0.4·niv) à tort (Talisman of Hubris ×5).
      if (levels.length) opt.levels = levels;
    }
    if (num(o.OptionFactor) > 0) opt.factor = num(o.OptionFactor);
    if (num(o.OptionMaxValue) > 0) opt.max = num(o.OptionMaxValue);
    // EE : l'option garde sa stat propre (HIT_AP) ET un buff distinct → on capte les effets du buff.
    if (ownStat && o.BuffID) opt.effects = resolveBuffEffects(o.BuffID, 1);
    // Libellé conditionnel par élément (EE : « Reduced DMG Taken vs Fire »).
    if (o.BuffID) {
      const id = o.BuffID.split(',')[0].trim();
      const b1 = (buffsByID.get(id) ?? []).find((r) => r.Level === '1');
      const label = conditionalLabel(system, b1, id);
      if (label) opt.label = label;
    }
    return opt;
  });
}

/** Effet de set pour un nombre de pièces (2P/4P) sur une ligne tier, null si aucun. */
function setEffect(
  row: Row,
  piece: '2P' | '4P',
  resolveBuffEffects: (buffId: string, level: number) => BuffEffect[],
): SetEffect | null {
  const stat = row[`StatType_${piece}`];
  if (stat && stat !== 'ST_NONE') {
    const slug = slugEnum(stat);
    return {
      stat: slug,
      value: formatStatValue(
        row[`ApplyingType_${piece}`] ?? '',
        num(row[`OptionValue_${piece}`]),
        slug,
      ),
    };
  }
  const buff = row[`BuffID_${piece}`];
  if (buff) return { buff, effects: resolveBuffEffects(buff, num(row[`BuffLevel_${piece}`]) || 1) };
  return null;
}

/** Placeholders réellement présents dans un template → clés de valeurs à conserver. */
function usedValueKeys(template: string): (keyof BuffValues)[] {
  const keys: (keyof BuffValues)[] = [];
  if (/\[[-+]?Value\]/i.test(template)) keys.push('value');
  if (/\[(?:Rate1?|RATE)\]/i.test(template)) keys.push('rate');
  if (/\[[-+]?Turn1?\]/i.test(template)) keys.push('turn');
  if (/\[[-+]?Value2\]/i.test(template)) keys.push('value2');
  if (/\[Turn2\]/i.test(template)) keys.push('turn2');
  if (/\[[-+]?Value4\]/i.test(template)) keys.push('value4');
  if (/\[[-+]?Value5\]/i.test(template)) keys.push('value5');
  return keys;
}

function resolvePassive(
  o: Row,
  skill: ReturnType<typeof loadTextIndex>,
  buffsByID: ReturnType<typeof loadBuffIndex>,
): Passive {
  const buff = o.BuffID ?? '';
  const desc = resolveText(skill, o.DescID || o.CustomCraftDescID);
  const firstId = splitCsv(buff)[0];
  const levels = (firstId ? (buffsByID.get(firstId) ?? []) : [])
    .map((r) => num(r.Level))
    .filter((n) => n > 0)
    .sort((a, b) => a - b);
  const keys = usedValueKeys(GAME_LANGS.map((l) => desc[l]).join(' '));
  const values = levels.map((lv) => {
    const all = buffValuesAt(buffsByID, buff, lv);
    const v: BuffValues = {};
    for (const k of keys) if (all[k] != null) v[k] = all[k];
    return v;
  });
  const out: Passive = {
    name: resolveText(skill, o.NameID),
    desc,
    values,
    levels,
    icon: o.IconName ?? '',
    buff,
  };
  // Effets structurés (au niveau max déclaré), dédupliqués par type+stat.
  // Les conteneurs `BT_GROUP` sont EXPANSÉS en leurs enfants (comme pour les
  // skills) : l'effet réel d'un passif encapsulé (extension de buffs du Bag of
  // Rare Seeds, priorité d'Innocent Love…) vit dans les enfants du groupe.
  const shapes: EffectShape[] = [];
  const seen = new Set<string>();
  const maxLv = levels.at(-1) ?? 1;
  for (const id of splitCsv(buff)) {
    const ids = [id];
    const row0 = buffRowAtLevel(buffsByID, id, maxLv);
    if (row0?.Type === 'BT_GROUP' || row0?.Type === 'BT_GROUP_CASTER_TOOLTIP_CHECK')
      ids.push(...(groupKids().get(row0.Value ?? '') ?? []));
    for (const bid of ids) {
      const row = buffRowAtLevel(buffsByID, bid, maxLv);
      if (!row) continue;
      const sh = refineEquipShape(effectShape(row));
      const key = `${sh.type}|${sh.stat ?? ''}`;
      if (seen.has(key)) continue;
      seen.add(key);
      shapes.push(sh);
    }
  }
  if (shapes.length) out.effects = shapes;
  return out;
}

let groupKidsCache: Map<string, string[]> | undefined;

/** Enfants des buffs conteneurs `BT_GROUP` (BuffGroupTemplet) — même expansion
 * que le générateur de skills. */
function groupKids(): Map<string, string[]> {
  if (!groupKidsCache) {
    groupKidsCache = new Map();
    for (const g of loadTable('BuffGroupTemplet')) {
      if (!g.ID) continue;
      const kids: string[] = [];
      for (let i = 1; i <= 10; i++) if (g[`Child${i}_BID`]) kids.push(g[`Child${i}_BID`]);
      groupKidsCache.set(g.ID, kids);
    }
  }
  return groupKidsCache;
}

/**
 * Nomme (ou anonymise) un effet de PASSIF d'équipement pour les chips : le
 * CreateText des buffs d'équipement est le nom de l'OBJET (`ITEM_*`), pas un
 * nom d'effet — irrésolvable, et IDENTIQUE pour les deux passifs d'un même EE
 * (collision de clé → chips dédupliquées à tort). Toute réf est VALIDÉE contre
 * le glossaire : les tooltips techniques VIDES (porteurs IsIgnoreInterruption,
 * ex. Hestia Knife) et les labels irrésolvables sont retirés, puis remplacés
 * si possible par le symbole de la MÉCANIQUE (Priority Increase, Debuff
 * Duration Increase…) via `mechanicLabelIndex`. Un effet resté sans nom
 * (montée de stat permanente, dégâts aux boss…) n'est pas une chip — même
 * règle que les kits de skills et que la curation V2.
 */
/** Familles jamais pontées : modificateurs permanents de dégâts/soin/stat —
 * pas des statuts côté joueur, la curation V2 ne les chipait pas non plus
 * (le « Damage Increase » d'un passif d'EE est du câblage, pas un buff). */
const NO_BRIDGE_FAMILIES = new Set(['damage', 'stat', 'dmg_reduce', 'heal', 'anti_heal']);

function refineEquipShape(sh: EffectShape): EffectShape {
  const { byTooltip, byLabel } = buildEffectGlossary();
  if (sh.tooltip) {
    if (byTooltip.has(sh.tooltip)) return sh; // statut nommé du glossaire
    delete sh.tooltip;
  }
  if (sh.label && byLabel.has(sh.label) && sh.type !== 'BT_NONE') return sh;
  delete sh.label;
  // BT_NONE = marqueur technique sans effet (état de kit « Disconnected from
  // Core »…) : jamais une chip, même si son symbole résout.
  if (sh.type === 'BT_NONE') return sh;
  // AP au début du combat (stat premium ENTER_AP) = la chip « AP » (V2 :
  // BT_AP_CHARGE) — seule stat permanente chipée.
  if (sh.stat === 'enter_ap') {
    sh.label = 'SYS_BUFF_CHARGE_AP';
    return sh;
  }
  // Autre stat sans statut nommé = montée permanente (mécanique) — le pont par
  // type n'a pas de sens pour BT_STAT* (il nommerait une stat arbitraire).
  if (sh.stat || sh.type === 'BT_STAT' || sh.type === 'BT_STAT_PREMIUM') return sh;
  const side = sh.category === 'buff' ? 'buff' : 'debuff';
  // 1) Pont SYS par (nature, type) — respecte le SENS (buff BT_EXTEND_DEBUFF =
  //    Debuff Duration Reduction, debuff = … Increase), hors familles de
  //    modificateurs permanents.
  if (!NO_BRIDGE_FAMILIES.has(sh.family)) {
    const sym = mechanicLabelIndex().get(`${side}|${sh.type}`);
    if (sym) {
      sh.label = sym;
      return sh;
    }
  }
  // 2) Créations curées adressées par type (`keys` de data/curated/effects.json,
  //    nature de l'entrée en préférence, repli sur l'autre sens : Uncounterable,
  //    Weakness Gauge Damage…) — la réf se pose en `tooltip`, résolue par id à
  //    l'affichage comme les effets synthétiques des skills.
  const curated =
    curatedKeyMap().get(`${side}|${sh.type}`) ??
    curatedKeyMap().get(`${side === 'buff' ? 'debuff' : 'buff'}|${sh.type}`);
  if (curated) sh.tooltip = curated;
  return sh;
}

let curatedKeyCache: Map<string, string> | undefined;

/** `nature|type` → id de CRÉATION curée (`keys` de data/curated/effects.json) —
 * mécaniques sans texte dans les tables, nommées par la curation (héritée V2).
 * La nature vient de l'entrée (`isDebuff`, repli sur l'effet du glossaire). */
function curatedKeyMap(): Map<string, string> {
  if (!curatedKeyCache) {
    curatedKeyCache = new Map();
    try {
      const cur = JSON.parse(
        readFileSync(resolvePath('data/curated/effects.json'), 'utf8'),
      ) as Record<string, { keys?: string[]; isDebuff?: boolean }>;
      const { effects } = buildEffectGlossary();
      for (const [id, c] of Object.entries(cur)) {
        const side = (c.isDebuff ?? effects.get(id)?.isDebuff) ? 'debuff' : 'buff';
        for (const k of c.keys ?? []) {
          const key = `${side}|${k}`;
          if (!curatedKeyCache.has(key)) curatedKeyCache.set(key, id);
        }
      }
    } catch {
      /* pas de curated — les mécaniques concernées restent innommées */
    }
  }
  return curatedKeyCache;
}

function sortByNumericKey<T>(obj: Record<string, T>): Record<string, T> {
  return Object.fromEntries(
    Object.entries(obj).sort(([a], [b]) => num(a) - num(b) || a.localeCompare(b)),
  );
}

export function buildEquipment(): EquipmentData {
  const rows = loadTable('ItemTemplet');
  const text = loadTextIndex('TextItem');
  const skill = loadTextIndex('TextSkill');
  const system = loadTextIndex('TextSystem');
  const optByGroup = groupBy(loadTable('ItemOptionTemplet'), 'GroupID');
  const specRows = loadTable('ItemSpecialOptionTemplet');
  const specById = indexBy(specRows, 'ID');
  const specByGroup = groupBy(specRows, 'GroupID');
  const buffsByID = loadBuffIndex();
  const buffGroups = indexBy(loadTable('BuffGroupTemplet'), 'ID');

  // Résout un buff en effets structurés, en suivant les BT_GROUP (groupe d'enfants).
  const resolveBuffEffects = (buffId: string, level: number, depth = 0): BuffEffect[] => {
    if (depth > 4) return []; // garde-fou anti-boucle
    const id = buffId.split(',')[0].trim();
    const levels = buffsByID.get(id) ?? [];
    const b = levels.find((r) => num(r.Level) === level) ?? levels[0];
    if (!b) return [];
    if (b.Type === 'BT_GROUP') {
      const grp = buffGroups.get(b.Value);
      if (!grp) return [];
      const out: BuffEffect[] = [];
      for (let i = 1; i <= 10; i++) {
        const child = grp[`Child${i}_BID`];
        if (child) out.push(...resolveBuffEffects(child, level, depth + 1));
      }
      return out;
    }
    return [
      {
        type: slugEnum(b.Type),
        ...(b.StatType && b.StatType !== 'ST_NONE' ? { stat: slugEnum(b.StatType) } : {}),
        mode: optMode(b.ApplyingType),
        value: num(b.Value),
      },
    ];
  };

  const breakByStarGrade = new Map<string, Row>();
  for (const b of loadTable('ItemBreakLimitTemplet')) {
    breakByStarGrade.set(`${num(b.BasicStar)}|${slugEnum(b.ItemGrade)}`, b);
  }

  const data: EquipmentData = {
    weapon: {},
    accessory: {},
    helmet: {},
    armor: {},
    gloves: {},
    shoes: {},
    talisman: {},
    ee: {},
    pools: {},
    passives: {},
    families: { weapon: [], accessory: [], talisman: [] },
    breakLimits: {},
    sets: {},
    grades: {},
    classes: {},
    statNames: {},
    statDescs: {},
  };

  const ensurePool = (g: string) => {
    if (g && !(g in data.pools))
      data.pools[g] = resolveGroup(optByGroup, buffsByID, resolveBuffEffects, system, g);
  };

  // glossaires : résout le libellé localisé réel (slug ≠ terme du jeu)
  const ensureGrade = (g: string) => {
    if (g && !(g in data.grades))
      data.grades[g] = resolveText(system, `SYS_ITEM_GRADE_${g.toUpperCase()}`);
  };

  // Un item peut porter PLUSIEURS Unique Options (CSV) : paliers de passif
  // (EE : +10 remplace via buff _CHANGE ; talismans : +10 s'ajoute, IsAdd).
  const resolvePassiveRefs = (r: Row): PassiveRef[] => {
    const out: PassiveRef[] = [];
    for (const optId of splitCsv(r.UniqueOptionID)) {
      const spec = specById.get(optId);
      if (!spec) continue;
      if (!(optId in data.passives)) data.passives[optId] = resolvePassive(spec, skill, buffsByID);
      out.push({ id: optId, level: num(spec.Level) || 1, isAdd: bool(spec.IsAdd) });
    }
    return out.sort((a, b) => a.level - b.level);
  };

  // Type de points d'un talisman, DÉRIVÉ des types de buff de ses passifs
  // (BT_AP_CHARGE / BT_CP_CHARGE) — indécidable depuis les pools de stats.
  const talismanMode = (passives: PassiveRef[]): 'AP' | 'CP' | undefined => {
    const types = passives.flatMap((p) =>
      resolveBuffEffects(data.passives[p.id].buff, 1).map((e) => e.type),
    );
    if (types.includes('cp_charge')) return 'CP';
    if (types.includes('ap_charge')) return 'AP';
    return undefined;
  };

  const resolveBreakRef = (r: Row): string | null => {
    if (!r.BreakLimitGroupID) return null;
    const key = `${num(r.BasicStar)}|${slugEnum(r.ItemGrade)}`;
    const bl = breakByStarGrade.get(key);
    if (!bl) return null;
    if (!(key in data.breakLimits)) {
      data.breakLimits[key] = {
        factors: [numf(bl.Factor1), numf(bl.Factor2), numf(bl.Factor3), numf(bl.Factor4)],
        prices: [num(bl.Price1), num(bl.Price2), num(bl.Price3), num(bl.Price4)],
      };
    }
    return key;
  };

  const resolveSetRef = (r: Row): string | null => {
    const sid = splitCsv(r.SetOptionID)[0];
    const row = sid ? specById.get(sid) : undefined;
    if (!row) return null;
    const groupId = row.GroupID;
    if (!(groupId in data.sets)) {
      const tierRows = (specByGroup.get(groupId) ?? []).sort((a, b) => num(a.Level) - num(b.Level));
      data.sets[groupId] = {
        name: resolveText(text, row.NameID),
        icon: row.IconName ?? '',
        tiers: tierRows.map((t) => {
          const tier: SetTier = {
            '2p': setEffect(t, '2P', resolveBuffEffects),
            '4p': setEffect(t, '4P', resolveBuffEffects),
          };
          // Les bonus RICHES (buff) ont une description officielle : le DescID
          // de la ligne (CSV) porte les textes dans l'ordre 2P puis 4P.
          const descIds = splitCsv(t.DescID);
          let d = 0;
          for (const p of ['2p', '4p'] as const) {
            const e = tier[p];
            if (e?.buff && descIds[d]) e.desc = resolveText(skill, descIds[d++]);
          }
          return tier;
        }),
      };
    }
    return groupId;
  };

  for (const r of rows) {
    if (r.ItemType !== 'IT_EQUIP' || !r.ID) continue;
    const slot = SLOT[r.ItemSubType];
    if (!slot) continue;

    const identity: Identity = {
      name: resolveText(text, r.NameID),
      grade: slugEnum(r.ItemGrade),
      star: num(r.BasicStar),
      icon: r.IconName ?? '',
      craftable: bool(r.IsCustomCraft),
    };
    ensureGrade(identity.grade);
    const main = splitCsv(r.MainOptionGroupID);
    main.forEach(ensurePool);

    if (slot === 'talisman') {
      const passives = resolvePassiveRefs(r);
      const mode = talismanMode(passives);
      data.talisman[r.ID] = { ...identity, options: main, passives, ...(mode ? { mode } : {}) };
      continue;
    }
    if (slot === 'ee') {
      data.ee[r.ID] = {
        ...identity,
        character: splitCsv(r.CharacterLimit)[0] ?? '', // ref → personnage
        trustLevel: num(r.TrustLevelLimit),
        options: main,
        passives: resolvePassiveRefs(r),
      };
      continue;
    }

    const sub = splitCsv(r.SubOptionGroupID)[0] ?? null;
    if (sub) ensurePool(sub);

    if (slot === 'weapon' || slot === 'accessory') {
      // Slug canonique de classe (l'enum jeu diffère : Attacker→striker, Priest→healer).
      const cls = slugEnum(r.ClassLimit);
      let classLimit: string | null = null;
      if (cls && cls !== 'none') {
        const resolved = resolveClass(cls, system);
        classLimit = resolved.slug;
        data.classes[classLimit] ??= resolved.name;
      }
      data[slot][r.ID] = {
        ...identity,
        classLimit,
        main,
        sub,
        passives: resolvePassiveRefs(r),
        breakLimit: resolveBreakRef(r),
      };
    } else {
      // helmet / armor / gloves / shoes
      (data[slot] as Record<string, ArmorItem>)[r.ID] = {
        ...identity,
        main,
        sub,
        breakLimit: resolveBreakRef(r),
        set: resolveSetRef(r),
      };
    }
  }

  // tri stable de chaque collection
  for (const k of Object.keys(data) as (keyof EquipmentData)[]) {
    if (k === 'families') continue;
    (data[k] as Record<string, unknown>) = sortByNumericKey(data[k] as Record<string, unknown>);
  }

  // FAMILLES : regroupement par nom EN (règle unique — voir doc de `Family`).
  const norm = (s: string) => s.replace(/['’]/g, "'").trim().toLowerCase();
  const buildFamilies = (
    table: Record<string, GearItem | SpecialItem>,
    wikiMinStar: number,
  ): Family[] => {
    const groups = new Map<string, string[]>();
    for (const [id, item] of Object.entries(table)) {
      const key = norm(item.name.en);
      const list = groups.get(key);
      if (list) list.push(id);
      else groups.set(key, [id]);
    }
    const out: Family[] = [];
    for (const ids of groups.values()) {
      ids.sort((a, b) => num(a) - num(b));
      const items = ids.map((id) => table[id]);
      const top = ids[items.reduce((mi, x, i) => (x.star > items[mi].star ? i : mi), 0)];
      out.push({
        id: ids[0],
        topId: top,
        ids,
        stars: [...new Set(items.map((x) => x.star))].sort(),
        classLimits: [
          ...new Set(
            items
              .map((x) => ('classLimit' in x ? x.classLimit : null))
              .filter((c): c is string => Boolean(c)),
          ),
        ],
        wiki:
          (table[top].grade === 'unique' && table[top].star >= wikiMinStar) ||
          (table[top].grade === 'rare' && table[top].star >= 6),
      });
    }
    return out.sort((a, b) => num(a.id) - num(b.id));
  };
  data.families = {
    weapon: buildFamilies(data.weapon, 5),
    accessory: buildFamilies(data.accessory, 5),
    talisman: buildFamilies(data.talisman, 4),
  };

  // Glossaire des NOMS de stats (SYS_STAT_*) : toutes les stats réellement
  // portées par les pools et les bonus de sets — l'app affiche le vrai terme
  // du jeu (« Counterattack Chance +12% »), pas une abréviation reconstruite.
  // Amorce : stats affichables hors pools/sets (tokens éditoriaux {S/PEN},
  // table Base Stats des fiches perso).
  const statSlugs = new Set<string>([
    'pierce_power',
    'speed',
    'dmg_boost',
    'dmg_reduce_rate',
    'buff_chance',
    'buff_resist',
  ]);
  for (const opts of Object.values(data.pools))
    for (const o of opts) {
      if (o.stat && o.stat !== 'none') statSlugs.add(o.stat);
      for (const e of o.effects ?? []) if (e.stat) statSlugs.add(e.stat);
    }
  for (const s of Object.values(data.sets))
    for (const t of s.tiers)
      for (const p of ['2p', '4p'] as const) {
        if (t[p]?.stat) statSlugs.add(t[p].stat);
        for (const e of t[p]?.effects ?? []) if (e.stat) statSlugs.add(e.stat);
      }
  for (const slug of [...statSlugs].sort()) {
    const name = resolveText(system, `SYS_STAT_${slug.toUpperCase()}`);
    if (name.en) data.statNames[slug] = name;
    else console.warn(`⚠ nom de stat introuvable : SYS_STAT_${slug.toUpperCase()}`);
    const desc = resolveText(system, `SYS_STAT_DESC_${slug.toUpperCase()}`);
    if (desc.en) data.statDescs[slug] = desc;
  }

  return data;
}

// Exécution directe : tailles par slot/catalogue + échantillons.
if (process.argv[1] && process.argv[1].endsWith('equipment.ts')) {
  const d = buildEquipment();
  for (const k of Object.keys(d) as (keyof EquipmentData)[]) {
    console.log(k.padEnd(12), Object.keys(d[k]).length);
  }
  console.log('\n— weapon id 4 —\n' + JSON.stringify(d.weapon['4'], null, 2));
  console.log('\n— helmet id 3001 —\n' + JSON.stringify(d.helmet['3001'], null, 2));
  console.log('\n— talisman id 10001 —\n' + JSON.stringify(d.talisman['10001'], null, 2));
  const wp = d.weapon['4'].passives[0].id;
  console.log(
    '\npassif weapon 4 résolu niv max:',
    fillPlaceholders(d.passives[wp].desc.en, d.passives[wp].values.at(-1)!),
  );
  const tal = Object.values(d.talisman).find((x) => x.passives.length > 1)!;
  console.log('talisman multi-passifs:', tal.name.en, tal.mode, JSON.stringify(tal.passives));
}
