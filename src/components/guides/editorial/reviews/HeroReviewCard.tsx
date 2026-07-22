/**
 * Carte de review d'un héros (guides « Premium & Limited », « Core Fusion ») —
 * l'en-tête V2 (icône ATB + nom lié + badge de tag + élément/classe) sur les
 * primitives V3. Toute l'identité visuelle DÉRIVE de la fiche perso : la V2
 * rechargeait ces infos côté client par nom (character-client).
 */
import Link from 'next/link';
import type { Route } from 'next';
import type { ReactNode } from 'react';
import type { Character } from '@contracts';
import type { Lang } from '@/lib/i18n/config';
import { img } from '@/lib/images';
import { localePath } from '@/lib/navigation';
import { characterDisplayName, slugForId } from '@/lib/data/characters';

/** Tags dont un sprite éditorial existe (images/ui/tags/<tag>.webp). */
const TAG_SPRITES = new Set(['premium', 'limited', 'seasonal', 'collab', 'core-fusion']);

export function HeroReviewCard({
  character,
  lang,
  children,
}: {
  character: Character;
  lang: Lang;
  children: ReactNode;
}) {
  const name = characterDisplayName(character, lang);
  const slug = slugForId(character.id);
  const tag = (character.tags ?? []).find((t) => TAG_SPRITES.has(t));
  return (
    <section className="border-line bg-surface-raised/60 rounded-xl border p-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-content-strong m-0 flex items-center gap-3 text-xl font-semibold">
          <img
            src={img.atb(character.id)}
            alt=""
            aria-hidden
            width={40}
            height={40}
            className="h-10 w-10 rounded-lg object-contain"
          />
          {slug ? (
            <Link
              href={localePath(lang, `/characters/${slug}`) as Route}
              className="hover:underline"
            >
              {name}
            </Link>
          ) : (
            name
          )}
          {tag && (
            <img
              src={img.tag(tag)}
              alt={tag}
              className="h-9 w-9 object-contain"
              width={36}
              height={36}
            />
          )}
        </h3>
        <div className="flex items-center gap-1.5">
          <img
            src={img.element(character.element)}
            alt={character.element}
            className="h-6 w-6 drop-shadow-md"
            width={24}
            height={24}
          />
          <img
            src={img.klass(character.class)}
            alt={character.class}
            className="h-6 w-6 drop-shadow-md"
            width={24}
            height={24}
          />
        </div>
      </header>
      <div className="mt-3 space-y-4">{children}</div>
    </section>
  );
}
