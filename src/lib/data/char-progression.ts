/**
 * PROGRESSION d'un personnage — paliers de stats, transcendance, gifts.
 *
 * Les paliers de stats sont CALCULÉS avec les règles du client, validées
 * contre l'oracle hérité (`char-progression.test.ts`, perso 2000073) :
 *   - stats interpolées (ATK/DEF/HP/SPD/EFF/RES) :
 *     min + floor((max−min)·(L−1)/99) + Σ bonus d'évolution — référence
 *     niveau 100, EXTRAPOLÉE au-delà (limit breaks 105/110/120) ;
 *   - CHC/CHD : fixes (min, en %) + évolutions ;
 *   - DMG UP%/RED%/PEN% : uniquement les bonus d'évolution.
 *
 * Base (min/max), évolutions et passifs de fiche viennent du CONTRAT solver
 * (`solver/characters.json`), la même source que le gear-solver : c'est lui
 * qui suit `CharacterFusionTemplet` (un Core Fusion prend la base et les
 * évolutions de son perso d'origine) et qui cumule TOUS les buffs de fiche
 * (passifs de classe, de noyau, de S1/S2/S3), comme le client
 * (`CSkillManager.GetStatPremiumBuffList`). La fiche en avait sa propre
 * extraction (`progression.json` `evoRewards`/`premium`), fausse sur les six
 * Core Fusion et muette sur les passifs de S2 (audit des doublons, § 2.2, 2.4,
 * 2.5). Le reste (échelle d'évolution, limit breaks, codex, quirks, Skill_8)
 * vient toujours de `progression.json`.
 */
import type {
  Character,
  CharacterIngredients,
  Item,
  ProgressionData,
  Skill,
  SolverStatBlock,
  StatBonus,
  TranscendData,
  TranscendStep,
} from '@contracts';
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { transcendStarRow } from '@/lib/images';
import { stepLabel } from '@/lib/transcendence';
import { GRADE_RANK } from '@/lib/data/gear-order';
import {
  STEP_STAT_KEYS,
  PERCENT_STEP_KEYS,
  type LayerParts,
  type StatLayersView,
  type StatStepView,
  type StepStatKey,
} from '@/lib/stat-compose';
import { SUBSTAT_AXES, type SubstatAxis, type SubstatFlatProfile } from '@/lib/substat-verdict';
import progressionData from '@data/generated/progression.json';
import transcendData from '@data/generated/transcend.json';
import itemsData from '@data/generated/items.json';
import skillsData from '@data/generated/skills.json';
import solverCharactersData from '@data/generated/solver/characters.json';

const PROGRESSION = progressionData as unknown as ProgressionData;
const TRANSCEND = transcendData as unknown as TranscendData;
const ITEMS = itemsData as unknown as Record<string, Item>;
const SKILLS = skillsData as unknown as Record<string, Skill>;
const SOLVER = solverCharactersData as unknown as Record<
  string,
  { ingredients: CharacterIngredients }
>;

/** Ingrédients du contrat solver d'un perso. Le contrat et `characters.json`
 * sortent du même build : un perso sans entrée est une incohérence de données
 * (couverte par `char-progression.test.ts`), pas un cas à maquiller. */
function ingredientsOf(char: Character): CharacterIngredients {
  const ing = SOLVER[char.id]?.ingredients;
  if (!ing) throw new Error(`solver/characters.json : pas d'entrée pour ${char.id}`);
  return ing;
}

// Les briques PURES (clés, formule CalcFinalStat, composeStep) vivent dans
// `@/lib/stat-compose` — client-safe, sans données. Ré-exportées ici pour les
// consommateurs serveur.
export { STEP_STAT_KEYS, PERCENT_STEP_KEYS };
export type { StatStepView, StepStatKey, StatLayersView };

/** Champ du contrat solver (`StatBlock`, unités d'affichage : entiers pour
 * ATK…RES, % pour CHC/CHD/PEN/DMG) → clé d'affichage. Les taux (`*Pct`,
 * `effRate`, `resRate`) sont traités à part (`blockToParts`). */
const BLOCK_KEY: Partial<Record<keyof SolverStatBlock, StepStatKey>> = {
  atk: 'ATK',
  def: 'DEF',
  hp: 'HP',
  spd: 'SPD',
  chc: 'CHC',
  chd: 'CHD',
  pen: 'PEN%',
  dmgInc: 'DMG UP%',
  dmgRed: 'DMG RED%',
  eff: 'EFF',
  res: 'RES',
};

/** Stat interpolée → plage min/max du contrat. */
const BASE_KEY = {
  ATK: 'atk',
  DEF: 'def',
  HP: 'hp',
  SPD: 'spd',
  EFF: 'eff',
  RES: 'res',
} as const;

export interface StatStepsView {
  steps: StatStepView[];
}

type LimitBreakSteps = ProgressionData['limitBreak'][string];

/**
 * Modificateur per-mille de croissance au-delà du niveau 100
 * (LevelUpStatModifierAfter100) — validé in-game par le gear-solver (l'oracle
 * l'omettait, écart assumé). C'est le PALIER de limit break qui le fixe : aux
 * niveaux où on l'appelle (les `maxLevel` des LB — 105 / 110 / 120), le plus
 * petit palier qui atteint `level` EST ce palier, sans ambiguïté.
 */
function limitBreakModifier(lb: LimitBreakSteps, level: number): number {
  if (level <= 100) return 0;
  return lb.find((s) => s.maxLevel >= level)?.statModifier ?? 0;
}

/**
 * Portion « blanche » d'un perso à un niveau quelconque : base interpolée
 * (`base`) et base + bonus des évolutions `evs` (`stats`). Une seule formule
 * pour les paliers de la fiche ET le profil par niveau des substats.
 */
function whiteStatsAt(
  char: Character,
  level: number,
  evs: number[],
  modifier: number,
): { stats: Record<StepStatKey, number>; base: Record<StepStatKey, number> } {
  const ing = ingredientsOf(char);
  const cum: Partial<Record<StepStatKey, number>> = {};
  for (const ev of evs) {
    const block = ing.evoByLevel[String(ev)];
    if (!block) continue;
    for (const [field, key] of Object.entries(BLOCK_KEY) as [keyof SolverStatBlock, StepStatKey][])
      if (block[field]) cum[key] = (cum[key] ?? 0) + block[field];
  }

  const stats = {} as Record<StepStatKey, number>;
  const base = {} as Record<StepStatKey, number>;
  for (const key of STEP_STAT_KEYS) {
    if (key === 'CHC' || key === 'CHD') {
      base[key] = ing.base[key === 'CHC' ? 'chc' : 'chd'].min;
      stats[key] = base[key] + (cum[key] ?? 0);
    } else if (key === 'DMG UP%' || key === 'DMG RED%' || key === 'PEN%' || key === 'CDMG RED%') {
      base[key] = 0;
      stats[key] = cum[key] ?? 0;
    } else {
      const r = ing.base[BASE_KEY[key]];
      const mn = r.min;
      const rng = r.max - mn;
      const growth = rng > 0 ? Math.floor((rng * (level - 1)) / 99) : 0;
      const above =
        rng > 0 && level > 100 ? Math.floor((rng * (level - 100) * modifier) / 99000) : 0;
      base[key] = mn + growth + above;
      stats[key] = base[key] + (cum[key] ?? 0);
    }
  }
  return { stats, base };
}

/** Paliers de stats d'un perso (lv1 + un par évolution, jusqu'au lv120). */
export function computeStatSteps(char: Character): StatStepsView {
  const rungs = PROGRESSION.evolutions[String(char.rarity)] ?? [];
  const lb = PROGRESSION.limitBreak[`${char.rarity}_${char.element}`] ?? [];

  const points: { level: number; evo: number; evs: number[] }[] = [
    { level: 1, evo: 0, evs: [] },
    ...rungs.map((r, i) => ({
      level: r.level,
      evo: i + 1,
      evs: rungs.slice(0, i + 1).map((x) => x.ev),
    })),
  ];

  const steps = points.map(({ level, evo, evs }) => {
    const { stats, base } = whiteStatsAt(char, level, evs, limitBreakModifier(lb, level));

    const step: StatStepView = { key: `lv${level}_ev${evo}`, level, evo, stats, base };
    const lbStep = lb.find((s) => s.maxLevel === level);
    if (lbStep)
      step.limitBreak = {
        pieces: lbStep.pieces,
        recallItemId: lbStep.recallItemId,
        price: lbStep.price,
      };
    return step;
  });

  return { steps };
}

// --- Couches optionnelles (quirks / codex / transcendance) -------------------------

/** Slug de bonus (quirks / skill_8) → clé d'affichage. */
const BONUS_KEY: Record<string, StepStatKey> = {
  atk: 'ATK',
  def: 'DEF',
  hp: 'HP',
  speed: 'SPD',
  critical_rate: 'CHC',
  critical_dmg_rate: 'CHD',
  dmg_boost: 'DMG UP%',
  dmg_reduce_rate: 'DMG RED%',
  pierce_power_rate: 'PEN%',
  e_cri_dmg_reduce: 'CDMG RED%',
  buff_chance: 'EFF',
  buff_resist: 'RES',
};

/** Accumule un bonus brut dans une couche (unités d'affichage / per-mille). */
function addBonus(parts: LayerParts, b: StatBonus): void {
  const key = BONUS_KEY[b.stat];
  if (!key) return; // stats hors fiche (enter_ap…)
  if (PERCENT_STEP_KEYS.has(key)) {
    // Stats intrinsèquement % : valeur per-mille → points d'affichage.
    (parts.flat ??= {})[key] = (parts.flat[key] ?? 0) + b.value / 10;
  } else if (b.applying === 'rate') {
    (parts.ratePM ??= {})[key] = (parts.ratePM[key] ?? 0) + b.value;
  } else {
    (parts.flat ??= {})[key] = (parts.flat[key] ?? 0) + b.value;
  }
}

/**
 * Couches optionnelles de la fiche pour les contrôles de la section Stats :
 * paliers de transcendance (% ATK/DEF/HP + buffs du passif au niveau lié),
 * courbe du codex, quirks applicables (arbre élémentaire + classe +
 * sous-classe, niveau max) et passifs de fiche (`sheetPassives`).
 */
export function getStatLayers(char: Character): StatLayersView {
  const steps = TRANSCEND.overrides[char.id] ?? TRANSCEND.byStar[String(char.rarity)] ?? [];
  const uniqueId = char.skills.find((id) => SKILLS[id]?.type === 'unique_passive');
  const s8 = uniqueId ? PROGRESSION.skill8[uniqueId] : undefined;
  const transcend = steps.map((s) => {
    const parts: LayerParts = {};
    for (const b of s8?.[String(s.skillLevel)] ?? []) addBonus(parts, b);
    return {
      label: stepLabel(s),
      showStar: s.showStar,
      starPlus: s.starPlus,
      atkPM: s.atk,
      defPM: s.def,
      hpPM: s.hp,
      skill8: parts,
    };
  });

  const stat: LayerParts = {};
  const buff: LayerParts = {};
  const blocks = [
    PROGRESSION.quirks.elemental[char.element],
    PROGRESSION.quirks.class[char.class],
    char.subClass ? PROGRESSION.quirks.subclass[char.subClass] : undefined,
  ];
  for (const bl of blocks) {
    if (!bl) continue;
    for (const b of bl.stat) addBonus(stat, b);
    for (const b of bl.buff) addBonus(buff, b);
  }

  return {
    transcend,
    codex: PROGRESSION.codex.map((c) => ({ atkPM: c.atk, defPM: c.def, hpPM: c.hp })),
    quirks: { stat, buff },
    passives: sheetPassives(char),
  };
}

/** Bloc du contrat → couche : plats tels quels (unités d'affichage), taux en
 * per-mille (`10.2` % → 102 ‰ ; arrondi pour éponger le flottant du ÷10). */
function blockToParts(parts: LayerParts, block: SolverStatBlock): void {
  for (const [field, key] of Object.entries(BLOCK_KEY) as [keyof SolverStatBlock, StepStatKey][])
    if (block[field]) (parts.flat ??= {})[key] = (parts.flat[key] ?? 0) + block[field];
  const rates: [keyof SolverStatBlock, StepStatKey][] = [
    ['atkPct', 'ATK'],
    ['defPct', 'DEF'],
    ['hpPct', 'HP'],
    ['effRate', 'EFF'],
    ['resRate', 'RES'],
  ];
  for (const [field, key] of rates)
    if (block[field])
      (parts.ratePM ??= {})[key] = (parts.ratePM[key] ?? 0) + Math.round(block[field] * 10);
}

/** Emplacement de compétence → son bloc par niveau dans le contrat. */
const SKILL_SLOTS = [
  ['first', 's1ByLevel'],
  ['second', 's2ByLevel'],
  ['ultimate', 's3ByLevel'],
] as const;

/**
 * Passifs de fiche (couche BuffValueRate) : passif de classe (Skill_22), passif
 * de noyau d'un Core Fusion (Skill_23) et passifs permanents de S1/S2/S3,
 * TOUS cumulés comme le client.
 *
 * Le jeu les prend au niveau COURANT de chaque compétence ; une fiche de wiki
 * doit en choisir un : le niveau MAXIMUM, comme le Combat Power de la même
 * section (skills Lv5) et le niveau de fusion max que le contrat suppose pour
 * le noyau. Un niveau sans entrée dans le contrat ne porte aucun buff de fiche
 * et vaut zéro (Claire, S2 niv. 1) — jamais de repli sur un autre niveau.
 */
function sheetPassives(char: Character): LayerParts {
  const ing = ingredientsOf(char);
  const parts: LayerParts = {};
  blockToParts(parts, ing.classPassive);
  if (ing.corePassive) blockToParts(parts, ing.corePassive);
  for (const [type, field] of SKILL_SLOTS) {
    const skill = char.skills.map((id) => SKILLS[id]).find((sk) => sk?.type === type);
    const maxLevel = Math.max(0, ...(skill?.levels.map((l) => l.level) ?? []));
    const block = ing[field][String(maxLevel)];
    if (block) blockToParts(parts, block);
  }
  return parts;
}

// --- Substats flat vs % : base aux paliers stables ---------------------------------

/**
 * Le profil que le verdict flat / % (`lib/substat-verdict`) consomme côté
 * client : `sum_flat` = base + évolutions ATTEINTES, aux seuls paliers où une
 * reco de gear a un sens — le cap sans limit break (100) puis le `maxLevel` de
 * chaque LB (105 / 110 / 120), lus dans les tables. Chaque palier est
 * exactement un LB, donc son modificateur de croissance est sans ambiguïté.
 * Plus les quirks PLATS (IOT_STAT — leur taux est exclu, il s'ajoute à la même
 * somme de taux que le % du gear). La transcendance n'intervient pas : le
 * limit break est ouvert à tout palier d'étoiles.
 */
export function getSubstatFlatProfile(
  char: Character,
  layers: StatLayersView = getStatLayers(char),
): SubstatFlatProfile {
  const rungs = PROGRESSION.evolutions[String(char.rarity)] ?? [];
  const lb = PROGRESSION.limitBreak[`${char.rarity}_${char.element}`] ?? [];
  // Sans entrée de limit break pour ce couple rareté/élément, on n'invente pas
  // de palier : un seul, le cap d'avant-LB (100 — la borne où la formule
  // elle-même change de régime, cf. `whiteStatsAt`), pas le dernier rung
  // d'évolution (120, qui est un niveau de LB).
  const baseCap = lb.length
    ? Math.min(...lb.map((s) => s.requireLevel))
    : Math.max(1, ...rungs.map((r) => r.level).filter((l) => l <= 100));
  const levels = [baseCap, ...lb.map((s) => s.maxLevel)].sort((a, b) => a - b);

  const flatByLevel = { ATK: {}, DEF: {}, HP: {} } as Record<SubstatAxis, Record<number, number>>;
  for (const level of levels) {
    const evs = rungs.filter((r) => r.level <= level).map((r) => r.ev);
    const { stats } = whiteStatsAt(char, level, evs, limitBreakModifier(lb, level));
    for (const axis of SUBSTAT_AXES) flatByLevel[axis][level] = stats[axis];
  }

  const awakFlat = {} as Record<SubstatAxis, number>;
  for (const axis of SUBSTAT_AXES) awakFlat[axis] = layers.quirks?.stat.flat?.[axis] ?? 0;

  return { levels, flatByLevel, awakFlat };
}

// --- Transcendance -----------------------------------------------------------------

/** Couleur d'étoile déclarée par le jeu → sprite CM_icon_star_*. */
// STAR_SPRITE vit dans `@/lib/images` — table de noms de sprites, elle n'a rien
// à faire dans un module qui importe 6 Mo de JSON (cf. le commentaire là-bas).
// Pas de réexport ici : ce serait rouvrir le chemin d'import qu'on vient de
// fermer. Les appelants la prennent directement dans `@/lib/images`.

export interface TranscendTierView {
  /** Libellé (« 4+ », « 5++ ») — étoile UI + suffixe selon la couleur. */
  label: string;
  /** Étoile UI du palier + couleur déclarée — la forme COMPACTE de `stars`
   *  (le damage calculator embarque ces deux champs et reconstruit la rangée
   *  via `transcendStarRow`). */
  star: number;
  color: string;
  /** Rangée de 6 étoiles : sprites (jaunes + dernière colorée + grises). */
  stars: string[];
  /** Bonus cumulés (%) — hp/atk/def sont déjà des totaux dans la table. */
  hpPct: number;
  atkPct: number;
  defPct: number;
  /** Lignes du PASSIF UNIQUE cumulées à ce palier (« +8% Ally Team Critical Damage »). */
  passives: string[];
}

/*
 * LE LIBELLÉ D'UN PALIER SE LIT DANS `StarPlus`, PAS DANS LA COULEUR.
 *
 * Il se déduisait ici d'une table couleur → suffixe (`yellow` → rien, `orange` et
 * `red` → « + », `violet` → « ++ »). C'est juste sur un 3★, où le jeu colore
 * effectivement ses paliers « + », et FAUX sur toutes les raretés 1 et 2, dont les
 * paliers « + » restent jaunes — le + existe, il ne se voit pas (cf.
 * `lib/transcendence`). Le slider de la fiche perso y affichait donc
 *
 *     1 | 2 | 3 | 4 | 4 | 5 | 5 | 5 | 6        au lieu de
 *     1 | 2 | 3 | 4 | 4+| 5 | 5+| 5++| 6
 *
 * soit trois crans consécutifs nommés « 5 » sur les 34 personnages 1★ et 2★, sans
 * moyen de savoir lequel on venait de sélectionner. `stepLabel` lit la seule colonne
 * qui fasse foi, et sert aussi les libellés du tier-list-maker et de l'admin.
 */

/** « +X% Label » / « +X Label » / « Label +X% » / « Label +X » (X décimal possible). */
function parseNumericBonus(
  s: string,
): { kind: 'pct' | 'flat'; label: string; amount: number } | null {
  let m = s.match(/^\+(\d+(?:\.\d+)?)%\s+(.+)$/);
  if (m) return { kind: 'pct', amount: parseFloat(m[1]), label: m[2].trim() };
  m = s.match(/^\+(\d+(?:\.\d+)?)\s+(.+)$/);
  if (m) return { kind: 'flat', amount: parseFloat(m[1]), label: m[2].trim() };
  m = s.match(/^(.+?)\s*\+(\d+(?:\.\d+)?)%$/);
  if (m) return { kind: 'pct', amount: parseFloat(m[2]), label: m[1].trim() };
  m = s.match(/^(.+?)\s*\+(\d+(?:\.\d+)?)$/);
  if (m) return { kind: 'flat', amount: parseFloat(m[2]), label: m[1].trim() };
  return null;
}

/** Arrondi à 2 décimales sans zéros traînants (évite la dérive flottante). */
function fmtAmount(n: number): string {
  return parseFloat(n.toFixed(2)).toString();
}

/**
 * Lignes du passif unique CUMULÉES jusqu'au niveau N : la colonne `SkillLevel`
 * de la table de transcendance EST le niveau de ce passif, et chaque niveau
 * porte son texte OFFICIEL (`SE_DESC_SKILL08_*` de TextSkill — le delta du
 * palier : « +4% Ally Team Critical Damage », « Burst Level 3 Unlocked »…).
 * Inchangé : les bonus numériques de même libellé s'additionnent
 * (+4% puis +4% → « +8% »), les autres lignes s'empilent telles quelles.
 */
function passiveLines(unique: Skill | undefined, level: number, lang: Lang): string[] {
  if (!unique || level <= 0) return [];
  const bonus = new Map<string, { kind: 'pct' | 'flat'; label: string; amount: number }>();
  const others: string[] = [];
  for (const lv of unique.levels) {
    if (lv.level > level || !lv.desc) continue;
    const text = (lRec(lv.desc, lang) || lv.desc.en).replace(/\\n/g, '\n');
    for (const raw of text.split('\n')) {
      const line = raw.trim();
      if (!line) continue;
      const p = parseNumericBonus(line);
      if (p) {
        const label = p.label.replace(/\s+/g, ' ');
        const key = `${p.kind}|${label}`;
        const prev = bonus.get(key);
        bonus.set(key, { kind: p.kind, label, amount: (prev?.amount ?? 0) + p.amount });
      } else if (!others.includes(line)) {
        others.push(line);
      }
    }
  }
  return [
    ...[...bonus.values()].map(
      (b) => `+${fmtAmount(b.amount)}${b.kind === 'pct' ? '%' : ''} ${b.label}`,
    ),
    ...others,
  ];
}

function toTier(s: TranscendStep, unique: Skill | undefined, lang: Lang): TranscendTierView {
  return {
    label: stepLabel(s),
    star: s.showStar,
    color: s.starColor,
    stars: transcendStarRow(s.showStar, s.starColor),
    hpPct: s.hp / 10,
    atkPct: s.atk / 10,
    defPct: s.def / 10,
    passives: passiveLines(unique, s.skillLevel, lang),
  };
}

/** Paliers de transcendance d'un perso (overrides > barème de sa rareté). */
export function getTranscendTiers(char: Character, lang: Lang): TranscendTierView[] {
  const steps = TRANSCEND.overrides[char.id] ?? TRANSCEND.byStar[String(char.rarity)] ?? [];
  const unique = char.skills.map((id) => SKILLS[id]).find((s) => s?.type === 'unique_passive');
  return steps.map((s) => toTier(s, unique, lang));
}

/** Un « sweetspot » de transcendance : ce que le palier APPORTE (delta). */
export interface TranscendSweetspotView {
  /** Étoile UI du palier (4/5/6…, paliers jaunes uniquement). */
  star: number;
  /** Rangée de 6 étoiles (mêmes sprites que le slider de la fiche). */
  stars: string[];
  /** Lignes officielles GAGNÉES à ce palier (deltas du passif unique —
   *  « Burst Level 3 Unlocked », « +10% Ally Team Defense »…). */
  lines: string[];
}

/**
 * Deltas de transcendance aux étoiles JAUNES demandées — le format des guides
 * (« pourquoi s'arrêter à 4★ ? ») : ces textes étaient stockés par perso dans
 * ses JSON et les rechargeait côté client ; ici ils dérivent des paliers
 * officiels (mêmes sources que le slider de la fiche perso), stats exclues
 * (elles montent à CHAQUE palier — aucun intérêt de sweetspot).
 */
export function getTranscendSweetspots(
  char: Character,
  lang: Lang,
  stars: number[],
): TranscendSweetspotView[] {
  const steps = TRANSCEND.overrides[char.id] ?? TRANSCEND.byStar[String(char.rarity)] ?? [];
  const unique = char.skills.map((id) => SKILLS[id]).find((s) => s?.type === 'unique_passive');
  const out: TranscendSweetspotView[] = [];
  let prevSkillLevel = 0;
  for (const s of steps) {
    const wanted =
      s.starColor === 'yellow' && stars.includes(s.showStar) && s.skillLevel > prevSkillLevel;
    if (wanted) {
      const lines: string[] = [];
      for (const lv of unique?.levels ?? []) {
        if (lv.level <= prevSkillLevel || lv.level > s.skillLevel || !lv.desc) continue;
        const text = (lRec(lv.desc, lang) || lv.desc.en).replace(/\\n/g, '\n');
        for (const raw of text.split('\n')) {
          const line = raw.trim();
          if (line && !lines.includes(line)) lines.push(line);
        }
      }
      if (lines.length) out.push({ star: s.showStar, stars: toTier(s, unique, lang).stars, lines });
    }
    prevSkillLevel = Math.max(prevSkillLevel, s.skillLevel);
  }
  return out;
}

// --- Gifts ---------------------------------------------------------------------------

export interface GiftView {
  id: string;
  name: string;
  icon: string;
  grade: string;
  /** Description officielle (tooltip). */
  desc?: string;
}

function toItemView(id: string, it: Item, lang: Lang): GiftView {
  const desc = it.desc ? lRec(it.desc, lang) || it.desc.en : undefined;
  return {
    id,
    name: lRec(it.name, lang) || it.name.en,
    icon: it.icon,
    grade: it.grade,
    ...(desc ? { desc: desc.replace(/\\n/g, '\n') } : {}),
  };
}

/** Les cadeaux préférés du perso (items `present` de sa catégorie, par grade). */
export function getGiftItems(char: Character, lang: Lang): GiftView[] {
  if (!char.gift) return [];
  return Object.entries(ITEMS)
    .filter(
      ([, it]) =>
        it.type === 'present' &&
        it.subType === char.gift &&
        // Les presents DÉDIÉS (CharacterLimit) partagent le subType de leur
        // catégorie mais n'appartiennent qu'à leur perso (Veronica, Tio…).
        (!it.characterLimit || it.characterLimit === char.id),
    )
    .map(([id, it]) => toItemView(id, it, lang))
    .sort((a, b) => (GRADE_RANK[a.grade] ?? 0) - (GRADE_RANK[b.grade] ?? 0));
}

/** Item de rappel d'un limit break (icône + nom + desc localisés). */
export function getRecallItem(id: string, lang: Lang): GiftView | undefined {
  const it = ITEMS[id];
  return it ? toItemView(id, it, lang) : undefined;
}
