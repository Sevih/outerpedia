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
import { bool, groupBy, indexBy, loadTable, num, numf, splitCsv } from '../lib/tables';
import { loadTextIndex, resolveText } from '../lib/text';
import { slugEnum } from '../lib/enums';
import { buffValuesAt, fillPlaceholders, loadBuffIndex, type BuffValues } from '../lib/buff';
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
}

/** Facteurs d'enchantement (break-limit) par palier. */
export interface BreakLimit {
  factors: number[];
  prices: number[];
}

/** Effet de set pour un nombre de pièces, null si aucun. Soit une stat, soit un buff. */
export interface SetEffect {
  stat?: string; // slug du StatType (atk, def…)
  value?: string; // valeur formatée (ex. "30%")
  buff?: string; // BuffID (effet basé sur un buff — résolution à venir)
  level?: number; // BuffLevel
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
  values: BuffValues[]; // valeurs par niveau de reforge (index 0 = niveau 1)
  icon: string;
  buff: string;
}

interface Identity {
  name: LangDict;
  grade: string; // normal / magic / rare / unique
  star: number;
  icon: string;
  craftable: boolean; // IsCustomCraft
  desc?: LangDict; // DescID si présent (surtout ooparts) — template (placeholders bruts)
}

/** Arme / accessoire : gear stat avec passif + classe. */
export interface GearItem extends Identity {
  classLimit: string | null; // ref → classes (attacker/…), null = aucune restriction de classe
  main: string[]; // refs → pools (stat fixe et/ou pool aléatoire)
  sub: string | null; // ref → pools
  passive: string | null; // ref → passives
  breakLimit: string | null; // ref → breakLimits
}

/** Armure (helmet/armor/gloves/shoes) : gear stat pur + set. */
export interface ArmorItem extends Identity {
  main: string[];
  sub: string | null;
  breakLimit: string | null;
  set: string | null; // ref → sets
}

/** Talisman : options à base de buffs + passif. */
export interface SpecialItem extends Identity {
  options: string[]; // refs → pools (options buff)
  passive: string | null;
}

/** EE (exclusive) : comme un talisman, mais restreint à un perso + niveau de confiance. */
export interface ExclusiveItem extends SpecialItem {
  character: string; // ref → personnage (CharacterLimit) : seul ce perso peut l'équiper
  trustLevel: number; // niveau de confiance requis (TrustLevelLimit)
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
  pools: Record<string, Option[]>;
  passives: Record<string, Passive>;
  breakLimits: Record<string, BreakLimit>;
  sets: Record<string, GameSet>;
  // glossaires : slug d'enum → libellé localisé réel du jeu (slug ≠ terme du jeu, ex. unique→Legendary)
  grades: Record<string, LangDict>;
  classes: Record<string, LangDict>;
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

function resolveGroup(
  byGroup: Map<string, Row[]>,
  buffsByID: ReturnType<typeof loadBuffIndex>,
  groupId: string,
): Option[] {
  const rows = byGroup.get(groupId) ?? [];
  return rows.map((o) => {
    const ownStat = o.StatType && o.StatType !== 'ST_NONE';
    // Option purement buff (ooparts) : pas de stat propre → on lit la stat du buff (niveau 1).
    // Si l'option a déjà sa stat (ex. EE ST_HIT_AP), on la garde et on conserve juste la réf buff.
    if (o.BuffID && !ownStat) {
      const id = o.BuffID.split(',')[0].trim();
      const levels = buffsByID.get(id) ?? [];
      const b = levels.find((r) => r.Level === '1') ?? levels[0];
      return {
        stat: slugEnum(b?.StatType),
        mode: optMode(b?.ApplyingType),
        value: num(b?.Value),
        weight: num(o.Rate) / 100,
        buff: o.BuffID,
      };
    }
    return {
      stat: slugEnum(o.StatType),
      mode: optMode(o.ApplyingType),
      value: num(o.OptionValue),
      weight: num(o.Rate) / 100,
      ...(o.BuffID ? { buff: o.BuffID } : {}),
    };
  });
}

/** Effet de set pour un nombre de pièces (2P/4P) sur une ligne tier, null si aucun. */
function setEffect(row: Row, piece: '2P' | '4P'): SetEffect | null {
  const stat = row[`StatType_${piece}`];
  if (stat && stat !== 'ST_NONE') {
    return {
      stat: slugEnum(stat),
      value: formatStatValue(row[`ApplyingType_${piece}`] ?? '', num(row[`OptionValue_${piece}`])),
    };
  }
  const buff = row[`BuffID_${piece}`];
  if (buff) return { buff, level: num(row[`BuffLevel_${piece}`]) || undefined };
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
  return { name: resolveText(skill, o.NameID), desc, values, icon: o.IconName ?? '', buff };
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
    breakLimits: {},
    sets: {},
    grades: {},
    classes: {},
  };

  const ensurePool = (g: string) => {
    if (g && !(g in data.pools)) data.pools[g] = resolveGroup(optByGroup, buffsByID, g);
  };

  // glossaires : résout le libellé localisé réel (slug ≠ terme du jeu)
  const ensureGrade = (g: string) => {
    if (g && !(g in data.grades))
      data.grades[g] = resolveText(system, `SYS_ITEM_GRADE_${g.toUpperCase()}`);
  };
  const ensureClass = (c: string) => {
    if (c && !(c in data.classes))
      data.classes[c] = resolveText(system, `SYS_CLASS_${c.toUpperCase()}`);
  };

  const resolvePassiveRef = (r: Row): string | null => {
    const optId = splitCsv(r.UniqueOptionID)[0];
    const spec = optId ? specById.get(optId) : undefined;
    if (!optId || !spec) return null;
    if (!(optId in data.passives)) data.passives[optId] = resolvePassive(spec, skill, buffsByID);
    return optId;
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
        tiers: tierRows.map((t) => ({ '2p': setEffect(t, '2P'), '4p': setEffect(t, '4P') })),
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
    if (r.DescID) {
      const d = resolveText(skill, r.DescID);
      if (Object.values(d).some(Boolean)) identity.desc = d;
    }
    ensureGrade(identity.grade);
    const main = splitCsv(r.MainOptionGroupID);
    main.forEach(ensurePool);

    if (slot === 'talisman') {
      data.talisman[r.ID] = { ...identity, options: main, passive: resolvePassiveRef(r) };
      continue;
    }
    if (slot === 'ee') {
      data.ee[r.ID] = {
        ...identity,
        character: splitCsv(r.CharacterLimit)[0] ?? '', // ref → personnage
        trustLevel: num(r.TrustLevelLimit),
        options: main,
        passive: resolvePassiveRef(r),
      };
      continue;
    }

    const sub = splitCsv(r.SubOptionGroupID)[0] ?? null;
    if (sub) ensurePool(sub);

    if (slot === 'weapon' || slot === 'accessory') {
      const cls = slugEnum(r.ClassLimit);
      const classLimit = cls === 'none' ? null : cls; // null = aucune restriction
      if (classLimit) ensureClass(classLimit);
      data[slot][r.ID] = {
        ...identity,
        classLimit,
        main,
        sub,
        passive: resolvePassiveRef(r),
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
    (data[k] as Record<string, unknown>) = sortByNumericKey(data[k] as Record<string, unknown>);
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
  const wp = d.weapon['4'].passive!;
  console.log(
    '\npassif weapon 4 résolu niv max:',
    fillPlaceholders(d.passives[wp].desc.en, d.passives[wp].values.at(-1)!),
  );
}
