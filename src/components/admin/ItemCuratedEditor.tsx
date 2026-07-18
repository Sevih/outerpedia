'use client';

import { useState } from 'react';
import type { LangDict } from '@contracts';
import type { ItemCurated } from '@/lib/admin/item-curated-store';
import { postJson } from '@/lib/admin/post-json';
import { img } from '@/lib/images';
import { ItemInline } from '@/components/inline/ItemInline';

const LANGS = ['en', 'jp', 'kr', 'zh'] as const;
const field =
  'w-full rounded-md border border-line bg-surface-base px-3 py-1.5 text-sm text-content focus:border-accent focus:outline-none';
const label = 'text-xs font-semibold uppercase tracking-wide text-content-subtle';

type Status = { kind: 'idle' | 'ok' | 'err'; msg?: string };
type Loc = Record<string, string>;

const compact = (v: Loc): LangDict | undefined => {
  const out: Record<string, string> = {};
  for (const l of LANGS) if (v[l]?.trim()) out[l] = v[l].trim();
  return Object.keys(out).length ? (out as LangDict) : undefined;
};

export interface ItemBase {
  kind: 'item' | 'goods' | 'costume' | 'custom';
  name: LangDict;
  desc?: LangDict;
  icon: string;
  grade: string;
}

/**
 * Éditeur curé d'UN item/monnaie : override nom / description / icône / masquage,
 * ou CRÉATION (id absent des données). Le nom/desc se récupèrent par clé texte
 * (TextSystem/TextItem) ou à la main. Tout vider + enregistrer supprime l'entrée.
 */
export function ItemCuratedEditor({
  id,
  base,
  initial,
  creation = false,
}: {
  id: string;
  base: ItemBase;
  initial: ItemCurated;
  creation?: boolean;
}) {
  const [name, setName] = useState<Loc>({ ...(initial.name ?? {}) });
  const [desc, setDesc] = useState<Loc>({ ...(initial.desc ?? {}) });
  const [icon, setIcon] = useState(initial.icon ?? '');
  const [hidden, setHidden] = useState(Boolean(initial.hidden));
  const [note, setNote] = useState(initial.note ?? '');
  const [nameKey, setNameKey] = useState('');
  const [descKey, setDescKey] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  /** Récupère un texte du jeu par clé et remplit le champ (nom ou desc). */
  async function pull(key: string, apply: (d: Loc) => void) {
    const k = key.trim();
    if (!k) return;
    setStatus({ kind: 'idle' });
    try {
      const res = await fetch(`/api/admin/text/resolve?key=${encodeURIComponent(k)}`);
      const { text } = (await res.json().catch(() => ({}))) as { text?: LangDict | null };
      if (text)
        apply({ en: text.en ?? '', jp: text.jp ?? '', kr: text.kr ?? '', zh: text.zh ?? '' });
      else setStatus({ kind: 'err', msg: `Clé texte introuvable : ${k}` });
    } catch (e) {
      setStatus({ kind: 'err', msg: (e as Error).message });
    }
  }

  // Aperçu = valeur effective (override sinon extraction).
  const effIcon = icon.trim() || base.icon;
  const effName = name.en?.trim() || base.name.en || id;
  const effDesc = desc.en?.trim() || base.desc?.en;

  function build(): ItemCurated {
    const c: ItemCurated = {};
    const n = compact(name);
    const d = compact(desc);
    if (n) c.name = n;
    if (d) c.desc = d;
    if (icon.trim()) c.icon = icon.trim();
    if (hidden) c.hidden = true;
    if (note.trim()) c.note = note.trim();
    return c;
  }

  async function save() {
    const built = build();
    if (creation && !built.name?.en) {
      setStatus({ kind: 'err', msg: 'Une création doit au moins avoir un nom EN.' });
      return;
    }
    setStatus({ kind: 'idle' });
    try {
      await postJson(`/api/admin/curated/items/${encodeURIComponent(id)}`, built);
      setStatus({ kind: 'ok', msg: 'Enregistré' });
    } catch (e) {
      setStatus({ kind: 'err', msg: (e as Error).message });
    }
  }

  return (
    <div className="space-y-5">
      {/* Aperçu live */}
      <div className="border-line-subtle bg-surface-raised flex items-center gap-3 rounded-lg border p-3">
        <ItemInline
          item={{
            name: effName,
            iconSrc: effIcon ? img.item(effIcon) : '',
            grade: base.grade,
            desc: effDesc,
          }}
          size={28}
        />
        <span className="text-content-subtle text-xs">
          {base.kind} · <span className="font-mono">{id}</span> · grade {base.grade}
        </span>
      </div>

      <section className="space-y-2">
        <p className={label}>Nom (vide = garde l&apos;extrait)</p>
        <div className="flex items-center gap-2">
          <input
            className={`${field} max-w-64`}
            value={nameKey}
            onChange={(e) => setNameKey(e.target.value)}
            placeholder="clé texte (ex. SYS_STAMINA) → récupérer"
          />
          <button
            type="button"
            className="border-line hover:border-accent rounded-md border px-2 py-1.5 text-xs whitespace-nowrap"
            onClick={() => pull(nameKey, setName)}
          >
            récupérer
          </button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {LANGS.map((l) => (
            <div key={l} className="flex items-center gap-2">
              <span className="text-content-subtle w-6 text-xs uppercase">{l}</span>
              <input
                className={field}
                value={name[l] ?? ''}
                onChange={(e) => setName((s) => ({ ...s, [l]: e.target.value }))}
                placeholder={base.name[l] ?? ''}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <p className={label}>Description (vide = garde l&apos;extrait)</p>
        <div className="flex items-center gap-2">
          <input
            className={`${field} max-w-64`}
            value={descKey}
            onChange={(e) => setDescKey(e.target.value)}
            placeholder="clé texte (ex. SYS_DISC_TICKET_STAMINA) → récupérer"
          />
          <button
            type="button"
            className="border-line hover:border-accent rounded-md border px-2 py-1.5 text-xs whitespace-nowrap"
            onClick={() => pull(descKey, setDesc)}
          >
            récupérer
          </button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {LANGS.map((l) => (
            <div key={l} className="flex items-start gap-2">
              <span className="text-content-subtle w-6 pt-2 text-xs uppercase">{l}</span>
              <textarea
                className={`${field} h-16`}
                value={desc[l] ?? ''}
                onChange={(e) => setDesc((s) => ({ ...s, [l]: e.target.value }))}
                placeholder={base.desc?.[l] ?? ''}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <p className={label}>Icône (sprite `items`)</p>
          <div className="flex items-center gap-2">
            {effIcon && (
              <span className="border-line bg-surface-base relative h-8 w-8 shrink-0 rounded border">
                {/* eslint-disable-next-line @next/next/no-img-element -- aperçu admin */}
                <img
                  src={img.item(effIcon)}
                  alt=""
                  className="absolute inset-0 h-full w-full object-contain"
                />
              </span>
            )}
            <input
              className={field}
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder={base.icon || 'TI_Item_…'}
            />
          </div>
        </div>
        <label className="text-content flex items-center gap-2 self-end pb-2 text-sm">
          <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} />
          Masquer (bruit / interne)
        </label>
      </section>

      <section className="space-y-1">
        <p className={label}>Note interne</p>
        <textarea
          className={`${field} h-16`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </section>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          className="bg-accent text-accent-fg rounded-md px-4 py-2 text-sm font-semibold hover:opacity-90"
        >
          Enregistrer
        </button>
        <span className="text-content-subtle text-xs">
          Tout vider + enregistrer = supprime l&apos;override.
        </span>
        {status.kind === 'ok' && <span className="text-success text-sm">{status.msg}</span>}
        {status.kind === 'err' && <span className="text-danger text-sm">{status.msg}</span>}
      </div>
    </div>
  );
}
