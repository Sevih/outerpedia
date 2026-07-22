import type { Character } from '@contracts';
import { characterDisplayName, characterNamePrefix } from '@/lib/data/characters';
import { CharacterCard } from '@/components/character/CharacterCard';
import { CHAIN_PILL, img } from '@/lib/admin/assets';

/**
 * En-tête VISUEL d'un perso (données de jeu) : la MÊME carte que le site
 * (rareté/élément/classe/badges portés par la carte — pas de répétition) +
 * les infos hors carte (sous-classe, chaîne) + la GALERIE des images du perso
 * non utilisées plus bas dans la page (FI, ATB, full, EE…) pour contrôle.
 */
export function CharacterVisual({ char, tags }: { char: Character; tags?: string[] }) {
  const name = characterDisplayName(char);
  const gallery: { label: string; src: string; wide?: boolean }[] = [
    { label: 'FI (face)', src: img.face(char.id) },
    { label: 'ATB', src: img.atb(char.id) },
    { label: 'IMG (full)', src: img.full(char.id), wide: true },
    ...(char.ee ? [{ label: 'EE', src: img.ee(char.id) }] : []),
  ];

  return (
    <div className="border-line-subtle bg-surface-raised flex flex-wrap gap-5 rounded-lg border p-4">
      {/* Carte du site : rareté, élément, classe, badges — source unique */}
      <CharacterCard
        id={char.id}
        name={name}
        prefix={characterNamePrefix(char)}
        element={char.element}
        classType={char.class}
        rarity={char.rarity}
        tags={tags}
        size="lg"
      />

      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex flex-wrap items-baseline gap-2">
          <h1 className="text-content-strong text-2xl font-semibold">{name}</h1>
          <span className="text-content-subtle text-xs">
            {char.id}
            {char.originalCharacter ? ' · core-fusion' : ''}
          </span>
        </div>

        <div className="text-content-muted flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          {char.subClass && (
            <span className="inline-flex items-center gap-1.5">
              <img
                src={img.subClass(char.subClass)}
                alt=""
                aria-hidden
                className="h-5 w-5"
                width={20}
                height={20}
              />
              {char.subClass}
            </span>
          )}
          {char.chainType && (
            <span
              className={`rounded px-2 py-0.5 text-xs font-medium ${CHAIN_PILL[char.chainType] ?? ''}`}
            >
              chain : {char.chainType}
            </span>
          )}
        </div>

        {/* Galerie de contrôle : les images du perso non affichées plus bas */}
        <div className="flex flex-wrap items-end gap-3">
          {gallery.map((g) => (
            <figure key={g.label} className="space-y-1">
              <div
                className={`border-line-subtle bg-surface-base flex h-24 items-center justify-center overflow-hidden rounded-md border ${g.wide ? 'w-32' : 'w-24'}`}
              >
                <img src={g.src} alt={g.label} className="max-h-full max-w-full object-contain" />
              </div>
              <figcaption className="text-content-subtle text-center text-[10px] uppercase">
                {g.label}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
