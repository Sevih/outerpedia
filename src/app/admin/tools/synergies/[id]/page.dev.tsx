import { notFound } from 'next/navigation';
import {
  characterDisplayName,
  getAllCharacters,
  getCharacter,
  slugForId,
} from '@/lib/data/characters';
import { getCharacterCurated } from '@/lib/data/curated';
import { EditorialEditor, type HeroView } from '@/components/admin/EditorialEditor';
import { buildInlineRefs } from '@/lib/admin/inline-refs';

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
  const chars = getAllCharacters();
  const charNames = Object.fromEntries(chars.map((c) => [c.id, characterDisplayName(c)]));
  // Portraits des partenaires (résolus serveur — rendu façon SynergiesSection).
  const heroViews: Record<string, HeroView> = Object.fromEntries(
    chars.map((c) => {
      const slug = slugForId(c.id);
      return [
        c.id,
        {
          id: c.id,
          name: characterDisplayName(c),
          element: c.element,
          classType: c.class,
          rarity: c.rarity,
          href: slug ? `/characters/${slug}` : undefined,
        },
      ];
    }),
  );

  return (
    <div className="space-y-4">
      <h1 className="text-content-strong text-xl font-semibold">
        {characterDisplayName(char)}{' '}
        <span className="text-content-subtle text-sm">· synergies</span>
      </h1>
      <EditorialEditor
        id={id}
        curated={curated}
        charNames={charNames}
        heroViews={heroViews}
        refs={buildInlineRefs()}
        show="synergies"
      />
    </div>
  );
}
