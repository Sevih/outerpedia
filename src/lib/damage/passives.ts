/**
 * PASSIFS DE BOSS — les buffs que le kit d'un monstre preset pose en
 * PERMANENT au combat (`SkillSubType == PASSIVE`, `BuffCreateType == PASSIVE`),
 * demandés par Sevih (05/08/2026) : « c'est un débuff comme un autre » — ils
 * traversent le système de buffs du moteur, on ne trafique JAMAIS les stats
 * saisies pour les simuler.
 *
 * Chaîne de données (tout est DÉJÀ extrait, aucune table nouvelle) :
 *   targets.json (kit du monstre, slots `Skill_<n>`) → skills PASSIVE →
 *   `buffIds` du niveau unique (650/650 passifs de boss preset sont
 *   mono-niveau en 1.4.9 — garde testée) → buffs.json (lignes BuffTemplet :
 *   type, cible, valeur, condition).
 *
 * Classement par CIBLE du buff (`TargetType`, point de vue du BOSS) :
 *   - `ENEMY_TEAM*` = l'équipe du JOUEUR → côté ATTAQUANT (ex. « Starving
 *     Devil » : taux crit +100 %, dégâts crit −85 % sur toute l'équipe) ;
 *   - `ME`/`MY_TEAM` = le boss → côté DÉFENSEUR (ex. réductions de dégâts
 *     conditionnées à l'élément de l'attaquant).
 *
 * Conditions ÉVALUABLES statiquement : les trois élémentaires
 * (`ATTACKER_ELEMENT_WIN/EQUAL/LOSE`, enum binaire `ELEMENT_SUPERIORITY_TYPE`
 * à TROIS valeurs — EQUAL est le « ni avantage ni désavantage », pas « même
 * élément ») — résolues par la MÊME relation § 6 que le taux élémentaire
 * (`getElementSuperiority`). Toute autre condition (`OWNER_HAS_BUFF`,
 * `OWNER_RAGE`…) dépend de l'état du combat : le buff est REMONTÉ
 * `unresolved`, contribution 0 — jamais deviné.
 *
 * HORS périmètre (documenté, jamais tu quand c'est damage-pertinent) :
 *   - `BT_WG_DMG_REDUCE` : l'agrégation de la jauge n'est pas désassemblée
 *     (spec formule § 12.3) → unresolved ;
 *   - `BT_DMG*` sur `ME` : les dégâts SORTANTS du boss — le rapport ne
 *     calcule jamais les dégâts de la cible (report-inputs § 1) → ignoré
 *     silencieusement ;
 *   - `BT_STAT` sur `ME` : les stats défensives du preset viennent des stats
 *     de spawn, le pipeline défenseur ne consomme pas de canal de stat →
 *     unresolved (aucun cas en 1.4.9 hors buffs dynamiques) ;
 *   - créations dynamiques (`ON_TURN`, `SKILL_FINISH`…) : boucliers, stacks,
 *     drains — état de combat, pas des passifs statiques → ignorés (les types
 *     damage-pertinents partent en unresolved).
 */

import type { ActiveBuff } from './aggregate';
import { getElementSuperiority } from './formula';
import { Element, ElementSuperiority } from './types';
import type { DamageBuffsData, DamageTargetsData } from './inputs';

/** Un buff passif STATIQUE du boss, classé et prêt à évaluer. */
export interface BossPassiveEntry {
  /** Skill porteur (pour remonter au nom affichable côté UI). */
  skillId: string;
  buffId: string;
  /** Côté du scénario qui le reçoit (cf. en-tête). */
  side: 'attacker' | 'defender';
  /** La forme consommée par l'agrégateur (§ 9 / § 16.1). */
  buff: ActiveBuff;
  /** Condition élémentaire (`ATTACKER_ELEMENT_*`) — absente = toujours actif. */
  condition?: string;
}

export interface BossPassivesStatic {
  entries: BossPassiveEntry[];
  /** Damage-pertinent mais NON évaluable statiquement — affiché, jamais tu. */
  unresolved: { buffId: string; reason: string }[];
}

/** Entrée évaluée contre les éléments du scénario (rapport + affichage). */
export interface BossPassiveApplied extends BossPassiveEntry {
  active: boolean;
}

export interface BossPassivesInfo {
  entries: BossPassiveApplied[];
  unresolved: { buffId: string; reason: string }[];
}

const ELEMENT_CONDITIONS = new Set([
  'ATTACKER_ELEMENT_WIN',
  'ATTACKER_ELEMENT_EQUAL',
  'ATTACKER_ELEMENT_LOSE',
]);

/** Types côté DÉFENSEUR réellement consommés par le pipeline (§ 9.2/9.3, drapeaux). */
const DEFENDER_TYPES = new Set([
  'BT_DMG_REDUCE',
  'BT_DMG_REDUCE_FINAL',
  'BT_DMG_REDUCE_FINAL_WITH_OUT_FIRST_SKILL',
  'BT_DMG_REDUCE_MY_TEAM_INCREASE',
  'BT_STEALTHED',
  'BT_INVINCIBLE',
  'BT_WG_INVINCIBLE',
]);

/** Types damage-pertinents SANS chemin d'application → unresolved, par raison. */
const UNRESOLVED_REASONS: Record<string, string> = {
  BT_WG_DMG_REDUCE: 'agrégation jauge non désassemblée (§ 12.3)',
};

/**
 * Les passifs STATIQUES d'un monstre preset — conditions NON évaluées (le
 * wrapper serveur s'en sert pour bâtir des props légères, le moteur les
 * évalue via `passiveConditionMet`). `undefined` si le monstre est inconnu
 * des tables targets.
 */
export function staticBossPassives(
  monsterId: string,
  targets: DamageTargetsData,
  buffs: DamageBuffsData,
): BossPassivesStatic | undefined {
  const monster = targets.targets[monsterId];
  if (!monster) return undefined;

  const entries: BossPassiveEntry[] = [];
  const unresolved: BossPassivesStatic['unresolved'] = [];
  for (const ref of monster.skills) {
    const skill = targets.skills[ref.id];
    if (!skill || skill.subType !== 'PASSIVE') continue;
    // 650/650 passifs de boss preset sont mono-niveau (garde datagen) — le
    // niveau unique est LE niveau appliqué.
    const level = skill.levels[0];
    if (!level) continue;
    for (const buffId of level.buffIds) {
      for (const row of buffs.buffs[buffId] ?? []) {
        if (row.createType !== 'PASSIVE') continue; // dynamique : état de combat
        const condition = row.conditionType;
        const target = row.targetType ?? '';
        // Classement par cible (cf. en-tête) : côté du scénario, ou raison de
        // non-application quand le type est damage-pertinent sans chemin.
        const classify = (): { side?: BossPassiveEntry['side']; reason?: string } => {
          if (target.startsWith('ENEMY_TEAM')) {
            // Équipe du JOUEUR : seuls les canaux de stats § 16.1 jouent sur
            // les dégâts — soins/CP/boucliers sur l'équipe : hors périmètre.
            return row.type === 'BT_STAT' ? { side: 'attacker' } : {};
          }
          if (target === 'ME' || target === 'MY_TEAM') {
            if (DEFENDER_TYPES.has(row.type)) return { side: 'defender' };
            const known = UNRESOLVED_REASONS[row.type];
            if (known !== undefined) return { reason: known };
            if (row.type === 'BT_STAT')
              return { reason: 'stat du défenseur — canal non consommé par le pipeline' };
            return {}; // BT_DMG* sortants du boss : jamais calculés (§ 1)
          }
          return {};
        };
        const { side, reason: typeReason } = classify();
        const reason =
          typeReason ??
          (side !== undefined && condition !== undefined && !ELEMENT_CONDITIONS.has(condition)
            ? `condition ${condition} non évaluable statiquement`
            : undefined);
        if (reason !== undefined) {
          unresolved.push({ buffId, reason });
          continue;
        }
        if (side === undefined) continue;
        entries.push({
          skillId: ref.id,
          buffId,
          side,
          buff: {
            type: row.type,
            ...(row.stat !== undefined ? { stat: row.stat } : {}),
            ...(row.applyingType !== undefined ? { applyingType: row.applyingType } : {}),
            ...(row.value !== undefined ? { value: row.value } : {}),
          },
          ...(condition !== undefined ? { condition } : {}),
        });
      }
    }
  }
  return { entries, unresolved };
}

/**
 * Une condition élémentaire est-elle satisfaite ? MÊME relation que le taux
 * § 6 (`getElementSuperiority`) — l'enum binaire n'a que trois valeurs, EQUAL
 * couvre tout ce qui n'est ni avantage ni désavantage.
 */
export function passiveConditionMet(
  condition: string | undefined,
  attackerElement: Element,
  defenderElement: Element,
): boolean {
  if (condition === undefined) return true;
  const sup = getElementSuperiority(attackerElement, defenderElement);
  if (condition === 'ATTACKER_ELEMENT_WIN') return sup === ElementSuperiority.AttackerWin;
  if (condition === 'ATTACKER_ELEMENT_LOSE') return sup === ElementSuperiority.AttackerLose;
  if (condition === 'ATTACKER_ELEMENT_EQUAL') return sup === ElementSuperiority.Equal;
  return false; // condition inconnue : jamais « active par défaut »
}

/** Les passifs ÉVALUÉS contre les éléments du scénario. */
export function resolveBossPassives(
  monsterId: string,
  targets: DamageTargetsData,
  buffs: DamageBuffsData,
  attackerElement: Element,
  defenderElement: Element,
): BossPassivesInfo | undefined {
  const stat = staticBossPassives(monsterId, targets, buffs);
  if (!stat) return undefined;
  return {
    entries: stat.entries.map((e) => ({
      ...e,
      active: passiveConditionMet(e.condition, attackerElement, defenderElement),
    })),
    unresolved: stat.unresolved,
  };
}
