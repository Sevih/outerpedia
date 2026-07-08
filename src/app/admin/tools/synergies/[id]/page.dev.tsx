import { notFound } from 'next/navigation';
import { characterDisplayName, getAllCharacters, getCharacter } from '@/lib/data/characters';
import { getCharacterCurated } from '@/lib/data/curated';
import { EditorialEditor } from '@/components/admin/EditorialEditor';

export const dynamic = 'force-dynamic';

export default async function ToolSynergiesCharacter({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const char = getCharacter(id);
  if (!char) notFound();
  const curated = getCharacterCurated(id);
  const charNames = Object.fromEntries(
    getAllCharacters().map((c) => [c.id, characterDisplayName(c)]),
  );

  return (
    <div className="space-y-4">
      <h1 className="text-content-strong text-xl font-semibold">
        {characterDisplayName(char)}{' '}
        <span className="text-content-subtle text-sm">· synergies</span>
      </h1>
      <EditorialEditor id={id} curated={curated} charNames={charNames} show="synergies" />
    </div>
  );
}
