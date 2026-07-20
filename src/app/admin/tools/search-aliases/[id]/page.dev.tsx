import { notFound } from 'next/navigation';
import { characterDisplayName, characterSearchNames, getCharacter } from '@/lib/data/characters';
import { loadSearchAliases } from '@/lib/data/search-aliases';
import { SearchAliasEditor } from '@/components/admin/SearchAliasEditor';

export const dynamic = 'force-dynamic';

export default async function ToolSearchAliasesCharacter({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const char = getCharacter(id);
  if (!char) notFound();

  const aliases = loadSearchAliases()[id] ?? [];
  // Termes DÉJÀ cherchables (noms/surnoms/id/slug), hors alias, pour repère.
  const baseTerms = characterSearchNames(char);

  return (
    <div className="space-y-4">
      <h1 className="text-content-strong text-xl font-semibold">
        {characterDisplayName(char)}{' '}
        <span className="text-content-subtle text-sm">· search aliases</span>
      </h1>
      <SearchAliasEditor id={id} initial={aliases} baseTerms={baseTerms} />
    </div>
  );
}
