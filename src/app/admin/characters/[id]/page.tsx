import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CharacterCuratedEditor } from '@/components/admin/CharacterCuratedEditor';
import { getCharacter } from '@/lib/data/characters';
import { getCharacterCurated } from '@/lib/data/curated';

export default async function AdminCharacterEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const char = getCharacter(id);
  if (!char) notFound();
  const curated = getCharacterCurated(id);

  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin/characters" className="text-content-subtle hover:text-content text-sm">
          ← Personnages
        </Link>
        <h1 className="text-content-strong mt-1 text-xl font-semibold">
          {char.name.en}
          <span className="text-content-subtle ml-2 text-sm font-normal">
            {id} · {char.rarity}★ {char.element}/{char.class}
            {char.originalCharacter ? ' · core-fusion' : ''}
          </span>
        </h1>
      </div>
      <CharacterCuratedEditor id={id} initial={curated} />
    </div>
  );
}
