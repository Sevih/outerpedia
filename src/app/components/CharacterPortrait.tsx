import Image from 'next/image'
import portraitCoordinates from '@/data/portrait-coordinates.json'

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
}: CharacterPortraitProps) {
  const charCoords = portraitCoordinates.characters[characterId as keyof typeof portraitCoordinates.characters]
  const defaultCoords = portraitCoordinates._defaultCrop

  const finalOffsetX = offsetX ?? charCoords?.offsetX ?? defaultCoords.offsetX
  const finalOffsetY = offsetY ?? charCoords?.offsetY ?? defaultCoords.offsetY

  return (
    <div
      className={`relative overflow-y-hidden ${className}`}
      style={{
        width: size,
        height: size,
      }}
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
  )
}
