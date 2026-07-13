import type { Metadata } from 'next';
import { isValidLang, type Lang } from '@/lib/i18n/config';
import { getT } from '@/i18n';
import { lRec } from '@/lib/i18n/localize';
import { createPageMetadata, buildItemListJsonLd, buildUrl } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import { EquipmentBrowser, type BrowserLabels } from '@/components/equipment/EquipmentBrowser';
import type { EERow, EffectLine, GearRow, RowSource, SetRow } from '@/components/equipment/cards';
import {
  getAmuletFamilies,
  slugifyEquipment,
  getEEViews,
  getSetViews,
  getTalismanFamilies,
  getWeaponFamilies,
  passiveEffects,
  resolvePassives,
  type GearFamily,
  type ResolvedSource,
} from '@/lib/data/equipment';
import type { PassiveRef } from '@contracts';
import { characterDisplayName, getCharacter, slugForId } from '@/lib/data/characters';
import { mergeStatusEffects } from '@/lib/data/effects';

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = (isValidLang(raw) ? raw : 'en') as Lang;
  const t = await getT(lang);
  return createPageMetadata({
    lang,
    path: '/equipment',
    title: t('page.equipments.title'),
    description: t('page.equipments.description'),
  });
}

/** Slugs de boutique extraits → libellés localisés (clés equip.source.*). */
function shopLabel(slug: string, t: Awaited<ReturnType<typeof getT>>): string {
  if (slug === 'adventure_license') return t('equip.source.adventure_license');
  if (slug === 'event_shop') return t('equip.source.event_shop');
  return slug;
}

function toRowSource(
  source: ResolvedSource | undefined,
  lang: Lang,
  t: Awaited<ReturnType<typeof getT>>,
): RowSource | undefined {
  if (!source) return undefined;
  const labels = [
    ...source.shops.map((s) => shopLabel(s, t)),
    ...(source.label ? [source.label] : []),
  ];
  return {
    bosses: source.bosses.map((b) => ({
      id: b.id,
      name: lRec(b.name, lang) || b.name.en,
      icon: b.icon,
      element: b.element,
    })),
    label: labels.length ? labels.join(' · ') : undefined,
  };
}

/**
 * Pill + lignes d'effet depuis les paliers de passif, GROUPÉES par niveau
 * (une seule ligne « Lv.10 » portant tous ses textes) :
 *   - gear (arme/amulette) : texte au reforge max, une ligne sans label ;
 *   - talisman : Lv.1, puis Lv.10 = montée en valeurs + effet additionnel ;
 *   - ee : Lv.1, puis Lv.10 (remplace le premier — `IsAdd` de la table).
 */
function passiveView(
  refs: PassiveRef[],
  lang: Lang,
  kind: 'gear' | 'talisman' | 'ee',
): { passive?: GearRow['passive']; effects: EffectLine[] } {
  const tiers = resolvePassives(refs, lang);
  if (!tiers.length) return { effects: [] };
  const t1 = tiers[0];
  const groups = new Map<string, string[]>();
  const add = (label: string, text: string) => {
    const list = groups.get(label) ?? [];
    // Certains 2es paliers reprennent le MÊME template aux mêmes valeurs
    // (simple montée chiffrée déjà affichée) : pas de ligne en double.
    if (!list.includes(text)) list.push(text);
    groups.set(label, list);
  };
  if (kind === 'gear') {
    add('', t1.last ?? t1.first);
  } else if (kind === 'talisman') {
    add('Lv.1', t1.first);
    if (t1.last) add('Lv.10', t1.last);
  } else {
    add('Lv.1', t1.last ?? t1.first);
  }
  for (const t of tiers.slice(1)) add(`Lv.${t.level}`, t.last ?? t.first);
  const effects = [...groups.entries()].map(([label, texts]) => ({
    label: label || undefined,
    texts,
  }));
  return { passive: { name: t1.name, icon: t1.icon }, effects };
}

function toGearRow(
  f: GearFamily,
  lang: Lang,
  kind: 'gear' | 'talisman',
  t: Awaited<ReturnType<typeof getT>>,
): GearRow {
  return {
    id: f.id,
    slug: f.slug,
    name: lRec(f.name, lang) || f.name.en,
    icon: f.icon,
    grade: f.grade,
    stars: f.stars,
    classLimits: f.classLimits,
    mainStats: f.mainStats,
    ...passiveView(f.passives, lang, kind),
    // Familles à passif PAR CLASSE (Briareos/Gorgon) : un bloc par variante.
    ...(f.classPassives
      ? {
          variants: f.classPassives.map((v) => ({
            classLimit: v.classLimit,
            ...passiveView(v.passives, lang, kind),
          })),
        }
      : {}),
    source: toRowSource(f.source, lang, t),
    mode: f.mode,
  };
}

export default async function EquipmentPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const lang = (isValidLang(raw) ? raw : 'en') as Lang;
  const t = await getT(lang);

  const weapons = getWeaponFamilies().map((f) => toGearRow(f, lang, 'gear', t));
  const amulets = getAmuletFamilies().map((f) => toGearRow(f, lang, 'gear', t));
  const talismans = getTalismanFamilies().map((f) => toGearRow(f, lang, 'talisman', t));
  const sets: SetRow[] = getSetViews(lang).map((s) => {
    const last = s.tiers[s.tiers.length - 1];
    return {
      id: s.id,
      slug: s.slug,
      name: lRec(s.name, lang) || s.name.en,
      setIcon: s.icon,
      pieceIcons: Object.values(s.pieceIcons),
      p2: last?.p2 ?? s.tiers[0]?.p2,
      p4: last?.p4 ?? s.tiers[0]?.p4,
      source: toRowSource(s.source, lang, t),
    };
  });
  const ee: EERow[] = getEEViews()
    .map((e): EERow | null => {
      const c = getCharacter(e.characterId);
      if (!c) return null;
      // Chips buff/debuff des passifs (comme les skills), statuts résolus.
      const chipEffects = passiveEffects(e.passives);
      return {
        ...(chipEffects.length
          ? { chips: { effects: chipEffects, statuses: mergeStatusEffects({}, chipEffects, lang) } }
          : {}),
        itemId: e.itemId,
        slug: slugifyEquipment(e.name.en),
        characterId: e.characterId,
        charName: characterDisplayName(c, lang),
        charSlug: slugForId(e.characterId) ?? e.characterId,
        element: c.element,
        classType: c.class,
        name: lRec(e.name, lang) || e.name.en,
        grade: e.grade,
        star: e.star,
        mainStats: e.mainStats,
        effects: passiveView(e.passives, lang, 'ee').effects,
        rank: e.rank,
        rank10: e.rank10,
        trustLevel: e.trustLevel,
      };
    })
    .filter((r): r is EERow => Boolean(r))
    .sort((a, b) => a.charName.localeCompare(b.charName));

  const labels: BrowserLabels = {
    tabs: {
      weapons: t('equip.tab.weapons'),
      amulets: t('equip.tab.accessories'),
      sets: t('equip.tab.sets'),
      talismans: t('equip.tab.talismans'),
      ee: t('equip.tab.ee'),
    },
    search: t('equip.filter.search'),
    class: t('equip.filter.class'),
    element: t('equip.filter.element'),
    source: t('equip.filter.source'),
    mainStat: t('equip.detail.mainstat'),
    unlock: t('equip.ee.unlock'),
    upgrade: t('equip.ee.upgrade'),
  };

  const itemList = buildItemListJsonLd({
    name: t('page.equipments.title'),
    url: buildUrl(lang, '/equipment'),
    itemListOrder: 'Unordered',
    items: [...weapons, ...amulets, ...talismans, ...sets]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((r) => ({ name: r.name, url: buildUrl(lang, `/equipment/${r.slug}`) })),
  });

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6">
      <JsonLd data={itemList} />
      <div>
        <h1 className="text-content-strong text-2xl font-bold">{t('page.equipments.title')}</h1>
        <p className="text-content-muted text-sm">{t('page.equipments.description')}</p>
      </div>
      <EquipmentBrowser
        weapons={weapons}
        amulets={amulets}
        sets={sets}
        talismans={talismans}
        ee={ee}
        labels={labels}
      />
    </div>
  );
}
