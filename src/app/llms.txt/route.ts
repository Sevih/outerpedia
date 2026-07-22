import { getBaseUrl } from '@/lib/seo';
import { characterDisplayName, getCharacterListItems, slugForId } from '@/lib/data/characters';
import { GUIDE_CATEGORIES } from '@/lib/data/guide-categories';
import { listGuides } from '@/lib/data/guides';
import { allEquipmentEntries } from '@/lib/data/equipment-detail';

/**
 * `/llms.txt` — convention émergente : un index Markdown à destination des
 * moteurs génératifs (résumé du site + liens vers les pages clés). Généré depuis
 * nos données, statique au build.
 */
export const dynamic = 'force-static';

export function GET(): Response {
  const base = getBaseUrl();
  const chars = getCharacterListItems();

  const body = [
    '# Outerpedia',
    '',
    '> Wiki communautaire et base de données du jeu mobile Outerplane (Major9) :',
    '> personnages, compétences, équipement, tier lists et guides.',
    '',
    '## Personnages',
    ...chars.map((c) => `- [${characterDisplayName(c)}](${base}/characters/${slugForId(c.id)})`),
    '',
    '## Équipement',
    ...allEquipmentEntries().map((e) => `- [${e.name}](${base}/equipment/${e.slug})`),
    '',
    '## Guides',
    ...listGuides()
      .filter((g) => !g.hidden)
      .map(
        (g) =>
          `- [${GUIDE_CATEGORIES[g.category].label.en} — ${g.title.en}](${base}/guides/${g.category}/${g.slug})`,
      ),
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
