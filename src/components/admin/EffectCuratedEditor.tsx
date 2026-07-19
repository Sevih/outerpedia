'use client';

import { useState } from 'react';
import type { EffectCurated, LangDict, LocalizedText } from '@contracts';
import { postJson } from '@/lib/admin/post-json';
import { img } from '@/lib/images';

const LANGS = ['en', 'fr', 'jp', 'kr', 'zh'] as const;
const field =
  'w-full rounded-md border border-line bg-surface-base px-3 py-1.5 text-sm text-content focus:border-accent focus:outline-none';
const label = 'text-xs font-semibold uppercase tracking-wide text-content-subtle';

type Status = { kind: 'idle' | 'ok' | 'err'; msg?: string };

/** Champ localisé (une entrée par langue) → LocalizedText compact. */
function compactLoc(values: Record<string, string>): LocalizedText | undefined {
  const out: LocalizedText = {};
  for (const l of LANGS) if (values[l]?.trim()) out[l] = values[l].trim();
  return Object.keys(out).length ? out : undefined;
}

/**
 * Éditeur de la couche curée d'un effet. Deux modes, même formulaire :
 *  - OVERRIDE d'un effet extrait (tout est optionnel, vide = hérite) ;
 *  - CRÉATION autonome (`creation`) : name/desc/icon/keys portent l'effet
 *    entier — c'est le catalogue éditorial (/admin/effects) qui se construit.
 * Tout vider puis enregistrer SUPPRIME l'entrée curée (donc la création).
 */
export function EffectCuratedEditor({
  id,
  extractedName,
  initial,
  creation = false,
}: {
  id: string;
  extractedName: LangDict;
  initial: EffectCurated;
  creation?: boolean;
}) {
  const [name, setName] = useState<Record<string, string>>({ ...(initial.name ?? {}) });
  const [desc, setDesc] = useState<Record<string, string>>({ ...(initial.desc ?? {}) });
  const [icon, setIcon] = useState(initial.icon ?? '');
  const [keys, setKeys] = useState((initial.keys ?? []).join(', '));
  const [isDebuff, setIsDebuff] = useState(
    initial.isDebuff === undefined ? '' : String(initial.isDebuff),
  );
  const [tag, setTag] = useState(initial.tag ?? '');
  const [hidden, setHidden] = useState(Boolean(initial.hidden));
  const [note, setNote] = useState(initial.note ?? '');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  function build(): EffectCurated {
    const c: EffectCurated = {};
    const n = compactLoc(name);
    const d = compactLoc(desc);
    if (n) c.name = n;
    if (d) c.desc = d;
    if (icon.trim()) c.icon = icon.trim();
    const k = keys
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (k.length) c.keys = k;
    if (isDebuff !== '') c.isDebuff = isDebuff === 'true';
    if (tag.trim()) c.tag = tag.trim();
    if (hidden) c.hidden = true;
    if (note.trim()) c.note = note.trim();
    return c;
  }

  async function save() {
    setStatus({ kind: 'idle' });
    const body = build();
    if (creation && !body.name?.en) {
      setStatus({ kind: 'err', msg: 'A creation must have at least an EN name.' });
      return;
    }
    try {
      await postJson(`/api/admin/curated/effects/${id}`, body);
      setStatus({ kind: 'ok', msg: 'Saved' });
    } catch (e) {
      setStatus({ kind: 'err', msg: (e as Error).message });
    }
  }

  return (
    <div className="space-y-5">
      <section className="space-y-2">
        <p className={label}>
          {creation ? 'Name (EN required)' : 'Rename (empty = keep the extract)'}
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {LANGS.map((l) => (
            <div key={l} className="flex items-center gap-2">
              <span className="text-content-subtle w-6 text-xs uppercase">{l}</span>
              <input
                className={field}
                value={name[l] ?? ''}
                onChange={(e) => setName((s) => ({ ...s, [l]: e.target.value }))}
                placeholder={(extractedName as Record<string, string>)[l] ?? ''}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <p className={label}>
          Description {creation ? '' : '(rare override — empty = keep the extract)'}
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {LANGS.map((l) => (
            <div key={l} className="flex items-start gap-2">
              <span className="text-content-subtle w-6 pt-2 text-xs uppercase">{l}</span>
              <textarea
                className={`${field} h-16`}
                value={desc[l] ?? ''}
                onChange={(e) => setDesc((s) => ({ ...s, [l]: e.target.value }))}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1">
          <p className={label}>Icon (sprite `ui/effect`)</p>
          <div className="flex items-center gap-2">
            {icon.trim() && (
              <span className="border-line bg-surface-base relative h-8 w-8 shrink-0 rounded border">
                {/* eslint-disable-next-line @next/next/no-img-element -- aperçu admin */}
                <img
                  src={img.effect(icon.trim())}
                  alt=""
                  className="absolute inset-0 h-full w-full object-contain"
                />
              </span>
            )}
            <input
              className={field}
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="IG_Buff_AttackUp"
            />
          </div>
        </div>
        <div className="space-y-1">
          <p className={label}>Nature</p>
          <select className={field} value={isDebuff} onChange={(e) => setIsDebuff(e.target.value)}>
            <option value="">{creation ? 'buff (default)' : 'inherited (extract)'}</option>
            <option value="false">buff</option>
            <option value="true">debuff</option>
          </select>
        </div>
        <div className="space-y-1">
          <p className={label}>Editorial tag</p>
          <input
            className={field}
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="dot, stat, cc…"
          />
        </div>
      </section>

      <section className="space-y-1">
        <p className={label}>
          Editorial keys ({'{B/…}'}/{'{D/…}'} — comma or newline)
        </p>
        <textarea
          className={`${field} h-16 font-mono text-xs`}
          value={keys}
          onChange={(e) => setKeys(e.target.value)}
          placeholder="BT_SEAL_COUNTER, UNCOUNTERABLE"
        />
      </section>

      <section className="flex items-start gap-6">
        <label className="text-content flex items-center gap-2 pt-1 text-sm whitespace-nowrap">
          <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} />
          Hide (noise / internal)
        </label>
        <div className="flex-1 space-y-1">
          <p className={label}>Internal note</p>
          <textarea
            className={`${field} h-16`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          className="bg-accent text-accent-fg rounded-md px-4 py-2 text-sm font-semibold hover:opacity-90"
        >
          Save
        </button>
        <span className="text-content-subtle text-xs">
          Clear everything + save = deletes the curated entry.
        </span>
        {status.kind === 'ok' && <span className="text-success text-sm">{status.msg}</span>}
        {status.kind === 'err' && <span className="text-danger text-sm">{status.msg}</span>}
      </div>
    </div>
  );
}
