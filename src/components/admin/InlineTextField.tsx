'use client';

/**
 * Champ de texte ÉDITORIAL inline assisté (admin) : saisie des tags `{X/…}`
 * (pros/cons, synergies, notes de reco, guides) avec barre d'insertion +
 * autocomplétion des refs, APERÇU rendu tel quel et VALIDATION en direct.
 *
 * Mono-langue : le parent gère la langue courante (préservation des autres
 * langues côté parent). L'aperçu ET la validation passent par la server action
 * `renderInlinePreview` : rendu par le VRAI `parseText` (icônes, tooltips, liens
 * — identique au site), pas une ré-implémentation client qui dériverait.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Lang } from '@/lib/i18n/config';
import type { InlineRefs, RefItem } from '@/lib/admin/inline-refs';
import type { InlineSegment, TagCheck } from '@/lib/parse-text';
import { renderInlineBatch, renderInlinePreview } from '@/lib/admin/inline-preview-actions';
import { InlinePreview } from '@/components/admin/InlinePreview';

/** Un bouton de la barre : type de tag + libellé + source de refs. */
interface TokenDef {
  type: string;
  label: string;
  refsKey: keyof InlineRefs;
}
const TOKENS: TokenDef[] = [
  { type: 'B', label: 'Buff', refsKey: 'effectBuff' },
  { type: 'D', label: 'Debuff', refsKey: 'effectDebuff' },
  { type: 'P', label: 'Perso', refsKey: 'character' },
  { type: 'SK', label: 'Skill', refsKey: 'character' },
  { type: 'EE', label: 'EE', refsKey: 'characterEE' },
  { type: 'S', label: 'Stat', refsKey: 'stat' },
  { type: 'E', label: 'Élément', refsKey: 'element' },
  { type: 'C', label: 'Classe', refsKey: 'klass' },
  { type: 'I-I', label: 'Item', refsKey: 'item' },
  { type: 'I-W', label: 'Arme', refsKey: 'weapon' },
  { type: 'I-A', label: 'Amulette', refsKey: 'amulet' },
  { type: 'I-T', label: 'Talisman', refsKey: 'talisman' },
  { type: 'AS', label: 'Set', refsKey: 'set' },
  { type: 'L', label: 'Lien', refsKey: 'guide' },
];

const SK_SLOTS = ['S1', 'S2', 'S3', 'Passive', 'Chain'];

const field =
  'w-full rounded-md border border-line bg-surface-base px-2 py-1 text-xs font-mono text-content focus:border-accent focus:outline-none';

export function InlineTextField({
  value,
  onChange,
  refs,
  lang,
  placeholder,
  rows = 2,
  layout = 'split',
  previewMode = 'block',
}: {
  value: string;
  onChange: (v: string) => void;
  refs: InlineRefs;
  /** Langue rendue par l'aperçu (le parent préserve les autres langues). */
  lang: Lang;
  placeholder?: string;
  rows?: number;
  /** `split` = saisie/aperçu côte à côte (md+) ; `stacked` = aperçu dessous. */
  layout?: 'split' | 'stacked';
  /**
   * `block` = un seul texte rendu tel quel ; `list` = une ligne par entrée,
   * rendues en LISTE (comme les conseils d'un guide : un éditeur, un rendu).
   */
  previewMode?: 'block' | 'list';
}) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [picker, setPicker] = useState<TokenDef | null>(null);
  const [query, setQuery] = useState('');
  const [skSlot, setSkSlot] = useState('S2');
  const [segments, setSegments] = useState<InlineSegment[]>([]);
  const [listSegments, setListSegments] = useState<InlineSegment[][]>([]);
  const [checks, setChecks] = useState<TagCheck[]>([]);
  const [focused, setFocused] = useState(false);

  // Aperçu FIDÈLE + validation en un seul aller-retour debouncé : la server
  // action résout via les vrais résolveurs de `parse-text` (server-only) et
  // renvoie des descripteurs + les diagnostics. On garde l'aperçu précédent
  // pendant la frappe (pas de flash). En mode `list`, chaque ligne non vide est
  // résolue séparément → rendu en liste (comme les conseils d'un guide).
  useEffect(() => {
    let cancelled = false;
    const h = setTimeout(async () => {
      try {
        const { segments: segs, checks: c } = await renderInlinePreview(value, lang);
        if (!cancelled) {
          setSegments(segs);
          setChecks(c);
        }
        if (previewMode === 'list') {
          const lines = value
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean);
          const batch = await renderInlineBatch(lines, lang);
          if (!cancelled) setListSegments(batch);
        }
      } catch {
        /* aperçu/validation indisponible — silencieux */
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(h);
    };
  }, [value, lang, previewMode]);

  /** Insère un tag `{type/val}` à la position du curseur. */
  const insert = (type: string, val: string) => {
    const ta = taRef.current;
    const start = ta?.selectionStart ?? value.length;
    const end = ta?.selectionEnd ?? value.length;
    const snippet = `{${type}/${val}}`;
    onChange(value.slice(0, start) + snippet + value.slice(end));
    setPicker(null);
    setQuery('');
    requestAnimationFrame(() => {
      const el = taRef.current;
      if (el) {
        const pos = start + snippet.length;
        el.focus();
        el.setSelectionRange(pos, pos);
      }
    });
  };

  const pick = (item: RefItem) => {
    if (!picker) return;
    // Skill : valeur = perso, on suffixe le slot choisi (Nom|S2).
    if (picker.type === 'SK') insert('SK', `${item.value}|${skSlot}`);
    else insert(picker.type, item.value);
  };

  const options = useMemo(() => {
    if (!picker) return [];
    const q = query.trim().toLowerCase();
    const list = refs[picker.refsKey];
    return (q ? list.filter((o) => o.label.toLowerCase().includes(q)) : list).slice(0, 60);
  }, [picker, query, refs]);

  const errors = checks.filter((c) => !c.ok);

  return (
    <div className="space-y-1.5">
      {/* Barre d'insertion */}
      <div className="flex flex-wrap items-center gap-1">
        {TOKENS.map((tk) => (
          <button
            key={tk.type}
            type="button"
            onClick={() => {
              setPicker(picker?.type === tk.type ? null : tk);
              setQuery('');
            }}
            className={`rounded border px-1.5 py-0.5 text-[11px] ${
              picker?.type === tk.type
                ? 'border-accent text-accent'
                : 'border-line-subtle text-content-subtle hover:text-content-strong'
            }`}
          >
            +{tk.label}
          </button>
        ))}
      </div>

      {/* Popover d'autocomplétion */}
      {picker && (
        <div className="border-line bg-surface-raised space-y-1.5 rounded-md border p-2">
          {picker.type === 'SK' && (
            <div className="flex items-center gap-1">
              <span className="text-content-subtle text-[11px] uppercase">Slot</span>
              {SK_SLOTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSkSlot(s)}
                  className={`rounded px-1.5 py-0.5 text-[11px] ${
                    skSlot === s
                      ? 'bg-accent/20 text-accent'
                      : 'text-content-muted hover:bg-surface-overlay'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Chercher un ${picker.label.toLowerCase()}…`}
            className="border-line bg-surface-base text-content w-full rounded border px-2 py-1 text-xs"
          />
          <div className="max-h-48 space-y-0.5 overflow-y-auto">
            {options.length === 0 ? (
              <p className="text-content-subtle px-1 py-2 text-xs">Aucun résultat.</p>
            ) : (
              options.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => pick(o)}
                  className="hover:bg-surface-overlay text-content flex w-full items-center justify-between gap-2 rounded px-2 py-1 text-left text-xs"
                >
                  <span className="truncate">{o.label}</span>
                  <span className="text-content-subtle shrink-0 font-mono text-[10px]">
                    {o.value}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Saisie + aperçu (côte à côte ou empilé) */}
      <div className={`grid gap-2 ${layout === 'split' ? 'md:grid-cols-2' : ''}`}>
        <textarea
          ref={taRef}
          className={`${field} min-h-9`}
          rows={rows}
          value={value}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => onChange(e.target.value)}
        />
        <div
          className={`border-line-subtle min-h-9 rounded-md border px-2 py-1 text-sm whitespace-pre-line ${
            focused ? 'border-accent/40' : ''
          }`}
          aria-label="Aperçu"
        >
          {/* Aperçu fidèle : descripteurs (server) rendus par les vrais composants. */}
          {!value.trim() ? (
            <span className="text-content-subtle text-xs">Aperçu…</span>
          ) : previewMode === 'list' ? (
            <ul className="list-disc space-y-1 pl-4">
              {listSegments.map((seg, i) => (
                <li key={i}>
                  <InlinePreview segments={seg} />
                </li>
              ))}
            </ul>
          ) : (
            <InlinePreview segments={segments} />
          )}
        </div>
      </div>

      {/* Validation */}
      {errors.length > 0 && (
        <ul className="space-y-0.5">
          {errors.map((c, i) => (
            <li key={i} className="text-danger text-[11px]">
              <span className="font-mono">{c.tag}</span> — {c.reason}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
