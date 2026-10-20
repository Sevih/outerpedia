/**
 * Extracteur DAMAGE #1b — CLIPS D'ANIMATION : pour chaque skill, les
 * VARIANTES de lancer (un clip chacune) et leurs events de hit.
 *
 * Pourquoi : le § 8.1 de la spec (docs/specs/damage-formula.md) calcule le
 * facteur total d'un skill en scannant les AnimationEvents du CLIP courant —
 * pas les tables. Un `ReceiveMaxDamage` (et son rattrapage § 8.3) existe PAR
 * CLIP : un clip peut rejouer un templet (S1 de Caren : 300 ‰ ×2) ou mêler
 * les chaînes de plusieurs états (S3 de Francesca : 800 ‰ + 200 ‰ dans le
 * même clip, UNE cascade), et une frappe additionnelle enchaînée après le
 * clip de base fait SA propre cascade (S2 de Francesca : 700 ‰ puis 300 ‰).
 *
 * La liaison skill → clips est de la DONNÉE, pas une convention
 * (docs/specs/damage-clips-joues.md § 1) :
 *  - `CharacterSkillTemplet.TriggerName` liste des VARIANTES choisies par
 *    leur INDEX au lancer (`CCharacterBattle.GetUseTriggerName`) : l'index 0
 *    par défaut ; l'index 1 sous un buff `BT_SECOND_TRIGGER` du kit (Demiurge
 *    Astei, Ember, Ais, Gnosis Dahlia) ; chez Ame (2000065) l'index 1 sous
 *    `BT_2000065_A`, l'index 2 sous `BT_2000065_B`. `TriggerNameSkip[i]`
 *    remplace l'index i quand l'animation est passée (état SKIP) ;
 *  - l'index 1 d'un kit à `BT_ADDITIVE_ATTACK_ON_EVENT` n'est PAS une
 *    variante : c'est la SUITE additionnelle, enchaînée par l'AnimationEvent
 *    `EventAdditiveAttack` du clip de base quand la condition du buff passe
 *    (Francesca, Parti, Sterope et ses bursts, Poolside Regina, Luna) —
 *    sans cet event dans le clip de base, pas de suite ;
 *  - `anim-events.json` (extract-anim-events.py) porte, par personnage, le
 *    mapping trigger → clips du controller de combat, la séquence des
 *    `EventAttackStart` de chaque clip et ses `EventAdditiveAttack` ;
 *  - l'animator scanné est celui du PERSO QUI PORTE le skill, par son
 *    `ModelID` (`CharacterTemplet`) : `CFormula.CalcDamage` lit l'animator de
 *    l'ATTAQUANT (spec § 8.1). La jointure `SkillID` de
 *    `CharacterDamageTemplet` rattache aussi à un skill des templets d'AUTRES
 *    persos (2700019, 2700070, 2000088, 2000071, 2000062… — elle ne sert
 *    qu'au simulateur, `CCharacterBattle.SkillSimulation`) : un hit au
 *    templet préfixé d'un autre perso ET absent des clips du porteur sort des
 *    états du skill (`carrierTemplets`, appliqué par characters.ts). Un clip
 *    sans event extrait ne prouve rien : un hit du porteur lui-même reste,
 *    au fallback § 12.4 s'il le faut. Avant le 17/10/2026, l'animator était
 *    déduit du préfixe du PREMIER templet : le S1 d'Akari était résolu sur
 *    celui de Drakhan (revue R15) ;
 *  - un clip atteint par un index du skill — l'index 0 compris — lui
 *    APPARTIENT, même quand ses templets sont rattachés par `SkillID` à un
 *    autre skill (Poolside Regina S2 → 8505/8506, Dahlia S1 → 9002, Ame S3 →
 *    6505 : les clips font foi, R15) ; seul un clip fait de templets COMMUNS
 *    (sans `SkillID` : `Skip_Finish_<Élément>`, `DT_*`) n'appartient à aucun
 *    skill ;
 *  - clip de base ÉTRANGER à la jointure (lot F30, 20/10/2026) : sous burst,
 *    `UseSkill` pose `UsingSkill = GetCurrentSkill()`, le burst lui-même, et
 *    `GetUseTriggerName` lit l'index 0 de SON `TriggerName` (un
 *    `BT_SECOND_TRIGGER` à `CallerSkillType` SKT_FIRST n'y passe pas
 *    `CheckAvailable`). 16 bursts et skills (1210, 3019-3021, 4819-4821,
 *    5221, 5919-5920, 9019-9021, 9319-9320, 10721) y jouent un clip qui ne
 *    porte AUCUN templet que `SkillID` leur rattache : celui du skill
 *    d'entrée du burst ou de sa variante renforcée (`Burst1` de H. Dianne →
 *    `2000093_Skill_2_Burst`, 5 × 200 ‰ de `2000093_Skill_2_1`, quand la
 *    jointure sert 4 × 250 ‰ de `2000093_Skill_1_1`, le S1). La jointure ne
 *    sert qu'au simulateur (`SkillSimulation`) : fausse au combat pour ces
 *    skills, elle cède la place aux templets de leurs clips
 *    (`clipHitTemplets`, appliqué par characters.ts) — sans quoi sa chaîne
 *    garderait, à côté de la variante, un repli § 12.4 fantôme (la fixture
 *    de H. Dianne S2b1 rougissait ainsi sous F29 : deux lignes, plus de clé
 *    `S2b1`, alors que le clip rend les 6 356 mesurés).
 *
 * Suite additionnelle, condition : comptée PAR DÉFAUT (`selfMet`) seulement
 * quand le clip de base pose LUI-MÊME la condition du buff additif — dérivé
 * des tables : un buff du skill créé sur `DAMAGE` par un templet du clip de
 * base (`BuffTemplet.CallerDamageID`), dont le `ToolTipID` est membre du
 * groupe `ToolTipGroupTemplet` de la condition `*_HAS_BUFF` du buff additif
 * (§ 1.4). Francesca S2 : `2000015_Skill_2_1` crée le Saignement
 * `2000015_2_1` (tooltip 3), condition de `2000015_2_2` = groupe 3 → comptée
 * (mesures du 22/08/2026 : cascade(700) + cascade(300) exactes). Sinon la
 * suite est DÉCLARÉE : le calculateur la compte quand un de ses `buffIds`
 * est déclaré rempli (`metConditions`, z `cs`). characters.ts garde le
 * résultat (Francesca seule `selfMet`).
 *
 * JAMAIS de devinette — une chaîne est listée `clipsUnresolvedChains` (et le
 * moteur retombe sur l'heuristique § 12.4) quand :
 *  - un trigger du skill mène à PLUSIEURS clips à events (états alternatifs) ;
 *  - un clip retenu contient un templet absent de `CharacterDamageTemplet`
 *    (somme du clip incalculable) ;
 *  - une partie seulement des templets de la chaîne apparaît dans les clips
 *    (un segment a pu échapper à l'extraction — on ne sert pas un facteur
 *    partiel silencieusement) ;
 *  - un index ≥ 1 qu'aucun buff du kit ne choisit (Vera S1), un kit qui
 *    porte les DEUX types sur le même skill, ou une suite sans
 *    `EventAdditiveAttack` dans le clip de base — chacun avec un
 *    `console.warn` nommé.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadTable, num, splitCsv } from '../lib/tables';

/** Un event `EventAttackStart` du clip, facteur résolu GLOBALEMENT (le
 *  templet peut appartenir à un autre skill — le binaire somme tout le clip). */
export interface DamageClipEvent {
  /** ID brut du damage templet (partie avant la virgule du `data`). */
  id: string;
  /** DamageFactor du templet (‰ du facteur total). */
  factor: number;
  /** Occurrences § 8.1 : `MaxHitCount == 0 ? 1 : MaxHitCount`. */
  count: number;
}

/** Un clip joué par le skill : séquence d'events dans l'ordre du temps. */
export interface DamageSkillClip {
  name: string;
  events: DamageClipEvent[];
}

/** Buffs du kit qui CHOISISSENT un index ≥ 1 (spec damage-clips-joues § 1.1). */
export type DamageClipGateType = 'BT_SECOND_TRIGGER' | 'BT_2000065_A' | 'BT_2000065_B';

/**
 * Une VARIANTE de lancer du skill (spec damage-clips-joues § 5.2) — une
 * ligne du rapport : le clip de l'index retenu (une cascade § 8.2 + § 8.3),
 * plus la suite additionnelle (sa propre cascade) quand sa condition passe.
 */
export interface DamageClipVariant {
  /** `base` (index 0), `second` (1), `third` (2) ; suffixe `-skip` pour l'état passé. */
  key: string;
  trigger: string;
  /** Buff du kit qui choisit cet index — absent pour la base. */
  gate?: { type: DamageClipGateType; buffIds: string[] };
  /** Le clip joué (une cascade). */
  clip: DamageSkillClip;
  /**
   * Suite par `EventAdditiveAttack` : jouée si un des buffs
   * `BT_ADDITIVE_ATTACK_ON_EVENT` passe, sa propre cascade. `selfMet` : le
   * clip de base pose lui-même la condition (cf. l'en-tête) — comptée par
   * défaut ; sinon comptée seulement quand déclarée (`metConditions`).
   */
  additive?: { clip: DamageSkillClip; buffIds: string[]; selfMet?: true };
}

/** Résultat de l'affectation pour UN skill. */
export interface SkillClipsResult {
  /** Variantes du skill, dans l'ordre des index (base, base-skip, second…). */
  variants?: DamageClipVariant[];
  /** Chaînes dont l'affectation n'est pas résolue (cf. en-tête) — le moteur
   *  retombe sur l'heuristique § 12.4 pour ces états. */
  clipsUnresolvedChains?: string[];
  /** Clip de base ÉTRANGER à la jointure `SkillID` (cf. l'en-tête) : les
   *  templets joués par les clips du skill, dans l'ordre — characters.ts en
   *  refait les hits du skill (pas un champ de `characters.json`). */
  clipHitTemplets?: string[];
}

const EVENTS_PATH = resolve('datagen/damage/anim-events.json');

/** Ame : `OriginalCharacterID` 2000065 dans le client (`GetUseTriggerName`
 *  lit A → index 1, B → index 2 pour son S1 et son S3). */
export const AME_CHARACTER_ID = '2000065';

const ADDITIVE_TYPE = 'BT_ADDITIVE_ATTACK_ON_EVENT';
const SECOND_TRIGGER_TYPE = 'BT_SECOND_TRIGGER';

interface CharAnimEntry {
  clips: Record<string, string[]>;
  triggers: Record<string, string[]>;
  /** `EventAdditiveAttack` par clip (instant en s, nombre d'EventAttackStart
   *  avant lui) — porté par anim-events.json depuis le 19/10/2026 (B64). */
  additive?: Record<string, { time: number; after: number }[]>;
}

/** Ligne de `BuffTemplet` (niveau 1) — ce que le classement des index lit. */
export interface ClipKitBuff {
  type: string;
  /** `CallerSkillType` découpé — vide = tout skill (`SKT_ALL` ou absent). */
  callers: string[];
  /** `BuffCreateType` (`PASSIVE`, `DAMAGE`, `SKILL_START`…). */
  createType: string;
  /** `CallerDamageID` découpé — templets qui créent le buff sur `DAMAGE`. */
  callerDamageIds: string[];
  targetType: string;
  conditionType?: string;
  conditionValue?: string;
  tooltipId?: string;
}

/** Index construit une fois par build. */
export interface ClipIndex {
  chars: Map<string, CharAnimEntry>;
  /** Facteur/occurrences par templet (TOUTE la table, lignes sans SkillID
   *  incluses) ; `owned` = rattaché à au moins un skill (`SkillID` non vide). */
  templet: Map<string, { factor: number; count: number; owned: boolean }>;
  /** `BuffTemplet` par BuffID (première ligne) — classement des index. */
  buffs: Map<string, ClipKitBuff>;
  /** `ToolTipGroupTemplet` : groupe → ids de tooltip membres (conditions `*_HAS_BUFF`). */
  tooltipGroups: Map<string, string[]>;
}

/** Ordre ordinal — la sortie est canonique et committée (cf. characters.ts). */
const ord = (x: string, y: string): number => (x < y ? -1 : x > y ? 1 : 0);

export function buildClipIndex(): ClipIndex {
  const raw = JSON.parse(readFileSync(EVENTS_PATH, 'utf8')) as Record<string, CharAnimEntry>;
  const templet = new Map<string, { factor: number; count: number; owned: boolean }>();
  for (const d of loadTable('CharacterDamageTemplet')) {
    const max = num(d.MaxHitCount);
    templet.set(d.ID, {
      factor: num(d.DamageFactor),
      count: max > 0 ? max : 1,
      owned: splitCsv(d.SkillID).length > 0,
    });
  }
  const buffs = new Map<string, ClipKitBuff>();
  for (const b of loadTable('BuffTemplet')) {
    if (buffs.has(b.BuffID)) continue;
    const callers = splitCsv(b.CallerSkillType).filter((c) => c !== 'SKT_ALL');
    buffs.set(b.BuffID, {
      type: b.Type ?? '',
      callers,
      createType: b.BuffCreateType ?? '',
      callerDamageIds: splitCsv(b.CallerDamageID),
      targetType: b.TargetType ?? '',
      ...(b.BuffConditionType && b.BuffConditionType !== 'NONE'
        ? { conditionType: b.BuffConditionType }
        : {}),
      ...(b.BuffConditionValue ? { conditionValue: b.BuffConditionValue } : {}),
      ...(b.ToolTipID ? { tooltipId: b.ToolTipID } : {}),
    });
  }
  const tooltipGroups = new Map<string, string[]>();
  for (const g of loadTable('ToolTipGroupTemplet'))
    tooltipGroups.set(g.ID, splitCsv(g.ToolTipMember));
  return { chars: new Map(Object.entries(raw)), templet, buffs, tooltipGroups };
}

/**
 * Tous les templets joués par un clip de l'animator `modelId` (vide quand le
 * perso n'a pas d'entrée dans anim-events.json).
 */
export function carrierTemplets(index: ClipIndex, modelId: string): Set<string> {
  const out = new Set<string>();
  for (const seq of Object.values(index.chars.get(modelId)?.clips ?? {}))
    for (const e of seq) {
      const id = e.split(',')[0].trim();
      if (id) out.add(id);
    }
  return out;
}

/** Le perso qui PORTE le skill : son id, son animator, son origine de fusion. */
export interface ClipCarrier {
  id: string;
  /** `ModelID` — clé de anim-events.json. */
  model: string;
  /** `CharacterFusionTemplet.CharacterID` d'un fusionné — l'identité du client. */
  originId?: string;
}

/** Le skill à résoudre : colonnes du `CharacterSkillTemplet` et buffs de ses niveaux. */
export interface ClipSkill {
  id: string;
  /** `SkillType` (`SKT_*`) — croisé avec `CallerSkillType` des buffs du kit. */
  type: string;
  triggerCsv?: string;
  triggerSkipCsv?: string;
  /** `BuffID` de tous ses niveaux (dédoublonnés) — la preuve `selfMet` s'y lit. */
  buffIds: string[];
}

const VARIANT_KEYS = ['base', 'second', 'third'] as const;

/**
 * Résout les variantes d'un skill depuis ses triggers d'animator, le kit de
 * son porteur et ses hits (cf. l'en-tête). `kitBuffIds` = `BuffID` des
 * niveaux de TOUS les skills du porteur : le buff qui choisit l'index 1 du
 * burst 1 de Sterope vit sur son S1.
 */
export function resolveSkillClips(
  index: ClipIndex,
  carrier: ClipCarrier,
  skill: ClipSkill,
  kitBuffIds: Iterable<string>,
  hits: { id: string; chain: string }[],
): SkillClipsResult {
  if (!hits.length) return {};
  const entry = index.chars.get(carrier.model);
  if (!entry) return {};

  const chains = new Map<string, Set<string>>();
  const chainOfId = new Map<string, string>();
  for (const h of hits) {
    const c = chains.get(h.chain);
    if (c) c.add(h.id);
    else chains.set(h.chain, new Set([h.id]));
    chainOfId.set(h.id, h.chain);
  }
  const unresolved = new Set<string>();
  const flagChainsOf = (templetIds: string[]): void => {
    for (const [chain, ids] of chains)
      if (templetIds.some((t) => ids.has(t))) unresolved.add(chain);
  };
  const flagClip = (clip: DamageSkillClip | undefined): void => {
    if (clip) flagChainsOf(clip.events.map((e) => e.id));
  };
  const warn = (msg: string): void => {
    console.warn(`damage/clips: skill ${skill.id} (${carrier.id}) — ${msg}`);
  };

  // Le clip à events d'un trigger : aucun (undefined), un, ou plusieurs
  // (états alternatifs : on ne choisit pas, chaînes marquées). Le clip d'un
  // index du skill lui appartient sans condition de templet (cf. l'en-tête).
  const clipOf = (trigger: string): DamageSkillClip | undefined => {
    const withEvents = (entry.triggers[trigger] ?? []).filter((n) => entry.clips[n]?.length);
    if (withEvents.length > 1) {
      flagChainsOf(withEvents.flatMap((n) => entry.clips[n].map((e) => e.split(',')[0].trim())));
      return undefined;
    }
    if (!withEvents.length) return undefined;
    const name = withEvents[0];
    const seq = entry.clips[name].map((e) => e.split(',')[0].trim()).filter(Boolean);
    // Un templet hors table rend le clip incalculable.
    if (seq.some((t) => !index.templet.has(t))) {
      flagChainsOf(seq);
      return undefined;
    }
    // Templets COMMUNS seulement (sans SkillID) : état SKIP générique, à
    // aucun skill.
    if (!seq.some((t) => index.templet.get(t)!.owned)) return undefined;
    return {
      name,
      events: seq.map((tid) => {
        const t = index.templet.get(tid)!;
        return { id: tid, factor: t.factor, count: t.count };
      }),
    };
  };

  // Buffs du kit d'un type donné qui visent ce skill (`CallerSkillType`).
  const kit = [...new Set(kitBuffIds)].sort(ord);
  const kitOf = (type: string, byCaller: boolean): string[] =>
    kit.filter((id) => {
      const b = index.buffs.get(id);
      return b?.type === type && (!byCaller || !b.callers.length || b.callers.includes(skill.type));
    });
  const isAme = carrier.id === AME_CHARACTER_ID || carrier.originId === AME_CHARACTER_ID;

  // `selfMet` : le clip de base pose lui-même la condition d'un buff additif
  // (cf. l'en-tête). Conditions lues : `TARGET_HAS_BUFF` (buff créé sur
  // l'ennemi) et `OWNER_HAS_BUFF` (sur le lanceur) ; les autres (`TARGET_IS_BOSS`,
  // `*_HAS_NOT_BUFF`) ne se posent pas par un hit.
  const selfMet = (base: DamageSkillClip, additiveIds: string[]): boolean => {
    const baseTemplets = new Set(base.events.map((e) => e.id));
    for (const aid of additiveIds) {
      const a = index.buffs.get(aid);
      if (!a?.conditionType || a.conditionValue === undefined) continue;
      const onTarget = a.conditionType === 'TARGET_HAS_BUFF';
      if (!onTarget && a.conditionType !== 'OWNER_HAS_BUFF') continue;
      const members = index.tooltipGroups.get(a.conditionValue) ?? [a.conditionValue];
      for (const bid of skill.buffIds) {
        const b = index.buffs.get(bid);
        if (!b || b.createType !== 'DAMAGE' || b.tooltipId === undefined) continue;
        if (!b.callerDamageIds.some((d) => baseTemplets.has(d))) continue;
        if (!members.includes(b.tooltipId)) continue;
        const side = onTarget ? b.targetType.startsWith('ENEMY') : b.targetType === 'ME';
        if (side) return true;
      }
    }
    return false;
  };

  const triggers = splitCsv(skill.triggerCsv ?? '');
  const skips = splitCsv(skill.triggerSkipCsv ?? '');
  const variants: DamageClipVariant[] = [];
  for (let i = 0; i < triggers.length; i++) {
    const trigger = triggers[i];
    const clip = clipOf(trigger);
    const skipTrigger = skips[i];
    const skipClip = skipTrigger !== undefined ? clipOf(skipTrigger) : undefined;
    if (!clip && !skipClip) continue; // index sans clip à events (Ame S3, index 0)

    let gate: DamageClipVariant['gate'];
    let additiveIds: string[] | undefined;
    if (i === 0) {
      // Index 0 : la base, sans condition.
    } else if (isAme) {
      if (i === 1) gate = { type: 'BT_2000065_A', buffIds: kitOf('BT_2000065_A', false) };
      else if (i === 2) gate = { type: 'BT_2000065_B', buffIds: kitOf('BT_2000065_B', false) };
    } else if (i === 1) {
      const second = kitOf(SECOND_TRIGGER_TYPE, true);
      const additive = kitOf(ADDITIVE_TYPE, true);
      if (second.length && additive.length) {
        flagClip(clip);
        flagClip(skipClip);
        warn(
          `index 1 (${trigger}) : ${SECOND_TRIGGER_TYPE} et ${ADDITIVE_TYPE} dans le kit, non tranché`,
        );
        continue;
      }
      if (second.length) gate = { type: SECOND_TRIGGER_TYPE, buffIds: second };
      else if (additive.length) additiveIds = additive;
    }

    if (additiveIds) {
      // Suite additionnelle : le client pose `TriggerNameSecond` (jamais son
      // skip) depuis l'EventAdditiveAttack du clip de base — sur chaque
      // variante d'index 0 dont le clip porte l'event.
      const carriers = variants.filter(
        (v) =>
          !v.gate && v.clip.name in (entry.additive ?? {}) && entry.additive![v.clip.name].length,
      );
      if (!clip || !carriers.length) {
        flagClip(clip);
        flagClip(skipClip);
        warn(
          clip
            ? `suite ${trigger} sous ${ADDITIVE_TYPE} sans EventAdditiveAttack dans le clip de base`
            : `suite ${trigger} sous ${ADDITIVE_TYPE} sans clip à events`,
        );
        continue;
      }
      for (const v of carriers) {
        v.additive = {
          clip,
          buffIds: additiveIds,
          ...(selfMet(v.clip, additiveIds) ? { selfMet: true as const } : {}),
        };
      }
      continue;
    }

    const key = i === 0 ? VARIANT_KEYS[0] : gate ? VARIANT_KEYS[i] : undefined;
    if (key === undefined) {
      flagClip(clip);
      flagClip(skipClip);
      warn(`index ${i} (${trigger}) : aucun buff du kit ne le choisit`);
      continue;
    }
    if (clip) variants.push({ key, trigger, ...(gate ? { gate } : {}), clip });
    if (skipClip && skipTrigger !== undefined)
      variants.push({
        key: `${key}-skip`,
        trigger: skipTrigger,
        ...(gate ? { gate } : {}),
        clip: skipClip,
      });
  }
  if (!variants.length && !unresolved.size) return {};

  // Couverture par chaîne : tout ou rien. Une chaîne partiellement couverte
  // (un segment a pu échapper à l'extraction) n'est PAS servie en facteur
  // partiel ; une chaîne sans aucun event garde le fallback silencieux.
  const covered = new Set<string>();
  for (const v of variants)
    for (const c of [v.clip, v.additive?.clip]) for (const e of c?.events ?? []) covered.add(e.id);
  for (const [chain, ids] of chains) {
    const seen = [...ids].filter((t) => covered.has(t)).length;
    if (seen > 0 && seen < ids.size) unresolved.add(chain);
  }
  // Un clip dont les events du skill sont TOUS en chaînes irrésolues n'est
  // pas servi (le fallback § 12.4 les porte) ; un clip étranger au skill
  // (aucun de ses templets — Regina, Dahlia, Ame S3) reste.
  const playable = (c: DamageSkillClip): boolean => {
    const own = c.events.filter((e) => chainOfId.has(e.id));
    return !own.length || own.some((e) => !unresolved.has(chainOfId.get(e.id)!));
  };
  const resolved = variants
    .filter((v) => playable(v.clip))
    .map((v) => (v.additive && !playable(v.additive.clip) ? { ...v, additive: undefined } : v))
    .map((v) =>
      v.additive
        ? v
        : { key: v.key, trigger: v.trigger, ...(v.gate ? { gate: v.gate } : {}), clip: v.clip },
    );

  // Clip de base étranger à la jointure (cf. l'en-tête) : les hits du skill
  // sont les templets que ses clips jouent.
  const base = resolved.find((v) => v.key === VARIANT_KEYS[0]);
  const foreign =
    base !== undefined && !unresolved.size && !base.clip.events.some((e) => chainOfId.has(e.id));
  const clipHitTemplets = foreign
    ? [
        ...new Set(
          resolved.flatMap((v) =>
            [v.clip, v.additive?.clip].flatMap((c) => c?.events.map((e) => e.id) ?? []),
          ),
        ),
      ]
    : undefined;

  return {
    ...(resolved.length ? { variants: resolved } : {}),
    ...(unresolved.size ? { clipsUnresolvedChains: [...unresolved].sort(ord) } : {}),
    ...(clipHitTemplets ? { clipHitTemplets } : {}),
  };
}
