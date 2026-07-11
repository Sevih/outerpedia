import type { ReactNode } from 'react';
import type { Lang } from '@/lib/i18n/config';
import { characterDisplayName, findCharacterByName, slugForId } from '@/lib/data/characters';
import { localePath } from '@/lib/navigation';
import { CharacterPortrait } from '@/components/character/CharacterPortrait';

export interface RecommendedGroup {
  /** Noms d'affichage EN (clé du contenu éditorial). */
  characters: string[];
  /** Raison déjà localisée/parseText côté appelant. */
  reason?: ReactNode;
}

/** Personnages recommandés, par groupes (portraits + raison). */
export function RecommendedCharacters({
  title,
  groups,
  lang,
}: {
  title: string;
  groups: RecommendedGroup[];
  lang: Lang;
}) {
  if (!groups.length) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-content-strong text-xl font-bold">{title}</h2>
      <div className="space-y-3">
        {groups.map((g, i) => (
          <div
            key={i}
            className="border-line-subtle bg-surface-raised flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center"
          >
            <div className="flex flex-wrap gap-2">
              {g.characters.map((name) => {
                const c = findCharacterByName(name);
                // Nom inconnu = erreur de contenu → le build SSG CASSE.
                if (!c) throw new Error(`RecommendedCharacters : personnage inconnu « ${name} »`);
                const slug = slugForId(c.id);
                return (
                  <CharacterPortrait
                    key={c.id}
                    id={c.id}
                    name={characterDisplayName(c, lang)}
                    element={c.element}
                    classType={c.class}
                    rarity={c.rarity}
                    size={56}
                    href={slug ? localePath(lang, `/characters/${slug}`) : undefined}
                  />
                );
              })}
            </div>
            {g.reason && <div className="text-content-muted min-w-0 text-sm">{g.reason}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}
