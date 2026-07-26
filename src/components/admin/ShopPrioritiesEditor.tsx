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
  OverlayEntry,
  ShopEditorial,
  ShopPrioritiesEditData,
} from '@/lib/admin/shop-priorities-store';
import { createFreshness } from '@/lib/admin/translate-fill';
import { useAutoTranslate } from '@/lib/admin/useAutoTranslate';
import { TranslateButton } from '@/components/admin/TranslateButton';
import { EditorTabs } from '@/components/admin/EditorTabs';

import {
  LANGS,
  DERIVED_ORDER,
  DERIVED_LABEL,
  ShopNoteRow,
  DerivedTable,
  EditorialTable,
  TextShopEditor,
  btn,
  hasText,
  type L,
} from '@/components/admin/shop/ShopBlocks';
import { allTexts } from '@/components/admin/shop/shop-text';

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
  const translate = useAutoTranslate({
    langs: LANGS,
    freshness,
    // Mutation EN PLACE : ici les textes appartiennent déjà aux états, il n'y a
    // donc pas de copie à publier (`draft` vide) — seulement le rerender à
    // forcer, les objets mutés étant partagés par référence.
    collect: () => ({ draft: undefined, records: allTexts(overlay, editorial) }),
    commit: () => {
      setOverlay((o) => ({ ...o }));
      setEditorial((e) => ({ ...e }));
    },
  });

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
        <TranslateButton t={translate} className={btn} />
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
