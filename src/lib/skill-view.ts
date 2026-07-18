/**
 * Vues « kit de skills » pré-localisées — partagées entre la fiche publique et
 * le panneau admin (même rendu, données construites UNE fois ici).
 *
 * Rappels modèle : les buffs/debuffs de l'attaque en CHAÎNE vivent sur les
 * skills techniques `strike_*` (selon la position du perso dans la chaîne),
 * ceux de l'attaque DUO sur `backup_*` ; le `chain_passive` porte le texte des
 * deux moitiés (titres colorés + saut de ligne). Les WGR réels par niveau
 * vivent aussi sur strike/backup.
 */
import type { Glossaries, Skill } from '@contracts';
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { MAIN_SKILL_TYPES, levelAt, splitChainDual } from '@/lib/skills';
import { curatedKeyIndex, getMergedEffect, mergeStatusEffects } from '@/lib/data/effects';
import { loadDataJson } from '@/lib/data/disk';
import { isDebuffEffect } from '@/components/character/EffectChips';
import type { ClientEffect, StatusMap } from '@/components/character/EffectChips';
import type { ChainLevel } from '@/components/character/ChainDualSection';

// Glossaire et curation lus au DISQUE (cache mtime), pas importés : ces
// fichiers sont réécrits par l'admin en cours de session — un import statique
// les mettrait dans le graphe de modules et chaque save recompilerait le site
// (cf. src/lib/data/disk.ts). Ce module est donc SERVEUR uniquement.
const G = (): Glossaries => loadDataJson<Glossaries>('generated/glossaries.json');
/** Curation d'AFFICHAGE des kits monstres (cf. doc dans le fichier). Un buff
 * PARTAGÉ entre kits jumeaux peut lister plusieurs porteurs candidats — le
 * premier présent dans le kit l'emporte. `chipAdd` AJOUTE des chips (réfs
 * tooltip du glossaire) à une carte : statuts décrits par la desc du skill
 * mais appliqués hors kit (passifs de PALIER — l'Increased Penetration
 * rang S+ décrite par Dimensional Rift vit dans les OptionID des rangs).
 * `chipHide` (skillId → buffIds) MASQUE des chips sur une carte : buff de
 * câblage que la desc ne décrit pas et que le jeu n'affiche pas (colonne
 * BuffToolTip du niveau vide), ou copie du porteur quand la duplication
 * caller a déjà rendu la chip au skill qui la décrit. */
const monsterCurated = (): MonsterKitCuration =>
  loadDataJson<MonsterKitCuration>('curated/monster-skills.json');

/**
 * Curation d'affichage des kits PERSOS (cf. doc dans le fichier curé). Deux
 * gestes LOCAUX à une carte — le routage auto d'un perso est déjà déterministe
 * (convention de slot `{charId}_1|2|3`, `caller`), donc pas de déplacement
 * inter-cartes (`chipOwner`) comme chez les monstres :
 *   - `chipHide` (cardId → refs) MASQUE des chips sur une carte (parasite que
 *     le jeu n'affiche pas) ; la ref est le `tooltip ?? label` de la chip ;
 *   - `chipAdd` (cardId → réfs tooltip) AJOUTE des chips du glossaire (statut
 *     décrit par la desc mais appliqué hors kit).
 * cardId = id du skill (mains/fusion_passive/extra), id du chain_passive pour
 * la chaîne, `{chainPassiveId}::dual` pour le duo.
 */
export interface CharacterKitCuration {
  chipHide?: Record<string, string[]>;
  chipAdd?: Record<string, string[]>;
}

/** Suffixe de cardId du DUO (partage la carte du chain_passive, chips à part). */
export const DUAL_CARD_SUFFIX = '::dual';

const characterCurated = (): CharacterKitCuration => {
  // Fichier absent (checkout sans curation perso) → aucune curation.
  try {
    return loadDataJson<CharacterKitCuration>('curated/character-skills.json');
  } catch {
    return {};
  }
};

/**
 * Applique la curation LOCALE d'une carte perso : masque les refs `chipHide`
 * puis ajoute les refs `chipAdd` résolubles du glossaire (mêmes règles que le
 * `chipAdd` monstre — seules les réfs qui résolvent un effet passent).
 */
function applyCardCuration(
  effects: ClientEffect[],
  cardId: string,
  cur: CharacterKitCuration,
): ClientEffect[] {
  const hidden = new Set(cur.chipHide?.[cardId] ?? []);
  let out = hidden.size ? effects.filter((e) => !hidden.has(e.tooltip ?? e.label ?? '')) : effects;
  for (const ref of cur.chipAdd?.[cardId] ?? []) {
    if (!getMergedEffect(G().effectByTooltip[ref] ?? ref)) continue;
    out = [...out, { family: 'stat', category: 'buff', tooltip: ref }];
  }
  return out;
}

/**
 * Méta d'affichage de la CHIP qu'un effet monstre produirait (null si l'effet
 * ne produit pas de chip : WG, câblage, réf irrésoluble). ADMIN : pills de
 * l'éditeur de câblage — même résolution que le rendu des chips.
 */
export function monsterChipMeta(
  e: NonNullable<Skill['effects']>[number],
): { name: string; icon?: string; isDebuff: boolean } | null {
  if (e.type.startsWith('BT_WG')) return null;
  const chip = toChipEffect(e);
  if (!chip) return null;
  const key = chip.tooltip ?? chip.label;
  if (!key) return null;
  const g = G();
  const eff = chip.tooltip
    ? getMergedEffect(g.effectByTooltip[chip.tooltip] ?? chip.tooltip)
    : getMergedEffect(g.effectByLabel[chip.label!] ?? chip.label!);
  return {
    name: eff?.name.en ?? key,
    ...(eff?.icon ? { icon: eff.icon } : {}),
    isDebuff: isDebuffEffect(e.category, eff?.isDebuff),
  };
}

/** Dédoublonne par id (les listes de skills des persos à formes en répètent). */
export function dedupSkills(skills: Skill[]): Skill[] {
  const seen = new Set<string>();
  return skills.filter((s) => {
    if (seen.has(s.id)) return false;
    seen.add(s.id);
    return true;
  });
}

type RawEffect = NonNullable<Skill['effects']>[number];

/** Labels de CÂBLAGE générique (magnitude pure, « Damage Increase ») — jamais
 * des statuts côté joueur, même résolubles (arbitrage V2 : 2000114/2000057…). */
const WIRING_LABELS = new Set(['SYS_BUFF_DMG']);

/** Buffs ARBITRÉS non-chips (arbitrages utilisateur 2026-07-07) :
 * - Ais `2000096_chain_1_1` : modificateur de l'ATTAQUE elle-même encodé comme
 *   buff à tooltip — indiscernable d'un vrai buff dans les tables (mêmes
 *   durée/valeur), seule la desc le dit (« Increases Critical Damage of the
 *   attack »).
 * - Astei/Ember `2000059_1_1`/`2000094_1_3` : déclencheurs d'attaque renforcée
 *   câblés avec le label SYS_BUFF_REVENGE_HEAL → chip « Agile Response »
 *   erronée (le label est légitime ailleurs, ex. Christina). */
const NON_CHIP_BUFFS = new Set(['2000096_chain_1_1', '2000059_1_1', '2000094_1_3']);

/**
 * Upgrade de TRANSCENDANCE : buff `trancendent_*` NON accordé au NIVEAU 1 du
 * skill porteur. Le niveau 1 d'un unique_passive fait partie du kit de base
 * (Dual Attack du S1 d'Eva : `trancendent_8_call_back_up_1`) ; les niveaux
 * suivants sont les paliers de transcendance, affichés dans leur section
 * (cool3 de 2000090 : accordé au niveau 2 seulement).
 */
function isTranscendUpgrade(s: Skill, e: RawEffect): boolean {
  const b = e.buff ?? '';
  if (!b.startsWith('trancendent') && !b.startsWith('transcendent')) return false;
  // Effet RATTACHÉ à un skill principal (`caller`) : il décrit ce que CE skill
  // fait, même débloqué par la transcendance (Unbuffable du S2 d'E.Tamamo sur
  // cible Water ; 2e Dual Attack du S1 d'Eva). Il appartient à la carte du
  // skill — seuls les paliers AUTONOMES (sans caller) restent cantonnés à la
  // section transcendance.
  if (e.caller) return false;
  return !s.levels[0]?.vars?.[b];
}

/** `nature|type` → id de CRÉATION curée (`keys` de data/curated/effects.json) —
 * mécaniques sans texte dans les tables, nommées par la curation (« Extinction »
 * pour BT_SEALED_RESURRECTION…). Même pont que les passifs d'équipement. L'index
 * (`bySideKey`) est PARTAGÉ avec `resolveEffectKey`, mémoïsé sur le mtime du
 * fichier curé (cf. `curatedKeyIndex` d'effects.ts) — plus de cache local qui se
 * périmerait dans le process admin long-running. */
function curatedCreationFor(side: 'buff' | 'debuff', type: string): string | undefined {
  const { bySideKey } = curatedKeyIndex();
  return (
    bySideKey.get(`${side}|${type}`) ??
    bySideKey.get(`${side === 'buff' ? 'debuff' : 'buff'}|${type}`)
  );
}

/**
 * Un effet de skill devient une CHIP s'il référence un statut/mécanique NOMMÉ
 * et RÉSOLUBLE : tooltip du glossaire, label de mécanique non-stat, ou — pour
 * les mécaniques sans texte — la CRÉATION curée adressée par type. Exclusions
 * (câblage, jamais des buffs côté joueur — même règle que le contrôle V2) :
 * `BT_STAT*`/`BT_NONE` à label seul, labels de magnitude générique
 * (SYS_BUFF_DMG), enfants de groupe aléatoire (le statut du groupe fait la
 * chip), dégâts fixes auto-infligés (coût en HP, pas une attaque — 2000024).
 * Les upgrades de transcendance sont filtrés en amont (`isTranscendUpgrade`,
 * qui a besoin du skill porteur).
 */
function toChipEffect(e: RawEffect): ClientEffect | null {
  if (e.choice) return null;
  if (e.buff && NON_CHIP_BUFFS.has(e.buff)) return null;
  const g = G();
  const base = {
    family: e.family,
    category: e.category,
    buff: e.buff,
    stat: e.stat,
    mode: e.mode,
  };
  if (e.tooltip && (g.effectByTooltip[e.tooltip] ?? getMergedEffect(e.tooltip)))
    return { ...base, tooltip: e.tooltip };
  const isStatLike = e.type === 'BT_STAT' || e.type === 'BT_STAT_PREMIUM' || e.type === 'BT_NONE';
  // CAS ISOLÉ : `BT_CALL_BACKUP_2` (« double dual », Eva/Luna/Iota…) réutilise le
  // label GÉNÉRIQUE du dual simple (SYS_BUFF_BACKUP) → sans ça il résout comme le
  // simple et FUSIONNE avec lui (dédup). On force son identité curée propre
  // (Dual Attack x2). Ciblé exprès : les autres types à label restent label-first.
  if (e.type === 'BT_CALL_BACKUP_2') {
    const cid = curatedCreationFor(e.category === 'buff' ? 'buff' : 'debuff', e.type);
    if (cid) return { ...base, tooltip: cid };
  }
  if (e.label && !isStatLike && !WIRING_LABELS.has(e.label) && g.effectByLabel[e.label])
    return { ...base, label: e.label };
  // « Dégâts fixes » (reverse heal) ciblés sur le LANCEUR ou un allié = coût
  // en HP du kit, pas des dégâts infligés — jamais une chip.
  if (e.type.startsWith('BT_REVERSE_HEAL') && !(e.target ?? '').startsWith('enemy')) return null;
  // Pont curé par TYPE (la `stat` de ces types est une base de CALCUL — % des
  // HP de la cible pour les dégâts fixes — pas un buff de stat).
  if (!isStatLike) {
    const side = e.category === 'buff' ? 'buff' : 'debuff';
    const cid = curatedCreationFor(side, e.type);
    if (cid) return { ...base, tooltip: cid };
  }
  return null;
}

/** Effets structurés d'un skill → forme client (chips affichables seulement). */
export function toClientEffects(s: Skill): ClientEffect[] | undefined {
  return s.effects
    ?.filter((e) => !isTranscendUpgrade(s, e))
    .map(toChipEffect)
    .filter((e): e is ClientEffect => Boolean(e));
}

/** Composite type|stat d'un effet brut — même clé que `Glossaries.tooltipKinds`. */
function kindOf(e: RawEffect): string {
  return e.stat ? `${e.type}|${e.stat}` : e.type;
}

/**
 * Les 3 skills principaux, dans l'ordre d'affichage. Certains persos ont des
 * VARIANTES du même type à 1 niveau (formes/états, ex. 2000001) : on garde la
 * version complète (le plus de niveaux).
 */
export function mainSkills(skills: Skill[]): Skill[] {
  return MAIN_SKILL_TYPES.map((type) => {
    const candidates = skills.filter((s) => s.type === type);
    return candidates.sort((a, b) => b.levels.length - a.levels.length)[0];
  }).filter((s): s is Skill => Boolean(s));
}

/**
 * Statuts nommés référencés par les effets des skills (chips) : nom, nature,
 * icône et description depuis les effets FUSIONNÉS (les overrides curés de
 * /admin/effects comptent) — utilisé par le site ET l'admin.
 */
export function buildStatusMap(skills: Skill[], lang: Lang): StatusMap {
  const statuses: StatusMap = {};
  const burstable = mainSkills(skills).find((s) => s.burstAP?.length);
  mergeStatusEffects(
    statuses,
    [
      // Chips affichables (mêmes réfs que les cartes — ponts curés inclus).
      ...skills.flatMap((s) => toClientEffects(s) ?? []),
      // Statuts affichés par les niveaux (Heavy Strike…) — sans dédup ici :
      // une entrée de plus dans la map est inoffensive sans chip.
      ...skills.flatMap((s) => levelTooltipEffects(s)),
      // Effets synthétiques (bonus WG des bursts) — leur statut vient d'une
      // création curée, résolue par id directement.
      ...(burstable ? syntheticBurstEffects(skills) : []),
    ],
    lang,
  );
  return statuses;
}

/**
 * VUE « KIT » DES SKILLS D'UN MONSTRE — corrige deux particularités du câblage
 * des tables monstres avant l'affichage en cartes (même esprit que
 * `cardEffects` côté persos, qui réattribue les effets des passifs) :
 *
 * 1. RÉATTRIBUTION : les tables groupent parfois tout un bloc de buffs passifs
 *    sur UN skill porteur (Prototype EX-78 : monster_1 a un BuffID VIDE, tout
 *    est câblé sur monster_2 ; Irregular Queen : tout le bloc du S2 est câblé
 *    sur monster_1 qui CONTRE-ATTAQUE avec le S2). Trois signaux, dans l'ordre :
 *    a. CALLER (`CallerSkillType` → `e.caller`) : l'effet est DUPLIQUÉ sur le
 *       skill principal déclencheur (le S2 applique le taunt/les removals) ET
 *       reste sur le passif porteur (sa contre-attaque fait la même chose) ;
 *    b. CURATION (`data/curated/monster-skills.json` → chipOwner) — pour les
 *       cas sans AUCUN signal structurel ;
 *    c. RÉFÉRENCE DE DESC : un effet dont le buff n'est PAS référencé par la
 *       desc du porteur mais l'est par EXACTEMENT un autre skill du kit
 *       devient une chip de cet autre skill (id exact du buff dans les
 *       placeholders `[Buff_…]`, frontière de mot — zéro heuristique texte).
 * 2. FUSION DE L'ENRAGE : `rage_finishN` (l'attaque de FIN d'enrage) n'a le
 *    plus souvent pas de DESC propre — le jeu décrit tout l'enrage
 *    (déclencheur, buffs, attaque de fin) dans la desc de `rage_enterN`,
 *    parfois en NOMMANT l'attaque dedans (« I Offer My Life...: Used when
 *    Enraged ends. »). Ses chips sont fusionnées dans la carte enter ; la
 *    carte finish n'apparaît que si elle a nom ET desc propres.
 * 3. JAUGE DE FAIBLESSE IGNORÉE : les buffs `BT_WG_*` (récupération/dégâts de
 *    WG) ne font JAMAIS de chips côté monstres (décision 2026-07-10) — c'est
 *    la mécanique ambiante des boss, décrite par les descs, pas un statut du
 *    kit. (Les PERSOS gardent leurs chips WG : bonus de burst synthétiques.)
 * 4. VARIANTE TECHNIQUE MASQUÉE : un skill sans nom NI desc dont chaque effet
 *    est déjà porté par un skill documenté du kit est une déclinaison de
 *    câblage (backup_aerial/backup_ground du boss de guild raid 440600010 =
 *    copies de son S1) — sa carte n'apporterait que des chips en double.
 */
export interface MonsterSkillView {
  skill: Skill;
  effects?: ClientEffect[];
}

/** Forme de la curation d'affichage monstres (fichier curé ou override). */
export interface MonsterKitCuration {
  chipOwner?: Record<string, string | string[]>;
  chipAdd?: Record<string, string[]>;
  chipHide?: Record<string, string[]>;
}

export function monsterSkillViews(
  skills: Skill[],
  // Curation substituable (ADMIN : l'éditeur de câblage passe `{}` pour
  // obtenir les positions « règles pures », et sa propre copie en prévisualisation).
  curated: MonsterKitCuration = monsterCurated(),
): MonsterSkillView[] {
  // Le buff est-il référencé par la desc (id EXACT, frontière de mot) ?
  const mentions = (s: Skill, buffId: string): boolean =>
    Boolean(s.desc?.en) &&
    new RegExp(`${buffId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w])`).test(s.desc!.en);

  // 1) Réattribution : effets rendus À d'autres skills, indexés par cible.
  const extraOf = new Map<string, RawEffect[]>();
  const movedFrom = new Map<string, Set<RawEffect>>();
  const move = (from: Skill, e: RawEffect, toId: string): void => {
    (extraOf.get(toId) ?? extraOf.set(toId, []).get(toId)!).push(e);
    (movedFrom.get(from.id) ?? movedFrom.set(from.id, new Set()).get(from.id)!).add(e);
  };
  const isWg = (e: RawEffect): boolean => e.type.startsWith('BT_WG');
  const curatedOwner = curated.chipOwner ?? {};
  // a. Caller : un effet porté par un PASSIF est DUPLIQUÉ vers le(s) skill(s)
  // du type déclencheur et conservé sur le porteur ; l'effet est acquis, les
  // signaux suivants ne le déplacent plus. PASSIFS UNIQUEMENT (même règle que
  // les persos) : sur un skill actif, le caller décrit le kit D'ORIGINE du
  // buff — souvent RÉUTILISÉ d'un autre boss (le stun de rage_finish du
  // Prototype vient du kit de 4044001, caller SKT_ULTIMATE → faux positif).
  const MONSTER_PASSIVE_TYPES = /^(monster_\d+|class_passive|unique_passive)$/;
  const callerHandled = new Set<RawEffect>();
  for (const s of skills) {
    if (!MONSTER_PASSIVE_TYPES.test(s.type)) continue;
    for (const e of s.effects ?? []) {
      // Un buff CURÉ (chipOwner) échappe à la duplication caller : la décision
      // humaine désigne UN porteur, elle prime sur le signal des tables.
      if (!e.caller || isWg(e) || (e.buff && curatedOwner[e.buff])) continue;
      const targets = skills.filter((t) => t.id !== s.id && t.type === e.caller);
      if (!targets.length) continue;
      for (const t of targets) (extraOf.get(t.id) ?? extraOf.set(t.id, []).get(t.id)!).push(e);
      callerHandled.add(e);
    }
  }
  for (const s of skills) {
    for (const e of s.effects ?? []) {
      if (!e.buff || isWg(e) || callerHandled.has(e)) continue;
      // b. Curation : porteur imposé (le premier candidat présent dans ce kit).
      const curated = curatedOwner[e.buff];
      if (curated) {
        const candidates = Array.isArray(curated) ? curated : [curated];
        if (!candidates.includes(s.id)) {
          const target = candidates.find((cid) => skills.some((t) => t.id === cid));
          if (target) move(s, e, target);
        }
        continue; // décision curée — les règles suivantes ne s'appliquent plus
      }
      // c. Référence de desc.
      if (mentions(s, e.buff)) continue;
      const owners = skills.filter((t) => t.id !== s.id && mentions(t, e.buff!));
      if (owners.length !== 1) continue;
      move(s, e, owners[0].id);
    }
  }

  // `cardId` = la carte où ces chips S'AFFICHENT, et donc celle dont le
  // `chipHide` s'applique. Il diffère du skill porteur quand les chips d'un
  // rage_finish sont fusionnées dans la carte de son enter : le curateur pose
  // le masquage là où il VOIT la chip (l'enter — Vladi Max 4044004 y masque
  // ses gains d'AP/CP), pas sur le skill technique qui la porte.
  const chipsOf = (s: Skill, cardId: string = s.id): ClientEffect[] => {
    const hidden = new Set(curated.chipHide?.[cardId] ?? []);
    const own = (s.effects ?? []).filter((e) => !isWg(e) && !movedFrom.get(s.id)?.has(e));
    return [...own, ...(extraOf.get(s.id) ?? [])]
      .filter((e) => !e.buff || !hidden.has(e.buff))
      .map(toChipEffect)
      .filter((e): e is ClientEffect => Boolean(e));
  };

  // Buffs portés par les skills DOCUMENTÉS (nom ou desc) — référence de la
  // règle 4 (variantes techniques).
  const namedKitBuffs = new Set<string>();
  for (const t of skills) {
    if (!t.name.en && !t.desc?.en) continue;
    for (const e of t.effects ?? []) if (e.buff) namedKitBuffs.add(e.buff);
  }

  // 2) Fusion rage_finishN → rage_enterN (chips union). La carte finish ne
  // vit que si elle a nom ET desc PROPRES : un nom seul ne suffit pas — le
  // jeu décrit l'attaque de fin dans la desc d'enter (« I Offer My Life...:
  // Used when Enraged ends. » — Meteos JC 130738, Ice Nine, Quasar
  // Bombardment…), la carte serait un titre sans corps et ses chips
  // manqueraient à « Enraged ».
  const ownCard = (t: Skill): boolean => Boolean(t.name.en && t.desc?.en);
  // Un finish nommé ET décrit peut encore être un COPIÉ-COLLÉ de son enter
  // (Grand Calamari, Sacreed Guardian, Beast of Karma, Iota : mêmes nom et
  // desc « Enraged » sur les deux skills) : deux cartes identiques, chips
  // éclatées entre elles. Nom ET desc ÉGAUX à ceux de l'enter = pas une carte
  // propre → fusion. Vérifié sur le catalogue : 4 copies, 4 cartes légitimes
  // (noms distincts — « Descent of the Tyrant », « I Offer My Life... »),
  // aucun cas intermédiaire (même nom, desc différente).
  const standsAlone = (finish: Skill, enter: Skill): boolean =>
    ownCard(finish) &&
    !(finish.name.en === enter.name.en && (finish.desc?.en ?? '') === (enter.desc?.en ?? ''));
  const views: MonsterSkillView[] = [];
  for (const s of skills) {
    const finishMatch = /^rage_finish(\d*)$/.exec(s.type);
    if (finishMatch) {
      const enter = skills.find((t) => t.type === `rage_enter${finishMatch[1]}`);
      // Sans enter jumeau, l'enrage N'EXISTE PAS : câblage mort cloné sur
      // tout le roster world boss (73 monstres, tous sans donnée RageTemplet
      // — le « Quasar Bombardment » de Venion fuit jusque chez Dahlia et
      // Drakhan, icône comprise ; vérifié : aucun monstre légitime n'a de
      // finish sans son enter). Carte et chips disparaissent.
      if (!enter) continue;
      if (!standsAlone(s, enter)) continue; // fusionné dans la carte enter
    }
    // 4) Variante technique : ni nom ni desc, effets tous en double ailleurs.
    if (
      !s.name.en &&
      !s.desc?.en &&
      (s.effects?.length ?? 0) > 0 &&
      s.effects!.every((e) => e.buff && namedKitBuffs.has(e.buff))
    )
      continue;
    let effects = chipsOf(s);
    const enterMatch = /^rage_enter(\d*)$/.exec(s.type);
    if (enterMatch) {
      const finish = skills.find((t) => t.type === `rage_finish${enterMatch[1]}`);
      // Chips du finish rendues SUR la carte enter → le chipHide de l'enter
      // (la carte visible) les gouverne.
      if (finish && !standsAlone(finish, s)) effects = [...effects, ...chipsOf(finish, s.id)];
    }
    // Chips CURÉES en plus (chipAdd) : statuts décrits par la desc mais
    // appliqués hors kit — seules les réfs résolubles passent.
    for (const t of curated.chipAdd?.[s.id] ?? []) {
      if (!getMergedEffect(G().effectByTooltip[t] ?? t)) continue;
      effects = [...effects, { family: 'stat', category: 'buff', tooltip: t }];
    }
    const deduped = dedupList(effects);
    // Skill de PUR CÂBLAGE (ni nom, ni desc, ni chips — ex. un class_passive
    // qui ne porte qu'un check-buff BT_NONE) : rien à montrer.
    if (!s.name.en && !s.desc?.en && !deduped.length) continue;
    views.push({ skill: s, effects: deduped.length ? deduped : undefined });
  }
  return views;
}

/**
 * IMMUNITÉS d'un monstre → chips résolues, sur les trois sources du templet :
 *   - `immuneTooltips` : réfs glossaire affichées en jeu (résolution directe) ;
 *   - `buffImmune` : TYPES de mécanique (`BT_STUN`, `BT_COOL_CHARGE`…) résolus
 *     via `effectByKey` — côté DEBUFF uniquement d'abord (une immunité protège
 *     d'un debuff), y compris la forme SANS CHIFFRES (`BT_COOL2_CHARGE` est la
 *     déclinaison « skill 2 » de `BT_COOL_CHARGE` → « Cooldown Increase », PAS
 *     le buff « Cooldown Reduction ») ; le côté buff n'est qu'un dernier
 *     recours ;
 *   - `statBuffImmune` : baisses de stats (`ST_ATK`…) via la clé composite
 *     `BT_STAT|<ST_X>` du même glossaire.
 * Dédup par effet CANONIQUE (un tooltip et son type pointent le même statut).
 * `unresolved` = types sans entrée au glossaire, à afficher bruts.
 */
export function immunityChipEffects(m: {
  buffImmune?: string[];
  statBuffImmune?: string[];
  immuneTooltips?: string[];
}): { effects: ClientEffect[]; unresolved: string[] } {
  const effects: ClientEffect[] = [];
  const unresolved: string[] = [];
  const seen = new Set<string>();
  const g = G();
  const push = (ref: string): boolean => {
    const canonical = g.effectByTooltip[ref] ?? ref;
    if (!getMergedEffect(canonical)) return false;
    if (!seen.has(canonical)) {
      seen.add(canonical);
      effects.push({ family: 'immunity', category: 'debuff', tooltip: ref });
    }
    return true;
  };
  for (const t of m.immuneTooltips ?? []) if (!push(t)) unresolved.push(t);
  for (const type of m.buffImmune ?? []) {
    // Déclinaisons numérotées (par slot de skill) → même mécanique de base.
    const base = type.replace(/\d+/g, '');
    const id =
      g.effectByKey.debuff[type] ??
      g.effectByKey.debuff[base] ??
      g.effectByKey.buff[type] ??
      g.effectByKey.buff[base];
    if (!id || !push(id)) unresolved.push(type);
  }
  for (const st of m.statBuffImmune ?? []) {
    const key = `BT_STAT|${st}`;
    const id = g.effectByKey.debuff[key] ?? g.effectByKey.buff[key];
    if (!id || !push(id)) unresolved.push(st);
  }
  return { effects, unresolved };
}

/** Création curée référencée par le bonus WG synthétique (id = clé principale). */
const WG_BONUS_KEY = 'WEAKNESS_GAUGE_DAMAGE';

/** Un burst affiche un bonus de jauge de faiblesse (texte du jeu). */
const WG_TEXT = /weakness gauge|\bwg\b/i;

/**
 * Effets SYNTHÉTIQUES du kit burstable : un burst « +N WG damage » (Anarky,
 * Rey…) n'est pas un buff dans les tables — on matérialise la chip via la
 * création curée WEAKNESS_GAUGE_DAMAGE (même règle que le contrôle V2).
 * Le marqueur est le TEXTE du burst, pas le `wgReduce` brut : plusieurs kits
 * (Astei, Christina, Luna) ont un WGReduce de burst supérieur dans les tables
 * sans que le jeu ne l'affiche — vérifié en jeu, la V2 ne les listait pas.
 */
function syntheticBurstEffects(skills: Skill[]): ClientEffect[] {
  const bursts = skills.filter((b) => b.type.startsWith('burst_'));
  // \n littéraux normalisés : « …\nWG » n'offre pas de frontière de mot.
  if (bursts.some((b) => WG_TEXT.test((b.desc?.en ?? '').replace(/\\n/g, ' ')))) {
    return [{ family: 'damage', category: 'buff', tooltip: WG_BONUS_KEY }];
  }
  return [];
}

/**
 * Statuts AFFICHÉS par les niveaux du skill (`BuffToolTip` — « Heavy Strike »)
 * sans être appliqués par un buff : le jeu les montre sur le skill, nous
 * aussi. Rendus comme des buffs (la nature réelle vient du statut résolu).
 * Seuls les VRAIS statuts (icône) passent : les tooltips sans icône (Burst
 * Skill, Chain Start…) sont des textes d'explication de mécanique, pas des
 * chips.
 */
function levelTooltipEffects(
  s: Skill,
  ctx?: { refs: Set<string | undefined>; kinds: Set<string> },
): ClientEffect[] {
  const present = new Set((s.effects ?? []).map((e) => e.tooltip).filter(Boolean));
  // Tooltips du NIVEAU MAX (ce que le jeu affiche au palier consulté), PAS
  // l'union des niveaux : une réf erronée sur un niveau intermédiaire (S1 de
  // 2000053 : le niveau 3 seul pointe « Buff Duration Reduction ») ferait une
  // chip fantôme. Un seul skill du jeu a des tooltips variant entre niveaux —
  // cette coquille précisément.
  const ids = new Set(s.levels[s.levels.length - 1]?.tooltips ?? []);
  // Statut cité comme CONDITION par la desc (« if the caster has a Barrier »,
  // S1 de 2000103) : le jeu référence son tooltip pour lecture, mais le skill
  // ne l'accorde pas — pas une chip.
  const desc = (s.desc?.en ?? '').replace(/\\n/g, ' ');
  const isCondition = (name: string | undefined) =>
    Boolean(name) &&
    new RegExp(
      `(?:if|when)[^.]*\\bha(?:s|ve)\\b[^.]*${name!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
      'i',
    ).test(desc);
  const g = G();
  return [...ids]
    .filter((t) => {
      // Déjà représenté par une chip du kit : même réf (chips de passifs
      // attribués — Pureblood's Dominion, 2000035)…
      if (present.has(t) || ctx?.refs.has(t)) return false;
      const eff = getMergedEffect(g.effectByTooltip[t] ?? t);
      if (!eff?.icon) return false;
      // …ou même TYPE de mécanique sous un statut custom : le générique est
      // une redite (« Execution time! » ⊃ « Increased Damage Taken », 2000020).
      if (ctx && (g.tooltipKinds?.[t] ?? []).some((k) => ctx.kinds.has(k))) return false;
      if (isCondition(eff.name?.en)) return false;
      return true;
    })
    .map((t) => ({ family: 'special', category: 'buff', tooltip: t }));
}

/** Skills « porteurs » hors kit : leurs effets peuvent appartenir à un kit. */
const PASSIVE_SKILL_TYPES = new Set(['class_passive', 'unique_passive']);

/**
 * Kit fonctionnel d'un effet porté par un PASSIF — même règle que le contrôle
 * V2 : `CallerSkillType` (caller), ou convention de nommage du jeu
 * `{charId}_1|2|3_*` / `_chain` / `_backup` (buffs on-death d'Eris…).
 */
function passiveEffectKit(e: RawEffect): string | undefined {
  if (e.caller) return e.caller;
  const b = e.buff ?? '';
  const m = /^\d+_([123])(_|$)/.exec(b);
  if (m) return { '1': 'first', '2': 'second', '3': 'ultimate' }[m[1]];
  if (b.includes('_chain') || b.includes('_backup')) return 'chain_passive';
  return undefined;
}

/**
 * Effets des PASSIFS appartenant fonctionnellement à un kit (caller,
 * convention de slot, ou buff référencé par la DESC d'un skill du kit) —
 * ce sont des chips du skill correspondant, comme les listait la V2.
 */
function passiveKitRaw(skills: Skill[], kit: string, kitSkills: Skill[]): RawEffect[] {
  const raw: RawEffect[] = [];
  for (const p of skills.filter((s) => PASSIVE_SKILL_TYPES.has(s.type))) {
    for (const e of p.effects ?? []) {
      if (isTranscendUpgrade(p, e)) continue;
      const owner = passiveEffectKit(e);
      if (owner === kit) {
        raw.push(e);
        continue;
      }
      if (owner !== undefined || !e.buff) continue;
      const baseId = e.buff.replace(/_\d+$/, '');
      if (kitSkills.some((k) => k.desc?.en.includes(e.buff!) || k.desc?.en.includes(baseId)))
        raw.push(e);
    }
  }
  return raw;
}

function passiveKitEffects(skills: Skill[], kit: string, kitSkills: Skill[]): ClientEffect[] {
  return passiveKitRaw(skills, kit, kitSkills)
    .map(toChipEffect)
    .filter((e): e is ClientEffect => Boolean(e));
}

/**
 * Effets à afficher sur la CARTE d'un skill : effets appliqués + effets de
 * PASSIFS rattachés à ce kit + statuts affichés par les niveaux ; le skill
 * « burstable » hérite en plus des buffs/debuffs de ses déclinaisons
 * burst_1..3 (même skill côté joueur) et des effets synthétiques (bonus WG).
 */
export function cardEffects(
  skills: Skill[],
  s: Skill,
  // Curation substituable (ADMIN : l'éditeur passe `{}` pour les positions
  // « règles pures », et sa propre copie en prévisualisation).
  curated: CharacterKitCuration = characterCurated(),
): ClientEffect[] | undefined {
  // VARIANTES du même type (formes/copies — Luna 2000119/120 : White Night ET
  // Polar Night) : l'union de leurs effets = ce que le kit fait, quelle que
  // soit la forme. La carte affichée reste la variante choisie par mainSkills.
  const variants = skills.filter((k) => k.type === s.type);
  const own = s.burstAP?.length
    ? [...variants, ...skills.filter((b) => b.type.startsWith('burst_'))]
    : variants;
  // Dédup : plusieurs buffs techniques d'un même skill peuvent pointer le
  // même statut (S2 de Demiurge Luna : 2 buffs → tooltip « White Night »).
  const chips = dedupList([
    ...own.flatMap((k) => toClientEffects(k) ?? []),
    ...passiveKitEffects(skills, s.type, [s]),
  ]);
  // Réfs et types de mécanique déjà représentés par une chip — dédup des
  // statuts de niveau (mêmes règles que le contrôle V2).
  const rawChipped = [
    ...own.flatMap((k) => (k.effects ?? []).filter((e) => !isTranscendUpgrade(k, e))),
    ...passiveKitRaw(skills, s.type, [s]),
  ].filter((e) => toChipEffect(e));
  const ctx = {
    refs: new Set(chips.map((c) => c.tooltip)),
    kinds: new Set(rawChipped.map(kindOf)),
  };
  const merged = applyCardCuration(
    [
      ...chips,
      ...levelTooltipEffects(s, ctx),
      ...(s.burstAP?.length ? syntheticBurstEffects(skills) : []),
    ],
    s.id,
    curated,
  );
  return merged.length ? merged : undefined;
}

/** Une carte de burst, données prêtes à rendre (texte résolu par le caller). */
export interface BurstView {
  level: 1 | 2 | 3;
  cost?: number;
  desc?: string;
  vars?: Skill['levels'][number]['vars'];
}

/** Bursts 1..3 : desc localisée + vars du dernier palier + coût AP du burstable. */
export function buildBurstViews(skills: Skill[], lang: Lang): BurstView[] {
  const burstable = mainSkills(skills).find((s) => s.burstAP?.length);
  // Un seul burst par palier : les persos à FORMES portent le kit jumeau
  // (textes identiques) — même règle que mainSkills (variante la plus complète).
  const byType = new Map<string, Skill>();
  for (const b of skills.filter((s) => s.type.startsWith('burst_'))) {
    const prev = byType.get(b.type);
    if (!prev || b.levels.length > prev.levels.length) byType.set(b.type, b);
  }
  return [...byType.values()]
    .sort((a, b) => a.type.localeCompare(b.type))
    .map((b, i) => {
      const last = b.levels[b.levels.length - 1];
      return {
        level: (i + 1) as 1 | 2 | 3,
        cost: burstable?.burstAP?.[i],
        desc: b.desc ? lRec(b.desc, lang) : undefined,
        vars: last?.vars,
      };
    });
}

/** Vue chaîne & duo complète, pré-localisée (hors icône, qui dépend du perso). */
export interface ChainView {
  name: string;
  maxLevel: number;
  levels: ChainLevel[];
  chainDesc: string;
  dualDesc: string;
  chainEffects: ClientEffect[];
  dualEffects: ClientEffect[];
}

/** Dédoublonne une liste d'effets client (par réf + famille + stat). */
function dedupList(effects: ClientEffect[]): ClientEffect[] {
  const out: ClientEffect[] = [];
  const seen = new Set<string>();
  for (const e of effects) {
    const key = `${e.tooltip ?? e.label ?? ''}|${e.family}|${e.stat ?? ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(e);
  }
  return out;
}

/** Dédoublonne des effets venus de plusieurs skills techniques (aerial/ground…). */
function dedupEffects(list: Skill[]): ClientEffect[] {
  return dedupList(list.flatMap((s) => toClientEffects(s) ?? []));
}

export function buildChainView(
  skills: Skill[],
  lang: Lang,
  curated: CharacterKitCuration = characterCurated(),
): ChainView | null {
  const cp = skills.find((s) => s.type === 'chain_passive');
  if (!cp) return null;
  const strikes = skills.filter((s) => s.type.startsWith('strike_'));
  const backups = skills.filter((s) => s.type.startsWith('backup_'));

  const levels: ChainLevel[] = Array.from({ length: cp.maxLevel }, (_, i) => {
    const lvl = i + 1;
    const vars: NonNullable<ChainLevel['vars']> = {};
    for (const s of [cp, ...strikes, ...backups]) Object.assign(vars, levelAt(s.levels, lvl)?.vars);
    const wgOf = (list: Skill[]) => {
      const vals = list
        .map((s) => levelAt(s.levels, lvl)?.wgReduce)
        .filter((v): v is number => v !== undefined);
      return vals.length ? Math.max(...vals) : undefined;
    };
    return {
      level: lvl,
      vars,
      chainWgr: wgOf(strikes),
      dualWgr: wgOf(backups),
      upgrades: cp.levels
        .find((l) => l.level === lvl)
        ?.upgrades?.map((u) => lRec(u, lang))
        .filter(Boolean),
    };
  });

  const { chain, dual } = cp.desc ? splitChainDual(lRec(cp.desc, lang)) : { chain: '', dual: '' };
  // Effets de PASSIFS rattachés à la chaîne/duo (convention `_chain`/`_backup`),
  // répartis entre les deux moitiés par leur id de buff.
  const passive = passiveKitEffects(skills, 'chain_passive', [cp, ...strikes, ...backups]);
  const chainChips = dedupList([
    ...dedupEffects([cp, ...strikes]),
    ...passive.filter((e) => !e.buff?.includes('_backup')),
  ]);
  const dualChips = dedupList([
    ...dedupEffects(backups),
    ...passive.filter((e) => e.buff?.includes('_backup')),
  ]);
  // Statuts affichés par les NIVEAUX du chain passive (« Heavy Strike ») — le
  // jeu les montre sur la chaîne, la V2 les listait ; mêmes dédups que les
  // cartes de skills (réfs + types des chips des deux moitiés).
  const rawChipped = [cp, ...strikes, ...backups]
    .flatMap((k) => (k.effects ?? []).filter((e) => !isTranscendUpgrade(k, e)))
    .concat(passiveKitRaw(skills, 'chain_passive', [cp, ...strikes, ...backups]))
    .filter((e) => toChipEffect(e));
  const levelChips = levelTooltipEffects(cp, {
    refs: new Set([...chainChips, ...dualChips].map((c) => c.tooltip)),
    kinds: new Set(rawChipped.map(kindOf)),
  });
  return {
    name: lRec(cp.name, lang),
    maxLevel: cp.maxLevel,
    levels,
    chainDesc: chain,
    dualDesc: dual,
    // Curation locale : la chaîne porte l'id du chain_passive, le duo son
    // suffixe dédié (même carte affichée, deux groupes de chips distincts).
    chainEffects: applyCardCuration([...chainChips, ...levelChips], cp.id, curated),
    dualEffects: applyCardCuration(dualChips, cp.id + DUAL_CARD_SUFFIX, curated),
  };
}
