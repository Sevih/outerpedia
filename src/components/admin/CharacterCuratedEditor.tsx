'use client';

import { useState } from 'react';
import type { CharacterCurated, CuratedRole, SkillPriority } from '@contracts';
import { cn } from '@/lib/cn';

const ROLES: Array<'' | CuratedRole> = ['', 'dps', 'support', 'sustain'];

const field =
  'w-full rounded-md border border-line bg-surface-base px-3 py-1.5 text-sm text-content focus:border-accent focus:outline-none';
const label = 'text-xs font-semibold uppercase tracking-wide text-content-subtle';

type Status = { kind: 'idle' | 'ok' | 'err'; msg?: string };

export function CharacterCuratedEditor({ id, initial }: { id: string; initial: CharacterCurated }) {
  const [rank, setRank] = useState(initial.rank ?? '');
  const [rankPvp, setRankPvp] = useState(initial.rankPvp ?? '');
  const [role, setRole] = useState<string>(initial.role ?? '');
  const [tags, setTags] = useState((initial.tags ?? []).join('\n'));
  const [first, setFirst] = useState(initial.skillPriority?.first?.toString() ?? '');
  const [second, setSecond] = useState(initial.skillPriority?.second?.toString() ?? '');
  const [ultimate, setUltimate] = useState(initial.skillPriority?.ultimate?.toString() ?? '');
  const [video, setVideo] = useState(initial.video ?? '');
  const [limited, setLimited] = useState(Boolean(initial.limited));
  const [rankByTranscend, setRankByTranscend] = useState(
    initial.rankByTranscend ? JSON.stringify(initial.rankByTranscend) : '',
  );
  const [roleByTranscend, setRoleByTranscend] = useState(
    initial.roleByTranscend ? JSON.stringify(initial.roleByTranscend) : '',
  );
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  function lines(s: string): string[] {
    return s
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
  }

  function build(): CharacterCurated | { error: string } {
    const c: CharacterCurated = {};
    if (rank.trim()) c.rank = rank.trim();
    if (rankPvp.trim()) c.rankPvp = rankPvp.trim();
    if (role) c.role = role as CuratedRole;
    if (lines(tags).length) c.tags = lines(tags);
    const sp: SkillPriority = {};
    if (first.trim()) sp.first = Number(first);
    if (second.trim()) sp.second = Number(second);
    if (ultimate.trim()) sp.ultimate = Number(ultimate);
    if (Object.keys(sp).length) c.skillPriority = sp;
    if (video.trim()) c.video = video.trim();
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
          <input
            className={field}
            value={rank}
            onChange={(e) => setRank(e.target.value)}
            placeholder="S, A, B…"
          />
        </div>
        <div className="space-y-1">
          <p className={label}>Rank PvP</p>
          <input className={field} value={rankPvp} onChange={(e) => setRankPvp(e.target.value)} />
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
          <p className={label}>Tags (1 par ligne)</p>
          <textarea
            className={cn(field, 'h-24')}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>
        <div className="space-y-3">
          <div className="space-y-1">
            <p className={label}>Vidéo (id YouTube)</p>
            <input className={field} value={video} onChange={(e) => setVideo(e.target.value)} />
          </div>
          <label className="text-content flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={limited}
              onChange={(e) => setLimited(e.target.checked)}
            />
            Personnage limité
          </label>
        </div>
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
