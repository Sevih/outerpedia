'use client';

/**
 * Damage Calculator — client, PHASE UI SEULE.
 *
 * Tout ce qui s'affiche est RÉEL (roster, kits, passifs, presets de cible) mais
 * AUCUN dégât n'est calculé : le moteur `src/lib/damage` ne sera branché
 * qu'avec les extracteurs damage (docs/specs/damage-report-inputs.md § 6). La
 * colonne Rapport rend la mise en page finale avec des valeurs « — » et un
 * bandeau l'assumant. Aucune donnée n'est localisée ici : tout vient du wrapper
 * — à UNE exception près : les DESCS du popover de skill (SkillTip.tsx), qui
 * arrivent en dictionnaires complets d'une projection chargée à la demande et
 * se localisent au rendu (`lang`).
 *
 * Décisions produit (Sevih, 26/07/2026) :
 *   - stats SAISIES depuis la fiche du jeu → l'UI ne montre que ce que la fiche
 *     ne porte pas (sets de combat, arme/accessoire, EE, Rogue's Charm, quirks) ;
 *   - niveaux de skill INDÉPENDANTS (S1/S2/S3, chain+dual partagés) ;
 *   - quirks de COMPTE : réglage persistant (localStorage) sur les arbres réels ;
 *   - 4 unités max sur le terrain (attaquant + 3 alliés, cibles 1–4).
 */

import { Fragment, useMemo, useRef, useState, useEffect, type ReactNode } from 'react';
import LZString from 'lz-string';
import { img, ELEMENT_ORDER, transcendStarRow } from '@/lib/images';
import { useStoredState, type StoreSpec } from '@/lib/client-storage';
import { EquipmentIcon } from '@/components/equipment/EquipmentIcon';
import { EffectIconTile } from '@/components/character/EffectChips';
import { SearchField } from '@/components/character/filters/FilterAtoms';
import { FilterPill } from '@/components/character/filters/FilterPill';
import { GameText } from '@/components/ui/GameText';
import { Thumbnail } from '@/components/ui/Thumbnail';
import { SkillIconTip } from './SkillTip';
import type { Lang } from '@/lib/i18n/config';
import {
  buildInputsFromZ,
  flattenReport,
  type CalculatorUrlState as UrlState,
} from '@/lib/damage/scenario';
import {
  buildDamageReport,
  distinctDots,
  elementOf,
  FX_CHIP_TOOLTIPS,
  sheetSlugOfStat,
  type DamageData,
  type DamageReportResult,
} from '@/lib/damage/inputs';
import { BASE_AMOUNT_STATS, passiveConditionMet } from '@/lib/damage/passives';
import { conditionBuffRef } from '@/lib/damage/gear';
import { ENGINE_GAME_VERSION, type DamageBranch, type DamageFixture } from '@/lib/damage/harness';
import dynamic from 'next/dynamic';

/**
 * Harnais de capture OPT-IN (build de dev, ou `?dev=1` en prod) : chargé à la
 * DEMANDE — ses ~700 lignes sortent du bundle initial que télécharge tout
 * visiteur de la page (audit D2, 07/08/2026 ; seule occurrence de
 * `next/dynamic` du projet — ailleurs le découpage par route suffit, ici le
 * composant est opt-in DANS la route).
 */
const DebugHarness = dynamic(() => import('./DebugHarness').then((m) => m.DebugHarness));

// ── Contrats wrapper → client ──────────────────────────────────────────────

/** Palier de transcendance (forme compacte de `TranscendTierView`) — la rangée
 *  d'étoiles se reconstruit via `transcendStarRow` de `@/lib/images`. */
export interface DcTranscendTier {
  label: string;
  star: number;
  color: string;
}

export interface DcChar {
  id: string;
  label: string;
  element: string;
  cls: string;
  rarity: number;
  /** Stats de la fiche à SAISIR pour ce perso (slugs, ordre de la fiche). */
  statKeys: string[];
  /** Paliers de transcendance réels (barème de la rareté ou override). */
  transcend: DcTranscendTier[];
}

export interface DcSkillRow {
  slot: string;
  /** Id du skill dans le catalogue des tables — clé du popover de desc
   *  (catalogue chargé à la demande, cf. `skillsDb`). */
  id: string;
  name: string;
  iconSrc?: string;
  offensive: boolean;
  /** Multi-cible (RangeType all/double) — conditionne « cibles touchées ». */
  aoe?: boolean;
  maxLevel: number;
  /** Ids des déclinaisons burst_1..3 — portés par le SEUL skill burstable du
   *  kit ; leurs descs s'affichent en vert/bleu/rouge dans le popover. */
  burstIds?: string[];
}

export interface DcGear {
  slug: string;
  label: string;
  icon: string;
  grade: string;
  /** Étoiles du haut de famille (tuile « comme partout »). */
  star: number;
  /** Icône d'effet du passif, posée en overlay sur la tuile. */
  overlayIcon?: string;
  classLimits: string[];
  /** Texte du passif à T0..T4. */
  tiers: string[];
  /** Variantes par classe (Briareos/Gorgon) — remplace `tiers` si la classe matche. */
  classTiers?: Record<string, string[]>;
  /** Groupes d'options UNIQUES des tables damage (moteur § 15). */
  dmgGroups?: string[];
  /** Groupes par classe quand les variantes diffèrent (Briareos/Gorgon). */
  dmgGroupsByClass?: Record<string, string[]>;
}

export interface DcSet {
  id: string;
  label: string;
  icon: string;
  /** Texte 2P par état (index 0 = base, 1 = enchanté) — null si pas d'effet 2P. */
  p2: (string | null)[];
  p4: (string | null)[];
  /** Effet fonction des PV manquants → l'UI demande les PV actuels. */
  hpScaled?: boolean;
}

/** Référence d'effet résolue (glossaire du jeu) — tag inline : icône + nom,
 *  desc en tooltip. Sert les conditions `*_HAS_BUFF*` (« Target has <tag> »)
 *  et les lignes DoT du Résultat. Clés = ids de tooltip (cond-names.ts). */
export interface DcEffectRef {
  name: string;
  /** Sprite IG_Buff_* (rendu EffectIconTile). */
  icon: string;
  /** Desc officielle du glossaire — tooltip du tag. */
  desc: string;
  debuff: boolean;
}

/** Buff/débuff de scénario STANDARDISÉ (magnitude fixe du glossaire du jeu). */
export interface DcBuffOption {
  key: string;
  name: string;
  /** Desc officielle (porte la magnitude : « Increases Attack by 30%. »). */
  desc: string;
  /** Sprite IG_Buff_* (rendu EffectIconTile). */
  icon: string;
  debuff: boolean;
  /** Slug de la fiche : le chip n'apparaît que si pertinent pour l'attaquant. */
  stat?: string;
}

export interface DcTalisman {
  slug: string;
  label: string;
  icon: string;
  grade: string;
  star: number;
  /** Icône d'effet du passif, posée en overlay sur la tuile. */
  overlayIcon?: string;
  text: string | null;
  /** Groupes d'options UNIQUES des tables damage (moteur § 15). */
  dmgGroups?: string[];
  dmgGroupsByClass?: Record<string, string[]>;
}

export interface DcEERow {
  /** Niveau d'objet de déblocage du palier (1 = base, 10 = +10). */
  level: number;
  /** Vrai si ce palier S'AJOUTE au précédent (sinon il le remplace). */
  isAdd: boolean;
  /** Texte rempli, balises <color> du jeu conservées (rendu GameText). */
  html: string;
}

export interface DcEE {
  name: string;
  src: string;
  grade: string;
  star: number;
  rows: DcEERow[];
  /** Main « dégâts vs élément » (absente de la fiche perso) : montant en ‰
   *  par niveau d'enchant (index 0 = +0 … 10 = +10). */
  dmgMain?: { label: string; levels: number[] };
}

export interface DcSpawn {
  /** Absent quand le jeu ne nomme pas le spawn (repli « Fight N » à l'affichage). */
  label?: string;
  level: number;
  /** Stats défensives EFFECTIVES au spawn (niveau + adv + bossHp appliqués).
   *  Un champ ABSENT vaut 0 — les zéros sont omis du payload. */
  stats: { hp?: number; def?: number; dmgRed?: number; cdmgRed?: number };
}

/** Passif de BOSS (lib passives.ts) — chip AUTO de la section buff/débuff :
 *  posé par le boss lui-même, jamais togglable (en jeu il est permanent et
 *  indélébile). La condition élémentaire brute est évaluée CLIENT contre
 *  l'attaquant courant (même relation § 6 que le moteur). */
export interface DcBossPassive {
  /** Nom localisé du passif porteur (« Starving Devil », « Enraged »). */
  name: string;
  /** Qui le subit : l'équipe du joueur (attacker) ou le boss (target). */
  side: 'attacker' | 'target';
  /** Libellé PRÊT : stat localisée + valeur signée (« CRIT DMG −85% »). */
  label: string;
  /** Enum `ST_*` du BT_STAT — côté attaquant, la chip est TUE quand la stat
   *  ne pèse aucun MONTANT pour le kit courant (`attackerAmountStats`). */
  stat?: string;
  /** `ATTACKER_ELEMENT_WIN/EQUAL/LOSE` ou `OWNER_RAGE` — absent = toujours
   *  actif (hors gate d'enrage). */
  condition?: string;
  /** Libellé LISIBLE de la condition (localisé serveur) — affiché sur la chip
   *  pour dire POURQUOI elle est active ou barrée (Sevih 17/08/2026). */
  cond?: string;
  /** Buff du skill d'ENRAGE du boss — actif seulement coche « Enragé ». */
  rage?: true;
}

export interface DcTarget {
  id: string;
  /** Libellé de MODE localisé (glossaire du jeu) — premier niveau du picker. */
  mode: string;
  /** Slug de mode BRUT d'encounters (`normal`, `raid_1`…) — décide le buff
   *  de guilde § 16.2, jamais parsé du libellé localisé. */
  modeSlug: string;
  /** CASCADE de selects sous le mode quand la donnée la porte (Saison puis
   *  Épisode en histoire, ligue de world boss, phase de guild raid…). */
  path?: string[];
  /** Entrée de la liste : le donjon (« Floor N » en infiltration). */
  label: string;
  /** Classe du boss (overlay de portrait, comme les persos). */
  cls: string;
  /** Boss de la vague principale. */
  name: string;
  /** Nom BRUT d'icône de monstre — l'URL est dérivée client (`monsterIcon`). */
  icon: string;
  element: string;
  /** Slug de `CHARACTER_TYPE` — choisit le FOND de la vignette. */
  type: string;
  /** Rareté (BasicStar) — compte les ÉTOILES, pas le fond (axes distincts). */
  rarity: number;
  spawns: DcSpawn[];
  /**
   * LIGNE de guild raid (`ref.group`) : chaque stage est un donjon (et un
   * monstre) distinct, mais c'est LE MÊME combat — le picker replie la ligne
   * en une carte et le panneau cible propose un sélecteur de stage qui
   * bascule d'une entrée à l'autre (Sevih 17/08/2026, comme la Singularité).
   * Le dernier stage du main boss porte en plus les stages d'overgrade dans
   * ses `spawns` (jusqu'au grade 100, borne du jeu).
   */
  line?: string;
  /** N° de stage templeté de l'entrée dans sa ligne (guild raid). */
  stage?: number;
  /** Échelle par RANGS (world boss, Singularité — paliers de dégâts cumulés
   *  PENDANT le combat) : le sélecteur du panneau titre « Rank », pas
   *  « Stage ». */
  ranked?: boolean;
  /** Le boss a un skill d'ENRAGE (`SKT_RAGE_ENTER*`) — la coche « Enragé »
   *  du contexte n'apparaît que là. */
  hasRage?: boolean;
  /** Passifs de boss à impact sur les dégâts — chips auto, jamais togglables. */
  passives?: DcBossPassive[];
  /**
   * Navigation du picker VISUEL de l'histoire (modes story/origin story,
   * demande Sevih 06/08/2026) : toggle Normal/Hard → saisons → épisodes →
   * stages → vagues. Absent hors histoire — ces modes gardent la cascade de
   * selects en attendant leur propre visuel.
   */
  story?: {
    /** `story` = la story courante (refonte) ; `origin` = l'Origin Story. */
    family: 'story' | 'origin';
    hard: boolean;
    season: number;
    episode: number;
    /** Titre localisé de l'épisode (la zone : « Outer City »). */
    episodeName: string;
    /** N° du stage DANS l'épisode (« 5-13 » = épisode 5, stage 13) — absent
     *  sur l'intro sans clé du jeu (elle ouvre l'épisode). */
    stage?: number;
    /**
     * Apparitions du monstre dans le stage, une entrée PAR VAGUE (1-based) :
     * `count` = exemplaires engagés dans cette vague (absent = 1 — story 1-1
     * aligne 2 × le même loup), `level` = niveau à cette vague.
     */
    waves: { wave: number; level: number; count?: number }[];
    role: 'boss' | 'add';
  };
}

export interface DcStatField {
  key: string;
  label: string;
  percent: boolean;
}

/** Nœud de quirk à IMPACT (les hausses de stats pures sont déjà dans la fiche). */
export interface DcQuirkNode {
  id: number;
  iconSrc: string;
  color: string;
  name: string;
  maxLevel: number;
  /** Texte de l'effet par niveau (index 0 = Lv1), balises <color> conservées. */
  texts: string[];
}

export interface DcQuirkGroup {
  key: string;
  label: string;
  nodes: DcQuirkNode[];
}

export interface DcLabels {
  search: string;
  select: string;
  noMatches: string;
  clear: string;
  panels: { attacker: string; target: string; team: string; result: string };
  title: string;
  pick: string;
  affinity: string;
  skills: { title: string; dmg: string; support: string };
  settings: {
    title: string;
    subtitle: string;
    quirks: string;
    codex: string;
    guild: string;
    premium: string;
    reset: string;
    activateAll: string;
  };
  equipment: {
    title: string;
    sets: string;
    weapon: string;
    accessory: string;
    ee: string;
    eeNone: string;
    noPassive: string;
    pickWeapon: string;
    pickAccessory: string;
    talisman: string;
    lv0: string;
    lv10: string;
    p2: string;
    p4: string;
  };
  stats: { title: string; sheetNote: string; final: string; finalNote: string };
  target: {
    preset: string;
    manual: string;
    element: string;
    copyFromSelected: string;
    lv: string;
    stage: string;
    /** Titre du sélecteur des échelles par RANGS (world boss, Singularité). */
    rank: string;
    fight: string;
    bossFlag: string;
    breakFlag: string;
    guildBuffFlag: string;
    titleBuffFlag: string;
    /** Coche « boss enragé » (buffs du skill d'enrage actifs — z `en`). */
    enrageFlag: string;
    /** Picker visuel story : familles (les 4 modes repliés en 2 entrées),
     *  toggle de difficulté, navigation et vagues. */
    familyStory: string;
    familyOrigin: string;
    diffNormal: string;
    diffHard: string;
    back: string;
    /** Gabarit « Saison {n} ». */
    seasonTpl: string;
    episode: string;
    /** Gabarit « Vague {n} ». */
    waveTpl: string;
    /** Gabarit « {n} monstres » — cartes de modes de l'accueil du picker. */
    monstersTpl: string;
  };
  toolbar: { reset: string; copy: string; copied: string };
  context: {
    title: string;
    targetsHit: string;
    attackerHp: string;
    targetHp: string;
    /** Mécaniques PERSO (conditions d'état de combat — entrées `stateful`). */
    mechanics: string;
    mechanicsHint: string;
    /** Libellés LISIBLES des conditions (enum brut → gabarit localisé,
     *  `{n}` = seuil — HPRATE en %). Partagés mécaniques perso / chips boss. */
    conds: Record<string, string>;
    /** Compteurs § 9.1 (« ×N buffs/débuffs ») — steppers visibles seulement
     *  quand un passif du rapport LIT la famille correspondante. */
    counters: string;
    countersHint: string;
    /** Procs dynamiques déclarables — kit/EE/quirks du porteur + alliés
     *  (steppers de stacks, z `ab`). */
    stackBuffs: string;
    stackBuffsHint: string;
    /** « dégâts » — famille BT_DMG (§ 9.1) sans stat ni tooltip. */
    dmgWord: string;
    /** Noms de CLASSES localisés par enum `CCT_*` (cibles `MY_TEAM_<CLASSE>`
     *  des procs — « Striker dégâts infligés +20 % »). */
    classNames: Record<string, string>;
    /** Gabarit « (max {n} stacks) » du plafond d'un proc à stacks. */
    stackMax: string;
    ownBuffs: string;
    ownDebuffs: string;
    teamBuffs: string;
    tgtBuffs: string;
    tgtDebuffs: string;
    /** Gabarits des conditions à buff RÉFÉRENCÉ (placeholder `{buff}` → tag
     *  inline icône + nom) — « Target has {buff} » (Sevih 22/08/2026). */
    condsRef: Record<string, string>;
  };
  team: { emptySlot: string; eeOwned: string; eePlus: string };
  buffs: {
    fromKits: string;
    kitsSoon: string;
    awaitPick: string;
    atkBuff: string;
    atkDebuff: string;
    tgtBuff: string;
    tgtDebuff: string;
    bossPassive: string;
  };
  report: {
    empty: string;
    wip: string;
    branchesNote: string;
    normal: string;
    critical: string;
    miss: string;
    supportSkills: string;
    /** Ligne dont la chaîne de hits n'est pas extraite (§ 12.4) — placeholder. */
    unsupported: string;
    unsupportedHint: string;
    loading: string;
    tablesError: string;
    /** Lignes DoT (§ 11) — pied de la table Résultat : effet + tick. */
    dot: string;
    dotTick: string;
    dotApply: string;
  };
}

interface Props {
  chars: DcChar[];
  kits: Record<string, DcSkillRow[]>;
  weapons: DcGear[];
  amulets: DcGear[];
  sets: DcSet[];
  talismans: DcTalisman[];
  ees: Record<string, DcEE>;
  targets: DcTarget[];
  statFields: DcStatField[];
  /** Stats défensives de la CIBLE (affichage preset + saisie manuelle). */
  targetStatFields: DcStatField[];
  /** Main stats de talisman proposées pour les ALLIÉS (slug + libellé). */
  talismanMains: { key: string; label: string }[];
  /** Buffs/débuffs de scénario standardisés à impact (chips à bascule),
   *  par côté ET par sens : buffs/débuffs du lanceur, buffs/débuffs de la cible. */
  buffOptions: {
    atkBuff: DcBuffOption[];
    atkDebuff: DcBuffOption[];
    tgtBuff: DcBuffOption[];
    tgtDebuff: DcBuffOption[];
  };
  quirks: DcQuirkGroup[];
  /** Courbe du Codex, indexée PAR NIVEAU ([0] = niveau 0, [1..11] = paliers) :
   *  taux ‰ (ATK/DEF/HP) sur la stat de BASE. */
  codexTiers: { atk: number; def: number; hp: number }[];
  /** `% de PV max` du buff de guilde par NIVEAU (index 0 = sans guilde = 0) —
   *  résolu de la donnée damage (growth.guildMaxHp, spec § 16.2). */
  guildTiers: number[];
  /** `% de PV max` du buff de titre « Premium Body » (growth.titleMaxHp). */
  titleHpPct: number;
  /** Références d'effets LOCALISÉES (nom + icône + desc, glossaire du jeu),
   *  clés = ids de tooltip : buffs référencés par les conditions `*HAS_BUFF*`
   *  (tag inline des mécaniques) ET DoT des skills (lignes du Résultat).
   *  Id absent = sans nom dans le jeu (le client montre l'id brut). */
  effectRefs: Record<string, DcEffectRef>;
  /** Langue rendue — localise les DESCS du catalogue de skills chargé à la
   *  demande (seul texte que le client localise : la donnée arrive en
   *  dictionnaires complets, tout le reste vient pré-localisé du wrapper). */
  lang: Lang;
  labels: DcLabels;
}

/** Niveaux de quirks POSSÉDÉS par nœud — réglage de compte, partagé entre
 *  sessions (et demain entre outils) via localStorage. */
const QUIRKS_STORE: StoreSpec<Record<number, number>> = {
  key: 'outerpedia:damage-calculator:quirks',
  version: 1,
  fallback: {},
};

/** Niveau du Codex (archive) POSSÉDÉ — réglage de COMPTE, comme les quirks :
 *  c'est un compteur de complétions global, pas un réglage par perso. */
const CODEX_STORE: StoreSpec<number> = {
  key: 'outerpedia:damage-calculator:codex',
  version: 1,
  fallback: 0,
};

/** Niveau de GUILDE (0 = sans guilde) — réglage de COMPTE : son buff MAX_HP
 *  (spec formule § 16.2) ne joue que dans certains modes, décidés par la
 *  cible (preset) ou une coche (manuel). */
const GUILD_STORE: StoreSpec<number> = {
  key: 'outerpedia:damage-calculator:guild',
  version: 1,
  fallback: 0,
};

/** Buff de TITRE « Premium Body » (+5 % PV, § 16.2) — réglage de COMPTE,
 *  accordé côté serveur (pass) : introuvable en jeu par Sevih (05/08/2026),
 *  on l'expose en settings et les fixtures diront s'il matche quelque part. */
const PREMIUM_STORE: StoreSpec<boolean> = {
  key: 'outerpedia:damage-calculator:premium-hp',
  version: 1,
  fallback: false,
};

// ── Cycle de capture des scénarios (harnais — libellés en dur, exemption
// harnais § 5). La saisie « en jeu » vit DANS la table Résultat, le cycle
// save/load au-dessus du panneau Debug (Sevih 05/08/2026).

/** Build de dev : le harnais est TOUJOURS actif. En production il reste caché
 *  sauf opt-in par URL `?dev=1` (avant `z`) — les beta testeurs capturent des
 *  scénarios et envoient le JSON ⧉ à Sevih (06/08/2026). Le gate est donc un
 *  ÉTAT runtime, plus un inline de build : le code du harnais part en prod. */
const DEV_BUILD = process.env.NODE_ENV !== 'production';

/** Un scénario sauvegardé = UNE ligne de dégâts (Sevih 05/08/2026) : le `+`
 *  d'une cellule de la table Résultat fige le `z` courant (TOUS les réglages
 *  de l'UI y sont), les réglages de compte, la ligne (slot × branche) et la
 *  valeur constatée EN JEU. Le calculé n'est JAMAIS stocké : il est rejoué à
 *  l'affichage — un moteur qui bouge se voit immédiatement dans le Δ. */
interface SavedScenario {
  /** Identité d'affichage figée à la sauvegarde (localisée à ce moment-là). */
  atk: string;
  tgt: string;
  /** Clé de ligne `flattenReport` (`S1`, `S2b1`, `#chaîne`…). */
  slot: string;
  branch: DamageBranch;
  /** Dégâts constatés EN JEU. */
  real: number;
  z: string;
  codex?: number;
  guild?: number;
  premium?: boolean;
  /** Quirks du compte à la capture (nœud → niveau, seuls les > 0). */
  quirks?: Record<string, number>;
  gameVersion: string;
  savedAt: string;
}

/** Scénarios sauvegardés — dev-only mais PERSISTANTS (les captures se font en
 *  plusieurs sessions). v2 : une ligne par scénario (v1 = fixture complète,
 *  format abandonné → repart à vide). */
const SCENARIOS_STORE: StoreSpec<SavedScenario[]> = {
  key: 'outerpedia:damage-calculator:debug-scenarios',
  version: 2,
  fallback: [],
};

/** Clé d'upsert d'un scénario : même état d'UI + même ligne = même scénario. */
const scnKey = (s: Pick<SavedScenario, 'z' | 'slot' | 'branch'>): string =>
  `${s.z}|${s.slot}|${s.branch}`;

/** Tolérance d'affichage du Δ (± %) — même défaut que fixtures.test.ts. */
const DEFAULT_TOLERANCE = 0.5;

// ── Briques d'affichage ────────────────────────────────────────────────────

const vars = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? `{${key}}`));

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-content-subtle text-[10px] font-bold tracking-[0.14em] uppercase">
      {children}
    </span>
  );
}

/** Tag INLINE d'un effet du glossaire : icône + nom, desc officielle en
 *  tooltip — le même rendu pour les conditions (« Target has <tag> ») et les
 *  lignes DoT du Résultat (Sevih 22/08/2026). */
function EffectRefTag({ r }: { r: DcEffectRef }) {
  return (
    <span
      title={r.desc || r.name}
      className="border-line-subtle bg-surface-sunken/70 text-content inline-flex cursor-help items-center gap-1 rounded border px-1 py-0.5"
    >
      <EffectIconTile icon={r.icon} isDebuff={r.debuff} className="h-3.5 w-3.5" />
      <span>{r.name}</span>
    </span>
  );
}

function Card({
  title,
  right,
  children,
}: {
  title: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="border-line-subtle bg-surface-raised/60 space-y-3 rounded-xl border p-3.5">
      <div className="flex items-center gap-2">
        <Eyebrow>{title}</Eyebrow>
        <span className="flex-1" />
        {right}
      </div>
      {children}
    </section>
  );
}

function Stepper({
  value,
  min,
  max,
  onChange,
  format,
  className,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  /** Classes de POSITION dans le conteneur (ml-auto, shrink-0…). */
  className?: string;
}) {
  const btn =
    'text-content-muted hover:text-accent h-6 w-5 cursor-pointer text-sm leading-none transition';
  return (
    <span
      className={`border-line-subtle bg-surface-sunken/70 inline-flex items-center overflow-hidden rounded-md border ${className ?? ''}`}
    >
      <button
        type="button"
        className={`${btn} border-line-subtle border-r`}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        −
      </button>
      <span className="text-content min-w-9 px-1 text-center font-mono text-xs font-bold tabular-nums">
        {format ? format(value) : value}
      </span>
      <button
        type="button"
        className={`${btn} border-line-subtle border-l`}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        +
      </button>
    </span>
  );
}

/** Dropdown générique : bouton d'ancrage + recherche + liste déroulante. */
/**
 * Popup de sélection (façon pool du tier-list-maker, mais en modale) :
 * voile plein écran, panneau centré, Échap / clic hors panneau pour fermer.
 * Le contenu (recherche, filtres, grille de tuiles) vient de l'appelant.
 */
function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      className="bg-scrim/60 fixed inset-0 z-100 flex items-center justify-center p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="border-line-subtle bg-surface-raised flex max-h-[85dvh] w-full max-w-2xl flex-col rounded-xl border shadow-2xl">
        <div className="border-line-subtle flex items-center gap-2 border-b px-3.5 py-2.5">
          <Eyebrow>{title}</Eyebrow>
          <span className="flex-1" />
          <button
            type="button"
            className="text-content-subtle hover:text-danger cursor-pointer text-sm"
            onClick={onClose}
            aria-label="✕"
          >
            ✕
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3.5">{children}</div>
      </div>
    </div>
  );
}

/** Classes du jeu, dans l'ordre des filtres (mêmes pastilles que /characters). */
const CLASS_ORDER = ['defender', 'striker', 'ranger', 'mage', 'healer'];

/**
 * Case carrée de slot (façon jeu) : contenu quand c'est équipé, « ? » sinon —
 * cliquer ouvre la modale de choix, ✕ en coin pour vider (demande Sevih
 * 27/07/2026, en remplacement des ancres en forme de select).
 */
function SlotTile({
  children,
  onClick,
  onClear,
  clearTitle,
  title,
  large,
}: {
  /** Contenu équipé (icône) — absent = case vide « ? ». */
  children?: React.ReactNode;
  onClick: () => void;
  onClear?: () => void;
  clearTitle?: string;
  title?: string;
  /** 64px (portraits perso/cible — demande Sevih 27/07/2026) vs 48px (gear). */
  large?: boolean;
}) {
  return (
    <span className="relative inline-block shrink-0">
      <button
        type="button"
        title={title}
        onClick={onClick}
        // PAS d'`overflow-hidden` : les portraits posés ici sont des vignettes
        // du jeu, dont l'icône d'élément sort volontairement du cadre (le prefab
        // l'ancre en dehors). Rogner la recadrait en biais.
        className={`border-line-subtle bg-surface-sunken/70 hover:border-accent grid cursor-pointer place-items-center rounded-lg border transition ${
          large ? 'h-16 w-16' : 'h-12 w-12'
        }`}
      >
        {children ?? <span className="text-content-subtle text-lg font-bold">?</span>}
      </button>
      {children && onClear && (
        <button
          type="button"
          className="border-line-subtle bg-surface-overlay text-content-subtle hover:text-danger absolute -top-1.5 -right-1.5 grid h-4.5 w-4.5 cursor-pointer place-items-center rounded-full border text-[9px] leading-none"
          onClick={onClear}
          title={clearTitle}
        >
          ✕
        </button>
      )}
    </span>
  );
}

/**
 * Portrait de MONSTRE — LE MÊME rendu partout (cible sélectionnée, listes du
 * picker, vagues du browser story — demande Sevih 06/08/2026).
 *
 * Ce n'est plus qu'un adaptateur : la vignette vient de `Thumbnail`, transcrite
 * du prefab `uimonsterthumbnail`. Ce qu'il portait avant à l'œil est parti avec
 * lui — un fond déduit de la RARETÉ (le jeu le déduit du TYPE, cf. `DcTarget`),
 * une vignette à 92 % du fond au lieu de 122/128, un élément et une classe à
 * 34 % l'un sous l'autre, et un niveau en pastille alors que le jeu l'écrit à nu.
 */
function MonsterPortrait({
  tg,
  level,
  className,
}: {
  tg: Pick<DcTarget, 'icon' | 'element' | 'cls' | 'type' | 'rarity' | 'name' | 'story'>;
  level?: number;
  className: string;
}) {
  return (
    <Thumbnail
      kind="monster"
      icon={tg.icon}
      type={tg.type}
      stars={tg.rarity}
      element={tg.element}
      cls={tg.cls}
      level={level}
      name={tg.name}
      // Hors histoire les presets sont tous des boss ; en story le rôle vient
      // de la donnée (les renforts n'ont pas la bannière boss).
      boss={!tg.story || tg.story.role === 'boss'}
      className={className}
    />
  );
}

const ROW_CLASS =
  'hover:bg-surface-raised/80 flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition';
const SELECT_CLASS =
  'border-line-subtle bg-surface-sunken/70 text-content focus:border-accent h-8 w-full cursor-pointer rounded-lg border px-2 text-xs focus:outline-none';

function NoMatches({ label }: { label: string }) {
  return <p className="text-content-subtle px-2 py-3 text-center text-xs">{label}</p>;
}

/**
 * Portrait de PERSO du calculateur — l'autre habillage de la même vignette.
 * Adaptateur symétrique de `MonsterPortrait` : `DcChar` porte déjà tout ce que
 * le prefab demande.
 */
function CharPortrait({ c, className }: { c: DcChar; className: string }) {
  return (
    <Thumbnail
      kind="character"
      id={c.id}
      rarity={c.rarity}
      element={c.element}
      cls={c.cls}
      name={c.label}
      className={className}
    />
  );
}

/**
 * Picker de personnage (attaquant, allié, cible perso) : ancre compacte →
 * MODALE à grille de faces (recherche + filtres élément/classe), comme le pool
 * du tier-list-maker (demande Sevih 27/07/2026 — plus de select).
 */
function CharPicker({
  chars,
  value,
  onPick,
  onClear,
  placeholder,
  labels,
  aside,
}: {
  chars: DcChar[];
  value: string | null;
  onPick: (id: string) => void;
  onClear?: () => void;
  placeholder: string;
  labels: DcLabels;
  /** Rendu à droite du portrait, sous le nom (slider de transcendance). */
  aside?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [elements, setElements] = useState<string[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const current = value ? chars.find((c) => c.id === value) : undefined;
  const q = search.trim().toLowerCase();
  const filtered = chars.filter(
    (c) =>
      (!q || c.label.toLowerCase().includes(q)) &&
      (!elements.length || elements.includes(c.element)) &&
      (!classes.length || classes.includes(c.cls)),
  );
  const toggle = (set: (fn: (prev: string[]) => string[]) => void, v: string) =>
    set((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  const close = () => {
    setOpen(false);
    setSearch('');
  };
  return (
    <>
      <div className="flex min-w-0 items-center gap-2">
        <SlotTile
          large
          onClick={() => setOpen(true)}
          onClear={onClear}
          clearTitle={labels.clear}
          title={current?.label ?? placeholder}
        >
          {current ? <CharPortrait c={current} className="h-full w-full" /> : null}
        </SlotTile>
        {current ? (
          <div className="min-w-0 flex-1 space-y-0.5">
            <span className="text-content block text-sm font-semibold wrap-break-word">
              {current.label}
            </span>
            {aside}
          </div>
        ) : (
          <span className="text-content-subtle min-w-0 text-sm wrap-break-word">{placeholder}</span>
        )}
      </div>
      <Modal open={open} onClose={close} title={placeholder}>
        <SearchField value={search} onChange={setSearch} placeholder={labels.search} />
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1.5">
            {ELEMENT_ORDER.map((el) => (
              <FilterPill
                key={el}
                active={elements.includes(el)}
                onClick={() => toggle(setElements, el)}
                className="h-8 w-8 px-0"
                title={el}
              >
                <img src={img.element(el)} alt={el} className="h-5 w-5" width={20} height={20} />
              </FilterPill>
            ))}
          </div>
          <div className="flex gap-1.5">
            {CLASS_ORDER.map((cl) => (
              <FilterPill
                key={cl}
                active={classes.includes(cl)}
                onClick={() => toggle(setClasses, cl)}
                className="h-8 w-8 px-0"
                title={cl}
              >
                <img src={img.klass(cl)} alt={cl} className="h-5 w-5" width={20} height={20} />
              </FilterPill>
            ))}
          </div>
        </div>
        {filtered.length ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(4rem,1fr))] gap-1.5">
            {filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                className="group flex cursor-pointer flex-col items-center gap-1"
                title={c.label}
                onClick={() => {
                  onPick(c.id);
                  close();
                }}
              >
                {/* L'anneau de sélection sur un CONTENEUR, pas sur la vignette :
                    elle n'est plus une image carrée qu'on peut border — son
                    icône d'élément déborde volontairement du cadre. */}
                <span
                  className={`rounded-lg ring-2 transition ${
                    c.id === value ? 'ring-accent' : 'group-hover:ring-accent/50 ring-transparent'
                  }`}
                >
                  <CharPortrait c={c} className="h-16 w-16" />
                </span>
                <span className="text-content-muted group-hover:text-content w-full text-center text-[10px] leading-tight wrap-break-word">
                  {c.label}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <NoMatches label={labels.noMatches} />
        )}
      </Modal>
    </>
  );
}

/**
 * Slider de transcendance — même motif que la fiche perso
 * (`TranscendSlider` d'EeTranscendSection, demande Sevih 27/07/2026), version
 * COMPACTE : les étoiles (légèrement chevauchées) disent tout, pas de libellé
 * ni de texte ; piste fine pilotée au clavier, boutons −/+ souris hors arbre
 * a11y. Tokens du thème, sans les bonus de palier (les stats sont SAISIES ici).
 */
function TranscendSlider({
  tiers,
  idx,
  onIdx,
}: {
  tiers: DcTranscendTier[];
  idx: number;
  onIdx: (v: number) => void;
}) {
  const i = Math.max(0, Math.min(idx, tiers.length - 1));
  const tier = tiers[i];
  if (!tier) return null;
  const pct = (i / Math.max(1, tiers.length - 1)) * 100;
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <span className="flex shrink-0 items-center">
        {transcendStarRow(tier.star, tier.color).map((sprite, j) => (
          <img
            key={j}
            src={img.transcendStar(sprite)}
            alt=""
            aria-hidden
            className="h-4 w-4 drop-shadow-md"
            width={16}
            height={16}
            style={{ marginLeft: j ? -4 : 0 }}
          />
        ))}
      </span>
      <div className="flex min-w-0 flex-1 items-center gap-1">
        <button
          type="button"
          onClick={() => onIdx(Math.max(0, i - 1))}
          className="border-line-subtle text-content-muted hover:bg-surface-raised/80 h-4 w-4 cursor-pointer rounded border text-[10px] leading-none"
          aria-hidden
          tabIndex={-1}
        >
          –
        </button>
        <div className="relative flex h-3 flex-1 items-center">
          <div className="bg-surface-sunken absolute inset-x-0 h-0.5 rounded-full" />
          <div className="bg-accent absolute h-0.5 rounded-full" style={{ width: `${pct}%` }} />
          <input
            type="range"
            min={0}
            max={tiers.length - 1}
            step={1}
            value={i}
            onChange={(e) => onIdx(Number(e.target.value))}
            className="absolute inset-0 w-full cursor-pointer opacity-0"
            aria-valuetext={tier.label}
          />
          <div
            className="bg-accent absolute h-2 w-2 -translate-x-1/2 rounded-full"
            style={{ left: `${pct}%` }}
          />
        </div>
        <button
          type="button"
          onClick={() => onIdx(Math.min(tiers.length - 1, i + 1))}
          className="border-line-subtle text-content-muted hover:bg-surface-raised/80 h-4 w-4 cursor-pointer rounded border text-[10px] leading-none"
          aria-hidden
          tabIndex={-1}
        >
          +
        </button>
      </div>
    </div>
  );
}

/** Tag DMG / Support d'un skill (flag `offensive` de la donnée). */
function SkillTag({ offensive, labels }: { offensive: boolean; labels: DcLabels }) {
  return (
    <span
      className={`rounded border px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wide uppercase ${
        offensive
          ? 'border-danger/40 bg-danger/10 text-danger'
          : 'border-line-subtle bg-surface-sunken/60 text-content-subtle'
      }`}
    >
      {offensive ? labels.skills.dmg : labels.skills.support}
    </span>
  );
}

// ── État ───────────────────────────────────────────────────────────────────

/** Un set choisi : le nombre de picks décide des pièces (1 → 4P, 2 → 2P+2P). */
interface SetPick {
  setId: string;
  tier: number;
}

/** Un allié : perso + transcendance + main stat & enhancement (+0 à +10) du
 *  talisman porté + EE possédé / +10 (certains EE portent sur l'équipe) —
 *  tout est une entrée du moteur (Sevih 27/07/2026). */
interface AllyPick {
  id: string | null;
  transcend: number;
  talisman: string | null;
  talismanLv: number;
  ee: boolean;
  eePlus: boolean;
}
const EMPTY_ALLY: AllyPick = {
  id: null,
  transcend: 0,
  talisman: null,
  talismanLv: 10,
  ee: true,
  eePlus: true,
};

// L'état `?z=` (`UrlState`) vit dans la LIB (`CalculatorUrlState`,
// src/lib/damage/scenario.ts) : le pont z → entrées moteur et le test des
// fixtures lisent LA même définition que ce composant.

// ── Composant principal ────────────────────────────────────────────────────

export function DamageCalculatorBrowser({
  chars,
  kits,
  weapons,
  amulets,
  sets,
  talismans,
  ees,
  targets,
  statFields,
  targetStatFields,
  talismanMains,
  buffOptions,
  quirks,
  codexTiers,
  guildTiers,
  titleHpPct,
  effectRefs,
  lang,
  labels: L,
}: Props) {
  const [tab, setTab] = useState<'calc' | 'settings'>('calc');
  // Feedback du bouton « copier le lien » (l'URL porte déjà tout le scénario).
  const [copied, setCopied] = useState(false);
  const [attackerId, setAttackerId] = useState<string | null>(null);
  // INDEX dans les paliers de transcendance du perso (défaut : palier max).
  const [transcend, setTranscend] = useState(0);
  const [skillLvls, setSkillLvls] = useState<Record<string, number>>({});
  // Sets choisis (0 à 2) : 4 pièces d'armure au total → un seul 4P, ou 2P+2P.
  const [setPicks, setSetPicks] = useState<SetPick[]>([]);
  const [weaponSlug, setWeaponSlug] = useState<string | null>(null);
  const [weaponTier, setWeaponTier] = useState(0);
  const [amuletSlug, setAmuletSlug] = useState<string | null>(null);
  const [amuletTier, setAmuletTier] = useState(0);
  // Rogue's Charm +10 : simple interrupteur (seul talisman à toucher aux dégâts).
  const [talismanOn, setTalismanOn] = useState(false);
  // EE possédé ou non — +0 ≠ absent : le passif Lv0 s'applique dès qu'on le porte.
  const [eeOwned, setEeOwned] = useState(true);
  // Niveau d'enchant de l'EE (+0..+10) — ne sert qu'aux mains « dégâts vs élément ».
  const [eeLevel, setEeLevel] = useState(10);
  // Affinité (Trust) : la SAISIE est le niveau 0..100 (paliers tous les 20 —
  // Sevih 03/08/2026), le palier 0..5 dérivé sert seul aux calculs. Buffs
  // passifs plats ABSENTS de la fiche affichée (canal buffValue, binaire
  // 27/07/2026) : le moteur les ajoute.
  const [affinityLvl, setAffinityLvl] = useState(0);
  const affinityTier = Math.floor(affinityLvl / 20);
  // Niveau du perso (1..120, défaut 120) : le terme Codex de la reconstruction
  // fiche → combat (spec formule § 16.1, `sheetToCombatStat`) exige la stat de
  // BASE, donc le niveau (demande Sevih 03/08/2026).
  const [level, setLevel] = useState(120);
  const [statVals, setStatVals] = useState<Record<string, string>>({});
  const [quirkLvls, setQuirkLvls] = useStoredState(QUIRKS_STORE);
  const [codexLvl, setCodexLvl] = useStoredState(CODEX_STORE);
  const [guildLvl, setGuildLvl] = useStoredState(GUILD_STORE);
  const [premiumOn, setPremiumOn] = useStoredState(PREMIUM_STORE);
  // Cible : preset (donjon réel) OU saisie manuelle — le type de contenu se
  // DÉDUIT du preset choisi, le PvP est hors périmètre (Sevih 27/07/2026).
  const [targetTab, setTargetTab] = useState<'preset' | 'manual'>('preset');
  const [targetId, setTargetId] = useState<string | null>(null);
  const [spawnIdx, setSpawnIdx] = useState(0);
  // Cible MANUELLE : élément + stats défensives (mêmes champs que le preset)
  // + flag boss (conditionnels « vs boss » — les presets sont TOUS des boss).
  const [tgtElement, setTgtElement] = useState<string | null>(null);
  const [tgtStats, setTgtStats] = useState<Record<string, string>>({});
  const [tgtBoss, setTgtBoss] = useState(false);
  // Buffs MAX_HP en MANUEL : le mode du contenu est inconnu → une coche
  // explicite PAR buff, leurs listes de modes diffèrent (en preset, le mode
  // du donjon décide seul — spec § 16.2).
  const [tgtGuildBuff, setTgtGuildBuff] = useState(false);
  const [tgtTitleBuff, setTgtTitleBuff] = useState(false);
  // Cible en BREAK (jauge détruite) — contexte § 9.1 (Rogue's Charm +10,
  // set Pulverization, EE Lv10…) ; vaut pour preset ET manuel.
  const [tgtBroken, setTgtBroken] = useState(false);
  // Boss ENRAGÉ (z `en`) : buffs du skill d'enrage + passifs `OWNER_RAGE`
  // actifs (moteur passives.ts) — coche visible quand le preset a un skill
  // d'enrage (`hasRage`), jamais deviné.
  const [tgtEnraged, setTgtEnraged] = useState(false);
  // PV actuels de la cible (%) — skills qui tapent sur PV max/actuels/manquants.
  const [tgtHpPct, setTgtHpPct] = useState('100');
  const [targetsHit, setTargetsHit] = useState(1);
  const [allies, setAllies] = useState<AllyPick[]>([EMPTY_ALLY, EMPTY_ALLY, EMPTY_ALLY]);
  // Stacks déclarés des procs DYNAMIQUES qui atteignent l'attaquant — son
  // propre kit/EE/quirks comme ses alliés (buffId → stacks, z `ab`) : le
  // moteur ne simule jamais un proc, le joueur déclare l'état du combat
  // (prouvé 23/08/2026 : 1 S2 d'Eris = 1 stack du +20 % Strikers).
  const [stackDecls, setStackDecls] = useState<Record<string, number>>({});
  // Buffs/débuffs de scénario ACTIFS (clés de DcBuffOption), par côté.
  const [atkFx, setAtkFx] = useState<string[]>([]);
  const [tgtFx, setTgtFx] = useState<string[]>([]);
  // Conditions d'ÉTAT déclarées remplies (z `cs`, buffIds) — mécaniques perso
  // (entrées `stateful` de gear.ts) ; toggles dans le harnais.
  const [metConds, setMetConds] = useState<string[]>([]);
  // Compteurs § 9.1 DÉCLARÉS (« ×N buffs/débuffs » — z `ob`/`od`/`ot`/`db`/
  // `dd`) : jamais dérivés des chips (elles ne couvrent pas tous les états du
  // jeu) ; steppers visibles seulement quand un passif LIT la famille.
  const [atkBuffN, setAtkBuffN] = useState(0);
  const [atkDebuffN, setAtkDebuffN] = useState(0);
  const [atkTeamBuffN, setAtkTeamBuffN] = useState(0);
  const [tgtBuffN, setTgtBuffN] = useState(0);
  const [tgtDebuffN, setTgtDebuffN] = useState(0);
  // PV actuels de l'attaquant (%) — ne sert qu'aux sets « missing Health ».
  const [hpPct, setHpPct] = useState('100');

  // ── Cycle de capture (harnais) : saisie « en jeu » dans la table Résultat,
  // un scénario = UNE ligne sauvée d'un `+` (Sevih 05/08/2026). ──
  // Harnais visible : toujours en build de dev, opt-in `?dev=1` en prod (beta
  // testeurs). Posé APRÈS le mount (lecture d'URL) — le SSR rend sans harnais.
  const [devMode, setDevMode] = useState(DEV_BUILD);
  // `obs` : valeur constatée EN JEU par ligne, clé `slot|branch` (flattenReport).
  const [obs, setObs] = useState<Record<string, string>>({});
  // Branches OBSERVABLES : quelles colonnes prennent une saisie. `miss` coché
  // FORCE sa branche (sans esquive, le miss n'existe qu'avec un buff de miss
  // chance) ; décocher `normal` sert le crit forcé (passif → P(normal) = 0).
  const [branchOn, setBranchOn] = useState<Record<DamageBranch, boolean>>({
    normal: true,
    critical: true,
    miss: false,
  });
  const [savedScnsRaw, setSavedScns, scnsReady] = useStoredState(SCENARIOS_STORE);
  // ASSAINI avant tout rendu : un état chaud d'HMR (entrées v1 encore en
  // mémoire après le swap de code, vu le 05/08 — `s.real` undefined) ou une
  // donnée corrompue ne doit jamais faire tomber le composant.
  const savedScns = savedScnsRaw.filter(
    (s) =>
      typeof s?.real === 'number' &&
      typeof s?.z === 'string' &&
      typeof s?.slot === 'string' &&
      typeof s?.branch === 'string',
  );
  // Miroir FICHIER en dev (Sevih 10/08/2026) : write-through de la liste vers
  // `.dev/damage-scenarios.json` via la route dev — un lecteur hors navigateur
  // (agent) lit les captures sans copier-coller. Gaté sur `scnsReady` : ne
  // jamais écraser le fichier avec le fallback [] d'avant hydratation. Build
  // de dev SEULEMENT (en prod `?dev=1`, la route n'existe pas).
  useEffect(() => {
    if (!DEV_BUILD || !scnsReady) return;
    void fetch('/api/dev/damage-scenarios', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(savedScnsRaw),
    }).catch(() => {
      /* miroir best-effort : le localStorage reste la vérité */
    });
  }, [savedScnsRaw, scnsReady]);
  const [flash, setFlash] = useState<string | null>(null);
  const say = (msg: string) => {
    setFlash(msg);
    window.setTimeout(() => setFlash(null), 2500);
  };
  // « Importer » : coller le JSON ⧉ reçu d'un beta testeur (le flux inverse
  // de ⧉ — eux capturent via `?dev=1`, Sevih vérifie ici, 06/08/2026).
  const [importOpen, setImportOpen] = useState(false);
  const [importTxt, setImportTxt] = useState('');

  const attacker = attackerId ? chars.find((c) => c.id === attackerId) : undefined;
  const kit = attackerId ? (kits[attackerId] ?? []) : [];
  const ee = attackerId ? ees[attackerId] : undefined;
  const weapon = weaponSlug ? weapons.find((w) => w.slug === weaponSlug) : undefined;
  const amulet = amuletSlug ? amulets.find((a) => a.slug === amuletSlug) : undefined;
  const talisman = talismans[0];

  // Saisie/stats finales : SEULES les stats qui pilotent les dégâts de CE perso
  // (`statKeys`, dérivé des kits par damage-scaling.json). Le select des buffs
  // garde la liste complète : il sert aussi la CIBLE (DEF down…).
  const sheetFields = attacker
    ? statFields.filter((f) => attacker.statKeys.includes(f.key))
    : statFields;

  // Cibles : modes distincts (ordre du jeu) — pastilles de filtre du picker.
  const modes = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const tg of targets)
      if (!seen.has(tg.mode)) {
        seen.add(tg.mode);
        out.push(tg.mode);
      }
    return out;
  }, [targets]);
  const target = targetId ? targets.find((tg) => tg.id === targetId) : undefined;
  const spawn = target?.spawns[Math.min(spawnIdx, target.spawns.length - 1)];
  // Les buffs/débuffs de scénario attendent les DEUX combattants (Sevih
  // 27/07/2026) — en manuel, la cible « existe » dès l'onglet.
  const targetReady = targetTab === 'manual' || Boolean(target);

  // Armes/accessoires filtrés par la classe de l'attaquant (classLimit du jeu).
  // Pas de useMemo : le React Compiler mémoïse seul (et refuse de préserver une
  // mémoïsation manuelle depuis que `attacker` alimente aussi le cadre debug).
  const pickableWeapons = attacker
    ? weapons.filter((w) => !w.classLimits.length || w.classLimits.includes(attacker.cls))
    : weapons;
  const pickableAmulets = attacker
    ? amulets.filter((a) => !a.classLimits.length || a.classLimits.includes(attacker.cls))
    : amulets;

  const pickAttacker = (id: string) => {
    setAttackerId(id);
    setTranscend((chars.find((c) => c.id === id)?.transcend.length ?? 1) - 1);
    setAffinityLvl(0);
    const lvls: Record<string, number> = {};
    for (const row of kits[id] ?? []) lvls[row.slot] = row.maxLevel;
    setSkillLvls(lvls);
    setWeaponSlug(null);
    setAmuletSlug(null);
    setEeOwned(true);
    setEeLevel(10);
  };

  // Reset du SCÉNARIO (Sevih 27/07/2026) — les quirks (réglage de COMPTE) et
  // l'onglet courant ne bougent pas ; l'URL se nettoie via l'effet débouncé.
  const resetScenario = () => {
    setAttackerId(null);
    setTranscend(0);
    setAffinityLvl(0);
    setLevel(120);
    setSkillLvls({});
    setSetPicks([]);
    setWeaponSlug(null);
    setWeaponTier(0);
    setAmuletSlug(null);
    setAmuletTier(0);
    setTalismanOn(false);
    setEeOwned(true);
    setEeLevel(10);
    setStatVals({});
    setHpPct('100');
    setTargetTab('preset');
    setTargetId(null);
    setSpawnIdx(0);
    setTgtElement(null);
    setTgtStats({});
    setTgtBoss(false);
    setTgtBroken(false);
    setTgtEnraged(false);
    setTgtGuildBuff(false);
    setTgtTitleBuff(false);
    setTgtHpPct('100');
    setTargetsHit(1);
    setAllies([EMPTY_ALLY, EMPTY_ALLY, EMPTY_ALLY]);
    setStackDecls({});
    setAtkFx([]);
    setTgtFx([]);
    setMetConds([]);
    setAtkBuffN(0);
    setAtkDebuffN(0);
    setAtkTeamBuffN(0);
    setTgtBuffN(0);
    setTgtDebuffN(0);
    // Cycle de capture (dev) : un nouveau scénario repart d'observés vides.
    setObs({});
  };

  // Chips proposés : même filtre de pertinence que la saisie des stats.
  const relevantFx = (options: DcBuffOption[]) =>
    options.filter((o) => !o.stat || !attacker || attacker.statKeys.includes(o.stat));
  const toggleFx = (set: (fn: (prev: string[]) => string[]) => void, key: string) =>
    set((prev) => (prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]));

  // Passifs de BOSS du preset — chips AUTO (jamais togglables : en jeu ils
  // sont permanents et indélébiles). La condition élémentaire s'évalue contre
  // l'attaquant COURANT, même relation § 6 que le moteur.
  const bossPassivesFor = (s: DcBossPassive['side']): DcBossPassive[] =>
    (target?.passives ?? []).filter((p) => p.side === s);
  const bossPassiveActive = (p: DcBossPassive): boolean => {
    // Buff d'ENRAGE : gaté par la coche du scénario (même règle que le moteur).
    if (p.rage && !tgtEnraged) return false;
    if (!p.condition) return true;
    if (p.condition === 'OWNER_RAGE') return tgtEnraged;
    const a = attacker ? elementOf(attacker.element) : undefined;
    const d = target ? elementOf(target.element) : undefined;
    return a !== undefined && d !== undefined && passiveConditionMet(p.condition, a, d);
  };

  // ── Persistance URL (`?z=` lz-string, motif team-planner) ────────────────
  // Hydratation UNE fois au mount, puis écriture DÉBOUNCÉE à chaque
  // changement : un refresh ne perd plus le scénario (demande Sevih
  // 27/07/2026). Les QUIRKS restent en localStorage — réglage de COMPTE.
  const didHydrate = useRef(false);
  // Applique un état `?z=` DÉCOMPRESSÉ aux états du scénario — revalidation
  // complète (ids inconnus écartés, nombres bornés) : l'entrée vient de l'URL
  // ou d'un scénario sauvegardé, jamais fiable. Partagé entre l'hydratation au
  // mount et « Charger » du harnais (les deux chemins restent d'accord).
  const applyZ = (st: UrlState) => {
    const char = st.a ? chars.find((c) => c.id === st.a) : undefined;
    if (char) {
      setAttackerId(char.id);
      const maxIdx = Math.max(char.transcend.length - 1, 0);
      setTranscend(typeof st.x === 'number' ? Math.min(Math.max(st.x, 0), maxIdx) : maxIdx);
      // `af` = NIVEAU 0..100 depuis le 03/08/2026 (avant : palier 0..5 —
      // outil unlisted, pas de rétrocompat des vieilles URLs).
      if (typeof st.af === 'number') setAffinityLvl(Math.min(Math.max(st.af, 0), 100));
      if (typeof st.lv === 'number') setLevel(Math.min(Math.max(st.lv, 1), 120));
      const lvls: Record<string, number> = {};
      for (const row of kits[char.id] ?? []) {
        const v = st.k?.[row.slot];
        lvls[row.slot] =
          typeof v === 'number' ? Math.min(Math.max(v, 1), row.maxLevel) : row.maxLevel;
      }
      setSkillLvls(lvls);
      if (st.w && weapons.some((x) => x.slug === st.w)) setWeaponSlug(st.w);
      if (typeof st.y === 'number') setWeaponTier(Math.min(Math.max(st.y, 0), 4));
      if (st.m && amulets.some((x) => x.slug === st.m)) setAmuletSlug(st.m);
      if (typeof st.q === 'number') setAmuletTier(Math.min(Math.max(st.q, 0), 4));
      if (Array.isArray(st.s))
        setSetPicks(
          st.s
            .filter(
              (p): p is [string, number] => Array.isArray(p) && sets.some((x) => x.id === p[0]),
            )
            .slice(0, 2)
            .map(([setId, tier]) => ({ setId, tier: tier ? 1 : 0 })),
        );
      if (st.t) setTalismanOn(true);
      if (st.eo === 0) setEeOwned(false);
      if (typeof st.e === 'number') setEeLevel(Math.min(Math.max(st.e, 0), 10));
      if (st.v && typeof st.v === 'object')
        setStatVals(
          Object.fromEntries(Object.entries(st.v).filter(([, v]) => typeof v === 'string')),
        );
      if (typeof st.h === 'string') setHpPct(st.h);
      if (Array.isArray(st.b)) setAtkFx(st.b.filter((x): x is string => typeof x === 'string'));
      if (Array.isArray(st.d)) setTgtFx(st.d.filter((x): x is string => typeof x === 'string'));
      if (Array.isArray(st.cs))
        setMetConds(st.cs.filter((x): x is string => typeof x === 'string'));
      // Compteurs § 9.1 côté attaquant — mêmes bornes que le pont scenario.ts.
      if (typeof st.ob === 'number') setAtkBuffN(Math.min(Math.max(st.ob, 0), 20));
      if (typeof st.od === 'number') setAtkDebuffN(Math.min(Math.max(st.od, 0), 20));
      if (typeof st.ot === 'number') setAtkTeamBuffN(Math.min(Math.max(st.ot, 0), 40));
    }
    if (st.g) setTargetTab('manual');
    if (st.ti && targets.some((tg) => tg.id === st.ti)) {
      setTargetId(st.ti);
      if (typeof st.si === 'number') setSpawnIdx(Math.max(st.si, 0));
    }
    if (st.te && (ELEMENT_ORDER as readonly string[]).includes(st.te)) setTgtElement(st.te);
    if (st.tv && typeof st.tv === 'object')
      setTgtStats(
        Object.fromEntries(Object.entries(st.tv).filter(([, v]) => typeof v === 'string')),
      );
    if (st.tb) setTgtBoss(true);
    if (st.bk) setTgtBroken(true);
    if (st.en) setTgtEnraged(true);
    if (st.gb) setTgtGuildBuff(true);
    if (st.pb) setTgtTitleBuff(true);
    if (typeof st.th === 'string') setTgtHpPct(st.th);
    if (typeof st.db === 'number') setTgtBuffN(Math.min(Math.max(st.db, 0), 20));
    if (typeof st.dd === 'number') setTgtDebuffN(Math.min(Math.max(st.dd, 0), 20));
    if (typeof st.n === 'number') setTargetsHit(Math.min(Math.max(st.n, 1), 4));
    if (Array.isArray(st.al))
      setAllies(
        Array.from({ length: 3 }, (_, i) => {
          const row = st.al?.[i];
          if (!Array.isArray(row)) return EMPTY_ALLY;
          const [id, tx, tal, tlv, eo, ep] = row;
          const c = typeof id === 'string' ? chars.find((x) => x.id === id) : undefined;
          if (!c) return EMPTY_ALLY;
          const maxIdx = Math.max(c.transcend.length - 1, 0);
          const ee = typeof eo === 'number' ? Boolean(eo) : true;
          return {
            id: c.id,
            transcend: typeof tx === 'number' ? Math.min(Math.max(tx, 0), maxIdx) : maxIdx,
            talisman:
              typeof tal === 'string' && talismanMains.some((mn) => mn.key === tal) ? tal : null,
            talismanLv: typeof tlv === 'number' ? Math.min(Math.max(tlv, 0), 10) : 10,
            ee,
            eePlus: ee && (typeof ep === 'number' ? Boolean(ep) : true),
          };
        }),
      );
    if (Array.isArray(st.ab))
      setStackDecls(
        Object.fromEntries(
          st.ab.filter(
            (r): r is [string, number] =>
              Array.isArray(r) && typeof r[0] === 'string' && typeof r[1] === 'number' && r[1] > 0,
          ),
        ),
      );
  };

  // Hydratation `?z=` UNE fois au mount — SANS tableau de deps, à dessein :
  // le garde `didHydrate` ne laisse passer que le premier rendu, et l'effet
  // voit toujours l'`applyZ` du rendu courant (pas de liste de deps à tenir).
  useEffect(() => {
    if (didHydrate.current) return;
    didHydrate.current = true;
    const params = new URLSearchParams(window.location.search);
    // `?dev=1` (avant `z` dans les liens partagés) : active le harnais en
    // production — lu AVANT le retour anticipé, un lien peut n'avoir que lui.
    if (params.get('dev') === '1') {
      void Promise.resolve().then(() => setDevMode(true));
    }
    const zRaw = params.get('z');
    if (!zRaw) return;
    let parsed: UrlState | null = null;
    try {
      parsed = JSON.parse(
        LZString.decompressFromEncodedURIComponent(zRaw) || 'null',
      ) as UrlState | null;
    } catch {
      parsed = null;
    }
    if (!parsed || typeof parsed !== 'object') return;
    const st = parsed;
    // Règle set-state-in-effect : la pose d'état est déférée en microtâche.
    void Promise.resolve().then(() => applyZ(st));
  });

  // « Charger » du harnais : rejoue un scénario SAUVEGARDÉ dans le calculateur
  // entier — reset puis applyZ (un champ absent de z doit retrouver sa valeur
  // par défaut, pas celle du scénario précédent). Les réglages de COMPTE
  // capturés (codex/guilde/titre) sont REPOSÉS : le recalcul doit reproduire
  // la capture, pas l'état courant du compte.
  const loadScenario = (f: {
    z: string;
    codex?: number;
    guild?: number;
    premium?: boolean;
    quirks?: Record<string, number>;
  }): boolean => {
    let st: UrlState | null = null;
    try {
      st = JSON.parse(LZString.decompressFromEncodedURIComponent(f.z) || 'null') as UrlState | null;
    } catch {
      st = null;
    }
    if (!st || typeof st !== 'object') return false;
    resetScenario();
    applyZ(st);
    setCodexLvl(f.codex ?? 0);
    setGuildLvl(f.guild ?? 0);
    setPremiumOn(f.premium === true);
    // Quirks capturés avec le scénario : restaurés tels quels (réglage de
    // compte — un scénario d'un autre compte doit rejouer SES quirks). Un
    // scénario SANS quirks (capturé avant le branchement) ne dit rien : on ne
    // touche pas aux réglages courants — le re-tamponnage (« Charger » puis
    // `+`) refige alors la ligne AVEC les quirks du compte.
    if (f.quirks) {
      setQuirkLvls(Object.fromEntries(Object.entries(f.quirks).map(([k, v]) => [Number(k), v])));
    }
    return true;
  };

  // État d'URL COURANT — partagé entre l'effet débouncé, le bouton « copier
  // le lien », la capture de fixture ET le rapport du harnais : aucun d'eux
  // ne doit lire une URL en retard de debounce (Sevih 27/07/2026). `buildZ`
  // rend l'OBJET (le pont z → moteur le consomme), `packZ` le compresse.
  const buildZ = (): UrlState => {
    const z: UrlState = {};
    if (attackerId) {
      z.a = attackerId;
      z.x = transcend;
      if (affinityLvl) z.af = affinityLvl;
      if (level !== 120) z.lv = level;
      z.k = skillLvls;
      if (weaponSlug) {
        z.w = weaponSlug;
        if (weaponTier) z.y = weaponTier;
      }
      if (amuletSlug) {
        z.m = amuletSlug;
        if (amuletTier) z.q = amuletTier;
      }
      if (setPicks.length) z.s = setPicks.map((p) => [p.setId, p.tier]);
      if (talismanOn) z.t = 1;
      if (!eeOwned) z.eo = 0;
      if (eeLevel !== 10) z.e = eeLevel;
      const vals = Object.fromEntries(Object.entries(statVals).filter(([, v]) => v !== ''));
      if (Object.keys(vals).length) z.v = vals;
      if (hpPct !== '100') z.h = hpPct;
      if (atkFx.length) z.b = atkFx;
      if (tgtFx.length) z.d = tgtFx;
      if (metConds.length) z.cs = metConds;
      if (atkBuffN > 0) z.ob = atkBuffN;
      if (atkDebuffN > 0) z.od = atkDebuffN;
      if (atkTeamBuffN > 0) z.ot = atkTeamBuffN;
    }
    if (targetTab === 'manual') z.g = 1;
    if (targetId) {
      z.ti = targetId;
      if (spawnIdx) z.si = spawnIdx;
    }
    if (tgtElement) z.te = tgtElement;
    const tv = Object.fromEntries(Object.entries(tgtStats).filter(([, v]) => v !== ''));
    if (Object.keys(tv).length) z.tv = tv;
    if (tgtBoss) z.tb = 1;
    if (tgtBroken) z.bk = 1;
    if (tgtEnraged) z.en = 1;
    if (tgtGuildBuff) z.gb = 1;
    if (tgtTitleBuff) z.pb = 1;
    if (tgtHpPct !== '100') z.th = tgtHpPct;
    if (tgtBuffN > 0) z.db = tgtBuffN;
    if (tgtDebuffN > 0) z.dd = tgtDebuffN;
    if (targetsHit > 1) z.n = targetsHit;
    if (allies.some((a) => a.id))
      z.al = allies.map((a) => [
        a.id ?? '',
        a.transcend,
        a.talisman ?? '',
        a.talismanLv,
        Number(a.ee),
        Number(a.eePlus),
      ]);
    // Stacks déclarés — kit/EE/quirks du porteur comme des alliés : le champ
    // vit indépendamment de `al`.
    const ab = Object.entries(stackDecls).filter(([, n]) => n > 0);
    if (ab.length) z.ab = ab;
    return z;
  };
  const packZ = (): string => {
    const z = buildZ();
    return Object.keys(z).length ? LZString.compressToEncodedURIComponent(JSON.stringify(z)) : '';
  };

  /** Query string de l'état courant : `dev=1` (mode harnais collant — il doit
   *  survivre aux réécritures d'URL) AVANT `z`. */
  const buildQuery = (packed: string): string => {
    const parts = [...(devMode && !DEV_BUILD ? ['dev=1'] : []), ...(packed ? [`z=${packed}`] : [])];
    return parts.length ? `?${parts.join('&')}` : '';
  };

  /** URL de partage de l'état courant — et l'écrit dans la barre au passage. */
  const flushShareUrl = (): string => {
    const url = `${window.location.pathname}${buildQuery(packZ())}${window.location.hash}`;
    window.history.replaceState(null, '', url);
    return `${window.location.origin}${url}`;
  };

  // SANS tableau de deps, à dessein : l'effet re-arme le timer à chaque rendu
  // et n'écrit que 400 ms après le DERNIER — même débounce qu'avant, sans la
  // liste de 24 deps à maintenir.
  useEffect(() => {
    if (!didHydrate.current) return;
    const timer = window.setTimeout(() => {
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${buildQuery(packZ())}${window.location.hash}`,
      );
    }, 400);
    return () => window.clearTimeout(timer);
  });

  // ── MOTEUR BRANCHÉ (05/08/2026) : le rapport PUBLIC passe par le MÊME pont
  // que le panneau Debug et fixtures.test.ts (buildInputsFromZ → amont pur) —
  // jamais un deuxième chemin de calcul. Les tables damage (~11 Mo de JSON)
  // se chargent en import dynamique à la PREMIÈRE sélection d'attaquant — ou
  // dès l'hydratation si le HARNAIS a des scénarios sauvés qui attendent leur
  // Δ (le rejeu de la table Scénarios passe par `savedCalcs`, qui a besoin des
  // tables ; hors harnais la table n'existe pas, on ne charge pas) : rien dans
  // le bundle initial pour le visiteur public, un seul chargement par session.
  const [dmgData, setDmgData] = useState<DamageData | null>(null);
  const [dmgErr, setDmgErr] = useState<string | null>(null);
  const dmgLoading = useRef(false);
  useEffect(() => {
    const scnsWaiting = devMode && savedScns.length > 0;
    if ((!attackerId && !scnsWaiting) || dmgData || dmgErr || dmgLoading.current) return;
    dmgLoading.current = true;
    void Promise.all([
      import('@data/generated/damage/characters.json'),
      import('@data/generated/damage/growth.json'),
      import('@data/generated/damage/buffs.json'),
      import('@data/generated/damage/targets.json'),
      import('@data/generated/damage/equipment.json'),
    ])
      .then(([c, g, b, t, q]) => {
        setDmgData({
          characters: c.default,
          growth: g.default,
          buffs: b.default,
          targets: t.default,
          equipment: q.default,
        } as unknown as DamageData);
      })
      .catch((e: unknown) => setDmgErr(e instanceof Error ? e.message : String(e)));
    // `savedScns.length` : les scénarios arrivent APRÈS montage (hydratation
    // localStorage de useStoredState) — l'effet doit re-tirer à ce moment-là.
    // `devMode` aussi : `?dev=1` est lu dans un effet, après le premier rendu.
  }, [attackerId, dmgData, dmgErr, devMode, savedScns.length]);

  // Cible preset → stats effectives au spawn — partagé entre le rapport
  // public et le harnais (même closure, mêmes stats que l'affichage).
  const resolvePresetLocal = (ti: string, si: number) => {
    const tg = targets.find((x) => x.id === ti);
    const sp = tg?.spawns[Math.min(si, (tg?.spawns.length ?? 1) - 1)];
    return tg && sp
      ? {
          element: tg.element,
          stats: sp.stats,
          mode: tg.modeSlug,
          // `id` = `${encounterId}:${bossId}` — même découpe que le resolver
          // node (preset-target.ts).
          monsterId: ti.slice(ti.lastIndexOf(':') + 1),
        }
      : undefined;
  };

  // Équipement (slug UI → groupes d'options uniques des tables damage) —
  // même contrat que le resolver node (preset-gear.ts) : les props portent la
  // jointure, la variante PAR CLASSE suit l'attaquant (Briareos/Gorgon).
  const resolveGearLocal = (kind: 'weapon' | 'amulet' | 'talisman', slug: string, aId: string) => {
    const g =
      kind === 'weapon'
        ? weapons.find((x) => x.slug === slug)
        : kind === 'amulet'
          ? amulets.find((x) => x.slug === slug)
          : talismans.find((x) => x.slug === slug);
    // La classe vient de l'ATTAQUANT DU SCÉNARIO (celui du z rejoué — pas
    // forcément la sélection courante) : variantes Briareos/Gorgon.
    const cls = chars.find((c) => c.id === aId)?.cls;
    const groups = (cls && g?.dmgGroupsByClass?.[cls]) || g?.dmgGroups;
    return groups?.length ? { groups } : undefined;
  };

  // Entrées + rapport du scénario COURANT — recalculés au rendu (quelques ms
  // sur un kit complet) ; null tant que le scénario est incomplet ou les
  // tables absentes. Le détail d'une erreur moteur vit dans le panneau Debug.
  // Quirks ACTIFS du compte (niveau > 0) — réglage hors z, comme le Codex.
  const activeQuirks: Record<string, number> = Object.fromEntries(
    Object.entries(quirkLvls).filter(([, v]) => v > 0),
  );
  const scenarioInputs = buildInputsFromZ(buildZ(), {
    codexLevel: codexLvl,
    guildLevel: guildLvl,
    premiumHp: premiumOn,
    quirks: activeQuirks,
    resolvePreset: resolvePresetLocal,
    resolveGear: resolveGearLocal,
  });
  let report: DamageReportResult | null = null;
  if (dmgData && scenarioInputs.attacker && scenarioInputs.target) {
    try {
      report = buildDamageReport(scenarioInputs.attacker, scenarioInputs.target, dmgData, {
        // La coche MISS (dev) force sa branche — en prod elle reste false.
        includeMissBranch: branchOn.miss,
        ...(scenarioInputs.targetsHit !== undefined
          ? { targetsHit: scenarioInputs.targetsHit }
          : {}),
      });
    } catch {
      report = null;
    }
  }
  /** Valeur de stat finale → affichage (‰ des stats % → « x% », plat brut). */
  const fmtStat = (v: number | undefined, percent: boolean): string =>
    v === undefined ? '—' : percent ? `${v / 10}%` : v.toLocaleString();

  // Chips de passifs de boss : ACTIVES et qui pèsent un MONTANT pour ce
  // scénario — la crit chance de l'équipe ne s'affiche que si le kit la LIT
  // (§ 9.1, ex. 2000067) ; sans rapport, repli sur la base (Sevih 17/08/2026).
  const amountStats = new Set(report?.attackerAmountStats ?? BASE_AMOUNT_STATS);
  const bossPassiveShown = (p: DcBossPassive): boolean =>
    bossPassiveActive(p) &&
    (p.side !== 'attacker' || p.stat === undefined || amountStats.has(p.stat));

  // Mécaniques perso : entrées `stateful` du rapport (kit/EE/quirks + passifs
  // d'ALLIÉS) — leur condition d'ÉTAT de combat (ressource, buffs posés… —
  // CheckAvailable § 12.1) n'est jamais évaluée par le moteur ; la coche du
  // panneau Contexte la déclare remplie (z `cs`).
  const statefulPassives = report
    ? [report.kitPassives, report.gearPassives, report.quirkPassives, report.allyPassives].flatMap(
        (i) => (i?.entries ?? []).filter((e) => e.stateful),
      )
    : [];

  // Procs dynamiques DÉCLARABLES (« ce perso a cette méca stackée N fois »,
  // Sevih 23/08/2026) : procs damage-pertinents côté attaquant — de son
  // PROPRE kit/EE/quirks comme de ses alliés — dédup par buffId (un même
  // buff référencé par plusieurs sources = UNE instance, même règle que le
  // moteur). Deux exclusions (Sevih 23/08) :
  //  - un proc qui porte le tooltip d'une CHIP générique EST ce buff visible
  //    en jeu (mêmes magnitudes, pas de cumul) — il se déclare par la chip,
  //    un stepper le ferait compter DEUX fois (FX_CHIP_TOOLTIPS) ;
  //  - un BT_STAT dont la stat ne pèse aucun MONTANT dans ce scénario
  //    (counter rate, buff resist…) n'a rien à déclarer — même filtre que
  //    les chips de passifs de boss (`amountStats`).
  const stackableDynamics = (() => {
    const seen = new Set<string>();
    return report
      ? [report.kitPassives, report.gearPassives, report.quirkPassives, report.allyPassives]
          .flatMap((i) => i?.dynamic ?? [])
          .filter((d) => {
            if (d.side !== 'attacker' || seen.has(d.buffId)) return false;
            if (d.tooltipId !== undefined && FX_CHIP_TOOLTIPS[d.tooltipId] !== undefined)
              return false;
            if (d.buff.type === 'BT_STAT' && (!d.buff.stat || !amountStats.has(d.buff.stat)))
              return false;
            seen.add(d.buffId);
            return true;
          })
      : [];
  })();
  // Libellé d'un proc : le NOM du jeu de sa source (perso allié, skill du
  // kit — déclinaisons BURST résolues sur la rangée qui porte `burstIds` —
  // EE, nœud d'éveil) — jamais de texte écrit main ; repli sur le buffId
  // brut.
  const dynLabel = (d: (typeof stackableDynamics)[number]): { name: string; slot?: string } => {
    if (d.ally)
      return {
        name: chars.find((c) => c.id === d.ally)?.label ?? d.ally,
        // Slot du skill de l'ALLIÉ (résolu par le moteur — « Eris S2 »).
        ...(d.slot ? { slot: d.slot } : {}),
      };
    if (d.source === 'kit') {
      const row = kit.find((r) => r.id === d.sourceId || r.burstIds?.includes(d.sourceId));
      if (row) return { name: row.name, slot: row.slot };
    }
    if (d.source === 'ee' && ee) return { name: ee.name };
    if (d.source === 'quirk') {
      for (const g of quirks) {
        const n = g.nodes.find((x) => String(x.id) === d.sourceId);
        if (n) return { name: n.name };
      }
    }
    return { name: d.buffId };
  };
  // Ce que le proc FAIT, lisible : tag du glossaire quand la ligne porte un
  // ToolTipID (même tag inline que conditions et DoT), sinon le nom localisé
  // de la stat visée (fiche), sinon « dégâts » pour la famille BT_DMG (§ 9.1)
  // — la magnitude vient de la donnée (OAT_RATE et stats-% : affichage en %).
  const dynEffect = (
    d: (typeof stackableDynamics)[number],
  ): { ref?: DcEffectRef; what?: string; amount: string } => {
    const ref = d.tooltipId !== undefined ? effectRefs[String(d.tooltipId)] : undefined;
    const v = d.buff.value ?? 0;
    const slug = d.buff.stat !== undefined ? sheetSlugOfStat(d.buff.stat) : undefined;
    const field = slug !== undefined ? statFields.find((f) => f.key === slug) : undefined;
    const pct = d.buff.applyingType === 'OAT_RATE' || field?.percent === true;
    const amount = `${v >= 0 ? '+' : ''}${pct ? `${v / 10}%` : v}`;
    if (ref) return { ref, amount };
    const what =
      field?.label ?? d.buff.stat ?? (d.buff.type === 'BT_DMG' ? L.context.dmgWord : undefined);
    return { ...(what !== undefined ? { what } : {}), amount };
  };

  // Compteurs § 9.1 (« ×N buffs/débuffs ») : le scénario DÉCLARE les nombres
  // (le moteur ne compte jamais les chips — elles ne couvrent pas tous les
  // états du jeu). Un stepper n'apparaît que si un passif du rapport côté
  // attaquant LIT sa famille (actif OU stateful — ex. Eris 2000117_2_4 :
  // +20 % par débuff de la cible sur S2/S3).
  const counterTypes = new Set(
    report
      ? [
          ...[
            report.kitPassives,
            report.gearPassives,
            report.quirkPassives,
            report.allyPassives,
          ].flatMap((i) => i?.entries ?? []),
          ...(report.bossPassives?.entries ?? []),
        ]
          .filter((e) => e.side === 'attacker')
          .map((e) => e.buff.type)
      : [],
  );
  const counterInputs = (
    [
      { type: 'BT_DMG_OWNER_BUFF', label: L.context.ownBuffs, value: atkBuffN, set: setAtkBuffN },
      {
        type: 'BT_DMG_OWNER_DEBUFF',
        label: L.context.ownDebuffs,
        value: atkDebuffN,
        set: setAtkDebuffN,
      },
      {
        type: 'BT_DMG_OWNER_TEAM_BUFF',
        label: L.context.teamBuffs,
        value: atkTeamBuffN,
        set: setAtkTeamBuffN,
        // Σ sur l'ÉQUIPE entière — plafond plus large que les compteurs mono-
        // entité (même borne que le pont scenario.ts).
        max: 40,
      },
      { type: 'BT_DMG_TARGET_BUFF', label: L.context.tgtBuffs, value: tgtBuffN, set: setTgtBuffN },
      {
        type: 'BT_DMG_TARGET_DEBUFF',
        label: L.context.tgtDebuffs,
        value: tgtDebuffN,
        set: setTgtDebuffN,
      },
    ] as const
  ).filter((c) => counterTypes.has(c.type));
  // Libellé d'une mécanique : le NOM du jeu de sa source (skill du kit via le
  // slot lanceur, EE, nœud d'éveil) — jamais de texte écrit main ; repli sur
  // le buffId brut (identifiant stable) si la source ne se résout pas.
  // Les callers BURST se résolvent sur le slot du skill BURSTABLE du kit
  // (la rangée qui porte `burstIds` — S1 chez Caren : le « toujours S2 »
  // d'avant contredisait la table Résultat, revue 18/08/2026).
  const SLOT_OF_CALLER: Record<string, string> = {
    SKT_FIRST: 'S1',
    SKT_SECOND: 'S2',
    SKT_ULTIMATE: 'S3',
  };
  const kitBurstSlot = kit.find((r) => r.burstIds?.length)?.slot;
  const slotOfCaller = (c: string): string | undefined =>
    SLOT_OF_CALLER[c] ?? (c.startsWith('SKT_BURST_') ? kitBurstSlot : undefined);
  const mechLabel = (e: (typeof statefulPassives)[number]): { name: string; slot?: string } => {
    // Entrée d'ALLIÉ : sa source (skill/EE) vit dans le kit de l'ALLIÉ, hors
    // des props — le NOM du personnage allié situe la mécanique.
    if (e.ally) {
      const nm = chars.find((c) => c.id === e.ally)?.label;
      if (nm) return { name: nm };
    }
    const slot = e.callers?.map(slotOfCaller).find((s) => s !== undefined);
    if (e.source === 'kit' && slot) {
      const nm = kit.find((r) => r.slot === slot)?.name;
      if (nm) return { name: nm, slot };
    }
    if (e.source === 'ee' && ee) return { name: ee.name, ...(slot ? { slot } : {}) };
    if (e.source === 'quirk') {
      for (const g of quirks) {
        const n = g.nodes.find((x) => String(x.id) === e.sourceId);
        if (n) return { name: n.name, ...(slot ? { slot } : {}) };
      }
    }
    return { name: e.buffId, ...(slot ? { slot } : {}) };
  };
  /** Libellé LISIBLE de la condition d'une mécanique (« Target has … »,
   *  « Target HP below 90% »…) — gabarit localisé, `{n}` = seuil (HPRATE en
   *  ‰ → %) ; repli sur l'enum brut si le gabarit manquait. Quand la condition
   *  référence un buff PRÉCIS (`conditionBuffRef` — prédicat PARTAGÉ avec le
   *  wrapper, sentinelles « n'importe quel buff » exclues), le gabarit
   *  `condsRef` s'ouvre autour de `{buff}` et le buff devient un TAG INLINE
   *  (icône + nom, desc en tooltip — Sevih 22/08/2026, remplace le « : nom »
   *  en texte plat du 18/08) ; sans entrée au glossaire (marqueur technique
   *  au NameID vide, ex. 4089002 des Irréguliers), l'id brut plutôt qu'un
   *  libellé générique trompeur. */
  const mechCond = (
    e: (typeof statefulPassives)[number],
  ): { pre: string; ref?: DcEffectRef; post?: string } | undefined => {
    if (!e.condition) return undefined;
    const refId = conditionBuffRef(e.condition, e.conditionValue);
    if (refId !== undefined) {
      const ref = effectRefs[refId];
      const tplRef = L.context.condsRef[e.condition];
      if (ref && tplRef !== undefined) {
        const [pre, post] = tplRef.split('{buff}');
        return { pre, ref, ...(post ? { post } : {}) };
      }
      const tpl = L.context.conds[e.condition] ?? e.condition;
      return { pre: `${tpl} : #${refId}` };
    }
    const tpl = L.context.conds[e.condition];
    if (!tpl) return { pre: e.condition };
    const n =
      e.conditionValue !== undefined
        ? e.condition.includes('HPRATE')
          ? e.conditionValue / 10
          : e.conditionValue
        : undefined;
    return { pre: n !== undefined ? tpl.replace('{n}', String(n)) : tpl };
  };

  // ── Cycle de capture (harnais) : un scénario = UNE ligne de dégâts ──
  // Le `+` d'une cellule fige z (TOUS les réglages UI) + réglages de compte +
  // la ligne (slot × branche) + la valeur EN JEU saisie.
  const saveCell = (slot: string, branch: DamageBranch, real: number) => {
    const entry: SavedScenario = {
      atk: attacker?.label ?? '?',
      tgt: target ? target.name : `${tgtElement ?? '?'} (${L.target.manual})`,
      slot,
      branch,
      real,
      z: packZ(),
      ...(codexLvl > 0 ? { codex: codexLvl } : {}),
      ...(guildLvl > 0 ? { guild: guildLvl } : {}),
      ...(premiumOn ? { premium: true } : {}),
      ...(Object.keys(activeQuirks).length ? { quirks: activeQuirks } : {}),
      gameVersion: ENGINE_GAME_VERSION,
      savedAt: new Date().toISOString(),
    };
    setSavedScns((prev) => {
      const i = prev.findIndex((s) => scnKey(s) === scnKey(entry));
      return i >= 0 ? prev.map((s, j) => (j === i ? entry : s)) : [...prev, entry];
    });
    say(`${entry.slot} ${entry.branch} sauvegardé`);
  };

  // Calculés des scénarios sauvegardés — REJOUÉS à l'affichage par le même
  // pont, jamais stockés : un moteur qui bouge se voit immédiatement dans le
  // Δ. Pas de useMemo : le React Compiler mémoïse seul.
  const savedCalcs = (): { calcs: Map<string, number>; pending: Set<string> } => {
    const calcs = new Map<string, number>();
    // Lignes EN ATTENTE : le slot existe mais sa chaîne de hits est irrésolue
    // (§ 12.4) — la valeur en jeu est gardée, le Δ attendra le moteur.
    const pending = new Set<string>();
    const out = { calcs, pending };
    if (!dmgData) return out;
    for (const s of savedScns) {
      try {
        const st = JSON.parse(
          LZString.decompressFromEncodedURIComponent(s.z) || 'null',
        ) as UrlState | null;
        if (!st) continue;
        const inp = buildInputsFromZ(st, {
          codexLevel: s.codex ?? 0,
          guildLevel: s.guild ?? 0,
          premiumHp: s.premium === true,
          ...(s.quirks ? { quirks: s.quirks } : {}),
          resolvePreset: resolvePresetLocal,
          resolveGear: resolveGearLocal,
        });
        if (!inp.attacker || !inp.target) continue;
        const r = buildDamageReport(inp.attacker, inp.target, dmgData, {
          ...(s.branch === 'miss' ? { includeMissBranch: true } : {}),
          ...(inp.targetsHit !== undefined ? { targetsHit: inp.targetsHit } : {}),
        });
        const hit = flattenReport(r).find((l) => l.slot === s.slot && l.branch === s.branch);
        if (hit) {
          calcs.set(scnKey(s), hit.damage);
        } else {
          const base = s.slot.split('#')[0];
          const stuck = r.slots.some(
            (sl) =>
              sl.hitsUnresolved === true &&
              sl.report.states.length === 0 &&
              `${sl.slot}${sl.burst !== undefined ? `b${sl.burst}` : ''}` === base,
          );
          if (stuck) pending.add(scnKey(s));
        }
      } catch {
        // z illisible → pas de calculé, la ligne l'affiche « — »
      }
    }
    return out;
  };

  // « Charger » : re-remplit le calculateur ENTIER (reset + applyZ + réglages
  // de compte) puis pré-remplit la cellule observée et coche sa branche.
  const loadSaved = (s: SavedScenario) => {
    if (!loadScenario(s)) {
      say(`${s.atk} vs ${s.tgt} : z illisible — non chargé`);
      return;
    }
    setObs({ [`${s.slot}|${s.branch}`]: String(s.real) });
    setBranchOn((p) => ({ ...p, [s.branch]: true }));
    say(`${s.atk} vs ${s.tgt} chargé`);
  };

  // « ⧉ JSON » : le DamageFixture (une ligne observée) à committer dans
  // src/lib/damage/fixtures/ puis référencer dans fixtures/index.ts.
  const copyScenario = (s: SavedScenario) => {
    const fixture: DamageFixture = {
      name: `${s.atk} vs ${s.tgt} · ${s.slot} ${s.branch}`,
      z: s.z,
      ...(s.codex !== undefined ? { codex: s.codex } : {}),
      ...(s.guild !== undefined ? { guild: s.guild } : {}),
      ...(s.premium ? { premium: true } : {}),
      ...(s.quirks ? { quirks: s.quirks } : {}),
      gameVersion: s.gameVersion,
      observed: [{ slot: s.slot, branch: s.branch, damage: s.real }],
    };
    void navigator.clipboard
      .writeText(JSON.stringify(fixture, null, 2))
      .then(() => say('copié — coller dans src/lib/damage/fixtures/'));
  };

  const deleteScenario = (s: SavedScenario) =>
    setSavedScns((prev) => prev.filter((x) => scnKey(x) !== scnKey(s)));

  // Import : une fixture ⧉ (ou un tableau de fixtures) → un scénario sauvé
  // PAR ligne observée, upsert par clé (z + slot + branche) comme le `+`.
  const importScenarios = () => {
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(importTxt);
    } catch {
      say('JSON illisible — rien importé');
      return;
    }
    const list = (Array.isArray(parsed) ? parsed : [parsed]) as Partial<DamageFixture>[];
    const entries: SavedScenario[] = [];
    for (const f of list) {
      if (typeof f?.z !== 'string' || !Array.isArray(f.observed)) continue;
      // Libellés d'affichage : le nom ⧉ suit « atk vs tgt · ligne » — sinon
      // le nom entier sert d'attaquant (affichage seulement, le z fait foi).
      const name = typeof f.name === 'string' ? f.name : '';
      const m = /^(.+?) vs (.+?)(?: · .+)?$/.exec(name);
      for (const o of f.observed) {
        const branchOk =
          typeof o?.branch === 'string' && ['normal', 'critical', 'miss'].includes(o.branch);
        if (typeof o?.slot !== 'string' || !branchOk) continue;
        if (typeof o.damage !== 'number' || o.damage <= 0) continue;
        entries.push({
          atk: m?.[1] ?? (name || 'import'),
          tgt: m?.[2] ?? '?',
          slot: o.slot,
          branch: o.branch as DamageBranch,
          real: o.damage,
          z: f.z,
          ...(typeof f.codex === 'number' && f.codex > 0 ? { codex: f.codex } : {}),
          ...(typeof f.guild === 'number' && f.guild > 0 ? { guild: f.guild } : {}),
          ...(f.premium === true ? { premium: true } : {}),
          ...(f.quirks && typeof f.quirks === 'object' ? { quirks: f.quirks } : {}),
          gameVersion: typeof f.gameVersion === 'string' ? f.gameVersion : '?',
          savedAt: new Date().toISOString(),
        });
      }
    }
    if (!entries.length) {
      say('aucune ligne valide — rien importé');
      return;
    }
    setSavedScns((prev) => {
      const next = [...prev];
      for (const e of entries) {
        const i = next.findIndex((s) => scnKey(s) === scnKey(e));
        if (i >= 0) next[i] = e;
        else next.push(e);
      }
      return next;
    });
    setImportTxt('');
    setImportOpen(false);
    say(`${entries.length} ligne(s) importée(s)`);
  };

  // Rejoué une fois par rendu (hors harnais : aucun scénario, maps vides).
  const savedCalcMap = devMode
    ? savedCalcs()
    : { calcs: new Map<string, number>(), pending: new Set<string>() };

  const offensiveSkills = kit.filter((s) => s.offensive);
  const supportSkills = kit.filter((s) => !s.offensive);

  const wellClass = 'border-line-subtle bg-surface-sunken/70 rounded-lg border';

  // Cadre de DEBUG (Sevih 27/07/2026) : l'état exact que le moteur consommera
  // — savoir ce qu'on a et ce qui est actif pendant le branchement du rapport.
  const debugState = {
    attacker: attacker
      ? {
          id: attacker.id,
          level,
          transcend: attacker.transcend[transcend]?.label ?? null,
          // Le palier 0..5 est LA valeur de calcul ; le niveau saisi ne sert
          // qu'à l'UI (paliers tous les 20 — Sevih 03/08/2026).
          affinity: { level: affinityLvl, tier: affinityTier },
          skills: skillLvls,
          weapon: weapon ? { slug: weapon.slug, tier: weaponTier } : null,
          amulet: amulet ? { slug: amulet.slug, tier: amuletTier } : null,
          sets: setPicks,
          roguesCharm: talismanOn,
          ee: ee && eeOwned ? { level: eeLevel } : null,
          stats: statVals,
          hpPct,
        }
      : null,
    target:
      targetTab === 'manual'
        ? {
            manual: {
              element: tgtElement,
              stats: tgtStats,
              boss: tgtBoss,
              guildBuff: tgtGuildBuff,
              titleBuff: tgtTitleBuff,
              hpPct: tgtHpPct,
            },
          }
        : target
          ? {
              id: target.id,
              mode: target.mode,
              spawn: spawn ? { label: spawn.label, level: spawn.level, stats: spawn.stats } : null,
              hpPct: tgtHpPct,
            }
          : null,
    context: { targetsHit, targetBroken: tgtBroken, attackerFx: atkFx, targetFx: tgtFx },
    team: allies
      .filter((a) => a.id)
      .map((a) => ({
        id: a.id,
        transcend: chars.find((c) => c.id === a.id)?.transcend[a.transcend]?.label ?? null,
        talisman: a.talisman ? { main: a.talisman, lv: a.talismanLv } : null,
        ee: a.id && ees[a.id] ? { owned: a.ee, plus10: a.eePlus } : null,
      })),
    quirks: Object.fromEntries(Object.entries(quirkLvls).filter(([, v]) => v > 0)),
    codex: codexLvl,
    guild: guildLvl,
    premium: premiumOn,
  };

  return (
    <div className="mx-auto w-full max-w-400 space-y-4">
      {/* Bandeau : le CAVEAT du moteur (ce qui n'est pas encore compté). */}
      <div className="border-warn/30 bg-warn/10 text-warn rounded-lg border px-4 py-2.5 text-center text-sm">
        {L.report.wip}
      </div>

      {/* Onglets : le calculateur, et le réglage de COMPTE (quirks) à côté. */}
      <div className="border-line-subtle bg-surface-sunken/70 mx-auto grid w-full max-w-md grid-cols-2 gap-1 rounded-lg border p-1">
        {(['calc', 'settings'] as const).map((tb) => (
          <button
            key={tb}
            type="button"
            className={`h-8 cursor-pointer rounded-md text-xs font-bold transition ${
              tab === tb ? 'bg-accent text-surface-base' : 'text-content-muted hover:text-content'
            }`}
            onClick={() => setTab(tb)}
          >
            {tb === 'calc' ? L.title : L.settings.title}
          </button>
        ))}
      </div>

      {tab === 'settings' && (
        <div className="mx-auto w-full max-w-3xl space-y-4">
          <p className="text-content-subtle text-center text-xs">{L.settings.subtitle}</p>

          {/* Codex (archive) : % de la stat de BASE seule, HORS multiplicateur
            de buffs (CalcFinalStat § 3) — le moteur devra retrancher ce terme
            de la fiche saisie avant d'appliquer les buffs (27/07/2026). */}
          <Card title={L.settings.codex}>
            <div className="flex items-center gap-3">
              {/* La courbe est indexée PAR NIVEAU : [0] = niveau 0 (0 %),
                [1..11] = les 11 paliers du jeu. */}
              <span className="text-content-muted min-w-0 flex-1 font-mono text-[11px] tabular-nums">
                {codexLvl > 0 && codexTiers[codexLvl]
                  ? ['atk', 'def', 'hp']
                      .map(
                        (s) =>
                          `${s.toUpperCase()} +${(codexTiers[codexLvl][s as 'atk' | 'def' | 'hp'] ?? 0) / 10}%`,
                      )
                      .join(' · ')
                  : '—'}
              </span>
              <Stepper
                value={Math.min(codexLvl, codexTiers.length - 1)}
                min={0}
                max={codexTiers.length - 1}
                onChange={setCodexLvl}
                format={(v) => `Lv ${v}`}
              />
            </div>
          </Card>

          {/* Guilde : buff MAX_HP (§ 16.2) — le NIVEAU est un réglage de
            compte ; son application dépend du MODE du contenu (preset) ou de
            la coche de la cible manuelle. */}
          <Card title={L.settings.guild}>
            <div className="flex items-center gap-3">
              {/* Indexé PAR NIVEAU : [0] = sans guilde (0 %), [1..10] = paliers. */}
              <span className="text-content-muted min-w-0 flex-1 font-mono text-[11px] tabular-nums">
                {guildLvl > 0 && guildTiers[guildLvl] ? `HP +${guildTiers[guildLvl]}%` : '—'}
              </span>
              <Stepper
                value={Math.min(guildLvl, guildTiers.length - 1)}
                min={0}
                max={guildTiers.length - 1}
                onChange={setGuildLvl}
                format={(v) => `Lv ${v}`}
              />
            </div>
          </Card>

          {/* Titre « Premium Body » (+5 % PV, § 16.2) : accordé côté SERVEUR
            (pass) — introuvable en jeu (Sevih 05/08/2026), exposé ici pour
            que les fixtures disent s'il matche quelque part. */}
          <Card title={L.settings.premium}>
            <label className="flex cursor-pointer items-center gap-3">
              <span className="text-content-muted min-w-0 flex-1 font-mono text-[11px] tabular-nums">
                {premiumOn && titleHpPct > 0 ? `HP +${titleHpPct}%` : '—'}
              </span>
              <input
                type="checkbox"
                checked={premiumOn}
                onChange={() => setPremiumOn(!premiumOn)}
                className="accent-accent h-4 w-4 cursor-pointer"
              />
            </label>
          </Card>

          {/* Tout à 0 / tout au max — réglage de COMPTE, pas de scénario. */}
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => setQuirkLvls({})}
              className="border-line-subtle text-content-subtle hover:text-content h-8 cursor-pointer rounded-lg border border-dashed px-3 text-xs"
            >
              {L.settings.reset}
            </button>
            <button
              type="button"
              onClick={() =>
                setQuirkLvls(
                  Object.fromEntries(quirks.flatMap((g) => g.nodes.map((n) => [n.id, n.maxLevel]))),
                )
              }
              className="border-line-subtle text-content-subtle hover:text-content h-8 cursor-pointer rounded-lg border border-dashed px-3 text-xs"
            >
              {L.settings.activateAll}
            </button>
          </div>
          {quirks.map((g) => (
            <Card key={g.key} title={g.label}>
              <div className="space-y-1.5">
                {g.nodes.map((n) => {
                  const lvl = Math.max(0, Math.min(quirkLvls[n.id] ?? 0, n.maxLevel));
                  return (
                    <div
                      key={n.id}
                      className={`border-line-subtle bg-surface-sunken/70 flex items-center gap-2.5 rounded-lg border px-2.5 py-2 ${lvl ? '' : 'opacity-60'}`}
                    >
                      <span
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-full"
                        style={{
                          background: `radial-gradient(circle, color-mix(in srgb, ${n.color} 22%, #0b0e14) 0%, #0b0e14 78%)`,
                          border: `2px solid ${n.color}`,
                        }}
                      >
                        <img src={n.iconSrc} alt="" className="h-4.5 w-4.5" draggable={false} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-content truncate text-xs font-semibold">{n.name}</p>
                        {/* À 0 : aperçu de l'effet Lv1 (le nœud dit ce qu'il ferait). */}
                        <GameText
                          text={n.texts[Math.max(1, lvl) - 1] ?? ''}
                          className="text-content-muted text-[11px] leading-relaxed whitespace-pre-line"
                        />
                      </div>
                      <Stepper
                        value={lvl}
                        min={0}
                        max={n.maxLevel}
                        onChange={(v) => setQuirkLvls((prev) => ({ ...prev, [n.id]: v }))}
                        format={(v) => `${v}/${n.maxLevel}`}
                      />
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'calc' && (
        // Reset du scénario + partage : l'URL EST l'état (Sevih 27/07/2026).
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={resetScenario}
            className="border-line-subtle text-content-subtle hover:text-content h-7 cursor-pointer rounded-lg border border-dashed px-3 text-xs"
          >
            {L.toolbar.reset}
          </button>
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(flushShareUrl()).then(() => {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1500);
              });
            }}
            className="border-line-subtle text-content-subtle hover:text-content h-7 cursor-pointer rounded-lg border border-dashed px-3 text-xs"
          >
            {copied ? L.toolbar.copied : L.toolbar.copy}
          </button>
        </div>
      )}

      {tab === 'calc' && (
        <div className="grid items-start gap-4 xl:grid-cols-[7fr_6fr_12fr]">
          {/* ═══ COLONNE 1 — ATTAQUANT ═══ */}
          <div className="min-w-0 space-y-4">
            <Card title={L.panels.attacker}>
              <CharPicker
                chars={chars}
                value={attackerId}
                onPick={pickAttacker}
                onClear={() => setAttackerId(null)}
                placeholder={L.pick}
                labels={L}
                aside={
                  // Transcendance : les PALIERS RÉELS du perso, même slider que
                  // la fiche (demande Sevih 27/07/2026), logé sous le nom.
                  attacker && attacker.transcend.length > 0 ? (
                    <TranscendSlider
                      tiers={attacker.transcend}
                      idx={transcend}
                      onIdx={setTranscend}
                    />
                  ) : undefined
                }
              />

              {/* Niveau (1..120, défaut 120) : requis par le terme Codex de la
                reconstruction fiche → combat (spec § 16.1 — Sevih 03/08/2026). */}
              {attacker && (
                <div className="flex items-center gap-2">
                  <span className="text-content-subtle font-mono text-[9px] tracking-wide uppercase">
                    {L.target.lv}
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={120}
                    value={level}
                    onChange={(e) => setLevel(Number(e.target.value))}
                    className="h-3 min-w-0 flex-1 cursor-pointer accent-sky-500"
                    aria-label={`${L.target.lv} ${level}`}
                  />
                  <span className="text-content font-mono text-xs tabular-nums">{level}</span>
                </div>
              )}

              {/* Affinité (Trust) : saisie au NIVEAU 0..100, paliers tous les
                20 (Sevih 03/08/2026) — seuls les paliers 0..5 comptent pour
                les calculs (buffs passifs plats ABSENTS de la fiche affichée,
                le moteur les ajoutera — binaire 27/07/2026). */}
              {attacker && (
                <div className="flex items-center gap-2">
                  <span className="text-content-subtle font-mono text-[9px] tracking-wide uppercase">
                    {L.affinity}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={affinityLvl}
                    onChange={(e) => setAffinityLvl(Number(e.target.value))}
                    className="h-3 min-w-0 flex-1 cursor-pointer accent-sky-500"
                    aria-label={`${L.affinity} ${affinityLvl}`}
                  />
                  <span className="text-content font-mono text-xs tabular-nums">{affinityLvl}</span>
                  <span className="text-content-subtle font-mono text-[10px] tabular-nums">
                    {affinityTier}/5
                  </span>
                </div>
              )}
            </Card>

            {/* Ordre de la colonne (Sevih 27/07/2026) : perso → stats → skills
              → équipement. */}
            {attacker && (
              <Card
                title={L.stats.title}
                right={<span className="text-content-subtle text-[10px]">{L.stats.sheetNote}</span>}
              >
                <div className="grid grid-cols-2 gap-2">
                  {sheetFields.map((f) => (
                    <label key={f.key} className="min-w-0 space-y-1">
                      <span className="text-content-subtle block truncate font-mono text-[9px] tracking-wide uppercase">
                        {f.label}
                      </span>
                      <span className="border-line-subtle bg-surface-sunken/70 focus-within:border-accent flex h-8 w-full min-w-0 items-center gap-1 rounded-lg border px-2">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={statVals[f.key] ?? ''}
                          onChange={(e) => setStatVals((s) => ({ ...s, [f.key]: e.target.value }))}
                          className="text-content w-full min-w-0 flex-1 bg-transparent font-mono text-sm font-bold tabular-nums outline-none"
                        />
                        {f.percent && <span className="text-content-subtle text-xs">%</span>}
                      </span>
                    </label>
                  ))}
                </div>
              </Card>
            )}

            {attacker && (
              <Card title={L.skills.title}>
                {/* Niveaux de skill indépendants (chain/dual hors périmètre),
                  en COLONNES : slot / icône / tag / niveau, côte à côte. */}
                <div className="grid grid-cols-3 gap-1.5">
                  {kit.map((row) => (
                    <div
                      key={row.slot}
                      className={`${wellClass} flex flex-col items-center gap-1.5 px-1 py-2`}
                      title={row.name}
                    >
                      <span className="text-content-subtle font-mono text-[10px] font-bold">
                        {row.slot}
                      </span>
                      {/* Icône décorative (le nom est le title du puits et
                        l'en-tête du popover) — alt vide, règle CONVENTIONS. */}
                      <SkillIconTip row={row} lvl={skillLvls[row.slot] ?? row.maxLevel} lang={lang}>
                        {row.iconSrc ? (
                          <img
                            src={row.iconSrc}
                            alt=""
                            aria-hidden
                            width={36}
                            height={36}
                            className="block h-9 w-9 rounded-lg"
                            loading="lazy"
                          />
                        ) : (
                          <span className="border-line-subtle bg-surface-raised/60 block h-9 w-9 rounded-lg border" />
                        )}
                      </SkillIconTip>
                      <SkillTag offensive={row.offensive} labels={L} />
                      <Stepper
                        value={skillLvls[row.slot] ?? row.maxLevel}
                        min={1}
                        max={row.maxLevel}
                        onChange={(v) => setSkillLvls((s) => ({ ...s, [row.slot]: v }))}
                        format={(v) => `Lv ${v}`}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {attacker && (
              <Card title={L.equipment.title}>
                {/* 6 cases (Sevih 27/07/2026) : arme / accessoire, set 1 / set 2,
                  EE / talisman. Sets de COMBAT seuls (les sets de stats sont
                  dans la fiche). */}
                <div className="grid gap-1.5 sm:grid-cols-2">
                  <GearSlot
                    title={L.equipment.weapon}
                    placeholder={L.equipment.pickWeapon}
                    options={pickableWeapons}
                    value={weapon}
                    tier={weaponTier}
                    attackerCls={attacker.cls}
                    onPick={(slug) => {
                      setWeaponSlug(slug);
                      setWeaponTier(0);
                    }}
                    onClear={() => setWeaponSlug(null)}
                    onTier={setWeaponTier}
                    labels={L}
                  />
                  <GearSlot
                    title={L.equipment.accessory}
                    placeholder={L.equipment.pickAccessory}
                    options={pickableAmulets}
                    value={amulet}
                    tier={amuletTier}
                    attackerCls={attacker.cls}
                    onPick={(slug) => {
                      setAmuletSlug(slug);
                      setAmuletTier(0);
                    }}
                    onClear={() => setAmuletSlug(null)}
                    onTier={setAmuletTier}
                    labels={L}
                  />

                  <SetsSlot sets={sets} picks={setPicks} onChange={setSetPicks} labels={L} />

                  <div className={`${wellClass} space-y-1.5 p-2`}>
                    {/* Même garde anti-débordement que GearSlot : le titre EE
                      est long, le Stepper wrappe sous lui au lieu de sortir
                      de la case (bug signalé Sevih 03/08/2026). */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <Eyebrow>{L.equipment.ee}</Eyebrow>
                      {/* Le niveau sert aux mains « dégâts vs élément » ET au
                        choix du palier de passif Lv0/Lv10 — visible pour TOUT
                        EE possédé (demande Sevih 03/08/2026 ; il n'était
                        affiché qu'avec une main dmgMain). */}
                      {eeOwned && ee && (
                        <Stepper
                          value={eeLevel}
                          min={0}
                          max={10}
                          onChange={setEeLevel}
                          format={(v) => `+${v}`}
                          className="ml-auto shrink-0"
                        />
                      )}
                    </div>
                    {ee ? (
                      <>
                        {/* Même motif que le talisman : checkbox « possédé »
                          (+0 ≠ absent : le passif Lv0 s'applique dès qu'on le
                          porte), en-tête icône + nom, puis les descriptions en
                          PLEINE LARGEUR de la case (demande Sevih 27/07/2026). */}
                        <label className="flex cursor-pointer items-center gap-2">
                          <input
                            type="checkbox"
                            checked={eeOwned}
                            onChange={() => setEeOwned(!eeOwned)}
                            className="accent-accent h-3.5 w-3.5 cursor-pointer"
                          />
                          <EquipmentIcon src={ee.src} grade={ee.grade} size={34} />
                          <div className="min-w-0">
                            <p
                              className={`text-xs font-semibold wrap-break-word ${eeOwned ? 'text-content' : 'text-content-subtle'}`}
                            >
                              {ee.name}
                            </p>
                            {eeOwned && ee.dmgMain && (
                              <p className="text-accent font-mono text-[11px] font-bold tabular-nums">
                                {ee.dmgMain.label} +{(ee.dmgMain.levels[eeLevel] ?? 0) / 10}%
                              </p>
                            )}
                          </div>
                        </label>
                        {/* Un palier par ligne : Lv0 / Lv10 SÉPARÉS (le palier
                          +10 remplace le précédent), « + » quand il s'AJOUTE.
                          Le palier inactif AU NIVEAU CHOISI est grisé : sous
                          +10 les lignes Lv10 dorment ; à +10 une ligne Lv10
                          non-« + » remplace la Lv0. */}
                        {ee.rows.map((row, i) => {
                          const lv10Replaces = ee.rows.some((r) => r.level >= 10 && !r.isAdd);
                          const active =
                            eeLevel >= 10 ? row.level >= 10 || !lv10Replaces : row.level < 10;
                          return (
                            <div
                              key={i}
                              className={`flex items-start gap-1.5 ${eeOwned && active ? '' : 'opacity-60'}`}
                            >
                              <span className="border-line-subtle text-accent mt-0.5 rounded border px-1 font-mono text-[9px] font-bold whitespace-nowrap">
                                {row.isAdd ? '+' : ''}
                                {row.level >= 10 ? L.equipment.lv10 : L.equipment.lv0}
                              </span>
                              <GameText
                                text={row.html}
                                className={`min-w-0 flex-1 text-[11px] leading-relaxed whitespace-pre-line ${eeOwned && active ? 'text-content-muted' : 'text-content-subtle'}`}
                              />
                            </div>
                          );
                        })}
                      </>
                    ) : (
                      <p className="text-content-subtle text-[11px]">{L.equipment.eeNone}</p>
                    )}
                  </div>

                  {/* Rogue's Charm : une CASE À COCHER — équipé au +10 ou non
                    (seul son passif +10, dégâts sur cible break, compte). */}
                  <div className={`${wellClass} space-y-1 p-2`}>
                    <Eyebrow>{L.equipment.talisman}</Eyebrow>
                    {talisman && (
                      <>
                        <label className="flex cursor-pointer items-center gap-2">
                          <input
                            type="checkbox"
                            checked={talismanOn}
                            onChange={() => setTalismanOn(!talismanOn)}
                            className="accent-accent h-3.5 w-3.5 cursor-pointer"
                          />
                          <EquipmentIcon
                            icon={talisman.icon}
                            grade={talisman.grade}
                            size={34}
                            stars={talisman.star}
                            overlayIcon={talisman.overlayIcon}
                          />
                          <span
                            className={`min-w-0 text-xs font-semibold wrap-break-word ${talismanOn ? 'text-content' : 'text-content-subtle'}`}
                          >
                            {talisman.label} +10
                          </span>
                        </label>
                        {talisman.text && (
                          <GameText
                            text={talisman.text}
                            className={`text-[11px] leading-relaxed whitespace-pre-line ${talismanOn ? 'text-content-muted' : 'text-content-subtle opacity-60'}`}
                          />
                        )}
                      </>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* ═══ COLONNE 2 — CIBLE (et l'équipe sur le terrain) ═══ */}
          <div className="min-w-0 space-y-4">
            <Card title={L.panels.target}>
              {/* Preset (donjon réel) OU saisie manuelle (Sevih 27/07/2026). */}
              <div className="border-line-subtle bg-surface-sunken/70 grid grid-cols-2 gap-1 rounded-lg border p-1">
                {(['preset', 'manual'] as const).map((tb) => (
                  <button
                    key={tb}
                    type="button"
                    className={`h-7 cursor-pointer rounded-md text-xs font-bold transition ${
                      targetTab === tb
                        ? 'bg-accent text-surface-base'
                        : 'text-content-muted hover:text-content'
                    }`}
                    onClick={() => setTargetTab(tb)}
                  >
                    {tb === 'preset' ? L.target.preset : L.target.manual}
                  </button>
                ))}
              </div>

              {targetTab === 'preset' ? (
                <div className="space-y-2">
                  <TargetPicker
                    targets={targets}
                    modes={modes}
                    value={target}
                    level={spawn?.level}
                    onPick={(id) => {
                      setTargetId(id);
                      setSpawnIdx(0);
                    }}
                    onClear={() => setTargetId(null)}
                    labels={L}
                  />

                  {target && (
                    <>
                      {target.line ? (
                        // LIGNE de guild raid : un seul sélecteur de stage qui
                        // traverse les entrées de la ligne (chaque stage est
                        // un donjon/monstre distinct → bascule de targetId) et
                        // finit sur les stages d'OVERGRADE (spawns du dernier
                        // stage templeté du main boss → bascule de spawnIdx).
                        <label className="block space-y-1">
                          <span className="text-content-subtle font-mono text-[9px] tracking-wide uppercase">
                            {L.target.stage}
                          </span>
                          <select
                            value={`${target.id}|${spawnIdx}`}
                            onChange={(e) => {
                              const sep = e.target.value.lastIndexOf('|');
                              setTargetId(e.target.value.slice(0, sep));
                              setSpawnIdx(Number(e.target.value.slice(sep + 1)));
                            }}
                            className={SELECT_CLASS}
                          >
                            {targets
                              .filter((t) => t.line === target.line)
                              .sort((a, b) => (a.stage ?? 0) - (b.stage ?? 0))
                              .flatMap((t) =>
                                t.spawns.map((s, si) => (
                                  <option key={`${t.id}|${si}`} value={`${t.id}|${si}`}>
                                    {s.label || vars(L.target.fight, { n: si + 1 })} · {L.target.lv}{' '}
                                    {s.level}
                                  </option>
                                )),
                              )}
                          </select>
                        </label>
                      ) : (
                        target.spawns.length > 1 && (
                          <label className="block space-y-1">
                            <span className="text-content-subtle font-mono text-[9px] tracking-wide uppercase">
                              {target.ranked ? L.target.rank : L.target.stage}
                            </span>
                            <select
                              value={spawnIdx}
                              onChange={(e) => setSpawnIdx(Number(e.target.value))}
                              className={SELECT_CLASS}
                            >
                              {target.spawns.map((s, i) => (
                                <option key={i} value={i}>
                                  {s.label || vars(L.target.fight, { n: i + 1 })} · {L.target.lv}{' '}
                                  {s.level}
                                </option>
                              ))}
                            </select>
                          </label>
                        )
                      )}
                      {spawn && (
                        // Stats défensives EFFECTIVES du spawn (adv/bossHp déjà
                        // appliqués) — celles qui pèsent sur les dégâts, en
                        // clair et SANS troncature (demande Sevih 27/07/2026).
                        <div className="grid grid-cols-2 gap-1.5">
                          {targetStatFields.map((f) => (
                            <div key={f.key} className={`${wellClass} min-w-0 px-2.5 py-1.5`}>
                              <span className="text-content-subtle block font-mono text-[9px] tracking-wide uppercase">
                                {f.label}
                              </span>
                              <span className="text-content block font-mono text-sm font-bold tabular-nums">
                                {f.percent
                                  ? `${(spawn.stats[f.key as keyof DcSpawn['stats']] ?? 0) / 10}%`
                                  : (
                                      spawn.stats[f.key as keyof DcSpawn['stats']] ?? 0
                                    ).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="space-y-1">
                    <span className="text-content-subtle block font-mono text-[9px] tracking-wide uppercase">
                      {L.target.element}
                    </span>
                    <div className="flex gap-1.5">
                      {ELEMENT_ORDER.map((el) => (
                        <FilterPill
                          key={el}
                          active={tgtElement === el}
                          onClick={() => setTgtElement(tgtElement === el ? null : el)}
                          className="h-8 w-8 px-0"
                          title={el}
                        >
                          <img
                            src={img.element(el)}
                            alt={el}
                            className="h-5 w-5"
                            width={20}
                            height={20}
                          />
                        </FilterPill>
                      ))}
                    </div>
                  </div>

                  {/* Conditionnels « vs boss » — les presets sont TOUS des
                    boss, en manuel il faut le dire (Sevih 27/07/2026). */}
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={tgtBoss}
                      onChange={() => setTgtBoss(!tgtBoss)}
                      className="accent-accent h-3.5 w-3.5 cursor-pointer"
                    />
                    <span className="text-content-muted text-xs">{L.target.bossFlag}</span>
                  </label>

                  {/* Buffs MAX_HP (§ 16.2) : en manuel le MODE est inconnu →
                    une coche PAR buff (listes de modes différentes) ; sans
                    effet si le réglage de compte correspondant est éteint. */}
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={tgtGuildBuff}
                      onChange={() => setTgtGuildBuff(!tgtGuildBuff)}
                      className="accent-accent h-3.5 w-3.5 cursor-pointer"
                    />
                    <span className="text-content-muted text-xs">{L.target.guildBuffFlag}</span>
                  </label>
                  {premiumOn && (
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={tgtTitleBuff}
                        onChange={() => setTgtTitleBuff(!tgtTitleBuff)}
                        className="accent-accent h-3.5 w-3.5 cursor-pointer"
                      />
                      <span className="text-content-muted text-xs">{L.target.titleBuffFlag}</span>
                    </label>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {targetStatFields.map((f) => (
                      <label key={f.key} className="min-w-0 space-y-1">
                        <span className="text-content-subtle block truncate font-mono text-[9px] tracking-wide uppercase">
                          {f.label}
                        </span>
                        <span className="border-line-subtle bg-surface-sunken/70 focus-within:border-accent flex h-8 w-full min-w-0 items-center gap-1 rounded-lg border px-2">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={tgtStats[f.key] ?? ''}
                            onChange={(e) =>
                              setTgtStats((s) => ({ ...s, [f.key]: e.target.value }))
                            }
                            className="text-content w-full min-w-0 flex-1 bg-transparent font-mono text-sm font-bold tabular-nums outline-none"
                          />
                          {f.percent && <span className="text-content-subtle text-xs">%</span>}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Pré-remplit depuis le preset sélectionné (spawn courant). */}
                  <button
                    type="button"
                    disabled={!spawn}
                    onClick={() => {
                      if (!spawn || !target) return;
                      setTgtElement(target.element);
                      setTgtStats(
                        Object.fromEntries(
                          targetStatFields.map((f) => {
                            const v = spawn.stats[f.key as keyof DcSpawn['stats']] ?? 0;
                            return [f.key, String(f.percent ? v / 10 : v)];
                          }),
                        ),
                      );
                    }}
                    className="border-line-subtle text-content-subtle not-disabled:hover:text-content h-8 w-full rounded-lg border border-dashed text-xs not-disabled:cursor-pointer disabled:opacity-40"
                  >
                    {L.target.copyFromSelected}
                  </button>
                </div>
              )}
            </Card>

            <Card
              title={L.panels.team}
              right={<span className="text-content-subtle font-mono text-[9px]">1 + 3</span>}
            >
              <div className="space-y-1.5">
                {/* Par allié : perso + transcendance + main stat du talisman
                  porté — les trois pèsent sur le rapport (Sevih 27/07/2026). */}
                {allies.map((ally, i) => {
                  const patch = (p: Partial<AllyPick>) =>
                    setAllies((all) => all.map((a, j) => (j === i ? { ...a, ...p } : a)));
                  const allyChar = ally.id ? chars.find((c) => c.id === ally.id) : undefined;
                  return (
                    <div key={i} className={ally.id ? `${wellClass} space-y-1.5 p-2` : undefined}>
                      <CharPicker
                        chars={chars.filter(
                          (c) =>
                            c.id !== attackerId && !allies.some((a, j) => j !== i && a.id === c.id),
                        )}
                        value={ally.id}
                        onPick={(id) =>
                          patch({
                            id,
                            // Palier max du perso choisi par défaut.
                            transcend: (chars.find((c) => c.id === id)?.transcend.length ?? 1) - 1,
                          })
                        }
                        onClear={() => patch({ id: null })}
                        placeholder={vars(L.team.emptySlot, { n: i + 2 })}
                        labels={L}
                        aside={
                          allyChar && allyChar.transcend.length > 0 ? (
                            <TranscendSlider
                              tiers={allyChar.transcend}
                              idx={ally.transcend}
                              onIdx={(v) => patch({ transcend: v })}
                            />
                          ) : undefined
                        }
                      />
                      {allyChar && (
                        <div className="flex items-center gap-1.5">
                          <select
                            value={ally.talisman ?? ''}
                            onChange={(e) => patch({ talisman: e.target.value || null })}
                            className={`${SELECT_CLASS} min-w-0 flex-7`}
                            title={L.equipment.talisman}
                          >
                            <option value="">{L.equipment.talisman}</option>
                            {talismanMains.map((m) => (
                              <option key={m.key} value={m.key}>
                                {m.label}
                              </option>
                            ))}
                          </select>
                          {/* Enhancement +0…+10 : le montant de la main stat en
                            dépend (Sevih 27/07/2026). */}
                          {ally.talisman && (
                            <span className="border-line-subtle bg-surface-sunken/70 focus-within:border-accent flex h-8 min-w-0 flex-3 items-center gap-0.5 rounded-lg border px-1.5">
                              <span className="text-content-subtle text-xs">+</span>
                              <input
                                type="number"
                                min={0}
                                max={10}
                                value={ally.talismanLv}
                                onChange={(e) =>
                                  patch({
                                    talismanLv: Math.min(
                                      Math.max(Math.trunc(Number(e.target.value) || 0), 0),
                                      10,
                                    ),
                                  })
                                }
                                className="text-content w-full min-w-0 flex-1 bg-transparent text-right font-mono text-xs font-bold tabular-nums outline-none"
                              />
                            </span>
                          )}
                        </div>
                      )}
                      {/* EE possédé / +10 : certains EE portent sur l'équipe
                        (Sevih 27/07/2026) — seulement si le perso en a un. */}
                      {allyChar && ees[allyChar.id] && (
                        <div className="flex items-center gap-4 px-0.5">
                          <label className="flex cursor-pointer items-center gap-1.5">
                            <input
                              type="checkbox"
                              checked={ally.ee}
                              onChange={() =>
                                patch(ally.ee ? { ee: false, eePlus: false } : { ee: true })
                              }
                              className="accent-accent h-3.5 w-3.5 cursor-pointer"
                            />
                            <span className="text-content-muted text-xs">{L.team.eeOwned}</span>
                          </label>
                          <label
                            className={`flex items-center gap-1.5 ${ally.ee ? 'cursor-pointer' : 'opacity-40'}`}
                          >
                            <input
                              type="checkbox"
                              checked={ally.eePlus}
                              disabled={!ally.ee}
                              onChange={() => patch({ eePlus: !ally.eePlus })}
                              className="accent-accent h-3.5 w-3.5 not-disabled:cursor-pointer"
                            />
                            <span className="text-content-muted text-xs">{L.team.eePlus}</span>
                          </label>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* ═══ COLONNE 3 — RÉGLAGES (méca + buffs), puis RAPPORT dessous
            (disposition Sevih 27/07/2026 : Attaquant / Cible / Réglages, le
            résultat sous les réglages). ═══ */}
          <div className="min-w-0 space-y-4">
            {/* CONTEXTE = tout ce qui entoure le combat (fusion Sevih
              27/07/2026) : cibles touchées + buffs/débuffs de scénario. Le
              type de contenu se déduit du preset, le PvP est hors périmètre. */}
            <Card
              title={L.context.title}
              right={
                <span className="text-content-subtle font-mono text-[9px]">
                  {atkFx.length + tgtFx.length}
                </span>
              }
            >
              {/* Les buffs STANDARDISÉS du jeu, à bascule — seulement ceux qui
                pèsent sur les dégâts, filtrés comme la saisie des stats.
                DEUX colonnes avec portrait — l'attaquant et la cible — chacune
                avec ses buffs puis ses débuffs ; rien ne s'affiche tant que les
                deux combattants ne sont pas choisis (Sevih 27/07/2026). */}
              {!attacker || !targetReady ? (
                <p className="text-content-subtle px-2 py-6 text-center text-xs">
                  {L.buffs.awaitPick}
                </p>
              ) : (
                <>
                  {/* PV actuels des deux combattants — c'est du CONTEXTE (Sevih
                    27/07/2026) : sets « missing Health » côté attaquant, skills
                    sur PV max/actuels/manquants côté cible. */}
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { label: L.context.attackerHp, value: hpPct, set: setHpPct },
                        { label: L.context.targetHp, value: tgtHpPct, set: setTgtHpPct },
                      ] as const
                    ).map((f) => (
                      <label key={f.label} className="min-w-0 space-y-1">
                        <span className="text-content-subtle block truncate font-mono text-[9px] tracking-wide uppercase">
                          {f.label}
                        </span>
                        <span className="border-line-subtle bg-surface-sunken/70 focus-within:border-accent flex h-8 w-full min-w-0 items-center gap-1 rounded-lg border px-2">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={f.value}
                            onChange={(e) => f.set(e.target.value)}
                            className="text-content w-full min-w-0 flex-1 bg-transparent font-mono text-sm font-bold tabular-nums outline-none"
                          />
                          <span className="text-content-subtle text-xs">%</span>
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Cible en BREAK — état de combat qui pèse via § 9.1
                    (Rogue's Charm +10, set Pulverization, EE Lv10…). */}
                  <label className="flex cursor-pointer items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={tgtBroken}
                      onChange={() => setTgtBroken(!tgtBroken)}
                      className="accent-accent"
                    />
                    <span className={tgtBroken ? 'text-content' : 'text-content-muted'}>
                      {L.target.breakFlag}
                    </span>
                  </label>

                  {/* Boss ENRAGÉ (z `en`) : les buffs de son skill d'enrage
                    (ex. Chimera : DMG Reduce +40 pts) et ses passifs
                    `OWNER_RAGE` s'activent — coche visible seulement quand le
                    preset a un skill d'enrage, jamais deviné. */}
                  {target?.hasRage && (
                    <label className="flex cursor-pointer items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={tgtEnraged}
                        onChange={() => setTgtEnraged(!tgtEnraged)}
                        className="accent-accent"
                      />
                      <span className={tgtEnraged ? 'text-content' : 'text-content-muted'}>
                        {L.target.enrageFlag}
                      </span>
                    </label>
                  )}

                  {/* Mécaniques PERSO (entrées `stateful` du moteur) : conditions
                    d'état de combat des passifs kit/EE/quirks — ex. les 5 Kaizer
                    Energy du S3 de Noa. Jamais évaluées par le moteur
                    (CheckAvailable § 12.1) : la coche déclare « remplie en jeu »
                    et voyage dans z (`cs`). Libellé = nom du jeu de la source. */}
                  {statefulPassives.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-content-subtle font-mono text-[9px] tracking-wide uppercase">
                        {L.context.mechanics}
                      </span>
                      <p className="text-content-subtle text-[10px]">{L.context.mechanicsHint}</p>
                      {statefulPassives.map((e) => {
                        const m = mechLabel(e);
                        const cond = mechCond(e);
                        const on = metConds.includes(e.buffId);
                        return (
                          <label
                            key={`${e.source}:${e.sourceId}:${e.buffId}`}
                            title={`${e.buffId}${e.condition ? ` · ${e.condition}` : ''}`}
                            className="flex cursor-pointer items-center gap-2 text-xs"
                          >
                            <input
                              type="checkbox"
                              checked={on}
                              onChange={() => toggleFx(setMetConds, e.buffId)}
                              className="accent-accent"
                            />
                            <span className={on ? 'text-content' : 'text-content-muted'}>
                              {m.name}
                            </span>
                            {m.slot && (
                              <span className="text-content-subtle font-mono text-[9px]">
                                {m.slot}
                              </span>
                            )}
                            {cond && (
                              <span className="text-content-subtle flex flex-wrap items-center gap-1 text-[10px]">
                                — {cond.pre}
                                {cond.ref && <EffectRefTag r={cond.ref} />}
                                {cond.post}
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Procs dynamiques à STACKS (kit/EE/quirks du porteur +
                    alliés) qui atteignent l'attaquant : jamais simulés — le
                    stepper déclare les stacks posés EN JEU (z `ab`, plafond
                    = StackCount de la ligne). Prouvé 23/08/2026 : 1 S2
                    d'Eris = 1 stack du +20 % Strikers, S1 de Francesca
                    exact. */}
                  {stackableDynamics.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-content-subtle font-mono text-[9px] tracking-wide uppercase">
                        {L.context.stackBuffs}
                      </span>
                      <p className="text-content-subtle text-[10px]">{L.context.stackBuffsHint}</p>
                      {stackableDynamics.map((d) => {
                        const n = stackDecls[d.buffId] ?? 0;
                        const max = d.maxStacks ?? 1;
                        const m = dynLabel(d);
                        const eff = dynEffect(d);
                        return (
                          <label
                            key={`${d.ally ?? ''}:${d.buffId}`}
                            title={`${d.buffId} · ${d.createType}`}
                            className="flex items-center justify-between gap-2 text-xs"
                          >
                            <span
                              className={`flex min-w-0 flex-wrap items-center gap-1.5 ${n > 0 ? 'text-content' : 'text-content-muted'}`}
                            >
                              {m.name}
                              {m.slot && (
                                <span className="text-content-subtle font-mono text-[9px]">
                                  {m.slot}
                                </span>
                              )}
                              <span className="text-content-subtle flex items-center gap-1 text-[10px]">
                                —{d.targetClass && (L.context.classNames[d.targetClass] ?? '')}
                                {eff.ref && <EffectRefTag r={eff.ref} />}
                                {eff.what}
                                <span className="font-mono">{eff.amount}</span>
                                {max > 1 ? vars(L.context.stackMax, { n: max }) : ''}
                              </span>
                            </span>
                            <span className="border-line-subtle bg-surface-sunken/70 focus-within:border-accent flex h-7 w-16 items-center rounded-lg border px-2">
                              <input
                                type="text"
                                inputMode="numeric"
                                value={String(n)}
                                onChange={(e) => {
                                  const v = Number(e.target.value);
                                  const next = Number.isFinite(v)
                                    ? Math.min(Math.max(Math.round(v), 0), max)
                                    : 0;
                                  setStackDecls((all) => {
                                    if (next === 0) {
                                      const rest = { ...all };
                                      delete rest[d.buffId];
                                      return rest;
                                    }
                                    return { ...all, [d.buffId]: next };
                                  });
                                }}
                                className="text-content w-full min-w-0 bg-transparent text-right font-mono text-sm font-bold tabular-nums outline-none"
                              />
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Cibles touchées : SEULEMENT si le kit a un skill offensif
                    multi-cible — la décroissance AoE ne concerne pas les kits
                    mono-cible (décision Sevih 27/07/2026). */}
                  {offensiveSkills.some((s) => s.aoe) && (
                    <div className="space-y-1">
                      <span className="text-content-subtle font-mono text-[9px] tracking-wide uppercase">
                        {L.context.targetsHit}
                      </span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((n) => (
                          <button
                            key={n}
                            type="button"
                            className={`h-7 flex-1 cursor-pointer rounded-md border font-mono text-xs font-bold transition ${
                              targetsHit === n
                                ? 'border-accent bg-accent/15 text-accent'
                                : 'border-line-subtle bg-surface-sunken/70 text-content-subtle hover:text-content'
                            }`}
                            onClick={() => setTargetsHit(n)}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Compteurs § 9.1 (« ×N buffs/débuffs ») — visibles quand un
                    passif du rapport LIT la famille : le scénario déclare les
                    nombres EN JEU (chips comprises), le moteur ne compte
                    jamais à la place du joueur. */}
                  {counterInputs.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-content-subtle font-mono text-[9px] tracking-wide uppercase">
                        {L.context.counters}
                      </span>
                      <p className="text-content-subtle text-[10px]">{L.context.countersHint}</p>
                      {counterInputs.map((c) => (
                        <label
                          key={c.type}
                          className="flex items-center justify-between gap-2 text-xs"
                        >
                          <span className={c.value > 0 ? 'text-content' : 'text-content-muted'}>
                            {c.label}
                          </span>
                          <span className="border-line-subtle bg-surface-sunken/70 focus-within:border-accent flex h-7 w-16 items-center rounded-lg border px-2">
                            <input
                              type="text"
                              inputMode="numeric"
                              value={String(c.value)}
                              onChange={(e) => {
                                const n = Number(e.target.value);
                                const max = 'max' in c ? c.max : 20;
                                c.set(
                                  Number.isFinite(n)
                                    ? Math.min(Math.max(Math.round(n), 0), max)
                                    : 0,
                                );
                              }}
                              className="text-content w-full min-w-0 bg-transparent text-right font-mono text-sm font-bold tabular-nums outline-none"
                            />
                          </span>
                        </label>
                      ))}
                    </div>
                  )}

                  <div className="grid gap-2 sm:grid-cols-2">
                    {(
                      [
                        {
                          key: 'atk',
                          portrait: <CharPortrait c={attacker} className="h-16 w-16" />,
                          name: attacker.label,
                          groups: [
                            { title: L.buffs.atkBuff, options: buffOptions.atkBuff },
                            { title: L.buffs.atkDebuff, options: buffOptions.atkDebuff },
                          ],
                          on: atkFx,
                          set: setAtkFx,
                          passives: bossPassivesFor('attacker'),
                        },
                        {
                          key: 'tgt',
                          portrait: target ? (
                            // Le MÊME composant portrait que le picker et la
                            // tuile de cible (fond de rareté + overlays, rôle
                            // de la donnée — un renfort n'a pas le badge boss).
                            <MonsterPortrait
                              tg={target}
                              level={spawn?.level}
                              className="h-16 w-16"
                            />
                          ) : tgtElement ? (
                            <span className="border-line-subtle grid h-16 w-16 shrink-0 place-items-center rounded-lg border">
                              <img
                                src={img.element(tgtElement)}
                                alt={tgtElement}
                                className="h-8 w-8"
                              />
                            </span>
                          ) : (
                            <span className="border-line-subtle text-content-subtle grid h-16 w-16 shrink-0 place-items-center rounded-lg border text-lg font-bold">
                              ?
                            </span>
                          ),
                          name: target ? target.name : L.target.manual,
                          groups: [
                            { title: L.buffs.tgtBuff, options: buffOptions.tgtBuff },
                            { title: L.buffs.tgtDebuff, options: buffOptions.tgtDebuff },
                          ],
                          on: tgtFx,
                          set: setTgtFx,
                          passives: bossPassivesFor('target'),
                        },
                      ] as const
                    ).map((side) => (
                      <div key={side.key} className={`${wellClass} space-y-2 p-2.5`}>
                        <div className="flex items-center gap-2">
                          {side.portrait}
                          <span className="text-content min-w-0 text-xs font-semibold wrap-break-word">
                            {side.name}
                          </span>
                        </div>
                        {side.groups.map((group) => (
                          <div key={group.title} className="space-y-1">
                            <Eyebrow>{group.title}</Eyebrow>
                            <div className="flex flex-wrap gap-1.5">
                              {relevantFx(group.options).map((o) => {
                                const on = side.on.includes(o.key);
                                return (
                                  <button
                                    key={o.key}
                                    type="button"
                                    aria-pressed={on}
                                    title={o.desc}
                                    onClick={() => toggleFx(side.set, o.key)}
                                    className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-2 py-1 text-xs transition ${
                                      on
                                        ? o.debuff
                                          ? 'border-danger bg-danger/10 text-content'
                                          : 'border-accent bg-accent/10 text-content'
                                        : 'border-line-subtle bg-surface-raised/70 text-content-muted hover:text-content'
                                    }`}
                                  >
                                    <EffectIconTile
                                      icon={o.icon}
                                      isDebuff={o.debuff}
                                      className="h-5 w-5"
                                    />
                                    <span>{o.name}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                        {side.passives.some(bossPassiveShown) && (
                          <div className="space-y-1">
                            <Eyebrow>{L.buffs.bossPassive}</Eyebrow>
                            <div className="flex flex-wrap gap-1.5">
                              {/* Seules les chips ACTIVES pour ce matchup ET qui
                                pèsent un montant sont montrées — pas les 3
                                variantes élémentaires quand une seule concerne
                                l'attaquant, pas la crit chance quand le kit ne
                                la lit pas (Sevih 17/08/2026). */}
                              {side.passives.filter(bossPassiveShown).map((p, i) => (
                                <span
                                  key={`${p.name}:${p.label}:${i}`}
                                  title={p.name}
                                  className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs ${
                                    side.key === 'atk'
                                      ? 'border-danger bg-danger/10 text-content'
                                      : 'border-accent bg-accent/10 text-content'
                                  }`}
                                >
                                  <span className="font-semibold">{p.name}</span>
                                  <span>{p.label}</span>
                                  {p.cond && (
                                    <span className="text-[10px] opacity-75">· {p.cond}</span>
                                  )}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled
                    className="border-line-subtle text-content-subtle h-8 w-full cursor-not-allowed rounded-lg border border-dashed text-xs"
                    title={L.buffs.kitsSoon}
                  >
                    {L.buffs.fromKits} · {L.buffs.kitsSoon}
                  </button>

                  {/* Stats FINALES des deux combattants — SORTIE du moteur :
                    attaquant = combatStats § 16.1 (affinité, chips, passifs de
                    boss, MAX_HP § 16.2 appliqués) ; cible = les entrées
                    effectives que le moteur consomme (spawn ou saisie). */}
                  <div className={`${wellClass} space-y-1.5 p-2.5`}>
                    <div className="flex items-baseline gap-2">
                      <span className="text-accent font-mono text-[10px] font-bold tracking-wide uppercase">
                        {L.stats.final}
                      </span>
                      <span className="text-content-subtle text-[10px]">{L.stats.finalNote}</span>
                    </div>
                    <div className="grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
                      {(
                        [
                          {
                            title: L.panels.attacker,
                            fields: sheetFields,
                            values: (report?.combatStats ?? {}) as Record<
                              string,
                              number | undefined
                            >,
                          },
                          {
                            title: L.panels.target,
                            fields: targetStatFields,
                            values: (scenarioInputs.target?.stats ?? {}) as Record<
                              string,
                              number | undefined
                            >,
                          },
                        ] as const
                      ).map((col) => (
                        <div key={col.title} className="min-w-0 space-y-0.5">
                          <span className="text-content-subtle block font-mono text-[9px] tracking-wide uppercase">
                            {col.title}
                          </span>
                          {col.fields.map((f) => (
                            <span key={f.key} className="flex items-baseline gap-2 text-[11px]">
                              <span className="text-content-subtle truncate">{f.label}</span>
                              <span className="flex-1" />
                              <span
                                className={`font-mono font-bold tabular-nums ${
                                  col.values[f.key] !== undefined
                                    ? 'text-content'
                                    : 'text-content-muted'
                                }`}
                              >
                                {fmtStat(col.values[f.key], f.percent)}
                              </span>
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </Card>

            <div className="flex items-center gap-2">
              <Eyebrow>{L.panels.result}</Eyebrow>
              <span className="text-content-subtle font-mono text-[10px]">
                {L.report.branchesNote}
              </span>
            </div>

            {attacker && !dmgData && (
              <p
                className={`text-center text-[11px] ${dmgErr ? 'text-danger' : 'text-content-subtle'}`}
              >
                {dmgErr ? L.report.tablesError : L.report.loading}
              </p>
            )}

            {!attacker ? (
              <div className="border-line-subtle bg-surface-raised/40 text-content-subtle rounded-xl border px-4 py-10 text-center text-sm">
                {L.report.empty}
              </div>
            ) : (
              <>
                {/* Table COMPACTE (Sevih 27/07/2026) : une ligne par skill
                  offensif, trois colonnes de branches — rien de plus. */}
                <div className="border-line bg-surface-raised/60 overflow-hidden rounded-xl border">
                  <div className="bg-line-subtle grid grid-cols-[auto_1fr_1fr_1fr] gap-px">
                    <div className="bg-surface-sunken/60 px-3 py-2" />
                    {(
                      [
                        { br: 'normal', label: L.report.normal },
                        { br: 'critical', label: L.report.critical },
                        { br: 'miss', label: L.report.miss },
                      ] as const
                    ).map(({ br, label }) => (
                      <div
                        key={br}
                        className={`bg-surface-sunken/60 flex items-center justify-center gap-1.5 px-2 py-2 text-center font-mono text-[9px] tracking-wide uppercase ${
                          br === 'critical' ? 'text-warn' : 'text-content-subtle'
                        }`}
                      >
                        {/* Harnais : la coche décide quelles colonnes prennent
                          une saisie « en jeu » et partent dans la capture ;
                          MISS cochée force sa branche (buff de miss chance). */}
                        {devMode && (
                          <input
                            type="checkbox"
                            checked={branchOn[br]}
                            onChange={() => setBranchOn((p) => ({ ...p, [br]: !p[br] }))}
                            className="accent-accent h-3 w-3 cursor-pointer"
                          />
                        )}
                        {label}
                      </div>
                    ))}
                    {kit.flatMap((sk) => {
                      // Une ligne par SlotReport du moteur — le slot du skill
                      // BURSTABLE (`burstAP` : S1 chez Caren/Valentine, S2
                      // chez la plupart) déplie ses états burst en sous-lignes
                      // B1..B3.
                      // Un slot offensif que le moteur v1 ne calcule pas garde
                      // sa ligne à « — » ; un soutien sans burst n'a pas de
                      // ligne (note sous la table).
                      const slotReports = report?.slots.filter((s) => s.slot === sk.slot) ?? [];
                      const rows = slotReports.length ? slotReports : sk.offensive ? [null] : [];
                      return rows.map((sr, ri) => (
                        <Fragment key={`${sk.slot}:${sr?.burst ?? `p${ri}`}`}>
                          <div
                            className="bg-surface-raised/80 flex items-center gap-2 px-3 py-1.5"
                            title={sk.name}
                          >
                            {/* La ligne Bn cumule les descs B1..Bn (en jeu le
                              burst n inclut les effets des paliers précédents) ;
                              la ligne de base n'en montre aucune. */}
                            <SkillIconTip
                              row={sk}
                              lvl={skillLvls[sk.slot] ?? sk.maxLevel}
                              lang={lang}
                              burstMax={sr?.burst ?? 0}
                            >
                              {sk.iconSrc ? (
                                <img
                                  src={sk.iconSrc}
                                  alt=""
                                  aria-hidden
                                  width={28}
                                  height={28}
                                  className="block h-7 w-7 rounded-md"
                                  loading="lazy"
                                />
                              ) : (
                                <span className="border-line-subtle bg-surface-sunken/70 block h-7 w-7 rounded-md border" />
                              )}
                            </SkillIconTip>
                            <span className="text-content-subtle font-mono text-[10px] font-bold">
                              {sk.slot}
                              {sr?.burst !== undefined && (
                                <span className="text-warn"> B{sr.burst}</span>
                              )}
                            </span>
                          </div>
                          {(['normal', 'critical', 'miss'] as const).map((br) => {
                            const states = sr?.report.states ?? [];
                            // Slot présent mais chaîne de hits IRRÉSOLUE
                            // (§ 12.4) : placeholder « pas encore supporté »
                            // — et la saisie « en jeu » reste possible, la
                            // valeur attendra le moteur (Sevih 06/08/2026).
                            const unsupported =
                              sr !== null && sr.hitsUnresolved === true && states.length === 0;
                            const branch = states[0]?.branches.find((b) => b.branch === br);
                            // Plusieurs états de chaîne : la cellule montre la
                            // chaîne de BASE, le détail passe en tooltip.
                            const detail =
                              states.length > 1
                                ? states
                                    .map(
                                      (st) =>
                                        `${st.chain}: ${
                                          st.branches
                                            .find((b) => b.branch === br)
                                            ?.totalDamage.toLocaleString() ?? '—'
                                        }`,
                                    )
                                    .join('\n')
                                : undefined;
                            // Harnais : clé de saisie « en jeu » — la MÊME que
                            // flattenReport (l'état de base quand il y a
                            // plusieurs chaînes).
                            const lineSlot = sr
                              ? `${sr.slot}${sr.burst !== undefined ? `b${sr.burst}` : ''}${
                                  states.length > 1 ? `#${states[0].chain}` : ''
                                }`
                              : null;
                            const obsKey = lineSlot !== null ? `${lineSlot}|${br}` : null;
                            const seen = obsKey !== null ? Number(obs[obsKey]) : NaN;
                            const filled = Number.isFinite(seen) && seen > 0;
                            const delta =
                              branch && filled
                                ? ((branch.totalDamage - seen) / seen) * 100
                                : undefined;
                            return (
                              <div
                                key={br}
                                className="bg-surface-raised/80 flex flex-col items-center gap-1 px-2 py-1.5"
                                title={detail}
                              >
                                <span
                                  className={`flex items-center gap-1.5 font-mono text-sm font-bold tabular-nums ${
                                    branch ? 'text-content' : 'text-content-muted'
                                  }`}
                                >
                                  {branch ? (
                                    branch.totalDamage.toLocaleString()
                                  ) : unsupported && (br !== 'miss' || branchOn.miss) ? (
                                    <span
                                      title={L.report.unsupportedHint}
                                      className="text-content-muted cursor-help font-sans text-[10px] font-medium italic"
                                    >
                                      {L.report.unsupported}
                                    </span>
                                  ) : (
                                    '—'
                                  )}
                                  {branch && detail !== undefined && (
                                    <span className="text-content-subtle">*</span>
                                  )}
                                  {/* `+` = sauvegarder CE scénario (cette ligne
                                    + le z courant), à droite du calculé — les
                                    lignes « pas encore supporté » se capturent
                                    AUSSI (valeur en attente du moteur). */}
                                  {devMode &&
                                    branchOn[br] &&
                                    (branch || unsupported) &&
                                    lineSlot !== null &&
                                    obsKey && (
                                      <button
                                        type="button"
                                        onClick={() => saveCell(lineSlot, br, Math.round(seen))}
                                        disabled={!filled}
                                        title={
                                          filled
                                            ? 'sauvegarder ce scénario'
                                            : 'saisir la valeur en jeu d’abord'
                                        }
                                        className="text-success hover:text-accent cursor-pointer font-mono text-base leading-none font-extrabold disabled:cursor-not-allowed disabled:opacity-35"
                                      >
                                        +
                                      </button>
                                    )}
                                </span>
                                {devMode &&
                                  branchOn[br] &&
                                  (branch || unsupported) &&
                                  lineSlot !== null &&
                                  obsKey && (
                                    <span className="flex items-center gap-1.5">
                                      <input
                                        value={obs[obsKey] ?? ''}
                                        onChange={(e) =>
                                          setObs((p) => ({ ...p, [obsKey]: e.target.value }))
                                        }
                                        inputMode="numeric"
                                        placeholder="en jeu"
                                        className="border-line-subtle bg-surface-sunken/70 text-content focus:border-accent h-6 w-24 rounded border px-1.5 text-right font-mono text-[11px] outline-none"
                                      />
                                      <span
                                        className={`w-14 text-center font-mono text-[10px] ${
                                          delta === undefined
                                            ? 'text-content-subtle'
                                            : Math.abs(delta) <= DEFAULT_TOLERANCE
                                              ? 'text-success'
                                              : 'text-danger'
                                        }`}
                                      >
                                        {delta !== undefined ? `${delta.toFixed(2)}%` : 'Δ'}
                                      </span>
                                    </span>
                                  )}
                              </div>
                            );
                          })}
                        </Fragment>
                      ));
                    })}
                    {/* DoT posés par le kit (§ 11) : UNE ligne par EFFET en
                      pied de table — le tag et les dégâts PAR TICK, rien
                      d'autre (Sevih 22/08/2026 : la durée ne compte pas).
                      Dédup `distinctDots` — la MÊME que flattenReport : la
                      clé de capture `dot:<buffId>` retrouve sa ligne au
                      rejeu. En devMode, saisie « en jeu » + Δ + « + » comme
                      les cellules de branches (dépannage d'un tick § 11). */}
                    {(() => {
                      const distinct = distinctDots(report?.slots ?? []);
                      if (!distinct.length) return null;
                      return (
                        <div className="bg-surface-raised/60 col-span-4 space-y-1 px-3 py-1.5">
                          <span className="text-content-subtle font-mono text-[9px] tracking-wide uppercase">
                            {L.report.dot}
                          </span>
                          {distinct.map((d, di) => {
                            const ref =
                              d.tooltipId !== undefined
                                ? effectRefs[String(d.tooltipId)]
                                : undefined;
                            const lineSlot = `dot:${d.buffId}`;
                            const obsKey = `${lineSlot}|normal`;
                            const seen = Number(obs[obsKey]);
                            const filled = Number.isFinite(seen) && seen > 0;
                            const delta = filled
                              ? ((d.damagePerTick - seen) / seen) * 100
                              : undefined;
                            return (
                              <div
                                key={`${d.buffId}:${di}`}
                                className="flex flex-wrap items-center gap-1.5 text-xs"
                              >
                                {ref ? (
                                  <EffectRefTag r={ref} />
                                ) : (
                                  <span className="text-content-subtle font-mono">{d.buffId}</span>
                                )}
                                <span className="text-content font-mono font-bold tabular-nums">
                                  {vars(L.report.dotTick, { n: d.damagePerTick.toLocaleString() })}
                                </span>
                                {d.applyProbability < 1 && (
                                  <span className="text-content-subtle text-[10px]">
                                    {vars(L.report.dotApply, {
                                      p: Math.round(d.applyProbability * 100),
                                    })}
                                  </span>
                                )}
                                {devMode && (
                                  <span className="flex items-center gap-1.5">
                                    <input
                                      value={obs[obsKey] ?? ''}
                                      onChange={(e) =>
                                        setObs((p) => ({ ...p, [obsKey]: e.target.value }))
                                      }
                                      inputMode="numeric"
                                      placeholder="en jeu"
                                      className="border-line-subtle bg-surface-sunken/70 text-content focus:border-accent h-6 w-24 rounded border px-1.5 text-right font-mono text-[11px] outline-none"
                                    />
                                    <span
                                      className={`w-14 text-center font-mono text-[10px] ${
                                        delta === undefined
                                          ? 'text-content-subtle'
                                          : Math.abs(delta) <= DEFAULT_TOLERANCE
                                            ? 'text-success'
                                            : 'text-danger'
                                      }`}
                                    >
                                      {delta !== undefined ? `${delta.toFixed(2)}%` : 'Δ'}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => saveCell(lineSlot, 'normal', Math.round(seen))}
                                      disabled={!filled}
                                      title={
                                        filled
                                          ? 'sauvegarder ce scénario'
                                          : 'saisir la valeur en jeu d’abord'
                                      }
                                      className="text-success hover:text-accent cursor-pointer font-mono text-base leading-none font-extrabold disabled:cursor-not-allowed disabled:opacity-35"
                                    >
                                      +
                                    </button>
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {supportSkills.length > 0 && (
                  <p className="text-content-subtle text-center text-[11px]">
                    {vars(L.report.supportSkills, {
                      names: supportSkills.map((s) => s.name).join(', '),
                    })}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Cycle de capture (harnais) : sauvegarde + brouillons de scénarios —
        la saisie « en jeu » vit DANS la table Résultat ci-dessus (checkbox par
        colonne de branche). AU-DESSUS du panneau Debug (Sevih 05/08/2026). */}
      {tab === 'calc' && devMode && (
        <section className="border-line-subtle bg-surface-raised/60 space-y-3 rounded-xl border p-3.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-content-subtle text-[10px] font-bold tracking-[0.14em] uppercase">
              Scénarios
            </span>
            <span
              title="build de dev, ou ?dev=1 dans l'URL"
              className="text-warn border-warn/35 bg-warn/10 rounded border px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wide"
            >
              HARNAIS
            </span>
            <span className="text-content-subtle text-[11px]">
              un scénario = une ligne (le « + » d&apos;une cellule Résultat) · calculé REJOUÉ à
              l&apos;affichage · ⧉ = fixture à committer dans src/lib/damage/fixtures/
            </span>
            <button
              type="button"
              onClick={() => setImportOpen((v) => !v)}
              title="coller le JSON ⧉ d'un testeur"
              className="border-line-subtle bg-surface-raised/70 text-content-muted hover:text-accent h-6 cursor-pointer rounded border px-2 font-mono text-[10px]"
            >
              Importer
            </button>
            <span className="flex-1" />
            {flash && (
              <span className="text-success border-success/40 bg-surface-sunken rounded-md border px-2.5 py-1 font-mono text-[10px]">
                ✓ {flash}
              </span>
            )}
          </div>
          {importOpen && (
            <div className="space-y-2">
              <textarea
                value={importTxt}
                onChange={(e) => setImportTxt(e.target.value)}
                placeholder="coller ici le JSON ⧉ d'un testeur (une fixture, ou un tableau de fixtures)"
                rows={5}
                className="border-line-subtle bg-surface-sunken/70 text-content focus:border-accent w-full rounded border px-2 py-1.5 font-mono text-[11px] outline-none"
              />
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={importScenarios}
                  disabled={!importTxt.trim()}
                  className="border-line-subtle bg-surface-raised/70 text-content-muted hover:text-accent h-6 cursor-pointer rounded border px-2 font-mono text-[10px] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Ajouter
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImportOpen(false);
                    setImportTxt('');
                  }}
                  className="border-line-subtle bg-surface-raised/70 text-content-muted hover:text-danger h-6 cursor-pointer rounded border px-2 font-mono text-[10px]"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
          {/* Table de comparaison : atk vs cible · en jeu vs calculé · Δ. */}
          <div className="border-line-subtle bg-surface-sunken/70 overflow-x-auto rounded-lg border">
            {savedScns.length ? (
              <div className="min-w-160">
                <div className="border-line-subtle text-content-subtle grid grid-cols-[minmax(0,3fr)_110px_110px_70px_150px] gap-2 border-b px-3 py-1.5 font-mono text-[9px] tracking-wide uppercase">
                  <span>Scénario</span>
                  <span className="text-right">En jeu</span>
                  <span className="text-right">Calculé</span>
                  <span className="text-right">Δ %</span>
                  <span />
                </div>
                {/* Le plus RÉCENT en haut (Sevih 10/08) — tri d'AFFICHAGE par
                  savedAt décroissant (ISO, ordre lexicographique) : un upsert
                  remonte, le stockage garde son ordre. */}
                {[...savedScns]
                  .sort((a, b) => (b.savedAt > a.savedAt ? 1 : b.savedAt < a.savedAt ? -1 : 0))
                  .map((s) => {
                    const calc = savedCalcMap.calcs.get(scnKey(s));
                    // EN ATTENTE : slot rejoué mais chaîne de hits irrésolue
                    // (§ 12.4) — la valeur en jeu attend le moteur.
                    const isPending = savedCalcMap.pending.has(scnKey(s));
                    const delta = calc !== undefined ? ((calc - s.real) / s.real) * 100 : undefined;
                    const cls =
                      delta === undefined
                        ? 'text-content-subtle'
                        : Math.abs(delta) <= DEFAULT_TOLERANCE
                          ? 'text-success'
                          : 'text-danger';
                    const stale =
                      delta !== undefined &&
                      Math.abs(delta) > DEFAULT_TOLERANCE &&
                      s.gameVersion !== ENGINE_GAME_VERSION;
                    return (
                      <div
                        key={scnKey(s)}
                        className="grid grid-cols-[minmax(0,3fr)_110px_110px_70px_150px] items-center gap-2 px-3 py-1.5 font-mono text-[11px]"
                      >
                        <span className="text-content truncate font-sans text-xs">
                          {s.atk} <span className="text-content-subtle">vs</span> {s.tgt}{' '}
                          <span className="text-content-subtle font-mono text-[9px]">
                            {s.slot} {s.branch} · {s.gameVersion}
                          </span>
                          {stale && (
                            <span className="text-warn border-warn/35 bg-warn/10 ml-1.5 rounded border px-1 py-px font-mono text-[9px] font-bold">
                              à revérifier en jeu
                            </span>
                          )}
                        </span>
                        <span className="text-content-muted text-right">
                          {s.real.toLocaleString()}
                        </span>
                        <span className="text-content-muted text-right">
                          {calc !== undefined ? (
                            calc.toLocaleString()
                          ) : isPending ? (
                            <span
                              title="chaîne de hits irrésolue (§ 12.4) — valeur gardée, le Δ attendra le moteur"
                              className="text-warn cursor-help text-[10px]"
                            >
                              § 12.4
                            </span>
                          ) : (
                            '—'
                          )}
                        </span>
                        <span className={`text-right ${cls}`}>
                          {delta !== undefined ? delta.toFixed(3) : '—'}
                        </span>
                        <span className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => loadSaved(s)}
                            className="border-line-subtle bg-surface-raised/70 text-content-muted hover:text-accent h-6 cursor-pointer rounded border px-2 font-mono text-[10px]"
                          >
                            Charger
                          </button>
                          <button
                            type="button"
                            onClick={() => copyScenario(s)}
                            title="copier le JSON de fixture"
                            className="border-line-subtle bg-surface-raised/70 text-content-muted hover:text-accent h-6 cursor-pointer rounded border px-2 font-mono text-[10px]"
                          >
                            ⧉
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteScenario(s)}
                            title="supprimer"
                            className="border-line-subtle bg-surface-raised/70 text-content-muted hover:text-danger h-6 cursor-pointer rounded border px-2 font-mono text-[10px]"
                          >
                            ✕
                          </button>
                        </span>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-content-subtle px-3 py-3 text-[11px]">
                aucun scénario — saisir « en jeu » puis cliquer « + » dans la table Résultat
              </p>
            )}
          </div>
        </section>
      )}

      {/* HARNAIS (Sevih 27/07/2026) — spec docs/specs/damage-debug-harness.md ;
        libellés en dur (§ 5). Branché sur le moteur : l'état courant passe par
        le pont partagé (buildInputsFromZ) — le même chemin que fixtures.test.ts. */}
      {tab === 'calc' && devMode && (
        <DebugHarness
          state={debugState}
          skills={offensiveSkills.map((s) => ({ slot: s.slot, name: s.name }))}
          zState={buildZ()}
          resolvePreset={resolvePresetLocal}
          resolveGear={resolveGearLocal}
          codexLevel={codexLvl}
          guildLevel={guildLvl}
          premiumHp={premiumOn}
          includeMiss={branchOn.miss}
          quirks={activeQuirks}
          data={dmgData}
          dataErr={dmgErr}
        />
      )}
    </div>
  );
}

// ── Sous-composants dépendant des types ci-dessus ──────────────────────────

/** Slot d'arme/accessoire : picker + breakthrough T0–T4 + texte du passif
 *  (variante de CLASSE de l'attaquant quand la famille en a). */
function GearSlot({
  title,
  placeholder,
  options,
  value,
  tier,
  attackerCls,
  onPick,
  onClear,
  onTier,
  labels,
}: {
  title: string;
  placeholder: string;
  options: DcGear[];
  value: DcGear | undefined;
  tier: number;
  attackerCls: string;
  onPick: (slug: string) => void;
  onClear: () => void;
  onTier: (v: number) => void;
  labels: DcLabels;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const q = search.trim().toLowerCase();
  const filtered = q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  const tiers = value ? (value.classTiers?.[attackerCls] ?? value.tiers) : undefined;
  const close = () => {
    setOpen(false);
    setSearch('');
  };
  return (
    <div className="border-line-subtle bg-surface-sunken/70 space-y-1.5 rounded-lg border p-2">
      {/* La case est étroite (grille 2 colonnes) : l'en-tête WRAP — le groupe
        Stepper+✕ descend sous le titre au lieu de déborder sous la case
        voisine, qui recouvrait le « + » (bug signalé Sevih 03/08/2026). */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <Eyebrow>{title}</Eyebrow>
        {value && (
          <span className="ml-auto flex shrink-0 items-center gap-2">
            <Stepper value={tier} min={0} max={4} onChange={onTier} format={(v) => `T${v}`} />
            <button
              type="button"
              className="text-content-subtle hover:text-danger cursor-pointer text-xs"
              onClick={onClear}
              title={labels.clear}
            >
              ✕
            </button>
          </span>
        )}
      </div>
      <div className="flex min-w-0 items-center gap-2">
        <SlotTile onClick={() => setOpen(true)} title={value?.label ?? placeholder}>
          {value ? (
            <EquipmentIcon
              icon={value.icon}
              grade={value.grade}
              size={44}
              stars={value.star}
              overlayIcon={value.overlayIcon}
              classType={gearClassOf(value, attackerCls)}
            />
          ) : null}
        </SlotTile>
        <span
          className={`min-w-0 text-xs wrap-break-word ${value ? 'text-content font-semibold' : 'text-content-subtle'}`}
        >
          {value ? value.label : placeholder}
        </span>
      </div>
      <Modal open={open} onClose={close} title={placeholder}>
        <SearchField value={search} onChange={setSearch} placeholder={labels.search} />
        {filtered.length ? (
          <GearGrid
            items={filtered.map((o) => ({
              key: o.slug,
              icon: o.icon,
              grade: o.grade,
              label: o.label,
              star: o.star,
              overlayIcon: o.overlayIcon,
              classType: gearClassOf(o, attackerCls),
              selected: o.slug === value?.slug,
            }))}
            onPick={(slug) => {
              onPick(slug);
              close();
            }}
          />
        ) : (
          <NoMatches label={labels.noMatches} />
        )}
      </Modal>
      {value && tiers && (
        <GameText
          text={tiers[tier] || labels.equipment.noPassive}
          className="text-content-muted text-[11px] leading-relaxed whitespace-pre-line"
        />
      )}
    </div>
  );
}

/** Grille de tuiles d'équipement d'une modale (tuile « comme partout » :
 *  cadre de grade + étoiles + icône d'effet + classe — façon pool). */
function GearGrid({
  items,
  onPick,
}: {
  items: {
    key: string;
    icon: string;
    grade: string;
    label: string;
    star?: number;
    overlayIcon?: string;
    classType?: string;
    selected?: boolean;
    /** Choix neutralisé (ex. duo de sets déjà complet). */
    disabled?: boolean;
  }[];
  onPick: (key: string) => void;
}) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(4.5rem,1fr))] gap-1.5">
      {items.map((it) => (
        <button
          key={it.key}
          type="button"
          disabled={it.disabled}
          className="group flex flex-col items-center gap-1 not-disabled:cursor-pointer disabled:opacity-40"
          title={it.label}
          onClick={() => onPick(it.key)}
        >
          <span
            className={`group-hover:border-accent rounded-lg border transition ${
              it.selected ? 'border-accent' : 'border-transparent'
            }`}
          >
            {it.grade ? (
              <EquipmentIcon
                icon={it.icon}
                grade={it.grade}
                size={56}
                stars={it.star}
                overlayIcon={it.overlayIcon}
                classType={it.classType}
              />
            ) : (
              <img
                src={img.equipment(it.icon)}
                alt=""
                className="h-14 w-14"
                loading="lazy"
                width={56}
                height={56}
              />
            )}
          </span>
          <span className="text-content-muted group-hover:text-content w-full text-center text-[10px] leading-tight wrap-break-word">
            {it.label}
          </span>
        </button>
      ))}
    </div>
  );
}

/** Icône de classe d'une tuile d'arme/accessoire : restriction unique, ou la
 *  classe de l'ATTAQUANT quand la famille varie par classe (Briareos/Gorgon). */
function gearClassOf(o: DcGear, attackerCls: string): string | undefined {
  if (o.classLimits.length === 1) return o.classLimits[0];
  return o.classTiers ? attackerCls : undefined;
}

/** Un set n'est appariable que s'il a un bonus 2P (Revenge/Patience : 4P seul). */
const has2P = (s: DcSet) => s.p2.some(Boolean);
const has4P = (s: DcSet) => s.p4.some(Boolean);

/**
 * Case UNIQUE des sets, SANS modale : les icônes des sets de combat sont
 * toutes affichées — cliquer valide/retire un set, et ce qui n'est plus
 * combinable se grise. 4 pièces d'armure au total : un duo n'est possible
 * qu'entre sets à bonus 2P (2P+2P) ; un set 4P-only (Revenge, Patience)
 * occupe tout et reste seul — jamais 4P+2P ni 4P+4P (décision Sevih
 * 27/07/2026). Le bonus est DÉRIVÉ : duo → 2P chacun ; seul → 4P si le set en
 * a un, sinon son 2P.
 */
function SetsSlot({
  sets,
  picks,
  onChange,
  labels,
}: {
  sets: DcSet[];
  picks: SetPick[];
  onChange: (picks: SetPick[]) => void;
  labels: DcLabels;
}) {
  const first = picks.length === 1 ? sets.find((s) => s.id === picks[0].setId) : undefined;
  const piecesOf = (view: DcSet) =>
    picks.length === 2 || !has4P(view) ? ('2P' as const) : ('4P' as const);
  const pickable = (s: DcSet) => {
    if (picks.length >= 2) return false;
    if (!first) return true;
    return has2P(first) && has2P(s);
  };
  const toggle = (id: string) => {
    const has = picks.some((p) => p.setId === id);
    const view = sets.find((s) => s.id === id);
    if (!has && (!view || !pickable(view))) return;
    onChange(has ? picks.filter((p) => p.setId !== id) : [...picks, { setId: id, tier: 0 }]);
  };
  return (
    <div className="border-line-subtle bg-surface-sunken/70 space-y-1.5 rounded-lg border p-2 sm:col-span-2">
      <div className="flex items-center gap-2">
        <Eyebrow>{labels.equipment.sets}</Eyebrow>
        <span className="flex-1" />
        {picks.length > 0 && (
          <button
            type="button"
            className="text-content-subtle hover:text-danger cursor-pointer text-xs"
            onClick={() => onChange([])}
            title={labels.clear}
          >
            ✕
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {sets.map((s) => {
          const on = picks.some((p) => p.setId === s.id);
          return (
            <button
              key={s.id}
              type="button"
              disabled={!on && !pickable(s)}
              aria-pressed={on}
              title={s.label}
              onClick={() => toggle(s.id)}
              className={`grid h-11 w-11 place-items-center rounded-lg border transition not-disabled:cursor-pointer disabled:opacity-40 ${
                on
                  ? 'border-accent bg-accent/10'
                  : 'border-line-subtle bg-surface-raised/60 hover:border-accent'
              }`}
            >
              <img src={img.equipment(s.icon)} alt={s.label} className="h-8 w-8" loading="lazy" />
            </button>
          );
        })}
      </div>
      {picks.length > 0 && (
        // Un set par LIGNE (pas côte à côte) : les textes d'effet respirent.
        <div className="space-y-1.5">
          {picks.map((pick, i) => {
            const view = sets.find((s) => s.id === pick.setId);
            if (!view) return null;
            const p = piecesOf(view);
            const stateIdx = pick.tier >= 4 ? 1 : 0;
            const effect =
              (p === '2P' ? view.p2[stateIdx] : view.p4[stateIdx]) ?? labels.equipment.noPassive;
            return (
              <div key={pick.setId} className="space-y-1">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="text-content min-w-0 flex-1 text-xs font-semibold wrap-break-word">
                    {view.label}
                  </span>
                  <span className="border-line-subtle text-accent rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold">
                    {p === '2P' ? labels.equipment.p2 : labels.equipment.p4}
                  </span>
                  <Stepper
                    value={pick.tier}
                    min={0}
                    max={4}
                    onChange={(v) =>
                      onChange(picks.map((p2, j) => (j === i ? { ...p2, tier: v } : p2)))
                    }
                    format={(v) => `T${v}`}
                  />
                </div>
                <GameText
                  text={effect}
                  className="text-content-muted text-[11px] leading-relaxed"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Browser VISUEL de l'histoire (Story / Origin Story — demande Sevih
 * 06/08/2026) : toggle Normal/Hard (rendu ROUGEÂTRE en hard), puis
 * saisons → épisodes (portrait du boss de l'épisode) → stages à combat
 * (accordéon des N vagues — TOUS les monstres d'une vague sont ciblables,
 * pas seulement le boss). Les stages sans combat n'existent pas dans la
 * donnée (aucun spawn) : rien à masquer.
 */
function StoryTargetBrowser({
  entries,
  labels,
  onPick,
  season,
  episode,
  onSeason,
  onEpisode,
}: {
  /** Entrées de la famille (story OU origin), les deux difficultés mêlées. */
  entries: DcTarget[];
  labels: DcLabels;
  onPick: (id: string) => void;
  /** Navigation saison/épisode CONTRÔLÉE par le picker : c'est son breadcrumb
   *  qui remonte la hiérarchie, sur tous les modes (Sevih 17/08/2026). */
  season: number | null;
  episode: number | null;
  onSeason: (n: number | null) => void;
  onEpisode: (n: number | null) => void;
}) {
  const [hard, setHard] = useState(false);
  /** Stage déplié (id de donjon) — accordéon des vagues. */
  const [openStage, setOpenStage] = useState<string | null>(null);

  // Difficulté courante : Normal et Hard sont des DONJONS distincts (ids
  // disjoints), la sélection saison/épisode survit au toggle (mêmes numéros
  // des deux côtés), le stage déplié non.
  const pool = entries.filter((tg) => tg.story?.hard === hard);
  const seasons = [...new Set(pool.map((tg) => tg.story!.season))].sort((a, b) => a - b);
  const inSeason = season != null ? pool.filter((tg) => tg.story!.season === season) : [];
  const inEpisode = episode != null ? inSeason.filter((tg) => tg.story!.episode === episode) : [];

  const dungeonIdOf = (tg: DcTarget) => tg.id.slice(0, tg.id.lastIndexOf(':'));
  /** Boss « d'affiche » d'un lot d'entrées : le boss du stage le plus haut. */
  const posterOf = (list: DcTarget[]): DcTarget | undefined => {
    let best: DcTarget | undefined;
    for (const tg of list) {
      if (tg.story!.role !== 'boss') continue;
      if (!best || (tg.story!.stage ?? 0) >= (best.story!.stage ?? 0)) best = tg;
    }
    return best ?? list[list.length - 1];
  };

  const episodes = season != null ? [...new Set(inSeason.map((tg) => tg.story!.episode))] : [];
  episodes.sort((a, b) => a - b);

  /** Stages de l'épisode, dans l'ordre du jeu (l'intro sans numéro ouvre). */
  const stages: { id: string; label: string; poster: DcTarget | undefined; list: DcTarget[] }[] =
    [];
  if (episode != null) {
    const byStage = new Map<string, DcTarget[]>();
    for (const tg of inEpisode) {
      const did = dungeonIdOf(tg);
      const list = byStage.get(did);
      if (list) list.push(tg);
      else byStage.set(did, [tg]);
    }
    for (const [did, list] of byStage)
      stages.push({ id: did, label: list[0].label, poster: posterOf(list), list });
    stages.sort((a, b) => (a.list[0].story!.stage ?? 0) - (b.list[0].story!.stage ?? 0));
  }

  // Rougeâtre en Hard (demande Sevih) : la teinte porte sur le CONTENEUR et
  // les cartes — tokens danger du thème, jamais de rouge Tailwind brut.
  const cardTint = hard
    ? 'bg-danger/10 hover:bg-danger/20'
    : 'bg-surface-sunken/50 hover:bg-surface-raised/80';
  const CARD = `flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition ${cardTint}`;

  return (
    <div
      className={`space-y-2 rounded-xl p-2 ring-1 transition ${
        hard ? 'bg-danger/5 ring-danger/25' : 'ring-line-subtle'
      }`}
    >
      <div className="border-line-subtle bg-surface-sunken/70 inline-flex overflow-hidden rounded-lg border text-xs">
        <button
          type="button"
          onClick={() => {
            setHard(false);
            setOpenStage(null);
          }}
          className={`cursor-pointer px-3 py-1.5 font-semibold transition ${
            hard ? 'text-content-muted hover:bg-surface-raised/60' : 'bg-accent text-accent-fg'
          }`}
        >
          {labels.target.diffNormal}
        </button>
        <button
          type="button"
          onClick={() => {
            setHard(true);
            setOpenStage(null);
          }}
          className={`cursor-pointer px-3 py-1.5 font-semibold transition ${
            hard ? 'bg-danger text-on-vivid' : 'text-content-muted hover:bg-surface-raised/60'
          }`}
        >
          {labels.target.diffHard}
        </button>
      </div>

      {season == null ? (
        <div className="grid gap-1.5 sm:grid-cols-2">
          {seasons.map((n) => {
            const eps = new Set(
              pool.filter((tg) => tg.story!.season === n).map((tg) => tg.story!.episode),
            );
            return (
              <button key={n} type="button" className={CARD} onClick={() => onSeason(n)}>
                <span className="min-w-0 flex-col">
                  <span className="font-semibold">
                    {labels.target.seasonTpl.replace('{n}', String(n))}
                  </span>
                  <span className="text-content-subtle block text-[10px]">
                    {eps.size} × {labels.target.episode}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      ) : episode == null ? (
        <div className="grid gap-1.5 sm:grid-cols-2">
          {episodes.map((n) => {
            const list = inSeason.filter((tg) => tg.story!.episode === n);
            const poster = posterOf(list);
            return (
              <button key={n} type="button" className={CARD} onClick={() => onEpisode(n)}>
                {poster && <MonsterPortrait tg={poster} className="h-12 w-12" />}
                <span className="min-w-0 flex-col">
                  <span className="text-content-subtle block text-[10px] font-bold tracking-[0.14em] uppercase">
                    {labels.target.episode} {n}
                  </span>
                  <span className="truncate font-semibold">{list[0].story!.episodeName}</span>
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-1">
          {stages.map((st) => (
            <div key={st.id}>
              <button
                type="button"
                className={CARD}
                onClick={() => setOpenStage(openStage === st.id ? null : st.id)}
              >
                {st.poster && <MonsterPortrait tg={st.poster} className="h-10 w-10" />}
                <span className="min-w-0 flex-1 truncate font-semibold">{st.label}</span>
                <span className="text-content-subtle text-[10px]" aria-hidden>
                  {openStage === st.id ? '▾' : '▸'}
                </span>
              </button>
              {openStage === st.id && (
                <div className="border-line-subtle ml-3 space-y-1.5 border-l py-1.5 pl-2">
                  {[...new Set(st.list.flatMap((tg) => tg.story!.waves.map((w) => w.wave)))]
                    .sort((a, b) => a - b)
                    .map((w) => (
                      <div key={w}>
                        <Eyebrow>{labels.target.waveTpl.replace('{n}', String(w))}</Eyebrow>
                        <div className="grid gap-0.5 sm:grid-cols-2">
                          {st.list
                            .map((tg) => ({
                              tg,
                              occ: tg.story!.waves.find((x) => x.wave === w),
                            }))
                            .filter(({ occ }) => occ)
                            .map(({ tg, occ }) => (
                              <button
                                key={tg.id}
                                type="button"
                                className={CARD}
                                onClick={() => onPick(tg.id)}
                              >
                                <MonsterPortrait tg={tg} className="h-12 w-12" />
                                <span className="min-w-0 flex-1 flex-col">
                                  <span className="flex items-center gap-1.5">
                                    <span className="truncate font-semibold">{tg.name}</span>
                                    {/* Exemplaires multiples dans la vague
                                        (story 1-1 : 2 × le même loup). */}
                                    {(occ!.count ?? 1) > 1 && (
                                      <span className="text-content-muted shrink-0 text-[11px] font-bold">
                                        ×{occ!.count}
                                      </span>
                                    )}
                                  </span>
                                  <span className="text-content-subtle block text-[10px]">
                                    {labels.target.lv}
                                    {occ!.level}
                                  </span>
                                </span>
                              </button>
                            ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Picker de cible en MODALE : mode → contenu. L'HISTOIRE (Story / Origin
 * Story) a son picker VISUEL (`StoryTargetBrowser` — demande Sevih
 * 06/08/2026) : ses 4 modes se replient en 2 entrées de famille, le toggle
 * Normal/Hard vit dans le browser. Les autres modes gardent la cascade de
 * selects portée par la donnée (`path` : ligue de world boss, phase de guild
 * raid, élément…), rendue en CARTES niveau par niveau — même grammaire que
 * les saisons du browser story, plus aucun select (Sevih 17/08/2026). La
 * recherche traverse la sélection courante (en famille story, elle bascule
 * sur la liste à plat). À l'OUVERTURE (aucun mode, pas de recherche), pas de
 * liste « All » : une carte par mode avec son compte de monstres — on choisit
 * toujours un mode pour dégrossir, la liste plate intégrale ne servait jamais ;
 * « tout » reste l'assiette de la recherche racine.
 */
const PICKER_CARD =
  'bg-surface-sunken/50 hover:bg-surface-raised/80 flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition';
function TargetPicker({
  targets,
  modes,
  value,
  level,
  onPick,
  onClear,
  labels,
}: {
  targets: DcTarget[];
  modes: string[];
  value: DcTarget | undefined;
  /** Niveau du spawn RÉSOLU — affiché à droite du nom (Sevih 27/07/2026). */
  level?: number;
  onPick: (id: string) => void;
  onClear: () => void;
  labels: DcLabels;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState('');
  const [path, setPath] = useState<string[]>([]);
  // Navigation saison/épisode du browser story — remontée ICI pour que le
  // breadcrumb couvre TOUS les modes (Sevih 17/08/2026).
  const [storySeason, setStorySeason] = useState<number | null>(null);
  const [storyEpisode, setStoryEpisode] = useState<number | null>(null);

  // Les 4 modes story se REPLIENT en 2 familles (le toggle Normal/Hard vit
  // dans le browser visuel) : leurs libellés de mode sortent de la liste,
  // remplacés par une entrée par famille présente. Valeurs préfixées
  // (`fam:`) — jamais confondues avec un libellé localisé.
  const storyModeLabels = new Set<string>();
  const famPresent = new Set<'story' | 'origin'>();
  for (const tg of targets)
    if (tg.story) {
      storyModeLabels.add(tg.mode);
      famPresent.add(tg.story.family);
    }
  const modeOptions: { value: string; label: string }[] = [
    ...(famPresent.has('story') ? [{ value: 'fam:story', label: labels.target.familyStory }] : []),
    ...(famPresent.has('origin')
      ? [{ value: 'fam:origin', label: labels.target.familyOrigin }]
      : []),
    ...modes.filter((m) => !storyModeLabels.has(m)).map((m) => ({ value: m, label: m })),
  ];
  const fam =
    mode === 'fam:story' ? ('story' as const) : mode === 'fam:origin' ? ('origin' as const) : null;
  // Compte d'entrées par valeur de mode (les 4 modes story comptent dans leur
  // famille, une LIGNE de guild raid compte pour 1) — cartes de l'accueil.
  const countOf = new Map<string, number>();
  {
    const linesSeen = new Set<string>();
    for (const tg of targets) {
      if (tg.line) {
        if (linesSeen.has(tg.line)) continue;
        linesSeen.add(tg.line);
      }
      const key = tg.story ? `fam:${tg.story.family}` : tg.mode;
      countOf.set(key, (countOf.get(key) ?? 0) + 1);
    }
  }

  const inMode = useMemo(
    () =>
      fam
        ? targets.filter((tg) => tg.story?.family === fam)
        : mode
          ? targets.filter((tg) => tg.mode === mode)
          : targets,
    [targets, mode, fam],
  );
  // Niveau de cascade COURANT (profondeur = choix déjà faits) : des CARTES,
  // comme les saisons du browser story — plus de selects (Sevih 17/08/2026).
  // Aucun mode ne mélange entrées avec et sans chemin (vérifié sur la donnée) :
  // exiger un choix par niveau ne rend rien inatteignable. (Jamais en famille
  // story : la navigation est le browser visuel.)
  const levelOpts: { value: string; count: number }[] = [];
  if (mode && !fam) {
    const seen = new Map<string, { value: string; count: number }>();
    const linesSeen = new Set<string>();
    for (const tg of inMode) {
      if (!path.every((p, i) => tg.path?.[i] === p)) continue;
      const v = tg.path?.[path.length];
      if (!v) continue;
      // Une ligne de guild raid = 1 carte → compte pour 1.
      if (tg.line) {
        if (linesSeen.has(tg.line)) continue;
        linesSeen.add(tg.line);
      }
      const hit = seen.get(v);
      if (hit) hit.count++;
      else {
        const opt = { value: v, count: 1 };
        seen.set(v, opt);
        levelOpts.push(opt);
      }
    }
  }
  const q = search.trim().toLowerCase();
  const pool = inMode.filter((tg) => path.every((p, i) => tg.path?.[i] === p));
  const filtered = q
    ? pool.filter((o) => o.label.toLowerCase().includes(q) || o.name.toLowerCase().includes(q))
    : pool;
  // Une LIGNE de guild raid = une seule carte (la première qui matche — en
  // recherche, celle dont le stage a matché) ; le sélecteur de stage du
  // panneau cible fait le reste.
  const display: DcTarget[] = [];
  {
    const linesSeen = new Set<string>();
    for (const tg of filtered) {
      if (tg.line) {
        if (linesSeen.has(tg.line)) continue;
        linesSeen.add(tg.line);
      }
      display.push(tg);
    }
  }
  const close = () => {
    setOpen(false);
    setSearch('');
  };
  return (
    <>
      <div className="flex min-w-0 items-center gap-2">
        <SlotTile
          large
          onClick={() => setOpen(true)}
          onClear={value ? onClear : undefined}
          clearTitle={labels.clear}
          title={value?.name ?? labels.select}
        >
          {value ? <MonsterPortrait tg={value} level={level} className="h-full w-full" /> : null}
        </SlotTile>
        {value ? (
          <span className="min-w-0 flex-1">
            <span className="text-content block text-sm font-semibold wrap-break-word">
              {value.name}
            </span>
            <span className="text-content-subtle block text-[11px] wrap-break-word">
              {[...(value.path ?? []), value.label].join(' · ')}
            </span>
          </span>
        ) : (
          <span className="text-content-subtle min-w-0 text-sm wrap-break-word">
            {labels.select}
          </span>
        )}
      </div>
      <Modal open={open} onClose={close} title={labels.panels.target}>
        <SearchField value={search} onChange={setSearch} placeholder={labels.search} />
        {/* BREADCRUMB (Sevih 17/08/2026) : « ← Mode / Niveau 1 / … » sur TOUS
            les modes — en famille story les segments sont la saison et
            l'épisode (leur navigation vit ici, le browser est contrôlé). La
            flèche remonte d'un niveau (puis au sommaire des modes), chaque
            segment ANCÊTRE est cliquable et saute à son niveau, le segment
            courant est inerte. */}
        {mode &&
          (() => {
            const crumbs: { label: string; jump: () => void }[] = [
              {
                label: modeOptions.find((o) => o.value === mode)?.label ?? mode,
                jump: fam
                  ? () => {
                      setStorySeason(null);
                      setStoryEpisode(null);
                    }
                  : () => setPath([]),
              },
              ...(fam
                ? [
                    ...(storySeason != null
                      ? [
                          {
                            label: labels.target.seasonTpl.replace('{n}', String(storySeason)),
                            jump: () => setStoryEpisode(null),
                          },
                        ]
                      : []),
                    ...(storyEpisode != null
                      ? [
                          {
                            label: `${labels.target.episode} ${storyEpisode}`,
                            jump: () => {},
                          },
                        ]
                      : []),
                  ]
                : path.map((p, i) => ({ label: p, jump: () => setPath(path.slice(0, i + 1)) }))),
            ];
            const up = () => {
              if (fam) {
                if (storyEpisode != null) setStoryEpisode(null);
                else if (storySeason != null) setStorySeason(null);
                else setMode('');
              } else if (path.length) {
                setPath(path.slice(0, -1));
              } else {
                setMode('');
              }
            };
            return (
              <div className="text-content-muted flex flex-wrap items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={up}
                  className="hover:text-content cursor-pointer transition"
                  title={labels.target.back}
                >
                  <span aria-hidden>←</span>
                </button>
                {crumbs.map((c, i) =>
                  i < crumbs.length - 1 ? (
                    <span key={i} className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={c.jump}
                        className="hover:text-content cursor-pointer transition"
                      >
                        {c.label}
                      </button>
                      <span aria-hidden>/</span>
                    </span>
                  ) : (
                    <span key={i} className="text-content font-semibold">
                      {c.label}
                    </span>
                  ),
                )}
              </div>
            );
          })()}
        {fam && !q ? (
          <StoryTargetBrowser
            entries={inMode}
            labels={labels}
            onPick={(id) => {
              onPick(id);
              close();
            }}
            season={storySeason}
            episode={storyEpisode}
            onSeason={setStorySeason}
            onEpisode={setStoryEpisode}
          />
        ) : !mode && !q ? (
          <div className="grid gap-1.5 sm:grid-cols-2">
            {modeOptions.map((m) => (
              <button
                key={m.value}
                type="button"
                className={PICKER_CARD}
                onClick={() => {
                  setMode(m.value);
                  setPath([]);
                  setStorySeason(null);
                  setStoryEpisode(null);
                }}
              >
                <span className="min-w-0 flex-col">
                  <span className="font-semibold">{m.label}</span>
                  <span className="text-content-subtle block text-[10px]">
                    {labels.target.monstersTpl.replace('{n}', String(countOf.get(m.value) ?? 0))}
                  </span>
                </span>
              </button>
            ))}
          </div>
        ) : levelOpts.length && !q ? (
          <div className="grid gap-1.5 sm:grid-cols-2">
            {levelOpts.map((o) => (
              <button
                key={o.value}
                type="button"
                className={PICKER_CARD}
                onClick={() => setPath([...path, o.value])}
              >
                <span className="min-w-0 flex-col">
                  <span className="font-semibold">{o.value}</span>
                  <span className="text-content-subtle block text-[10px]">
                    {labels.target.monstersTpl.replace('{n}', String(o.count))}
                  </span>
                </span>
              </button>
            ))}
          </div>
        ) : display.length ? (
          <div className="grid gap-0.5 sm:grid-cols-2">
            {display.map((o) => (
              <button
                key={o.id}
                type="button"
                className={ROW_CLASS}
                onClick={() => {
                  onPick(o.id);
                  close();
                }}
              >
                <MonsterPortrait tg={o} className="h-10 w-10" />
                <span className="min-w-0 flex-col">
                  <span className="truncate font-semibold">{o.name}</span>
                  {/* Sous-titre SANS ce que le breadcrumb dit déjà (mode et
                      niveaux traversés) : il ne reste que les niveaux non
                      choisis (recherche) et le stage (Sevih 17/08/2026) — une
                      LIGNE repliée n'affiche pas le stage de sa carte témoin,
                      le sélecteur du panneau le choisit. */}
                  <span className="text-content-subtle block truncate text-[10px]">
                    {[
                      mode ? null : o.mode,
                      ...(o.path ?? []).slice(path.length),
                      o.line ? null : o.label,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <NoMatches label={labels.noMatches} />
        )}
      </Modal>
    </>
  );
}
