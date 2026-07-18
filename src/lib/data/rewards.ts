/**
 * RÉCOMPENSES DE DONJON — la résolution `DungeonRef.reward[Win|Lose]` →
 * glossaire `rewardTables` → catalogue d'items / familles d'équipement.
 *
 * La V2 affichait le butin d'un boss via un champ `boss` curé À LA MAIN sur
 * chaque équipement, et la vue de catégorie irregular portait carrément une
 * table slug→loot en dur dans le composant. Ici RIEN n'est écrit : le donjon
 * référence sa table, la table liste ses lignes, et chaque ligne se résout
 * dans la donnée qui la connaît — monnaies (glossaire `assetTypes` → catalogue
 * goods), items (catalogue), équipement (familles, avec lien détail).
 *
 * STRICT : une table absente ou une ligne irrésoluble JETTE. Un butin qui
 * manque à l'écran sans un bruit est exactement le bug qu'on remplace.
 */
import glossariesData from '@data/generated/glossaries.json';
import type { Glossaries, RewardEntry, RewardTable } from '@contracts';
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { img } from '@/lib/images';
import { localePath } from '@/lib/navigation';
import { STAT_ICON, statName } from '@/lib/stats';
import { getCatalogEntry } from '@/lib/data/items';
import {
  accessoryMainStats,
  armorPieceSet,
  armorPieceSetId,
  gearById as gearPieceById,
  gearPassiveRefs,
  gearVariant,
  getAmuletFamilies,
  getTalismanFamilies,
  getWeaponFamilies,
  passiveTextAt,
  setEffectText,
  type GearFamily,
} from '@/lib/data/equipment';
import {
  resolveLootGear,
  resolveLootSet,
  type ResolvedGearItem,
  type ResolvedSetEffect,
  type ResolvedSetPiece,
} from '@/lib/data/gear-reco';

const G = glossariesData as unknown as Glossaries;

/**
 * La monnaie du champ `credit` d'une table (`RewardTemplet.CreditMin/Max`) :
 * l'or. Clé stable du catalogue goods — le même sujet que `img.gold()`, mais
 * avec le nom et la description OFFICIELS du jeu pour le tooltip.
 */
const GOLD_KEY = 'SYS_ASSET_GOLD';

export function getRewardTable(id: string): RewardTable {
  const table = G.rewardTables?.[id];
  if (!table) {
    throw new Error(`rewards : table « ${id} » absente du glossaire rewardTables.`);
  }
  return table;
}

/** Une ligne de butin RÉSOLUE, prête à afficher. */
export interface ResolvedReward {
  /** Nom localisé. */
  name: string;
  /** URL complète de l'icône — '' quand la monnaie n'a pas d'icône extraite. */
  iconSrc: string;
  /** Grade slug (cadre de rareté). */
  grade: string;
  /** Description officielle (tooltip). */
  desc?: string;
  /** Lien détail (équipement). */
  href?: string;
  min: number;
  max: number;
  /** Tirage aléatoire dans le groupe (pondération côté serveur — pas de taux). */
  random?: boolean;
}

// Index id d'item → famille d'équipement. Les tables de récompense référencent
// les VARIANTES (781…785 : une par classe), les familles les regroupent — on
// résout la variante vers sa famille pour hériter nom/icône/grade/lien détail.
let gearIndex: Map<string, GearFamily> | null = null;
function gearFamilyById(id: string): GearFamily | undefined {
  if (!gearIndex) {
    gearIndex = new Map();
    for (const f of [...getWeaponFamilies(), ...getAmuletFamilies(), ...getTalismanFamilies()]) {
      for (const memberId of f.ids) {
        if (!gearIndex.has(memberId)) gearIndex.set(memberId, f);
      }
    }
  }
  return gearIndex.get(id);
}

/** Résout une entrée du catalogue (item ou monnaie) en ligne affichable. */
function fromCatalog(
  key: string,
  lang: Lang,
  base: Pick<ResolvedReward, 'min' | 'max' | 'random'>,
  at: string,
): ResolvedReward {
  const entry = getCatalogEntry(key);
  if (!entry) throw new Error(`rewards : « ${key} » absent du catalogue d'items (${at}).`);
  const desc = (lRec(entry.desc, lang) || entry.desc?.en || '').replace(/\\n/g, '\n');
  return {
    name: lRec(entry.name, lang) || entry.name.en,
    iconSrc: entry.icon ? img.item(entry.icon) : '',
    grade: entry.grade,
    ...(desc ? { desc } : {}),
    ...base,
  };
}

/** Résout UNE ligne de table (`kind` + id opaque) dans la donnée qui la connaît. */
export function resolveRewardEntry(e: RewardEntry, lang: Lang): ResolvedReward {
  const base = { min: e.min, max: e.max, ...(e.random ? { random: true } : {}) };

  if (e.kind === 'asset') {
    // Monnaie par id numérique d'enum — le glossaire `assetTypes` (lu du
    // client) donne la clé du catalogue goods. Pas de mapping = donnée
    // manquante, et ça se dit fort.
    const key = G.assetTypes?.[e.id];
    if (!key) {
      throw new Error(
        `rewards : monnaie « ${e.id} » sans correspondance dans glossaries.assetTypes.`,
      );
    }
    return fromCatalog(key, lang, base, `asset ${e.id}`);
  }

  if (e.kind === 'item') {
    // Un « item » de table est soit un item du catalogue (coffres,
    // matériaux…), soit une VARIANTE d'équipement (les tables droppent la
    // déclinaison par classe).
    if (getCatalogEntry(e.id)) return fromCatalog(e.id, lang, base, `item ${e.id}`);
    const f = gearFamilyById(e.id);
    if (f) {
      return {
        name: lRec(f.name, lang) || f.name.en,
        iconSrc: img.equipment(f.icon),
        grade: f.grade,
        href: localePath(lang, `/equipment/${f.slug}`),
        ...base,
      };
    }
    // Hors familles, une PIÈCE de slot (le Special Request droppe des armures
    // magic par pièce — casque, plastron, gants, bottes — qui n'ont ni famille
    // ni page détail : identité seule, sans lien).
    const piece = gearPieceById(e.id);
    if (piece) {
      return {
        name: lRec(piece.name, lang) || piece.name.en,
        iconSrc: img.equipment(piece.icon),
        grade: piece.grade,
        ...base,
      };
    }
    throw new Error(`rewards : item « ${e.id} » introuvable (catalogue et équipement).`);
  }

  // character/piece/ticket/costume… : aucun mode porté n'en droppe encore —
  // le jour venu, ça se câble ici, pas dans un composant.
  throw new Error(`rewards : kind « ${e.kind} » non géré (id ${e.id}).`);
}

/**
 * Une table complète, résolue et ORDONNÉE pour l'affichage : monnaies de tête
 * (crystal/credit), puis lignes garanties, puis le pool aléatoire.
 */
export function resolveRewardTable(id: string, lang: Lang): ResolvedReward[] {
  const table = getRewardTable(id);

  // Champ scalaire qu'on ne sait pas encore montrer : BRUYANT plutôt
  // qu'omis — un butin absent de l'écran sans erreur est le bug d'origine.
  if (table.crystal) {
    throw new Error(`rewards : table « ${id} » porte crystal — rendu à câbler.`);
  }

  const out: ResolvedReward[] = [];
  if (table.credit) {
    out.push(
      fromCatalog(
        GOLD_KEY,
        lang,
        { min: table.credit.min, max: table.credit.max },
        `credit de ${id}`,
      ),
    );
  }
  // L'expérience est une monnaie comme une autre : le catalogue goods porte
  // ses noms officiels (« Hero Experience », « Player Experience »).
  if (table.charExp) {
    out.push(
      fromCatalog(
        'SYS_ASSET_CHAR_EXP',
        lang,
        { min: table.charExp, max: table.charExp },
        `charExp de ${id}`,
      ),
    );
  }
  if (table.accountExp) {
    out.push(
      fromCatalog(
        'SYS_ASSET_ACC_EXP',
        lang,
        { min: table.accountExp, max: table.accountExp },
        `accountExp de ${id}`,
      ),
    );
  }
  const entries = table.entries ?? [];
  for (const e of entries.filter((x) => !x.random)) out.push(resolveRewardEntry(e, lang));
  for (const e of entries.filter((x) => x.random)) out.push(resolveRewardEntry(e, lang));
  return out;
}

/** Une pastille de signature de loot : l'icône et son nom (tooltip). */
export interface LootBadge {
  name: string;
  iconSrc: string;
  /**
   * Bonus du set par NOMBRE DE PIÈCES (tooltip) — les deux quand le set a les
   * deux, celui qu'il a sinon (certains sets n'ont que le 2 pièces).
   */
  effects?: Array<{ pieces: 2 | 4; text: string }>;
}

/**
 * La SIGNATURE du pool aléatoire d'une table — ce que le joueur vient y farmer :
 *  - `sets`  : les sets des pièces d'armure du pool (Ecology Study) ;
 *  - `stats` : les mains possibles des accessoires UNIQUES du pool
 *    (Identification). Les armes n'en disent rien (mêmes mains génériques d'un
 *    boss à l'autre), le filler magic/rare non plus — seul l'accessoire unique
 *    distingue le donjon.
 *
 * Tout se DÉRIVE du pool. La V2 portait ces listes en dur, par élément, dans un
 * JSON à part — avec les erreurs du travail à la main : l'icône du set
 * Fortification y était fausse (24 pour 23), un main du pool dark manquait.
 */
export function lootSignature(
  tableId: string,
  lang: Lang,
): { sets: LootBadge[]; stats: LootBadge[] } {
  const sets = new Map<string, LootBadge>();
  const stats = new Map<string, LootBadge>();
  for (const e of getRewardTable(tableId).entries ?? []) {
    if (!e.random || e.kind !== 'item') continue;
    const set = armorPieceSet(e.id);
    if (set) {
      if (!sets.has(set.icon)) {
        sets.set(set.icon, {
          name: lRec(set.name, lang) || set.name.en,
          iconSrc: img.equipment(set.icon),
        });
      }
      continue;
    }
    const acc = accessoryMainStats(e.id);
    if (acc?.grade !== 'unique') continue;
    for (const key of acc.stats) {
      // Une main sans icône de stat (la WG, seule du genre) n'apparaît dans
      // aucun pool d'accessoire — si ça arrivait, on l'omet plutôt que casser.
      const sprite = STAT_ICON[key];
      if (sprite && !stats.has(key)) {
        stats.set(key, { name: statName(key, lang), iconSrc: img.statIcon(sprite) });
      }
    }
  }
  return { sets: [...sets.values()], stats: [...stats.values()] };
}

/** Une pièce de butin LÉGENDAIRE d'un stage, cliquable vers sa page détail. */
export interface StageLootGear {
  name: string;
  iconSrc: string;
  grade: string;
  href: string;
  /** Texte du passif au palier 4 (tooltip). */
  desc?: string;
}

/**
 * Le butin LÉGENDAIRE d'un stage — ce qui vaut la peine d'être farmé, et RIEN
 * d'autre : pas d'or, pas d'exp, pas de filler magic/rare.
 *  - `sets` : les sets dont le pool droppe des pièces d'armure UNIQUES
 *    (Ecology Study — la pièce ne compte pas, son set si) ;
 *  - `gear` : les familles d'armes/accessoires UNIQUES du pool
 *    (Identification — cinq armes et cinq accessoires nommés par échelle).
 * Un stage bas qui ne droppe aucun unique rend deux listes vides : c'est la
 * réponse honnête à « qu'est-ce que je viens farmer ici ? » — rien encore.
 */
export function stageLoot(
  tableId: string,
  lang: Lang,
): { sets: LootBadge[]; gear: StageLootGear[] } {
  const sets = new Map<string, LootBadge>();
  const gear = new Map<string, StageLootGear>();
  for (const e of getRewardTable(tableId).entries ?? []) {
    if (!e.random || e.kind !== 'item') continue;
    const set = armorPieceSet(e.id);
    if (set) {
      if (gearPieceById(e.id)?.grade !== 'unique') continue;
      if (!sets.has(set.icon)) {
        // Les bonus qu'on farme : 2 ET 4 pièces (palier de base) — chacun
        // seulement si le set le porte (certains n'ont que le 2 pièces).
        const tier = set.tiers[0];
        const effects: NonNullable<LootBadge['effects']> = [];
        for (const pieces of [2, 4] as const) {
          const text = setEffectText(tier?.[`${pieces}p`] ?? null, lang);
          if (text) effects.push({ pieces, text });
        }
        sets.set(set.icon, {
          name: lRec(set.name, lang) || set.name.en,
          iconSrc: img.equipment(set.icon),
          ...(effects.length ? { effects } : {}),
        });
      }
      continue;
    }
    const f = gearFamilyById(e.id);
    if (f?.grade === 'unique' && !gear.has(f.slug)) {
      // Le passif au 5e PALIER de breakthrough — le « tier 4 » du vocabulaire
      // joueur (T0..T4), celui que la communauté cite.
      const desc = passiveTextAt(gearPassiveRefs(e.id) ?? [], 5, lang);
      gear.set(f.slug, {
        name: lRec(f.name, lang) || f.name.en,
        iconSrc: img.equipment(f.icon),
        grade: f.grade,
        href: localePath(lang, `/equipment/${f.slug}`),
        ...(desc ? { desc } : {}),
      });
    }
  }
  return { sets: [...sets.values()], gear: [...gear.values()] };
}

/** Une variante d'équipement d'un pool, prête à afficher en vignette. */
export interface LootVariant {
  name: string;
  iconSrc: string;
  /** Grade slug (cadre de rareté `img.slotFrame`). */
  grade: string;
}

/**
 * Le butin SIGNATURE d'une poursuite irregular : la monnaie du mode (entrées
 * `asset` de la table — les cellules Irregular) et les VARIANTES d'équipement
 * du pool aléatoire, par slot et dans l'ordre du pool — une icône PAR CLASSE,
 * comme le jeu les liste. Les coffres et marteaux fixes, identiques d'une
 * poursuite à l'autre, ne distinguent rien : on ne les montre pas.
 *
 * La V2 portait tout ça en dur dans sa vue (noms d'items par slug, familles
 * recomposées en concaténant « [Classe] ») ; ici la table du donjon dit tout.
 */
export function pursuitLoot(
  tableId: string,
  lang: Lang,
): { currencies: ResolvedReward[]; weapons: LootVariant[]; amulets: LootVariant[] } {
  const currencies: ResolvedReward[] = [];
  const weapons: LootVariant[] = [];
  const amulets: LootVariant[] = [];
  for (const e of getRewardTable(tableId).entries ?? []) {
    if (e.kind === 'asset' && !e.random) {
      currencies.push(resolveRewardEntry(e, lang));
      continue;
    }
    if (e.kind !== 'item' || !e.random) continue;
    const v = gearVariant(e.id);
    if (!v) continue;
    const row: LootVariant = {
      name: lRec(v.item.name, lang) || v.item.name.en,
      iconSrc: img.equipment(v.item.icon),
      grade: v.item.grade,
    };
    if (v.slot === 'weapon') weapons.push(row);
    else amulets.push(row);
  }
  return { currencies, weapons, amulets };
}

/**
 * Le POOL d'équipement d'une table, matérialisé pour les MiniCards — le même
 * objet à l'écran que dans un build recommandé de perso (cf. `resolveLootGear`).
 *
 * C'est le DÉTAIL derrière la ligne d'icônes des guides : ce que le donjon
 * droppe vraiment, avec ses mains possibles, ses valeurs max et son passif au
 * palier max. Les deux modes à butin y passent :
 *  - la poursuite irregular droppe des VARIANTES par classe (cinq armes, cinq
 *    amulettes — chacune sa tuile, sa classe et son passif) ;
 *  - le Special Request droppe des familles uniques (Identification) ou des
 *    pièces d'armure, dont on remonte le SET (Ecology Study).
 * Le filler (or, exp, coffres, matériaux) n'en fait pas partie : ce n'est pas
 * de l'équipement, et ce n'est pas ce qu'on vient chercher.
 */
export interface LootDetails {
  weapons: ResolvedGearItem[];
  amulets: ResolvedGearItem[];
  talismans: ResolvedGearItem[];
  /** Sets dont le pool droppe des pièces (tuiles + bonus 2p/4p). */
  sets: Array<{ piece: ResolvedSetPiece; effect: ResolvedSetEffect }>;
}

export function lootDetails(tableId: string, lang: Lang): LootDetails {
  const out: LootDetails = { weapons: [], amulets: [], talismans: [], sets: [] };
  const seenGear = new Set<string>();
  const seenSet = new Set<string>();

  for (const e of getRewardTable(tableId).entries ?? []) {
    // Le pool ALÉATOIRE seul : les lignes garanties d'un donjon sont du
    // consommable (coffres, matériaux), jamais l'équipement qu'on farme.
    if (!e.random || e.kind !== 'item') continue;

    // Une pièce d'armure ne vaut que par son SET (le jeu droppe la pièce, le
    // joueur cherche le bonus) — et seulement si elle est unique, comme
    // `stageLoot` : le filler magic/rare n'apprend rien.
    const setId = armorPieceSetId(e.id);
    if (setId) {
      if (gearPieceById(e.id)?.grade !== 'unique' || seenSet.has(setId)) continue;
      const resolved = resolveLootSet(setId, lang);
      if (resolved) {
        seenSet.add(setId);
        out.sets.push(resolved);
      }
      continue;
    }

    if (seenGear.has(e.id)) continue;
    const item = resolveLootGear(e.id, lang);
    // Grade unique seulement : les pools bas traînent du filler magic/rare que
    // personne ne vient chercher (même règle que `stageLoot`).
    if (!item || item.grade !== 'unique') continue;
    seenGear.add(e.id);
    const slot = gearVariant(e.id)?.slot;
    if (slot === 'weapon') out.weapons.push(item);
    else if (slot === 'amulet') out.amulets.push(item);
    else out.talismans.push(item);
  }
  return out;
}
