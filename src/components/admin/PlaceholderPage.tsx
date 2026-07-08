import Link from 'next/link';
import type { Route } from 'next';

/**
 * Écran d'attente pendant la refonte du menu admin (extractor / editor / tools).
 * La coquille et la navigation sont en place ; le contenu réel est migré
 * ensuite, une entité à la fois. `currentHref` garde la page actuelle joignable
 * tant que la migration n'est pas faite.
 */
export function PlaceholderPage({
  title,
  kind,
  note,
  currentHref,
}: {
  title: string;
  kind?: 'extractor' | 'editor' | 'tools' | 'guides';
  note?: string;
  currentHref?: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h1 className="text-content-strong text-xl font-semibold">{title}</h1>
        {kind && (
          <span className="bg-surface-overlay text-content-subtle rounded px-2 py-0.5 text-xs uppercase">
            {kind}
          </span>
        )}
      </div>
      <p className="text-content-muted max-w-prose text-sm">
        {note ?? 'Écran à venir — la coquille est posée, le contenu arrive à l’étape suivante.'}
      </p>
      {currentHref && (
        <Link
          href={currentHref as Route}
          className="border-line bg-surface-raised hover:border-accent inline-block rounded-md border px-3 py-1.5 text-sm"
        >
          Ouvrir la page actuelle (avant migration) →
        </Link>
      )}
    </div>
  );
}
