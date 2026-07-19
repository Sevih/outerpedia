'use client';

import { useState } from 'react';
import type { CharacterCurated, CuratedRole, SkillPriority, VideoRef } from '@contracts';
import { postJson } from '@/lib/admin/post-json';
import { rowKey } from '@/lib/admin/keyed';
import { VideoCurator } from './VideoCurator';

const ROLES: Array<'' | CuratedRole> = ['', 'dps', 'support', 'sustain'];
const RANKS = ['', 'S', 'A', 'B', 'C', 'D', 'E'];
/** Paliers de transcendance sélectionnables (transStar). */
const STARS = ['1', '2', '3', '4', '5', '6'];
/**
 * Tags ÉDITABLES ici = les tags HUMAINS. Il n'y en a qu'un.
 *
 * premium/limited/seasonal/collab (bannière), ignore-defense (buffs de
 * pénétration) et core-fusion (lignée) sont désormais DÉRIVÉS DU JEU par
 * l'extraction (`Character.tags`) : ils s'affichent en lecture seule ci-dessous.
 * Les cocher ici les figerait en curé et ils divergeraient à la régénération.
 * `free` reste humain : aucune table ne marque un perso comme offert.
 */
const HUMAN_TAGS = ['free'];

const field =
  'w-full rounded-md border border-line bg-surface-base px-3 py-1.5 text-sm text-content focus:border-accent focus:outline-none';
const label = 'text-xs font-semibold uppercase tracking-wide text-content-subtle';

type Status = { kind: 'idle' | 'ok' | 'err'; msg?: string };

/** Une entrée « palier → valeur » (transStar → tier/rôle). `_key` = clé React stable. */
type TransRow = { star: string; value: string; _key: string };

const toRows = (rec?: Record<string, string>): TransRow[] =>
  Object.entries(rec ?? {}).map(([star, value]) => ({ star, value, _key: rowKey() }));
const toMap = (rows: TransRow[]): Record<string, string> =>
  Object.fromEntries(rows.filter((r) => r.star && r.value).map((r) => [r.star, r.value]));

/**
 * Éditeur de paliers de transcendance : liste de (palier → valeur), au lieu de
 * JSON brut. Réutilisé pour le rank (S/A/B…) et le rôle (dps/support/sustain).
 */
function TranscendMapEditor({
  title,
  rows,
  valueOptions,
  onChange,
}: {
  title: string;
  rows: TransRow[];
  valueOptions: string[];
  onChange: (rows: TransRow[]) => void;
}) {
  const set = (i: number, patch: Partial<TransRow>) =>
    onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className={label}>{title}</p>
        <button
          type="button"
          className="text-accent text-xs hover:underline"
          onClick={() => onChange([...rows, { star: '', value: valueOptions[0], _key: rowKey() }])}
        >
          + tier
        </button>
      </div>
      {rows.length === 0 ? (
        <p className="text-content-subtle text-xs">No tier — the base value applies.</p>
      ) : (
        rows.map((r, i) => (
          <div key={r._key} className="flex items-center gap-2">
            <select
              className={`${field} w-auto`}
              value={r.star}
              onChange={(e) => set(i, { star: e.target.value })}
            >
              <option value="">tier ?</option>
              {/* Valeur héritée hors plage : préservée pour ne pas perdre la donnée. */}
              {r.star && !STARS.includes(r.star) && <option value={r.star}>Trans {r.star}</option>}
              {STARS.map((s) => (
                <option key={s} value={s}>
                  Trans {s}
                </option>
              ))}
            </select>
            <span className="text-content-subtle text-xs">→</span>
            <select
              className={`${field} w-auto`}
              value={r.value}
              onChange={(e) => set(i, { value: e.target.value })}
            >
              {r.value && !valueOptions.includes(r.value) && (
                <option value={r.value}>{r.value}</option>
              )}
              {valueOptions.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="text-danger ml-auto text-sm"
              onClick={() => onChange(rows.filter((_, j) => j !== i))}
              aria-label="Delete the tier"
            >
              ✕
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export function CharacterCuratedEditor({
  id,
  characterName,
  initial,
  derivedTags = [],
}: {
  id: string;
  characterName: string;
  initial: CharacterCurated;
  /** Tags dérivés du jeu (`Character.tags`) — affichés, jamais écrits ici. */
  derivedTags?: string[];
}) {
  const [rank, setRank] = useState(initial.rank ?? '');
  const [rankPvp, setRankPvp] = useState(initial.rankPvp ?? '');
  const [role, setRole] = useState<string>(initial.role ?? '');
  const [tags, setTags] = useState<string[]>(initial.tags ?? []);
  const [first, setFirst] = useState(initial.skillPriority?.first?.toString() ?? '');
  const [second, setSecond] = useState(initial.skillPriority?.second?.toString() ?? '');
  const [ultimate, setUltimate] = useState(initial.skillPriority?.ultimate?.toString() ?? '');
  const [videos, setVideos] = useState<VideoRef[]>(initial.videos ?? []);
  const [rankByT, setRankByT] = useState<TransRow[]>(toRows(initial.rankByTranscend));
  const [roleByT, setRoleByT] = useState<TransRow[]>(toRows(initial.roleByTranscend));
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  function build(): CharacterCurated {
    const c: CharacterCurated = {};
    // pros/cons pas encore éditable ici : préservé tel quel (évite la perte).
    if (initial.prosCons) c.prosCons = initial.prosCons;
    if (videos.length) c.videos = videos;
    if (rank) c.rank = rank;
    if (rankPvp) c.rankPvp = rankPvp;
    if (role) c.role = role as CuratedRole;
    if (tags.length) c.tags = tags;
    const sp: SkillPriority = {};
    if (first.trim()) sp.first = Number(first);
    if (second.trim()) sp.second = Number(second);
    if (ultimate.trim()) sp.ultimate = Number(ultimate);
    if (Object.keys(sp).length) c.skillPriority = sp;
    const rankMap = toMap(rankByT);
    if (Object.keys(rankMap).length) c.rankByTranscend = rankMap;
    const roleMap = toMap(roleByT);
    if (Object.keys(roleMap).length) c.roleByTranscend = roleMap;
    return c;
  }

  async function save() {
    setStatus({ kind: 'idle' });
    try {
      await postJson(`/api/admin/curated/characters/${id}`, build());
      setStatus({ kind: 'ok', msg: 'Saved' });
    } catch (e) {
      setStatus({ kind: 'err', msg: (e as Error).message });
    }
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1">
          <p className={label}>Rank (PvE)</p>
          <select className={field} value={rank} onChange={(e) => setRank(e.target.value)}>
            {RANKS.map((r) => (
              <option key={r} value={r}>
                {r || '—'}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <p className={label}>Rank PvP</p>
          <select className={field} value={rankPvp} onChange={(e) => setRankPvp(e.target.value)}>
            {RANKS.map((r) => (
              <option key={r} value={r}>
                {r || '—'}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <p className={label}>Role</p>
          <select className={field} value={role} onChange={(e) => setRole(e.target.value)}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r || '—'}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1">
          <p className={label}>1st skill prio.</p>
          <input
            className={field}
            value={first}
            onChange={(e) => setFirst(e.target.value)}
            inputMode="numeric"
          />
        </div>
        <div className="space-y-1">
          <p className={label}>2nd skill prio.</p>
          <input
            className={field}
            value={second}
            onChange={(e) => setSecond(e.target.value)}
            inputMode="numeric"
          />
        </div>
        <div className="space-y-1">
          <p className={label}>Ultimate prio.</p>
          <input
            className={field}
            value={ultimate}
            onChange={(e) => setUltimate(e.target.value)}
            inputMode="numeric"
          />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <p className={label}>Human tags</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1">
            {HUMAN_TAGS.map((t) => (
              <label key={t} className="text-content flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={tags.includes(t)}
                  onChange={(e) =>
                    setTags((s) => (e.target.checked ? [...s, t] : s.filter((x) => x !== t)))
                  }
                />
                {t}
              </label>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <p className={label}>Game-derived tags (read-only)</p>
          {derivedTags.length === 0 ? (
            <p className="text-content-subtle pt-1 text-xs">None.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {derivedTags.map((t) => (
                <span
                  key={t}
                  className="border-line-subtle text-content-muted rounded border px-1.5 py-0.5 font-mono text-xs"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          <p className="text-content-subtle text-xs">
            Extracted from game data (banner, buffs, lineage) — not editable.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <TranscendMapEditor
          title="Rank by transcendence"
          rows={rankByT}
          valueOptions={RANKS.filter(Boolean)}
          onChange={setRankByT}
        />
        <TranscendMapEditor
          title="Role by transcendence"
          rows={roleByT}
          valueOptions={ROLES.filter(Boolean)}
          onChange={setRoleByT}
        />
      </section>

      <section className="border-line-subtle border-t pt-4">
        <VideoCurator characterName={characterName} videos={videos} onChange={setVideos} />
      </section>

      {initial.prosCons && (
        <p className="text-content-subtle text-xs">Pros/cons preserved (editing coming soon).</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          className="bg-accent text-accent-fg rounded-md px-4 py-2 text-sm font-semibold hover:opacity-90"
        >
          Save
        </button>
        {status.kind === 'ok' && <span className="text-success text-sm">{status.msg}</span>}
        {status.kind === 'err' && <span className="text-danger text-sm">{status.msg}</span>}
      </div>
    </div>
  );
}
