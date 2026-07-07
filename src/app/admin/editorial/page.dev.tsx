import Link from 'next/link';
import type { Route } from 'next';
import { loadCuratedCharacters } from '@/lib/data/curated';

export const dynamic = 'force-dynamic';

export default function AdminEditorialIndex() {
  const curated = loadCuratedCharacters();
  const entries = Object.values(curated);
  const prosCons = entries.filter(
    (e) => e.prosCons?.pros?.length || e.prosCons?.cons?.length,
  ).length;
  const synergies = entries.filter((e) => e.synergies?.length).length;

  return (
    <div className="space-y-3">
      <h1 className="text-content-strong text-xl font-semibold">Éditorial</h1>
      <p className="text-content-muted text-sm">
        Pros/cons et synergies (couche curée) — choisis un perso à gauche. {prosCons} persos avec
        pros/cons, {synergies} avec synergies. Les tags inline sont contrôlés par{' '}
        <Link href={'/admin/tags' as Route} className="text-accent hover:underline">
          /admin/tags
        </Link>
        .
      </p>
    </div>
  );
}
