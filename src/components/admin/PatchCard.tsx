'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BUMPS,
  COMMIT_MESSAGE_MAX,
  commitMessageError,
  type Bump,
  type PatchEvent,
} from '@/lib/admin/patch-commands';

type Done = Extract<PatchEvent, { done: unknown }>['done'];
type Outcome = { ok: boolean; text: string };

const btn =
  'bg-accent text-accent-fg rounded-md px-4 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-50';
const ghost =
  'border-line-subtle text-content hover:bg-surface-base rounded-md border px-4 py-2 text-sm disabled:opacity-50';
const field =
  'border-line-subtle bg-surface text-content rounded-md border px-2 py-2 text-sm disabled:opacity-50';

/**
 * Les deux gestes de fin de patch, lancés de l'accueil au lieu du terminal :
 * promouvoir l'extraction (`pnpm datagen:promote --apply`) et publier
 * (`pnpm commit`). Chacun montre d'abord ce qu'il fera — le dry-run de la
 * promotion, la liste de `git status` — et ne part qu'après confirmation. La
 * sortie de la commande défile dans le journal (NDJSON, cf. `patch-runner`).
 */
export function PatchCard() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<'promote' | 'commit' | null>(null);
  const [lines, setLines] = useState<string[]>([]);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [message, setMessage] = useState('');
  const [bump, setBump] = useState<Bump>('patch');
  const journal = useRef<HTMLPreElement>(null);

  // Le journal suit la sortie : la dernière ligne reste visible.
  useEffect(() => {
    const el = journal.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, outcome]);

  const trimmed = message.trim();
  const messageError = trimmed ? commitMessageError(trimmed) : null;

  /**
   * Lance une route `/api/admin/patch/*` et lit sa réponse AU FIL : une ligne
   * JSON par ligne de sortie, puis `done`. Rend l'issue et les lignes reçues.
   */
  async function run(url: string, init?: RequestInit): Promise<{ ok: boolean; out: string[] }> {
    setBusy(true);
    setPending(null);
    setOutcome(null);
    setLines([]);
    const out: string[] = [];
    let done: Done | null = null;
    try {
      const res = await fetch(url, init);
      if (!res.body) throw new Error('réponse sans corps');
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = '';
      const eat = (raws: string[]) => {
        const batch: string[] = [];
        for (const raw of raws) {
          if (!raw.trim()) continue;
          const event = JSON.parse(raw) as PatchEvent;
          if ('done' in event) done = event.done;
          else batch.push(event.line);
        }
        if (!batch.length) return;
        out.push(...batch);
        setLines((prev) => [...prev, ...batch]);
      };
      for (;;) {
        const { value, done: end } = await reader.read();
        if (end) break;
        buf += dec.decode(value, { stream: true });
        const parts = buf.split('\n');
        buf = parts.pop() ?? ''; // ligne encore incomplète : elle attend la suite
        eat(parts);
      }
      eat([buf]);
    } catch (e) {
      done = { ok: false, error: (e as Error).message };
    }
    const result: Done = done ?? { ok: false, error: 'réponse interrompue' };
    setOutcome({
      ok: result.ok,
      text: result.ok
        ? '✓ terminé'
        : `✗ ${result.error ?? `échec (code ${result.code ?? 'inconnu'})`}`,
    });
    setBusy(false);
    return { ok: result.ok, out };
  }

  async function previewPromote() {
    const { ok } = await run('/api/admin/patch/promote');
    if (ok) setPending('promote');
  }

  async function applyPromote() {
    const { ok } = await run('/api/admin/patch/promote', { method: 'POST' });
    // L'inbox et la couverture lisent `data/generated`, qui vient de changer.
    if (ok) router.refresh();
  }

  async function previewCommit() {
    const { ok, out } = await run('/api/admin/patch/commit');
    if (!ok) return;
    // `out[0]` est l'écho de la commande ; le reste, une ligne par fichier.
    const files = out.slice(1).filter((l) => l.trim());
    const fresh = files.filter((l) => l.startsWith('??')).length;
    setOutcome({
      ok: true,
      text: files.length
        ? `${files.length} fichier(s) partiront${fresh ? `, dont ${fresh} nouveau(x) (??)` : ''}`
        : 'aucun fichier modifié — seul le bump de version partirait',
    });
    setPending('commit');
  }

  async function publish() {
    const { ok } = await run('/api/admin/patch/commit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message: trimmed, bump }),
    });
    if (ok) router.refresh();
  }

  const locked = busy || pending !== null;

  return (
    <div className="border-line-subtle bg-surface-raised space-y-3 rounded-lg border p-4">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className={btn} onClick={previewPromote} disabled={locked}>
          Promouvoir l&apos;extraction
        </button>
        <span className="text-content-subtle min-w-0 flex-1 basis-64 text-xs">
          <code>pnpm datagen:promote --apply</code> — le dry-run s&apos;affiche d&apos;abord, la
          confirmation l&apos;applique.
        </span>
      </div>

      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={locked}
            maxLength={COMMIT_MESSAGE_MAX}
            placeholder="chore(data): patch du 06/10"
            aria-label="Message de commit"
            className={`${field} min-w-0 flex-1 basis-64`}
          />
          <select
            value={bump}
            onChange={(e) => setBump(e.target.value as Bump)}
            disabled={locked}
            aria-label="Bump de version"
            className={field}
          >
            {BUMPS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={btn}
            onClick={previewCommit}
            disabled={locked || !trimmed || messageError !== null}
          >
            Publier les données
          </button>
        </div>
        {messageError && <p className="text-danger text-xs">{messageError}</p>}
        <p className="text-content-subtle text-xs">
          Publier = <code>pnpm commit</code> : contrôles, images poussées sur R2, puis commit et
          push de <code>main</code> — donc déploiement de la prod.
        </p>
      </div>

      {pending === 'promote' && (
        <div className="border-warn/40 flex flex-wrap items-center gap-3 rounded-md border p-3">
          <span className="text-content min-w-0 flex-1 basis-64 text-sm">
            Dry-run ci-dessous, rien n&apos;est écrit. Appliquer réécrit <code>data/generated</code>
            .
          </span>
          <button type="button" className={btn} onClick={applyPromote}>
            Appliquer la promotion
          </button>
          <button type="button" className={ghost} onClick={() => setPending(null)}>
            Annuler
          </button>
        </div>
      )}
      {pending === 'commit' && (
        <div className="border-danger/40 flex flex-wrap items-center gap-3 rounded-md border p-3">
          <span className="text-content min-w-0 flex-1 basis-64 text-sm">
            Tout ce qui est listé ci-dessous part avec « {trimmed} » (bump {bump}), sur R2 puis sur{' '}
            <code>main</code> : la prod se déploie.
          </span>
          <button type="button" className={btn} onClick={publish}>
            Confirmer la publication
          </button>
          <button type="button" className={ghost} onClick={() => setPending(null)}>
            Annuler
          </button>
        </div>
      )}

      {(lines.length > 0 || outcome || busy) && (
        <div className="space-y-1">
          <pre
            ref={journal}
            aria-live="polite"
            className="border-line-subtle bg-surface-base text-content max-h-96 overflow-auto rounded-md border p-3 text-xs"
          >
            {lines.map((line, i) => (
              <div key={i} className={line.startsWith('??') ? 'text-warn' : undefined}>
                {line || ' '}
              </div>
            ))}
            {busy && <div className="text-content-subtle">…</div>}
          </pre>
          {outcome && (
            <p className={`text-sm ${outcome.ok ? 'text-success' : 'text-danger'}`}>
              {outcome.text}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
