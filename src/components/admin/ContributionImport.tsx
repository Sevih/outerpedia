'use client';

/**
 * Tool GÉNÉRIQUE d'import de contribution (admin, dev). On dépose un JSON exporté
 * par n'importe quel outil `/contribute/*` : la server action lit son `kind`,
 * l'intègre dans le bon guide (édition ou ajout), auto-traduit ce qui manque et
 * enregistre. Un seul point d'entrée pour tous les guides — pas de choix de cible
 * à faire ici, le fichier se décrit lui-même.
 */
import { useRef, useState } from 'react';
import { importContribution, type ImportResult } from '@/lib/admin/contribution-actions';

const btn =
  'rounded-md border border-line bg-surface-base px-3 py-1.5 text-sm hover:border-accent disabled:opacity-50';

export function ContributionImport() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [drag, setDrag] = useState(false);

  async function handleFile(file: File) {
    setBusy(true);
    setResult(null);
    try {
      const raw = JSON.parse(await file.text()) as unknown;
      setResult(await importContribution(raw));
    } catch (e) {
      setResult({ ok: false, errors: [`Unreadable file: ${(e as Error).message}`] });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="border-line bg-surface-raised/60 space-y-3 rounded-2xl border p-5">
      <div>
        <h2 className="text-content-strong text-lg font-semibold">Import a contribution</h2>
        <p className="text-content-muted text-sm">
          Drop a JSON exported from any <code className="text-content">/contribute</code> tool. It
          is routed to the right guide (edit or add), missing languages are auto-translated, and the
          guide is saved.
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files?.[0];
          if (f) void handleFile(f);
        }}
        className={`rounded-xl border border-dashed p-6 text-center text-sm transition-colors ${
          drag ? 'border-accent bg-accent/5' : 'border-line text-content-muted'
        }`}
      >
        <p>Drag &amp; drop a contribution file here</p>
        <p className="my-2 text-xs">or</p>
        <button
          type="button"
          className={btn}
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          {busy ? 'Importing…' : 'Choose a file…'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
            e.target.value = '';
          }}
        />
      </div>

      {result?.ok && <p className="text-success text-sm">✓ {result.summary}</p>}
      {result && !result.ok && (
        <ul className="text-danger space-y-0.5 text-sm">
          {result.errors.map((err, i) => (
            <li key={i}>✕ {err}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
