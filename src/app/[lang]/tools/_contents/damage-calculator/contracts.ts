/**
 * Contrats du Damage Calculator — les TYPES du pont wrapper serveur → client
 * (`Dc*`, `Props`) et les types d'état partagés avec les sous-composants
 * (`SetPick`, `AllyPick`). Extrait de `DamageCalculatorBrowser.tsx` le
 * 25/08/2026 (découpage mécanique, contenu inchangé).
 */
import type { Lang } from '@/lib/i18n/config';

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
  /** `ATTACKER_ELEMENT_WIN/EQUAL/LOSE`, `TARGET_ELEMENT` ou `OWNER_RAGE` —
   *  absent = toujours actif (hors gate d'enrage). */
  condition?: string;
  /** `ConditionValue` de la ligne (élément CET_* pour `TARGET_ELEMENT`). */
  conditionValue?: number;
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
  /** Bandeau « outil pas fini » en tête de page (les résultats peuvent
   *  différer du jeu) — demandé affiché par Sevih le 25/08/2026. */
  disclaimer: string;
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

export interface Props {
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
  /** Main stats de talisman proposées (porteur comme ALLIÉS) : slug, libellé
   *  et buffId du buff d'ÉQUIPE (`BID_ITEM_STAT_OOPARTS_*`, moteur § 15). */
  talismanMains: { key: string; label: string; buffId: string }[];
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

/** Un set choisi : le nombre de picks décide des pièces (1 → 4P, 2 → 2P+2P). */
export interface SetPick {
  setId: string;
  tier: number;
}

/** Un allié : perso + transcendance + main stat & enhancement (+0 à +10) du
 *  talisman porté + EE possédé / +10 (certains EE portent sur l'équipe) +
 *  arme/accessoire (des uniques portent des lignes `MY_TEAM*` — 24/08/2026) —
 *  tout est une entrée du moteur (Sevih 27/07/2026). */
export interface AllyPick {
  id: string | null;
  transcend: number;
  talisman: string | null;
  talismanLv: number;
  ee: boolean;
  eePlus: boolean;
  weapon: string | null;
  weaponTier: number;
  amulet: string | null;
  amuletTier: number;
}
export const EMPTY_ALLY: AllyPick = {
  id: null,
  transcend: 0,
  talisman: null,
  talismanLv: 10,
  ee: true,
  eePlus: true,
  weapon: null,
  weaponTier: 0,
  amulet: null,
  amuletTier: 0,
};
