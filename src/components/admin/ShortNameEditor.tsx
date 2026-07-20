'use client';

/**
 * Éditeur du NOM COURT D'AFFICHAGE d'un perso (admin, dev). Une saisie par langue
 * (en/jp/kr/zh/fr) — texte simple, pas de tag inline. Le nom COMPLET de la langue
 * sert de placeholder (repère) ; laisser vide = pas de nom court → le rendu
 * retombe sur le nom complet. Parité V2 (`name-aliases.json`).
 */
import { useState } from 'react';
import type { LocalizedText } from '@contracts';
import { postJson } from '@/lib/admin/post-json';

const LANGS = ['en', 'jp', 'kr', 'zh', 'fr'] as const;
type L = (typeof LANGS)[number];

const btn =
  'rounded-md border border-line bg-surface-base px-3 py-1.5 text-sm hover:border-accent disabled:opacity-50';
const input =
  'w-full max-w-xs rounded-md border border-line bg-surface-base px-2 py-1 text-sm focus:border-accent focus:outline-none';

export function ShortNameEditor({
  id,
  initial,
  fullNames,
}: {
  id: string;
  initial: LocalizedText;
  fullNames: LocalizedText;
}) {
  const [name, setName] = useState<LocalizedText>(initial);
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const set = (l: L, v: string) => {
    setName((prev) => {
      const next = { ...prev };
      if (v.trim()) next[l] = v;
      else delete next[l];
      return next;
    });
    setState('idle');
  };

  async function save() {
    setState('saving');
    setError(null);
    try {
      await postJson(`/api/admin/curated/short-names/${id}`, name);
      setState('saved');
    } catch (e) {
      setState('error');
      setError((e as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-content-subtle text-sm">
        Short display name per language (e.g. <span className="text-content">D.Stella</span> for{' '}
        <span className="text-content">Demiurge Stella</span>). Leave a language empty to keep its
        full name.
      </p>

      <div className="space-y-2">
        {LANGS.map((l) => (
          <div key={l} className="flex items-center gap-3">
            <span className="text-content-subtle w-8 text-xs uppercase">{l}</span>
            <input
              className={input}
              value={name[l] ?? ''}
              placeholder={fullNames[l] ?? fullNames.en ?? ''}
              onChange={(e) => set(l, e.target.value)}
            />
          </div>
        ))}
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
