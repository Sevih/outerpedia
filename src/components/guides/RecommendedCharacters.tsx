import { Fragment, type ReactNode } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
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

/**
 * Personnages recommandés d'un guide : les portraits à GAUCHE (3 par rangée),
 * les noms puis la raison à DROITE.
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
        {groups.map((g, i) => {
          const chars = g.characters.map((name) => {
            const c = findCharacterByName(name);
            // Nom inconnu = erreur de contenu → le build SSG CASSE.
            if (!c) throw new Error(`RecommendedCharacters : personnage inconnu « ${name} »`);
            const slug = slugForId(c.id);
            return {
              c,
              name: characterDisplayName(c, lang),
              href: slug ? localePath(lang, `/characters/${slug}`) : undefined,
            };
          });

          return (
            <div
              key={i}
              className="border-line-subtle bg-surface-raised grid grid-cols-[auto_1fr] items-center gap-4 rounded-lg border p-3"
            >
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {chars.map(({ c, name, href }) => (
                  <CharacterPortrait
                    key={c.id}
                    id={c.id}
                    name={name}
                    element={c.element}
                    classType={c.class}
                    rarity={c.rarity}
                    size={56}
                    href={href}
                    showName={false}
                  />
                ))}
              </div>

              <div className="min-w-0 space-y-1">
                <p className="text-accent text-sm font-semibold">
                  {chars.map(({ c, name, href }, ci) => (
                    <Fragment key={c.id}>
                      {ci > 0 && ', '}
                      {href ? (
                        <Link href={href as Route} className="hover:underline">
                          {name}
                        </Link>
                      ) : (
                        name
                      )}
                    </Fragment>
                  ))}
                </p>
                {g.reason && <p className="text-content text-sm leading-relaxed">{g.reason}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
