'use client';

import { useMemo, useState } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { EECard, GearCard, SetCard, TalismanCard } from './cards';
import type { EERow, GearRow, RowSource, SetRow } from './cards';

/** Libellés pré-traduits (la page serveur passe le dictionnaire). */
export interface BrowserLabels {
  tabs: { weapons: string; amulets: string; sets: string; talismans: string; ee: string };
  search: string;
  class: string;
  element: string;
  source: string;
  mainStat: string;
  unlock: string;
  upgrade: string;
}

const field =
  'rounded-md border border-line bg-surface-base px-2 py-1.5 text-sm text-content focus:border-accent focus:outline-none';

/** Clé de filtre d'une source : chaque boss + chaque libellé est une option. */
function sourceOptions(rows: { source?: RowSource }[]): { value: string; label: string }[] {
  const out = new Map<string, string>();
  for (const r of rows) {
    for (const b of r.source?.bosses ?? []) out.set(`b:${b.id}`, b.name);
    if (r.source?.label) out.set(`l:${r.source.label}`, r.source.label);
  }
  return [...out.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function matchesSource(r: { source?: RowSource }, sel: string): boolean {
  if (!sel) return true;
  if (sel.startsWith('b:')) return Boolean(r.source?.bosses.some((b) => b.id === sel.slice(2)));
  return r.source?.label === sel.slice(2);
}

/** Onglet armes / amulettes (filtres classe / étoiles / source / main stat). */
function GearTab({
  rows,
  labels,
  withMainStat,
}: {
  rows: GearRow[];
  labels: BrowserLabels;
  withMainStat?: boolean;
}) {
  const [q, setQ] = useState('');
  const [klass, setKlass] = useState('');
  const [star, setStar] = useState(0);
  const [source, setSource] = useState('');
  const [mainStat, setMainStat] = useState('');

  const classes = useMemo(() => [...new Set(rows.flatMap((r) => r.classLimits))].sort(), [rows]);
  const stars = useMemo(
    () => [...new Set(rows.map((r) => r.stars.at(-1) ?? 0))].filter(Boolean).sort((a, b) => b - a),
    [rows],
  );
  const sources = useMemo(() => sourceOptions(rows), [rows]);
  const mainStats = useMemo(() => [...new Set(rows.flatMap((r) => r.mainStats))].sort(), [rows]);

  const filtered = rows.filter(
    (r) =>
      (!q || r.name.toLowerCase().includes(q.trim().toLowerCase())) &&
      (!klass || r.classLimits.length === 0 || r.classLimits.includes(klass)) &&
      (!star || (r.stars.at(-1) ?? 0) === star) &&
      matchesSource(r, source) &&
      (!mainStat || r.mainStats.includes(mainStat)),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          className={`${field} w-44`}
          placeholder={labels.search}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className={field} value={klass} onChange={(e) => setKlass(e.target.value)}>
          <option value="">{labels.class}</option>
          {classes.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-1">
          {stars.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStar(star === s ? 0 : s)}
              className={`rounded-md border px-2 py-1 text-xs ${
                star === s
                  ? 'border-accent text-accent'
                  : 'border-line text-content-subtle hover:text-content'
              }`}
            >
              {s}★
            </button>
          ))}
        </div>
        {sources.length > 0 && (
          <select className={field} value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="">{labels.source}</option>
            {sources.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        )}
        {withMainStat && (
          <select className={field} value={mainStat} onChange={(e) => setMainStat(e.target.value)}>
            <option value="">{labels.mainStat}</option>
            {mainStats.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        )}
        <span className="text-content-subtle ml-auto text-xs">{filtered.length}</span>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((r) => (
          <GearCard key={r.id} row={r} sourceTitle={labels.source} />
        ))}
      </div>
    </div>
  );
}

function SetsTab({ rows, labels }: { rows: SetRow[]; labels: BrowserLabels }) {
  const [q, setQ] = useState('');
  const [source, setSource] = useState('');
  const sources = useMemo(() => sourceOptions(rows), [rows]);
  const filtered = rows.filter(
    (r) =>
      (!q || r.name.toLowerCase().includes(q.trim().toLowerCase())) && matchesSource(r, source),
  );
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          className={`${field} w-44`}
          placeholder={labels.search}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {sources.length > 0 && (
          <select className={field} value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="">{labels.source}</option>
            {sources.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        )}
        <span className="text-content-subtle ml-auto text-xs">{filtered.length}</span>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((r) => (
          <SetCard key={r.id} row={r} sourceTitle={labels.source} />
        ))}
      </div>
    </div>
  );
}

function TalismansTab({ rows, labels }: { rows: GearRow[]; labels: BrowserLabels }) {
  const [q, setQ] = useState('');
  const [mode, setMode] = useState('');
  const filtered = rows.filter(
    (r) =>
      (!q || r.name.toLowerCase().includes(q.trim().toLowerCase())) && (!mode || r.mode === mode),
  );
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          className={`${field} w-44`}
          placeholder={labels.search}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="flex items-center gap-1">
          {(['AP', 'CP'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(mode === m ? '' : m)}
              className={`rounded-md border px-2 py-1 text-xs ${
                mode === m
                  ? 'border-accent text-accent'
                  : 'border-line text-content-subtle hover:text-content'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <span className="text-content-subtle ml-auto text-xs">{filtered.length}</span>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((r) => (
          <TalismanCard key={r.id} row={r} sourceTitle={labels.source} />
        ))}
      </div>
    </div>
  );
}

function EETab({ rows, labels }: { rows: EERow[]; labels: BrowserLabels }) {
  const [q, setQ] = useState('');
  const [element, setElement] = useState('');
  const [klass, setKlass] = useState('');
  const elements = useMemo(() => [...new Set(rows.map((r) => r.element))].sort(), [rows]);
  const classes = useMemo(() => [...new Set(rows.map((r) => r.classType))].sort(), [rows]);
  const filtered = rows.filter((r) => {
    const needle = q.trim().toLowerCase();
    return (
      (!needle ||
        r.name.toLowerCase().includes(needle) ||
        r.charName.toLowerCase().includes(needle)) &&
      (!element || r.element === element) &&
      (!klass || r.classType === klass)
    );
  });
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          className={`${field} w-44`}
          placeholder={labels.search}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className={field} value={element} onChange={(e) => setElement(e.target.value)}>
          <option value="">{labels.element}</option>
          {elements.map((el) => (
            <option key={el} value={el}>
              {el}
            </option>
          ))}
        </select>
        <select className={field} value={klass} onChange={(e) => setKlass(e.target.value)}>
          <option value="">{labels.class}</option>
          {classes.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <span className="text-content-subtle ml-auto text-xs">{filtered.length}</span>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((r) => (
          <EECard
            key={r.itemId}
            row={r}
            labels={{ unlock: labels.unlock, upgrade: labels.upgrade }}
          />
        ))}
      </div>
    </div>
  );
}

export function EquipmentBrowser({
  weapons,
  amulets,
  sets,
  talismans,
  ee,
  labels,
}: {
  weapons: GearRow[];
  amulets: GearRow[];
  sets: SetRow[];
  talismans: GearRow[];
  ee: EERow[];
  labels: BrowserLabels;
}) {
  return (
    <Tabs
      urlParam="tab"
      tabs={[
        {
          id: 'weapons',
          label: labels.tabs.weapons,
          content: <GearTab rows={weapons} labels={labels} />,
        },
        {
          id: 'amulets',
          label: labels.tabs.amulets,
          content: <GearTab rows={amulets} labels={labels} withMainStat />,
        },
        { id: 'sets', label: labels.tabs.sets, content: <SetsTab rows={sets} labels={labels} /> },
        {
          id: 'talismans',
          label: labels.tabs.talismans,
          content: <TalismansTab rows={talismans} labels={labels} />,
        },
        { id: 'ee', label: labels.tabs.ee, content: <EETab rows={ee} labels={labels} /> },
      ]}
    />
  );
}
