/**
 * Tags éditoriaux (premium/limited/seasonal/collab/free/…) — libellés et
 * descriptions multilingues issus du legacy V2 (contenu wiki, pas de source
 * jeu). L'icône vient de nos assets (`img.tag`).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Lang } from '@/lib/i18n/config';

interface LegacyTag {
  label: string;
  desc: string;
  type: string;
  [k: string]: string;
}

let cache: Record<string, LegacyTag> | null = null;

function loadTags(): Record<string, LegacyTag> {
  if (!cache) {
    try {
      cache = JSON.parse(
        readFileSync(resolve(process.cwd(), 'data/legacy/tags.json'), 'utf8'),
      ) as Record<string, LegacyTag>;
    } catch {
      cache = {};
    }
  }
  return cache;
}

/** Libellé localisé d'un tag (`premium` → « Premium Units »), slug si inconnu. */
export function tagLabel(slug: string, lang: Lang): string {
  const tag = loadTags()[slug];
  if (!tag) return slug;
  return (lang !== 'en' && tag[`label_${lang}`]) || tag.label;
}
