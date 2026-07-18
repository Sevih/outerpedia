import Link from 'next/link';
import type { Route } from 'next';
import { getEEViews, loadEquipmentEditorial } from '@/lib/data/equipment';
import { getCharacter, characterDisplayName } from '@/lib/data/characters';
import { img } from '@/lib/images';
import { lRec } from '@/lib/i18n/localize';

export const dynamic = 'force-dynamic';

/* eslint-disable @next/next/no-img-element -- assets R2/rangs, admin dev */

/** Catalogue éditorial des EE : priorité (rank/rank10) + câblage des chips. */
export default function EditorEeCatalog() {
  const eeCur = loadEquipmentEditorial().ee;
  const views = getEEViews()
    .map((v) => {
      const owner = getCharacter(v.characterId);
      const entry = eeCur[v.characterId];
      return {
        ...v,
        ownerName: owner ? characterDisplayName(owner) : v.characterId,
        // Curé = TOUTE curation posée (rang OU câblage de chips), pas seulement le rang.
        curated: Boolean(entry && Object.keys(entry).length > 0),
      };
    })
    .sort((a, b) => a.ownerName.localeCompare(b.ownerName));
  const done = views.filter((v) => v.curated).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-content-strong text-xl font-semibold">Editor · EE</h1>
        <p className="text-content-muted text-sm">
          {views.length} EE · {done} curés ·{' '}
          <Link
            href={'/admin/extractor/ee' as Route}
            className="text-content-subtle hover:underline"
          >
            contrôle extraction (Extractor) →
          </Link>
        </p>
      </div>

      <section className="border-line-subtle bg-surface-raised overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="text-content-subtle text-left text-xs uppercase">
            <tr className="border-line-subtle border-b">
              <th className="px-3 py-2 font-medium">EE</th>
              <th className="px-3 py-2 text-center font-medium">Curé</th>
              <th className="px-3 py-2 font-medium">Déblocage</th>
              <th className="px-3 py-2 font-medium">+10</th>
            </tr>
          </thead>
          <tbody>
            {views.map((v) => (
              <tr key={v.itemId} className="border-line-subtle hover:bg-surface-base border-t">
                <td className="px-3 py-1.5">
                  <Link
                    href={`/admin/editor/ee/${v.characterId}` as Route}
                    className="flex items-center gap-2"
                  >
                    <img
                      src={img.ee(v.characterId)}
                      alt=""
                      className="h-9 w-9 rounded object-cover"
                    />
                    <div className="min-w-0">
                      <div className="text-content-strong hover:text-accent font-medium">
                        {lRec(v.name, 'en') || v.name.en}
                      </div>
                      <div className="text-content-subtle text-xs">
                        {v.ownerName} · <span className="font-mono">{v.characterId}</span>
                      </div>
                    </div>
                  </Link>
                </td>
                <td className="px-3 py-1.5 text-center">
                  {v.curated ? (
                    <span className="text-success" title="Curé">
                      ✓
                    </span>
                  ) : (
                    <span className="text-content-subtle" title="Non curé">
                      —
                    </span>
                  )}
                </td>
                <td className="px-3 py-1.5">
                  {v.rank ? (
                    <img src={img.rank(v.rank)} alt={v.rank} className="h-6 w-auto" />
                  ) : (
                    <span className="text-content-subtle">—</span>
                  )}
                </td>
                <td className="px-3 py-1.5">
                  {v.rank10 ? (
                    <img src={img.rank(v.rank10)} alt={v.rank10} className="h-6 w-auto" />
                  ) : (
                    <span className="text-content-subtle">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
