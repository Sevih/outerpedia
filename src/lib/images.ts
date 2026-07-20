/**
 * Helpers d'images + couleurs (partagés admin ET public).
 *
 * Source = NOS assets extraits du jeu : en dev, `/images/*` est servi depuis
 * `.assets-staging/` (route dev) ; en prod, NEXT_PUBLIC_IMG_BASE pointe le
 * bucket R2 (img.outerpedia.com). Plus aucune référence à la prod V2.
 */
const BASE = process.env.NEXT_PUBLIC_IMG_BASE ?? '';

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

export const img = {
  /** Portrait cadré (vignette/header). */
  portrait: (id: string) => `${BASE}/images/characters/portrait/CT_${id}.webp`,
  /** Préfixe la base d'assets sur un chemin déjà résolu (image de contenu éditorial, ex. changelog). */
  asset: (path: string) => `${BASE}${path}`,
  /** Corps entier (grand visuel). */
  full: (id: string) => `${BASE}/images/characters/full/IMG_${id}.webp`,
  /** Icône de visage (listes). */
  face: (id: string) => `${BASE}/images/characters/faceicon/FI_${id}.webp`,
  /** Variante PNG (og:image — les aperçus Discord/OG préfèrent le PNG). */
  facePng: (id: string) => `${BASE}/images/characters/faceicon/FI_${id}.png`,
  /** Icône d'ordre de tour (barre ATB en combat). */
  atb: (id: string) => `${BASE}/images/characters/atb/IG_Turn_${id}.webp`,
  /** Icône d'élément (slug → CamelCase ; sprites IG_Turn_Element_*). */
  element: (el: string) => `${BASE}/images/ui/elem/IG_Turn_Element_${cap(el)}.webp`,
  /** Icône de classe (slug → CamelCase ; sprites IG_Turn_Class_*, clé = slug). */
  klass: (cl: string) => `${BASE}/images/ui/class/IG_Turn_Class_${cap(cl)}.webp`,
  /** Icône de compétence (nom d'icône brut du jeu). */
  skill: (icon: string) => `${BASE}/images/characters/skills/${icon}.webp`,
  /** Icône d'attaque en chaîne (élément + type, slugs → CamelCase). */
  chain: (element: string, chainType: string) =>
    `${BASE}/images/characters/chain/Skill_ChainPassive_${cap(element)}_${cap(chainType)}.webp`,
  /** Icône d'équipement exclusif (par id de perso). */
  ee: (id: string) => `${BASE}/images/characters/ee/${id}.webp`,
  /** Variante PNG (og:image des pages détail EE). */
  eePng: (id: string) => `${BASE}/images/characters/ee/${id}.png`,
  /** Icône de sous-classe (slug → CamelCase). */
  subClass: (sc: string) => `${BASE}/images/ui/class/CM_Sub_Class_${cap(sc)}.webp`,
  /** Étoile de rareté (jaune). */
  star: () => `${BASE}/images/ui/star/CM_icon_star_y.webp`,
  /** Étoile Singularity (item ascendé). */
  starSingularity: () => `${BASE}/images/ui/star/CM_Star_Singularity.webp`,
  /** Icône de tag éditorial (premium/limited/…). */
  tag: (slug: string) => `${BASE}/images/ui/tags/${slug}.webp`,
  /** Icône d'effet (nom d'icône du glossaire). */
  effect: (icon: string) => `${BASE}/images/ui/effect/${icon}.webp`,
  /** Icône de geas du guild raid (`GD_Geis_*`, glossaire `geas`). */
  geas: (icon: string) => `${BASE}/images/ui/geas/${icon}.webp`,
  /** Cadre de fond d'un geas par grade d'intensité (1..3). */
  geasFrame: (grade: number) => `${BASE}/images/ui/geas/GD_Slot_Bg_0${grade}.webp`,
  /** Carte de burst 1..3 (fond du jeu). */
  burstCard: (level: 1 | 2 | 3) => `${BASE}/images/ui/skills/IG_Button_Burst_0${level}.webp`,
  /** Badge burst posé sur l'icône du skill burstable. */
  burstBadge: () => `${BASE}/images/ui/skills/CM_Skill_Icon_Burst.webp`,
  /** Flèche de priorité de skills. */
  chainArrow: () => `${BASE}/images/ui/nav/IG_Chain_Arrow.webp`,
  /** Icône de navigation éditoriale (pve/pvp — cibles des guides de reviews). */
  navIcon: (name: string) => `${BASE}/images/ui/nav/${name}.webp`,
  /** Icône d'onglet de shop (guide shop-purchase-priorities ; clé = shop). */
  shopIcon: (key: string) => `${BASE}/images/ui/shop/${key}.webp`,
  /**
   * Drapeau d'une langue (SVG éditorial — les emojis drapeaux ne rendent pas
   * sur Chrome/Windows, même règle que la V2). `code` = LANGUAGES[lang].flag.
   */
  flag: (code: string) => `${BASE}/images/ui/flags/${code}.svg`,
  /** Icône de rang (SSS..D). */
  rank: (rank: string) => `${BASE}/images/ui/rank/IG_Event_Rank_${rank}.webp`,
  /** Icône d'équipement (arme/amulette/talisman, nom de sprite du jeu). */
  equipment: (icon: string) => `${BASE}/images/equipment/${icon}.webp`,
  /** Variante PNG (og:image des pages détail équipement). */
  equipmentPng: (icon: string) => `${BASE}/images/equipment/${icon}.png`,
  /** Cadre de rareté d'une tuile d'item (grade slug : normal/magic/rare/unique). */
  slotFrame: (grade: string) =>
    `${BASE}/images/ui/bg/TI_Slot_${SLOT_FRAME[grade] ?? 'Normal'}.webp`,
  /** Portrait d'un boss (`MT_*`, sources d'obtention d'équipement). */
  boss: (icon: string) => `${BASE}/images/ui/boss/${icon}.webp`,
  /** Variante PNG (og:image des guides de boss — Discord/OG préfèrent le PNG). */
  bossPng: (icon: string) => `${BASE}/images/ui/boss/${icon}.png`,
  /**
   * Carte de partage par DÉFAUT (1200×630), pour les pages sans visuel propre.
   *
   * Elle passe par `BASE` comme toute autre image : `/images/*` n'est servi par
   * le site QU'EN DÉVELOPPEMENT (`src/app/images/[...path]/route.dev.ts`), et
   * `public/images/` est vide. Un chemin racine ici marchait en local et pointait
   * dans le vide en production — toutes les cartes de partage des pages sans
   * `ogImage` explicite étaient donc mortes.
   */
  ogDefault: () => `${BASE}/images/ui/og_default.jpg`,
  /** Bannière du bandeau d'accueil (artwork retravaillé, chrome du site). */
  homeBanner: () => `${BASE}/images/croped_banner.webp`,
  /** Icône du serveur Discord (encart d'accueil). */
  discord: () => `${BASE}/images/discord.webp`,
  /** Icône d'un type de buff (widget Daily Buff — nom de sprite retravaillé). */
  buff: (sprite: string) => `${BASE}/images/ui/buffs/${sprite}.webp`,
  /** Avatar d'un contributeur (page /contributors — clé `avatar` du curé). */
  contributor: (avatar: string) => `${BASE}/images/contributors/${avatar}.webp`,
  /** Icône d'un outil (landing /tools — `icon` du curé, sous-dossier inclus). */
  toolIcon: (icon: string) => `${BASE}/images/ui/${icon}.webp`,
  /** Icône de l'or (coûts d'ascension). */
  gold: () => `${BASE}/images/items/CM_Goods_Gold.webp`,
  /** Icône d'item générique (gifts, pièces de rappel…). */
  item: (icon: string) => `${BASE}/images/items/${icon}.webp`,
  /** Étoile de transcendance (sprite CM_icon_star_* — voir STAR_SPRITE). */
  transcendStar: (sprite: string) => `${BASE}/images/ui/star/${sprite}.webp`,
  /** Onglet d'évolution (sélecteur de paliers de stats). */
  evoTab: (selected: boolean) =>
    `${BASE}/images/ui/evo/CM_Evolution_Tab${selected ? '_Select' : ''}.webp`,
  /** Icône de stat (sprite CM_Stat_Icon_* — voir STAT_ICON dans lib/stats). */
  statIcon: (sprite: string) => `${BASE}/images/ui/stat/${sprite}.webp`,
  /** Icône du Combat Power (fiche perso, section Stats). */
  power: () => `${BASE}/images/ui/stat/CM_Icon_Power.webp`,
  /** Fond sombre des étoiles de rareté (cartes de persos). */
  starSlot: () => `${BASE}/images/ui/star/CM_Character_Thumbnail_Star_Slot.webp`,
  /** Badge de recrutement (premium/limited/…) sur les cartes. */
  recruitTag: (tag: string) => `${BASE}/images/ui/recruit/${RECRUIT_TAG_SPRITE[tag]}.webp`,
  /** Sprite de recrutement par NOM (boutons/rubans de bannière — recruit.json). */
  recruitSprite: (name: string) => `${BASE}/images/ui/recruit/${name}.webp`,
  /** Icône core-fusion (cartes de persos). */
  coreFusionTag: () => `${BASE}/images/ui/tags/CT_Core_Icon.webp`,
  /** Icône de guide/catégorie de guides (sprite du jeu, namespace unique). */
  guideIcon: (icon: string) => `${BASE}/images/ui/guides/${icon}.webp`,
  /**
   * Même icône, en PNG : la carte de partage (og:image) d'un guide SANS boss
   * (general-guides…). Les aperçus Discord/OG digèrent mal le WebP — même
   * règle que `monsterOgImage`. Collectée par le manifest pour exactement les
   * guides qui s'en servent (ni bossId ni ogImage explicite).
   */
  guideIconPng: (icon: string) => `${BASE}/images/ui/guides/${icon}.png`,
  /** Glyphe/cadre d'un nœud de quirk (Awakening) — `CM_Gift_*Node_*`, hexagone. */
  quirkNode: (sprite: string) => `${BASE}/images/ui/quirk/${sprite}.webp`,
  /** Icône illustrative du guide Combat (bouton turn-order, skills d'arène). */
  combatIcon: (sprite: string) => `${BASE}/images/ui/combat/${sprite}.webp`,
  /**
   * Screenshot ÉDITORIAL d'un guide (capture, schéma — rien qui existe en jeu).
   * Source : `data/editorial/guides/<slug>/<fichier>`, collecté par scan
   * (cf. manifest d'assets) sous la même arborescence publique.
   */
  guideShot: (slug: string, file: string) => `${BASE}/images/guides/${slug}/${file}`,
  /** Sprite de la carte Monad Gate (icônes de nœud, trait de liaison, anneau). */
  monad: (sprite: string) => `${BASE}/images/ui/monad/${sprite}.webp`,
  /**
   * Badge de palier de combat (`CM_Event_Rank_E_02`…) — sprite dérivé du nom du
   * palier par `rankBadgeSprite`. Même namespace que les rangs `IG_Event_Rank_*`
   * (autre famille de sprites, même sujet).
   */
  rankBadge: (sprite: string) => `${BASE}/images/ui/rank/${sprite}.webp`,
  /**
   * Art du mode Dimensional Singularity, tel que la table le nomme
   * (`singularity.json` : `banner` = bannière large 680×94, `thumbnail` =
   * avatar rond 90×90). Ce sont des sprites DISTINCTS du portrait de boss
   * (`MT_<icon>`, carré) — pas des doublons : cadrages et usages différents.
   */
  singularity: (sprite: string) => `${BASE}/images/ui/singularity/${sprite}.webp`,
};

/**
 * Fonds décoratifs référencés par `globals.css` (page + traits de titres). En
 * CSS on ne peut pas concaténer `var()` dans un `url()`, donc on injecte la
 * valeur `url(...)` COMPLÈTE (base R2 en prod, relatif en dev) comme variables
 * CSS sur `<html>` — le CSS ne référence plus que `var(--bg-*)`. Sans ça, les
 * `url('/images/...')` relatifs tapent le domaine du site (404) au lieu de R2.
 */
export const cssBackgroundVars: Record<`--${string}`, string> = {
  '--bg-page': `url('${BASE}/images/background_compressed.webp')`,
  '--bg-page-portrait': `url('${BASE}/images/background_compressed_portrait.webp')`,
  '--bg-h1-page': `url('${BASE}/images/ui/common/CM_Desc_Bg.webp')`,
  '--hr-h1': `url('${BASE}/images/ui/common/CM_Result_Victory_Bg.webp')`,
  '--hr-h2': `url('${BASE}/images/ui/common/CM_Result_Victory_Line.webp')`,
  '--hr-h3': `url('${BASE}/images/ui/common/CM_Gradation_Bg.webp')`,
  '--hr-h4': `url('${BASE}/images/ui/common/CM_Gauge_CharacterInfo.webp')`,
  '--hr-h5': `url('${BASE}/images/ui/common/CM_Gauge_AccountInfo.webp')`,
};

/** Grade slug → suffixe du sprite de cadre TI_Slot_*. */
const SLOT_FRAME: Record<string, string> = {
  normal: 'Normal',
  magic: 'Magic',
  rare: 'Rare',
  unique: 'Unique',
  singularity: 'Singularity',
};

/** Tag éditorial → sprite de badge de recrutement (ordre V2 : premier trouvé). */
export const RECRUIT_TAG_SPRITE: Record<string, string> = {
  collab: 'CM_Recruit_Tag_Collab',
  seasonal: 'CM_Recruit_Tag_Seasonal',
  premium: 'CM_Recruit_Tag_Premium',
  free: 'CM_Recruit_Tag_Free',
  limited: 'CM_Recruit_Tag_Fes',
};

/** Couleur de texte par grade d'item (tokens item-* : mêmes teintes que la V2). */
export const GRADE_TEXT: Record<string, string> = {
  normal: 'text-item-normal',
  magic: 'text-item-superior',
  rare: 'text-item-epic',
  unique: 'text-item-legendary',
};

/** Ordre canonique des éléments (menus du jeu) — tri des vues élémentaires. */
export const ELEMENT_ORDER = ['fire', 'water', 'earth', 'light', 'dark'] as const;

/** Couleur de texte par élément (tokens sémantiques, pas de couleur en dur). */
export const ELEMENT_TEXT: Record<string, string> = {
  fire: 'text-fire',
  water: 'text-water',
  earth: 'text-earth',
  light: 'text-light',
  dark: 'text-dark-elem',
};

/** Anneau (au survol) par élément — teinte l'accent d'une carte élémentaire. */
export const ELEMENT_RING: Record<string, string> = {
  fire: 'hover:ring-fire',
  water: 'hover:ring-water',
  earth: 'hover:ring-earth',
  light: 'hover:ring-light',
  dark: 'hover:ring-dark-elem',
};

/** Pastille (bg+texte) par type de chaîne. */
export const CHAIN_PILL: Record<string, string> = {
  start: 'bg-chain-start/15 text-chain-start',
  join: 'bg-chain-join/15 text-chain-join',
  finish: 'bg-chain-finish/15 text-chain-finish',
};

/** Pastille (bg+texte) par rôle curé. */
export const ROLE_PILL: Record<string, string> = {
  dps: 'bg-role-dps/15 text-role-dps',
  support: 'bg-role-support/15 text-role-support',
  sustain: 'bg-role-sustain/15 text-role-sustain',
};

/** Badge plein par rôle (header de fiche, apparence V2). */
export const ROLE_BG: Record<string, string> = {
  dps: 'bg-role-dps/70',
  support: 'bg-role-support/70',
  sustain: 'bg-role-sustain/70',
};
