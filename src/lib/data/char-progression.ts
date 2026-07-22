/**
 * PROGRESSION d'un personnage — paliers de stats, transcendance, gifts.
 *
 * Les paliers de stats sont CALCULÉS depuis l'extraction (`progression.json`
 * + min/max de la fiche) avec les règles du client, validées contre l'oracle
 * V2 (`char-progression.test.ts`, perso 2000073) :
 *   - stats interpolées (ATK/DEF/HP/SPD/EFF/RES) :
 *     min + floor((max−min)·(L−1)/99) + Σ bonus d'évolution — référence
 *     niveau 100, EXTRAPOLÉE au-delà (limit breaks 105/110/120) ;
 *   - CHC/CHD : fixes (min ÷10, en %) ;
 *   - DMG UP%/RED% : uniquement les bonus d'évolution (per-mille ÷10) ;
 *   - premium (passif de classe BT_STAT_PREMIUM) : flat = valeur ÷10,
 *     rate = floor(stat du palier × valeur / 1000).
 */
import type {
  Character,
  Item,
  ProgressionData,
  Skill,
  StatBonus,
  TranscendData,
  TranscendStep,
} from '@contracts';
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { STAR_SPRITE } from '@/lib/images';
import { GRADE_RANK } from '@/lib/data/gear-order';
import {
  STEP_STAT_KEYS,
  PERCENT_STEP_KEYS,
  type LayerParts,
  type StatLayersView,
  type StatStepView,
  type StepStatKey,
} from '@/lib/stat-compose';
import progressionData from '@data/generated/progression.json';
import transcendData from '@data/generated/transcend.json';
import itemsData from '@data/generated/items.json';
import skillsData from '@data/generated/skills.json';

const PROGRESSION = progressionData as unknown as ProgressionData;
const TRANSCEND = transcendData as unknown as TranscendData;
const ITEMS = itemsData as unknown as Record<string, Item>;
const SKILLS = skillsData as unknown as Record<string, Skill>;

// Les briques PURES (clés, formule CalcFinalStat, composeStep) vivent dans
// `@/lib/stat-compose` — client-safe, sans données. Ré-exportées ici pour les
// consommateurs serveur.
export { STEP_STAT_KEYS, PERCENT_STEP_KEYS };
export type { StatStepView, StepStatKey, StatLayersView };

/** Slug de stat (fiche/évolutions) → clé d'affichage. */
const SLUG_TO_KEY: Record<string, StepStatKey> = {
  atk: 'ATK',
  def: 'DEF',
  hp: 'HP',
  speed: 'SPD',
  critical_rate: 'CHC',
  critical_dmg: 'CHD',
  critical_dmg_rate: 'CHD',
  buff_chance: 'EFF',
  buff_resist: 'RES',
  dmg_boost: 'DMG UP%',
  dmg_reduce_rate: 'DMG RED%',
  pierce_power_rate: 'PEN%',
  e_cri_dmg_reduce: 'CDMG RED%',
};

export interface StatStepsView {
  steps: StatStepView[];
  /** Stat qui reçoit le bonus premium (passif de classe). */
  premiumStat?: StepStatKey;
}

/** Paliers de stats d'un perso (lv1 + un par évolution, jusqu'au lv120). */
export function computeStatSteps(char: Character): StatStepsView {
  const rungs = PROGRESSION.evolutions[String(char.rarity)] ?? [];
  const rewards = PROGRESSION.evoRewards[char.id] ?? {};
  const premium = PROGRESSION.premium[char.id];
  const lb = PROGRESSION.limitBreak[`${char.rarity}_${char.element}`] ?? [];
  const premiumStat = premium ? SLUG_TO_KEY[premium.stat] : undefined;

  const points: { level: number; evo: number; evs: number[] }[] = [
    { level: 1, evo: 0, evs: [] },
    ...rungs.map((r, i) => ({
      level: r.level,
      evo: i + 1,
      evs: rungs.slice(0, i + 1).map((x) => x.ev),
    })),
  ];

  const steps = points.map(({ level, evo, evs }) => {
    const cum: Partial<Record<StepStatKey, number>> = {};
    for (const ev of evs)
      for (const [slug, v] of Object.entries(rewards[String(ev)] ?? {})) {
        const k = SLUG_TO_KEY[slug];
        if (k) cum[k] = (cum[k] ?? 0) + v;
      }
    // Au-delà du niveau 100, la croissance par niveau est AMPLIFIÉE par le
    // modificateur per-mille du limit break (LevelUpStatModifierAfter100) —
    // validé in-game par le gear-solver (la V2 l'omettait, écart assumé).
    const modifier = level > 100 ? (lb.find((s) => s.maxLevel === level)?.statModifier ?? 0) : 0;

    const stats = {} as Record<StepStatKey, number>;
    const base = {} as Record<StepStatKey, number>;
    for (const key of STEP_STAT_KEYS) {
      if (key === 'CHC' || key === 'CHD') {
        const slug = key === 'CHC' ? 'critical_rate' : 'critical_dmg';
        base[key] = (char.stats[slug]?.min ?? 0) / 10;
        stats[key] = base[key];
      } else if (key === 'DMG UP%' || key === 'DMG RED%' || key === 'PEN%' || key === 'CDMG RED%') {
        base[key] = 0;
        stats[key] = (cum[key] ?? 0) / 10;
      } else {
        const slug = Object.entries(SLUG_TO_KEY).find(([, k]) => k === key)![0];
        const r = char.stats[slug];
        const mn = r?.min ?? 0;
        const rng = (r?.max ?? 0) - mn;
        const growth = rng > 0 ? Math.floor((rng * (level - 1)) / 99) : 0;
        const above =
          rng > 0 && level > 100 ? Math.floor((rng * (level - 100) * modifier) / 99000) : 0;
        base[key] = mn + growth + above;
        stats[key] = base[key] + (cum[key] ?? 0);
      }
    }

    const step: StatStepView = { key: `lv${level}_ev${evo}`, level, evo, stats, base };
    if (premium && premiumStat) {
      step.premiumValue =
        premium.mode === 'flat'
          ? premium.value / 10
          : Math.floor((stats[premiumStat] * premium.value) / 1000);
    }
    const lbStep = lb.find((s) => s.maxLevel === level);
    if (lbStep)
      step.limitBreak = {
        pieces: lbStep.pieces,
        recallItemId: lbStep.recallItemId,
        price: lbStep.price,
      };
    return step;
  });

  return { steps, premiumStat };
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
 * sous-classe, niveau max) et premium (passif de classe).
 */
export function getStatLayers(char: Character): StatLayersView {
  const steps = TRANSCEND.overrides[char.id] ?? TRANSCEND.byStar[String(char.rarity)] ?? [];
  const uniqueId = char.skills.find((id) => SKILLS[id]?.type === 'unique_passive');
  const s8 = uniqueId ? PROGRESSION.skill8[uniqueId] : undefined;
  const transcend = steps.map((s) => {
    const parts: LayerParts = {};
    for (const b of s8?.[String(s.skillLevel)] ?? []) addBonus(parts, b);
    return {
      label: `${s.showStar}${COLOR_SUFFIX[s.starColor] ?? ''}`,
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

  const premiumInfo = PROGRESSION.premium[char.id];
  const premiumKey = premiumInfo ? SLUG_TO_KEY[premiumInfo.stat] : undefined;
  return {
    transcend,
    codex: PROGRESSION.codex.map((c) => ({ atkPM: c.atk, defPM: c.def, hpPM: c.hp })),
    quirks: { stat, buff },
    ...(premiumInfo && premiumKey
      ? { premium: { key: premiumKey, mode: premiumInfo.mode, value: premiumInfo.value } }
      : {}),
  };
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
  /** Rangée de 6 étoiles : sprites (jaunes + dernière colorée + grises). */
  stars: string[];
  /** Bonus cumulés (%) — hp/atk/def sont déjà des totaux dans la table. */
  hpPct: number;
  atkPct: number;
  defPct: number;
  /** Lignes du PASSIF UNIQUE cumulées à ce palier (« +8% Ally Team Critical Damage »). */
  passives: string[];
}

/** Suffixe du libellé selon la couleur déclarée (4 ORANGE → « 4+ »…). */
const COLOR_SUFFIX: Record<string, string> = { yellow: '', orange: '+', red: '+', violet: '++' };

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
 * Comme la V2 : les bonus numériques de même libellé s'additionnent
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
  const stars = Array.from({ length: 6 }, (_, i) => {
    if (i >= s.showStar) return STAR_SPRITE.gray;
    if (i === s.showStar - 1) return STAR_SPRITE[s.starColor] ?? STAR_SPRITE.yellow;
    return STAR_SPRITE.yellow;
  });
  return {
    label: `${s.showStar}${COLOR_SUFFIX[s.starColor] ?? ''}`,
    stars,
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
 * (« pourquoi s'arrêter à 4★ ? ») : la V2 stockait ces textes par perso dans
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
