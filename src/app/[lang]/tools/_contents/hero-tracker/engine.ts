import type {
  EnchantRow,
  FusionLevelStep,
  GiftItem,
  SkillUpgradeRow,
  XpFoodItem,
} from '@datagen/generators/hero-growth';

/**
 * Moteur du suivi de compte (`hero-tracker`) : ÉTAT actuel d'un héros + CIBLE →
 * ce qu'il reste à farmer.
 *
 * PUR et sans import de donnée : toutes les tables arrivent en paramètre
 * (`GrowthRules`), donc chaque règle se teste en synthétique et le jour où le
 * jeu rééquilibre un barème, seul le datagen bouge.
 *
 * Le rôle de ce module s'arrête au COMPTAGE. Il ne décide pas de l'affichage :
 * il rend des quantités d'items réels (id → nombre), du gold, et les trois
 * monnaies qui ne SONT pas des items — l'XP, les points d'affinité et les pièces
 * du héros — que `foodBreakdown`/`giftBreakdown` convertissent à la demande.
 */

/**
 * Les axes suivis. Même forme pour l'état et pour la cible.
 *
 * Un héros Core Fusion ne remplit pas `skills` (ses skills montent SOLIDAIREMENT
 * via `fusion`) et un héros de base ne remplit pas `fusion` : c'est le barème
 * passé dans `TrackedHero` qui tranche, pas la saisie.
 */
export interface HeroProgress {
  /** Niveau du héros, 5 (recrutement) → `xpCurve.length` (120). */
  level: number;
  /** Niveau de chaque skill : S1 / S2 / S3 / chain passive, 1 → 5. */
  skills: number[];
  /** Palier de Core Fusion : 0 = pas encore fusionné, 1 → 5 ensuite. */
  fusion: number;
  /** Niveau d'affinité, 1 → `affinityCurve.length` (100). */
  affinity: number;
  /** Index d'étape de transcendance dans l'échelle du héros (0 = étape de départ). */
  transcend: number;
  /** Enchantement de CHAQUE équipement exclusif porté, 0 → 10 (un fusionné en a deux). */
  ee: number[];
}

/** Ce qu'il faut connaître d'un héros pour chiffrer sa progression. */
export interface TrackedHero {
  id: string;
  /** Rareté de BASE (1/2/3) : clé des barèmes de skill et de limit break. */
  rarity: number;
  /** Élément : le limit break se paie en mémoire de SON élément. */
  element: string;
  /**
   * Paliers de Core Fusion si ce héros EST un fusionné. Sa présence bascule le
   * calcul des skills : plus de manuels par slot, un seul barème solidaire.
   */
  fusionLevels?: FusionLevelStep[];
}

/** Un palier de transcendance, réduit à ce que le coût demande. */
export interface TranscendCost {
  /** Pièces du héros lui-même (non agrégeables entre héros) — ou UN doublon. */
  materials: number;
  price: number;
}

/** Un palier de limit break (100→105→110→120) et sa mémoire d'élément. */
export interface LimitBreakCost {
  /** Niveau exigé pour ouvrir le palier — le plafond dont on vient. */
  fromLevel: number;
  maxLevel: number;
  pieces: number;
  recallItemId: string;
  price: number;
}

export interface GrowthRules {
  /** XP CUMULÉ par niveau (index = niveau − 1). */
  xpCurve: number[];
  /** Points d'affinité CUMULÉS par niveau (index = niveau − 1). */
  affinityCurve: number[];
  gifts: GiftItem[];
  xpFood: XpFoodItem[];
  /** Barème d'amélioration de skill par rareté de base. */
  skillUpgrade: Record<string, SkillUpgradeRow[]>;
  /** Paliers de limit break par `${rarité}_${élément}` (clé de progression.json). */
  limitBreak: Record<string, LimitBreakCost[]>;
  /** Paliers d'enchantement d'un équipement exclusif. */
  eeEnchant: EnchantRow[];
  /** Échelle de transcendance du héros (ses paliers propres ou ceux de sa rareté). */
  transcendLadder: (hero: TrackedHero) => TranscendCost[];
}

/**
 * Les axes qui produisent de VRAIS items — la ventilation de la liste de
 * courses. L'affinité et la transcendance n'en font pas partie : elles se
 * paient en points et en pièces, converties (ou non) ailleurs.
 */
export const NEED_AXES = ['level', 'skills', 'ee'] as const;
export type NeedAxis = (typeof NEED_AXES)[number];

const emptyByAxis = (): Record<NeedAxis, Record<string, number>> => ({
  level: {},
  skills: {},
  ee: {},
});

/** Ce qu'il reste à obtenir pour UN héros. */
export interface HeroNeed {
  heroId: string;
  /** XP de héros manquant (à convertir en plats). */
  xp: number;
  /** Points d'affinité manquants (à convertir en cadeaux). */
  affinityPoints: number;
  gold: number;
  /** Items réels : id → quantité (manuels, mémoires, matériaux EE, cores de fusion). */
  items: Record<string, number>;
  /** Les mêmes items, ventilés par axe — de quoi filtrer la liste de courses. */
  itemsByAxis: Record<NeedAxis, Record<string, number>>;
  /** Pièces du héros pour la transcendance — propres à LUI, jamais agrégées. */
  pieces: number;
  /**
   * Étapes de transcendance restantes. Chacune se paie en pièces OU en UN
   * doublon : sans ce compte, l'écran ne pourrait pas proposer l'alternative.
   */
  transcendSteps: number;
}

const clamp = (v: number, min: number, max: number): number => Math.min(Math.max(v, min), max);

function addItem(into: Record<string, number>, id: string, count: number): void {
  if (count > 0) into[id] = (into[id] ?? 0) + count;
}

/**
 * Coût restant d'UN héros. Une cible en deçà de l'état ne rend jamais un coût
 * NÉGATIF (un compte qui dépasse sa cible n'a rien à farmer, il n'a pas une
 * dette) : chaque axe est borné à zéro.
 */
export function heroNeed(
  hero: TrackedHero,
  state: HeroProgress,
  target: HeroProgress,
  rules: GrowthRules,
): HeroNeed {
  const need: HeroNeed = {
    heroId: hero.id,
    xp: 0,
    affinityPoints: 0,
    gold: 0,
    items: {},
    itemsByAxis: emptyByAxis(),
    pieces: 0,
    transcendSteps: 0,
  };
  /** Un item compte deux fois : au total, et dans l'axe qui l'a demandé. */
  const want = (axis: NeedAxis, id: string, count: number): void => {
    addItem(need.items, id, count);
    addItem(need.itemsByAxis[axis], id, count);
  };

  // ── Niveau : différence de deux CUMULS, plus les paliers de limit break
  // franchis (un palier compte dès que la cible l'atteint, pas avant).
  const maxLevel = rules.xpCurve.length;
  const fromLevel = clamp(state.level, 1, maxLevel);
  const toLevel = clamp(target.level, 1, maxLevel);
  if (toLevel > fromLevel) {
    need.xp = rules.xpCurve[toLevel - 1] - rules.xpCurve[fromLevel - 1];
    for (const step of rules.limitBreak[`${hero.rarity}_${hero.element}`] ?? []) {
      if (step.maxLevel > fromLevel && step.maxLevel <= toLevel) {
        want('level', step.recallItemId, step.pieces);
        need.gold += step.price;
      }
    }
  }

  // ── Skills. Deux régimes exclusifs :
  //   • Core Fusion — un seul palier commun, payé en Fusion-Type Core (le
  //     palier 1 EST le déblocage de la fusion) ;
  //   • héros de base — quatre slots (S1/S2/S3/chain passive) qui montent
  //     séparément aux manuels. Le barème ne dépend QUE de la rareté et du
  //     niveau visé (aucune colonne de slot dans la table du jeu).
  if (hero.fusionLevels) {
    for (const step of hero.fusionLevels) {
      if (step.level > state.fusion && step.level <= target.fusion) {
        want('skills', step.cost.item.id, step.cost.count);
      }
    }
  } else {
    const ladder = rules.skillUpgrade[String(hero.rarity)] ?? [];
    const slots = Math.max(state.skills.length, target.skills.length);
    for (let i = 0; i < slots; i++) {
      const from = state.skills[i] ?? 1;
      const to = target.skills[i] ?? 1;
      for (const row of ladder) {
        if (row.level > from && row.level <= to) {
          for (const m of row.manuals) want('skills', m.item.id, m.count);
          need.gold += row.gold;
        }
      }
    }
  }

  // ── Affinité : même logique de cumul que le niveau.
  const maxAffinity = rules.affinityCurve.length;
  const fromAff = clamp(state.affinity, 1, maxAffinity);
  const toAff = clamp(target.affinity, 1, maxAffinity);
  if (toAff > fromAff) {
    need.affinityPoints = rules.affinityCurve[toAff - 1] - rules.affinityCurve[fromAff - 1];
  }

  // ── Transcendance : paliers franchis de l'échelle PROPRE au héros. Les pièces
  // restent à part — celles de Lambda ne montent pas Rhona.
  const steps = rules.transcendLadder(hero);
  for (let i = state.transcend + 1; i <= Math.min(target.transcend, steps.length - 1); i++) {
    const step = steps[i];
    if (!step) continue;
    need.pieces += step.materials;
    need.gold += step.price;
    need.transcendSteps += 1;
  }

  // ── Équipements exclusifs : paliers d'enchantement franchis, POUR CHACUN (un
  // héros fusionné garde l'EE de sa base et en débloque un second au niveau 0).
  const eeCount = Math.max(state.ee.length, target.ee.length);
  for (let i = 0; i < eeCount; i++) {
    const from = state.ee[i] ?? 0;
    const to = target.ee[i] ?? 0;
    for (const row of rules.eeEnchant) {
      if (row.level > from && row.level <= to) {
        for (const m of row.materials) want('ee', m.item.id, m.count);
        need.gold += row.gold;
      }
    }
  }

  return need;
}

/** Total du compte : les items s'additionnent, les pièces restent par héros. */
export interface AccountNeed {
  xp: number;
  affinityPoints: number;
  gold: number;
  items: Record<string, number>;
  itemsByAxis: Record<NeedAxis, Record<string, number>>;
  /** heroId → { pièces, étapes }, seulement pour les héros qui en demandent. */
  pieces: Record<string, { pieces: number; steps: number }>;
  /** Héros dont il reste quelque chose à faire. */
  heroes: HeroNeed[];
}

export function accountNeed(needs: HeroNeed[]): AccountNeed {
  const total: AccountNeed = {
    xp: 0,
    affinityPoints: 0,
    gold: 0,
    items: {},
    itemsByAxis: emptyByAxis(),
    pieces: {},
    heroes: [],
  };
  for (const n of needs) {
    if (!hasWork(n)) continue;
    total.xp += n.xp;
    total.affinityPoints += n.affinityPoints;
    total.gold += n.gold;
    for (const [id, count] of Object.entries(n.items)) addItem(total.items, id, count);
    for (const axis of NEED_AXES)
      for (const [id, count] of Object.entries(n.itemsByAxis[axis]))
        addItem(total.itemsByAxis[axis], id, count);
    if (n.pieces > 0) total.pieces[n.heroId] = { pieces: n.pieces, steps: n.transcendSteps };
    total.heroes.push(n);
  }
  return total;
}

/** Vrai si ce héros demande encore quoi que ce soit. */
export function hasWork(n: HeroNeed): boolean {
  return (
    n.xp > 0 ||
    n.affinityPoints > 0 ||
    n.gold > 0 ||
    n.pieces > 0 ||
    Object.keys(n.items).length > 0
  );
}

/** Une quantité d'un item de conversion (plat d'XP ou cadeau). */
export interface Breakdown<T> {
  entry: T;
  count: number;
}

/**
 * Décompose une quantité en items, du plus gros au plus petit — c'est ainsi
 * qu'on nourrit un héros : on vide les gros plats d'abord, le reste comble.
 * Le DERNIER palier est arrondi au SUPÉRIEUR : il faut bien un plat entier
 * pour couvrir les 40 XP qui manquent.
 */
function greedy<T extends { id: string }>(
  amount: number,
  units: { entry: T; value: number }[],
): Breakdown<T>[] {
  const sorted = [...units].filter((u) => u.value > 0).sort((a, b) => b.value - a.value);
  const out: Breakdown<T>[] = [];
  let rest = amount;
  for (let i = 0; i < sorted.length && rest > 0; i++) {
    const { entry, value } = sorted[i];
    const last = i === sorted.length - 1;
    const count = last ? Math.ceil(rest / value) : Math.floor(rest / value);
    if (count > 0) {
      out.push({ entry, count });
      rest -= count * value;
    }
  }
  return out;
}

/** XP manquant → plats, du plus nourrissant au plus petit. */
export function foodBreakdown(xp: number, xpFood: XpFoodItem[]): Breakdown<XpFoodItem>[] {
  return greedy(
    xp,
    xpFood.map((f) => ({ entry: f, value: f.xp })),
  );
}

/**
 * Additionne des décompositions faites HÉROS PAR HÉROS.
 *
 * Décomposer le total du compte donnerait un chiffre plus flatteur mais FAUX :
 * un plat ne se coupe pas en deux, le reste de chaque héros s'arrondit chez lui.
 * On convertit donc par héros (règle Sevih) et on ne totalise qu'après.
 */
export function mergeBreakdowns<T extends { id: string }>(parts: Breakdown<T>[][]): Breakdown<T>[] {
  const byId = new Map<string, Breakdown<T>>();
  for (const part of parts) {
    for (const b of part) {
      const hit = byId.get(b.entry.id);
      if (hit) hit.count += b.count;
      else byId.set(b.entry.id, { entry: b.entry, count: b.count });
    }
  }
  return [...byId.values()];
}

/**
 * Points d'affinité manquants → cadeaux d'UN type donné (un héros n'en préfère
 * qu'un). `preferredBonus` applique le bonus du cadeau préféré (+50 % dans le
 * jeu) : sans lui le compte rendu est un MAJORANT, ce que l'UI doit dire.
 */
export function giftBreakdown(
  points: number,
  gifts: GiftItem[],
  presentType?: string,
  preferredBonus = 0,
): Breakdown<GiftItem>[] {
  const pool = presentType ? gifts.filter((g) => g.presentType === presentType) : gifts;
  // Un seul item par palier de points : cinq types partagent le même barème,
  // les empiler donnerait cinq fois « 1 cadeau à 1000 » pour un seul besoin.
  const byPoints = new Map<number, GiftItem>();
  for (const g of pool) if (!byPoints.has(g.points)) byPoints.set(g.points, g);
  // Le bonus ne s'applique QU'AU type préféré : sans type choisi, il ne veut
  // rien dire et on retombe sur le taux de base.
  const rate = presentType ? 1 + preferredBonus : 1;
  return greedy(
    points,
    [...byPoints.values()].map((g) => ({ entry: g, value: Math.round(g.points * rate) })),
  );
}
