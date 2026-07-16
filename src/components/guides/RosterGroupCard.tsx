import { Fragment, type ReactNode } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { CharacterPortrait } from '@/components/character/CharacterPortrait';

/** Un perso affichable dans une carte de groupe (métadonnées résolues au build). */
export interface RosterGroupCardCharacter {
  id: string;
  name: string;
  element?: string;
  classType?: string;
  rarity?: number;
  href?: string;
}

/**
 * LA carte « groupe de persos + raison » : portraits à GAUCHE (2 puis 3 par
 * rangée), noms-liens séparés de virgules puis raison à DROITE. Partagée par
 * RecommendedCharacters (serveur) et TowerCombatRoster (client) — sans hook,
 * donc importable des deux côtés.
 *
 * `decorate` habille chaque portrait sans dupliquer la carte : le roster very
 * hard s'en sert pour le halo (quota) et le grisé + croix (ban).
 */
export function RosterGroupCard({
  characters,
  reason,
  decorate,
}: {
  characters: RosterGroupCardCharacter[];
  /** Raison déjà localisée + parseText par le parent (serveur). */
  reason?: ReactNode;
  decorate?: (portrait: ReactNode, c: RosterGroupCardCharacter) => ReactNode;
}) {
  return (
    <div className="border-line-subtle bg-surface-raised grid grid-cols-[auto_1fr] items-center gap-4 rounded-lg border p-3">
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {characters.map((c) => {
          const portrait = (
            <CharacterPortrait
              id={c.id}
              name={c.name}
              element={c.element}
              classType={c.classType}
              rarity={c.rarity}
              size={56}
              href={c.href}
              showName={false}
            />
          );
          return <Fragment key={c.id}>{decorate ? decorate(portrait, c) : portrait}</Fragment>;
        })}
      </div>

      <div className="min-w-0 space-y-1">
        <p className="text-accent text-sm font-semibold">
          {characters.map((c, ci) => (
            <Fragment key={c.id}>
              {ci > 0 && ', '}
              {c.href ? (
                <Link href={c.href as Route} className="hover:underline">
                  {c.name}
                </Link>
              ) : (
                c.name
              )}
            </Fragment>
          ))}
        </p>
        {reason && <p className="text-content text-sm leading-relaxed">{reason}</p>}
      </div>
    </div>
  );
}
