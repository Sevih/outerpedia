'use client';

/**
 * Éditeur admin (dev) du guide « Premium & Limited » : les REVIEWS par héros
 * (un seul éditeur à la fois — édition d'un perso existant ou ajout) et les
 * RECOMMENDED CHOICES (priorités de pull), pour les deux buckets Premium /
 * Limited. Écrit les JSON via la route dev.
 *
 * C'est ICI (et pas sur l'outil public) qu'on IMPORTE une review contribuée par
 * Shiraen (fichier d'UN perso) : elle est fusionnée dans le bucket (remplace le
 * perso s'il existe, sinon l'ajoute), puis relue/traduite avant d'enregistrer.
 */
import { useRef, useState } from 'react';
import type { InlineRefs } from '@/lib/admin/inline-refs';
import type { PremiumLimitedData, ReviewsBundle } from '@/lib/admin/general-guide-store';
import type { CharOption } from '@/components/admin/CharacterPicker';
import { CharacterNameDatalist } from '@/components/admin/CharacterChips';
import {
  DATALIST_ID,
  LangBar,
  PriorityOrderEditor,
  ReviewWorkbench,
  downloadJson,
  normalizeReview,
  translateReviews,
  type Bucket,
  type L,
  type SingleReviewExport,
} from '@/components/admin/premium-limited/PremiumLimitedParts';

const btn =
  'rounded-md border border-line bg-surface-base px-3 py-1.5 text-sm hover:border-accent disabled:opacity-50';
const fileSlug = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') || 'review';

export function PremiumLimitedEditor({
  initial,
  refs,
  charOptions,
}: {
  initial: PremiumLimitedData;
  refs: InlineRefs;
  charOptions: CharOption[];
}) {
  const [lang, setLang] = useState<L>('en');
  const [bucket, setBucket] = useState<Bucket>('premium');
  const [selected, setSelected] = useState<number | null>(null);
  const [reviews, setReviews] = useState<ReviewsBundle>(initial.reviews);
  const [priorities, setPriorities] = useState(initial.priorities);
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [trans, setTrans] = useState<'idle' | 'loading'>('idle');
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const charByName = new Map(charOptions.map((c) => [c.name, c]));
  const switchBucket = (b: Bucket) => {
    setBucket(b);
    setSelected(null);
  };

  async function doTranslate() {
    setTrans('loading');
    setMsg(null);
    try {
      const { next, filled, provider } = await translateReviews(reviews);
      setReviews(next);
      setMsg(
        filled
          ? `${filled} field(s) translated via ${provider === 'haiku' ? 'Haiku' : 'DeepL'} — review before saving.`
          : 'Nothing to fill.',
      );
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setTrans('idle');
    }
  }

  async function onImport(file: File) {
    setMsg(null);
    try {
      const parsed = JSON.parse(await file.text()) as Partial<SingleReviewExport>;
      if (!parsed.entry) throw new Error('file has no “entry”.');
      const b: Bucket = parsed.bucket === 'limited' ? 'limited' : 'premium';
      const norm = normalizeReview(parsed.entry);
      const list = reviews[b];
      const idx = list.findIndex((r) => r.name && r.name.toLowerCase() === norm.name.toLowerCase());
      const nextList = idx >= 0 ? list.map((x, j) => (j === idx ? norm : x)) : [...list, norm];
      setReviews({ ...reviews, [b]: nextList });
      setBucket(b);
      setSelected(idx >= 0 ? idx : list.length);
      setMsg(
        `Imported: ${norm.name || '(unnamed)'} (${b}) — ${idx >= 0 ? 'replaced' : 'added'}. Review then Save.`,
      );
    } catch (e) {
      setMsg(`Invalid import: ${(e as Error).message}`);
    }
  }

  function exportSelected() {
    if (selected == null) return;
    const entry = reviews[bucket][selected];
    const payload: SingleReviewExport = { bucket, entry };
    downloadJson(`review-${fileSlug(entry.name)}.json`, payload);
  }

  async function save() {
    setState('saving');
    setError(null);
    const data: PremiumLimitedData = { reviews, priorities };
    try {
      const res = await fetch('/api/admin/guides/general-guides/premium-limited', {
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

  return (
    <div className="space-y-6">
      <CharacterNameDatalist id={DATALIST_ID} options={charOptions} />

      {/* Barre d'outils : langue, traduction, import (1 perso) / export du perso courant */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-content-subtle text-xs uppercase">Language</span>
        <LangBar lang={lang} setLang={setLang} />
        <button type="button" className={btn} onClick={doTranslate} disabled={trans === 'loading'}>
          {trans === 'loading' ? 'Translating…' : 'Translate (EN → empty)'}
        </button>
        <span className="text-line mx-1">|</span>
        <button type="button" className={btn} onClick={() => fileRef.current?.click()}>
          Import a review (Shiraen)…
        </button>
        <button
          type="button"
          className={btn}
          onClick={exportSelected}
          disabled={selected == null}
          title="Export the hero being edited"
        >
          Export this hero
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onImport(f);
            e.target.value = '';
          }}
        />
        {msg && <span className="text-content-subtle text-xs">{msg}</span>}
      </div>

      {/* Bucket Premium / Limited */}
      <div className="border-line-subtle flex gap-1 border-b pb-2">
        {(['premium', 'limited'] as const).map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => switchBucket(b)}
            className={`rounded-md px-3 py-1 text-sm capitalize ${b === bucket ? 'bg-accent/20 text-accent font-semibold' : 'text-content-muted hover:bg-surface-overlay'}`}
          >
            {b}
          </button>
        ))}
      </div>

      <PriorityOrderEditor
        order={priorities[bucket]}
        charByName={charByName}
        onChange={(order) => setPriorities({ ...priorities, [bucket]: order })}
      />

      <ReviewWorkbench
        reviews={reviews[bucket]}
        selectedIndex={selected}
        lang={lang}
        refs={refs}
        charOptions={charOptions}
        charByName={charByName}
        onChange={(list) => setReviews({ ...reviews, [bucket]: list })}
        onSelectIndex={setSelected}
      />

      <div className="border-line-subtle flex items-center gap-3 border-t pt-4">
        <button type="button" className={btn} onClick={save} disabled={state === 'saving'}>
          {state === 'saving' ? 'Saving…' : 'Save'}
        </button>
        {state === 'saved' && <span className="text-success text-sm">✓ saved</span>}
        {(state === 'error' || error) && <span className="text-danger text-sm">{error}</span>}
      </div>
    </div>
  );
}
