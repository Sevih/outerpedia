/**
 * Résolution d'items du CATALOGUE pour les blocs bannière — même source servie
 * que le tag `{I-I/…}` de parse-text (items.json, curation bakée), mais par
 * id OU par nom EN, avec échec BRUYANT : une référence morte casse le build
 * SSG, pas de chip fantôme en prod.
 */
import type { CatalogEntry, LangDict } from '@contracts';
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { img } from '@/lib/images';
import type { InlineItem } from '@/components/inline/ItemInline';
import itemsData from '@data/generated/items.json';

const ITEMS = itemsData as unknown as Record<string, CatalogEntry>;

function toChip(
  entry: Pick<CatalogEntry, 'name' | 'desc' | 'icon' | 'grade'>,
  lang: Lang,
): InlineItem {
  const desc = (lRec(entry.desc as LangDict | undefined, lang) || entry.desc?.en || '').replace(
    /\\n/g,
    '\n',
  );
  return {
    name: lRec(entry.name, lang) || entry.name.en,
    // Icône absente (monnaie sans sprite résolu) : chaîne vide — ItemInline ne
    // rend alors que le cadre, au lieu d'un GET /images/items/.webp en 404.
    iconSrc: entry.icon ? img.item(entry.icon) : '',
    grade: entry.grade,
    ...(desc ? { desc } : {}),
  };
}

/** Item par id de catalogue (id numérique, `SYS_ASSET_*`, création curée…). */
export function itemChipById(id: string, lang: Lang): InlineItem {
  const entry = ITEMS[id];
  if (!entry) throw new Error(`banner : item de catalogue inconnu — id « ${id} »`);
  return toChip(entry, lang);
}

let byName: Map<string, CatalogEntry> | undefined;

/** Item par NOM D'AFFICHAGE EN (la clé du contenu éditorial, comme {I-I/…}). */
export function itemChipByName(name: string, lang: Lang): InlineItem {
  if (!byName) {
    byName = new Map();
    for (const e of Object.values(ITEMS)) {
      if (e.hidden) continue;
      const key = e.name.en?.trim().toLowerCase();
      if (key && !byName.has(key)) byName.set(key, e);
    }
  }
  const entry = byName.get(name.trim().toLowerCase());
  if (!entry) throw new Error(`banner : item de catalogue inconnu — nom « ${name} »`);
  return toChip(entry, lang);
}
