import type { ReactNode } from 'react';
import type { Lang } from '@/lib/i18n/config';
import { characterDisplayName, findCharacterByName, slugForId } from '@/lib/data/characters';
import { localePath } from '@/lib/navigation';
import { CharacterPortrait } from '@/components/character/CharacterPortrait';

/**
 * Équipe suggérée : une COLONNE par slot, listant les options du slot de haut
 * en bas (remplace le carrousel V2 — toutes les options visibles d'un coup).
 */
export function TeamSlots({
  title,
  slots,
  note,
  lang,
}: {
  title: string;
  /** Un tableau par slot : noms d'affichage EN des options. */
  slots: string[][];
  /** Note déjà localisée/parseText côté appelant. */
  note?: ReactNode;
  lang: Lang;
}) {
  if (!slots.length) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-content-strong text-xl font-bold">{title}</h2>
      <div className="flex flex-wrap justify-center gap-4">
        {slots.map((options, i) => (
          <div
            key={i}
            className="border-line-subtle bg-surface-raised flex flex-col items-center gap-2 rounded-lg border p-3"
          >
            {options.map((name) => {
              const c = findCharacterByName(name);
              // Nom inconnu = erreur de contenu → le build SSG CASSE.
              if (!c) throw new Error(`TeamSlots : personnage inconnu « ${name} »`);
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
        ))}
      </div>
      {note && <div className="panel-info px-4 py-3 text-sm">{note}</div>}
    </section>
  );
}
