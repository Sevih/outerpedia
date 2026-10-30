import { getT, type TranslationKey } from '@/i18n';
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { loadDataJson } from '@/lib/data/disk';
import { monsterIconSrc } from '@/lib/data/monsters';
import type { Monster } from '@contracts';
import { img, CLASS_ORDER, ELEMENT_ORDER } from '@/lib/images';
import { getEquipmentEe } from '@/lib/data/equipment-ee';
import { characterDisplayName, getCharacter } from '@/lib/data/characters';
import { TierListMakerBrowser } from './TierListMakerBrowser';
import { buildCharacterItems } from './character-items';
import type { TierItem, TlmLabels } from './contracts';
import { buildSearchText } from './pool-filter';

/**
 * Tier List Maker — wrapper SERVEUR : construit les trois pools (personnages +
 * costumes, équipements exclusifs, boss) avec noms LOCALISÉS ICI (le client ne
 * localise rien) et URLs de sprites résolues. L'état vit côté client ; le
 * partage passe par `share-codec` + `/api/tierlist`.
 *
 * Canon d'encodage (compat des liens déjà partagés) : les formes Core Fusion
 * sont dans le pool perso (`isFusion`), mais `buildCanon` les range APRÈS tous
 * les autres — les positions des liens `?z=` d'avant leur arrivée ne bougent pas.
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
    const label = lRec(m.name, lang);
    items.push({
      key: `b${m.icon}`,
      label,
      img: monsterIconSrc(m),
      element: m.element,
      cls: m.class,
      search: buildSearchText(label),
    });
  }
  return items.sort((a, b) => a.label.localeCompare(b.label));
}

export default async function TierListMaker({ lang }: { lang: Lang }) {
  const t = await getT(lang);
  const characters = buildCharacterItems(lang);

  const ee: TierItem[] = Object.values<EeEntry>(getEquipmentEe())
    .map((e) => {
      const label = lRec(e.name, lang);
      // Un EE se cherche aussi par le nom complet de son porteur.
      const holder = getCharacter(e.character);
      return {
        key: `e${e.character}`,
        label,
        img: img.ee(e.character),
        search: buildSearchText(label, holder && characterDisplayName(holder, lang)),
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  const labels: TlmLabels = {
    elementNames: Object.fromEntries(
      ELEMENT_ORDER.map((e) => [e, t(`sys.element.${e}` as TranslationKey)]),
    ),
    classNames: Object.fromEntries(
      CLASS_ORDER.map((c) => [c, t(`sys.class.${c}` as TranslationKey)]),
    ),
    tabs: {
      characters: t('tools.tier-list-maker.tab.characters'),
      ee: t('tools.tier-list-maker.tab.ee'),
      bosses: t('tools.tier-list-maker.tab.bosses'),
    },
    tags: {
      festival: t('tools.tier-list-maker.tag.festival'),
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
    clearSearch: t('common.clear'),
    starAria: t('aria.star_rarity'),
    hint: t('tools.tier-list-maker.hint'),
    titlePlaceholder: t('tools.tier-list-maker.title_placeholder'),
    addRow: t('tools.tier-list-maker.add_row'),
    clearRow: t('tools.tier-list-maker.clear_row'),
    deleteRow: t('tools.tier-list-maker.delete_row'),
    moveUp: t('tools.tier-list-maker.move_up'),
    moveDown: t('tools.tier-list-maker.move_down'),
    dragRow: t('tools.tier-list-maker.drag_row'),
    placeInTier: t('tools.tier-list-maker.place_in_tier'),
    placeInPool: t('tools.tier-list-maker.place_in_pool'),
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
