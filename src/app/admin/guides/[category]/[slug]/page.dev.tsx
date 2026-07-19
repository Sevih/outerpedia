import { notFound } from 'next/navigation';
import { characterDisplayName, getAllCharacters } from '@/lib/data/characters';
import { getGuide } from '@/lib/data/guides';
import { listGroups } from '@/lib/data/encounters';
import { buildInlineRefs } from '@/lib/admin/inline-refs';
import { loadGuideDraft } from '@/lib/admin/guide-store';
import { GuideEditor } from '@/components/admin/GuideEditor';

export const dynamic = 'force-dynamic';

export default async function GuideEditPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const guide = getGuide(category, slug);
  if (!guide) notFound();

  // Pilote : seul joint-challenge est câblé sur l'éditeur unifié. Les autres
  // catégories de la famille (special-request, irregular…) suivront.
  if (category !== 'joint-challenge') {
    return (
      <p className="text-content-muted text-sm">
        La catégorie « {category} » n’est pas encore éditable (pilote joint-challenge).
      </p>
    );
  }

  const draft = loadGuideDraft(category, slug);
  const charOptions = getAllCharacters().map((c) => ({
    id: c.id,
    name: characterDisplayName(c),
    element: c.element,
    class: c.class,
    rarity: c.rarity,
  }));
  const groupOptions = listGroups('en');

  return (
    <div className="space-y-4">
      <h1 className="text-content-strong text-xl font-semibold">
        {guide.title.en} <span className="text-content-subtle text-sm">· joint-challenge</span>
      </h1>
      <GuideEditor
        category={category}
        slug={slug}
        initial={draft}
        refs={buildInlineRefs()}
        charOptions={charOptions}
        groupOptions={groupOptions}
      />
    </div>
  );
}
