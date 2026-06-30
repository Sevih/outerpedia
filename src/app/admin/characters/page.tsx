import Link from 'next/link';
import type { Route } from 'next';
import { getCharacterListItems } from '@/lib/data/characters';
import { loadCuratedCharacters } from '@/lib/data/curated';

export default function AdminCharactersList() {
  const items = getCharacterListItems();
  const curated = loadCuratedCharacters();

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="text-content-strong text-xl font-semibold">Personnages</h1>
        <span className="text-content-subtle text-sm">{items.length} entités</span>
      </div>

      <div className="border-line-subtle overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-surface-overlay text-content-subtle text-left text-xs uppercase">
            <tr>
              <th className="px-3 py-2 font-medium">Nom</th>
              <th className="px-3 py-2 font-medium">Rareté</th>
              <th className="px-3 py-2 font-medium">Rank</th>
              <th className="px-3 py-2 font-medium">Rôle</th>
              <th className="px-3 py-2 font-medium">Curé</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => {
              const cur = curated[c.id];
              const isCurated = Boolean(cur && Object.keys(cur).length);
              return (
                <tr key={c.id} className="border-line-subtle hover:bg-surface-overlay/50 border-t">
                  <td className="px-3 py-2">
                    <Link
                      href={`/admin/characters/${c.id}` as Route}
                      className="text-content-strong hover:text-accent font-medium"
                    >
                      {c.name.en}
                    </Link>
                    {c.isFusion && (
                      <span className="bg-accent/15 text-accent ml-2 rounded px-1.5 py-0.5 text-xs">
                        fusion
                      </span>
                    )}
                  </td>
                  <td className="text-content-muted px-3 py-2">{c.rarity}★</td>
                  <td className="text-content-muted px-3 py-2">{cur?.rank ?? '—'}</td>
                  <td className="text-content-muted px-3 py-2">{cur?.role ?? '—'}</td>
                  <td className="px-3 py-2">
                    {isCurated ? (
                      <span className="text-success">✓</span>
                    ) : (
                      <span className="text-content-subtle">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
