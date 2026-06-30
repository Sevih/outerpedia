/**
 * Générateur des COMPÉTENCES (CharacterSkillTemplet + …LevelTemplet).
 *
 * Un skill = définition (nom, type, cible, portée, AP, icône) + une desc
 * TEMPLATE (placeholders `[Buff_C/V/T_<id>]`, couleurs source conservées) + des
 * niveaux. Chaque niveau porte les valeurs qui scalent (damageFactor, cool, gains)
 * et les EFFETS appliqués (BuffID → classifier) + les réfs glossaire (BuffToolTip).
 *
 * Patron maison appliqué :
 *   - desc = 1 template (les nombres viennent des effets par niveau → pas 5 phrases) ;
 *   - effets = structurés via le classifier (famille/cat + réf glossaire) ;
 *   - on garde TOUT (skills mécaniques sans nom/desc inclus) — aucun drop silencieux.
 *
 * Le lien desc↔effet se fait par l'id de buff : un placeholder `[Buff_V_<id>]` se
 * résout depuis l'effet du niveau dont `buff === <id>` (ou via la primitive
 * `resolveSkillPlaceholders` côté datagen / front).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  buffRowAtLevel,
  loadBuffIndex,
  resolveSkillPlaceholders,
  skillBuffVars,
  type SkillBuffVars,
} from '../lib/buff';
import { effectShape, type EffectShape } from '../lib/effects';
import { slugEnum } from '../lib/enums';
import type { LangDict } from '../lib/lang';
import { loadTextIndex, resolveText } from '../lib/text';
import { groupBy, loadTable, num, splitCsv, type Row } from '../lib/tables';

const OUT = resolve('.gamedata/staging/skills');

/** Sous-type fonctionnel d'un skill. */
type SkillSubType = 'active' | 'passive' | null;

/** Données d'un niveau de compétence (seules les clés utiles sont émises). */
export interface SkillLevel {
  level: number;
  /** Multiplicateur de dégâts brut (DamageFactor de la table). */
  damageFactor?: number;
  /** Cooldown (tours) et cooldown initial. */
  cool?: number;
  startCool?: number;
  /** Gains de jauge / ressources à l'usage. */
  gainAP?: number;
  gainCP?: number;
  /** Réduction de jauge de garde infligée. */
  wgReduce?: number;
  /**
   * Valeurs scalantes par id de buff (chance/valeur/tours). Sert la desc
   * (`[Buff_C/V/T_<id>]`) ET les nombres des chips d'effet. Un buff absent ici
   * = inactif à ce niveau.
   */
  vars?: Record<string, SkillBuffVars>;
  /** Réfs vers le glossaire des statuts (BuffToolTipTemplet). */
  tooltips?: string[];
  /** Notes d'amélioration de niveau (« +10% damage »), résolues, non vides. */
  upgrades?: LangDict[];
}

/** Une compétence (source unique, référencée par les personnages). */
export interface Skill {
  id: string;
  name: LangDict;
  /** Template de description (placeholders + couleurs source), si présent. */
  desc?: LangDict;
  /** Famille de skill (slug de SkillType : first/second/ultimate/class_passive…). */
  type: string;
  subType: SkillSubType;
  /** Cible (slug minuscule de TargetTeamType) si applicable. */
  target?: string;
  /** Portée (slug minuscule de RangeType) si applicable. */
  range?: string;
  icon?: string;
  /** Coût en points d'action. */
  requireAP?: number;
  /**
   * Structure des effets appliqués (famille/cat/cible/stat + id de buff),
   * INVARIANTE par niveau et définie une seule fois. Les nombres vivent dans
   * `levels[i].vars[buff]`. Union des buffs vus sur tous les niveaux.
   */
  effects?: EffectShape[];
  maxLevel: number;
  levels: SkillLevel[];
}

/** Sortie du générateur : catalogue de compétences référençable par id. */
export interface SkillData {
  skills: Record<string, Skill>;
}

/** Valeur d'enum de cible/portée → slug minuscule, `undefined` si NONE/vide/CSV. */
function slugTeam(v: string | undefined): string | undefined {
  const first = splitCsv(v ?? '')[0];
  if (!first || first === 'NONE') return undefined;
  return first.toLowerCase();
}

/** Sous-type ACTIVE/PASSIVE → slug, sinon null. */
function subTypeOf(v: string | undefined): SkillSubType {
  if (v === 'ACTIVE') return 'active';
  if (v === 'PASSIVE') return 'passive';
  return null;
}

export function buildSkills(): SkillData {
  const buffs = loadBuffIndex();
  const tskill = loadTextIndex('TextSkill');
  const skillRows = loadTable('CharacterSkillTemplet');
  const levelsBySkill = groupBy(loadTable('CharacterSkillLevelTemplet'), 'SkillID');

  const skills: Record<string, Skill> = {};

  for (const s of skillRows) {
    const id = s.ID;
    if (!id) continue;
    const lvlRows = (levelsBySkill.get(id) ?? [])
      .slice()
      .sort((a, b) => num(a.SkillLevel) - num(b.SkillLevel));
    const lvl1 = lvlRows[0];

    // Desc principale = DescID du skill (template), sinon DescID du niveau 1
    // (cas des passifs uniques dont la desc vit sur la ligne de niveau).
    const mainOnSkill = !!s.DescID;
    const descKey = splitCsv(s.DescID ?? '')[0] || splitCsv(lvl1?.DescID ?? '')[0] || '';
    const desc = descKey ? resolveText(tskill, descKey) : undefined;

    const maxLevel = num(lvlRows[lvlRows.length - 1]?.SkillLevel) || lvlRows.length || 1;

    const skill: Skill = {
      id,
      name: resolveText(tskill, s.NameID),
      type: slugEnum(s.SkillType ?? ''),
      subType: subTypeOf(s.SkillSubType),
      maxLevel,
      levels: lvlRows.map((r) => buildLevel(r, buffs, tskill, mainOnSkill)),
    };
    if (desc && desc.en) skill.desc = desc;
    const target = slugTeam(s.TargetTeamType);
    if (target) skill.target = target;
    const range = slugTeam(s.RangeType);
    if (range) skill.range = range;
    if (s.IconName) skill.icon = s.IconName;
    if (num(s.RequireAP) > 0) skill.requireAP = num(s.RequireAP);

    // Structure des effets : union des buffs vus sur tous les niveaux (ordre
    // d'apparition), forme invariante prise au niveau max.
    const shapes: EffectShape[] = [];
    const seen = new Set<string>();
    for (const r of lvlRows) {
      for (const buffId of splitCsv(r.BuffID ?? '')) {
        if (seen.has(buffId)) continue;
        const row = buffRowAtLevel(buffs, buffId, maxLevel);
        if (!row) continue;
        seen.add(buffId);
        shapes.push(effectShape(row));
      }
    }
    if (shapes.length) skill.effects = shapes;

    skills[id] = skill;
  }

  return { skills };
}

/** Construit un niveau de skill : valeurs scalantes + vars (par buff) + réfs. */
function buildLevel(
  r: Row,
  buffs: ReturnType<typeof loadBuffIndex>,
  tskill: Map<string, LangDict>,
  mainOnSkill: boolean,
): SkillLevel {
  const level = num(r.SkillLevel) || 1;
  const out: SkillLevel = { level };
  if (num(r.DamageFactor) > 0) out.damageFactor = num(r.DamageFactor);
  if (num(r.Cool) > 0) out.cool = num(r.Cool);
  if (num(r.StartCool) > 0) out.startCool = num(r.StartCool);
  if (num(r.GainAP) > 0) out.gainAP = num(r.GainAP);
  if (num(r.GainCP) > 0) out.gainCP = num(r.GainCP);
  if (num(r.WGReduce) > 0) out.wgReduce = num(r.WGReduce);

  // Valeurs scalantes par buff (chance/valeur/tours), à CE niveau.
  const vars: Record<string, SkillBuffVars> = {};
  for (const buffId of splitCsv(r.BuffID ?? '')) {
    const v = skillBuffVars(buffs, buffId, level);
    if (v.c || v.v || v.t) vars[buffId] = v;
  }
  if (Object.keys(vars).length) out.vars = vars;

  // Réfs glossaire (statuts nommés affichés pour ce skill).
  const tooltips = splitCsv(r.BuffToolTip ?? '');
  if (tooltips.length) out.tooltips = tooltips;

  // Notes d'amélioration de niveau : seulement quand la desc principale est sur
  // le skill (sinon le DescID du niveau EST la desc, déjà captée).
  if (mainOnSkill && r.DescID) {
    const ups = splitCsv(r.DescID)
      .map((k) => resolveText(tskill, k))
      .filter((d) => d.en);
    if (ups.length) out.upgrades = ups;
  }

  return out;
}

// --- staging -----------------------------------------------------------------

function main(): void {
  mkdirSync(OUT, { recursive: true });
  const buffs = loadBuffIndex();
  const { skills } = buildSkills();
  writeFileSync(resolve(OUT, 'skills.json'), JSON.stringify({ skills }, null, 2));

  // Échantillon lisible : les skills de K (2000001), descs résolues par niveau.
  const ch = loadTable('CharacterTemplet').find((c) => c.ID === '2000001');
  const ids: string[] = [];
  for (let i = 1; i <= 23; i++) if (ch?.[`Skill_${i}`]) ids.push(ch[`Skill_${i}`]);
  const strip = (s: string) => s.replace(/<color=#[0-9a-fA-F]+>/g, '').replace(/<\/color>/g, '');
  const sample = ids
    .map((id) => skills[id])
    .filter(Boolean)
    .map((sk) => ({
      id: sk.id,
      type: sk.type,
      name: sk.name.en,
      descTemplate: sk.desc ? strip(sk.desc.en) : null,
      descByLevel: sk.desc
        ? [1, sk.maxLevel].map(
            (lv) => `Lv${lv}: ${strip(resolveSkillPlaceholders(sk.desc!.en, buffs, lv))}`,
          )
        : null,
      effects: sk.effects?.map((e) => {
        const v = sk.levels[0]?.vars?.[e.buff ?? ''];
        const num = v
          ? [v.c, v.v && `${e.stat ?? ''}${v.v}`, v.t && `${v.t}t`].filter(Boolean).join(' ')
          : '';
        return `${e.family}/${e.category}${num ? ` (${num})` : ''}`;
      }),
    }));
  writeFileSync(resolve(OUT, 'sample-K.json'), JSON.stringify(sample, null, 2));

  const list = Object.values(skills);
  console.log(`skills: ${list.length}`);
  console.log(`  avec desc: ${list.filter((s) => s.desc).length}`);
  console.log(`  avec effets: ${list.filter((s) => s.effects?.length).length}`);
  console.log(
    `  actifs/passifs/none: ${list.filter((s) => s.subType === 'active').length}/${list.filter((s) => s.subType === 'passive').length}/${list.filter((s) => s.subType === null).length}`,
  );
  console.log(`staging: ${OUT}`);
}

// Exécution directe uniquement (importable sans effet de bord par l'orchestrateur).
if (process.argv[1] && process.argv[1].endsWith('skills.ts')) main();
