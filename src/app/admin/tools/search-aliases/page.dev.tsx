import { getCharacterListItems } from '@/lib/data/characters';
import { loadSearchAliases } from '@/lib/data/search-aliases';

export const dynamic = 'force-dynamic';

export default function ToolSearchAliasesIndex() {
  const items = getCharacterListItems();
  const aliases = loadSearchAliases();
  const done = items.filter((c) => aliases[c.id]?.length).length;

  return (
    <div className="space-y-3">
      <h1 className="text-content-strong text-xl font-semibold">Tools · Search aliases</h1>
      <p className="text-content-muted text-sm">
        {done}/{items.length} persos ont des alias de recherche. Choisis un perso à gauche pour
        éditer.
      </p>
      <p className="text-content-subtle text-sm">
        Les alias (fautes courantes, abréviations, anciens noms) s&apos;ajoutent aux termes
        recherchables du perso dans les browsers (liste des persos, tier lists, most-used units). Ce
        n&apos;est PAS le nom court d&apos;affichage (cf. Short names).
      </p>
    </div>
  );
}
