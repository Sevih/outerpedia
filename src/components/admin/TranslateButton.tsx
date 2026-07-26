'use client';

/**
 * Bouton « Translate (EN → all) » + son message, pour les éditeurs admin
 * (audit F4). Le bloc JSX était recopié à l'identique dans quatre éditeurs,
 * infobulle et classes comprises — un changement de libellé en demandait quatre.
 *
 * L'état vient de `useAutoTranslate` : ce composant n'est que la surface.
 */
import type { AutoTranslateResult } from '@/lib/admin/useAutoTranslate';

const BTN =
  'rounded-md border border-line px-3 py-1.5 text-sm text-content hover:border-accent disabled:opacity-50';

export function TranslateButton({
  t,
  className,
}: {
  t: AutoTranslateResult;
  /** Classe du bouton — l'éditeur passe la sienne s'il en a une (`btn` local). */
  className?: string;
}) {
  return (
    <>
      <button
        type="button"
        className={className ?? BTN}
        onClick={t.run}
        disabled={t.state === 'loading'}
        title="Regenerates every other language from the English text — existing translations are overwritten (DeepL → Haiku)"
      >
        {t.state === 'loading' ? 'Translating…' : 'Translate (EN → all)'}
      </button>
      {t.message && (
        <span className={`text-xs ${t.state === 'error' ? 'text-danger' : 'text-content-subtle'}`}>
          {t.message}
        </span>
      )}
    </>
  );
}
