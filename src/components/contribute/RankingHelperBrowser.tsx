'use client';

import { useMemo, useState } from 'react';
import { CharacterPortrait } from '@/components/character/CharacterPortrait';
import { TIERS, TIER_COLORS, tierListRankOrder, type Tier } from '@/components/tierlist/tiers';
import type { RankingHelperRow } from '@/lib/contribute/ranking-helper-data';

/**
 * Outil de contribution « ranking helper » : on entre un perso, on voit sa
 * fiche condensée (rôle, tags, EE aux deux paliers) et ses HOMOLOGUES dans le
 * classement discuté — la question réelle d'une session de ranking Discord
 * n'est pas « quel rang ? » mais « par rapport à qui ? ». Anglais seul, comme
 * tout `/contribute`.
 */

type RankMode = 'pve' | 'pvp' | 'eeBase' | 'eePlus10';

const MODES: Array<{ key: RankMode; label: string }> = [
  { key: 'pve', label: 'PvE' },
  { key: 'pvp', label: 'PvP' },
  { key: 'eeBase', label: 'EE (base)' },
  { key: 'eePlus10', label: 'EE (+10)' },
];

/** Critères de cohorte combinables (ET). Par défaut rôle + élément. */
const CRITERIA = [
  { key: 'role', label: 'Same role' },
  { key: 'element', label: 'Same element' },
  { key: 'class', label: 'Same class' },
] as const;
type Criterion = (typeof CRITERIA)[number]['key'];

export function RankingHelperBrowser({ rows }: { rows: RankingHelperRow[] }) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<RankMode>('pve');
  const [criteria, setCriteria] = useState<Set<Criterion>>(new Set(['role', 'element']));

  const byId = useMemo(() => new Map(rows.map((r) => [r.id, r])), [rows]);
  const selected = selectedId ? (byId.get(selectedId) ?? null) : null;

  const q = query.trim().toLowerCase();
  const matches = useMemo(() => {
    if (!q) return [];
    return rows
      .filter((r) => r.searchNames.some((n) => n.toLowerCase().includes(q)))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 12);
  }, [rows, q]);

  const toggleCriterion = (key: Criterion) =>
    setCriteria((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  // Homologues : tous les persos RANGÉS dans le mode courant qui matchent
  // chaque critère actif (un critère sans valeur côté perso choisi est ignoré
  // plutôt que de vider la cohorte — un perso sans rôle curé arrive).
  const peers = useMemo(() => {
    if (!selected) return [];
    return rows
      .filter((r) => r.ranks[mode])
      .filter((r) => (criteria.has('role') && selected.role ? r.role === selected.role : true))
      .filter((r) => (criteria.has('element') ? r.element === selected.element : true))
      .filter((r) => (criteria.has('class') ? r.class === selected.class : true))
      .sort(tierListRankOrder((r) => r.ranks[mode]));
  }, [rows, selected, mode, criteria]);

  const pick = (id: string) => {
    setSelectedId(id);
    setQuery('');
  };

  return (
    <div className="space-y-6">
      {/* ── Recherche ── */}
      <div className="relative max-w-md">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a hero…"
          className="border-line bg-surface-raised text-content-strong placeholder:text-content-subtle focus:border-accent w-full rounded-md border px-3 py-2 text-sm outline-none"
        />
        {matches.length > 0 && (
          <ul className="border-line bg-surface-raised absolute z-10 mt-1 w-full overflow-hidden rounded-md border shadow-lg">
            {matches.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => pick(r.id)}
                  className="hover:bg-line/50 flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm"
                >
                  <CharacterPortrait id={r.id} name={r.name} size={28} showName={false} />
                  <span className="text-content-strong">
                    {r.prefix ? `${r.prefix} ` : ''}
                    {r.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {!selected && (
        <p className="text-content-subtle text-sm">
          Pick a hero to see their condensed sheet (role, tags, EE at both tiers) and where
          comparable heroes sit in each ranking.
        </p>
      )}

      {selected && (
        <>
          {/* ── Fiche condensée ── */}
          <div className="border-line-subtle bg-surface-raised rounded-lg border p-4">
            <div className="flex items-start gap-4">
              <CharacterPortrait
                id={selected.id}
                name={selected.name}
                element={selected.element}
                classType={selected.class}
                rarity={selected.rarity}
                size={72}
                showName={false}
              />
              <div className="min-w-0 flex-1">
                <h2 className="text-content-strong text-xl font-semibold">
                  {selected.prefix ? `${selected.prefix} ` : ''}
                  {selected.name}
                </h2>
                <p className="text-content-muted mt-0.5 text-sm capitalize">
                  {selected.element} · {selected.class}
                  {selected.role ? ` · ${selected.role}` : ''}
                </p>
                {selected.tags.length > 0 && (
                  <p className="text-content-subtle mt-1 text-xs">{selected.tags.join(' · ')}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {MODES.map((m) => (
                    <span
                      key={m.key}
                      className="border-line bg-surface-sunken text-content-strong rounded border px-2 py-0.5 text-xs"
                    >
                      {m.label} : <strong>{selected.ranks[m.key] ?? '—'}</strong>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {selected.ee && (
              <div className="border-line-subtle mt-4 border-t pt-3">
                <h3 className="text-content-strong text-sm font-semibold">
                  EE — {selected.ee.name}
                </h3>
                <ul className="mt-1 space-y-1">
                  {selected.ee.passives.map((p, i) => (
                    <li key={i} className="text-content-muted text-sm">
                      <span className="text-content-subtle">
                        Lv.{p.level}
                        {p.level > 1 ? (p.isAdd ? ' (adds)' : ' (replaces)') : ''} —{' '}
                      </span>
                      {p.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ── Homologues ── */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="border-line flex overflow-hidden rounded-md border">
                {MODES.map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setMode(m.key)}
                    className={`px-3 py-1.5 text-sm transition-colors ${
                      mode === m.key
                        ? 'bg-accent/20 text-content-strong'
                        : 'text-content-muted hover:bg-line/50'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              {CRITERIA.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => toggleCriterion(c.key)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    criteria.has(c.key)
                      ? 'border-accent bg-accent/15 text-content-strong'
                      : 'border-line text-content-muted hover:bg-line/50'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {!selected.ranks[mode] && (
              <p className="text-content-subtle text-sm">
                This hero is not ranked in this list — peers below are still shown for context.
              </p>
            )}

            {TIERS.map((tier) => {
              const inTier = peers.filter((r) => r.ranks[mode] === tier);
              if (inTier.length === 0) return null;
              return (
                <TierRow
                  key={tier}
                  tier={tier}
                  peers={inTier}
                  selectedId={selected.id}
                  onPick={pick}
                />
              );
            })}
            {peers.length === 0 && (
              <p className="text-content-subtle text-sm">
                No ranked hero matches the active criteria — loosen them above.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function TierRow({
  tier,
  peers,
  selectedId,
  onPick,
}: {
  tier: Tier;
  peers: RankingHelperRow[];
  selectedId: string;
  onPick: (id: string) => void;
}) {
  return (
    <div className={`rounded-lg border bg-gradient-to-r p-2 ${TIER_COLORS[tier]}`}>
      <div className="flex items-start gap-3">
        <span className="text-content-strong w-6 shrink-0 pt-1 text-center text-lg font-bold">
          {tier}
        </span>
        <div className="flex flex-wrap gap-2">
          {peers.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onPick(r.id)}
              title={r.name}
              className={`rounded-md p-0.5 transition-transform hover:scale-105 ${
                r.id === selectedId ? 'ring-accent ring-2' : ''
              }`}
            >
              <CharacterPortrait id={r.id} name={r.name} size={48} showName={false} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
