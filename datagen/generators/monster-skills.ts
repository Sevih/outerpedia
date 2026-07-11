/**
 * Générateur des COMPÉTENCES DE MONSTRES (MonsterSkillTemplet + …LevelTemplet).
 *
 * MÊME CONTRAT de sortie que les skills persos (`Skill` de ./skills) : desc
 * TEMPLATE aux placeholders `[Buff_C/V/T_<id>]` (mêmes buffs, même BuffTemplet),
 * `vars` scalantes par niveau, réfs glossaire (`BuffToolTip`), effets structurés
 * via le classifier — le front réutilise le rendu tel quel.
 *
 * Catalogue SÉPARÉ (`monster-skills.json`) : les espaces d'ids monstre/perso
 * sont disjoints aujourd'hui mais rien ne le garantit côté jeu.
 *
 * Colonnes purement moteur IGNORÉES (IA/animation, pas de la donnée
 * d'affichage) : TriggerName, FocusType, Approach*, UseJiggleBone, AIType.
 * Pas de RequireAP/GainAP/GainCP côté monstre (pas de jauge joueur), ni
 * d'upgrades de niveau (les lignes de niveau n'ont pas de DescID).
 */
import {
  buffRowAtLevel,
  expandBuffIds,
  loadBuffGroups,
  loadBuffIndex,
  skillBuffVars,
  type SkillBuffVars,
} from '../lib/buff';
import { effectShape, type EffectShape } from '../lib/effects';
import { slugEnum } from '../lib/enums';
import { loadTextIndex, resolveText } from '../lib/text';
import { groupBy, loadTable, num, splitCsv } from '../lib/tables';
import { slugTeam, subTypeOf, type Skill, type SkillData, type SkillLevel } from './skills';

export function buildMonsterSkills(): SkillData {
  const buffs = loadBuffIndex();
  const groups = loadBuffGroups();
  const tskill = loadTextIndex('TextSkill');
  const skillRows = loadTable('MonsterSkillTemplet');
  const levelsBySkill = groupBy(loadTable('MonsterSkillLevelTemplet'), 'SkillID');

  const skills: Record<string, Skill> = {};

  for (const s of skillRows) {
    const id = s.ID;
    if (!id) continue;
    const lvlRows = (levelsBySkill.get(id) ?? [])
      .slice()
      .sort((a, b) => num(a.SkillLevel) - num(b.SkillLevel));

    const descKey = splitCsv(s.DescID ?? '')[0] || '';
    const desc = descKey ? resolveText(tskill, descKey) : undefined;
    const maxLevel = num(lvlRows[lvlRows.length - 1]?.SkillLevel) || lvlRows.length || 1;

    const type = slugEnum(s.SkillType ?? '');
    const levels: SkillLevel[] = lvlRows.map((r) => {
      const level = num(r.SkillLevel) || 1;
      const out: SkillLevel = { level };
      if (num(r.DamageFactor) > 0) out.damageFactor = num(r.DamageFactor);
      if (num(r.Cool) > 0) out.cool = num(r.Cool);
      if (num(r.StartCool) > 0) out.startCool = num(r.StartCool);
      if (num(r.WGReduce) > 0) out.wgReduce = num(r.WGReduce);
      const vars: Record<string, SkillBuffVars> = {};
      for (const { id: buffId } of expandBuffIds(splitCsv(r.BuffID ?? ''), buffs, groups, level)) {
        const v = skillBuffVars(buffs, buffId, level);
        if (v.c || v.v || v.t) vars[buffId] = v;
      }
      if (Object.keys(vars).length) out.vars = vars;
      const tooltips = splitCsv(r.BuffToolTip ?? '');
      if (tooltips.length) out.tooltips = tooltips;
      return out;
    });

    const skill: Skill = {
      id,
      name: resolveText(tskill, s.NameID),
      type,
      subType: subTypeOf(s.SkillSubType),
      offensive: levels.some((l) => (l.damageFactor ?? 0) > 0) || type === 'chain_passive',
      maxLevel,
      levels,
    };
    if (desc && desc.en) skill.desc = desc;

    // Vars des buffs cités par la DESC mais absents des niveaux — résolution
    // globale par id de buff, niveau à niveau (même filet que les skills persos).
    if (skill.desc) {
      const refIds = new Set([...skill.desc.en.matchAll(/\[Buff_[CVT]_(.+?)\]/g)].map((m) => m[1]));
      for (const lv of skill.levels) {
        for (const refId of refIds) {
          if (lv.vars?.[refId]) continue;
          const v = skillBuffVars(buffs, refId, lv.level);
          if (v.c || v.v || v.t) (lv.vars ??= {})[refId] = v;
        }
      }
    }
    const target = slugTeam(s.TargetTeamType);
    if (target) skill.target = target;
    const range = slugTeam(s.RangeType);
    if (range) skill.range = range;
    if (s.IconName) skill.icon = s.IconName;

    // Structure des effets : union des buffs vus sur tous les niveaux (ordre
    // d'apparition), forme invariante prise au niveau max.
    const shapes: EffectShape[] = [];
    const seen = new Set<string>();
    // Statuts que le jeu AFFICHE lui-même sur le skill (colonne BuffToolTip).
    const levelTooltips = new Set(lvlRows.flatMap((r) => splitCsv(r.BuffToolTip ?? '')));
    for (const r of lvlRows) {
      for (const { id: buffId, choice, child } of expandBuffIds(
        splitCsv(r.BuffID ?? ''),
        buffs,
        groups,
        maxLevel,
      )) {
        if (seen.has(buffId)) continue;
        const row = buffRowAtLevel(buffs, buffId, maxLevel);
        if (!row) continue;
        // Marqueur MOTEUR : un `BT_NONE` enfant de groupe n'applique rien — si
        // le jeu ne le liste pas lui-même sur le skill (BuffToolTip), son
        // ToolTipID est du câblage, souvent RECYCLÉ d'un autre kit (l'ultimate
        // du Guardian 131644 pointait « Random Debuff » du kit 4044xxx).
        if (child && row.Type === 'BT_NONE' && !levelTooltips.has(row.ToolTipID ?? '')) continue;
        seen.add(buffId);
        const shape = effectShape(row);
        if (choice) shape.choice = true;
        shapes.push(shape);
      }
    }
    if (shapes.length) skill.effects = shapes;

    skills[id] = skill;
  }

  return { skills };
}
