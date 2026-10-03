'use client';

/**
 * Panneau RÉGLAGES : cases de masquage et de décompte, choix base / Core
 * Fusion par couple, import d'un roster capturé, remise à zéro. Extrait du
 * composant principal (découpage du 03/10/2026 — JSX déplacé tel quel ;
 * l'état localStorage reste au parent, via useTrackerState).
 */
import type { BoolSetting, HeroRow, HeroTrackerLabels, TrackerState } from './contracts';

/* ─────────────────────────── Réglages ─────────────────────────── */

export function Settings({
  store,
  setStore,
  fusionPairs,
  trackedCount,
  onImport,
  importState,
  labels,
}: {
  store: TrackerState;
  setStore: (fn: (prev: TrackerState) => TrackerState) => void;
  fusionPairs: { base: HeroRow; fusion: HeroRow }[];
  trackedCount: number;
  onImport: (file: File) => void;
  /** Compte rendu du dernier import — il ne survit pas au rechargement. */
  importState: { ok: boolean; message: string } | null;
  labels: HeroTrackerLabels;
}) {
  const check = (key: BoolSetting, text: string) => (
    <label className="text-content-muted flex cursor-pointer items-center gap-2 text-xs">
      <input
        type="checkbox"
        checked={store[key]}
        onChange={(e) => setStore((prev) => ({ ...prev, [key]: e.target.checked }))}
        className="accent-accent"
      />
      {text}
    </label>
  );

  return (
    <details className="border-line-subtle bg-surface-raised rounded-xl border">
      <summary className="text-content-strong cursor-pointer px-3 py-2 text-xs font-semibold">
        {labels.settings}
      </summary>
      <div className="space-y-3 px-3 pt-1 pb-3">
        {check('alwaysMax', labels.alwaysMax)}
        {check('hideDone', labels.hideDone)}
        {check('hideMaxed', labels.hideMaxed)}

        {/* Les petites raretés en GRILLE : quatre phrases entières auraient rempli
            la colonne pour dire deux fois la même chose sur deux raretés. */}
        <div>
          <h3 className="text-content-strong text-xs font-semibold">{labels.rarityRules}</h3>
          <table className="text-3xs mt-1.5 w-full">
            <thead>
              <tr className="text-content-subtle">
                <th />
                <th className="font-normal">{labels.hideShort}</th>
                <th className="font-normal">{labels.skipShort}</th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  [1, 'hide1Star', 'ignore1Star'],
                  [2, 'hide2Star', 'ignore2Star'],
                ] as const
              ).map(([star, hideKey, skipKey]) => (
                <tr key={star}>
                  <td className="text-warn font-mono">{star}★</td>
                  {[hideKey, skipKey].map((key) => (
                    <td key={key} className="text-center">
                      <input
                        type="checkbox"
                        aria-label={`${star}★ — ${key === hideKey ? labels.hideShort : labels.skipShort}`}
                        checked={store[key]}
                        onChange={(e) => setStore((prev) => ({ ...prev, [key]: e.target.checked }))}
                        className="accent-accent"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h3 className="text-content-strong text-xs font-semibold">{labels.settingsFusion}</h3>
          <p className="text-content-subtle text-3xs mt-0.5">{labels.settingsFusionHint}</p>
          <ul className="mt-1.5 space-y-1">
            {fusionPairs.map(({ base }) => {
              const isFused = Boolean(store.fused[base.id]);
              return (
                <li key={base.id} className="flex items-center gap-2">
                  <span className="text-content-muted min-w-0 flex-1 truncate text-xs">
                    {base.name}
                  </span>
                  <span className="flex shrink-0 gap-1">
                    {(
                      [
                        [false, labels.base],
                        [true, labels.coreFusion],
                      ] as const
                    ).map(([value, text]) => (
                      <button
                        key={text}
                        type="button"
                        onClick={() =>
                          setStore((prev) => ({
                            ...prev,
                            fused: { ...prev.fused, [base.id]: value },
                          }))
                        }
                        className={`text-3xs rounded-full border px-2 py-0.5 transition-colors ${
                          isFused === value
                            ? 'border-accent bg-accent/15 text-content-strong'
                            : 'border-line-subtle text-content-muted hover:bg-line/40'
                        }`}
                      >
                        {text}
                      </button>
                    ))}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="border-line-subtle border-t pt-2.5">
          <h3 className="text-content-strong text-xs font-semibold">{labels.importTitle}</h3>
          <p className="text-content-subtle text-3xs mt-0.5">{labels.importHint}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <label className="border-line text-content-muted hover:border-accent hover:text-accent text-3xs cursor-pointer rounded border px-2 py-1 transition-colors">
              {labels.importPick}
              <input
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  // Le champ garde son fichier : sans reset, réimporter LE MÊME
                  // après correction ne déclencherait aucun événement.
                  e.target.value = '';
                  if (file) onImport(file);
                }}
              />
            </label>
            {importState && (
              <span
                className={`text-3xs ${importState.ok ? 'text-success' : 'text-danger'}`}
                role="status"
              >
                {importState.message}
              </span>
            )}
          </div>
        </div>

        {trackedCount > 0 && (
          <button
            type="button"
            onClick={() => {
              // `fused` suit `heroes` : un choix de fusion sans héros suivi n'a
              // plus de sens, et il rejaillissait au prochain suivi du même perso.
              if (window.confirm(labels.resetConfirm))
                setStore((prev) => ({ ...prev, heroes: {}, fused: {} }));
            }}
            className="border-line text-content-muted hover:border-danger hover:text-danger text-3xs rounded border px-2 py-1 transition-colors"
          >
            {labels.reset}
          </button>
        )}
      </div>
    </details>
  );
}
