import type { ReactNode } from 'react';
import type { Lang } from '@/lib/i18n/config';
import { resolveGuideCharacter } from '@/lib/data/characters';
import { RosterGroupCard } from './RosterGroupCard';

export interface RecommendedGroup {
  /** Noms d'affichage EN (clé du contenu éditorial). */
  characters: string[];
  /** Raison déjà localisée/parseText côté appelant. */
  reason?: ReactNode;
}

/**
 * Personnages recommandés d'un guide : les portraits à GAUCHE (3 par rangée),
 * les noms puis la raison à DROITE — le rendu vit dans `RosterGroupCard`
 * (partagé avec le roster very hard des tours).
 *
 * Le portrait ne porte pas son nom ici : les noms sont écrits à côté, en LIENS —
 * c'est par eux qu'on saute à la fiche du perso, et les répéter sous les vignettes
 * ne ferait qu'écraser la raison, qui est le vrai contenu du bloc.
 */
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
          <RosterGroupCard
            key={i}
            // Nom inconnu = erreur de contenu → le build SSG CASSE (dans le résolveur).
            characters={g.characters.map((raw) => {
              const {
                character: c,
                name,
                href,
              } = resolveGuideCharacter(raw, lang, 'RecommendedCharacters');
              return {
                id: c.id,
                name,
                element: c.element,
                classType: c.class,
                rarity: c.rarity,
                href,
              };
            })}
            reason={g.reason}
          />
        ))}
      </div>
    </section>
  );
}
