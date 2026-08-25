'use client';

/**
 * Panneau SCÉNARIOS du harnais (dev) : la table des captures sauvegardées —
 * « en jeu » vs calculé (REJOUÉ par le parent, jamais stocké : `savedCalcMap`),
 * Charger / ⧉ fixture / supprimer, et l'import du JSON ⧉ d'un beta testeur.
 * Libellés en dur (exemption harnais § 5). Extrait du composant principal
 * (découpage du 25/08/2026 — JSX déplacé tel quel ; l'état et le cycle
 * de capture restent au parent).
 */
import { ENGINE_GAME_VERSION } from '@/lib/damage/harness';
import { DEFAULT_TOLERANCE, scnKey, type SavedScenario } from './stores';

export function ScenariosPanel({
  savedScns,
  savedCalcMap,
  loadSaved,
  copyScenario,
  deleteScenario,
  importOpen,
  setImportOpen,
  importTxt,
  setImportTxt,
  importScenarios,
  flash,
}: {
  savedScns: SavedScenario[];
  /** Calculés rejoués par le parent + lignes § 12.4 en attente (clés scnKey). */
  savedCalcMap: { calcs: Map<string, number>; pending: Set<string> };
  loadSaved: (s: SavedScenario) => void;
  copyScenario: (s: SavedScenario) => void;
  deleteScenario: (s: SavedScenario) => void;
  importOpen: boolean;
  setImportOpen: (next: boolean | ((prev: boolean) => boolean)) => void;
  importTxt: string;
  setImportTxt: (next: string | ((prev: string) => string)) => void;
  importScenarios: () => void;
  flash: string | null;
}) {
  return (
    <section className="border-line-subtle bg-surface-raised/60 space-y-3 rounded-xl border p-3.5">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-content-subtle text-[10px] font-bold tracking-[0.14em] uppercase">
          Scénarios
        </span>
        <span
          title="build de dev, ou ?dev=1 dans l'URL"
          className="text-warn border-warn/35 bg-warn/10 rounded border px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wide"
        >
          HARNAIS
        </span>
        <span className="text-content-subtle text-[11px]">
          un scénario = une ligne (le « + » d&apos;une cellule Résultat) · calculé REJOUÉ à
          l&apos;affichage · ⧉ = fixture à committer dans src/lib/damage/fixtures/
        </span>
        <button
          type="button"
          onClick={() => setImportOpen((v) => !v)}
          title="coller le JSON ⧉ d'un testeur"
          className="border-line-subtle bg-surface-raised/70 text-content-muted hover:text-accent h-6 cursor-pointer rounded border px-2 font-mono text-[10px]"
        >
          Importer
        </button>
        <span className="flex-1" />
        {flash && (
          <span className="text-success border-success/40 bg-surface-sunken rounded-md border px-2.5 py-1 font-mono text-[10px]">
            ✓ {flash}
          </span>
        )}
      </div>
      {importOpen && (
        <div className="space-y-2">
          <textarea
            value={importTxt}
            onChange={(e) => setImportTxt(e.target.value)}
            placeholder="coller ici le JSON ⧉ d'un testeur (une fixture, ou un tableau de fixtures)"
            rows={5}
            className="border-line-subtle bg-surface-sunken/70 text-content focus:border-accent w-full rounded border px-2 py-1.5 font-mono text-[11px] outline-none"
          />
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={importScenarios}
              disabled={!importTxt.trim()}
              className="border-line-subtle bg-surface-raised/70 text-content-muted hover:text-accent h-6 cursor-pointer rounded border px-2 font-mono text-[10px] disabled:cursor-not-allowed disabled:opacity-35"
            >
              Ajouter
            </button>
            <button
              type="button"
              onClick={() => {
                setImportOpen(false);
                setImportTxt('');
              }}
              className="border-line-subtle bg-surface-raised/70 text-content-muted hover:text-danger h-6 cursor-pointer rounded border px-2 font-mono text-[10px]"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
      {/* Table de comparaison : atk vs cible · en jeu vs calculé · Δ. */}
      <div className="border-line-subtle bg-surface-sunken/70 overflow-x-auto rounded-lg border">
        {savedScns.length ? (
          <div className="min-w-160">
            <div className="border-line-subtle text-content-subtle grid grid-cols-[minmax(0,3fr)_110px_110px_70px_150px] gap-2 border-b px-3 py-1.5 font-mono text-[9px] tracking-wide uppercase">
              <span>Scénario</span>
              <span className="text-right">En jeu</span>
              <span className="text-right">Calculé</span>
              <span className="text-right">Δ %</span>
              <span />
            </div>
            {/* Le plus RÉCENT en haut (Sevih 10/08) — tri d'AFFICHAGE par
                  savedAt décroissant (ISO, ordre lexicographique) : un upsert
                  remonte, le stockage garde son ordre. */}
            {[...savedScns]
              .sort((a, b) => (b.savedAt > a.savedAt ? 1 : b.savedAt < a.savedAt ? -1 : 0))
              .map((s) => {
                const calc = savedCalcMap.calcs.get(scnKey(s));
                // EN ATTENTE : slot rejoué mais chaîne de hits irrésolue
                // (§ 12.4) — la valeur en jeu attend le moteur.
                const isPending = savedCalcMap.pending.has(scnKey(s));
                const delta = calc !== undefined ? ((calc - s.real) / s.real) * 100 : undefined;
                const cls =
                  delta === undefined
                    ? 'text-content-subtle'
                    : Math.abs(delta) <= DEFAULT_TOLERANCE
                      ? 'text-success'
                      : 'text-danger';
                const stale =
                  delta !== undefined &&
                  Math.abs(delta) > DEFAULT_TOLERANCE &&
                  s.gameVersion !== ENGINE_GAME_VERSION;
                return (
                  <div
                    key={scnKey(s)}
                    className="grid grid-cols-[minmax(0,3fr)_110px_110px_70px_150px] items-center gap-2 px-3 py-1.5 font-mono text-[11px]"
                  >
                    <span className="text-content truncate font-sans text-xs">
                      {s.atk} <span className="text-content-subtle">vs</span> {s.tgt}{' '}
                      <span className="text-content-subtle font-mono text-[9px]">
                        {s.slot} {s.branch} · {s.gameVersion}
                      </span>
                      {stale && (
                        <span className="text-warn border-warn/35 bg-warn/10 ml-1.5 rounded border px-1 py-px font-mono text-[9px] font-bold">
                          à revérifier en jeu
                        </span>
                      )}
                    </span>
                    <span className="text-content-muted text-right">{s.real.toLocaleString()}</span>
                    <span className="text-content-muted text-right">
                      {calc !== undefined ? (
                        calc.toLocaleString()
                      ) : isPending ? (
                        <span
                          title="chaîne de hits irrésolue (§ 12.4) — valeur gardée, le Δ attendra le moteur"
                          className="text-warn cursor-help text-[10px]"
                        >
                          § 12.4
                        </span>
                      ) : (
                        '—'
                      )}
                    </span>
                    <span className={`text-right ${cls}`}>
                      {delta !== undefined ? delta.toFixed(3) : '—'}
                    </span>
                    <span className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => loadSaved(s)}
                        className="border-line-subtle bg-surface-raised/70 text-content-muted hover:text-accent h-6 cursor-pointer rounded border px-2 font-mono text-[10px]"
                      >
                        Charger
                      </button>
                      <button
                        type="button"
                        onClick={() => copyScenario(s)}
                        title="copier le JSON de fixture"
                        className="border-line-subtle bg-surface-raised/70 text-content-muted hover:text-accent h-6 cursor-pointer rounded border px-2 font-mono text-[10px]"
                      >
                        ⧉
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteScenario(s)}
                        title="supprimer"
                        className="border-line-subtle bg-surface-raised/70 text-content-muted hover:text-danger h-6 cursor-pointer rounded border px-2 font-mono text-[10px]"
                      >
                        ✕
                      </button>
                    </span>
                  </div>
                );
              })}
          </div>
        ) : (
          <p className="text-content-subtle px-3 py-3 text-[11px]">
            aucun scénario — saisir « en jeu » puis cliquer « + » dans la table Résultat
          </p>
        )}
      </div>
    </section>
  );
}
