'use client';

import { useState } from 'react';
import { LANGS, LANGUAGES, type Lang } from '@/lib/i18n/config';
import type { ChangelogEntry, ChangelogLink, ChangelogType } from '@/lib/data/changelog';
import { postJson } from '@/lib/admin/post-json';
import { rowKey } from '@/lib/admin/keyed';
import { RegenFromV2Button } from './RegenFromV2Button';

const input =
  'rounded-md border border-line bg-surface-base px-2 py-1 text-sm text-content focus:border-accent focus:outline-none';

/** Les 6 familles + libellé court (admin FR). */
const TYPES: { value: ChangelogType; label: string }[] = [
  { value: 'guide', label: 'Guide' },
  { value: 'update', label: 'Mise à jour' },
  { value: 'feature', label: 'Page / outil' },
  { value: 'character', label: 'Perso' },
  { value: 'news', label: 'News' },
  { value: 'fix', label: 'Correctif' },
];

type LinkKind = '' | ChangelogLink['kind'];
const LINK_KINDS: { value: LinkKind; label: string }[] = [
  { value: '', label: 'aucun lien' },
  { value: 'character', label: 'perso (slug)' },
  { value: 'guide', label: 'guide (chemin)' },
  { value: 'tool', label: 'outil (chemin)' },
  { value: 'page', label: 'page (chemin)' },
];

/**
 * Presets = raccourcis pour les cas récurrents : chacun pré-remplit type + nature
 * du lien d'une nouvelle entrée (le reste est à compléter). « Manuel » = vierge.
 */
const PRESETS: { label: string; row: Partial<Row> }[] = [
  { label: 'Guide MàJ saison', row: { type: 'update', linkKind: 'guide' } },
  { label: 'Nouveau guide', row: { type: 'guide', linkKind: 'guide' } },
  { label: 'Page / outil', row: { type: 'feature', linkKind: 'tool' } },
  { label: 'Fiche perso', row: { type: 'character', linkKind: 'character' } },
  { label: 'News', row: { type: 'news', linkKind: 'page' } },
  { label: 'Correctif', row: { type: 'fix' } },
  { label: 'Manuel', row: {} },
];

type Row = {
  _key: string;
  date: string;
  type: ChangelogType;
  draft: boolean;
  title: Partial<Record<Lang, string>>;
  content: Partial<Record<Lang, string[]>>;
  linkKind: LinkKind;
  linkValue: string;
};
type Status = { kind: 'idle' | 'ok' | 'err'; msg?: string };

const todayUtc = (): string => new Date().toISOString().slice(0, 10);

function toRow(e: ChangelogEntry): Row {
  return {
    _key: rowKey(),
    date: e.date,
    type: e.type,
    draft: e.draft ?? false,
    title: { ...e.title },
    content: { ...e.content },
    linkKind: e.link?.kind ?? '',
    linkValue: e.link ? (e.link.kind === 'character' ? e.link.slug : e.link.href) : '',
  };
}

function buildLink(kind: LinkKind, value: string): ChangelogLink | undefined {
  const v = value.trim();
  if (!kind || !v) return undefined;
  if (kind === 'character') return { kind: 'character', slug: v };
  return { kind, href: v } as ChangelogLink;
}

function toEntry(r: Row): ChangelogEntry {
  const title: Partial<Record<Lang, string>> = {};
  const content: Partial<Record<Lang, string[]>> = {};
  for (const l of LANGS) {
    const t = r.title[l]?.trim();
    if (t) title[l] = t;
    const lines = (r.content[l] ?? []).map((s) => s.trim()).filter(Boolean);
    if (lines.length) content[l] = lines;
  }
  const link = buildLink(r.linkKind, r.linkValue);
  return {
    date: r.date,
    type: r.type,
    title,
    content,
    ...(link && { link }),
    ...(r.draft && { draft: true }),
  };
}

const byDateDesc = (l: Row[]): Row[] =>
  [...l].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

/** Éditeur du journal du site (page /changelog). Édition d'une langue à la fois. */
export function ChangelogEditor({ initial }: { initial: ChangelogEntry[] }) {
  const [rows, setRows] = useState<Row[]>(() => byDateDesc(initial.map(toRow)));
  const [lang, setLang] = useState<Lang>('en');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const today = todayUtc();

  const set = (i: number, patch: Partial<Row>) =>
    setRows((s) => s.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const setTitle = (i: number, value: string) =>
    set(i, { title: { ...rows[i].title, [lang]: value } });
  const setContent = (i: number, value: string) =>
    set(i, { content: { ...rows[i].content, [lang]: value.split('\n') } });

  const addRow = (preset: Partial<Row>) =>
    setRows((s) => [
      {
        _key: rowKey(),
        date: today,
        type: 'guide',
        draft: false,
        title: {},
        content: {},
        linkKind: '',
        linkValue: '',
        ...preset,
      },
      ...s,
    ]);
  const remove = (i: number) => setRows((s) => s.filter((_, j) => j !== i));

  async function save() {
    setStatus({ kind: 'idle' });
    try {
      await postJson('/api/admin/curated/changelog', rows.map(toEntry));
      setStatus({ kind: 'ok', msg: 'Enregistré' });
    } catch (e) {
      setStatus({ kind: 'err', msg: (e as Error).message });
    }
  }

  return (
    <div className="space-y-4">
      {/* Barre d'actions */}
      <div className="border-line-subtle bg-surface-base sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b py-2">
        <button
          type="button"
          onClick={save}
          className="bg-accent text-accent-fg rounded-md px-4 py-2 text-sm font-semibold hover:opacity-90"
        >
          Enregistrer
        </button>
        {status.kind === 'ok' && <span className="text-success text-sm">{status.msg}</span>}
        {status.kind === 'err' && <span className="text-danger text-sm">{status.msg}</span>}
        <RegenFromV2Button
          kind="changelog"
          onRegen={(d) => setRows(byDateDesc((d as ChangelogEntry[]).map(toRow)))}
        />

        {/* Sélecteur de langue (édite une langue à la fois) */}
        <div className="ml-auto flex items-center gap-1">
          {LANGS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className={`rounded-md px-2 py-1 font-mono text-xs ${
                l === lang ? 'bg-accent text-accent-fg' : 'border-line text-content-subtle border'
              }`}
            >
              {LANGUAGES[l].abbrev}
            </button>
          ))}
        </div>
        <span className="text-content-subtle text-xs">{rows.length} entrée(s)</span>
      </div>

      {/* Presets — nouvelle entrée pré-remplie */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-content-subtle text-xs uppercase">Nouvelle entrée</span>
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => addRow(p.row)}
            className="border-line hover:border-accent rounded-md border px-2.5 py-1 text-xs"
          >
            + {p.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {rows.map((r, i) => {
          const scheduled = !r.draft && r.date > today;
          return (
            <div key={r._key} className="border-line-subtle space-y-2 rounded-lg border p-3">
              {/* Ligne 1 : date, type, brouillon, état, suppression */}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  className={input}
                  value={r.date}
                  onChange={(e) => set(i, { date: e.target.value })}
                />
                <select
                  className={input}
                  value={r.type}
                  onChange={(e) => set(i, { type: e.target.value as ChangelogType })}
                >
                  {TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <label className="text-content-subtle flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={r.draft}
                    onChange={(e) => set(i, { draft: e.target.checked })}
                  />
                  brouillon
                </label>
                {r.draft && (
                  <span className="text-content-subtle bg-surface-overlay rounded px-2 py-0.5 text-[10px] font-semibold uppercase">
                    caché
                  </span>
                )}
                {scheduled && (
                  <span className="text-cat-amber-fg bg-cat-amber-fg/15 rounded px-2 py-0.5 text-[10px] font-semibold uppercase">
                    programmée
                  </span>
                )}
                <button
                  type="button"
                  className="text-danger ml-auto text-sm"
                  onClick={() => remove(i)}
                  aria-label="Supprimer l'entrée"
                >
                  ✕
                </button>
              </div>

              {/* Titre (langue active) */}
              <div className="flex items-center gap-2">
                <span className="text-content-subtle w-16 shrink-0 text-xs">
                  Titre {lang === 'en' && <span className="text-danger">*</span>}
                </span>
                <input
                  className={`${input} flex-1`}
                  value={r.title[lang] ?? ''}
                  placeholder={
                    lang === 'en' ? 'Titre EN (requis)' : `Titre ${LANGUAGES[lang].abbrev}`
                  }
                  onChange={(e) => setTitle(i, e.target.value)}
                />
              </div>

              {/* Contenu (langue active, une puce par ligne) */}
              <div className="flex items-start gap-2">
                <span className="text-content-subtle w-16 shrink-0 pt-1 text-xs">Puces</span>
                <textarea
                  className={`${input} min-h-16 flex-1`}
                  value={(r.content[lang] ?? []).join('\n')}
                  placeholder="Une puce par ligne"
                  onChange={(e) => setContent(i, e.target.value)}
                />
              </div>

              {/* Lien typé + image (chemin — upload à venir) */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-content-subtle w-16 shrink-0 text-xs">Lien</span>
                <select
                  className={input}
                  value={r.linkKind}
                  onChange={(e) => set(i, { linkKind: e.target.value as LinkKind })}
                >
                  {LINK_KINDS.map((k) => (
                    <option key={k.value} value={k.value}>
                      {k.label}
                    </option>
                  ))}
                </select>
                {r.linkKind && (
                  <input
                    className={`${input} flex-1 font-mono`}
                    value={r.linkValue}
                    placeholder={r.linkKind === 'character' ? 'slug (ex. anarky)' : '/guides/...'}
                    onChange={(e) => set(i, { linkValue: e.target.value })}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
