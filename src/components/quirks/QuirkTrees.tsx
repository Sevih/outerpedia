'use client';

/**
 * Navigateur d'arbres de quirks : onglets de catégorie + sélecteur de sous-arbre
 * (élément/classe) → `QuirkTreeView`. Données pré-localisées côté serveur.
 */
import { useMemo, useState } from 'react';
import { QuirkTreeView, frameOf, type LocalTree, type QuirkTreeLabels } from './QuirkTreeView';

export interface LocalCategory {
  key: string;
  label: string;
  trees: { label: string; tree: LocalTree }[];
}

export function QuirkTrees({
  categories,
  materials,
  treeLabels,
}: {
  categories: LocalCategory[];
  materials: Record<string, { name: string; icon: string }>;
  treeLabels: QuirkTreeLabels;
}) {
  const [cat, setCat] = useState(0);
  const [tree, setTree] = useState(0);
  // Cadre commun à TOUS les arbres → même forme de conteneur et même espacement,
  // quel que soit l'arbre (les plus petits sont centrés dedans).
  const frame = useMemo(
    () => frameOf(categories.flatMap((c) => c.trees.map((t) => t.tree))),
    [categories],
  );
  const category = categories[cat] ?? categories[0];
  const idx = Math.min(tree, category.trees.length - 1);
  const current = category.trees[idx];

  const pill = (on: boolean) =>
    `rounded-md border px-3 py-1 text-xs font-semibold transition-colors ${
      on
        ? 'border-ed-sky/40 bg-ed-sky/15 text-ed-sky'
        : 'border-line-subtle text-content-muted hover:text-content'
    }`;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {categories.map((c, i) => (
          <button
            key={c.key}
            type="button"
            aria-pressed={i === cat}
            onClick={() => {
              setCat(i);
              setTree(0);
            }}
            className={pill(i === cat)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {category.trees.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {category.trees.map((t, i) => (
            <button
              key={i}
              type="button"
              aria-pressed={i === idx}
              onClick={() => setTree(i)}
              className={`rounded border px-2.5 py-0.5 text-xs transition-colors ${
                i === idx
                  ? 'border-content/30 text-content-strong bg-surface-overlay'
                  : 'border-line-subtle text-content-subtle hover:text-content'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <QuirkTreeView tree={current.tree} frame={frame} materials={materials} labels={treeLabels} />
    </div>
  );
}
