/**
 * LA FORME des trois guides généraux éditables — ce que l'admin disait en
 * trois pages React (`PremiumLimitedEditor`, `FreeHeroesEditor`,
 * `ShopPrioritiesEditor`), dit ici en DONNÉES : des onglets, chacun des blocs,
 * chaque bloc une liste d'entrées (ou un texte seul) dont les CHAMPS sont
 * décrits — un texte localisé, un héros, des héros, un choix, un palier de
 * transcendance, une priorité S/A/B/C… Quick rend la forme qu'on lui sert et
 * ne connaît aucun des trois guides par son nom ; le serveur contrôle ce qui
 * revient avec la même description (`scripts/quick/actions.ts`,
 * `saveGeneralGuide`). Un quatrième guide général éditable = une entrée ici,
 * ses lectures et écritures dans un store, rien dans la page.
 *
 * Module volontairement PUR (ni `node:fs`, ni store) : testable seul, et la
 * forme dépend des DONNÉES (les shops dérivés présents, les shops texte) sans
 * les lire.
 */
import { STARS } from './review-shape';
import {
  DERIVED_LABEL,
  DERIVED_ORDER,
  PERIODS,
  PRIORITIES,
  TEXT_SHOP_LABEL,
} from './shop-priorities-shape';

export type GeneralGuideKind = 'premium-limited' | 'free-heroes' | 'shop-priorities';

/** Les slugs de `general-guides` éditables, et le modèle de chacun. */
export const GENERAL_GUIDE_KINDS: Readonly<Record<string, GeneralGuideKind>> = {
  'premium-limited': 'premium-limited',
  'free-heroes-start-banner': 'free-heroes',
  'shop-purchase-priorities': 'shop-priorities',
};

export const generalGuideKind = (slug: string): GeneralGuideKind | undefined =>
  Object.hasOwn(GENERAL_GUIDE_KINDS, slug) ? GENERAL_GUIDE_KINDS[slug] : undefined;

/**
 * Ce qu'un champ d'une entrée peut être :
 *   - `text` : un texte localisé (l'anglais, son aperçu, ses traductions) ;
 *   - `hero` : UN perso par son nom d'affichage anglais (le picker, une tuile) ;
 *   - `heroes` : plusieurs (le picker en multi, des tuiles) ;
 *   - `select` : un choix parmi `options` ;
 *   - `stars` : un palier PLEIN de transcendance du perso de l'entrée
 *     (les options dépendent de sa rareté : `options.steps` de l'état) ;
 *   - `string`, `number`, `check` : un champ nu ;
 *   - `target` : une cible de transcendance recommandée — une CHAÎNE (« 4 to
 *     5 », « Any », « 5 (support) 6 (dps) »), saisie en étoiles 3-6 + « Any »
 *     + une note, comme `contribute/premium-reviews` l'écrit ;
 *   - `priority` : S, A, B, C ou rien ;
 *   - `impact` : la grille 3★ → 6★ × PvE / PvP, notée 1 à 5 ;
 *   - `cost` : `{ currency, amount }` ; `limit` : `{ count, period }` ;
 *   - `product` : le produit du jeu d'une ligne dérivée, en LECTURE (icône,
 *     nom, coût, limite — le factuel n'est jamais curé).
 */
export type GeneralFieldKind =
  | 'text'
  | 'hero'
  | 'heroes'
  | 'select'
  | 'stars'
  | 'string'
  | 'number'
  | 'check'
  | 'target'
  | 'priority'
  | 'impact'
  | 'cost'
  | 'limit'
  | 'product';

export interface GeneralField {
  key: string;
  kind: GeneralFieldKind;
  label: string;
  /** `text` : un champ d'une ligne (un libellé), pas une zone de texte. */
  line?: boolean;
  /** `text` : l'anglais est requis ; `hero`, `heroes` : au moins un. */
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  /** La valeur d'une entrée neuve (absente : vide selon le genre). */
  default?: unknown;
  /** `hero` : la case (`check` de la même entrée) qui libère le nom — un perso pas encore sorti. */
  unreleasedKey?: string;
}

export interface GeneralBlock {
  id: string;
  label: string;
  hint?: string;
  /** Où le bloc vit dans les données du store (`['reviews', 'premium']`). */
  path: string[];
  /** `list` : des entrées à champs ; `texts` : des textes localisés ; `text` : un seul. */
  kind: 'list' | 'texts' | 'text';
  fields?: GeneralField[];
  /** `list` : une sous-liste par entrée (les entrées d'une source de héros gratuits). */
  nested?: { key: string; label: string; fields: GeneralField[] };
  /** « ＋ » : `hero` — le picker pose le nom ; `entry` — une entrée vierge ; absent : liste figée. */
  add?: 'hero' | 'entry';
  /** Ce que « ＋ » ajoute, pour son libellé (« ＋ source ») ; `hero` d'office : « héros ». */
  addLabel?: string;
  /** L'ordre est le contenu (un palier de priorité) : ↑ ↓. */
  ordered?: boolean;
  /** `list` : le champ qui nomme une entrée (son titre de carte). */
  title?: string;
  /**
   * `list` d'un perso par entrée, comment la page la montre :
   *   - `roster` : à la façon de `contribute/premium-reviews` — le compteur
   *     « 11 / 13 reviews » et les manquants, une liste compacte des persos
   *     (ceux de `roster`, puis les entrées hors roster), UN formulaire déplié à
   *     la fois ; « ＋ review » propose les persos du roster sans entrée ;
   *   - `tiles` : des vignettes en rangée, l'ordre = le rang (`ordered`), en
   *     glisser-déposer — aussi entre les blocs `tiles` du même onglet —, ↑ ↓
   *     au clavier, « ＋ » en multi-choix comme les items de Gear reco.
   * Absent : des cartes, ou des lignes ordonnées.
   */
  view?: 'roster' | 'tiles';
  /** `roster` : la clé, dans `options.rosters` de l'état, des persos attendus (`premium`). */
  roster?: string;
  /** `text`, `texts` : l'anglais est requis. */
  required?: boolean;
  /** Un shop dérivé : sa monnaie (le coût des lignes se lit avec son icône). */
  currency?: { name: string; icon: string };
}

export interface GeneralTab {
  id: string;
  label: string;
  blocks: GeneralBlock[];
}

export interface GeneralGuideForm {
  slug: string;
  kind: GeneralGuideKind;
  /** Jamais : un guide général n'a pas de versions (la page lit `spec.versioned`). */
  versioned: false;
  tabs: GeneralTab[];
}

const text = (key: string, label: string, more: Partial<GeneralField> = {}): GeneralField => ({
  key,
  kind: 'text',
  label,
  ...more,
});

/* --- Premium & Limited --- */

const BUCKETS = [
  ['premium', 'Premium'],
  ['limited', 'Limited'],
] as const;
const TIERS = [
  ['first', '1er choix'],
  ['second', '2e choix'],
  ['third', '3e choix'],
  ['transcend', 'Priorité de transcendance'],
] as const;

const REVIEW_FIELDS: GeneralField[] = [
  { key: 'name', kind: 'hero', label: 'Héros', required: true, unreleasedKey: 'unreleased' },
  {
    key: 'unreleased',
    kind: 'check',
    label: 'Pas encore sorti — absent de la data, le nom reste libre',
    default: false,
  },
  text('review', 'Review', { required: true }),
  { key: 'recommendedPve', kind: 'target', label: 'Cible PvE', default: '' },
  { key: 'recommendedPvp', kind: 'target', label: 'Cible PvP', default: '' },
  { key: 'impact', kind: 'impact', label: 'Impact par transcendance (1-5)' },
];

/**
 * Par bucket, DEUX onglets — Reviews, Priorités — plutôt que deux onglets
 * Premium / Limited à segmenté : un sous-onglet par usage, c'est ce que la
 * coquille sait faire (le point « modifié » ou « refusé », « Traduire », le
 * hash, le refus situé — tout vaut par onglet), et les reviews et les paliers
 * ne se retouchent jamais d'un même geste. Les ids des blocs ne bougent pas
 * (`premium-reviews`, `premium-first`…) : un refus du store les retrouve.
 */
function premiumLimitedForm(slug: string): GeneralGuideForm {
  return {
    slug,
    kind: 'premium-limited',
    versioned: false,
    tabs: BUCKETS.flatMap(([bucket, label]): GeneralTab[] => [
      {
        id: `${bucket}-reviews`,
        label: `${label} · Reviews`,
        blocks: [
          {
            id: `${bucket}-reviews`,
            label: 'Reviews',
            hint: 'une par héros ; la review est publique, contribuée par Shiraen',
            path: ['reviews', bucket],
            kind: 'list',
            add: 'hero',
            title: 'name',
            view: 'roster',
            roster: bucket,
            fields: REVIEW_FIELDS,
          },
        ],
      },
      {
        id: `${bucket}-priorities`,
        label: `${label} · Priorités`,
        blocks: TIERS.map(([tier, tierLabel]): GeneralBlock => ({
          id: `${bucket}-${tier}`,
          label: tierLabel,
          hint: 'l’ordre est celui de la page',
          path: ['priorities', bucket, tier],
          kind: 'list',
          add: 'hero',
          ordered: true,
          title: 'name',
          view: 'tiles',
          fields: [
            { key: 'name', kind: 'hero', label: 'Héros', required: true },
            { key: 'stars', kind: 'stars', label: 'Palier' },
          ],
        })),
      },
    ]),
  };
}

/* --- Free Heroes --- */

function freeHeroesForm(slug: string): GeneralGuideForm {
  return {
    slug,
    kind: 'free-heroes',
    versioned: false,
    tabs: [
      {
        id: 'sources',
        label: 'Sources',
        blocks: [
          {
            id: 'sources',
            label: 'Sources de héros gratuits',
            hint: 'une source = une ligne du tableau ; chaque entrée porte ses héros, le type de choix et sa raison',
            path: ['sources'],
            kind: 'list',
            add: 'entry',
            addLabel: 'source',
            title: 'source',
            fields: [text('source', 'Source', { line: true, required: true })],
            nested: {
              key: 'entries',
              label: 'entrée',
              fields: [
                { key: 'names', kind: 'heroes', label: 'Héros', required: true, default: [] },
                {
                  key: 'pickType',
                  kind: 'select',
                  label: 'Choix',
                  options: [
                    { value: 'all', label: 'Tous (obtenus)' },
                    { value: 'one', label: 'Un seul (au choix)' },
                  ],
                  default: 'all',
                },
                text('reason', 'Raison'),
              ],
            },
          },
        ],
      },
    ],
  };
}

/* --- Shop priorities --- */

/** Ce que la forme des shops lit des données : les dérivés présents, les shops texte. */
export interface ShopFormData {
  derived: { key: string; currency: { name: Record<string, string>; icon: string } }[];
  editorial: { textShops: Record<string, unknown>; shopNotes?: Record<string, unknown> };
}

const ITEM_FIELDS: GeneralField[] = [
  {
    key: 'priority',
    kind: 'priority',
    label: 'Priorité',
    options: PRIORITIES.map((p) => ({ value: p, label: p })),
    default: 'C',
  },
  {
    key: 'name',
    kind: 'string',
    label: 'Item',
    placeholder: 'nom du catalogue (EN), ou générique',
    default: '',
  },
  text('label', 'Libellé localisé (un générique : « Cosmetic »)', { line: true }),
  { key: 'gives', kind: 'number', label: 'Donne' },
  { key: 'cost', kind: 'cost', label: 'Coût' },
  {
    key: 'limit',
    kind: 'limit',
    label: 'Limite',
    options: PERIODS.map((p) => ({ value: p, label: p })),
  },
  text('notes', 'Note'),
];

const shopNote = (key: string): GeneralBlock => ({
  id: `${key}-note`,
  label: 'Note du shop',
  path: ['editorial', 'shopNotes', key],
  kind: 'text',
});

function shopPrioritiesForm(slug: string, data: ShopFormData): GeneralGuideForm {
  const derived = [...data.derived].sort(
    (a, b) => rank(DERIVED_ORDER, a.key) - rank(DERIVED_ORDER, b.key),
  );
  const tabs: GeneralTab[] = derived.map((shop) => ({
    id: shop.key,
    label: DERIVED_LABEL[shop.key] ?? shop.key,
    blocks: [
      shopNote(shop.key),
      {
        id: `${shop.key}-rows`,
        label: 'Produits',
        hint: 'dérivés du jeu : seules la priorité et la note se curent',
        path: ['derived', String(data.derived.indexOf(shop)), 'rows'],
        kind: 'list',
        title: 'product',
        currency: { name: shop.currency.name.en ?? shop.key, icon: shop.currency.icon },
        fields: [
          { key: 'product', kind: 'product', label: 'Produit' },
          {
            key: 'priority',
            kind: 'priority',
            label: 'Priorité',
            options: PRIORITIES.map((p) => ({ value: p, label: p })),
          },
          text('notes', 'Note'),
        ],
      },
    ],
  }));
  tabs.push(
    {
      id: 'event',
      label: 'Event',
      blocks: [
        shopNote('event'),
        {
          id: 'event-items',
          label: 'Items',
          hint: 'un gabarit : les coûts varient selon l’event',
          path: ['editorial', 'eventItems'],
          kind: 'list',
          add: 'entry',
          addLabel: 'item',
          title: 'name',
          fields: ITEM_FIELDS,
        },
      ],
    },
    {
      id: 'resource',
      label: 'General / Resource',
      blocks: [
        {
          id: 'resource-items',
          label: 'Items',
          hint: 'la sélection curée du shop Ether / Gold',
          path: ['editorial', 'resourceItems'],
          kind: 'list',
          add: 'entry',
          addLabel: 'item',
          title: 'name',
          fields: ITEM_FIELDS,
        },
      ],
    },
  );
  for (const key of Object.keys(TEXT_SHOP_LABEL))
    if (data.editorial.textShops[key])
      tabs.push({
        id: key,
        label: TEXT_SHOP_LABEL[key],
        blocks: [
          {
            id: `${key}-paragraphs`,
            label: 'Paragraphes',
            path: ['editorial', 'textShops', key, 'paragraphs'],
            kind: 'texts',
            add: 'entry',
            addLabel: 'paragraphe',
            required: true,
          },
          {
            id: `${key}-gear`,
            label: 'Note de gear',
            hint: 'facultative',
            path: ['editorial', 'textShops', key, 'gearNote'],
            kind: 'text',
          },
        ],
      });
  // Une note de shop dont le shop n'est pas là (hors rotation, ou un shop sans
  // table dérivée) : son onglet, pour qu'elle reste éditable — et ÉCRITE. Sans
  // lui, un enregistrement rebâti sur la forme la perdrait.
  for (const key of Object.keys(data.editorial.shopNotes ?? {}))
    if (!tabs.some((t) => t.id === key))
      tabs.push({
        id: key,
        label: DERIVED_LABEL[key] ?? key,
        blocks: [{ ...shopNote(key), hint: 'shop absent de la rotation : sa note seule' }],
      });
  return { slug, kind: 'shop-priorities', versioned: false, tabs };
}

const rank = (order: readonly string[], key: string): number => {
  const i = order.indexOf(key);
  return i < 0 ? order.length : i;
};

/**
 * La forme d'un guide général éditable, d'après ses données (les shops
 * présents) ; `undefined` pour un slug dont le contenu est en code.
 */
export function generalGuideForm(slug: string, data: unknown): GeneralGuideForm | undefined {
  switch (generalGuideKind(slug)) {
    case 'premium-limited':
      return premiumLimitedForm(slug);
    case 'free-heroes':
      return freeHeroesForm(slug);
    case 'shop-priorities':
      return shopPrioritiesForm(slug, data as ShopFormData);
    default:
      return undefined;
  }
}

/** Les clés de la grille d'impact, pour qui contrôle une entrée (`review-shape`). */
export { STARS as IMPACT_STARS };

/**
 * Le bloc (et son onglet) qui porte une CLÉ de champ — la clé est le chemin
 * dans les données, joint par des points (`reviews.premium.2.review`,
 * `editorial.shopNotes.guild`) : c'est ainsi que la page nomme ses champs et
 * que le serveur situe un refus.
 */
export function blockOfKey(
  form: GeneralGuideForm,
  key: string,
): { tab: GeneralTab; block: GeneralBlock } | undefined {
  let best: { tab: GeneralTab; block: GeneralBlock } | undefined;
  for (const tab of form.tabs)
    for (const block of tab.blocks) {
      const prefix = block.path.join('.');
      if (key === prefix || key.startsWith(`${prefix}.`))
        if (!best || prefix.length > best.block.path.join('.').length) best = { tab, block };
    }
  return best;
}
