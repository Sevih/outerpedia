'use client';

/**
 * Éditeur de l'onglet « Free Heroes » du guide « Free Heroes & Starter Banners »
 * — les SOURCES de héros gratuits (data : `free-heroes-sources.json`). On peut
 * AJOUTER/RETIRER des sources et, dans chacune, des ENTRÉES et des HÉROS.
 *
 * Chaque texte (libellé de source, raison) est un `InlineTextField` : aperçu
 * fidèle via le vrai `parseText` (tokens `{I-I/…}`, `{E/…}`), et auto-traduction
 * EN → toutes les langues (DeepL → Haiku), comme l'éditeur de guides de boss. Les
 * héros sont désignés par NOM D'AFFICHAGE EN (clé du contenu, comme le rendu).
 */
import { useMemo, useState } from 'react';
import { type Keyed, rowKey, stripKey, withKey } from '@/lib/admin/keyed';
import type { InlineRefs } from '@/lib/admin/inline-refs';
import type { FreeHeroesData, FreeHeroSourceData } from '@/lib/admin/general-guide-store';
import { autoTranslate } from '@/lib/admin/translate-actions';
import { applyTranslation, createFreshness } from '@/lib/admin/translate-fill';
import { InlineTextField } from '@/components/admin/InlineTextField';
import {
  CharacterChips,
  CharacterNameDatalist,
  viewsByName,
} from '@/components/admin/CharacterChips';
import type { CharOption } from '@/components/admin/CharacterPicker';

const LANGS = ['en', 'jp', 'kr', 'zh', 'fr'] as const;
type L = (typeof LANGS)[number];
type LText = { en?: string } & Record<string, string | undefined>;

/** Datalist des noms de persos, posée une fois par page. */
const DATALIST_ID = 'free-heroes-char-names';

const btn =
  'rounded-md border border-line bg-surface-base px-3 py-1.5 text-sm hover:border-accent disabled:opacity-50';
const input =
  'w-full rounded-md border border-line bg-surface-base px-2 py-1 text-sm focus:border-accent focus:outline-none';

/** Lignes keyées : sources et entrées portent une clé React stable. */
type KEntry = Keyed<FreeHeroSourceData['entries'][number]>;
type KSource = Keyed<Omit<FreeHeroSourceData, 'entries'> & { entries: KEntry[] }>;

const keySource = (s: FreeHeroSourceData): KSource =>
  withKey({ ...s, entries: s.entries.map(withKey) });
const stripSource = (s: KSource): FreeHeroSourceData =>
  stripKey({ ...s, entries: s.entries.map(stripKey) });

/* --- Éditeur principal --- */
export function FreeHeroesEditor({
  slug,
  initial,
  refs,
  charOptions,
}: {
  slug: string;
  initial: FreeHeroesData;
  refs: InlineRefs;
  charOptions: CharOption[];
}) {
  const [lang, setLang] = useState<L>('en');
  const [sources, setSources] = useState<KSource[]>(() => initial.sources.map(keySource));
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [trans, setTrans] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [transMsg, setTransMsg] = useState<string | null>(null);
  // Photo des EN au chargement : référence de ce qui est « déjà traduit ».
  const [freshness] = useState(() =>
    createFreshness(
      initial.sources.flatMap((s) => [s.source.en, ...s.entries.map((e) => e.reason.en)]),
    ),
  );

  const viewOf = useMemo(() => viewsByName(charOptions), [charOptions]);

  const show = (t: LText | undefined): string => t?.[lang] ?? '';
  const editLText = (cur: LText | undefined, val: string): LText => {
    const next: LText = { ...(cur ?? { en: '' }) };
    if (val) next[lang] = val;
    else delete next[lang];
    if (next.en === undefined) next.en = '';
    return next;
  };

  const patchSource = (si: number, p: Partial<KSource>) =>
    setSources((prev) => prev.map((s, j) => (j === si ? { ...s, ...p } : s)));
  const patchEntry = (si: number, ei: number, p: Partial<KEntry>) =>
    patchSource(si, {
      entries: sources[si].entries.map((e, j) => (j === ei ? { ...e, ...p } : e)),
    } as Partial<KSource>);

  /* --- Auto-traduction : EN → toutes les langues (libellés + raisons) --- */
  async function translateAll() {
    setTrans('loading');
    setTransMsg(null);
    const targets = LANGS.filter((l) => l !== 'en');

    // Clone profond, collecte des LText EN à traduire.
    const next: KSource[] = sources.map((s) => ({
      ...s,
      source: { ...s.source },
      entries: s.entries.map((e) => ({ ...e, reason: { ...e.reason } })),
    }));
    // Ne part au traducteur que ce qui a BOUGÉ (EN édité/ajouté) ou à qui il
    // manque une langue — inutile de repayer DeepL pour l'identique.
    const recs: LText[] = [];
    next.forEach((s) => {
      recs.push(s.source, ...s.entries.map((e) => e.reason));
    });
    const stale = recs.filter((t) => freshness.isStale(t, targets));
    if (!stale.length) {
      setTrans('done');
      setTransMsg('Nothing to translate — every English text is already up to date.');
      return;
    }
    try {
      const { results, provider } = await autoTranslate(
        stale.map((r) => r.en!),
        targets,
      );
      let filled = 0;
      stale.forEach((rec, k) => {
        filled += applyTranslation(rec, results[k] ?? {}, targets);
        freshness.markFresh(rec);
      });
      setSources(next);
      setTrans('done');
      setTransMsg(
        filled
          ? `${filled} field(s) translated via ${provider === 'haiku' ? 'Haiku (DeepL quota reached)' : 'DeepL'} — review before saving.`
          : 'Every translation already matched the English text.',
      );
    } catch (e) {
      setTrans('error');
      setTransMsg((e as Error).message);
    }
  }

  /* --- Enregistrement --- */
  async function save() {
    setState('saving');
    setError(null);
    const data: FreeHeroesData = { sources: sources.map(stripSource) };
    try {
      const res = await fetch(`/api/admin/guides/general-guides/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ op: 'save', data }),
      });
      const json = (await res.json()) as { ok: boolean; errors?: string[] };
      if (!json.ok) throw new Error(json.errors?.join(' · ') ?? res.statusText);
      setState('saved');
    } catch (e) {
      setState('error');
      setError((e as Error).message);
    }
  }

  const emptyEntry = (): KEntry => ({
    _key: rowKey(),
    names: [],
    pickType: 'all',
    reason: { en: '' },
  });

  return (
    <div className="space-y-6">
      <CharacterNameDatalist id={DATALIST_ID} options={charOptions} />

      {/* Langue + auto-traduction */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-content-subtle text-xs uppercase">Language</span>
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
        <button
          type="button"
          className={btn}
          onClick={translateAll}
          disabled={trans === 'loading'}
          title="Regenerates every other language from the English text — existing translations are overwritten (DeepL → Haiku)"
        >
          {trans === 'loading' ? 'Translating…' : 'Translate (EN → all)'}
        </button>
        {transMsg && (
          <span className={`text-xs ${trans === 'error' ? 'text-danger' : 'text-content-subtle'}`}>
            {transMsg}
          </span>
        )}
      </div>

      <p className="text-content-subtle text-sm">
        Free hero sources — <strong>Free Heroes</strong> tab. One source = one table row; each entry
        carries its heroes, pick type and reason.
      </p>

      {sources.length === 0 && <p className="text-content-subtle text-sm">No source — add one.</p>}

      {sources.map((s, si) => (
        <div key={s._key} className="card space-y-4 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-content-subtle mb-1 text-xs uppercase">Source ({lang})</p>
              <InlineTextField
                value={show(s.source)}
                refs={refs}
                lang={lang}
                rows={2}
                layout="stacked"
                placeholder={lang === 'en' ? 'Source name…' : (s.source.en ?? '')}
                onChange={(val) =>
                  patchSource(si, { source: editLText(s.source, val) as KSource['source'] })
                }
              />
            </div>
            <button
              type="button"
              className="text-danger shrink-0 text-sm"
              title="Delete the source"
              onClick={() => setSources((prev) => prev.filter((_, j) => j !== si))}
            >
              ✕ source
            </button>
          </div>

          <div className="space-y-3 pl-3">
            {s.entries.map((e, ei) => (
              <div key={e._key} className="border-line-subtle space-y-3 rounded-lg border p-3">
                <div className="flex items-start justify-between gap-2">
                  <CharacterChips
                    values={e.names}
                    datalistId={DATALIST_ID}
                    viewOf={viewOf}
                    onChange={(names) => patchEntry(si, ei, { names })}
                  />
                  <button
                    type="button"
                    className="text-danger shrink-0 text-sm"
                    title="Delete the entry"
                    onClick={() =>
                      patchSource(si, {
                        entries: s.entries.filter((_, j) => j !== ei),
                      } as Partial<KSource>)
                    }
                  >
                    ✕ entry
                  </button>
                </div>

                <label className="text-content-subtle flex items-center gap-2 text-xs">
                  Pick type
                  <select
                    className={`${input} w-40`}
                    value={e.pickType}
                    onChange={(ev) =>
                      patchEntry(si, ei, { pickType: ev.target.value as 'one' | 'all' })
                    }
                  >
                    <option value="all">All (obtained)</option>
                    <option value="one">One (your choice)</option>
                  </select>
                </label>

                <div>
                  <p className="text-content-subtle mb-1 text-xs uppercase">Reason ({lang})</p>
                  <InlineTextField
                    value={show(e.reason)}
                    refs={refs}
                    lang={lang}
                    rows={3}
                    layout="stacked"
                    placeholder={lang === 'en' ? '' : (e.reason.en ?? '')}
                    onChange={(val) =>
                      patchEntry(si, ei, { reason: editLText(e.reason, val) as KEntry['reason'] })
                    }
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              className={btn}
              onClick={() =>
                patchSource(si, { entries: [...s.entries, emptyEntry()] } as Partial<KSource>)
              }
            >
              + entry
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        className={btn}
        onClick={() =>
          setSources((prev) => [
            ...prev,
            { _key: rowKey(), source: { en: '' }, entries: [emptyEntry()] },
          ])
        }
      >
        + source
      </button>

      <div className="border-line-subtle flex items-center gap-3 border-t pt-4">
        <button type="button" className={btn} onClick={save} disabled={state === 'saving'}>
          {state === 'saving' ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        {state === 'saved' && <span className="text-success text-sm">✓ enregistré</span>}
        {(state === 'error' || error) && <span className="text-danger text-sm">{error}</span>}
      </div>
    </div>
  );
}
