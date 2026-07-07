/**
 * COMPOSITION DES STATS — formule `CFormula::CalcFinalStat` du client
 * (reverse-engineered depuis libil2cpp.so 1.4.9, RVA 0x2C59E48 ; validée
 * 0-diff in-game par le gear-solver). Module PUR, sans import de données :
 * il est consommé côté client (contrôles quirks / codex / transcendance de la
 * section Stats) — les couches sont résolues côté serveur
 * (`char-progression.getStatLayers`).
 *
 * Formule (taux en per-mille, plats en entiers, trunc = division ARM64) :
 *   sum_flat = base + évo + quirksStat
 *   sum_rate = quirksStatRate + transcendRate
 *   part1    = trunc(sum_flat × (1000 + sum_rate) / 1000)
 *   combined = part1 + buffFlat            (quirks IOT_BUFF, Skill_8, premium)
 *   part2    = trunc(combined × (1000 + buffRate) / 1000)
 *   codex    = trunc(base × codexRate / 1000)
 *   final    = max(0, part2 + codex)
 */

/** Stats affichées, dans l'ordre du jeu/V2 (clé = abréviation canonique).
 * PEN / Crit DMG Reduc : base 0, nourries par les couches (transcendance,
 * quirks) — comme la fiche in-game. */
export const STEP_STAT_KEYS = [
  'ATK',
  'DEF',
  'HP',
  'SPD',
  'CHC',
  'CHD',
  'PEN%',
  'DMG UP%',
  'DMG RED%',
  'CDMG RED%',
  'EFF',
  'RES',
] as const;
export type StepStatKey = (typeof STEP_STAT_KEYS)[number];

/** Les clés affichées en pourcentage. */
export const PERCENT_STEP_KEYS = new Set<StepStatKey>([
  'CHC',
  'CHD',
  'PEN%',
  'DMG UP%',
  'DMG RED%',
  'CDMG RED%',
]);

export interface StatStepView {
  /** `lv{niveau}_ev{évolutions appliquées}`. */
  key: string;
  level: number;
  evo: number;
  /** Portion « blanche » (base interpolée + évolutions), unités d'affichage. */
  stats: Record<StepStatKey, number>;
  /** Base interpolée SEULE (le codex ne s'applique qu'à elle). */
  base: Record<StepStatKey, number>;
  /** Bonus premium appliqué à `premiumStat` sur ce palier (affichage legacy). */
  premiumValue?: number;
  /** Coût du limit break DÉBLOQUANT ce palier (si c'en est un). */
  limitBreak?: { pieces: number; recallItemId: string; price: number };
}

/** Une couche de bonus, en unités prêtes à composer. */
export interface LayerParts {
  /** Plats en unités d'AFFICHAGE (entiers pour ATK/DEF/HP/SPD/EFF/RES, % pour CHC…). */
  flat?: Partial<Record<StepStatKey, number>>;
  /** Taux per-mille (axes compound + SPD, baké sur base+évo). */
  ratePM?: Partial<Record<StepStatKey, number>>;
}

export interface TranscendLayer {
  /** Libellé du palier (« 4+ », « 6 »…). */
  label: string;
  /** Bonus per-mille ATK/DEF/HP (couche sum_rate). */
  atkPM: number;
  defPM: number;
  hpPM: number;
  /** Buffs premium du passif de transcendance à ce palier (couche BuffValueRate). */
  skill8?: LayerParts;
}

/** Couches optionnelles de la fiche, résolues côté serveur. */
export interface StatLayersView {
  transcend: TranscendLayer[];
  /** Index = niveau de codex (0 = rien), per-mille sur la base. */
  codex: { atkPM: number; defPM: number; hpPM: number }[];
  /** Quirks au niveau max — couche stat (blanche) et couche buff (jaune). */
  quirks?: { stat: LayerParts; buff: LayerParts };
  /** Passif de classe (premium) — intégré à la couche buff. */
  premium?: { key: StepStatKey; mode: 'flat' | 'rate'; value: number };
}

export interface ComposeSelection {
  /** Index dans `layers.transcend` (-1 = aucun). */
  tierIdx: number;
  /** Niveau de codex (0 = aucun). */
  codexLevel: number;
  quirksOn: boolean;
}

/** `CalcFinalStat` du client — trunc, PAS floor (divergence sur négatifs). */
export function calcFinalStat(
  base: number,
  evo: number,
  awakFlat: number,
  awakPM: number,
  transcendPM: number,
  codexPM: number,
  buffFlat: number,
  buffPM: number,
): number {
  const part1 = Math.trunc(((base + evo + awakFlat) * (1000 + awakPM + transcendPM)) / 1000);
  const part2 = Math.trunc(((part1 + buffFlat) * (1000 + buffPM)) / 1000);
  const codex = Math.trunc((base * codexPM) / 1000);
  return Math.max(0, part2 + codex);
}

const flatOf = (p: LayerParts | undefined, k: StepStatKey) => p?.flat?.[k] ?? 0;
const rateOf = (p: LayerParts | undefined, k: StepStatKey) => p?.ratePM?.[k] ?? 0;

/**
 * Stats affichées d'un palier avec les couches actives : valeur finale +
 * delta vs la portion BLANCHE (rendu « 1503 (+312) » comme la fiche in-game).
 * La portion blanche inclut la couche STAT des quirks (IOT_STAT — le jeu
 * l'affiche en blanc) : seuls transcendance/codex/buffs vont dans le delta.
 */
export function composeStep(
  step: StatStepView,
  layers: StatLayersView,
  sel: ComposeSelection,
): Record<StepStatKey, { value: number; delta: number }> {
  const tier = sel.tierIdx >= 0 ? layers.transcend[sel.tierIdx] : undefined;
  const codex = layers.codex[Math.max(0, Math.min(sel.codexLevel, layers.codex.length - 1))];
  const qStat = sel.quirksOn ? layers.quirks?.stat : undefined;
  const qBuff = sel.quirksOn ? layers.quirks?.buff : undefined;
  const s8 = tier?.skill8;
  const premium = layers.premium;

  const out = {} as Record<StepStatKey, { value: number; delta: number }>;
  for (const key of STEP_STAT_KEYS) {
    const white = step.stats[key];
    const base = step.base[key];
    const evo = white - base;
    let buffFlat = flatOf(qBuff, key) + flatOf(s8, key);
    let buffPM = rateOf(qBuff, key) + rateOf(s8, key);
    if (premium?.key === key) {
      if (premium.mode === 'flat') buffFlat += premium.value / 10;
      else buffPM += premium.value;
    }

    let value: number;
    let whiteRef: number; // même calcul, couches transcend/codex/buff à zéro
    if (key === 'ATK' || key === 'DEF' || key === 'HP') {
      const transPM =
        key === 'ATK' ? (tier?.atkPM ?? 0) : key === 'DEF' ? (tier?.defPM ?? 0) : (tier?.hpPM ?? 0);
      const codexPM = key === 'ATK' ? codex.atkPM : key === 'DEF' ? codex.defPM : codex.hpPM;
      value = calcFinalStat(
        base,
        evo,
        flatOf(qStat, key),
        rateOf(qStat, key),
        transPM,
        codexPM,
        buffFlat,
        buffPM,
      );
      whiteRef = calcFinalStat(base, evo, flatOf(qStat, key), rateOf(qStat, key), 0, 0, 0, 0);
    } else if (key === 'EFF' || key === 'RES') {
      value = calcFinalStat(
        base,
        evo,
        flatOf(qStat, key),
        rateOf(qStat, key),
        0,
        0,
        buffFlat,
        buffPM,
      );
      whiteRef = calcFinalStat(base, evo, flatOf(qStat, key), rateOf(qStat, key), 0, 0, 0, 0);
    } else if (key === 'SPD') {
      // Les rares taux de SPD sont bakés sur base+évo (baseline constante).
      const baked = Math.floor(
        ((white + flatOf(qStat, key)) * (rateOf(qStat, key) + buffPM)) / 1000,
      );
      value = Math.floor(white + flatOf(qStat, key) + buffFlat + baked);
      whiteRef = Math.floor(
        white +
          flatOf(qStat, key) +
          Math.floor(((white + flatOf(qStat, key)) * rateOf(qStat, key)) / 1000),
      );
    } else {
      // CHC / CHD / DMG UP% / DMG RED% — purement additifs (unités %) ; un
      // éventuel taux (premium `rate`) s'applique sur la portion blanche.
      value = white + flatOf(qStat, key) + buffFlat + Math.floor((white * buffPM) / 1000);
      whiteRef = white + flatOf(qStat, key);
    }
    out[key] = { value, delta: value - whiteRef };
  }
  return out;
}
