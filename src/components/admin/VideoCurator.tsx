'use client';

import { useState } from 'react';
import type { VideoRef } from '@contracts';

/** Candidat renvoyé par /api/admin/youtube/search (méta complète). */
interface Candidate {
  platform: 'youtube';
  id: string;
  title: string;
  author: string;
  uploadDate: string;
  thumbnail?: string;
  channel: string;
}

const thumb = (id: string) => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;

const btn =
  'rounded-md border border-line bg-surface-base px-3 py-1.5 text-sm hover:border-accent disabled:opacity-50';

export function VideoCurator({
  characterName,
  videos,
  onChange,
}: {
  characterName: string;
  videos: VideoRef[];
  onChange: (next: VideoRef[]) => void;
}) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [manualId, setManualId] = useState('');
  const [busy, setBusy] = useState<'search' | 'meta' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const has = (id: string) => videos.some((v) => v.id === id);

  function add(ref: VideoRef) {
    if (has(ref.id)) return;
    onChange([...videos, ref]);
  }
  function remove(id: string) {
    onChange(videos.filter((v) => v.id !== id));
  }

  async function search() {
    setBusy('search');
    setError(null);
    setCandidates([]);
    try {
      const res = await fetch(`/api/admin/youtube/search?q=${encodeURIComponent(characterName)}`);
      const data = (await res.json()) as { candidates?: Candidate[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Search failed');
      setCandidates(data.candidates ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function addManual() {
    const id = manualId.trim();
    if (!id) return;
    setBusy('meta');
    setError(null);
    try {
      const res = await fetch(`/api/admin/youtube/meta?ids=${encodeURIComponent(id)}`);
      const data = (await res.json()) as {
        meta?: Record<string, Omit<Candidate, 'platform' | 'id' | 'channel'>>;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? 'Enrichment failed');
      const m = data.meta?.[id];
      if (!m) throw new Error('Video not found');
      add({ platform: 'youtube', id, title: m.title, author: m.author, uploadDate: m.uploadDate });
      setManualId('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-content-subtle text-xs font-semibold tracking-wide uppercase">Videos</p>

      {/* Vidéos curées actuelles */}
      {videos.length > 0 ? (
        <ul className="space-y-2">
          {videos.map((v) => (
            <li
              key={v.id}
              className="border-line-subtle flex items-center gap-3 rounded-md border p-2"
            >
              <img src={thumb(v.id)} alt="" className="h-9 w-16 rounded object-cover" />
              <div className="min-w-0 flex-1">
                <p className="text-content truncate text-sm">{v.title ?? v.id}</p>
                <p className="text-content-subtle truncate text-xs">
                  {v.author ?? '—'} · {v.id}
                </p>
              </div>
              <button type="button" onClick={() => remove(v.id)} className="text-danger text-xs">
                remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-content-subtle text-sm">No video.</p>
      )}

      {/* Découverte + ajout manuel */}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={search} disabled={busy !== null} className={btn}>
          {busy === 'search' ? 'Searching…' : 'Search the official channel'}
        </button>
        <input
          value={manualId}
          onChange={(e) => setManualId(e.target.value)}
          placeholder="manual YouTube id"
          className="border-line bg-surface-base text-content focus:border-accent w-44 rounded-md border px-3 py-1.5 text-sm focus:outline-none"
        />
        <button type="button" onClick={addManual} disabled={busy !== null} className={btn}>
          {busy === 'meta' ? 'Adding…' : 'Add'}
        </button>
      </div>

      {error && <p className="text-danger text-sm">{error}</p>}

      {/* Candidats proposés */}
      {candidates.length > 0 && (
        <ul className="space-y-2">
          {candidates.map((c) => (
            <li
              key={c.id}
              className="border-line-subtle bg-surface-base flex items-center gap-3 rounded-md border p-2"
            >
              <img
                src={c.thumbnail ?? thumb(c.id)}
                alt=""
                className="h-9 w-16 rounded object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="text-content truncate text-sm">{c.title}</p>
                <p className="text-content-subtle truncate text-xs">
                  {c.author} · {c.channel} · {c.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  add({
                    platform: 'youtube',
                    id: c.id,
                    title: c.title,
                    author: c.author,
                    uploadDate: c.uploadDate,
                  })
                }
                disabled={has(c.id)}
                className="text-accent text-xs font-semibold disabled:opacity-40"
              >
                {has(c.id) ? 'added' : 'add'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
