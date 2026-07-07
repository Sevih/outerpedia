/**
 * CONTRÔLE V2 par personnage — « qu'est-ce qui diffère / qu'est-ce qui reste ? »
 *
 * Confronte UN perso V3 (extrait ou committé) à son fichier oracle V2
 * (`data/legacy/character/*.json`) :
 *   1. CHECKS de valeurs (nom, rareté, élément, classe, chaîne, cadeau, VA…) ;
 *   2. champs V2 non couverts par l'extraction (statut todo/unknown de la
 *      coverage spec) → « ce qu'il reste à intégrer ».
 * Sert la CLI de cohérence ET le panneau admin. Lecture seule sur legacy.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { characterSpec } from './specs/character';
import type { FieldStatus } from './core/spec';

type Dict = Record<string, unknown>;

const stripVA = (s: unknown) =>
  String(s ?? '')
    .replace(/^(VA|CV)\.\s*/, '')
    .trim()
    .toLowerCase();

/** Glossaires nécessaires aux checks (lus par l'appelant, où qu'ils soient). */
export interface ControlGlossaries {
  elements: Record<string, { en?: string }>;
  classes: Record<string, { en?: string }>;
  gifts: Record<string, { en?: string }>;
}

const gloss = (g: Record<string, { en?: string }>, slug: unknown) => g[String(slug)]?.en;

export interface V2CheckDef {
  field: string;
  v3: (c: Dict, g: ControlGlossaries) => unknown;
  v2: (o: Dict) => unknown;
  /** Ignore l'entité (ex. règle de nom des fusions). */
  skip?: (c: Dict, o: Dict) => boolean;
  /** Différence attendue → informatif, pas un échec. */
  info?: string;
}

/** Les checks de cohérence V3↔V2 (partagés CLI / admin). */
export const CHARACTER_CHECKS: V2CheckDef[] = [
  {
    field: 'name',
    v3: (c) =>
      c.showNickName && c.nickname
        ? `${(c.nickname as Dict).en} ${(c.name as Dict).en}`
        : (c.name as Dict).en,
    v2: (o) => o.Fullname,
    skip: (c) => Boolean(c.originalCharacter), // fusions : V2 = "Core Fusion: X" (voulu)
  },
  { field: 'rarity', v3: (c) => c.rarity, v2: (o) => o.Rarity },
  { field: 'element', v3: (c, g) => gloss(g.elements, c.element), v2: (o) => o.Element },
  { field: 'class', v3: (c, g) => gloss(g.classes, c.class), v2: (o) => o.Class },
  {
    field: 'subClass',
    v3: (c) => c.subClass,
    v2: (o) => String(o.SubClass ?? '').toLowerCase() || undefined,
  },
  {
    field: 'chainType',
    v3: (c) => c.chainType,
    v2: (o) => String(o.Chain_Type ?? '').toLowerCase() || undefined,
  },
  { field: 'gift', v3: (c, g) => gloss(g.gifts, c.gift), v2: (o) => o.gift },
  { field: 'originalCharacter', v3: (c) => c.originalCharacter, v2: (o) => o.originalCharacter },
  {
    field: 'voiceActor',
    v3: (c) => stripVA((c.voiceActor as Dict | undefined)?.en),
    v2: (o) => stripVA(o.VoiceActor),
    info: 'V3 = valeur du jeu (choix A) ; écarts = orthographe V2',
  },
];

// Oracle legacy des STATS (character-stats.json V2 : paliers lv/éveil calculés
// depuis les mêmes tables du jeu). Comparé aux paliers AFFICHÉS par la fiche
// (`computeStatSteps`), injectés par l'appelant — datagen ne dépend pas de src.
// Clé V2 → clé d'affichage V3 (mêmes unités : CHC/CHD/DMG_* en %).
const STEP_STAT_MAP: [string, string][] = [
  ['ATK', 'ATK'],
  ['DEF', 'DEF'],
  ['HP', 'HP'],
  ['SPD', 'SPD'],
  ['EFF', 'EFF'],
  ['RES', 'RES'],
  ['CHC', 'CHC'],
  ['CHD', 'CHD'],
  ['DMG_RED', 'DMG RED%'],
  ['DMG_INC', 'DMG UP%'],
];

/** Palier de stats calculé côté affichage (forme minimale de StatStepView). */
export interface StatStepLike {
  key: string;
  level: number;
  stats: Record<string, number>;
  premiumValue?: number | null;
}
let legacyStatsCache: Map<string, Dict> | null = null;
function legacyStatsById(): Map<string, Dict> {
  if (!legacyStatsCache) {
    legacyStatsCache = new Map();
    try {
      const all = JSON.parse(
        readFileSync(resolve('data/legacy/generated/character-stats.json'), 'utf8'),
      ) as Record<string, Dict>;
      for (const [id, v] of Object.entries(all)) legacyStatsCache.set(id, v);
    } catch {
      /* oracle stats absent — contrôle indisponible */
    }
  }
  return legacyStatsCache;
}

// Oracle legacy chargé une fois (indexé par ID).
let legacyCache: Map<string, Dict> | null = null;
function legacyById(): Map<string, Dict> {
  if (!legacyCache) {
    legacyCache = new Map();
    const dir = resolve('data/legacy/character');
    try {
      for (const f of readdirSync(dir)) {
        if (!f.endsWith('.json')) continue;
        const o = JSON.parse(readFileSync(resolve(dir, f), 'utf8')) as Dict;
        legacyCache.set(String(o.ID), o);
      }
    } catch {
      /* legacy absent — contrôle indisponible */
    }
  }
  return legacyCache;
}

export interface V2CheckResult {
  field: string;
  ok: boolean;
  /** Écart attendu (info) plutôt qu'échec. */
  expected: boolean;
  v3: unknown;
  v2: unknown;
}

export interface V2FieldGap {
  field: string;
  status: FieldStatus | 'unknown';
}

export interface SkillEffectCheck {
  /** Type de skill (first/second/ultimate/chain_passive/fusion_passive). */
  skill: string;
  /** Clés d'effet V2 absentes de V3 (potentiel miss d'extraction). */
  missing: string[];
  /** Clés d'effet V3 absentes de V2 (V3 voit plus — souvent OK). */
  extra: string[];
}

export interface V2Control {
  /** Fichier V2 trouvé pour ce perso ? (sinon : perso postérieur à V2, rien à contrôler) */
  found: boolean;
  checks: V2CheckResult[];
  /** Champs présents dans le fichier V2, hors extraction (todo/unknown/curated). */
  gaps: V2FieldGap[];
  /** Comparatif des effets (types de buff) par skill, si les skills sont fournis. */
  skillEffects: SkillEffectCheck[];
}

/** Un champ V2 est « vu » s'il est présent et non vide. */
function isPresent(v: unknown): boolean {
  if (v === undefined || v === null || v === '') return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'object') return Object.keys(v as object).length > 0;
  return true;
}

// V2 identifie les effets de skill par TYPE de buff (`BT_REMOVE_BUFF`,
// `BT_STAT|ST_ATK`, suffixe `_2` pour les doublons) et les regroupe par KIT
// d'affichage : dans les tables du jeu, les buffs de burst vivent sur
// SKT_BURST_1..3 (variantes du second), ceux de l'attaque en chaîne sur
// SKT_STRIKE_* et ceux de l'attaque duo sur SKT_BACKUP_*. On compare donc
// kit contre kit, pas skill unitaire contre skill unitaire.
const SKT_TO_TYPE: Record<string, string> = {
  SKT_FIRST: 'first',
  SKT_SECOND: 'second',
  SKT_ULTIMATE: 'ultimate',
  SKT_CHAIN_PASSIVE: 'chain_passive',
  SKT_FUSION_PASSIVE: 'fusion_passive',
};

/** Kit d'affichage d'un type de skill V3 (les skills techniques rejoignent leur bloc). */
const V3_TYPE_TO_KIT: Record<string, string> = {
  first: 'first',
  second: 'second',
  ultimate: 'ultimate',
  chain_passive: 'chain_passive',
  strike_aerial: 'chain_passive',
  strike_ground: 'chain_passive',
  strike_finish: 'chain_passive',
  backup_aerial: 'chain_passive',
  backup_ground: 'chain_passive',
  fusion_passive: 'fusion_passive',
};

const MAIN_TYPES = ['first', 'second', 'ultimate'] as const;

/**
 * Kit des skills BURST : chaque perso a UN seul skill « burstable » — les
 * bursts 1/2/3 en sont les déclinaisons, activées par le joueur contre de
 * l'AP (burst 3 déverrouillé à la transcendance 5★). Le skill burstable est
 * LE skill principal qui porte `RequireAP` (les 3 coûts d'AP) — marqueur
 * univoque du jeu, vérifié sur les 116 persos à bursts. Repli (défensif) :
 * buffs partagés avec burst_1, puis DamageFactor, puis second.
 */
function burstKit(skills: SkillLike[]): string {
  const mains = skills.filter((s) => (MAIN_TYPES as readonly string[]).includes(s.type));
  const burstable = mains.find((m) => (m.requireAP ?? 0) > 0);
  if (burstable) return burstable.type;
  const base =
    skills.find((s) => s.type === 'burst_1') ?? skills.find((s) => s.type.startsWith('burst_'));
  if (!base) return 'second';
  const buffIds = new Set((base.effects ?? []).map((e) => e.buff).filter(Boolean));
  let byBuff: SkillLike | undefined;
  let bestShared = 0;
  for (const m of mains) {
    const shared = (m.effects ?? []).filter((e) => e.buff && buffIds.has(e.buff)).length;
    if (shared > bestShared) {
      byBuff = m;
      bestShared = shared;
    }
  }
  if (byBuff) return byBuff.type;
  const df = (s: SkillLike) => Math.max(0, ...(s.levels ?? []).map((l) => l.damageFactor ?? 0));
  const bdf = df(base);
  const byDf = bdf ? mains.find((m) => df(m) === bdf) : undefined;
  return byDf?.type ?? 'second';
}

// Renommages V2 : ces clés n'existent pas dans BuffTemplet.Type — V2 les avait
// rebaptisées à la main. On aligne le côté V3 (type jeu → clé V2) pour comparer.
// Chaque alias est vérifié empiriquement (paire miss↔extra dans le même kit).
const V2_RENAMES: Record<string, string> = {
  BT_SHIELD_BASED_CASTER: 'BT_BARRIER',
  BT_SHIELD_BASED_TARGET: 'BT_BARRIER',
  BT_ADDITIVE_ATTACK_ON_EVENT: 'BT_ADDITIVE_ATTACK',
  // « dégâts fixes » V2 = reverse heal du jeu (soin inversé basé sur une stat)
  BT_REVERSE_HEAL_BASED_CASTER: 'BT_FIXED_DAMAGE',
  BT_REVERSE_HEAL_BASED_TARGET: 'BT_FIXED_DAMAGE',
  // « soin continu » V2 = heal-sur-la-durée du jeu
  BT_HEAL_BASED_CASTER: 'BT_CONTINU_HEAL',
  BT_HEAL_BASED_TARGET: 'BT_CONTINU_HEAL',
  // « détonation » V2 = déclenchement immédiat des DoT
  BT_IMMEDIATELY_BLEED: 'DETONATE',
  BT_IMMEDIATELY_BURN: 'DETONATE',
  BT_IMMEDIATELY_POISON: 'DETONATE',
  BT_IMMEDIATELY_CURSE: 'DETONATE',
  // « attaque additionnelle » V2 = attaques déclenchées en fin de tour
  BT_EXTRA_ATTACK_ON_TURN_END: 'BT_ADDITIVE_ATTACK',
  BT_RUN_ACTIVE_SKILL_ON_TURN_END: 'BT_ADDITIVE_ATTACK',
  // dégâts bonus de jauge de faiblesse : deux types jeu pour la même mécanique
  BT_WG_DMG: 'BT_WG_REVERSE_HEAL',
};

/** Normalise une clé d'effet (retire le suffixe de doublon `_2`, `_3`…). */
const normKey = (k: string) => k.replace(/_\d$/, '');

/**
 * Nom d'effet → clé « V2 » (majuscules, `_`) : V2 identifiait les effets NOMMÉS
 * par leur nom de tooltip (`HEAVY_STRIKE` = « Heavy Strike », `BANES_DOMAIN` =
 * « Bane's Domain », `BT_AGILE_RESPONSE` = « Agile Response »).
 */
const nameKey = (name: string) =>
  name
    .replace(/['’]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();

/** Skill V3 minimal pour le comparatif (type + effets avec type/stat/buff bruts). */
export interface SkillLike {
  type: string;
  /** Coût d'AP (présent = skill « burstable » du perso). */
  requireAP?: number;
  desc?: { en?: string };
  effects?: Array<{
    type: string;
    family?: string;
    category?: string;
    stat?: string;
    buff?: string;
    target?: string;
    tooltip?: string;
    label?: string;
    caller?: string;
    choice?: boolean;
  }>;
  levels?: Array<{
    damageFactor?: number;
    tooltips?: string[];
    wgReduce?: number;
    vars?: Record<string, unknown>;
  }>;
}

type SkillLikeEffect = NonNullable<SkillLike['effects']>[number];

/** Labels de CÂBLAGE générique (magnitude pure) — miroir de skill-view. */
const WIRING_LABELS = new Set(['SYS_BUFF_DMG']);

/** Buffs ARBITRÉS non-chips (modificateurs de l'attaque encodés comme buffs à
 * tooltip, déclencheurs au label erroné) — miroir de skill-view, où chaque cas
 * est documenté. */
const NON_CHIP_BUFFS = new Set(['2000096_chain_1_1', '2000059_1_1', '2000094_1_3']);

/**
 * Upgrade de TRANSCENDANCE : buff `trancendent_*` NON accordé au NIVEAU 1 du
 * skill porteur — miroir de skill-view (le niveau 1 d'un unique_passive fait
 * partie du kit de base : Dual Attack du S1 d'Eva ; les niveaux suivants sont
 * les paliers de transcendance, hors kits comme en V2).
 */
function isTranscendUpgrade(s: SkillLike, e: SkillLikeEffect): boolean {
  const b = e.buff ?? '';
  if (!b.startsWith('trancendent') && !b.startsWith('transcendent')) return false;
  return !s.levels?.[0]?.vars?.[b];
}

/**
 * Écarts V2 ARBITRÉS comme erreurs de la V2 (tags fantômes, sans buff ni texte
 * correspondant en jeu) — retirés du diff pour ne pas sonner à vie.
 * Arbitrages utilisateur du 2026-07-06.
 */
const V2_KNOWN_ERRORS: Record<string, Record<string, string[]>> = {
  '2000065': { first: ['BT_ADDITIVE_ATTACK'] },
  '2000114': { second: ['BT_ENHANCE_ALL'] },
};

/**
 * Extras V3 ARBITRÉS « le jeu fait foi » : chips V3 vérifiées correctes (texte
 * du jeu, ou vérification en jeu) que la V2 ne listait pas — retirés du diff.
 * Arbitrages utilisateur du 2026-07-07.
 */
const V2_ACCEPTED_EXTRAS: Record<string, Record<string, string[]>> = {
  // Bursts « +N WG damage » affichés par le texte du jeu :
  '2000008': { second: ['BT_WG_REVERSE_HEAL'] },
  '2000039': { first: ['BT_WG_REVERSE_HEAL'] },
  '2000079': { first: ['BT_WG_REVERSE_HEAL'] },
  '2000085': { second: ['BT_WG_REVERSE_HEAL'] },
  '2000086': { first: ['BT_WG_REVERSE_HEAL'] },
  '2000111': { second: ['BT_WG_REVERSE_HEAL'] },
  '2000114': { second: ['BT_WG_REVERSE_HEAL'] },
  '2000117': { first: ['BT_WG_REVERSE_HEAL'] },
  '2700003': { second: ['BT_WG_REVERSE_HEAL'] },
  '2700005': { second: ['BT_WG_REVERSE_HEAL'] },
  '2700037': { first: ['BT_WG_REVERSE_HEAL'] },
  '2700070': { second: ['BT_WG_REVERSE_HEAL'] },
  // Conséquences des statuts de class passive (Pureblood's Dominion, Charisma,
  // passif de Nadja) :
  '2000035': { second: ['BT_ACTION_GAUGE'] },
  '2000076': { second: ['BT_ACTION_GAUGE'] },
  '2000102': {
    first: ['BT_EXTEND_BUFF', 'BT_EXTEND_DEBUFF'],
    // Contre-attaque décrite par le texte du S2 (« 80% chance to counterattack »).
    second: ['BT_RUN_FIRST_SKILL_ON_TURN_END_DEFENDER'],
  },
  // Attaques additionnelles / contre-attaque décrites par le texte du skill :
  '2000081': {
    second: ['BT_RUN_PASSIVE_SKILL_ON_TURN_END_DEFENDER', 'BT_RUN_PASSIVE_SKILL_ON_TURN_END_TEAM'],
  },
  '2000082': { second: ['BT_RUN_PASSIVE_SKILL_ON_TURN_END_TEAM'] },
  // Burn vérifié en jeu (absent du texte du skill dans TOUTES les langues) :
  '2700043': { ultimate: ['BT_DOT_BURN'] },
};

/** Skills « porteurs » hors kit : leurs effets peuvent appartenir à un kit. */
const PASSIVE_TYPES = new Set(['class_passive', 'unique_passive']);

/**
 * Kit fonctionnel d'un effet porté par un PASSIF : le buff dit lui-même à quel
 * skill il appartient — via `CallerSkillType` (caller, ex. dual attack de Monad
 * Eva déclenché par le first) ou via la convention de nommage du jeu
 * `{charId}_1|2|3_*` / `_chain` / `_backup` (ex. buffs on-death `2000117_2_*`
 * d'Eris portés par son class passive).
 */
function passiveEffectKit(e: { caller?: string; buff?: string }): string | undefined {
  if (e.caller) return e.caller;
  const b = e.buff ?? '';
  const m = /^\d+_([123])(_|$)/.exec(b);
  if (m) return { '1': 'first', '2': 'second', '3': 'ultimate' }[m[1]];
  if (b.includes('_chain') || b.includes('_backup')) return 'chain_passive';
  return undefined;
}

// Équivalences de NOM V2 → nom du jeu (nameKey des deux côtés) : V2 avait
// francisé/abrégé certains noms de mécaniques.
const V2_NAME_ALIASES: Record<string, string[]> = {
  ADDITIVE_ATTACK: ['ADDITIONAL_ATTACK', 'EXTRA_SKILL'],
  ADDITIVE_TURN: ['EXTRA_TURN'],
  CALL_BACKUP: ['DUAL_ATTACK'],
  CASTER_COPY_BUFF: ['GIFT_OF_BUFFS'],
  CONTINU_HEAL: ['SUSTAINED_RECOVERY'],
  RANDOM_STAT: ['RANDOM_INCREASED_STAT_EFFECT'],
  WG_REVERSE_HEAL: ['WEAKNESS_GAUGE_DAMAGE'],
};

/** Curated effects (`data/curated/effects.json`) : créations nommées adressées
 * par type (`keys`) — même pont que l'affichage (skill-view / équipement). */
interface CuratedFx {
  name?: { en?: string };
  isDebuff?: boolean;
  keys?: string[];
}
let curatedFxCache: Record<string, CuratedFx> | undefined;
function curatedFx(): Record<string, CuratedFx> {
  if (!curatedFxCache) {
    try {
      curatedFxCache = JSON.parse(
        readFileSync(resolve(process.cwd(), 'data/curated/effects.json'), 'utf8'),
      ) as Record<string, CuratedFx>;
    } catch {
      curatedFxCache = {};
    }
  }
  return curatedFxCache;
}
let curatedKeySides: Map<string, string> | undefined;
function curatedCreationFor(side: 'buff' | 'debuff', type: string): string | undefined {
  if (!curatedKeySides) {
    curatedKeySides = new Map();
    for (const [id, c] of Object.entries(curatedFx())) {
      const s = c.isDebuff ? 'debuff' : 'buff';
      for (const k of c.keys ?? []) {
        const key = `${s}|${k}`;
        if (!curatedKeySides.has(key)) curatedKeySides.set(key, id);
      }
    }
  }
  return (
    curatedKeySides.get(`${side}|${type}`) ??
    curatedKeySides.get(`${side === 'buff' ? 'debuff' : 'buff'}|${type}`)
  );
}

/** Résolveur nom d'effet (tooltip/label → nom EN) depuis le glossaire généré. */
function effectNameResolver(
  glossaries: ControlGlossaries,
): (e: { tooltip?: string; label?: string }) => string | undefined {
  const g = glossaries as unknown as {
    effects?: Record<string, { name?: { en?: string } }>;
    effectByTooltip?: Record<string, string>;
    effectByLabel?: Record<string, string>;
  };
  return (e) => {
    const id =
      (e.tooltip && g.effectByTooltip?.[e.tooltip]) ||
      (e.label && g.effectByLabel?.[e.label]) ||
      '';
    return id ? g.effects?.[id]?.name?.en : undefined;
  };
}

/** Comparatif des effets par kit : V2 (buff+debuff+dual) vs V3 (effects). */
function skillEffectChecks(
  skills: SkillLike[],
  legacy: Dict,
  glossaries: ControlGlossaries,
): SkillEffectCheck[] {
  const v2Skills = (legacy.skills as Record<string, Dict>) ?? {};
  const nameOf = effectNameResolver(glossaries);
  const out: SkillEffectCheck[] = [];
  for (const [skt, v2s] of Object.entries(v2Skills)) {
    const type = SKT_TO_TYPE[skt];
    if (!type) continue;
    // Clés V2 + leur NATURE (liste buff vs debuff d'origine) — affichée dans
    // les écarts pour distinguer les deux d'un coup d'œil.
    const v2Side = new Map<string, string>();
    for (const listName of ['buff', 'debuff', 'dual_buff', 'dual_debuff'] as const) {
      const side = listName.includes('debuff') ? 'D' : 'B';
      for (const k of (v2s[listName] as string[]) ?? []) {
        const key = normKey(k);
        const prev = v2Side.get(key);
        v2Side.set(key, prev && prev !== side ? 'B+D' : side);
      }
    }
    // Erreurs V2 arbitrées : retirées des listes V2 avant diff.
    for (const k of V2_KNOWN_ERRORS[String(legacy.ID)]?.[type] ?? []) v2Side.delete(k);
    const v2Keys = new Set(v2Side.keys());
    const kitSkills = skills.filter((s) => {
      const kit = s.type.startsWith('burst_') ? burstKit(skills) : V3_TYPE_TO_KIT[s.type];
      return kit === type;
    });
    // Upgrades de TRANSCENDANCE exclus par skill porteur (le niveau 1 d'un
    // unique_passive fait partie du kit — Dual Attack d'Eva) : cf. isTranscendUpgrade.
    const kitEffects = [
      ...kitSkills.flatMap((s) => (s.effects ?? []).filter((e) => !isTranscendUpgrade(s, e))),
      // + les effets des passifs qui appartiennent fonctionnellement à ce kit :
      // caller/convention de slot, ou buff RÉFÉRENCÉ PAR LA DESC d'un skill du
      // kit (Dianne : le S2 décrit `[Buff_T_2000093_passive_1]`, porté par le
      // class passive).
      ...skills
        .filter((s) => PASSIVE_TYPES.has(s.type))
        .flatMap((s) => (s.effects ?? []).filter((e) => !isTranscendUpgrade(s, e)))
        .filter((e) => {
          if (passiveEffectKit(e) === type) return true;
          if (passiveEffectKit(e) !== undefined || !e.buff) return false;
          // la desc référence le buff, ou un frère du même groupe (suffixe _N)
          const base = e.buff.replace(/_\d+$/, '');
          return kitSkills.some((k) => k.desc?.en?.includes(e.buff!) || k.desc?.en?.includes(base));
        }),
    ];
    // V2 ne composait la stat que pour BT_STAT (`BT_STAT|ST_ATK`) — les
    // autres types la portent en interne mais la clé V2 reste nue.
    const keyOf = (e: (typeof kitEffects)[number]) => {
      const composed =
        e.type === 'BT_STAT' && e.stat ? `${e.type}|ST_${e.stat.toUpperCase()}` : e.type;
      const raw = normKey(composed);
      return V2_RENAMES[raw] ?? raw;
    };
    // CHIPS AFFICHÉES — miroir EXACT de `toChipEffect` (skill-view) : tooltip
    // résoluble, label RÉSOLU de mécanique non-stat, ou création curée par
    // type. Exclusions : BT_STAT*/BT_NONE à label seul (câblage), enfants de
    // groupe aléatoire, buffs de TRANSCENDANCE. Le contrôle compare V2 à ce
    // que la fiche AFFICHE, dans les deux sens.
    const g = glossaries as unknown as {
      effectByTooltip?: Record<string, string>;
      effectByLabel?: Record<string, string>;
    };
    const chipOf = (
      e: (typeof kitEffects)[number],
    ): { key: string; kind: string; name?: string } | null => {
      if (e.choice) return null;
      if (e.buff && NON_CHIP_BUFFS.has(e.buff)) return null;
      const key = keyOf(e);
      // Composite type|stat brut — même clé que Glossaries.tooltipKinds.
      const kind = e.stat ? `${e.type}|${e.stat}` : e.type;
      const statLike = e.type === 'BT_STAT' || e.type === 'BT_STAT_PREMIUM' || e.type === 'BT_NONE';
      if (e.tooltip && g.effectByTooltip?.[e.tooltip]) return { key, kind, name: nameOf(e) };
      if (e.label && !statLike && !WIRING_LABELS.has(e.label) && g.effectByLabel?.[e.label])
        return { key, kind, name: nameOf(e) };
      // Dégâts fixes auto-infligés (coût en HP, 2000024) — jamais une chip.
      if (e.type.startsWith('BT_REVERSE_HEAL') && !(e.target ?? '').startsWith('enemy'))
        return null;
      if (!statLike) {
        const side = e.category === 'buff' ? 'buff' : 'debuff';
        const cid = curatedCreationFor(side, e.type);
        if (cid) {
          const c = curatedFx()[cid];
          const eff = (
            glossaries as unknown as { effects?: Record<string, { name?: { en?: string } }> }
          ).effects?.[cid];
          return { key, kind, name: c?.name?.en ?? eff?.name?.en };
        }
      }
      return null;
    };
    const chips = kitEffects
      .map((e) => {
        const c = chipOf(e);
        return c ? { ...c, side: e.category === 'buff' ? 'B' : 'D' } : null;
      })
      .filter((c): c is { key: string; kind: string; name?: string; side: string } => Boolean(c));
    const v3Side = new Map<string, string>();
    for (const c of chips) {
      const prev = v3Side.get(c.key);
      v3Side.set(c.key, prev && prev !== c.side ? 'B+D' : c.side);
    }
    const v3Named = new Set(v3Side.keys());
    const chipNames = new Set(
      chips
        .map((c) => c.name)
        .filter((n): n is string => Boolean(n))
        .map((n) => nameKey(n)),
    );
    // Groupe à tirage aléatoire de stats (Dianne : 1 stat au hasard parmi 4)
    // = le « BT_RANDOM_STAT » de V2.
    if (kitEffects.some((e) => e.choice && e.type === 'BT_STAT')) {
      v3Named.add('BT_RANDOM_STAT');
      v3Side.set('BT_RANDOM_STAT', 'B');
    }
    // Bonus de jauge de faiblesse d'une OPTION de burst : pas un buff — le
    // marqueur est le TEXTE du burst (« +1 Weakness Gauge damage », Anarky/
    // Rey), PAS le WGReduce brut : plusieurs kits (Astei, Christina, Luna) ont
    // un WGReduce de burst supérieur dans les tables sans que le jeu ne
    // l'affiche. Miroir de syntheticBurstEffects (skill-view).
    const bursts = skills.filter((s) => s.type.startsWith('burst_'));
    if (
      type === burstKit(skills) &&
      // \n littéraux normalisés : « …\nWG » n'offre pas de frontière de mot.
      bursts.some((b) => /weakness gauge|\bwg\b/i.test((b.desc?.en ?? '').replace(/\\n/g, ' ')))
    ) {
      v3Named.add('BT_WG_REVERSE_HEAL');
      v3Side.set('BT_WG_REVERSE_HEAL', 'B');
    }
    // Statuts de NIVEAU affichés par la fiche — miroir EXACT de l'affichage :
    // seule la VARIANTE AFFICHÉE du skill compte (mainSkills : le plus de
    // niveaux — les copies à 1 niveau de K portent des tooltips périmés), pas
    // les bursts ni les skills techniques ; icône requise, niveau MAX
    // seulement ; dédupliqués contre les chips du kit par NOM, par RÉF, et par
    // TYPE de mécanique (tooltipKinds : un statut générique est une redite
    // quand une chip applique le même type sous un statut custom — 2000020).
    const effectsRec = (glossaries as unknown as { effects?: Record<string, { icon?: string }> })
      .effects;
    const tooltipKinds = (glossaries as unknown as { tooltipKinds?: Record<string, string[]> })
      .tooltipKinds;
    const present = new Set(kitEffects.map((e) => e.tooltip).filter(Boolean));
    const chipKinds = new Set(chips.map((c) => c.kind));
    // Le porteur AFFICHÉ du kit : la variante du type exact la plus complète
    // (mainSkills) ; pour la chaîne, le chain_passive lui-même (la section
    // chaîne affiche ses statuts de niveau — « Heavy Strike »).
    const displayedVariant = [...kitSkills]
      .filter((s) => s.type === type)
      .sort((a, b) => (b.levels?.length ?? 0) - (a.levels?.length ?? 0))[0];
    const lastLevel = displayedVariant?.levels?.[displayedVariant.levels.length - 1];
    // Statut cité comme CONDITION par la desc (« if the caster has a
    // Barrier ») : référencé pour lecture, pas accordé — miroir de skill-view.
    const variantDesc = (displayedVariant?.desc?.en ?? '').replace(/\\n/g, ' ');
    const isCondition = (name: string | undefined) =>
      Boolean(name) &&
      new RegExp(
        `(?:if|when)[^.]*\\bha(?:s|ve)\\b[^.]*${name!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
        'i',
      ).test(variantDesc);
    const shownLevelNames = new Set(
      (lastLevel?.tooltips ?? [])
        .filter((t) => !present.has(t))
        .filter((t) => {
          const id = g.effectByTooltip?.[t];
          return Boolean(id && effectsRec?.[id]?.icon);
        })
        .filter((t) => !(tooltipKinds?.[t] ?? []).some((k) => chipKinds.has(k)))
        .map((t) => nameOf({ tooltip: t }))
        .filter((n): n is string => Boolean(n) && !isCondition(n))
        .map((n) => nameKey(n))
        .filter((n) => !chipNames.has(n)),
    );
    // COUVERTURE au niveau AFFICHAGE : une clé V2 est couverte par une chip de
    // même clé (variante _IR acceptée) ou de même NOM (alias V2 compris,
    // statuts de niveau inclus).
    const displayedNames = new Set([...chipNames, ...shownLevelNames]);
    const covered = (k: string) => {
      if (v3Named.has(k)) return true;
      const base = normKey(k.replace(/_IR$/, '')); // _IR = variante irrésistible V2
      if (v3Named.has(base)) return true;
      const name = base.replace(/^BT_/, '');
      if (displayedNames.has(name)) return true;
      return (V2_NAME_ALIASES[name] ?? []).some((a) => displayedNames.has(a));
    };
    // Sens INVERSE (chips V3 hors listes V2) : une clé V3 est couverte par sa
    // présence directe, ou par une clé V2 de même NOM d'effet (alias compris).
    const v3NameByKey = new Map<string, string>();
    for (const c of chips) if (c.name) v3NameByKey.set(c.key, nameKey(c.name));
    const v2NameKeys = new Set(
      [...v2Keys].map((k) => normKey(k.replace(/_IR$/, '')).replace(/^BT_/, '')),
    );
    const nameInV2 = (n: string | undefined) =>
      Boolean(
        n &&
        (v2NameKeys.has(n) || [...v2NameKeys].some((b) => (V2_NAME_ALIASES[b] ?? []).includes(n))),
      );
    const extraCovered = (k: string) =>
      v2Keys.has(k) || v2Keys.has(`${k}_IR`) || nameInV2(v3NameByKey.get(k));
    // Écarts PRÉFIXÉS par la nature (B/D — B+D si les deux) : côté V2 la liste
    // d'origine, côté V3 la catégorie du classifier.
    const missing = [...v2Keys]
      .filter((k) => !covered(k))
      .sort()
      .map((k) => `${v2Side.get(k) ?? '?'} · ${k}`);
    // Extras arbitrés « le jeu fait foi » : retirés du diff.
    const accepted = new Set(V2_ACCEPTED_EXTRAS[String(legacy.ID)]?.[type] ?? []);
    const extra = [
      ...[...v3Named]
        .filter((k) => !extraCovered(k) && !accepted.has(k))
        .sort()
        .map((k) => `${v3Side.get(k) ?? '?'} · ${k}`),
      ...[...shownLevelNames]
        .filter((n) => !nameInV2(n) && !accepted.has(n))
        .sort()
        .map((n) => `B · ${n} (statut affiché par le skill)`),
    ];
    if (missing.length || extra.length) out.push({ skill: type, missing, extra });
  }
  return out;
}

/** Contrôle complet d'un perso V3 contre son fichier V2. */
export function characterV2Control(
  char: Dict,
  glossaries: ControlGlossaries,
  skills: SkillLike[] = [],
  statSteps?: StatStepLike[],
): V2Control {
  const legacy = legacyById().get(String(char.id));
  if (!legacy) return { found: false, checks: [], gaps: [], skillEffects: [] };

  const checks: V2CheckResult[] = [];
  for (const chk of CHARACTER_CHECKS) {
    if (chk.skip?.(char, legacy)) continue;
    const v2 = chk.v2(legacy);
    if (v2 === undefined || v2 === '') continue; // V2 n'a pas la donnée
    const v3 = chk.v3(char, glossaries);
    checks.push({ field: chk.field, ok: v3 === v2, expected: Boolean(chk.info), v3, v2 });
  }

  // Stats : chaque palier AFFICHÉ (lv1_ev0 … lv120_ev8, computeStatSteps) est
  // comparé au palier V2 de même clé, stat par stat + premium. Au-delà du
  // niveau 100, la V3 applique LevelUpStatModifierAfter100 (vérifié in-game
  // par le gear-solver) que la V2 omettait → écart ATTENDU (informatif).
  if (statSteps?.length) {
    const v2Steps = (legacyStatsById().get(String(char.id))?.steps ?? {}) as Record<
      string,
      Record<string, number | null>
    >;
    for (const [key, v2s] of Object.entries(v2Steps)) {
      const v3s = statSteps.find((s) => s.key === key);
      const diffs: string[] = [];
      for (const [k2, k3] of STEP_STAT_MAP) {
        const a = v3s?.stats[k3] ?? 0;
        const b = v2s[k2] ?? 0;
        if (a !== b) diffs.push(`${k2} ${a}≠${b}`);
      }
      const pv2 = v2s.premium_value;
      const pv3 = v3s?.premiumValue;
      if (pv2 != null && pv3 != null && pv3 !== pv2) diffs.push(`premium ${pv3}≠${pv2}`);
      const level = v3s?.level ?? Number(/lv(\d+)/.exec(key)?.[1] ?? 0);
      checks.push({
        field: `stats.${key}`,
        ok: diffs.length === 0,
        expected: diffs.length > 0 && level > 100,
        v3: diffs.length ? diffs.join(', ') : 'identique',
        v2: diffs.length ? (level > 100 ? 'interpolation V2 (sans modificateur)' : '≠') : '=',
      });
    }
  }

  const coverage = characterSpec.coverage?.fields ?? {};
  const gaps: V2FieldGap[] = [];
  for (const [field, value] of Object.entries(legacy)) {
    if (!isPresent(value)) continue;
    const status = (coverage[field] ?? 'unknown') as V2FieldGap['status'];
    if (status === 'extracted' || status === 'ignore') continue;
    gaps.push({ field, status });
  }
  gaps.sort((a, b) => a.status.localeCompare(b.status) || a.field.localeCompare(b.field));

  return { found: true, checks, gaps, skillEffects: skillEffectChecks(skills, legacy, glossaries) };
}
