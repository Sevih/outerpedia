import Link from 'next/link';
import type { Route } from 'next';

/**
 * Bascule rapide contrôle (extractor) ↔ curation (editor) d'un même monstre,
 * en gardant l'id — même geste que CharacterSwitch.
 */
export function MonsterSwitch({ id, mode }: { id: string; mode: 'extractor' | 'editor' }) {
  const tabs = [
    { key: 'extractor', label: 'Extractor', href: `/admin/extractor/monsters/${id}` },
    { key: 'editor', label: 'Editor', href: `/admin/editor/monsters/${id}` },
  ] as const;

  return (
    <div className="border-line inline-flex rounded-md border p-0.5 text-sm">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href as Route}
          aria-current={mode === t.key ? 'page' : undefined}
          className={`rounded px-3 py-1 ${
            mode === t.key
              ? 'bg-accent text-accent-fg font-medium'
              : 'text-content-muted hover:text-content-strong'
          }`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
