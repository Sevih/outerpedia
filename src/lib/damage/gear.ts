/**
 * PASSIFS D'ÉQUIPEMENT du PORTEUR (spec § 15, canal 2) — arme, accessoire,
 * sets, Rogue's Charm, EE. Demandé par Sevih (05/08/2026) : « brancher les
 * moteurs » avant de chasser les deltas — un passif d'équipement est un
 * `CBuffTemplet` ordinaire (spec § 15 : mêmes agrégations § 9/§ 16.1 que les
 * buffs de skills), on ne trafique JAMAIS les stats saisies pour le simuler.
 *
 * Périmètre — même doctrine que les passifs de boss (passives.ts) :
 *   - créations `PASSIVE`/`PASSIVE2` : appliquées STATIQUEMENT quand le type
 *     est consommé par le pipeline attaquant (BT_STAT, familles BT_DMG* § 9.1,
 *     drapeaux § 6/§ 10.1, stats « PV perdus » § 14) ;
 *   - procs `SKILL_START` : posés AU LANCEMENT, ils pèsent sur le hit du
 *     lanceur (PROUVÉ par les captures du 18/08/2026 — Rhona S1 vs boss exact
 *     avec son +300 ‰ pierce `TARGET_IS_BOSS` ; Caren : pierce sur S3/B2/B3
 *     seuls, ratio B2/B1 exact) : entrées gatées par leurs lanceurs
 *     (`GearPassiveEntry.proc`), chaque ligne restant un PREMIER lancement
 *     état-neutre (durées non simulées) ;
 *   - autres procs (`SKILL_FINISH`, `ON_SPAWN`…) damage-pertinents : NON
 *     simulés — remontés `dynamic` (ex. le marking de Rampaging Caracal se
 *     représente par la chip « cible marquée ») ; les procs hors-dégâts
 *     (soins, CP/AP, jauge d'action…) sont ignorés silencieusement ;
 *   - `BT_WG_*` : agrégation de la jauge non désassemblée (§ 12.3) →
 *     unresolved ; conditions non évaluables (§ 12.1) → unresolved.
 *
 * Sélections de niveau (spec § 17.5, prouvé binaire) :
 *   - option principale à BUFF (EE « dégâts vs élément ») : niveau de buff
 *     = `enchant + 1` ;
 *   - options SPÉCIALES (`ItemSpecialOptionTemplet`) : lignes de niveau
 *     ≤ `max(enchant, 1)` — `IsAdd=false` remplace les niveaux inférieurs,
 *     `IsAdd=true` s'ajoute (EE Lv10 `_ADD`/`_CHANGE`) ;
 *   - SETS : la ligne dont `breakLimitCounts` contient le nombre de break de
 *     la pièce (0 = base, 4 = enchantée) ; 1 set choisi = 4 pièces (2P + 4P),
 *     2 sets = 2P chacun (convention UI) ;
 *   - arme/accessoire : le buff unique porte 5 niveaux = breakthrough T0..T4
 *     → niveau `tier + 1` (convention validée par l'affichage wiki) ;
 *   - Rogue's Charm : interrupteur « +10 » (seul état damage-pertinent — la
 *     ligne Lv10 `BT_DMG_TARGET_BREAK` ; le Lv1 est un buff de CP, ignoré).
 *
 * Condition `TARGET_ELEMENT` (prouvée 05/08/2026) : `BuffConditionValue` =
 * `CHARACTER_ELEMENT_TYPE` de la CIBLE (EARTH=0, WATER=1, FIRE=2, LIGHT=3,
 * DARK=4 — dump.cs ; valeur absente = 0 = terre). Corroboration : la desc
 * officielle de l'EE 2000019 (« damage dealt to Fire enemies ») porte
 * `BuffConditionValue = 2` = CET_FIRE.
 */

import type { ActiveBuff } from './aggregate';
import { passiveConditionMet } from './passives';
import { Element } from './types';
import type {
  DamageBuffsData,
  DamageEquipmentData,
  DataBuffLevel,
  DataSpecialOption,
} from './inputs';

// ── Entrées (résolues par le pont — slugs UI → groupes des tables) ──────────

/** Arme ou accessoire : groupes d'options uniques + breakthrough 0..4. */
export interface GearUniqueInput {
  groups: string[];
  tier: number;
}

/** Un set choisi (GroupID = id de set des tables, jointure 1:1 vérifiée). */
export interface GearSetInput {
  groupId: string;
  enchanted: boolean;
  /** 1 set choisi = 4 pièces (2P + 4P), 2 sets = 2P chacun (convention UI). */
  pieces: 2 | 4;
}

export interface GearSelection {
  weapon?: GearUniqueInput;
  amulet?: GearUniqueInput;
  sets?: GearSetInput[];
  /** Rogue's Charm +10 — groupes du talisman 6★ (résolus par le pont). */
  roguesCharm?: { groups: string[] };
  /** EE porté (pièce trouvée par `characterLimit` = perso) + enchant 0..10. */
  ee?: { enchant: number };
}

// ── Sorties ─────────────────────────────────────────────────────────────────

export type GearSource = 'weapon' | 'amulet' | 'set' | 'talisman' | 'ee' | 'kit' | 'quirk';

export interface GearPassiveEntry {
  source: GearSource;
  /** GroupID / id de set — lien vers le libellé côté UI. */
  sourceId: string;
  buffId: string;
  /** Id du personnage ALLIÉ dont vient l'entrée (resolveAllyPassives) —
   *  absent : entrée du porteur lui-même. */
  ally?: string;
  /** `attacker` = le porteur ; `defender` = débuff permanent sur l'ennemi ;
   *  `allies` = MY_TEAM_WITHOUT_ME — ne profite JAMAIS au porteur (affiché
   *  inactif, ex. Absolute Music : +dégâts aux boss pour les ALLIÉS). */
  side: 'attacker' | 'defender' | 'allies';
  buff: ActiveBuff;
  condition?: string;
  /** `BuffConditionValue` brut — seuil des conditions qui en portent un
   *  (HPRATE en ‰…) ; l'UI le verse dans le libellé de la condition. */
  conditionValue?: number;
  /** Élément visé par `TARGET_ELEMENT` (enum binaire). */
  conditionElement?: Element;
  /**
   * `CallerSkillType` du buff (SKT_* ∩ lignes du rapport) : l'entrée ne pèse
   * que sur les slots dont le skill lanceur matche (application par slot,
   * branchée 10/08/2026 — preuve fixture Noa : 2000022_2_2 sur le S2 seul,
   * EE BID_CEQUIP_2000022 sur le S3 seul). Absent = tous les slots.
   */
  callers?: string[];
  /**
   * Condition d'ÉTAT DE COMBAT (STATE_CONDITIONS — mécanique perso) : le
   * moteur ne l'évalue pas, `active` reflète la DÉCLARATION du scénario
   * (z `cs` : condition remplie en jeu). Défaut : inactive.
   */
  stateful?: boolean;
  /**
   * Proc `SKILL_START` : posé AU LANCEMENT du skill, il pèse sur le hit du
   * lanceur (PROUVÉ par fixture : Rhona S1 vs boss exact au point près avec
   * son +300 ‰ pierce `TARGET_IS_BOSS`, captures 18/08/2026). `callers` porte
   * les lanceurs : les skills ACTIFS qui référencent le buff, ou le CSV
   * `CallerSkillType` quand seul un passif/équipement le porte. Chaque ligne
   * du rapport reste un PREMIER lancement état-neutre : le proc ne persiste
   * pas d'une ligne à l'autre (durées non simulées).
   */
  proc?: true;
}

export interface GearPassiveApplied extends GearPassiveEntry {
  active: boolean;
}

/** Proc damage-pertinent NON simulé — à représenter par une chip d'état. */
export interface GearDynamicEntry {
  source: GearSource;
  sourceId: string;
  buffId: string;
  createType: string;
  buff: ActiveBuff;
  /** Id du personnage ALLIÉ dont vient le proc (resolveAllyPassives). */
  ally?: string;
  /** Côté du proc d'ALLIÉ (`attacker` = atteint le receveur) — seuls les
   *  procs côté attaquant sont DÉCLARABLES (stacks, z `ab`). */
  side?: 'attacker' | 'defender';
  /** `StackCount` de la ligne — plafond de la déclaration. PROUVÉ in-game
   *  23/08/2026 (Francesca + Eris alliée) : 1 S2 d'Eris = 1 stack de
   *  2000117_2_5 (+200 ‰ § 9.1 additif), S1 crit 25276 EXACT. */
  maxStacks?: number;
  /** `ToolTipID` de la ligne — jointure vers le glossaire des effets (tag
   *  inline icône + nom + desc, comme les conditions et les DoT) ; absent =
   *  mécanique sans entrée de glossaire. */
  tooltipId?: number;
  /** Classe `CCT_*` visée quand la cible est `MY_TEAM_<CLASSE>` (présent
   *  seulement si le receveur matche) — l'UI l'affiche (« Striker … »). */
  targetClass?: string;
  /** Slot UI du skill SOURCE (kit seulement — S1/S2/S3, bursts rattachés au
   *  slot du burstable) ; absent : passif, EE, quirk. */
  slot?: 'S1' | 'S2' | 'S3';
}

/**
 * Taux PREMIUM (‰) d'une stat du porteur — `BT_STAT_PREMIUM` passif
 * inconditionnel en `OAT_RATE` (skill_8 de transcendance, EE Lv10, quirk
 * IOT_BUFF, artefact). DÉJÀ compté dans la fiche affichée (prouvé 18/08/2026 :
 * fiche nue de Caren 2314 exacte avec le taux, 2109 sans) : le moteur ne le
 * recompte pas, il DÉFACTORISE la fiche saisie puis l'applique aux plats du
 * canal buff (terme croisé trust × premiums — sheet.ts).
 */
export interface GearPremiumEntry {
  source: GearSource;
  sourceId: string;
  buffId: string;
  /** ST_* visé. */
  stat: string;
  /** Taux per-mille (`OAT_RATE`). */
  valueRate: number;
}

export interface GearPassivesInfo {
  entries: GearPassiveApplied[];
  dynamic: GearDynamicEntry[];
  /** Taux premium par stat, déjà dans la fiche — cf. `GearPremiumEntry`. */
  premium: GearPremiumEntry[];
  unresolved: {
    source: GearSource;
    sourceId: string;
    buffId: string;
    reason: string;
    /** Id du personnage ALLIÉ concerné (resolveAllyPassives). */
    ally?: string;
  }[];
}

// ── Référentiels de classement ──────────────────────────────────────────────

/** Types côté ATTAQUANT réellement consommés (§ 9.1, § 16.1, drapeaux § 6/10.1,
 *  stats « PV perdus » § 14 — implémentées dans collectStatChannels). */
const ATTACKER_TYPES = new Set([
  'BT_STAT',
  'BT_STAT_OWNER_LOST_HP_RATE',
  'BT_STAT_OWNER_LOST_HP_RATE_HALF',
  'BT_DMG',
  'BT_DMG_TO_BOSS',
  'BT_DMG_TARGET_BREAK',
  'BT_DMG_NOT_CRITICAL',
  'BT_DMG_OWNER_STAT',
  'BT_DMG_CASTER_STAT',
  'BT_DMG_TARGET_STAT',
  'BT_DMG_OWNER_BUFF',
  'BT_DMG_OWNER_DEBUFF',
  'BT_DMG_TARGET_BUFF',
  'BT_DMG_TARGET_DEBUFF',
  'BT_DMG_OWNER_TEAM_BUFF',
  'BT_DMG_MY_TEAM_DECREASE',
  'BT_DMG_OWNER_LOST_HP_RATE',
  'BT_DMG_TARGET_LOST_HP_RATE',
  'BT_DMG_CASTER_LOST_HP_RATE',
  'BT_DMG_KILL_COUNT_STACK',
  'BT_DMG_PVP_CONTENT',
  'BT_DMG_MONADGATE_CONTENT',
  'BT_DMG_TOWER_CONTENT',
  'BT_DMG_ELEMENT_SUPERIORITY',
  'BT_DMG_ELEMENT_INFERIORITY',
  'BT_DMG_ELEMENT_ENCHANT',
  'BT_DMG_ENEMY_TEAM_DECREASE',
  'BT_SWAP_STAT_ATTACK',
]);

/** Types côté DÉFENSEUR consommés (mêmes que passives.ts § 9.2/9.3). */
const DEFENDER_TYPES = new Set([
  'BT_DMG_REDUCE',
  'BT_DMG_REDUCE_FINAL',
  'BT_DMG_REDUCE_FINAL_WITH_OUT_FIRST_SKILL',
  'BT_DMG_REDUCE_MY_TEAM_INCREASE',
  'BT_STEALTHED',
  'BT_INVINCIBLE',
  'BT_WG_INVINCIBLE',
  'BT_MARKING',
]);

const ELEMENT_CONDITIONS = new Set([
  'ATTACKER_ELEMENT_WIN',
  'ATTACKER_ELEMENT_EQUAL',
  'ATTACKER_ELEMENT_LOSE',
]);

/**
 * Cibles d'équipe FILTRÉES PAR CLASSE (`CCT_*` du receveur). La sémantique
 * « classe » (et non « membre en train d'agir ») est prouvée par la desc
 * officielle du S2 d'Eris : « increases the damage of ally Strikers » =
 * `MY_TEAM_ATTACKER` (2000117_2_5) — Striker = `CCT_ATTACKER` en interne.
 */
const TEAM_CLASS_TARGETS: Record<string, string> = {
  MY_TEAM_DEFENDER: 'CCT_DEFENDER',
  MY_TEAM_ATTACKER: 'CCT_ATTACKER',
  MY_TEAM_RANGER: 'CCT_RANGER',
  MY_TEAM_MAGE: 'CCT_MAGE',
  MY_TEAM_PRIEST: 'CCT_PRIEST',
};

/**
 * Conditions d'ÉTAT DE COMBAT (mécaniques perso — ressource unique, buffs
 * posés, seuils de PV, position…) : `CBuff.CheckAvailable` (§ 12.1, non
 * désassemblé) les évalue en combat, le calculateur ne PEUT pas — et ne
 * devine jamais. L'entrée sort `stateful` : INACTIVE par défaut, activée
 * seulement si le scénario déclare la condition remplie (z `cs`, coche du
 * harnais — ex. les 5 Kaizer Energy du S3 de Noa, `2000022_3_3`). Toute
 * condition hors de cette liste ET hors évaluation statique reste signalée
 * `unresolved` (§ 12.1).
 */
const STATE_CONDITIONS = new Set([
  'OWNER_RESOURCE',
  'OWNER_HAS_BUFF',
  'OWNER_HAS_ALL_BUFF',
  'OWNER_HAS_NOT_BUFF',
  'OWNER_ALONE',
  'OWNER_TOGETHER',
  'OWNER_RUN_COUNTER',
  'CASTER_HAS_BUFF',
  'CASTER_HAS_NOT_BUFF',
  'CASTER_ENEMY_TEAM_HAS_BUFF',
  'CASTER_HPRATE_OVER',
  'TARGET_HAS_BUFF',
  'TARGET_HAS_NOT_BUFF',
  'TARGET_HPRATE_OVER',
  'TARGET_HPRATE_UNDER',
  'TARGET_RUN_COUNTER',
]);

/**
 * Conditions dont `conditionValue` référence un BUFF précis (id de tooltip du
 * jeu) — sous-ensemble de STATE_CONDITIONS ci-dessus. Les valeurs 9996..9999
 * sont des SENTINELLES de catégorie (« n'importe quel buff/débuff » — vérifié
 * sur la donnée : 2000001_1_1 « remove N buff(s) », générique), pas des ids.
 */
const BUFF_REF_CONDITIONS = new Set([
  'OWNER_HAS_BUFF',
  'OWNER_HAS_ALL_BUFF',
  'OWNER_HAS_NOT_BUFF',
  'CASTER_HAS_BUFF',
  'CASTER_HAS_NOT_BUFF',
  'CASTER_ENEMY_TEAM_HAS_BUFF',
  'TARGET_HAS_BUFF',
  'TARGET_HAS_NOT_BUFF',
]);

/**
 * Id du buff RÉFÉRENCÉ par une condition, ou `undefined` (condition d'un
 * autre genre, valeur absente, ou sentinelle de catégorie — le gabarit
 * générique est alors le bon libellé). Prédicat UNIQUE du nommage des
 * conditions : le wrapper collecte les noms sur lui, le client décide du
 * suffixe sur lui — plus deux regex à garder d'accord (revue 18/08/2026).
 */
export function conditionBuffRef(
  condition: string | undefined,
  conditionValue: number | undefined,
): string | undefined {
  if (condition === undefined || conditionValue === undefined) return undefined;
  if (!BUFF_REF_CONDITIONS.has(condition)) return undefined;
  if (conditionValue >= 9996 && conditionValue <= 9999) return undefined;
  return String(conditionValue);
}

/** Les skills que le rapport LIGNE réellement (S1/S2/S3 + bursts) — un buff
 *  restreint hors de cet ensemble (chain attacks…) ne pèse sur aucune ligne. */
const REPORT_SKILL_TYPES = new Set([
  'SKT_FIRST',
  'SKT_SECOND',
  'SKT_ULTIMATE',
  'SKT_BURST_1',
  'SKT_BURST_2',
  'SKT_BURST_3',
]);

/** Une condition d'équipement est-elle satisfaite ? `undefined` = non
 *  évaluable statiquement (§ 12.1) → l'appelant remonte `unresolved`. */
export function gearConditionMet(
  condition: string | undefined,
  conditionValue: number | undefined,
  attackerElement: Element,
  defenderElement: Element,
  /** Cible boss du scénario — évalue `TARGET_IS_BOSS` (preuve runtime : le
   *  +300 ‰ pierce de Rhona, fixture 18/08/2026) ; absent = non évaluable. */
  targetIsBoss?: boolean,
  /** Classe `CCT_*` du PORTEUR du buff — évalue `OWNER_CLASS`
   *  (`BuffConditionValue` = enum CLASS_ENUM du binaire, même table que les
   *  quirks AAT_CLASS) ; absente = non évaluable. */
  ownerClass?: string,
): boolean | undefined {
  if (condition === undefined) return true;
  if (ELEMENT_CONDITIONS.has(condition))
    return passiveConditionMet(condition, attackerElement, defenderElement);
  // BuffConditionValue = CET_* de la CIBLE, absente = 0 = terre (cf. en-tête).
  if (condition === 'TARGET_ELEMENT') return defenderElement === ((conditionValue ?? 0) as Element);
  if (condition === 'TARGET_IS_BOSS') return targetIsBoss;
  if (condition === 'OWNER_CLASS')
    return ownerClass !== undefined ? CLASS_ENUM[ownerClass] === conditionValue : undefined;
  return undefined;
}

// ── Sélections de niveau (§ 17.5) ───────────────────────────────────────────

/** La ligne de buff du niveau demandé — sinon la plus haute ligne ≤ demandé,
 *  sinon la première (un buff mono-niveau sert tous les paliers). Exportée :
 *  la sélection des lignes DoT (inputs.ts) suit la MÊME règle. */
export function pickBuffRow(rows: DataBuffLevel[], level: number): DataBuffLevel | undefined {
  let best: DataBuffLevel | undefined;
  for (const r of rows) if (r.level <= level && (!best || r.level > best.level)) best = r;
  return best ?? rows[0];
}

/** Lignes spéciales actives au niveau donné : la plus haute `IsAdd=false`
 *  ≤ niveau (remplace), plus toutes les `IsAdd=true` ≤ niveau (s'ajoutent). */
function activeSpecialRows(rows: DataSpecialOption[], level: number): DataSpecialOption[] {
  let base: DataSpecialOption | undefined;
  for (const r of rows)
    if (!r.isAdd && r.level <= level && (!base || r.level > base.level)) base = r;
  const adds = rows.filter((r) => r.isAdd && r.level <= level);
  return [...(base ? [base] : []), ...adds];
}

// ── Résolution ──────────────────────────────────────────────────────────────

/** Un buff est-il pertinent pour les dégâts du hit (signalement des procs) ? */
function damageRelevant(row: DataBuffLevel): boolean {
  return ATTACKER_TYPES.has(row.type) || DEFENDER_TYPES.has(row.type);
}

function toActiveBuff(row: DataBuffLevel): ActiveBuff {
  return {
    type: row.type,
    ...(row.stat !== undefined ? { stat: row.stat } : {}),
    ...(row.applyingType !== undefined ? { applyingType: row.applyingType } : {}),
    ...(row.value !== undefined ? { value: row.value } : {}),
  };
}

/** Collecteur partagé équipement/kit : classe et range les lignes de buff.
 *  `metConditions` : buffIds dont la condition d'ÉTAT est déclarée remplie
 *  par le scénario (z `cs`) — consommé par la branche `stateful`. */
function makeCollector(
  buffs: DamageBuffsData,
  attackerElement: Element,
  defenderElement: Element,
  metConditions?: ReadonlySet<string>,
  targetIsBoss?: boolean,
  /** Mode ALLIÉ (resolveAllyPassives) : les lignes viennent du kit/EE d'un
   *  AUTRE membre de l'équipe et le RECEVEUR est l'attaquant — seules les
   *  cibles `MY_TEAM*` qui l'atteignent (et les auras `ENEMY*`) comptent.
   *  `class` = classe `CCT_*` du receveur (cibles par classe, OWNER_CLASS). */
  allyReceiver?: { class?: string },
  /** Classe `CCT_*` du PORTEUR (mode classique) — décide si un proc ciblé
   *  `MY_TEAM_<CLASSE>` l'atteint (déclarabilité) ; absente = signalé sans
   *  témoin, jamais deviné. */
  wearerClass?: string,
): {
  info: GearPassivesInfo;
  feed: (
    source: GearSource,
    sourceId: string,
    buffId: string,
    row: DataBuffLevel,
    procCallers?: string[],
  ) => void;
  feedBuff: (
    source: GearSource,
    sourceId: string,
    buffId: string,
    level: number,
    procCallers?: string[],
  ) => void;
} {
  const info: GearPassivesInfo = { entries: [], dynamic: [], premium: [], unresolved: [] };

  /** Classe et range une ligne de buff (au niveau déjà choisi). `procCallers` :
   *  types des skills ACTIFS qui référencent un buff `SKILL_START` — ses
   *  lanceurs (cf. `GearPassiveEntry.proc`). */
  const feed = (
    source: GearSource,
    sourceId: string,
    buffId: string,
    row: DataBuffLevel,
    procCallers?: string[],
  ): void => {
    const ct = row.createType;
    // ── Mode ALLIÉ : sélection de cible AVANT tout — la ligne ne compte que
    // si elle ATTEINT le receveur (MY_TEAM*) ou l'ennemi (auras ENEMY*).
    let allyTarget: string | undefined;
    let allyTargetClass: string | undefined;
    if (allyReceiver) {
      const tgt = row.targetType ?? '';
      if (tgt.startsWith('MY_TEAM')) {
        const cls = TEAM_CLASS_TARGETS[tgt];
        if (cls !== undefined) {
          // Cible filtrée par CLASSE (preuve : « ally Strikers » d'Eris =
          // MY_TEAM_ATTACKER) — hors classe, la ligne ne touche pas le receveur.
          if (allyReceiver.class !== cls) return;
          allyTargetClass = cls;
        } else if (tgt !== 'MY_TEAM' && tgt !== 'MY_TEAM_WITHOUT_ME') {
          // Sélection SITUATIONNELLE (LOWEST_HP_RATE, HIGHEST_ATK, ONE…) :
          // non attribuable statiquement — signalée si damage-pertinente.
          if (damageRelevant(row)) {
            info.unresolved.push({
              source,
              sourceId,
              buffId,
              reason: `cible ${tgt} — sélection d'équipe situationnelle, non attribuable`,
            });
          }
          return;
        }
        allyTarget = 'MY_TEAM'; // atteint le receveur : classement côté attaquant
      } else if (tgt.startsWith('ENEMY')) {
        allyTarget = tgt; // aura sur l'ennemi : même classement que le porteur
      } else {
        return; // ME/self de l'allié : sans effet sur le hit de l'attaquant
      }
      // Créations DYNAMIQUES (SKILL_START inclus : le proc part d'un skill de
      // l'ALLIÉ, pas d'une ligne du rapport) : jamais simulées d'office — mais
      // DÉCLARABLES côté attaquant (`side` + `maxStacks`, stacks déclarés
      // z `ab`) : prouvé in-game 23/08/2026 (le +20 % Strikers d'Eris à
      // 1 stack rend le S1 de Francesca exact).
      if (ct !== 'PASSIVE' && ct !== 'PASSIVE2') {
        if (
          damageRelevant(row) ||
          row.type === 'BT_STAT_PREMIUM' ||
          row.type === 'BT_MARKING' ||
          row.type.startsWith('BT_GROUP')
        ) {
          info.dynamic.push({
            source,
            sourceId,
            buffId,
            createType: ct ?? '',
            buff: toActiveBuff(row),
            side: allyTarget === 'MY_TEAM' ? 'attacker' : 'defender',
            ...(row.stackCount !== undefined && row.stackCount > 1
              ? { maxStacks: row.stackCount }
              : {}),
            ...(row.tooltipId !== undefined ? { tooltipId: row.tooltipId } : {}),
            ...(allyTargetClass !== undefined ? { targetClass: allyTargetClass } : {}),
          });
        }
        return;
      }
      // Passif restreint par skill LANCEUR : les lanceurs sont ceux de
      // l'ALLIÉ (auras de soutien SKT_BACKUP_*) — jamais une ligne du
      // rapport du receveur. Contribution 0, signalé.
      if (row.callerSkillType !== undefined && row.callerSkillType !== 'SKT_ALL') {
        info.unresolved.push({
          source,
          sourceId,
          buffId,
          reason: `réservé aux skills de l'allié (${row.callerSkillType}) — contribution 0`,
        });
        return;
      }
    }
    // Proc SKILL_START : posé au LANCEMENT, il pèse sur le hit du lanceur
    // (preuve fixture Rhona 18/08/2026) — traité comme une entrée gatée par
    // ses lanceurs. Les autres créations dynamiques restent non simulées
    // d'office — mais DÉCLARABLES quand elles atteignent le porteur (`side`
    // + `maxStacks`, stacks déclarés z `ab` — même mécanique que les procs
    // d'alliés, demande Sevih 23/08/2026 : « dire ce perso a cette méca
    // stack N fois »).
    const isSkillStart = ct === 'SKILL_START';
    if (ct !== 'PASSIVE' && ct !== 'PASSIVE2' && !isSkillStart) {
      // Proc — jamais simulé ; signalé seulement s'il peut peser sur le hit.
      if (damageRelevant(row) || row.type === 'BT_MARKING' || row.type.startsWith('BT_GROUP')) {
        // Côté du proc, pour la DÉCLARATION : seuls les procs à valeur
        // (damageRelevant) qui atteignent le PORTEUR sont déclarables —
        // cibles ME/MY_TEAM, ou MY_TEAM_<CLASSE> si sa classe matche
        // (sémantique classe prouvée, cf. TEAM_CLASS_TARGETS) ; classe
        // inconnue = signalé sans témoin, jamais deviné. MARKING/GROUP
        // (flags sans valeur à stacker) et cibles ENEMY* (représentables
        // par les chips cible) restent signalés non déclarables.
        let side: GearDynamicEntry['side'];
        let targetClass: string | undefined;
        if (damageRelevant(row)) {
          const tgt = row.targetType ?? '';
          const cls = TEAM_CLASS_TARGETS[tgt];
          if (tgt === '' || tgt === 'ME' || tgt === 'MY_TEAM') side = 'attacker';
          else if (cls !== undefined && wearerClass !== undefined && wearerClass === cls) {
            side = 'attacker';
            targetClass = cls;
          } else if (tgt.startsWith('ENEMY')) side = 'defender';
        }
        info.dynamic.push({
          source,
          sourceId,
          buffId,
          createType: ct ?? '',
          buff: toActiveBuff(row),
          ...(side !== undefined ? { side } : {}),
          ...(side !== undefined && row.stackCount !== undefined && row.stackCount > 1
            ? { maxStacks: row.stackCount }
            : {}),
          ...(row.tooltipId !== undefined ? { tooltipId: row.tooltipId } : {}),
          ...(targetClass !== undefined ? { targetClass } : {}),
        });
      }
      return;
    }
    // BT_STAT_PREMIUM visant le PORTEUR (`ME` comme `MY_TEAM` — un buff
    // d'équipe couvre son porteur) : AFFICHÉ dans la fiche du héros, donc déjà
    // dans les stats SAISIES — jamais recompté comme un buff. Mais son TAUX
    // doit être CONNU du moteur : la fiche le porte en multiplicateur
    // (`buffRate` de CalcFinalStat, en ville comme en combat), et les plats du
    // canal buff (affinité, buffs plats de scénario) sont multipliés par lui.
    // PROUVÉ 18/08/2026 (Caren) : fiche nue 2314 (+732) exacte avec
    // Rp=100 (skill_8), fiche équipée 5631 → sub 4291 avec Rp=300 (+200 EE
    // Lv10), DEF de combat 5891 EXACTE = « le +60 » des 6 captures — c'était
    // le terme croisé trust(200) × Rp(300), pas un buff d'équipe à assiette
    // mystérieuse. Compatible avec la preuve Dianne 05/08/2026 (pierce 30 %
    // identique sur deux équipements : sans plats de trust sur la stat, le
    // terme croisé est nul et « déjà dans la fiche » suffisait).
    // Les plats (`OAT_ADD`) sont dans le sous-total défactorisé : rien à
    // collecter. `MY_TEAM_WITHOUT_ME` ne touche pas le porteur (l'apport aux
    // ALLIÉS attend le lot « buffs d'alliés »). Un premium CONDITIONNEL ou
    // non-passif n'existe pas en donnée 1.4.14 côté porteur : signalé, jamais
    // deviné.
    // En mode ALLIÉ, un premium N'EST PAS dans la fiche saisie du receveur
    // (la fiche est celle de la VILLE, sans équipe) : il descend le canal
    // buff normal — § 16.4 : le premium EST (une part de) buffVal/buffRate.
    if (row.type === 'BT_STAT_PREMIUM' && !allyReceiver) {
      const tgt = row.targetType ?? '';
      if (tgt !== 'ME' && tgt !== 'MY_TEAM') return; // apport aux alliés : resolveAllyPassives
      if (row.conditionType !== undefined || isSkillStart) {
        info.unresolved.push({
          source,
          sourceId,
          buffId,
          reason: 'premium conditionnel/dynamique — hors doctrine fiche, contribution 0',
        });
        return;
      }
      if (row.applyingType === 'OAT_RATE' && row.stat !== undefined) {
        info.premium.push({ source, sourceId, buffId, stat: row.stat, valueRate: row.value ?? 0 });
      }
      return;
    }
    const target = allyTarget ?? row.targetType ?? '';
    let side: GearPassiveEntry['side'] | undefined;
    if (target === 'MY_TEAM_WITHOUT_ME') side = 'allies';
    else if (target === 'ME' || target === 'MY_TEAM' || target === '') {
      // BT_STAT_PREMIUM n'arrive ici qu'en mode allié (canal buff, cf. supra).
      if (ATTACKER_TYPES.has(row.type) || row.type === 'BT_STAT_PREMIUM') side = 'attacker';
      else if (row.type.startsWith('BT_WG_')) {
        info.unresolved.push({
          source,
          sourceId,
          buffId,
          reason: 'agrégation jauge non désassemblée (§ 12.3)',
        });
        return;
      } else return; // soins, CP/AP, boucliers… : sans effet sur le hit calculé
    } else if (target.startsWith('ENEMY')) {
      // BT_STAT posé sur l'ennemi (débuff de stat permanent ou au lancement —
      // ex. Rhona 2000008_3_3 : DEF -50 % au début du S3) : canal § 16.1 des
      // stats de la CIBLE, global ou par slot (branché 18/08/2026).
      if (DEFENDER_TYPES.has(row.type) || row.type === 'BT_STAT') side = 'defender';
      else return;
    } else return;

    // Buff restreint à UN skill (`TargetSkillType`) : gate de MÉCANIQUE
    // (ressource, cooldown… du skill VISÉ), pas de lanceur — non branché,
    // signalé, contribution 0 (jamais versé à tous).
    if (row.targetSkillType !== undefined && side !== 'allies') {
      info.unresolved.push({
        source,
        sourceId,
        buffId,
        reason: `restreint à ${row.targetSkillType} (TargetSkillType) — non branché`,
      });
      return;
    }
    // Restriction par skill LANCEUR — application PAR SLOT (10/08/2026) :
    // l'entrée porte ses lanceurs, `buildDamageReport` ne la verse qu'aux
    // slots qui matchent (les BT_STAT restreints passent par le canal § 16.1
    // PAR SLOT depuis le 18/08/2026 — stats recalculées pour la ligne). Pour
    // un proc SKILL_START, les lanceurs sont les skills ACTIFS qui le
    // référencent (`procCallers` — Caren 2000089_3_1 : S3/B2/B3, mesuré) ;
    // le CSV `CallerSkillType` ne décide que lorsqu'aucun skill actif ne le
    // porte (proc de passif/équipement — Rhona 2000008_passive_3, mesuré).
    // Hors intersection avec les lignes du rapport : contribution 0, signalé.
    let callers: string[] | undefined;
    if (isSkillStart && procCallers !== undefined) {
      callers = procCallers.filter((c) => REPORT_SKILL_TYPES.has(c));
      if (!callers.length) {
        info.unresolved.push({
          source,
          sourceId,
          buffId,
          reason: 'proc SKILL_START porté hors des lignes du rapport — contribution 0',
        });
        return;
      }
    } else if (row.callerSkillType !== undefined && row.callerSkillType !== 'SKT_ALL') {
      const all = row.callerSkillType.split(',').map((s) => s.trim());
      callers = all.filter((c) => REPORT_SKILL_TYPES.has(c));
      if (!callers.length) {
        info.unresolved.push({
          source,
          sourceId,
          buffId,
          reason: `réservé à ${row.callerSkillType} (hors des lignes du rapport) — contribution 0`,
        });
        return;
      }
    }

    const condition = row.conditionType;
    // `allies` : jamais appliqué au porteur — affiché inactif, pas de condition.
    const met =
      side === 'allies'
        ? false
        : gearConditionMet(
            condition,
            row.conditionValue,
            attackerElement,
            defenderElement,
            targetIsBoss,
            // OWNER_CLASS : le porteur du buff est le RECEVEUR (mode allié) —
            // évaluable ; côté porteur classique, la classe n'est pas fournie.
            allyReceiver?.class,
          );
    if (met === undefined) {
      // Condition d'ÉTAT DE COMBAT (STATE_CONDITIONS) : entrée `stateful`,
      // active seulement si le scénario la déclare remplie — jamais devinée.
      if (condition !== undefined && STATE_CONDITIONS.has(condition)) {
        info.entries.push({
          source,
          sourceId,
          buffId,
          side,
          buff: toActiveBuff(row),
          condition,
          ...(row.conditionValue !== undefined ? { conditionValue: row.conditionValue } : {}),
          ...(callers ? { callers } : {}),
          ...(isSkillStart ? { proc: true as const } : {}),
          stateful: true,
          active: metConditions?.has(buffId) === true,
        });
        return;
      }
      info.unresolved.push({
        source,
        sourceId,
        buffId,
        reason: `condition ${condition} non évaluable statiquement (§ 12.1)`,
      });
      return;
    }
    info.entries.push({
      source,
      sourceId,
      buffId,
      side,
      buff: toActiveBuff(row),
      ...(condition !== undefined ? { condition } : {}),
      ...(condition === 'TARGET_ELEMENT'
        ? { conditionElement: (row.conditionValue ?? 0) as Element }
        : {}),
      ...(callers ? { callers } : {}),
      ...(isSkillStart ? { proc: true as const } : {}),
      active: met,
    });
  };

  /** Toutes les lignes de buff d'un id, au niveau demandé. */
  const feedBuff = (
    source: GearSource,
    sourceId: string,
    buffId: string,
    level: number,
    procCallers?: string[],
  ): void => {
    const rows = buffs.buffs[buffId];
    if (!rows?.length) {
      info.unresolved.push({ source, sourceId, buffId, reason: 'buff absent de buffs.json' });
      return;
    }
    const row = pickBuffRow(rows, level);
    if (row) feed(source, sourceId, buffId, row, procCallers);
  };

  return { info, feed, feedBuff };
}

/**
 * Les passifs d'équipement du porteur, ÉVALUÉS contre les éléments du
 * scénario. `attackerId` sert à retrouver l'EE (`characterLimit`).
 */
export function resolveGearPassives(
  attackerId: string,
  gear: GearSelection,
  equipment: DamageEquipmentData,
  buffs: DamageBuffsData,
  attackerElement: Element,
  defenderElement: Element,
  metConditions?: ReadonlySet<string>,
  targetIsBoss?: boolean,
  /** Mode ALLIÉ : `attackerId` est l'ALLIÉ porteur, le receveur est
   *  l'attaquant du scénario (cf. makeCollector). */
  allyReceiver?: { class?: string },
  /** Classe `CCT_*` du porteur — déclarabilité des procs `MY_TEAM_<CLASSE>`. */
  wearerClass?: string,
): GearPassivesInfo {
  const { info, feedBuff } = makeCollector(
    buffs,
    attackerElement,
    defenderElement,
    metConditions,
    targetIsBoss,
    allyReceiver,
    wearerClass,
  );

  /** Groupes d'options UNIQUES (arme/accessoire/talisman/EE) au niveau spécial
   *  donné ; `buffLevel` = niveau demandé aux buffs de ces lignes. */
  const feedUnique = (
    source: GearSource,
    groups: string[],
    specialLevel: number,
    buffLevel: number,
  ): void => {
    for (const gid of groups) {
      const rows = equipment.specialGroups[gid];
      if (!rows?.length) {
        info.unresolved.push({
          source,
          sourceId: gid,
          buffId: gid,
          reason: 'groupe absent des tables equipment',
        });
        continue;
      }
      for (const r of activeSpecialRows(rows, specialLevel))
        for (const b of r.buffIds ?? []) feedBuff(source, gid, b, buffLevel);
    }
  };

  if (gear.weapon) feedUnique('weapon', gear.weapon.groups, 1, gear.weapon.tier + 1);
  if (gear.amulet) feedUnique('amulet', gear.amulet.groups, 1, gear.amulet.tier + 1);
  // Rogue's Charm : interrupteur « +10 » (cf. en-tête) — lignes Lv1 + Lv10.
  if (gear.roguesCharm) feedUnique('talisman', gear.roguesCharm.groups, 10, 1);

  for (const s of gear.sets ?? []) {
    const rows = equipment.specialGroups[s.groupId];
    const breakCount = s.enchanted ? 4 : 0;
    const row = rows?.find((r) => r.breakLimitCounts.includes(breakCount)) ?? rows?.[0];
    if (!row) {
      info.unresolved.push({
        source: 'set',
        sourceId: s.groupId,
        buffId: s.groupId,
        reason: 'set absent des tables equipment',
      });
      continue;
    }
    const effects = [row.twoPiece, ...(s.pieces === 4 ? [row.fourPiece] : [])];
    for (const e of effects) {
      // IOT_STAT (ATK %…) : canal 1 du § 15 — déjà dans la fiche SAISIE.
      if (!e || e.optionType !== 'IOT_BUFF' || !e.buffId) continue;
      feedBuff('set', s.groupId, e.buffId, e.buffLevel ?? 1);
    }
  }

  if (gear.ee) {
    const piece = Object.values(equipment.pieces).find(
      (p) => p.characterLimit === attackerId && p.subType === 'ITS_EQUIP_EXCLUSIVE',
    );
    // Pas de pièce liée au perso = il n'a PAS d'EE (état normal — l'UI envoie
    // « EE porté » par défaut sans savoir si le perso en a un).
    if (piece) {
      const enchant = gear.ee.enchant;
      // Lignes spéciales : niveau max(enchant, 1) (§ 17.5) — Lv1 base, Lv10 ADD/CHANGE.
      feedUnique('ee', piece.uniqueOptionGroups, Math.max(enchant, 1), 1);
      // Option principale à BUFF (« dégâts vs élément ») : niveau enchant + 1.
      for (const gid of piece.mainOptionGroups) {
        for (const o of equipment.optionGroups[gid] ?? []) {
          if (o.optionType !== 'IOT_BUFF' || !o.buffId) continue;
          feedBuff('ee', gid, o.buffId, enchant + 1);
        }
      }
    }
  }

  return info;
}

// ── Passifs du PERSONNAGE (kit — même canal que les boss, côté joueur) ──────

/** Miroir minimal du kit (characters.json) consommé ici. */
export interface KitCharacter {
  id: string;
  basicStar: number;
  /** Classe `CCT_*` — déclarabilité des procs `MY_TEAM_<CLASSE>` du kit. */
  class?: string;
  skills: { slot: number; id: string }[];
}

export interface KitSkill {
  id: string;
  type: string;
  levels: { level: number; buffIds: string[] }[];
  /** Marqueur BURSTABLE (coûts d'AP des bursts) — cf. `burstableSlotOf`. */
  burstAP?: number[];
}

/**
 * Slot UI du skill BURSTABLE d'un kit (marqueur `burstAP`, extrait de
 * `RequireAP` en CSV — datagen/lib/burst.ts) : S1 chez Caren/Valentine, S2
 * chez la plupart, S3 chez quelques-uns. `undefined` sans marqueur — l'appelant
 * décide de la dégradation (le moteur OMET les lignes burst et le signale,
 * jamais un slot supposé : le vieux « toujours S2 » était faux pour 74/125
 * persos, revue 18/08/2026).
 */
export function burstableSlotOf(
  skills: Iterable<{ type: string; burstAP?: number[] } | undefined>,
): 'S1' | 'S2' | 'S3' | undefined {
  for (const s of skills) {
    if (!s?.burstAP?.length) continue;
    const slot = MAIN_SLOT_OF[s.type];
    if (slot !== undefined) return slot;
  }
  return undefined;
}

/** Palier du passif UNIQUE par transcendance (`growth.transcend.skillLevel`,
 *  prouvé tables : basicStar 3 → transStar 9 = niveau 4). */
export function uniquePassiveLevel(
  transcend: { basicStar: number; transStar: number; skillLevel: number }[],
  basicStar: number,
  transStar: number,
): number {
  let best = 0;
  for (const r of transcend) {
    if (r.basicStar !== basicStar || r.transStar > transStar) continue;
    if (r.skillLevel > best) best = r.skillLevel;
  }
  return best;
}

/**
 * Les passifs STATIQUES du kit de l'attaquant (skills `*_PASSIVE`), évalués
 * contre les éléments du scénario — même doctrine que l'équipement :
 * `BT_STAT_PREMIUM` (déjà dans la fiche) jamais recompté comme buff mais son
 * TAUX est collecté (`info.premium`, défactorisation sheet.ts — 18/08/2026),
 * procs/GROUP signalés `dynamic` (ex. le passif par tour de H.Dianne = les
 * chips atk/chd/crit/spd), restrictions par skill signalées.
 *
 * Sélection de niveau : `SKT_UNIQUE_PASSIVE` = palier de TRANSCENDANCE
 * (`growth.transcend.skillLevel`) ; les autres passifs (classe, chain…) au
 * niveau MAX (pas de saisie UI — les niveaux ne portent que des textes en
 * 1.4.9 pour ces slots).
 */
// ── QUIRKS du compte (nœuds d'éveil « à impact » — buffs, jamais les stats) ──

/** Miroir minimal d'un nœud d'éveil (growth.awakening). */
export interface QuirkNode {
  id: string;
  groupType: string;
  applyType: string;
  applyTypeValue: number;
  levels: { level: number; optionType: string; buffId?: string }[];
}

/** Enums du binaire (dump.cs) — portée d'un nœud par classe/sous-classe. */
const CLASS_ENUM: Record<string, number> = {
  CCT_DEFENDER: 1,
  CCT_ATTACKER: 2,
  CCT_RANGER: 3,
  CCT_MAGE: 4,
  CCT_PRIEST: 5,
};
const SUBCLASS_ENUM: Record<string, number> = {
  ATTACKER: 1,
  BRUISER: 2,
  WIZARD: 3,
  ENCHANTER: 4,
  VANGUARD: 5,
  TACTICIAN: 6,
  SWEEPER: 7,
  PHALANX: 8,
  RELIEVER: 9,
  SAGE: 10,
};

/**
 * Les QUIRKS actifs du compte (réglage UI, hors z — comme le Codex), niveau
 * par nœud → buff du niveau (les nœuds `IOT_STAT` sont dans la fiche
 * AFFICHÉE via le paramètre éveil de CalcFinalStat § 17.4 — jamais recomptés,
 * l'UI ne propose d'ailleurs que les nœuds « à impact »). Portée du nœud :
 * `AAT_NONE` = tous, `AAT_ELEMENTAL`/`AAT_CLASS`/`AAT_SUBCLASS` = l'attaquant
 * doit matcher (enums du binaire ci-dessus) ; un type de portée inconnu est
 * SIGNALÉ, jamais deviné.
 */
export function resolveQuirkPassives(
  quirks: Record<string, number>,
  awakening: QuirkNode[],
  char: { element: Element; class?: string; subClass?: string },
  buffs: DamageBuffsData,
  defenderElement: Element,
  /** `DUNGEON_MODE` du combat (`DM_NORMAL`…) — gate de CONTENU de l'arbre
   *  licence ; absent (cible manuelle) = inconnu, signalé. */
  targetMode?: string,
  metConditions?: ReadonlySet<string>,
  targetIsBoss?: boolean,
): GearPassivesInfo {
  const { info, feedBuff } = makeCollector(
    buffs,
    char.element,
    defenderElement,
    metConditions,
    targetIsBoss,
    undefined,
    char.class,
  );
  for (const [nodeId, level] of Object.entries(quirks)) {
    if (level < 1) continue;
    const node = awakening.find((n) => n.id === nodeId);
    if (!node) {
      info.unresolved.push({
        source: 'quirk',
        sourceId: nodeId,
        buffId: nodeId,
        reason: 'nœud absent des tables awakening',
      });
      continue;
    }
    // Gate de CONTENU du groupe (colonne de scope de la table des groupes —
    // preuve : les 4 captures Valentine 06/08/2026 rejouent EXACTEMENT en
    // retirant l'arbre licence hors contenu Adventure License) :
    // ELEMENTAL/JOB/UTILITY = tous contenus ; PVE = tout le PvE (seule scène
    // du rapport) ; ADVENTURE_LICENSE = ce contenu-là seulement.
    if (node.groupType === 'ADVENTURE_LICENSE') {
      if (targetMode === undefined) {
        info.unresolved.push({
          source: 'quirk',
          sourceId: nodeId,
          buffId: nodeId,
          reason: 'arbre licence — mode du combat inconnu (cible manuelle), contribution 0',
        });
        continue;
      }
      if (!targetMode.startsWith('DM_ADVENTURE')) continue; // hors contenu : rien
    } else if (!['ELEMENTAL', 'JOB', 'UTILITY', 'PVE'].includes(node.groupType)) {
      info.unresolved.push({
        source: 'quirk',
        sourceId: nodeId,
        buffId: nodeId,
        reason: `arbre ${node.groupType} — portée de contenu inconnue, contribution 0`,
      });
      continue;
    }
    // Portée du nœud : ne s'applique qu'à l'attaquant qui matche.
    if (node.applyType === 'AAT_ELEMENTAL') {
      if (char.element !== (node.applyTypeValue as Element)) continue;
    } else if (node.applyType === 'AAT_CLASS') {
      if (CLASS_ENUM[char.class ?? ''] !== node.applyTypeValue) continue;
    } else if (node.applyType === 'AAT_SUBCLASS') {
      if (SUBCLASS_ENUM[char.subClass ?? ''] !== node.applyTypeValue) continue;
    } else if (node.applyType !== 'AAT_NONE') {
      info.unresolved.push({
        source: 'quirk',
        sourceId: nodeId,
        buffId: nodeId,
        reason: `portée ${node.applyType} inconnue — contribution 0`,
      });
      continue;
    }
    // Le niveau saisi REMPLACE les inférieurs (un buff par niveau).
    const row = node.levels.find((l) => l.level === level) ?? node.levels[node.levels.length - 1];
    if (row?.optionType !== 'IOT_BUFF' || !row.buffId) continue; // stat : déjà en fiche
    feedBuff('quirk', nodeId, row.buffId, 1);
  }
  return info;
}

/** Slot UI des 3 skills PRINCIPAUX — les bursts tiennent leur niveau du slot
 *  du skill BURSTABLE (`burstableSlotOf`, garde datagen : niveaux alignés). */
const MAIN_SLOT_OF: Record<string, 'S1' | 'S2' | 'S3'> = {
  SKT_FIRST: 'S1',
  SKT_SECOND: 'S2',
  SKT_ULTIMATE: 'S3',
};

export function resolveKitPassives(
  char: KitCharacter,
  transStar: number,
  skills: Record<string, KitSkill>,
  transcend: { basicStar: number; transStar: number; skillLevel: number }[],
  buffs: DamageBuffsData,
  attackerElement: Element,
  defenderElement: Element,
  /** Niveaux de skill SAISIS (z `k`) — sélection des lignes de buff des skills
   *  ACTIFS ; absent = niveau max (défaut UI). */
  skillLevels: Partial<Record<'S1' | 'S2' | 'S3', number>> = {},
  metConditions?: ReadonlySet<string>,
  targetIsBoss?: boolean,
  /** Mode ALLIÉ : `char` est le kit de l'ALLIÉ, le receveur est l'attaquant
   *  du scénario (cf. makeCollector) — niveaux de skill au max (pas de
   *  saisie UI pour les alliés). */
  allyReceiver?: { class?: string },
): GearPassivesInfo {
  const { info, feedBuff } = makeCollector(
    buffs,
    attackerElement,
    defenderElement,
    metConditions,
    targetIsBoss,
    allyReceiver,
    char.class,
  );
  // Slot du skill BURSTABLE : ses déclinaisons burst tiennent leur niveau de
  // LUI (S1 chez Caren — le « toujours S2 » d'avant faussait la sélection des
  // lignes de buff pour 74/125 persos, revue 18/08/2026). Sans marqueur, un
  // burst retombe sur son niveau max (même règle que les actifs hors slot).
  const burstSlot = burstableSlotOf(char.skills.map((r) => skills[r.id]));
  // (Niveau effectif : passif UNIQUE = palier de transcendance ; skill ACTIF
  // = niveau saisi, clampé — ses `buffIds` par niveau portent les passifs
  // permanents du kit ; autres passifs (classe, chain…) = max.)
  const levelOf = (sk: KitSkill): { wanted: number; lv?: { buffIds: string[] } } => {
    let wanted: number;
    if (sk.type === 'SKT_UNIQUE_PASSIVE') {
      wanted = uniquePassiveLevel(transcend, char.basicStar, transStar);
    } else if (sk.type.includes('PASSIVE')) {
      wanted = sk.levels.length;
    } else {
      const slot =
        MAIN_SLOT_OF[sk.type] ?? (sk.type.startsWith('SKT_BURST_') ? burstSlot : undefined);
      if (slot === undefined && !sk.levels.some((l) => l.buffIds.length)) return { wanted: 0 };
      const asked = slot !== undefined ? skillLevels[slot] : undefined;
      wanted = Math.min(Math.max(asked ?? sk.levels.length, 1), sk.levels.length);
    }
    if (wanted < 1) return { wanted: 0 };
    const lv =
      sk.levels.filter((l) => l.level <= wanted).sort((a, b) => b.level - a.level)[0] ??
      sk.levels[0];
    return { wanted, lv };
  };
  // Lanceurs des procs SKILL_START : les skills ACTIFS (lignes du rapport)
  // qui référencent le buff au niveau servi — Caren 2000089_3_1 (+300 ‰
  // pierce) vit dans les buffIds de S3/B2/B3 : il pèse sur CES hits-là et
  // pas sur S1/B1 (mesuré 18/08/2026, ratio B2/B1 exact). Quand aucun skill
  // actif ne le porte (proc d'un skill passif — Rhona 2000008_passive_3), le
  // CSV `CallerSkillType` du buff décide (feed).
  const activeRefs = new Map<string, Set<string>>();
  for (const ref of char.skills) {
    const sk = skills[ref.id];
    if (!sk || !REPORT_SKILL_TYPES.has(sk.type)) continue;
    const { lv } = levelOf(sk);
    for (const b of lv?.buffIds ?? []) {
      let refs = activeRefs.get(b);
      if (!refs) activeRefs.set(b, (refs = new Set()));
      refs.add(sk.type);
    }
  }
  // Un buff référencé par PLUSIEURS skills (CSV caller « S2,B1..B3 » : le même
  // templet couvre ses déclinaisons) est UNE instance en jeu — servi au premier
  // référent seulement. Sans cette dédup, chaque référence redevenait une
  // entrée et les lignes multi-callers comptaient N fois le même buff (Rhona
  // 2000008_1_4 : +1500 ‰ vs boss au lieu de +500 — revue 18/08/2026). Les
  // seuls buffs multi-référencés à PLUSIEURS niveaux sont hors pipeline dégâts
  // (garde datagen) : le niveau du premier référent est donc sans perte.
  const served = new Set<string>();
  for (const ref of char.skills) {
    const sk = skills[ref.id];
    if (!sk) continue;
    const { wanted, lv } = levelOf(sk);
    if (!lv) continue;
    for (const b of lv.buffIds) {
      if (served.has(b)) continue;
      served.add(b);
      const refs = activeRefs.get(b);
      feedBuff('kit', sk.id, b, wanted, refs ? [...refs] : undefined);
    }
  }
  // Slot UI du skill SOURCE des procs signalés (affichage « Pilgrimage S2 »,
  // « Eris S2 ») — bursts rattachés au slot du burstable, comme partout.
  for (const d of info.dynamic) {
    const sk = skills[d.sourceId];
    if (!sk) continue;
    const slot =
      MAIN_SLOT_OF[sk.type] ?? (sk.type.startsWith('SKT_BURST_') ? burstSlot : undefined);
    if (slot !== undefined) d.slot = slot;
  }
  return info;
}
