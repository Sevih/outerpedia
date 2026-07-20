import { getT, type TranslationKey } from '@/i18n';
import type { Lang } from '@/lib/i18n/config';
import { getCatalog } from '@/lib/data/items';
import { img } from '@/lib/images';
import {
  ProgressTrackerBrowser,
  type TrackerAssets,
  type TrackerLabels,
} from './ProgressTrackerBrowser';
import { TASK_DEFINITIONS, TASK_TYPES } from './tasks';

/**
 * Progress tracker — wrapper SERVEUR : résout TOUS les libellés (tâches,
 * hiérarchie boutique, réglages) et les items du catalogue référencés par les
 * entrées boutique/atelier (`shopItemKey` = nom EN → nom localisé + sprite).
 * L'état vit intégralement côté client (localStorage via `useStoredState`).
 */

/** Sprites des monnaies affichés en tête de sous-catégorie/onglet boutique. */
const SHOP_CURRENCY_ICONS: Record<string, string> = {
  'progress.shop.general': 'CM_Goods_Gold',
  'progress.shop.star-memory': 'TI_Item_Memory_Of_Star',
  'progress.shop.friendship-point': 'TI_Item_FriendPoint',
  'progress.shop.arena-shop': 'TI_Item_PVP_Medal',
  'progress.shop.joint-challenge': 'TI_Item_BossEvent_Coin_01',
  'progress.shop.guild-shop': 'CM_Goods_Guild_Coin',
  'progress.shop.world-boss': 'TI_Item_World_Boss',
  'progress.shop.adventure-license': 'TI_Licence',
  'progress.shop.survey-hub': 'TI_Item_Research_Point',
};

export default async function ProgressTracker({ lang }: { lang: Lang }) {
  const t = await getT(lang);
  const catalog = Object.values(getCatalog());

  const tasks: Record<string, string> = {};
  const shopKeys: Record<string, string> = {};
  const items: TrackerAssets['items'] = {};

  for (const type of TASK_TYPES) {
    for (const def of Object.values(TASK_DEFINITIONS[type])) {
      if (!def.shopItemKey) tasks[def.id] = t(`progress.task.${def.id}` as TranslationKey);
      for (const key of [def.shopCategory, def.shopSubcategory, def.shopTab]) {
        if (key && !shopKeys[key]) shopKeys[key] = t(key as TranslationKey);
      }
      if (def.shopItemKey && !items[def.shopItemKey]) {
        const entry = catalog.find((e) => e.name.en === def.shopItemKey);
        items[def.shopItemKey] = entry
          ? {
              name: (entry.name as Record<string, string>)[lang] ?? entry.name.en,
              icon: img.item(entry.icon),
            }
          : { name: def.shopItemKey, icon: null };
      }
    }
  }

  const labels: TrackerLabels = {
    tasks,
    shopKeys,
    cycles: {
      daily: t('progress.daily'),
      weekly: t('progress.weekly'),
      monthly: t('progress.monthly'),
    },
    cycleTasks: {
      daily: t('progress.dailyTasks'),
      weekly: t('progress.weeklyTasks'),
      monthly: t('progress.monthlyTasks'),
    },
    categories: {
      task: t('progress.category.tasks'),
      recurring: t('progress.category.recurring'),
      craft: t('progress.category.craft'),
      shop: t('progress.category.shop'),
    },
    settingsTabs: {
      display: t('progress.settings.tab.display'),
      game: t('progress.settings.tab.game'),
      content: t('progress.settings.tab.content'),
      craft: t('progress.settings.tab.craft'),
      shop: t('progress.settings.tab.shop'),
    },
    settings: t('progress.settings'),
    settingsTitle: t('progress.settingsTitle'),
    exportImport: t('progress.exportImport'),
    resetAll: t('progress.resetAll'),
    resetConfirm: t('progress.resetConfirm'),
    resetsIn: t('progress.resetsIn'),
    export: t('progress.export'),
    import: t('progress.import'),
    copyToClipboard: t('progress.copyToClipboard'),
    exportDesc: t('progress.exportDesc'),
    pasteHere: t('progress.pasteHere'),
    importButton: t('progress.importButton'),
    importError: t('progress.importError'),
    close: t('progress.close'),
    noTasks: t('progress.noTasks'),
    optionalContentDesc: t('progress.optionalContentDesc'),
    preciseCraft: t('progress.preciseCraft'),
    preciseCraftItem: t('progress.preciseCraftItem'),
    preciseCraftTimerDesc: t('progress.preciseCraftTimerDesc'),
    daysRemaining: t('progress.daysRemaining'),
    availableIn: t('progress.availableIn'),
    availableNow: t('progress.availableNow'),
    vhtFloors: t('progress.vht.floors'),
    vhtNextUnlock: t('progress.vht.nextUnlock'),
    adventureLicense: t('progress.adventureLicense'),
    adventureLicenseDesc: t('progress.adventureLicenseDesc'),
    adventureLicenseCombats: {
      2: t('progress.adventureLicenseCombats2'),
      3: t('progress.adventureLicenseCombats3'),
      4: t('progress.adventureLicenseCombats4'),
    },
    terminusSupportPack: t('progress.terminusSupportPack'),
    terminusSupportPackDesc: t('progress.terminusSupportPackDesc'),
    veronicaPremiumPack: t('progress.veronicaPremiumPack'),
    veronicaPremiumPackDesc: t('progress.veronicaPremiumPackDesc'),
    elementalTowerCompleted: t('progress.elementalTowerCompleted'),
    elementalTowerCompletedDesc: t('progress.elementalTowerCompletedDesc'),
    displayMode: t('progress.displayMode'),
    displayModeDesc: t('progress.displayModeDesc'),
    displayModeTabs: t('progress.displayModeTabs'),
    displayModeSinglePage: t('progress.displayModeSinglePage'),
    completeAll: t('progress.completeAll'),
    sweepAll: t('progress.sweepAll'),
    craftSettingsDesc: t('progress.craftSettingsDesc'),
    shopSettingsDesc: t('progress.shopSettingsDesc'),
    dangerZone: t('progress.dangerZone'),
    clearData: t('progress.clearData'),
    clearDataDesc: t('progress.clearDataDesc'),
    clearDataConfirm: t('progress.clearDataConfirm'),
    daysShort: t('progress.daysShort'),
  };

  const assets: TrackerAssets = {
    navSettings: img.navIcon('CM_Agit_Facility'),
    navExport: img.navIcon('CM_Agit_Retention'),
    navReset: img.navIcon('CM_Guild_Management'),
    navCraft: img.navIcon('CM_Agit_Crafting'),
    shopIcons: Object.fromEntries(
      Object.entries(SHOP_CURRENCY_ICONS).map(([key, icon]) => [key, img.item(icon)]),
    ),
    items,
  };

  return <ProgressTrackerBrowser labels={labels} assets={assets} />;
}
