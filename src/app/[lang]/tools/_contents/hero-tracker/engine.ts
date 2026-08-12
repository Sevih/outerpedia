import type {
  EnchantRow,
  GiftItem,
  SkillUpgradeRow,
  XpFoodItem,
} from '@datagen/generators/hero-growth';

/**
 * Moteur du suivi de compte (`/tools/hero-tracker`) : ÉTAT actuel d'un héros +
 * CIBLE → ce qu'il reste à farmer.
 *
 * PUR et sans import de donnée : toutes les tables arrivent en paramètre
 * (`GrowthRules`), donc chaque règle se teste en synthétique et le jour où le
 * jeu rééquilibre un barème, seul le datagen bouge.
 *
 * Le rôle de ce module s'arrête au COMPTAGE. Il ne décide pas de l'affichage :
 * il rend des quantités d'items réels (id → nombre), du gold, et les deux
 * monnaies qui ne SONT pas des items — l'XP et les points d'affinité — que
 * `foodBreakdown`/`giftBreakdown` convertissent en items à la demande.
 */

/** Les cinq axes suivis. Même forme pour l'état et pour la cible. */
export interface HeroProgress {
  /** Niveau du héros, 1 → `xpCurve.length` (120). */
  level: number;
  /** Niveau de chaque skill améliorable (3 slots : first/second/ultimate), 1 → 5. */
  skills: number[];
  /** Niveau d'affinité, 1 → `affinityCurve.length` (100). */
  affinity: number;
  /** Index d'étape de transcendance dans l'échelle du héros (0 = étape de départ). */
  transcend: number;
  /** Niveau d'enchantement de l'équipement exclusif, 0 → 10 (0 = pas d'EE). */
  ee: number;
}

/** Ce qu'il faut connaître d'un héros pour chiffrer sa progression. */
export interface TrackedHero {
  id: string;
  /** Rareté de BASE (1/2/3) : clé des barèmes de skill et de limit break. */
  rarity: number;
  /** Élément : le limit break consomme une mémoire PAR élément. */
  element: string;
}

/** Un palier de transcendance, réduit à ce que le coût demande. */
export interface TranscendCost {
  /** Fragments du héros lui-même (non agrégeables entre héros). */
  materials: number;
  price: number;
}

/** Un palier de limit break (100→105→110→120) et sa mémoire d'élément. */
export interface LimitBreakCost {
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
  /** Paliers d'enchantement de l'équipement exclusif. */
  eeEnchant: EnchantRow[];
  /** Échelle de transcendance du héros (ses paliers propres ou ceux de sa rareté). */
  transcendLadder: (hero: TrackedHero) => TranscendCost[];
}

/** Ce qu'il reste à obtenir pour UN héros. */
export interface HeroNeed {
  heroId: string;
  /** XP de héros manquant (à convertir en plats). */
  xp: number;
  /** Points d'affinité manquants (à convertir en cadeaux). */
  affinityPoints: number;
  gold: number;
  /** Items réels : id → quantité (manuels, mémoires de limit break, matériaux EE). */
  items: Record<string, number>;
  /** Fragments du héros pour la transcendance — propres à LUI, jamais agrégés. */
  fragments: number;
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
    fragments: 0,
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
        addItem(need.items, step.recallItemId, step.pieces);
        need.gold += step.price;
      }
    }
  }

  // ── Skills : le barème ne dépend QUE de la rareté et du niveau visé (aucune
  // colonne de slot dans la table du jeu), donc le même coût vaut pour chacun.
  const ladder = rules.skillUpgrade[String(hero.rarity)] ?? [];
  const slots = Math.max(state.skills.length, target.skills.length);
  for (let i = 0; i < slots; i++) {
    const from = state.skills[i] ?? 1;
    const to = target.skills[i] ?? 1;
    for (const row of ladder) {
      if (row.level > from && row.level <= to) {
        for (const m of row.manuals) addItem(need.items, m.item.id, m.count);
        need.gold += row.gold;
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

  // ── Transcendance : paliers franchis de l'échelle PROPRE au héros. Les
  // fragments restent à part — ceux de Lambda ne montent pas Rhona.
  const steps = rules.transcendLadder(hero);
  for (let i = state.transcend + 1; i <= Math.min(target.transcend, steps.length - 1); i++) {
    const step = steps[i];
    if (!step) continue;
    need.fragments += step.materials;
    need.gold += step.price;
  }

  // ── Équipement exclusif : paliers d'enchantement franchis.
  for (const row of rules.eeEnchant) {
    if (row.level > state.ee && row.level <= target.ee) {
      for (const m of row.materials) addItem(need.items, m.item.id, m.count);
      need.gold += row.gold;
    }
  }

  return need;
}

/** Total du compte : les items s'additionnent, les fragments restent par héros. */
export interface AccountNeed {
  xp: number;
  affinityPoints: number;
  gold: number;
  items: Record<string, number>;
  /** heroId → fragments, seulement pour les héros qui en demandent. */
  fragments: Record<string, number>;
  /** Héros dont il reste quelque chose à faire. */
  heroes: HeroNeed[];
}

export function accountNeed(needs: HeroNeed[]): AccountNeed {
  const total: AccountNeed = {
    xp: 0,
    affinityPoints: 0,
    gold: 0,
    items: {},
    fragments: {},
    heroes: [],
  };
  for (const n of needs) {
    if (!hasWork(n)) continue;
    total.xp += n.xp;
    total.affinityPoints += n.affinityPoints;
    total.gold += n.gold;
    for (const [id, count] of Object.entries(n.items)) addItem(total.items, id, count);
    if (n.fragments > 0) total.fragments[n.heroId] = n.fragments;
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
    n.fragments > 0 ||
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
 * Points d'affinité manquants → cadeaux d'UN type donné (un héros n'en préfère
 * qu'un). Le bonus « cadeau préféré » n'est chiffré nulle part dans le jeu : le
 * compte rendu est donc un MAJORANT, ce que l'UI doit dire.
 */
export function giftBreakdown(
  points: number,
  gifts: GiftItem[],
  presentType?: string,
): Breakdown<GiftItem>[] {
  const pool = presentType ? gifts.filter((g) => g.presentType === presentType) : gifts;
  // Un seul item par palier de points : cinq types partagent le même barème,
  // les empiler donnerait cinq fois « 1 cadeau à 1000 » pour un seul besoin.
  const byPoints = new Map<number, GiftItem>();
  for (const g of pool) if (!byPoints.has(g.points)) byPoints.set(g.points, g);
  return greedy(
    points,
    [...byPoints.values()].map((g) => ({ entry: g, value: g.points })),
  );
}
