'use client';

/**
 * Briques d'édition des PRIORITÉS DE SHOP (audit F9) — sorties de
 * `ShopPrioritiesEditor`, qui approchait 730 lignes.
 *
 * ⚠ CE DÉCOUPAGE EST UNE PROTECTION, pas seulement du rangement — le fichier
 * d'origine le disait déjà en tête : « les sous-composants restent au niveau
 * MODULE (sinon remontage → perte de focus) ». Déclarés dans le corps de
 * l'éditeur, leur identité change à chaque rendu et React démonte puis remonte
 * tout leur sous-arbre à CHAQUE frappe. Dans un fichier séparé, l'erreur devient
 * impossible à commettre par distraction.
 *
 * Rappel du modèle : sur les 8 shops DÉRIVÉS du jeu, le factuel (icône, nom,
 * coût, limite) est en LECTURE SEULE — seules la priorité S/A/B/C et les notes
 * sont curées. Les shops ÉDITORIAUX, eux, sont éditables de bout en bout.
 */
import { useState } from 'react';
import type { LocalizedText } from '@contracts';
import type { InlineRefs } from '@/lib/admin/inline-refs';
import type {
  DerivedShop,
  DerivedRow,
  EditorialItem,
  OverlayEntry,
  TextShop,
} from '@/lib/admin/shop-priorities-store';
import { InlineTextField } from '@/components/admin/InlineTextField';
import { ItemInline } from '@/components/inline/ItemInline';
import { img } from '@/lib/images';
import { LANGS } from '@/lib/i18n/config';
import { btn, input } from '../_ui';
export { btn };

/** Langues du SITE (5) — dérivées de la source de vérité i18n. */
export { LANGS };
export type L = (typeof LANGS)[number];
export type Priority = 'S' | 'A' | 'B' | 'C';
export const PRIORITIES: Priority[] = ['S', 'A', 'B', 'C'];
export const PERIODS = ['daily', 'weekly', 'monthly', 'one-time'] as const;
export type Period = (typeof PERIODS)[number];

/** Onglets dérivés (dans l'ordre du guide) + note de shop associée. */
export const DERIVED_ORDER = [
  'guild',
  'joint',
  'friend',
  'arena',
  'stars',
  'worldboss',
  'al',
  'survey',
];
export const DERIVED_LABEL: Record<string, string> = {
  guild: 'Guild',
  joint: 'Joint Challenge',
  friend: 'Friendship',
  arena: 'Arena',
  stars: "Star's Memory",
  worldboss: 'World Boss',
  al: 'Adventure License',
  survey: 'Survey Hub',
};

const th = 'px-2.5 py-1.5 text-left text-xs font-medium text-content-subtle';
const td = 'px-2.5 py-1.5 align-top';

export const PRIORITY_BADGE: Record<Priority, string> = {
  S: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/40',
  A: 'bg-sky-500/15 text-sky-300 ring-sky-500/40',
  B: 'bg-amber-500/15 text-amber-300 ring-amber-500/40',
  C: 'bg-surface-sunken text-content-subtle ring-line-subtle',
};

const fmt = (n: number): string => n.toLocaleString('en-US');
export const hasText = (t?: LocalizedText): boolean =>
  t ? Object.values(t).some((v) => v?.trim()) : false;

/* --- Sélecteur de priorité (S/A/B/C, re-clic = efface) --- */

export function PriorityPicker({
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

export function NoteField({
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

export function ShopNoteRow({
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

export function DerivedItemCell({ row, lang }: { row: DerivedRow; lang: L }) {
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

export function DerivedTable({
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

export function EditorialTable({
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

export function TextShopEditor({
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
