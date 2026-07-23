'use client';

/**
 * Éditeur des PRIORITÉS DE SHOP (guide shop-purchase-priorities) — dev-only.
 *
 * Deux surfaces, une seule UI en onglets :
 *   - 8 shops DÉRIVÉS du jeu : le factuel (icône/nom/coût/limite) est en LECTURE
 *     SEULE ; on ne cure que priorité S/A/B/C + notes (overlay curé keyé par slug
 *     stable). Sauvegarde → régénère `data/generated/shop-priorities.json`.
 *   - shops ÉDITORIAUX (Event, Resource, Supply, Rico) + notes de shop : tout est
 *     éditable (tables, textes) → `shop-editorial.json`.
 *
 * Comme les autres éditeurs, les textes localisés portent des tags `{I-I/…}` ;
 * ils s'éditent au CLIC (un seul `InlineTextField` monté à la fois), les
 * sous-composants restent au niveau MODULE (sinon remontage → perte de focus).
 */
import { useMemo, useState } from 'react';
import type { LocalizedText } from '@contracts';
import type { InlineRefs } from '@/lib/admin/inline-refs';
import type {
  DerivedShop,
  DerivedRow,
  EditorialItem,
  OverlayEntry,
  ShopEditorial,
  ShopPrioritiesEditData,
  TextShop,
} from '@/lib/admin/shop-priorities-store';
import { autoTranslate } from '@/lib/admin/translate-actions';
import { applyTranslation, createFreshness } from '@/lib/admin/translate-fill';
import { InlineTextField } from '@/components/admin/InlineTextField';
import { EditorTabs } from '@/components/admin/EditorTabs';
import { ItemInline } from '@/components/inline/ItemInline';
import { img } from '@/lib/images';

const LANGS = ['en', 'jp', 'kr', 'zh', 'fr'] as const;
type L = (typeof LANGS)[number];
type Priority = 'S' | 'A' | 'B' | 'C';
const PRIORITIES: Priority[] = ['S', 'A', 'B', 'C'];
const PERIODS = ['daily', 'weekly', 'monthly', 'one-time'] as const;
type Period = (typeof PERIODS)[number];

/** Onglets dérivés (dans l'ordre du guide) + note de shop associée. */
const DERIVED_ORDER = ['guild', 'joint', 'friend', 'arena', 'stars', 'worldboss', 'al', 'survey'];
const DERIVED_LABEL: Record<string, string> = {
  guild: 'Guild',
  joint: 'Joint Challenge',
  friend: 'Friendship',
  arena: 'Arena',
  stars: "Star's Memory",
  worldboss: 'World Boss',
  al: 'Adventure License',
  survey: 'Survey Hub',
};

const btn =
  'rounded-md border border-line bg-surface-base px-3 py-1.5 text-sm hover:border-accent disabled:opacity-50';
const input =
  'rounded-md border border-line bg-surface-base px-2 py-1 text-sm focus:border-accent focus:outline-none';
const th = 'px-2.5 py-1.5 text-left text-xs font-medium text-content-subtle';
const td = 'px-2.5 py-1.5 align-top';

const PRIORITY_BADGE: Record<Priority, string> = {
  S: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/40',
  A: 'bg-sky-500/15 text-sky-300 ring-sky-500/40',
  B: 'bg-amber-500/15 text-amber-300 ring-amber-500/40',
  C: 'bg-surface-sunken text-content-subtle ring-line-subtle',
};

const fmt = (n: number): string => n.toLocaleString('en-US');
const hasText = (t?: LocalizedText): boolean =>
  t ? Object.values(t).some((v) => v?.trim()) : false;

/* --- Sélecteur de priorité (S/A/B/C, re-clic = efface) --- */

function PriorityPicker({
  value,
  onChange,
}: {
  value?: Priority;
  onChange: (p?: Priority) => void;
}) {
  return (
    <div className="border-line inline-flex overflow-hidden rounded-md border">
      {PRIORITIES.map((p) => (
        <button
          key={p}
          type="button"
          title={value === p ? 'Clear' : `Set ${p}`}
          onClick={() => onChange(value === p ? undefined : p)}
          className={`h-6 w-6 text-xs font-bold ${
            value === p
              ? `ring-1 ${PRIORITY_BADGE[p]}`
              : 'text-content-subtle hover:bg-surface-overlay'
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

/* --- Champ localisé à tags, édité au clic (un seul monté à la fois) --- */

function NoteField({
  value,
  onChange,
  lang,
  refs,
  placeholder = '+ note',
}: {
  value?: LocalizedText;
  onChange: (v?: LocalizedText) => void;
  lang: L;
  refs: InlineRefs;
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const text = value?.[lang] ?? '';
  if (editing) {
    return (
      <div className="min-w-56">
        <InlineTextField
          value={text}
          refs={refs}
          lang={lang}
          layout="stacked"
          placeholder={lang === 'en' ? '' : (value?.en ?? '')}
          onChange={(v) => {
            const next: LocalizedText = { ...(value ?? {}) };
            if (v) next[lang] = v;
            else delete next[lang];
            onChange(Object.keys(next).length ? next : undefined);
          }}
        />
        <button
          type="button"
          className="text-content-subtle mt-1 text-[11px] hover:underline"
          onClick={() => setEditing(false)}
        >
          done
        </button>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="text-content-muted hover:text-content max-w-64 cursor-pointer text-left text-xs"
    >
      {text || <span className="text-content-subtle italic">{placeholder}</span>}
    </button>
  );
}

/* --- Note de shop (bandeau sous un onglet) --- */

function ShopNoteRow({
  value,
  onChange,
  lang,
  refs,
}: {
  value?: LocalizedText;
  onChange: (v?: LocalizedText) => void;
  lang: L;
  refs: InlineRefs;
}) {
  return (
    <div className="border-line-subtle bg-surface-raised/40 rounded-lg border p-3">
      <p className="text-content-subtle mb-1 text-xs uppercase">Shop note ({lang})</p>
      <NoteField
        value={value}
        lang={lang}
        refs={refs}
        placeholder="+ shop note"
        onChange={onChange}
      />
    </div>
  );
}

/* --- Cellule item d'un dérivé (lecture seule) --- */

function DerivedItemCell({ row, lang }: { row: DerivedRow; lang: L }) {
  const name = row.name[lang] || row.name.en || '';
  const suffix = row.gives > 1 && !name.includes(fmt(row.gives)) ? ` ×${fmt(row.gives)}` : '';
  if (!row.icon)
    return (
      <span className="text-content">
        {name}
        <span className="text-content-subtle">{suffix}</span>
      </span>
    );
  const iconSrc = row.iconKind === 'equipment' ? img.equipment(row.icon) : img.item(row.icon);
  return (
    <span className="inline-flex items-center gap-1">
      <ItemInline item={{ name, iconSrc, grade: row.grade }} size={20} color="text-content" />
      {suffix && <span className="text-content-subtle text-xs">{suffix}</span>}
    </span>
  );
}

/* --- Table d'un shop dérivé --- */

function DerivedTable({
  shop,
  overlay,
  lang,
  refs,
  setEntry,
}: {
  shop: DerivedShop;
  overlay: Record<string, OverlayEntry>;
  lang: L;
  refs: InlineRefs;
  setEntry: (slug: string, patch: OverlayEntry) => void;
}) {
  return (
    <div className="border-line overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-surface-sunken">
          <tr>
            <th className={th}>Priority</th>
            <th className={th}>Item</th>
            <th className={th}>Cost</th>
            <th className={th}>Limit</th>
            <th className={th}>Note</th>
          </tr>
        </thead>
        <tbody>
          {shop.rows.map((row) => {
            const ed = overlay[row.key] ?? {};
            return (
              <tr key={row.key} className="border-line-subtle even:bg-surface-raised/40 border-t">
                <td className={td}>
                  <PriorityPicker
                    value={ed.priority}
                    onChange={(priority) => setEntry(row.key, { ...ed, priority })}
                  />
                </td>
                <td className={`${td} text-content`}>
                  <DerivedItemCell row={row} lang={lang} />
                </td>
                <td className={`${td} text-content whitespace-nowrap`}>
                  {fmt(row.cost)}
                  {shop.currency.icon && (
                    <img
                      src={img.item(shop.currency.icon)}
                      alt=""
                      width={14}
                      height={14}
                      className="ml-1 inline-block align-text-bottom"
                    />
                  )}
                </td>
                <td className={`${td} text-content-subtle whitespace-nowrap`}>
                  {row.limit.count > 0 ? `${row.limit.count} / ${row.limit.period}` : '—'}
                </td>
                <td className={td}>
                  <NoteField
                    value={ed.notes}
                    lang={lang}
                    refs={refs}
                    onChange={(notes) => setEntry(row.key, { ...ed, notes })}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* --- Table éditoriale (Event / Resource) : tout éditable --- */

function EditorialTable({
  items,
  lang,
  refs,
  onChange,
}: {
  items: EditorialItem[];
  lang: L;
  refs: InlineRefs;
  onChange: (items: EditorialItem[]) => void;
}) {
  const patch = (i: number, p: Partial<EditorialItem>) =>
    onChange(items.map((it, j) => (j === i ? { ...it, ...p } : it)));
  return (
    <div className="space-y-2">
      <div className="border-line overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-surface-sunken">
            <tr>
              <th className={th}>Priority</th>
              <th className={th}>Item name</th>
              <th className={th}>Gives</th>
              <th className={th}>Cost</th>
              <th className={th}>Limit</th>
              <th className={th}>Note</th>
              <th className={th}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i} className="border-line-subtle even:bg-surface-raised/40 border-t">
                <td className={td}>
                  <PriorityPicker
                    value={it.priority}
                    onChange={(priority) => patch(i, { priority })}
                  />
                </td>
                <td className={td}>
                  <input
                    className={`${input} w-44`}
                    value={it.name}
                    placeholder="Catalog name (EN) or generic"
                    onChange={(e) => patch(i, { name: e.target.value })}
                  />
                </td>
                <td className={td}>
                  <input
                    type="number"
                    className={`${input} w-20`}
                    value={it.gives ?? ''}
                    onChange={(e) =>
                      patch(i, { gives: e.target.value ? Number(e.target.value) : undefined })
                    }
                  />
                </td>
                <td className={td}>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      className={`${input} w-20`}
                      value={it.cost?.amount ?? ''}
                      onChange={(e) =>
                        patch(i, {
                          cost: {
                            currency: it.cost?.currency ?? 'TBD',
                            amount: Number(e.target.value) || 0,
                          },
                        })
                      }
                    />
                    <input
                      className={`${input} w-24`}
                      value={it.cost?.currency ?? ''}
                      placeholder="currency"
                      onChange={(e) =>
                        patch(i, {
                          cost: { currency: e.target.value, amount: it.cost?.amount ?? 0 },
                        })
                      }
                    />
                  </div>
                </td>
                <td className={td}>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      className={`${input} w-14`}
                      value={it.limit?.count ?? ''}
                      onChange={(e) =>
                        patch(i, {
                          limit: e.target.value
                            ? {
                                count: Number(e.target.value),
                                period: it.limit?.period ?? 'weekly',
                              }
                            : undefined,
                        })
                      }
                    />
                    <select
                      className={input}
                      value={it.limit?.period ?? ''}
                      disabled={!it.limit}
                      onChange={(e) =>
                        patch(i, {
                          limit: { count: it.limit?.count ?? 1, period: e.target.value as Period },
                        })
                      }
                    >
                      {PERIODS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
                <td className={td}>
                  <NoteField
                    value={it.notes}
                    lang={lang}
                    refs={refs}
                    onChange={(notes) => patch(i, { notes })}
                  />
                </td>
                <td className={td}>
                  <button
                    type="button"
                    className="text-danger text-sm"
                    title="Remove"
                    onClick={() => onChange(items.filter((_, j) => j !== i))}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        className={btn}
        onClick={() => onChange([...items, { name: '', priority: 'C' }])}
      >
        + item
      </button>
      <p className="text-content-subtle text-xs">
        A name matching the game catalog resolves its icon; anything else shows as plain text (use a
        localized label for generics like “Cosmetic”).
      </p>
    </div>
  );
}

/* --- Shop en texte (Supply / Rico) --- */

function TextShopEditor({
  shop,
  lang,
  refs,
  onChange,
}: {
  shop: TextShop;
  lang: L;
  refs: InlineRefs;
  onChange: (shop: TextShop) => void;
}) {
  const setPara = (i: number, v?: LocalizedText) => {
    const paragraphs = v
      ? shop.paragraphs.map((p, j) => (j === i ? v : p))
      : shop.paragraphs.filter((_, j) => j !== i);
    onChange({ ...shop, paragraphs });
  };
  return (
    <div className="max-w-3xl space-y-3">
      <p className="text-content-strong text-sm font-semibold">Paragraphs</p>
      <div className="space-y-2">
        {shop.paragraphs.map((p, i) => (
          <div key={i} className="grid grid-cols-[1fr_auto] items-start gap-2">
            <NoteField
              value={p}
              lang={lang}
              refs={refs}
              placeholder="+ paragraph"
              onChange={(v) => setPara(i, v)}
            />
            <button
              type="button"
              className="text-danger text-sm"
              title="Remove"
              onClick={() => setPara(i, undefined)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        className={btn}
        onClick={() => onChange({ ...shop, paragraphs: [...shop.paragraphs, { en: '' }] })}
      >
        + paragraph
      </button>
      <div>
        <p className="text-content-strong mb-1 text-sm font-semibold">Gear note (optional)</p>
        <NoteField
          value={shop.gearNote}
          lang={lang}
          refs={refs}
          placeholder="+ gear note"
          onChange={(gearNote) => onChange({ ...shop, gearNote })}
        />
      </div>
    </div>
  );
}

/* --- Éditeur principal --- */

export function ShopPrioritiesEditor({
  initial,
  refs,
}: {
  initial: ShopPrioritiesEditData;
  refs: InlineRefs;
}) {
  const [lang, setLang] = useState<L>('en');
  const [overlay, setOverlay] = useState<Record<string, OverlayEntry>>(() => {
    const o: Record<string, OverlayEntry> = {};
    for (const shop of initial.derived)
      for (const r of shop.rows)
        if (r.priority || r.notes)
          o[r.key] = {
            ...(r.priority ? { priority: r.priority } : {}),
            ...(r.notes ? { notes: r.notes } : {}),
          };
    return o;
  });
  const [editorial, setEditorial] = useState<ShopEditorial>(() =>
    structuredClone(initial.editorial),
  );
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [trans, setTrans] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [transMsg, setTransMsg] = useState<string | null>(null);

  const derivedByKey = useMemo(
    () => new Map(initial.derived.map((s) => [s.key, s])),
    [initial.derived],
  );

  // Photo des EN au chargement : référence de ce qui est « déjà traduit ».
  const [freshness] = useState(() =>
    createFreshness(allTexts(overlay, editorial).map((t) => t.en)),
  );

  const setEntry = (slug: string, patch: OverlayEntry) => {
    setOverlay((prev) => {
      const next = { ...prev };
      if (patch.priority || hasText(patch.notes)) next[slug] = patch;
      else delete next[slug];
      return next;
    });
  };

  /* --- Traduction EN → autres langues (seulement ce qui a bougé) --- */
  async function translateAll() {
    setTrans('loading');
    setTransMsg(null);
    const targets = LANGS.filter((l) => l !== 'en');
    const stale = allTexts(overlay, editorial).filter((t) => freshness.isStale(t, targets));
    if (!stale.length) {
      setTrans('done');
      setTransMsg('Nothing to translate — every English text is already up to date.');
      return;
    }
    try {
      const { results, provider } = await autoTranslate(
        stale.map((t) => t.en!),
        targets,
      );
      let filled = 0;
      stale.forEach((rec, k) => {
        filled += applyTranslation(rec, results[k] ?? {}, targets);
        freshness.markFresh(rec);
      });
      // Les objets mutés sont partagés par référence avec les états → on force le rerender.
      setOverlay((o) => ({ ...o }));
      setEditorial((e) => ({ ...e }));
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

  async function save() {
    setState('saving');
    setError(null);
    try {
      const res = await fetch('/api/admin/guides/general-guides/shop-purchase-priorities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ op: 'save', data: { overlay, editorial } }),
      });
      const json = (await res.json()) as { ok: boolean; errors?: string[] };
      if (!json.ok) throw new Error(json.errors?.join(' · ') ?? res.statusText);
      setState('saved');
    } catch (e) {
      setState('error');
      setError((e as Error).message);
    }
  }

  const shopNote = (key: string): LocalizedText | undefined => editorial.shopNotes[key];
  const setShopNote = (key: string, v?: LocalizedText) =>
    setEditorial((e) => {
      const shopNotes = { ...e.shopNotes };
      if (hasText(v)) shopNotes[key] = v!;
      else delete shopNotes[key];
      return { ...e, shopNotes };
    });

  const tabs = [
    ...DERIVED_ORDER.filter((k) => derivedByKey.has(k)).map((key) => ({
      key,
      label: DERIVED_LABEL[key] ?? key,
      content: (
        <div className="space-y-3">
          {editorial.shopNotes[key] !== undefined || key === 'joint' ? (
            <ShopNoteRow
              value={shopNote(key)}
              lang={lang}
              refs={refs}
              onChange={(v) => setShopNote(key, v)}
            />
          ) : null}
          <DerivedTable
            shop={derivedByKey.get(key)!}
            overlay={overlay}
            lang={lang}
            refs={refs}
            setEntry={setEntry}
          />
        </div>
      ),
    })),
    {
      key: 'event',
      label: 'Event',
      content: (
        <div className="space-y-3">
          <ShopNoteRow
            value={shopNote('event')}
            lang={lang}
            refs={refs}
            onChange={(v) => setShopNote('event', v)}
          />
          <EditorialTable
            items={editorial.eventItems}
            lang={lang}
            refs={refs}
            onChange={(eventItems) => setEditorial((e) => ({ ...e, eventItems }))}
          />
        </div>
      ),
    },
    {
      key: 'resource',
      label: 'General / Resource',
      content: (
        <EditorialTable
          items={editorial.resourceItems}
          lang={lang}
          refs={refs}
          onChange={(resourceItems) => setEditorial((e) => ({ ...e, resourceItems }))}
        />
      ),
    },
    ...(['supply', 'rico'] as const)
      .filter((k) => editorial.textShops[k])
      .map((key) => ({
        key,
        label: key === 'supply' ? 'Supply Module' : 'Rico Secret',
        content: (
          <TextShopEditor
            shop={editorial.textShops[key]}
            lang={lang}
            refs={refs}
            onChange={(shop) =>
              setEditorial((e) => ({ ...e, textShops: { ...e.textShops, [key]: shop } }))
            }
          />
        ),
      })),
  ];

  return (
    <div className="space-y-4">
      <p className="text-content-subtle text-sm">
        The 8 currency shops are <strong>derived from the game</strong> — only priority and notes
        are editable here; saving regenerates <code>shop-priorities.json</code>. Event, General,
        Supply and Rico are fully editorial.
      </p>

      {/* Langue + traduction */}
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

      <EditorTabs tabs={tabs} />

      <div className="border-line-subtle flex items-center gap-3 border-t pt-4">
        <button type="button" className={btn} onClick={save} disabled={state === 'saving'}>
          {state === 'saving' ? 'Saving…' : 'Save'}
        </button>
        {state === 'saved' && <span className="text-success text-sm">✓ saved & regenerated</span>}
        {(state === 'error' || error) && <span className="text-danger text-sm">{error}</span>}
      </div>
    </div>
  );
}

/**
 * Tous les textes localisés porteurs d'un EN, comme OBJETS (la traduction écrit
 * dedans) : notes de l'overlay + notes de shop + items éditoriaux (labels/notes)
 * + paragraphes des shops texte.
 */
function allTexts(
  overlay: Record<string, OverlayEntry>,
  editorial: ShopEditorial,
): LocalizedText[] {
  const out: LocalizedText[] = [];
  const push = (t?: LocalizedText) => {
    if (t?.en?.trim()) out.push(t);
  };
  for (const e of Object.values(overlay)) push(e.notes);
  for (const n of Object.values(editorial.shopNotes)) push(n);
  for (const it of [...editorial.eventItems, ...editorial.resourceItems]) {
    push(it.label);
    push(it.notes);
  }
  for (const shop of Object.values(editorial.textShops)) {
    shop.paragraphs.forEach(push);
    push(shop.gearNote);
  }
  return out;
}
