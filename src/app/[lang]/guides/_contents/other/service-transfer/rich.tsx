/**
 * Mini-rendu inline pour le contenu du guide service-transfer : `**gras**` et
 * `[label](url)` (liens EXTERNES ou ancres — hors périmètre des tags
 * parse-text, qui ne lient que l'interne). Remplace le HTML inline +
 * dangerouslySetInnerHTML de la V2. Local au guide : à promouvoir en
 * primitive si un deuxième contenu en a besoin.
 */
import type { ReactNode } from 'react';

const TOKEN = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;

export function rich(text: string): ReactNode {
  const parts = text.split(TOKEN);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link) {
      const [, label, href] = link;
      const external = /^https?:\/\//.test(href);
      return (
        <a
          key={i}
          href={href}
          className="text-sky-400 underline"
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {label}
        </a>
      );
    }
    return part;
  });
}
