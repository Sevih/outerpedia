import { notFound } from 'next/navigation';
import { characterDisplayName, getCharacter } from '@/lib/data/characters';
import { loadShortNames } from '@/lib/data/short-names';
import { ShortNameEditor } from '@/components/admin/ShortNameEditor';

export const dynamic = 'force-dynamic';

export default async function ToolShortNamesCharacter({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const char = getCharacter(id);
  if (!char) notFound();

  const initial = loadShortNames()[id] ?? {};

  return (
    <div className="space-y-4">
      <h1 className="text-content-strong text-xl font-semibold">
        {characterDisplayName(char)}{' '}
        <span className="text-content-subtle text-sm">· short name</span>
      </h1>
      <ShortNameEditor id={id} initial={initial} fullNames={char.name} />
    </div>
  );
}
