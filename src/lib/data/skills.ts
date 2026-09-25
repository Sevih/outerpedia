/**
 * Accès aux SKILLS des persos (`data/generated/skills.json`, id → Skill).
 * Donnée générée → import statique figé (5,9 Mo : réservé aux lecteurs qui
 * rendent côté serveur ; le calculateur de dégâts le lit au disque).
 */
import type { SkillsFile } from '@contracts';
import skillsData from '@data/generated/skills.json';

const SKILLS = skillsData as unknown as SkillsFile;

export function getSkills(): SkillsFile {
  return SKILLS;
}
