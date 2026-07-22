/**
 * Progress tracker — DÉFINITIONS des tâches (portage V2 `taskDefinitions.ts`,
 * données à l'identique). Trois cycles (daily / weekly / monthly), trois
 * catégories : `task` (contenu du jeu), `shop` (achats boutique) et `craft`
 * (atelier de Kate).
 *
 * La catégorie `recurring` (cycle « N jours après complétion ») a été RETIRÉE
 * le 22/07 avec son unique entrée, le couloir infini — contenu mort côté jeu.
 * Le moteur associé (`resetIntervalDays`, section dédiée, compte à rebours)
 * partait avec : il ne servait plus rien. À ressusciter depuis git si le jeu
 * réintroduit un contenu à cycle propre.
 *
 * Libellé d'une tâche : les entrées AVEC `shopItemKey` sont libellées par
 * l'item du catalogue (résolu côté serveur, nom localisé + sprite) ; les
 * autres par la clé i18n `progress.task.<id>`. La V2 stockait un `labelKey`
 * par entrée — même règle, dérivée ici.
 */

export type TaskType = 'daily' | 'weekly' | 'monthly';
export type TaskCategory = 'task' | 'craft' | 'shop';

/**
 * Contenu SAISONNIER : ouvert par fenêtres, pas en permanence. Ces ids sont
 * exactement les `ContentMode` du calendrier de contenu — c'est ce qui permet
 * de les activer tout seuls quand la saison tourne (réglage « auto »,
 * cf. `activeTaskIds`). Un renommage ici doit suivre `ContentMode`.
 */
export const SEASONAL_TASK_IDS = ['joint-challenge', 'guild-raid', 'world-boss'] as const;
export type SeasonalTaskId = (typeof SEASONAL_TASK_IDS)[number];
const SEASONAL = new Set<string>(SEASONAL_TASK_IDS);
export const isSeasonalTask = (id: string): boolean => SEASONAL.has(id);

export interface TaskDefinition {
  id: string;
  type: TaskType;
  category: TaskCategory;
  /** Nombre d'exécutions par cycle — BASE, modulée par les réglages (packs). */
  maxCount: number;
  /** Contenu permanent (activé d'office) vs événementiel (opt-in). */
  permanent: boolean;
  /** Sprite d'item AFFICHÉ devant l'entrée (boutiques à monnaie dédiée). */
  icon?: string;
  /** Déblocage par phases selon le jour du mois (tour céleste very hard). */
  hasProgressiveUnlock?: boolean;
  /** Clés i18n de la hiérarchie boutique (catégorie > sous-cat > onglet). */
  shopCategory?: string;
  shopSubcategory?: string;
  shopTab?: string;
  /** Nom EN de l'item acheté/fabriqué — résolu dans le catalogue serveur. */
  shopItemKey?: string;
  shopItemQuantity?: number;
}

/** Entrée déclarée sans `id` (clé du record) ni `type` (record d'origine). */
type TaskSeed = Omit<TaskDefinition, 'id' | 'type'>;

function stamp(type: TaskType, seeds: Record<string, TaskSeed>): Record<string, TaskDefinition> {
  return Object.fromEntries(Object.entries(seeds).map(([id, seed]) => [id, { id, type, ...seed }]));
}

export const DAILY_TASK_DEFINITIONS: Record<string, TaskDefinition> = stamp('daily', {
  // Contenu permanent
  'free-recruit-custom': { category: 'task', permanent: true, maxCount: 1 },
  'free-recruit-demiurge': { category: 'task', permanent: true, maxCount: 1 },
  'guild-security-area': { category: 'task', permanent: true, maxCount: 1 },
  // Contenu événementiel (opt-in)
  'joint-challenge': { category: 'task', permanent: false, maxCount: 2 },
  'guild-raid': { category: 'task', permanent: false, maxCount: 2 },
  'world-boss': { category: 'task', permanent: false, maxCount: 1 },
  // 1 → 2 avec le pack de soutien Terminus (réglage)
  'terminus-isle': { category: 'task', permanent: true, maxCount: 1 },
  // 3 → 4 avec le pack premium Veronica (réglage)
  'hypnotic-frog-hall': { category: 'task', permanent: true, maxCount: 3 },
  'ark-raid': { category: 'task', permanent: true, maxCount: 3 },
  'defeat-doppelganger': { category: 'task', permanent: true, maxCount: 10 },
  'special-request-ecology': { category: 'task', permanent: true, maxCount: 6 },
  'special-request-identification': { category: 'task', permanent: true, maxCount: 6 },
  'memorial-match': { category: 'task', permanent: true, maxCount: 5 },
  'story-hard': { category: 'task', permanent: true, maxCount: 30 },
  // Masquée par le réglage « tour élémentaire terminée »
  'elemental-tower': { category: 'task', permanent: true, maxCount: 5 },
  // 10 pubs × 18 stamina = 180 stamina/jour
  'ad-stamina': { category: 'task', permanent: true, maxCount: 10 },
  // 2 entrées/jour, ouvert mercredi → samedi seulement (filtré à la synchro)
  'dimensional-singularity': { category: 'task', permanent: true, maxCount: 2 },
  // Premium Shop > Normal > Daily/Weekly/Monthly
  'shop-daily-free-gift': {
    category: 'shop',
    permanent: true,
    maxCount: 1,
    shopCategory: 'progress.shop.premium-shop',
    shopSubcategory: 'progress.shop.normal',
    shopTab: 'progress.shop.daily-weekly-monthly',
  },
  // Adventurer Shop > Event Shop > Joint Challenge
  'shop-event-jc-stamina': {
    category: 'shop',
    permanent: true,
    maxCount: 1,
    shopCategory: 'progress.shop.adventurer-shop',
    shopSubcategory: 'progress.shop.event-shop',
    shopTab: 'progress.shop.joint-challenge',
    shopItemKey: 'Stamina',
    shopItemQuantity: 50,
  },
  // Adventurer Shop > Friendship Point
  'shop-fp-stamina': {
    category: 'shop',
    permanent: true,
    maxCount: 4,
    shopCategory: 'progress.shop.adventurer-shop',
    shopSubcategory: 'progress.shop.friendship-point',
    shopItemKey: 'Stamina',
    shopItemQuantity: 30,
  },
  'shop-fp-gold': {
    category: 'shop',
    permanent: true,
    maxCount: 1,
    shopCategory: 'progress.shop.adventurer-shop',
    shopSubcategory: 'progress.shop.friendship-point',
    shopItemKey: 'Gold',
    shopItemQuantity: 10000,
  },
  'shop-fp-arena-ticket': {
    category: 'shop',
    permanent: true,
    maxCount: 1,
    shopCategory: 'progress.shop.adventurer-shop',
    shopSubcategory: 'progress.shop.friendship-point',
    shopItemKey: 'Arena Ticket',
    shopItemQuantity: 5,
  },
  // Premium Shop > General
  'shop-general-effectium': {
    category: 'shop',
    permanent: true,
    maxCount: 1,
    shopCategory: 'progress.shop.premium-shop',
    shopSubcategory: 'progress.shop.general',
    shopItemKey: 'Effectium',
    shopItemQuantity: 100,
  },
  // Adventurer Shop > Arena Shop
  'shop-arena-stamina': {
    category: 'shop',
    permanent: true,
    maxCount: 3,
    shopCategory: 'progress.shop.adventurer-shop',
    shopSubcategory: 'progress.shop.arena-shop',
    shopItemKey: 'Stamina',
    shopItemQuantity: 50,
  },
  'shop-arena-gold': {
    category: 'shop',
    permanent: true,
    maxCount: 1,
    shopCategory: 'progress.shop.adventurer-shop',
    shopSubcategory: 'progress.shop.arena-shop',
    shopItemKey: 'Gold',
    shopItemQuantity: 10000,
  },
  // Premium Shop > Star Memory
  'shop-starmem-stamina': {
    category: 'shop',
    permanent: true,
    maxCount: 3,
    shopCategory: 'progress.shop.premium-shop',
    shopSubcategory: 'progress.shop.star-memory',
    shopItemKey: 'Stamina',
    shopItemQuantity: 150,
  },
  'shop-starmem-ticket': {
    category: 'shop',
    permanent: true,
    maxCount: 1,
    shopCategory: 'progress.shop.premium-shop',
    shopSubcategory: 'progress.shop.star-memory',
    shopItemKey: 'Special Recruitment Ticket (Event)',
    shopItemQuantity: 1,
  },
  'shop-starmem-gold': {
    category: 'shop',
    permanent: true,
    maxCount: 3,
    shopCategory: 'progress.shop.premium-shop',
    shopSubcategory: 'progress.shop.star-memory',
    shopItemKey: 'Gold',
    shopItemQuantity: 200000,
  },
  'shop-starmem-arena': {
    category: 'shop',
    permanent: true,
    maxCount: 1,
    shopCategory: 'progress.shop.premium-shop',
    shopSubcategory: 'progress.shop.star-memory',
    shopItemKey: 'Arena Ticket',
    shopItemQuantity: 5,
  },
  // Guild > Guild Shop > Daily Products
  'shop-guild-gold': {
    category: 'shop',
    permanent: true,
    maxCount: 5,
    shopCategory: 'progress.shop.guild',
    shopSubcategory: 'progress.shop.guild-shop',
    shopTab: 'progress.shop.daily-products',
    shopItemKey: 'Gold',
    shopItemQuantity: 10000,
  },
});

export const WEEKLY_TASK_DEFINITIONS: Record<string, TaskDefinition> = stamp('weekly', {
  'arena-battle': { category: 'task', permanent: true, maxCount: 30 },
  'monad-gates-exploration': { category: 'task', permanent: true, maxCount: 1 },
  // Dynamique : 2/3/4 combats par étage (réglage) × 3 étages = 6/9/12
  'adventure-license': { category: 'task', permanent: true, maxCount: 12 },
  // Premium Shop > Normal > Daily/Weekly/Monthly
  'shop-weekly-free-gift': {
    category: 'shop',
    permanent: true,
    maxCount: 1,
    shopCategory: 'progress.shop.premium-shop',
    shopSubcategory: 'progress.shop.normal',
    shopTab: 'progress.shop.daily-weekly-monthly',
  },
  // Adventurer Shop > Event Shop > Joint Challenge
  'shop-weekly-jc-ticket': {
    category: 'shop',
    permanent: true,
    maxCount: 1,
    shopCategory: 'progress.shop.adventurer-shop',
    shopSubcategory: 'progress.shop.event-shop',
    shopTab: 'progress.shop.joint-challenge',
    shopItemKey: 'Special Recruitment Ticket (Event)',
    shopItemQuantity: 1,
  },
  'shop-weekly-jc-armor-glunite': {
    category: 'shop',
    permanent: true,
    maxCount: 1,
    shopCategory: 'progress.shop.adventurer-shop',
    shopSubcategory: 'progress.shop.event-shop',
    shopTab: 'progress.shop.joint-challenge',
    shopItemKey: 'Armor Glunite',
    shopItemQuantity: 1,
  },
  'shop-weekly-jc-gold': {
    category: 'shop',
    permanent: true,
    maxCount: 100,
    shopCategory: 'progress.shop.adventurer-shop',
    shopSubcategory: 'progress.shop.event-shop',
    shopTab: 'progress.shop.joint-challenge',
    shopItemKey: 'Gold',
    shopItemQuantity: 20000,
  },
  'shop-weekly-jc-present': {
    category: 'shop',
    permanent: true,
    maxCount: 1,
    shopCategory: 'progress.shop.adventurer-shop',
    shopSubcategory: 'progress.shop.event-shop',
    shopTab: 'progress.shop.joint-challenge',
    shopItemKey: 'Legendary Quality Present Chest',
    shopItemQuantity: 10,
  },
  'shop-weekly-jc-gem': {
    category: 'shop',
    permanent: true,
    maxCount: 1,
    shopCategory: 'progress.shop.adventurer-shop',
    shopSubcategory: 'progress.shop.event-shop',
    shopTab: 'progress.shop.joint-challenge',
    shopItemKey: 'Stage 5 Random Gem Chest',
    shopItemQuantity: 1,
  },
  // Premium Shop > General
  'shop-weekly-general-intermediate-manual': {
    category: 'shop',
    permanent: true,
    maxCount: 1,
    shopCategory: 'progress.shop.premium-shop',
    shopSubcategory: 'progress.shop.general',
    shopItemKey: 'Intermediate Skill Manual',
    shopItemQuantity: 2,
  },
  'shop-weekly-general-basic-manual': {
    category: 'shop',
    permanent: true,
    maxCount: 1,
    shopCategory: 'progress.shop.premium-shop',
    shopSubcategory: 'progress.shop.general',
    shopItemKey: 'Basic Skill Manual',
    shopItemQuantity: 5,
  },
  // Adventurer Shop > Friendship Point
  'shop-weekly-fp-hero-piece': {
    category: 'shop',
    permanent: true,
    maxCount: 1,
    shopCategory: 'progress.shop.adventurer-shop',
    shopSubcategory: 'progress.shop.friendship-point',
    shopItemKey: '3★ Hero Piece Selective Exchange Ticket',
    shopItemQuantity: 1,
  },
  'shop-weekly-fp-upgrade-stone': {
    category: 'shop',
    permanent: true,
    maxCount: 1,
    shopCategory: 'progress.shop.adventurer-shop',
    shopSubcategory: 'progress.shop.friendship-point',
    shopItemKey: 'Upgrade Stone Selection Chest',
    shopItemQuantity: 1,
  },
  'shop-weekly-fp-upgrade-piece': {
    category: 'shop',
    permanent: true,
    maxCount: 1,
    shopCategory: 'progress.shop.adventurer-shop',
    shopSubcategory: 'progress.shop.friendship-point',
    shopItemKey: 'Upgrade Stone Piece Selection Chest',
    shopItemQuantity: 1,
  },
  // Adventurer Shop > Arena Shop
  'shop-weekly-arena-basic-manual': {
    category: 'shop',
    permanent: true,
    maxCount: 5,
    shopCategory: 'progress.shop.adventurer-shop',
    shopSubcategory: 'progress.shop.arena-shop',
    shopItemKey: 'Basic Skill Manual',
    shopItemQuantity: 1,
  },
  'shop-weekly-arena-inter-manual': {
    category: 'shop',
    permanent: true,
    maxCount: 3,
    shopCategory: 'progress.shop.adventurer-shop',
    shopSubcategory: 'progress.shop.arena-shop',
    shopItemKey: 'Intermediate Skill Manual',
    shopItemQuantity: 1,
  },
  'shop-weekly-arena-pro-manual': {
    category: 'shop',
    permanent: true,
    maxCount: 2,
    shopCategory: 'progress.shop.adventurer-shop',
    shopSubcategory: 'progress.shop.arena-shop',
    shopItemKey: 'Professional Skill Manual',
    shopItemQuantity: 1,
  },
  // Premium Shop > Star Memory
  'shop-weekly-starmem-inter-manual': {
    category: 'shop',
    permanent: true,
    maxCount: 2,
    shopCategory: 'progress.shop.premium-shop',
    shopSubcategory: 'progress.shop.star-memory',
    shopItemKey: 'Intermediate Skill Manual',
    shopItemQuantity: 1,
  },
  'shop-weekly-starmem-pro-manual': {
    category: 'shop',
    permanent: true,
    maxCount: 1,
    shopCategory: 'progress.shop.premium-shop',
    shopSubcategory: 'progress.shop.star-memory',
    shopItemKey: 'Professional Skill Manual',
    shopItemQuantity: 1,
  },
  'shop-weekly-starmem-ticket': {
    category: 'shop',
    permanent: true,
    maxCount: 1,
    shopCategory: 'progress.shop.premium-shop',
    shopSubcategory: 'progress.shop.star-memory',
    shopItemKey: 'Special Recruitment Ticket',
    shopItemQuantity: 2,
  },
  'shop-weekly-starmem-transistone': {
    category: 'shop',
    permanent: true,
    maxCount: 4,
    shopCategory: 'progress.shop.premium-shop',
    shopSubcategory: 'progress.shop.star-memory',
    shopItemKey: 'Transistone (Total)',
    shopItemQuantity: 1,
  },
  // Adventurer Shop > Adventure License
  'shop-weekly-al-proof-of-worth': {
    category: 'shop',
    permanent: true,
    icon: 'TI_Licence',
    maxCount: 25,
    shopCategory: 'progress.shop.adventurer-shop',
    shopSubcategory: 'progress.shop.adventure-license',
    shopItemKey: 'Proof of Worth',
    shopItemQuantity: 1,
  },
  'shop-weekly-al-gem-chest': {
    category: 'shop',
    permanent: true,
    icon: 'TI_Licence',
    maxCount: 2,
    shopCategory: 'progress.shop.adventurer-shop',
    shopSubcategory: 'progress.shop.adventure-license',
    shopItemKey: 'Stage 5–6 Gem Chest',
    shopItemQuantity: 1,
  },
  // Guild > Guild Shop > Weekly Products
  'shop-weekly-guild-basic-manual': {
    category: 'shop',
    permanent: true,
    maxCount: 3,
    shopCategory: 'progress.shop.guild',
    shopSubcategory: 'progress.shop.guild-shop',
    shopTab: 'progress.shop.weekly-products',
    shopItemKey: 'Basic Skill Manual',
    shopItemQuantity: 1,
  },
  'shop-weekly-guild-intermediate-manual': {
    category: 'shop',
    permanent: true,
    maxCount: 2,
    shopCategory: 'progress.shop.guild',
    shopSubcategory: 'progress.shop.guild-shop',
    shopTab: 'progress.shop.weekly-products',
    shopItemKey: 'Intermediate Skill Manual',
    shopItemQuantity: 1,
  },
  'shop-weekly-guild-professional-manual': {
    category: 'shop',
    permanent: true,
    maxCount: 1,
    shopCategory: 'progress.shop.guild',
    shopSubcategory: 'progress.shop.guild-shop',
    shopTab: 'progress.shop.weekly-products',
    shopItemKey: 'Professional Skill Manual',
    shopItemQuantity: 1,
  },
  'shop-weekly-guild-hero-piece': {
    category: 'shop',
    permanent: true,
    maxCount: 5,
    shopCategory: 'progress.shop.guild',
    shopSubcategory: 'progress.shop.guild-shop',
    shopTab: 'progress.shop.weekly-products',
    shopItemKey: '[Guild] 3★ Hero Piece Selection Chest',
    shopItemQuantity: 1,
  },
  // Atelier de Kate
  'craft-weekly-potentium-armor': {
    category: 'craft',
    permanent: true,
    maxCount: 2,
    shopCategory: 'progress.craft.kates-workshop',
    shopItemKey: 'Potentium (Armor)',
    shopItemQuantity: 1,
  },
  'craft-weekly-potentium-weapon': {
    category: 'craft',
    permanent: true,
    maxCount: 2,
    shopCategory: 'progress.craft.kates-workshop',
    shopItemKey: 'Potentium (Weapon/Accessory)',
    shopItemQuantity: 1,
  },
  'craft-weekly-armor-glunite': {
    category: 'craft',
    permanent: true,
    maxCount: 4,
    shopCategory: 'progress.craft.kates-workshop',
    shopItemKey: 'Armor Glunite',
    shopItemQuantity: 1,
  },
  'craft-weekly-blue-stardust': {
    category: 'craft',
    permanent: true,
    maxCount: 7,
    shopCategory: 'progress.craft.kates-workshop',
    shopItemKey: 'Blue Stardust',
    shopItemQuantity: 1,
  },
  'craft-weekly-blue-memory-stone': {
    category: 'craft',
    permanent: true,
    maxCount: 7,
    shopCategory: 'progress.craft.kates-workshop',
    shopItemKey: 'Blue Memory Stone',
    shopItemQuantity: 1,
  },
});

export const MONTHLY_TASK_DEFINITIONS: Record<string, TaskDefinition> = stamp('monthly', {
  'skyward-tower-100': { category: 'task', permanent: true, maxCount: 1 },
  'skyward-tower-hard-40': { category: 'task', permanent: true, maxCount: 1 },
  // 4 phases de 5 étages, débloquées les 1/8/15/22 du mois
  'skyward-tower-vhard-20': {
    category: 'task',
    permanent: true,
    maxCount: 4,
    hasProgressiveUnlock: true,
  },
  // Extermination d'irréguliers
  'irregular-floor-3': { category: 'task', permanent: true, maxCount: 1 },
  'irregular-queen': { category: 'task', permanent: true, maxCount: 1 },
  'irregular-wyvre': { category: 'task', permanent: true, maxCount: 1 },
  'irregular-iron-stretcher': { category: 'task', permanent: true, maxCount: 1 },
  'irregular-blockbuster': { category: 'task', permanent: true, maxCount: 1 },
  // Premium Shop > Normal > Daily/Weekly/Monthly
  'shop-monthly-free-gift': {
    category: 'shop',
    permanent: true,
    maxCount: 1,
    shopCategory: 'progress.shop.premium-shop',
    shopSubcategory: 'progress.shop.normal',
    shopTab: 'progress.shop.daily-weekly-monthly',
  },
  // Adventurer Shop > World Boss
  'shop-monthly-worldboss-transistone-total': {
    category: 'shop',
    permanent: true,
    icon: 'TI_Item_World_Boss',
    maxCount: 2,
    shopCategory: 'progress.shop.adventurer-shop',
    shopSubcategory: 'progress.shop.world-boss',
    shopItemKey: 'Transistone (Total)',
    shopItemQuantity: 1,
  },
  'shop-monthly-worldboss-transistone-individual': {
    category: 'shop',
    permanent: true,
    icon: 'TI_Item_World_Boss',
    maxCount: 2,
    shopCategory: 'progress.shop.adventurer-shop',
    shopSubcategory: 'progress.shop.world-boss',
    shopItemKey: 'Transistone (Individual)',
    shopItemQuantity: 1,
  },
  'shop-monthly-worldboss-gold': {
    category: 'shop',
    permanent: true,
    icon: 'TI_Item_World_Boss',
    maxCount: 100,
    shopCategory: 'progress.shop.adventurer-shop',
    shopSubcategory: 'progress.shop.world-boss',
    shopItemKey: 'Gold',
    shopItemQuantity: 10000,
  },
  // Adventurer Shop > Event Shop > Joint Challenge
  'shop-monthly-jc-refined-glunite': {
    category: 'shop',
    permanent: true,
    maxCount: 1,
    shopCategory: 'progress.shop.adventurer-shop',
    shopSubcategory: 'progress.shop.event-shop',
    shopTab: 'progress.shop.joint-challenge',
    shopItemKey: 'Refined Glunite',
    shopItemQuantity: 1,
  },
  'shop-monthly-jc-transistone-individual': {
    category: 'shop',
    permanent: true,
    maxCount: 1,
    shopCategory: 'progress.shop.adventurer-shop',
    shopSubcategory: 'progress.shop.event-shop',
    shopTab: 'progress.shop.joint-challenge',
    shopItemKey: 'Transistone (Individual)',
    shopItemQuantity: 1,
  },
  'shop-monthly-jc-transistone-total': {
    category: 'shop',
    permanent: true,
    maxCount: 1,
    shopCategory: 'progress.shop.adventurer-shop',
    shopSubcategory: 'progress.shop.event-shop',
    shopTab: 'progress.shop.joint-challenge',
    shopItemKey: 'Transistone (Total)',
    shopItemQuantity: 1,
  },
  // Premium Shop > Star Memory
  'shop-monthly-starmem-glunite': {
    category: 'shop',
    permanent: true,
    maxCount: 1,
    shopCategory: 'progress.shop.premium-shop',
    shopSubcategory: 'progress.shop.star-memory',
    shopItemKey: 'Refined Glunite',
    shopItemQuantity: 1,
  },
  'shop-monthly-starmem-transistone-individual': {
    category: 'shop',
    permanent: true,
    maxCount: 4,
    shopCategory: 'progress.shop.premium-shop',
    shopSubcategory: 'progress.shop.star-memory',
    shopItemKey: 'Transistone (Individual)',
    shopItemQuantity: 1,
  },
  // Adventurer Shop > Survey Hub
  'shop-monthly-survey-basic-manual': {
    category: 'shop',
    permanent: true,
    icon: 'TI_Item_Research_Point',
    maxCount: 40,
    shopCategory: 'progress.shop.adventurer-shop',
    shopSubcategory: 'progress.shop.survey-hub',
    shopItemKey: 'Basic Skill Manual',
    shopItemQuantity: 1,
  },
  'shop-monthly-survey-intermediate-manual': {
    category: 'shop',
    permanent: true,
    icon: 'TI_Item_Research_Point',
    maxCount: 25,
    shopCategory: 'progress.shop.adventurer-shop',
    shopSubcategory: 'progress.shop.survey-hub',
    shopItemKey: 'Intermediate Skill Manual',
    shopItemQuantity: 1,
  },
  'shop-monthly-survey-professional-manual': {
    category: 'shop',
    permanent: true,
    icon: 'TI_Item_Research_Point',
    maxCount: 9,
    shopCategory: 'progress.shop.adventurer-shop',
    shopSubcategory: 'progress.shop.survey-hub',
    shopItemKey: 'Professional Skill Manual',
    shopItemQuantity: 1,
  },
  'shop-monthly-survey-talisman': {
    category: 'shop',
    permanent: true,
    icon: 'TI_Item_Research_Point',
    maxCount: 1,
    shopCategory: 'progress.shop.adventurer-shop',
    shopSubcategory: 'progress.shop.survey-hub',
    shopItemKey: '6★ Talisman Selection Chest',
    shopItemQuantity: 1,
  },
  'shop-monthly-survey-recruitment-ticket': {
    category: 'shop',
    permanent: true,
    icon: 'TI_Item_Research_Point',
    maxCount: 30,
    shopCategory: 'progress.shop.adventurer-shop',
    shopSubcategory: 'progress.shop.survey-hub',
    shopItemKey: 'Special Recruitment Ticket (Event)',
    shopItemQuantity: 1,
  },
  'shop-monthly-survey-free-ether': {
    category: 'shop',
    permanent: true,
    icon: 'TI_Item_Research_Point',
    maxCount: 500,
    shopCategory: 'progress.shop.adventurer-shop',
    shopSubcategory: 'progress.shop.survey-hub',
    shopItemKey: 'Free Ether',
    shopItemQuantity: 1,
  },
  'shop-monthly-survey-transistone-individual': {
    category: 'shop',
    permanent: true,
    icon: 'TI_Item_Research_Point',
    maxCount: 2,
    shopCategory: 'progress.shop.adventurer-shop',
    shopSubcategory: 'progress.shop.survey-hub',
    shopItemKey: 'Transistone (Individual)',
    shopItemQuantity: 1,
  },
  'shop-monthly-survey-transistone-total': {
    category: 'shop',
    permanent: true,
    icon: 'TI_Item_Research_Point',
    maxCount: 2,
    shopCategory: 'progress.shop.adventurer-shop',
    shopSubcategory: 'progress.shop.survey-hub',
    shopItemKey: 'Transistone (Total)',
    shopItemQuantity: 1,
  },
  'shop-monthly-survey-glunite': {
    category: 'shop',
    permanent: true,
    icon: 'TI_Item_Research_Point',
    maxCount: 5,
    shopCategory: 'progress.shop.adventurer-shop',
    shopSubcategory: 'progress.shop.survey-hub',
    shopItemKey: 'Refined Glunite',
    shopItemQuantity: 1,
  },
  // Atelier de Kate
  'craft-monthly-transistone-total': {
    category: 'craft',
    permanent: true,
    maxCount: 3,
    shopCategory: 'progress.craft.kates-workshop',
    shopItemKey: 'Transistone (Total)',
    shopItemQuantity: 1,
  },
  'craft-monthly-transistone-individual': {
    category: 'craft',
    permanent: true,
    maxCount: 3,
    shopCategory: 'progress.craft.kates-workshop',
    shopItemKey: 'Transistone (Individual)',
    shopItemQuantity: 1,
  },
});

/** Les trois records, indexés par cycle. */
export const TASK_DEFINITIONS: Record<TaskType, Record<string, TaskDefinition>> = {
  daily: DAILY_TASK_DEFINITIONS,
  weekly: WEEKLY_TASK_DEFINITIONS,
  monthly: MONTHLY_TASK_DEFINITIONS,
};

export const TASK_TYPES: TaskType[] = ['daily', 'weekly', 'monthly'];

/** Contenus « sweepables » du jeu — bouton « tout balayer » de l'onglet daily. */
export const SWEEPABLE_TASK_IDS = [
  'hypnotic-frog-hall',
  'ark-raid',
  'defeat-doppelganger',
  'special-request-ecology',
  'special-request-identification',
  'memorial-match',
  'story-hard',
];

/** Tâches permanentes hors boutique/atelier : activées d'office, non désactivables. */
export function permanentTaskIds(type: TaskType): string[] {
  return Object.values(TASK_DEFINITIONS[type])
    .filter((def) => def.permanent && def.category !== 'craft' && def.category !== 'shop')
    .map((def) => def.id);
}

/** Entrées boutique/atelier activées PAR DÉFAUT (désactivables dans les réglages). */
export function defaultCategoryTaskIds(type: TaskType, category: 'craft' | 'shop'): string[] {
  return Object.values(TASK_DEFINITIONS[type])
    .filter((def) => def.permanent && def.category === category)
    .map((def) => def.id);
}
