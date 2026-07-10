/**
 * Spec d'extraction — MONSTRES (MonsterTemplet).
 *
 * Domaine dérivé UNIQUEMENT des données du jeu — pas d'oracle V2 ni de contrôle
 * V2↔V3 sur les monstres (décision du 2026-07-10) : pas de `coverage`.
 *
 * Mêmes conventions que la spec character : slugs stables (libellés dans les
 * glossaires), stats BRUTES en paires _Min/_Max (l'échelle vit dans
 * `statScales`), skills RÉFÉRENCÉS par id — le catalogue vit dans
 * `monster-skills.json` (generators/monster-skills), au même contrat `Skill`
 * que les persos pour réutiliser le rendu du front tel quel.
 *
 * Spécificités monstre conservées :
 *   - `type` : catégorie de contenu (monster/boss/area_boss/named/season_boss) ;
 *   - immunités : par type de buff (`BT_*`), par stat (`ST_*`) et les réfs
 *     glossaire affichées en jeu (`BuffToolTipTemplet`, même espace d'ids que
 *     les tooltips de skills) ;
 *   - `pushBack`/`pushUp` : sensibilité au recul/à la projection (émis tel que
 *     présent dans la table — absent = défaut moteur inconnu) ;
 *   - `spawns`/`summonedBy`/`linkedTo` : LOCALISATION (générateur encounters)
 *     embarquée sur l'entité — un boss déplacé/re-niveauté = diff d'entité,
 *     donc revu, enregistré et versionné par les mêmes gestes que le reste ;
 *     les donjons référencés vivent dans `encounters.json`, les titres de
 *     modes dans `glossaries.modes`.
 */
import type { LangDict } from '../../lib/lang';
import { resolveClass } from '../../lib/class';
import { slugEnum } from '../../lib/enums';
import { loadTextIndex, resolveText } from '../../lib/text';
import { loadTable, num, splitCsv } from '../../lib/tables';
import {
  buildEncounters,
  type EncountersData,
  type MonsterSpawn,
} from '../../generators/encounters';
import { runSpec } from '../core/runner';
import type { ExtractorSpec } from '../core/spec';
import type { Schema } from '../core/validate';
import { extractStats, statRangeSchema, type StatRange } from './character';

/** Un monstre (mob, élite, boss…) — source unique, skills référencés par id. */
export interface Monster {
  id: string;
  name: LangDict;
  /** Titre/épithète (NickNameID), si renseigné. */
  nickname?: LangDict;
  /** Catégorie (slug de CT_* : monster/boss/area_boss/named/season_boss). */
  type: string;
  /** Slugs stables (libellés dans les glossaires). */
  race: string;
  class: string;
  subClass?: string;
  element: string;
  /** Étoiles de base (BasicStar). */
  rarity: number;
  /** Id de portrait (FaceIconID) — sprite `MT_<icon>` côté front. */
  icon: string;
  /** Comportement IA (slug AIType : attack/cast_buff/heal…). */
  aiType?: string;
  /** Réfs vers le catalogue monster-skills (Skill_1..23 non vides). */
  skills: string[];
  /** Stats de base par slug (valeurs brutes ; échelle dans `statScales`). */
  stats: Record<string, StatRange>;
  /** Sensible au recul / à la projection (colonne présente uniquement). */
  pushBack?: boolean;
  pushUp?: boolean;
  /** Immunités aux effets, par TYPE de buff (`BT_*`, réf `effectByKey`). */
  buffImmune?: string[];
  /** Immunités aux baisses de stats (`ST_*`). */
  statBuffImmune?: string[];
  /** Immunités AFFICHÉES en jeu : réfs glossaire (BuffToolTipTemplet). */
  immuneTooltips?: string[];
  /**
   * OÙ affronte-t-on ce monstre : apparitions {donjon, niveau réel, barres de
   * vie}. Le donjon est une réf vers `encounters.json` (mode/titre/région) —
   * embarqué sur l'entité pour que déplacer un boss soit un DIFF visible,
   * enregistrable et versionnable comme le reste.
   */
  spawns?: MonsterSpawn[];
  /** Jamais spawné : invoqué par ces monstres (heuristique texte des skills). */
  summonedBy?: string[];
  /** Jamais spawné : lié au kit de ces monstres (réfs BuffToolTip structurelles). */
  linkedTo?: string[];
}

/** Glossaire générique slug → libellé localisé. */
type Glossary = Record<string, LangDict>;

/** Contributions du domaine monstre aux glossaires globaux (fusionnées par build). */
export interface MonsterGlossaries {
  elements: Glossary;
  classes: Glossary;
  subClasses: Record<string, { name: LangDict; desc?: LangDict }>;
}

interface MonsterAux {
  tchar: Map<string, LangDict>;
  /** slug d'enum de classe brut (`attacker`) → slug canonique (`striker`). */
  classOf: Map<string, string>;
  glossaries: MonsterGlossaries;
  /** Rencontres (spawns/summonedBy/linkedTo par monstre) — mémoïsées. */
  enc: EncountersData;
}

/**
 * Catégorie de monstre : `CT_<X>_MONSTER` → `<x>` (boss, area_boss, named,
 * season_boss) ; `CT_MONSTER` (mob de base) → `monster`.
 */
function monsterType(v: string | undefined): string {
  const slug = slugEnum(v ?? '');
  return slug === 'monster' ? slug : slug.replace(/_monster$/, '');
}

/** Booléen de table (`true`/`True`/`False`), `undefined` si colonne absente. */
function boolCol(v: string | undefined): boolean | undefined {
  if (v === undefined) return undefined;
  return v.toLowerCase() === 'true';
}

const monsterSchema: Schema = {
  kind: 'object',
  fields: {
    id: { kind: 'string' },
    name: { kind: 'langDict' },
    nickname: { kind: 'langDict', optional: true },
    type: {
      kind: 'string',
      enum: ['monster', 'boss', 'area_boss', 'named', 'season_boss'],
    },
    race: { kind: 'string' },
    class: { kind: 'string' },
    subClass: { kind: 'string', optional: true },
    element: { kind: 'string' },
    rarity: { kind: 'number', int: true, min: 0 },
    icon: { kind: 'string' },
    aiType: { kind: 'string', optional: true },
    skills: { kind: 'array', of: { kind: 'string' } },
    stats: { kind: 'record', of: statRangeSchema },
    pushBack: { kind: 'boolean', optional: true },
    pushUp: { kind: 'boolean', optional: true },
    buffImmune: { kind: 'array', of: { kind: 'string' }, optional: true },
    statBuffImmune: { kind: 'array', of: { kind: 'string' }, optional: true },
    immuneTooltips: { kind: 'array', of: { kind: 'string' }, optional: true },
    spawns: {
      kind: 'array',
      minItems: 1,
      optional: true,
      of: {
        kind: 'object',
        fields: {
          dungeon: { kind: 'string' },
          level: { kind: 'number', int: true, min: 0 },
          hpLines: { kind: 'number', int: true, min: 2, optional: true },
        },
      },
    },
    summonedBy: { kind: 'array', of: { kind: 'string' }, minItems: 1, optional: true },
    linkedTo: { kind: 'array', of: { kind: 'string' }, minItems: 1, optional: true },
  },
};

export const monsterSpec: ExtractorSpec<Monster, MonsterAux> = {
  id: 'monster',

  select() {
    // Tout MonsterTemplet : mobs, élites, boss — le front filtre par `type`.
    return loadTable('MonsterTemplet');
  },

  prepare(rows) {
    const tchar = loadTextIndex('TextCharacter');
    const tsys = loadTextIndex('TextSystem');

    // Glossaires : une entrée par slug rencontré (même patron que character ;
    // build.ts fusionne, les libellés du domaine perso restent prioritaires).
    const elements: Glossary = {};
    const classes: Glossary = {};
    const classOf = new Map<string, string>();
    const subClasses: MonsterGlossaries['subClasses'] = {};
    for (const r of rows) {
      const element = slugEnum(r.Element);
      const klassRaw = slugEnum(r.Class);
      const subClass = r.SubClass && r.SubClass !== 'NONE' ? r.SubClass.toLowerCase() : undefined;
      if (element) elements[element] ??= resolveText(tsys, `SYS_ELEMENT_${element.toUpperCase()}`);
      if (klassRaw && !classOf.has(klassRaw)) {
        const { slug, name } = resolveClass(klassRaw, tsys);
        classOf.set(klassRaw, slug);
        classes[slug] ??= name;
      }
      if (subClass && !subClasses[subClass]) {
        const up = subClass.toUpperCase();
        const desc = resolveText(tsys, `SYS_CLASS_INFO_${up}`);
        subClasses[subClass] = { name: resolveText(tsys, `SYS_CLASS_NAME_${up}`) };
        if (desc.en) subClasses[subClass].desc = desc;
      }
    }

    return {
      tchar,
      classOf,
      glossaries: { elements, classes, subClasses },
      enc: buildEncounters(),
    };
  },

  map(r, aux) {
    const skills: string[] = [];
    for (let i = 1; i <= 23; i++) if (r[`Skill_${i}`]) skills.push(r[`Skill_${i}`]);

    const monster: Monster = {
      id: r.ID,
      name: resolveText(aux.tchar, r.NameID),
      type: monsterType(r.Type),
      race: slugEnum(r.Race),
      class: aux.classOf.get(slugEnum(r.Class)) ?? slugEnum(r.Class),
      element: slugEnum(r.Element),
      rarity: num(r.BasicStar),
      icon: r.FaceIconID ?? r.ID,
      skills,
      stats: extractStats(r),
    };
    const nick = resolveText(aux.tchar, r.NickNameID);
    if (nick.en) monster.nickname = nick;
    const subClass = r.SubClass && r.SubClass !== 'NONE' ? r.SubClass.toLowerCase() : undefined;
    if (subClass) monster.subClass = subClass;
    if (r.AIType) monster.aiType = slugEnum(r.AIType, 0);
    const pushBack = boolCol(r.PushBack);
    if (pushBack !== undefined) monster.pushBack = pushBack;
    const pushUp = boolCol(r.PushUp);
    if (pushUp !== undefined) monster.pushUp = pushUp;
    const buffImmune = splitCsv(r.BuffImmune ?? '');
    if (buffImmune.length) monster.buffImmune = buffImmune;
    const statBuffImmune = splitCsv(r.StatBuffImmune ?? '');
    if (statBuffImmune.length) monster.statBuffImmune = statBuffImmune;
    const immuneTooltips = splitCsv(r.BuffImmuneToolTip ?? '');
    if (immuneTooltips.length) monster.immuneTooltips = immuneTooltips;

    const enc = aux.enc.monsters[r.ID];
    if (enc?.spawns.length) monster.spawns = enc.spawns;
    if (enc?.summonedBy?.length) monster.summonedBy = enc.summonedBy;
    if (enc?.linkedTo?.length) monster.linkedTo = enc.linkedTo;

    return monster;
  },

  key: (m) => m.id,
  schema: monsterSchema,

  finalize: (_items, aux) => ({ ...aux.glossaries }),
};

/** Sortie du domaine monstre (monstres + contributions aux glossaires). */
export interface MonsterData {
  monsters: Record<string, Monster>;
  glossaries: MonsterGlossaries;
}

/** Compat orchestrateur : exécute la spec et assemble la `MonsterData`. */
export function buildMonsters(): MonsterData {
  const r = runSpec(monsterSpec);
  return { monsters: r.items, glossaries: r.extra as unknown as MonsterGlossaries };
}
