import { getT } from '@/i18n';
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { getAllCharacters } from '@/lib/data/characters';
import { loadShortNames } from '@/lib/data/short-names';
import { loadDataJson } from '@/lib/data/disk';
import { monsterIconSrc } from '@/lib/data/monsters';
import type { Monster } from '@contracts';
import { img } from '@/lib/images';
import eeItemsData from '@data/generated/equipment/ee.json';
import { TierListMakerBrowser, type TierItem, type TlmLabels } from './TierListMakerBrowser';

/**
 * Tier List Maker — wrapper SERVEUR : construit les trois pools (personnages +
 * costumes, équipements exclusifs, boss) avec noms LOCALISÉS ICI (le client ne
 * localise rien) et URLs de sprites résolues. L'état vit côté client ; le
 * partage passe par `share-codec` + `/api/tierlist`.
 *
 * Canon d'encodage (compat liens V2) : les entités core-fusion sont EXCLUES du
 * pool perso — la V2 n'en avait pas, les inclure décalerait les positions des
 * liens `?z=` existants (le canon trie par id numérique).
 */

interface EeEntry {
  name: Record<string, string>;
  character: string;
}

/**
 * Pool des boss : monstres `type: 'boss'` RÉFÉRENCÉS par au moins une
 * rencontre, dédupliqués par icône (même règle que la collecte de leurs
 * portraits dans datagen/assets/manifest.ts — garder les deux alignées).
 */
function buildBossItems(lang: Lang): TierItem[] {
  const monsters =
    loadDataJson<Record<string, Monster & { type?: string }>>('generated/monsters.json');
  const encounters = loadDataJson<Record<string, { monsters?: { id: string }[] }>>(
    'generated/encounters.json',
  );
  const referenced = new Set<string>();
  for (const enc of Object.values(encounters))
    for (const mo of enc.monsters ?? []) referenced.add(mo.id);

  const seen = new Set<string>();
  const items: TierItem[] = [];
  for (const [id, m] of Object.entries(monsters)) {
    if (m.type !== 'boss' || !referenced.has(id) || seen.has(m.icon)) continue;
    seen.add(m.icon);
    items.push({
      key: `b${m.icon}`,
      label: lRec(m.name, lang),
      img: monsterIconSrc(m),
      element: m.element,
      cls: m.class,
    });
  }
  return items.sort((a, b) => a.label.localeCompare(b.label));
}

export default async function TierListMaker({ lang }: { lang: Lang }) {
  const t = await getT(lang);
  const shorts = loadShortNames();

  // Personnages (tri par nom localisé), chacun suivi de ses costumes — les 99
  // modèles de costume ont leurs sprites FI_/CT_ sur R2 (collecte `appearances`).
  const characters: TierItem[] = [];
  const bases = getAllCharacters()
    .filter((c) => !c.originalCharacter)
    .map((c) => ({ c, label: lRec(c.name, lang) }))
    .sort((a, b) => a.label.localeCompare(b.label));
  for (const { c, label } of bases) {
    const short = shorts[c.id]?.[lang];
    characters.push({
      key: `c${c.id}`,
      label,
      short,
      img: img.face(c.id),
      card: img.portrait(c.id),
      element: c.element,
      cls: c.class,
      rarity: c.rarity,
      tags: c.tags,
    });
    for (const cos of c.costumes ?? []) {
      if (!cos.model || cos.model === '0' || cos.model === c.id) continue;
      characters.push({
        key: `c${cos.model}`,
        label: lRec(cos.name, lang),
        short: shorts[cos.model]?.[lang],
        img: img.face(cos.model),
        card: img.portrait(cos.model),
        // un costume garde l'élément/classe/rareté du personnage
        element: c.element,
        cls: c.class,
        rarity: c.rarity,
        tags: c.tags,
        isSkin: true,
        baseLabel: label,
        baseShort: short,
      });
    }
  }

  const ee: TierItem[] = Object.values(eeItemsData as Record<string, EeEntry>)
    .map((e) => ({
      key: `e${e.character}`,
      label: lRec(e.name, lang),
      img: img.ee(e.character),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const labels: TlmLabels = {
    tabs: {
      characters: t('tools.tier-list-maker.tab.characters'),
      ee: t('tools.tier-list-maker.tab.ee'),
      bosses: t('tools.tier-list-maker.tab.bosses'),
    },
    tags: {
      limited: t('tools.tier-list-maker.tag.limited'),
      collab: t('tools.tier-list-maker.tag.collab'),
      seasonal: t('tools.tier-list-maker.tag.seasonal'),
      free: t('tools.tier-list-maker.tag.free'),
      premium: t('tools.tier-list-maker.tag.premium'),
    },
    sorts: {
      default: t('tools.tier-list-maker.sort_default'),
      name: t('tools.tier-list-maker.sort_name'),
      rarity: t('tools.tier-list-maker.sort_rarity'),
      element: t('tools.tier-list-maker.sort_element'),
    },
    sizes: {
      s: t('tools.tier-list-maker.size_s'),
      m: t('tools.tier-list-maker.size_m'),
      l: t('tools.tier-list-maker.size_l'),
    },
    search: t('tools.tier-list-maker.search'),
    hint: t('tools.tier-list-maker.hint'),
    titlePlaceholder: t('tools.tier-list-maker.title_placeholder'),
    addRow: t('tools.tier-list-maker.add_row'),
    clearRow: t('tools.tier-list-maker.clear_row'),
    deleteRow: t('tools.tier-list-maker.delete_row'),
    moveUp: t('tools.tier-list-maker.move_up'),
    moveDown: t('tools.tier-list-maker.move_down'),
    dragRow: t('tools.tier-list-maker.drag_row'),
    color: t('tools.tier-list-maker.color'),
    reset: t('tools.tier-list-maker.reset'),
    share: t('tools.tier-list-maker.share'),
    copied: t('tools.tier-list-maker.copied'),
    exportPng: t('tools.tier-list-maker.export'),
    noResults: t('tools.tier-list-maker.no_results'),
    emptyPool: t('tools.tier-list-maker.empty_pool'),
    confirmReset: t('tools.tier-list-maker.confirm_reset'),
    confirmClearRow: t('tools.tier-list-maker.confirm_clear_row'),
    confirmDeleteRow: t('tools.tier-list-maker.confirm_delete_row'),
    settings: t('tools.tier-list-maker.settings'),
    iconSize: t('tools.tier-list-maker.icon_size'),
    showNames: t('tools.tier-list-maker.show_names'),
    showElement: t('tools.tier-list-maker.show_element'),
    showClass: t('tools.tier-list-maker.show_class'),
    showRarity: t('tools.tier-list-maker.show_rarity'),
    showCards: t('tools.tier-list-maker.show_cards'),
    cardSize: t('tools.tier-list-maker.card_size'),
    showCardTags: t('tools.tier-list-maker.show_card_tags'),
    showSkins: t('tools.tier-list-maker.show_skins'),
    showSkinNames: t('tools.tier-list-maker.show_skin_names'),
    skinsOnly: t('tools.tier-list-maker.filter_skins_only'),
    exportJson: t('tools.tier-list-maker.export_json'),
    importJson: t('tools.tier-list-maker.import_json'),
    importError: t('tools.tier-list-maker.import_error'),
    exportBlocked: t('tools.tier-list-maker.export_blocked'),
    sort: t('tools.tier-list-maker.sort'),
  };

  return (
    <TierListMakerBrowser
      characters={characters}
      ee={ee}
      bosses={buildBossItems(lang)}
      labels={labels}
    />
  );
}
