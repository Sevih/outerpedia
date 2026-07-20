'use client';

/**
 * Éditeur des ALIAS DE RECHERCHE d'un perso (admin, dev). Liste de chaînes libres
 * (fautes courantes, abréviations, anciens noms) ajoutées au champ recherche des
 * browsers de perso. Saisie en chips : Entrée ou virgule pour ajouter, ✕ pour
 * retirer. `baseTerms` = ce qui est DÉJÀ cherchable (noms/surnoms/id) — affiché en
 * repère pour éviter les alias redondants.
 *
 * NB : ce n'est PAS le nom court d'affichage (cf. tool « Short names ») ; ici on
 * n'affiche rien, on élargit seulement la recherche.
 */
import { useState } from 'react';
import { postJson } from '@/lib/admin/post-json';

const btn =
  'rounded-md border border-line bg-surface-base px-3 py-1.5 text-sm hover:border-accent disabled:opacity-50';
const input =
  'w-full rounded-md border border-line bg-surface-base px-2 py-1 text-sm focus:border-accent focus:outline-none';

export function SearchAliasEditor({
  id,
  initial,
  baseTerms,
}: {
  id: string;
  initial: string[];
  baseTerms: string[];
}) {
  const [aliases, setAliases] = useState<string[]>(initial);
  const [draft, setDraft] = useState('');
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const knownBase = new Set(baseTerms.map((t) => t.toLowerCase()));
  const has = (v: string) => aliases.some((a) => a.toLowerCase() === v.toLowerCase());

  const add = (raw: string) => {
    const v = raw.trim();
    if (!v || has(v)) return;
    setAliases((list) => [...list, v]);
    setState('idle');
  };
  const remove = (i: number) => {
    setAliases((list) => list.filter((_, j) => j !== i));
    setState('idle');
  };

  async function save() {
    setState('saving');
    setError(null);
    try {
      await postJson(`/api/admin/curated/search-aliases/${id}`, aliases);
      setState('saved');
    } catch (e) {
      setState('error');
      setError((e as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-content-subtle mb-1 text-xs uppercase">Already searchable</p>
        <div className="flex flex-wrap gap-1.5">
          {baseTerms.length ? (
            baseTerms.map((t) => (
              <span
                key={t}
                className="border-line-subtle text-content-subtle rounded border px-1.5 py-0.5 text-xs"
              >
                {t}
              </span>
            ))
          ) : (
            <span className="text-content-subtle text-xs">—</span>
          )}
        </div>
      </div>

      <div>
        <p className="text-content-subtle mb-1 text-xs uppercase">
          Search aliases ({aliases.length})
        </p>
        <div className="border-line bg-surface-base flex flex-wrap items-center gap-1.5 rounded-md border p-2">
          {aliases.map((a, i) => {
            const redundant = knownBase.has(a.toLowerCase());
            return (
              <span
                key={`${a}-${i}`}
                title={redundant ? 'Already searchable without this alias' : undefined}
                className={`flex items-center gap-1 rounded px-2 py-0.5 text-sm ${redundant ? 'bg-warn/15 text-warn' : 'bg-accent/15 text-accent'}`}
              >
                {a}
                <button
                  type="button"
                  className="hover:text-content-strong leading-none"
                  title="Remove"
                  onClick={() => remove(i)}
                >
                  ✕
                </button>
              </span>
            );
          })}
          <input
            className={`${input} h-7 w-40 border-none focus:outline-none`}
            placeholder="+ alias (Enter / comma)…"
            value={draft}
            onChange={(e) => {
              const v = e.target.value;
              // Virgule = séparateur → on ajoute le morceau avant la virgule.
              if (v.includes(',')) {
                v.split(',').forEach(add);
                setDraft('');
              } else {
                setDraft(v);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                add(draft);
                setDraft('');
              } else if (e.key === 'Backspace' && !draft && aliases.length) {
                remove(aliases.length - 1);
              }
            }}
          />
        </div>
        <p className="text-content-subtle mt-1 text-[11px]">
          A <span className="text-warn">yellow</span> alias is already covered by the name/nickname
          — usually not needed.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button type="button" className={btn} onClick={save} disabled={state === 'saving'}>
          {state === 'saving' ? 'Saving…' : 'Save'}
        </button>
        {state === 'saved' && <span className="text-success text-sm">✓ saved</span>}
        {state === 'error' && <span className="text-danger text-sm">{error}</span>}
      </div>
    </div>
  );
}
