'use client';

/**
 * Éditeur ÉDITORIAL d'un perso : pros/cons + synergies (couche curée).
 * Volontairement séparé de l'extraction (/admin/characters) — ici on écrit du
 * contenu humain, pas on ne contrôle la donnée du jeu. Les textes portent des
 * tags inline `{B/…}` (contrôlés par /admin/tags).
 */
import { useState } from 'react';
import type { CharacterCurated } from '@contracts';

type LocalizedText = Partial<Record<'en' | 'jp' | 'kr' | 'zh' | 'fr', string>>;
interface SynergyGroup {
  heroes: string[];
  reason?: LocalizedText;
}

const LANGS = ['en', 'jp', 'kr', 'zh', 'fr'] as const;
type L = (typeof LANGS)[number];

const btn =
  'rounded-md border border-line bg-surface-base px-3 py-1.5 text-sm hover:border-accent disabled:opacity-50';
const input =
  'w-full rounded-md border border-line bg-surface-base px-2 py-1 text-sm focus:border-accent focus:outline-none';

/** Édition d'une liste de textes localisés (pros OU cons). */
function TextListEditor({
  title,
  items,
  lang,
  onChange,
}: {
  title: string;
  items: LocalizedText[];
  lang: L;
  onChange: (next: LocalizedText[]) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-content-strong text-sm font-semibold">{title}</p>
        <button type="button" className={btn} onClick={() => onChange([...items, { en: '' }])}>
          + entrée
        </button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <textarea
            className={`${input} min-h-9 font-mono text-xs`}
            rows={2}
            value={item[lang] ?? ''}
            placeholder={lang === 'en' ? '' : (item.en ?? '')}
            onChange={(e) => {
              const next = items.slice();
              next[i] = { ...item, [lang]: e.target.value };
              if (!e.target.value) delete next[i][lang];
              onChange(next);
            }}
          />
          <button
            type="button"
            className={`${btn} text-danger`}
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            aria-label="Supprimer"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

export function EditorialEditor({
  id,
  curated,
  charNames,
}: {
  id: string;
  /** Entrée curée COMPLÈTE (on ne réécrit que prosCons/synergies dessus). */
  curated: CharacterCurated;
  /** id → nom EN (affichage des partenaires + saisie par nom). */
  charNames: Record<string, string>;
}) {
  const [lang, setLang] = useState<L>('en');
  const [pros, setPros] = useState<LocalizedText[]>(curated.prosCons?.pros ?? []);
  const [cons, setCons] = useState<LocalizedText[]>(curated.prosCons?.cons ?? []);
  const [synergies, setSynergies] = useState<SynergyGroup[]>(curated.synergies ?? []);
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const nameToId = new Map(Object.entries(charNames).map(([cid, n]) => [n.toLowerCase(), cid]));
  const resolveHero = (raw: string): string => {
    const v = raw.trim();
    if (!v || v.startsWith('{') || charNames[v]) return v;
    return nameToId.get(v.toLowerCase()) ?? v;
  };

  async function save() {
    setState('saving');
    setError(null);
    const cleanTexts = (list: LocalizedText[]) =>
      list.filter((t) => Object.values(t).some((v) => v?.trim()));
    const body: CharacterCurated = {
      ...curated,
      prosCons: { pros: cleanTexts(pros), cons: cleanTexts(cons) },
      synergies: synergies
        .map((g) => ({ ...g, heroes: g.heroes.map(resolveHero).filter(Boolean) }))
        .filter((g) => g.heroes.length),
    };
    if (!body.prosCons?.pros?.length && !body.prosCons?.cons?.length) delete body.prosCons;
    if (!body.synergies?.length) delete body.synergies;
    try {
      const res = await fetch(`/api/admin/curated/characters/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as { ok: boolean; errors?: string[] };
      if (!json.ok) throw new Error(json.errors?.join(' · ') ?? res.statusText);
      setState('saved');
    } catch (e) {
      setState('error');
      setError((e as Error).message);
    }
  }

  return (
    <div className="space-y-6">
      {/* Langue éditée (les autres langues sont préservées) */}
      <div className="flex items-center gap-2">
        <span className="text-content-subtle text-xs uppercase">Langue</span>
        <div className="border-line flex overflow-hidden rounded-md border">
          {LANGS.map((l) => (
            <button
              key={l}
              type="button"
              className={`px-2.5 py-1 text-sm ${l === lang ? 'bg-accent/20 text-accent' : 'text-content-muted hover:bg-surface-overlay'}`}
              onClick={() => setLang(l)}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TextListEditor title="Pros" items={pros} lang={lang} onChange={setPros} />
        <TextListEditor title="Cons" items={cons} lang={lang} onChange={setCons} />
      </div>

      {/* Synergies */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-content-strong text-sm font-semibold">Synergies</p>
          <button
            type="button"
            className={btn}
            onClick={() => setSynergies([...synergies, { heroes: [''] }])}
          >
            + groupe
          </button>
        </div>
        {synergies.map((g, gi) => (
          <div key={gi} className="border-line-subtle space-y-2 rounded-lg border p-3">
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-1">
                <p className="text-content-subtle text-xs uppercase">
                  Partenaires (id, nom EN exact, ou tag {'{…}'})
                </p>
                {g.heroes.map((h, hi) => (
                  <div key={hi} className="flex items-center gap-2">
                    <input
                      className={input}
                      value={h}
                      onChange={(e) => {
                        const next = synergies.slice();
                        next[gi] = { ...g, heroes: g.heroes.with(hi, e.target.value) };
                        setSynergies(next);
                      }}
                    />
                    <span className="text-content-subtle w-40 truncate text-xs">
                      {charNames[resolveHero(h)] ?? (h.startsWith('{') ? 'tag' : '—')}
                    </span>
                    <button
                      type="button"
                      className={`${btn} text-danger`}
                      onClick={() => {
                        const next = synergies.slice();
                        next[gi] = { ...g, heroes: g.heroes.filter((_, j) => j !== hi) };
                        setSynergies(next);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className={btn}
                  onClick={() => {
                    const next = synergies.slice();
                    next[gi] = { ...g, heroes: [...g.heroes, ''] };
                    setSynergies(next);
                  }}
                >
                  + partenaire
                </button>
              </div>
              <button
                type="button"
                className={`${btn} text-danger`}
                onClick={() => setSynergies(synergies.filter((_, j) => j !== gi))}
              >
                Supprimer le groupe
              </button>
            </div>
            <div>
              <p className="text-content-subtle text-xs uppercase">Raison ({lang})</p>
              <textarea
                className={`${input} min-h-9 font-mono text-xs`}
                rows={2}
                value={g.reason?.[lang] ?? ''}
                placeholder={lang === 'en' ? '' : (g.reason?.en ?? '')}
                onChange={(e) => {
                  const next = synergies.slice();
                  const reason: LocalizedText = { ...(g.reason ?? {}), [lang]: e.target.value };
                  if (!e.target.value) delete reason[lang];
                  next[gi] = { ...g, reason: Object.keys(reason).length ? reason : undefined };
                  setSynergies(next);
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button type="button" className={btn} onClick={save} disabled={state === 'saving'}>
          {state === 'saving' ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        {state === 'saved' && <span className="text-success text-sm">✓ enregistré</span>}
        {state === 'error' && <span className="text-danger text-sm">{error}</span>}
      </div>
    </div>
  );
}
