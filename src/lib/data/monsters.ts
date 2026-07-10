/**
 * Accès lecture aux MONSTRES validés (donnée d'extraction committée) — côté
 * public (guides). L'admin a son propre store (`src/lib/admin/monster-store`).
 */
import monstersData from '@data/generated/monsters.json';
import monsterSkillsData from '@data/generated/monster-skills.json';
import encountersData from '@data/generated/encounters.json';
import glossariesData from '@data/generated/glossaries.json';
import type {
  EncountersFile,
  Glossaries,
  Monster,
  MonsterSkillsFile,
  MonstersFile,
  Skill,
} from '@contracts';
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { expandRankContexts, type SpawnContext } from '@/lib/monster-stats';
import { img } from '@/lib/images';

const MONSTERS = monstersData as unknown as MonstersFile;
const SKILLS = monsterSkillsData as unknown as MonsterSkillsFile;
const DUNGEONS = encountersData as unknown as EncountersFile;
const G = glossariesData as unknown as Glossaries;

export function getMonster(id: string): Monster | undefined {
  return MONSTERS[id];
}

/** Skills d'un monstre (dans l'ordre du kit ; ids inconnus ignorés). */
export function getMonsterSkills(m: Monster): Skill[] {
  return m.skills.map((id) => SKILLS[id]).filter((s): s is Skill => Boolean(s));
}

/** Échelle d'affichage des stats (per-mille → % ou brut) — glossaire global. */
export function getStatScales(): Record<string, string> {
  return G.statScales;
}

/**
 * Icône d'un monstre (convention du jeu) : `icon` commençant par « 2 » =
 * modèle de PERSONNAGE réutilisé en boss → face icon composée ; sinon vignette
 * `MT_<icon>` (namespace boss existant — même clé que les sources d'équipement,
 * jamais de doublon inter-namespace).
 */
export function monsterIconSrc(m: Pick<Monster, 'icon'>): string {
  return m.icon.startsWith('2') ? img.face(m.icon) : img.boss(`MT_${m.icon}`);
}

/**
 * Rencontres connues d'un monstre, avec les MODIFICATEURS du donjon (adv
 * per-mille, PV réels du mode) et un libellé « Mode · Stage » localisé — prêt
 * pour le calcul de stats effectives (src/lib/monster-stats).
 */
export function monsterSpawnContexts(m: Monster, lang: Lang): SpawnContext[] {
  return (m.spawns ?? []).flatMap((s) => {
    const d = DUNGEONS[s.dungeon];
    if (!d) return [];
    const mode = G.modes?.[d.mode] ? lRec(G.modes[d.mode], lang) : d.mode;
    return expandRankContexts(
      {
        level: s.level,
        label: `${mode} · ${lRec(d.name, lang) || d.name.en}`,
        ...(d.adv ? { adv: d.adv } : {}),
        ...(d.bossHp ? { bossHp: d.bossHp } : {}),
        ...(s.hpLines ? { hpLines: s.hpLines } : {}),
      },
      d.ranks,
    );
  });
}
