'use client';

/**
 * Modale export / import du Progress Tracker — extraite du composant principal
 * (découpage du 03/10/2026 — JSX déplacé tel quel ; l'état reste au parent,
 * via `useTrackerState`).
 */
import { Modal } from '@/components/ui/Modal';
import { copyText } from '@/hooks/useCopyToClipboard';
import { exportState, type UserProgress, type UserSettings } from './tracker';
import type { TrackerLabels } from './contracts';
import { MODAL_PANEL } from './ui';

export function ExportModal({
  labels,
  view,
  settings,
  importData,
  setImportData,
  importError,
  setImportError,
  setShowExport,
  handleImport,
}: {
  labels: TrackerLabels;
  view: UserProgress;
  settings: UserSettings;
  importData: string;
  setImportData: (next: string) => void;
  importError: boolean;
  setImportError: (next: boolean) => void;
  setShowExport: (next: boolean) => void;
  handleImport: () => void;
}) {
  return (
    <Modal
      label={labels.exportImport}
      className={`${MODAL_PANEL} max-w-md`}
      onClose={() => {
        setShowExport(false);
        setImportData('');
        setImportError(false);
      }}
    >
      <h3 className="mb-4 text-xl font-bold">{labels.exportImport}</h3>
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">{labels.export}</label>
          <button
            onClick={() => {
              void copyText(exportState(view, settings));
              setShowExport(false);
            }}
            className="w-full rounded bg-blue-600 px-4 py-2 transition hover:bg-blue-700"
          >
            {labels.copyToClipboard}
          </button>
          <p className="text-content-muted mt-1 text-xs">{labels.exportDesc}</p>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">{labels.import}</label>
          <textarea
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
            className="bg-surface-overlay h-32 w-full rounded px-3 py-2 font-mono text-sm"
            placeholder={labels.pasteHere}
          />
          {importError && <p className="text-danger mt-1 text-sm">{labels.importError}</p>}
          <button
            onClick={handleImport}
            disabled={!importData.trim()}
            className="disabled:bg-surface-overlay mt-2 w-full rounded bg-green-600 px-4 py-2 transition hover:bg-green-700 disabled:cursor-not-allowed"
          >
            {labels.importButton}
          </button>
        </div>
      </div>
      <button
        onClick={() => {
          setShowExport(false);
          setImportData('');
          setImportError(false);
        }}
        className="bg-surface-overlay hover:bg-surface-overlay/70 mt-4 w-full rounded px-4 py-2 transition"
      >
        {labels.close}
      </button>
    </Modal>
  );
}
