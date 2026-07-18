import Link from 'next/link';
import type { Route } from 'next';

/**
 * Bascule rapide contrôle (extractor) ↔ curation (editor) d'une MÊME entité, en
 * gardant l'id, sans repasser par le menu de gauche. Générique sur le segment de
 * route (`characters`, `monsters`…) — remplace les ex-CharacterSwitch/MonsterSwitch,
 * identiques au chemin près.
 */
export function EntitySwitch({
  id,
  mode,
  entity,
}: {
  id: string;
  mode: 'extractor' | 'editor';
  /** Segment de route de l'entité (`characters`, `monsters`, `ee`…). */
  entity: 'characters' | 'monsters' | 'ee';
}) {
  const tabs = [
    { key: 'extractor', label: 'Extractor', href: `/admin/extractor/${entity}/${id}` },
    { key: 'editor', label: 'Editor', href: `/admin/editor/${entity}/${id}` },
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
