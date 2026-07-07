import { getBaseUrl } from '@/lib/seo';
import { characterDisplayName, getCharacterListItems, slugForId } from '@/lib/data/characters';

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
    '> Wiki communautaire et base de données du jeu mobile Outerplane (VAGAMES) :',
    '> personnages, compétences, équipement, tier lists et guides.',
    '',
    '## Personnages',
    ...chars.map((c) => `- [${characterDisplayName(c)}](${base}/characters/${slugForId(c.id)})`),
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
