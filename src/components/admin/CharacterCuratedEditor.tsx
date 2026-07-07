'use client';

import { useState } from 'react';
import type { CharacterCurated, CuratedRole, SkillPriority, VideoRef } from '@contracts';
import { cn } from '@/lib/cn';
import { VideoCurator } from './VideoCurator';

const ROLES: Array<'' | CuratedRole> = ['', 'dps', 'support', 'sustain'];
const RANKS = ['', 'S', 'A', 'B', 'C', 'D', 'E'];
/**
 * Vocabulaire des tags (type d'unité + mécaniques), repris de V2.
 * TODO extraction : premium/seasonal/collab/ignore-defense/core-fusion sont
 * détectables depuis la donnée de jeu (V2 le faisait) — seul `free` est humain.
 */
const TAGS = ['premium', 'limited', 'seasonal', 'collab', 'free', 'ignore-defense', 'core-fusion'];

const field =
  'w-full rounded-md border border-line bg-surface-base px-3 py-1.5 text-sm text-content focus:border-accent focus:outline-none';
const label = 'text-xs font-semibold uppercase tracking-wide text-content-subtle';

type Status = { kind: 'idle' | 'ok' | 'err'; msg?: string };

export function CharacterCuratedEditor({
  id,
  characterName,
  initial,
}: {
  id: string;
  characterName: string;
  initial: CharacterCurated;
}) {
  const [rank, setRank] = useState(initial.rank ?? '');
  const [rankPvp, setRankPvp] = useState(initial.rankPvp ?? '');
  const [role, setRole] = useState<string>(initial.role ?? '');
  const [tags, setTags] = useState<string[]>(initial.tags ?? []);
  const [first, setFirst] = useState(initial.skillPriority?.first?.toString() ?? '');
  const [second, setSecond] = useState(initial.skillPriority?.second?.toString() ?? '');
  const [ultimate, setUltimate] = useState(initial.skillPriority?.ultimate?.toString() ?? '');
  const [videos, setVideos] = useState<VideoRef[]>(initial.videos ?? []);
  const [limited, setLimited] = useState(Boolean(initial.limited));
  const [rankByTranscend, setRankByTranscend] = useState(
    initial.rankByTranscend ? JSON.stringify(initial.rankByTranscend) : '',
  );
  const [roleByTranscend, setRoleByTranscend] = useState(
    initial.roleByTranscend ? JSON.stringify(initial.roleByTranscend) : '',
  );
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  function build(): CharacterCurated | { error: string } {
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
    if (limited) c.limited = true;
    try {
      if (rankByTranscend.trim()) c.rankByTranscend = JSON.parse(rankByTranscend);
      if (roleByTranscend.trim()) c.roleByTranscend = JSON.parse(roleByTranscend);
    } catch {
      return { error: 'rank/role by transcend : JSON invalide' };
    }
    return c;
  }

  async function save() {
    const built = build();
    if ('error' in built) {
      setStatus({ kind: 'err', msg: built.error });
      return;
    }
    setStatus({ kind: 'idle' });
    const res = await fetch(`/api/admin/curated/characters/${id}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(built),
    });
    if (res.ok) {
      setStatus({ kind: 'ok', msg: 'Enregistré' });
    } else {
      const data = (await res.json().catch(() => ({}))) as { errors?: string[] };
      setStatus({ kind: 'err', msg: data.errors?.join(' ; ') ?? 'Échec écriture' });
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
          <p className={label}>Rôle</p>
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
          <p className={label}>Prio. 1er skill</p>
          <input
            className={field}
            value={first}
            onChange={(e) => setFirst(e.target.value)}
            inputMode="numeric"
          />
        </div>
        <div className="space-y-1">
          <p className={label}>Prio. 2e skill</p>
          <input
            className={field}
            value={second}
            onChange={(e) => setSecond(e.target.value)}
            inputMode="numeric"
          />
        </div>
        <div className="space-y-1">
          <p className={label}>Prio. ultime</p>
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
          <p className={label}>Tags (type d&apos;unité / mécaniques)</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1">
            {TAGS.map((t) => (
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
        <label className="text-content flex items-center gap-2 self-end pb-2 text-sm">
          <input type="checkbox" checked={limited} onChange={(e) => setLimited(e.target.checked)} />
          Personnage limité
        </label>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <p className={label}>Rank par transcendance (JSON)</p>
          <textarea
            className={cn(field, 'h-16 font-mono text-xs')}
            value={rankByTranscend}
            onChange={(e) => setRankByTranscend(e.target.value)}
            placeholder='{"3":"A","6":"S"}'
          />
        </div>
        <div className="space-y-1">
          <p className={label}>Rôle par transcendance (JSON)</p>
          <textarea
            className={cn(field, 'h-16 font-mono text-xs')}
            value={roleByTranscend}
            onChange={(e) => setRoleByTranscend(e.target.value)}
            placeholder='{"6":"dps"}'
          />
        </div>
      </section>

      <section className="border-line-subtle border-t pt-4">
        <VideoCurator characterName={characterName} videos={videos} onChange={setVideos} />
      </section>

      {initial.prosCons && (
        <p className="text-content-subtle text-xs">Pros/cons préservés (édition à venir).</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          className="bg-accent text-accent-fg rounded-md px-4 py-2 text-sm font-semibold hover:opacity-90"
        >
          Enregistrer
        </button>
        {status.kind === 'ok' && <span className="text-success text-sm">{status.msg}</span>}
        {status.kind === 'err' && <span className="text-danger text-sm">{status.msg}</span>}
      </div>
    </div>
  );
}
