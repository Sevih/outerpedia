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
import { loadBuffGroups, loadBuffIndex } from '../lib/buff';
import { loadTextIndex } from '../lib/text';
import { groupBy, loadTable } from '../lib/tables';
import { assembleSkill, type Skill, type SkillData } from './skills';

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
    // Cœur d'assemblage partagé avec les skills persos (cf. `assembleSkill`) ;
    // options par défaut = pas de GainAP/GainCP ni de DescID de niveau côté
    // monstre. Pas non plus de RequireAP, de buffs de chaîne par convention ni
    // de buffs « ambiants » PriorityGroup — spécificités persos.
    const { skill, shapes } = assembleSkill(s, levelsBySkill.get(id) ?? [], buffs, groups, tskill);
    if (shapes.length) skill.effects = shapes;
    skills[id] = skill;
  }

  return { skills };
}
