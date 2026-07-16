'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import type { Row, TablePage } from '@/lib/admin/gamedata-store';

/**
 * Le lien croisé filtre la table cible sur sa clé primaire (`ID` partout), en
 * égalité STRICTE — en sous-chaîne, `ID=101` ramènerait aussi `1011` et `2101`.
 */
function crossLink(target: string, value: string): Route {
  return `/admin/tools/gamedata/${target}?col=ID&exact=1&q=${encodeURIComponent(value)}` as Route;
}

/**
 * Colonnes de LANGUE masquées du TABLEAU (tables Text*) : seule la colonne
 * anglaise se lit — les autres ne font qu'écraser la largeur. La ligne brute
 * (panneau de droite) garde toutes les langues, et la recherche par colonne
 * aussi (le sélecteur liste les colonnes complètes).
 */
const HIDDEN_LANG_COLUMNS = new Set([
  'Korean',
  'Japanese',
  'China_Simplified',
  'China_Traditional',
]);

/**
 * Grille d'une table brute du jeu : recherche (serveur), pagination, résolution
 * des clés de texte, liens vers les tables référencées, JSON brut d'une ligne.
 *
 * La donnée reste au serveur : chaque changement de filtre refait une requête
 * plutôt que d'embarquer la table (jusqu'à 18 Mo) dans le client.
 */
export function GameDataBrowser({
  name,
  initial,
  query,
}: {
  name: string;
  initial: TablePage;
  /** Filtre initial — non vide quand on arrive par un lien croisé. */
  query: { q: string; col: string; exact: boolean };
}) {
  const [data, setData] = useState(initial);
  const [q, setQ] = useState(query.q);
  const [col, setCol] = useState(query.col);
  // Ne vaut `true` qu'à l'arrivée par un lien croisé : dès que l'utilisateur
  // touche au filtre, on repasse en recherche libre (sous-chaîne).
  const [exact, setExact] = useState(query.exact);
  const [page, setPage] = useState(initial.page);
  const [resolve, setResolve] = useState(true);
  const [hideEmpty, setHideEmpty] = useState(true);
  const [selected, setSelected] = useState<Row | null>(null);
  const [loading, setLoading] = useState(false);

  // La page rendue par le serveur correspond DÉJÀ à l'état initial : on ne
  // refait pas sa requête au montage.
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams({
        q,
        col,
        exact: exact ? '1' : '0',
        page: String(page),
        resolve: resolve ? '1' : '0',
      });
      fetch(`/api/admin/gamedata/${name}?${params}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((d: TablePage) => {
          setData(d);
          setPage(d.page);
          setLoading(false);
        })
        .catch(() => {
          /* requête annulée par la frappe suivante */
        });
    }, 200);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [name, q, col, exact, page, resolve]);

  const columns = (hideEmpty ? data.filled : data.columns).filter(
    (c) => !HIDDEN_LANG_COLUMNS.has(c),
  );
  const pages = Math.max(1, Math.ceil(data.matched / data.pageSize));

  return (
    <div className="flex min-w-0 gap-4">
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            className="border-line bg-surface-base text-content focus:border-accent w-64 rounded-md border px-2 py-1 text-sm focus:outline-none"
            placeholder="Rechercher dans la table…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setExact(false);
              setPage(1);
            }}
          />
          <select
            value={col}
            onChange={(e) => {
              setCol(e.target.value);
              setExact(false);
              setPage(1);
            }}
            className="border-line bg-surface-base text-content max-w-48 rounded-md border px-1 py-1 text-xs"
          >
            <option value="">toutes les colonnes</option>
            {data.columns.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {exact && (
            <button
              type="button"
              onClick={() => setExact(false)}
              title="Repasser en recherche par sous-chaîne"
              className="bg-accent/15 text-accent rounded px-2 py-0.5 text-xs"
            >
              {col} = {q} ×
            </button>
          )}
          <label className="text-content-subtle flex items-center gap-1 text-xs">
            <input
              type="checkbox"
              checked={hideEmpty}
              onChange={(e) => setHideEmpty(e.target.checked)}
            />
            masquer les colonnes vides
          </label>
          <label className="text-content-subtle flex items-center gap-1 text-xs">
            <input
              type="checkbox"
              checked={resolve}
              onChange={(e) => setResolve(e.target.checked)}
            />
            résoudre les textes
          </label>

          <span className="text-content-subtle ml-auto text-xs">
            {loading ? '…' : `${data.matched} ligne(s)`}
            {data.matched !== data.rowCount && ` / ${data.rowCount}`}
          </span>
          <div className="flex items-center gap-1 text-xs">
            <button
              type="button"
              disabled={data.page <= 1}
              onClick={() => setPage(data.page - 1)}
              className="border-line hover:border-accent rounded border px-2 py-0.5 disabled:opacity-30"
            >
              ‹
            </button>
            <span className="text-content-subtle">
              {data.page} / {pages}
            </span>
            <button
              type="button"
              disabled={data.page >= pages}
              onClick={() => setPage(data.page + 1)}
              className="border-line hover:border-accent rounded border px-2 py-0.5 disabled:opacity-30"
            >
              ›
            </button>
          </div>
        </div>

        <div className="border-line-subtle max-h-[calc(100dvh-14rem)] overflow-auto rounded-lg border">
          <table className="w-full text-xs">
            <thead className="bg-surface-overlay text-content-subtle sticky top-0 text-left uppercase">
              <tr>
                {columns.map((c) => (
                  <th key={c} className="px-2 py-1 font-medium whitespace-nowrap">
                    {c}
                    {data.links[c] && (
                      <span className="text-accent ml-1 normal-case" title={`→ ${data.links[c]}`}>
                        ↗
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, i) => (
                <tr
                  key={i}
                  onClick={() => setSelected(row)}
                  className={`border-line-subtle cursor-pointer border-t ${
                    selected === row ? 'bg-surface-overlay' : 'hover:bg-surface-overlay/50'
                  }`}
                >
                  {columns.map((c) => {
                    const v = row[c] ?? '';
                    const text = data.texts[v];
                    const target = v ? data.links[c] : undefined;
                    return (
                      <td key={c} className="px-2 py-1 align-top">
                        {target ? (
                          // Les colonnes `*IDs` portent une LISTE CSV : un lien
                          // par id, sinon on filtrerait la cible sur « 1,2,3 ».
                          <span className="font-mono whitespace-nowrap">
                            {v.split(',').map((id, k) => (
                              <span key={k}>
                                {k > 0 && <span className="text-content-subtle">, </span>}
                                <Link
                                  href={crossLink(target, id.trim())}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-accent hover:underline"
                                >
                                  {id.trim()}
                                </Link>
                              </span>
                            ))}
                          </span>
                        ) : (
                          <span className="text-content font-mono whitespace-nowrap">{v}</span>
                        )}
                        {text && (
                          <span className="text-content-subtle block max-w-64 truncate italic">
                            {text}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {data.rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="text-content-subtle px-2 py-3">
                    Aucune ligne ne correspond.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <aside className="border-line-subtle sticky top-6 flex max-h-[calc(100dvh-7.5rem)] w-80 shrink-0 flex-col self-start overflow-hidden rounded-lg border">
          <div className="border-line-subtle flex items-center justify-between border-b px-3 py-2">
            <span className="text-content-strong text-xs font-medium">Ligne brute</span>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="text-content-subtle hover:text-content text-xs"
            >
              fermer
            </button>
          </div>
          <pre className="text-content min-h-0 flex-1 overflow-auto p-3 font-mono text-xs whitespace-pre-wrap">
            {JSON.stringify(selected, null, 2)}
          </pre>
        </aside>
      )}
    </div>
  );
}
