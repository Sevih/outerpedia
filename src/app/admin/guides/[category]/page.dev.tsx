import { guideCategoryLabel } from '@/lib/admin/guide-nav';

export const dynamic = 'force-dynamic';

/** Accueil d'un type de guide : la liste est à gauche (layout de catégorie). */
export default async function GuideCategoryIndex({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  return (
    <div className="space-y-2">
      <h1 className="text-content-strong text-xl font-semibold">
        {guideCategoryLabel(category)}
        <span className="text-content-subtle ml-2 text-sm font-normal">· {category}</span>
      </h1>
      <p className="text-content-muted text-sm">Pick a guide on the left to edit it.</p>
    </div>
  );
}
