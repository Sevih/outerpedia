'use client';

/**
 * Éditeur de l'onglet « Free Heroes » du guide « Free Heroes & Starter Banners »
 * — les SOURCES de héros gratuits (data : `free-heroes-sources.json`). On peut
 * AJOUTER/RETIRER des sources et, dans chacune, des ENTRÉES et des HÉROS.
 *
 * Chaque texte (libellé de source, raison) a un aperçu fidèle via le vrai
 * `parseText` (tokens `{I-I/…}`, `{E/…}`), et l'auto-traduction EN → toutes les
 * langues (DeepL → Haiku), comme l'éditeur de guides de boss. Les héros sont
 * désignés par NOM D'AFFICHAGE EN (clé du contenu, comme le rendu).
 *
 * UN SEUL champ est monté en édition à la fois (`editing`), les autres sont
 * rendus au repos depuis UN appel `renderInlineBatch` debouncé — idiome
 * `EditorialFields`/`CharacterGroups`. Sans cette garde, chaque `InlineTextField`
 * lançait son propre aperçu AU MONTAGE : 24 allers-retours serveur à l'ouverture
 * sur la donnée réelle (11 sources + 13 entrées au 26/07), pour zéro frappe.
 */
import { useEffect, useMemo, useState } from 'react';
import { type Keyed, rowKey, stripKey, withKey } from '@/lib/admin/keyed';
import type { InlineRefs } from '@/lib/admin/inline-refs';
import type { FreeHeroesData, FreeHeroSourceData } from '@/lib/admin/general-guide-store';
import { createFreshness } from '@/lib/admin/translate-fill';
import { useAutoTranslate } from '@/lib/admin/useAutoTranslate';
import { InlineTextField } from '@/components/admin/InlineTextField';
import { InlinePreview } from '@/components/admin/InlinePreview';
import { renderInlineBatch } from '@/lib/admin/inline-preview-actions';
import type { InlineSegment } from '@/lib/parse-text';
import { TranslateButton } from '@/components/admin/TranslateButton';
import {
  CharacterChips,
  CharacterNameDatalist,
  viewsByName,
} from '@/components/admin/CharacterChips';
import type { CharOption } from '@/components/admin/CharacterPicker';
import { LANGS } from '@/lib/i18n/config';

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

/**
 * Texte AU REPOS : l'aperçu rendu, cliquable pour passer en édition. Déclaré au
 * niveau module (`react-hooks/static-components`) — le définir dans le corps de
 * rendu recréerait son identité à chaque frappe et démonterait le champ.
 */
function RestingText({
  segments,
  empty,
  onEdit,
}: {
  segments: InlineSegment[] | undefined;
  empty: string;
  onEdit: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onEdit}
      onKeyDown={(e) => e.key === 'Enter' && onEdit()}
      className="border-line-subtle hover:border-accent min-h-8 w-full cursor-pointer rounded-md border px-2 py-1 text-left text-sm leading-snug"
    >
      {segments?.length ? (
        <InlinePreview segments={segments} />
      ) : (
        <span className="text-content-subtle italic">{empty}</span>
      )}
    </div>
  );
}

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
  // Photo des EN au chargement : référence de ce qui est « déjà traduit ».
  const [freshness] = useState(() =>
    createFreshness(
      initial.sources.flatMap((s) => [s.source.en, ...s.entries.map((e) => e.reason.en)]),
    ),
  );

  // Champ en cours d'édition — clé COMPOSITE, la structure étant imbriquée :
  // `s:<si>` pour un libellé de source, `e:<si>:<ei>` pour une raison.
  const [editing, setEditing] = useState<string | null>(null);
  const [segs, setSegs] = useState<Record<string, InlineSegment[]>>({});

  const viewOf = useMemo(() => viewsByName(charOptions), [charOptions]);

  // UN appel pour TOUS les textes au repos, debouncé — au lieu d'un aperçu par
  // champ monté. Les clés suivent l'ordre d'aplatissement ci-dessous.
  useEffect(() => {
    let cancelled = false;
    const keys: string[] = [];
    const texts: string[] = [];
    sources.forEach((s, si) => {
      keys.push(`s:${si}`);
      texts.push(s.source[lang] ?? '');
      s.entries.forEach((e, ei) => {
        keys.push(`e:${si}:${ei}`);
        texts.push(e.reason[lang] ?? '');
      });
    });
    const h = setTimeout(async () => {
      try {
        const out = await renderInlineBatch(texts, lang);
        if (!cancelled) setSegs(Object.fromEntries(keys.map((k, i) => [k, out[i] ?? []])));
      } catch {
        /* aperçu indisponible — silencieux, l'édition reste possible */
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(h);
    };
  }, [sources, lang]);

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
  const translate = useAutoTranslate({
    langs: LANGS,
    freshness,
    // Clone profond : les LText collectés appartiennent à cette copie, que le
    // hook mute puis publie via `commit`.
    collect: () => {
      const draft: KSource[] = sources.map((s) => ({
        ...s,
        source: { ...s.source },
        entries: s.entries.map((e) => ({ ...e, reason: { ...e.reason } })),
      }));
      const records: LText[] = [];
      draft.forEach((s) => records.push(s.source, ...s.entries.map((e) => e.reason)));
      return { draft, records };
    },
    commit: setSources,
  });

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
        <TranslateButton t={translate} className={btn} />
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
              {editing === `s:${si}` ? (
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
              ) : (
                <RestingText
                  segments={segs[`s:${si}`]}
                  empty={lang === 'en' ? 'Source name…' : (s.source.en ?? 'Source name…')}
                  onEdit={() => setEditing(`s:${si}`)}
                />
              )}
            </div>
            <button
              type="button"
              className="text-danger shrink-0 text-sm"
              title="Delete the source"
              onClick={() => {
                // Les clés d'édition portent l'INDEX : après un retrait elles
                // désignent une autre ligne. On sort de l'édition.
                setEditing(null);
                setSources((prev) => prev.filter((_, j) => j !== si));
              }}
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
                    onClick={() => {
                      setEditing(null); // cf. suppression de source : index décalés
                      patchSource(si, {
                        entries: s.entries.filter((_, j) => j !== ei),
                      } as Partial<KSource>);
                    }}
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
                  {editing === `e:${si}:${ei}` ? (
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
                  ) : (
                    <RestingText
                      segments={segs[`e:${si}:${ei}`]}
                      empty={lang === 'en' ? 'Reason…' : (e.reason.en ?? 'Reason…')}
                      onEdit={() => setEditing(`e:${si}:${ei}`)}
                    />
                  )}
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
