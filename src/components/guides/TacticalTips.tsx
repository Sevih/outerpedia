import type { ReactNode } from 'react';

/** Liste de conseils tactiques (contenu déjà localisé/parseText côté appelant). */
export function TacticalTips({ title, tips }: { title: string; tips: ReactNode[] }) {
  if (!tips.length) return null;
  return (
    <section className="space-y-2">
      <h2 className="text-content-strong text-xl font-bold">{title}</h2>
      <ul className="panel-info list-inside list-disc space-y-1.5 px-4 py-3 text-sm">
        {tips.map((tip, i) => (
          <li key={i}>{tip}</li>
        ))}
      </ul>
    </section>
  );
}
