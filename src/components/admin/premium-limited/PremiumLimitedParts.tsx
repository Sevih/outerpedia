'use client';

/**
 * Briques d'édition « Premium & Limited » PARTAGÉES entre l'éditeur admin
 * (dev, écrit fichier + import) et l'outil public de contribution (prod, export
 * d'UN perso pour Shiraen). Deux fragments : les REVIEWS par héros et les
 * RECOMMENDED CHOICES (ordres de priorité de pull).
 *
 * UX reviews : UN SEUL éditeur à la fois — on choisit un perso existant
 * (pré-rempli) ou on en ajoute un (vierge). Les notes se saisissent en ÉTOILES
 * (impact 1-5 ; cibles reco = plage 3-6 + Any + note libre) pour éviter les
 * coquilles de saisie.
 *
 * Composants CONTRÔLÉS (état chez le parent). Types du store en `import type`
 * uniquement (le store touche `node:fs`, interdit côté client).
 */
import type { InlineRefs } from '@/lib/admin/inline-refs';
import type {
  PriorityOrderData,
  PriorityPickData,
  ReviewEntryData,
  ReviewsBundle,
} from '@/lib/admin/general-guide-store';
import { autoTranslate } from '@/lib/admin/translate-actions';
import { applyTranslation, type Freshness } from '@/lib/admin/translate-fill';
import { InlineTextField } from '@/components/admin/InlineTextField';
import { CharacterChips, chipView } from '@/components/admin/CharacterChips';
import { CharacterPicker, type CharOption } from '@/components/admin/CharacterPicker';

export const LANGS = ['en', 'jp', 'kr', 'zh', 'fr'] as const;
export type L = (typeof LANGS)[number];
type LText = { en?: string } & Record<string, string | undefined>;

const STARS = ['3', '4', '5', '6'] as const;
export const DATALIST_ID = 'premium-limited-char-names';

const btn =
  'rounded-md border border-line bg-surface-base px-3 py-1.5 text-sm hover:border-accent disabled:opacity-50';
const input =
  'rounded-md border border-line bg-surface-base px-2 py-1 text-sm focus:border-accent focus:outline-none';
const heading = 'text-content-strong text-sm font-semibold';

export const emptyReview = (): ReviewEntryData => ({
  name: '',
  review: { en: '' },
  recommendedPve: '',
  recommendedPvp: '',
  impact: {
    '3': { pve: '', pvp: '' },
    '4': { pve: '', pvp: '' },
    '5': { pve: '', pvp: '' },
    '6': { pve: '', pvp: '' },
  },
});

/** Normalise une review importée (impact complet, champs présents) — côté client. */
export function normalizeReview(r: Partial<ReviewEntryData>): ReviewEntryData {
  const base = emptyReview();
  for (const s of STARS) {
    const cell = r.impact?.[s];
    if (cell) base.impact[s] = { pve: cell.pve ?? '', pvp: cell.pvp ?? '' };
  }
  return {
    name: r.name ?? '',
    review: (r.review ?? { en: '' }) as LText,
    recommendedPve: r.recommendedPve ?? '',
    recommendedPvp: r.recommendedPvp ?? '',
    impact: base.impact,
    ...(r.unreleased ? { unreleased: true } : {}),
  };
}

/** Normalise un bundle importé (les deux buckets). */
export function normalizeBundle(b: Partial<ReviewsBundle>): ReviewsBundle {
  return {
    premium: (b.premium ?? []).map(normalizeReview),
    limited: (b.limited ?? []).map(normalizeReview),
  };
}

/** Bucket d'une review (l'unité d'échange import/export est `ReviewContributionPayload`). */
export type Bucket = 'premium' | 'limited';

export const editLText = (cur: LText | undefined, val: string, lang: L): LText => {
  const next: LText = { ...(cur ?? { en: '' }) };
  if (val) next[lang] = val;
  else delete next[lang];
  if (next.en === undefined) next.en = '';
  return next;
};

/**
 * Regénère les REVIEWS des deux buckets depuis leur EN (admin) — écrase les
 * traductions. La fraîcheur restreint l'envoi à ce qui a BOUGÉ depuis le
 * chargement (quota DeepL).
 */
export async function translateReviews(
  bundle: ReviewsBundle,
  freshness: Freshness,
): Promise<{ next: ReviewsBundle; filled: number; provider: string }> {
  const targets = LANGS.filter((l) => l !== 'en');
  const clone = (list: ReviewEntryData[]) =>
    list.map((r) => ({ ...r, review: { ...r.review } as LText }));
  const next: ReviewsBundle = { premium: clone(bundle.premium), limited: clone(bundle.limited) };

  const recs = [...next.premium, ...next.limited]
    .map((r) => r.review)
    .filter((t) => freshness.isStale(t, targets));
  if (!recs.length) return { next, filled: 0, provider: 'deepl' };

  const { results, provider } = await autoTranslate(
    recs.map((r) => r.en!),
    targets,
  );
  let filled = 0;
  recs.forEach((rec, k) => {
    filled += applyTranslation(rec, results[k] ?? {}, targets);
    freshness.markFresh(rec);
  });
  return { next, filled, provider };
}

/* --- Barre de langue + téléchargement JSON (partagés) --- */

export function LangBar({ lang, setLang }: { lang: L; setLang: (l: L) => void }) {
  return (
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
  );
}

/** Déclenche le téléchargement d'un objet en JSON (nom de fichier donné). */
export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* --- Widgets étoiles (anti-coquille) --- */

/** Note 1-5 en étoiles (re-cliquer l'étoile courante remet à vide). */
function ImpactStars({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const n = Number.parseInt(value, 10) || 0;
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          title={`${i}`}
          className="text-base leading-none"
          onClick={() => onChange(i === n ? '' : String(i))}
        >
          <span className={i <= n ? 'text-amber-400' : 'text-content-subtle'}>
            {i <= n ? '★' : '☆'}
          </span>
        </button>
      ))}
    </span>
  );
}

interface Reco {
  any: boolean;
  min?: number;
  max?: number;
  note: string;
}
/** « 4 to 5 » / « Any » / « 5 (support) 6 (dps) » → modèle éditable. */
function parseReco(s: string): Reco {
  const t = (s ?? '').trim();
  if (!t) return { any: false, note: '' };
  if (/^any$/i.test(t)) return { any: true, note: '' };
  const m = t.match(/^(\d)(?:\s*to\s*(\d))?\s*(.*)$/i);
  if (m) {
    const min = Number(m[1]);
    const max = m[2] ? Number(m[2]) : min;
    return { any: false, min, max, note: m[3].trim() };
  }
  return { any: false, note: t };
}
function formatReco(r: Reco): string {
  if (r.any) return 'Any';
  const base = r.min ? (r.min === r.max ? String(r.min) : `${r.min} to ${r.max}`) : '';
  return [base, r.note].filter(Boolean).join(' ').trim();
}

/** Cible reco : plage d'étoiles 3-6 + « Any » + note libre. */
function RecoTargetStars({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const r = parseReco(value);
  const set = (p: Partial<Reco>) => onChange(formatReco({ ...r, ...p }));
  const clickStar = (s: number) => {
    if (r.any || r.min === undefined) return set({ any: false, min: s, max: s });
    const min = r.min;
    const max = r.max ?? r.min;
    if (min === max) {
      if (s === min) return set({ min: undefined, max: undefined }); // clic sur l'unique → désélection
      return set({ min: Math.min(min, s), max: Math.max(max, s) }); // étend en plage
    }
    // Plage : clic sur une BORNE la retire (4-5 → clic 4 = 5 seul), clic dehors
    // étend, clic strictement dedans replie sur cette étoile.
    if (s < min) return set({ min: s });
    if (s > max) return set({ max: s });
    if (s === min) return set({ min: min + 1 });
    if (s === max) return set({ max: max - 1 });
    return set({ min: s, max: s });
  };
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex gap-0.5">
        {[3, 4, 5, 6].map((s) => {
          const on = !r.any && r.min !== undefined && s >= r.min && s <= (r.max ?? r.min);
          return (
            <button
              key={s}
              type="button"
              title={`${s}★`}
              className="flex flex-col items-center leading-none"
              onClick={() => clickStar(s)}
            >
              <span className={`text-base ${on ? 'text-amber-400' : 'text-content-subtle'}`}>
                {on ? '★' : '☆'}
              </span>
              <span className="text-content-subtle text-[9px]">{s}</span>
            </button>
          );
        })}
      </span>
      <button
        type="button"
        onClick={() => set({ any: !r.any, min: undefined, max: undefined })}
        className={`rounded border px-2 py-0.5 text-xs ${r.any ? 'border-accent text-accent' : 'border-line text-content-muted'}`}
      >
        Any
      </button>
      <input
        className={`${input} w-40`}
        placeholder="note (optional)"
        value={r.note}
        onChange={(e) => set({ note: e.target.value })}
      />
    </div>
  );
}

/* --- Formulaire d'UNE review (contrôlé) --- */

export function ReviewForm({
  entry,
  lang,
  refs,
  charOptions,
  charByName,
  heroMode = 'picker',
  onChange,
  onDelete,
}: {
  entry: ReviewEntryData;
  lang: L;
  refs: InlineRefs;
  charOptions: CharOption[];
  charByName: Map<string, CharOption>;
  /**
   * `picker` (admin) : sélecteur de perso. `auto` (public) : le perso est déjà
   * choisi hors du formulaire → nom en titre ; pour un perso `unreleased`
   * (absent de la data), champ texte libre (on peut corriger le nom saisi).
   */
  heroMode?: 'picker' | 'auto';
  onChange: (r: ReviewEntryData) => void;
  onDelete?: () => void;
}) {
  const c = charByName.get(entry.name);
  const set = (p: Partial<ReviewEntryData>) => onChange({ ...entry, ...p });
  const setImpact = (s: (typeof STARS)[number], side: 'pve' | 'pvp', val: string) =>
    set({ impact: { ...entry.impact, [s]: { ...entry.impact[s], [side]: val } } });

  return (
    <div className="card space-y-4 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-content-subtle mb-1 text-xs uppercase">Hero</p>
          {heroMode === 'picker' ? (
            <CharacterPicker
              options={charOptions}
              id={c?.id ?? ''}
              name={entry.name}
              onSelect={(sel) => set({ name: sel.name })}
            />
          ) : entry.unreleased ? (
            <div className="space-y-1">
              <input
                className={`${input} w-full max-w-xs`}
                value={entry.name}
                placeholder="Unreleased hero name…"
                onChange={(e) => set({ name: e.target.value })}
              />
              <span className="text-warn text-xs">Unreleased — not on the site yet.</span>
            </div>
          ) : (
            <span className="text-content-strong text-base font-semibold">{entry.name}</span>
          )}
        </div>
        {onDelete && (
          <button
            type="button"
            className="text-danger shrink-0 text-sm"
            title="Delete this review"
            onClick={onDelete}
          >
            ✕ delete
          </button>
        )}
      </div>

      <div>
        <p className="text-content-subtle mb-1 text-xs uppercase">Review ({lang})</p>
        <InlineTextField
          value={entry.review[lang] ?? ''}
          refs={refs}
          lang={lang}
          rows={5}
          layout="stacked"
          placeholder={lang === 'en' ? '' : (entry.review.en ?? '')}
          onChange={(val) => set({ review: editLText(entry.review, val, lang) as LText })}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <p className="text-content-subtle mb-1 text-xs uppercase">Reco target PvE</p>
          <RecoTargetStars
            value={entry.recommendedPve}
            onChange={(v) => set({ recommendedPve: v })}
          />
        </div>
        <div>
          <p className="text-content-subtle mb-1 text-xs uppercase">Reco target PvP</p>
          <RecoTargetStars
            value={entry.recommendedPvp}
            onChange={(v) => set({ recommendedPvp: v })}
          />
        </div>
      </div>

      <div>
        <p className="text-content-subtle mb-2 text-xs uppercase">Impact per transcendence (1-5)</p>
        <table className="text-sm">
          <thead>
            <tr className="text-content-subtle text-xs">
              <th className="pr-3 text-left font-medium">★</th>
              <th className="px-3 text-left font-medium">PvE</th>
              <th className="px-3 text-left font-medium">PvP</th>
            </tr>
          </thead>
          <tbody>
            {STARS.map((s) => (
              <tr key={s}>
                <td className="text-content-strong pr-3 font-semibold">{s}★</td>
                <td className="px-3 py-1">
                  <ImpactStars
                    value={entry.impact[s].pve}
                    onChange={(v) => setImpact(s, 'pve', v)}
                  />
                </td>
                <td className="px-3 py-1">
                  <ImpactStars
                    value={entry.impact[s].pvp}
                    onChange={(v) => setImpact(s, 'pvp', v)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* --- Établi reviews : sélecteur (existant / nouveau) + formulaire unique --- */

export function ReviewWorkbench({
  reviews,
  selectedIndex,
  lang,
  refs,
  charOptions,
  charByName,
  onChange,
  onSelectIndex,
}: {
  reviews: ReviewEntryData[];
  selectedIndex: number | null;
  lang: L;
  refs: InlineRefs;
  charOptions: CharOption[];
  charByName: Map<string, CharOption>;
  onChange: (list: ReviewEntryData[]) => void;
  onSelectIndex: (i: number | null) => void;
}) {
  const sel =
    selectedIndex != null && selectedIndex >= 0 && selectedIndex < reviews.length
      ? selectedIndex
      : null;
  const add = () => {
    onChange([...reviews, emptyReview()]);
    onSelectIndex(reviews.length);
  };
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className={heading}>Reviews ({reviews.length})</p>
        <select
          className={`${input} ml-2 max-w-xs`}
          value={sel ?? ''}
          onChange={(e) => onSelectIndex(e.target.value === '' ? null : Number(e.target.value))}
        >
          <option value="">— edit a hero… —</option>
          {reviews.map((r, i) => (
            <option key={i} value={i}>
              {r.name || '(unnamed)'}
            </option>
          ))}
        </select>
        <button type="button" className={btn} onClick={add}>
          + New hero
        </button>
      </div>

      {sel == null ? (
        <p className="text-content-subtle text-sm">Pick a hero to edit, or add a new one.</p>
      ) : (
        <ReviewForm
          entry={reviews[sel]}
          lang={lang}
          refs={refs}
          charOptions={charOptions}
          charByName={charByName}
          onChange={(r) => onChange(reviews.map((x, j) => (j === sel ? r : x)))}
          onDelete={() => {
            onChange(reviews.filter((_, j) => j !== sel));
            onSelectIndex(null);
          }}
        />
      )}
    </section>
  );
}

/* --- Recommended choices : ordres de priorité (contrôlé) --- */

const TIERS = [
  { key: 'first', label: '1st choice' },
  { key: 'second', label: '2nd choice' },
  { key: 'third', label: '3rd choice' },
  { key: 'transcend', label: 'Transcendence priority' },
] as const;

function PickRow({
  pick,
  charByName,
  onStars,
  onRemove,
}: {
  pick: PriorityPickData;
  charByName: Map<string, CharOption>;
  onStars: (stars: number) => void;
  onRemove: () => void;
}) {
  const c = charByName.get(pick.name);
  return (
    <div className="border-line-subtle flex items-center gap-2 rounded-lg border p-2">
      <span className="text-content text-sm">{c?.name ?? pick.name}</span>
      <label className="text-content-subtle ml-auto flex items-center gap-1 text-xs">
        ★
        <select
          className={`${input} w-16`}
          value={pick.stars}
          onChange={(e) => onStars(Number(e.target.value))}
        >
          {[3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
      <button type="button" className="text-danger text-sm" title="Remove" onClick={onRemove}>
        ✕
      </button>
    </div>
  );
}

export function PriorityOrderEditor({
  order,
  charByName,
  onChange,
}: {
  order: PriorityOrderData;
  charByName: Map<string, CharOption>;
  onChange: (order: PriorityOrderData) => void;
}) {
  const setTier = (tier: (typeof TIERS)[number]['key'], list: PriorityPickData[]) =>
    onChange({ ...order, [tier]: list });

  return (
    <section className="space-y-4">
      <p className={heading}>Recommended choices (pull priority)</p>
      {TIERS.map(({ key, label }) => {
        const list = order[key] ?? [];
        return (
          <div key={key} className="border-line-subtle space-y-2 rounded-lg border p-3">
            <div className="text-content-strong text-xs font-semibold uppercase">{label}</div>
            <div className="flex flex-col gap-2">
              {list.map((pick, i) => (
                <PickRow
                  key={i}
                  pick={pick}
                  charByName={charByName}
                  onStars={(stars) =>
                    setTier(
                      key,
                      list.map((p, j) => (j === i ? { ...p, stars } : p)),
                    )
                  }
                  onRemove={() =>
                    setTier(
                      key,
                      list.filter((_, j) => j !== i),
                    )
                  }
                />
              ))}
            </div>
            <CharacterChips
              values={[]}
              datalistId={DATALIST_ID}
              viewOf={(name) => chipView(charByName.get(name))}
              onChange={(added) => {
                const name = added[added.length - 1];
                if (name) setTier(key, [...list, { name, stars: 3 }]);
              }}
            />
            <p className="text-content-subtle text-[11px]">
              Pick a hero from the list — or type a name + Enter — to add it to this tier.
            </p>
          </div>
        );
      })}
    </section>
  );
}
