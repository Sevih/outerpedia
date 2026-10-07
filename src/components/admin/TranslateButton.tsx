'use client';

/**
 * Bouton « Translate (EN → all) » + son message, pour les éditeurs admin
 * (audit F4). Le bloc JSX était recopié à l'identique dans quatre éditeurs,
 * infobulle et classes comprises — un changement de libellé en demandait quatre.
 *
 * L'état vient de `useAutoTranslate` : ce composant n'est que la surface.
 *
 * Deux gestes : « Translate » ne retraduit que le périmé (EN modifié depuis le
 * chargement, ou langue manquante) ; « Retranslate all » renvoie TOUT au
 * traducteur. Le second existe parce que la fraîcheur part de l'état du disque
 * au chargement : une correction de l'EN déjà ENREGISTRÉE (ou la page
 * rechargée) passe pour « déjà traduite », et le premier bouton ne pouvait plus
 * jamais rattraper les autres langues (Annihilator, 07/10/2026).
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
        onClick={() => t.run()}
        disabled={t.state === 'loading'}
        title="Regenerates the other languages of every English text edited since the page loaded, or missing a language — existing translations are overwritten (DeepL → Haiku)"
      >
        {t.state === 'loading' ? 'Translating…' : 'Translate (EN → all)'}
      </button>
      <button
        type="button"
        className={className ?? BTN}
        onClick={() => t.run(true)}
        disabled={t.state === 'loading'}
        title="Sends EVERY English text of this editor to the translator, even those considered up to date — use after saving a correction of the English, when « Translate » answers that there is nothing to translate. Costs DeepL quota."
      >
        Retranslate all
      </button>
      {t.message && (
        <span className={`text-xs ${t.state === 'error' ? 'text-danger' : 'text-content-subtle'}`}>
          {t.message}
        </span>
      )}
    </>
  );
}
