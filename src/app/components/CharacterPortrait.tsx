import Image from 'next/image'
import portraitCoordinates from '@/data/portrait-coordinates.json'
import _allCharacters from '@/data/_allCharacters.json'
import type { ElementType, ClassType } from '@/types/enums'
import type { CharacterLite } from '@/types/types'

interface CharacterPortraitProps {
  characterId: string
  characterName: string
  /** Taille du crop (par défaut 140x140) */
  size?: number
  /** Offset X manuel (override les coordonnées du JSON) */
  offsetX?: number
  /** Offset Y manuel (override les coordonnées du JSON) */
  offsetY?: number
  /** Zoom (1 = normal, <1 = dézoomer, >1 = zoomer) */
  zoom?: number
  className?: string
  priority?: boolean
  /** Afficher les icônes d'élément et de classe */
  showIcons?: boolean
  /** Afficher les étoiles de rareté */
  showStars?: boolean
}

export function CharacterPortrait({
  characterId,
  characterName,
  size = 140,
  offsetX,
  offsetY,
  zoom = 0.60,
  className = '',
  priority = false,
  showIcons = false,
  showStars = false,
}: CharacterPortraitProps) {
  const charCoords = portraitCoordinates.characters[characterId as keyof typeof portraitCoordinates.characters]
  const defaultCoords = portraitCoordinates._defaultCrop

  const finalOffsetX = offsetX ?? charCoords?.offsetX ?? defaultCoords.offsetX
  const finalOffsetY = offsetY ?? charCoords?.offsetY ?? defaultCoords.offsetY

  // Trouver le personnage par ID
  const character = (_allCharacters as CharacterLite[]).find((char) => char.ID === characterId)
  const element = (character?.Element as ElementType | undefined)?.toLowerCase()
  const cls = (character?.Class as ClassType | undefined)?.toLowerCase()
  const iconSize = Math.max(20, Math.floor(size * 0.35))

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Portrait avec overflow-hidden */}
      <div
        className={`absolute inset-0 overflow-hidden ${className}`}
      >
        <Image
          src={`/images/characters/portrait/CT_${characterId}.webp`}
          alt={characterName}
          width={176}
          height={340}
          className="absolute"
          style={{
            objectFit: 'none',
            // 👉 Ajuste la position et la taille selon le zoom
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            objectPosition: `-${finalOffsetX}px -${finalOffsetY}px`,
            maxWidth: 'none',
          }}
          priority={priority}
        />
      </div>

      {/* Icônes d'élément et de classe - en dehors de l'overflow-hidden */}
      {showIcons && character && (
        <>
          {element && (
            <div className="absolute -top-1.5 right-0 z-10">
                <Image                
                  src={`/images/ui/elem/${element}.webp`}
              alt={element}
                  width={0}
                  height={0}
                  sizes={`${iconSize}px`}
                  //className="absolute drop-shadow-md z-10"
                  className={`w-[${iconSize}px] h-[${iconSize}px] drop-shadow-md`}
                  style={{
                    top: -3,
                    right: -3
                  }}
                />
              </div>


          )}
          {cls && (
              <div className="absolute top-6 right-0 z-10">
                <Image                
                  src={`/images/ui/class/${cls}.webp`}
                  alt={cls}
                  width={0}
                  height={0}
                  sizes={`${iconSize}px`}
                  //className="absolute drop-shadow-md z-10"
                  className={`w-[${iconSize}px] h-[${iconSize}px] drop-shadow-md`}
                  style={{
                    top: iconSize - 2,
                    right: -3
                  }}
                />
              </div>
          )}
            </>
          )}

          {/* Étoiles de rareté */}
          {showStars && character?.Rarity && (
            <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex justify-center items-center gap-0 z-10">
              {Array(character.Rarity)
                .fill(0)
                .map((_, i) => (
                  <Image
                    key={i}
                    src="/images/ui/star.webp"
                    alt="star"
                    width={0}
                    height={0}
                    sizes="17px"
                    className="w-[17px] h-[17px] -mx-0.5"
                  />
                ))}
            </div>
          )}
        </div>
      )
}
