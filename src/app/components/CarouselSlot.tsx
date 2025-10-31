'use client'

import { useKeenSlider, KeenSliderPlugin } from 'keen-slider/react'
import 'keen-slider/keen-slider.min.css'
import { useRef, useState, useEffect } from 'react'
import allCharacters from '@/data/_allCharacters.json'
import type { ElementType, ClassType } from '@/types/enums'
import { CharacterNameDisplay } from '@/app/components/CharacterNameDisplay'
import { ElementIcon } from '@/app/components/ElementIcon'
import { ClassIcon } from '@/app/components/ClassIcon'
import Link from 'next/link'
import { toKebabCase } from '@/utils/formatText'
import Image from 'next/image'
import { l } from '@/lib/localize'
import { useTenant } from '@/lib/contexts/TenantContext';
import type { TenantKey } from '@/tenants/config'


function getCharacterData(name: string) {
  return allCharacters.find((char) => char.Fullname === name)
}

function rarityToStars(rarity: number): number[] {
  return Array.from({ length: rarity })
}


type Props = {
  characters: string[]
}

const carousel: KeenSliderPlugin = (slider) => {
  const z = 165
  function rotate() {
    const deg = 360 * slider.track.details.progress
    slider.container.style.transform = `translateZ(-${z}px) rotateY(${-deg}deg)`
  }

  slider.on('created', () => {
    const deg = 360 / slider.slides.length
    slider.slides.forEach((element, idx) => {
      element.style.transform = `rotateY(${deg * idx}deg) translateZ(${z}px)`
    })
    rotate()
  })

  slider.on('detailsChanged', () => {
    rotate()
    const slide = slider.track.details.rel
    slider.slides.forEach((s, i) => {
      s.classList.toggle('is-active', i === slide)
    })
  })
}

export default function CarouselSlot({ characters }: Props) {
  const { key } = useTenant()
  const sliderRef = useRef<HTMLDivElement>(null)

  // Maximum visible characters in carousel at once
  const maxVisibleCharacters = 5
  const [centerIndex, setCenterIndex] = useState(0)

  // Get visible characters: create a sliding window
  // centerIdx is the character that should be in the CENTER (front) of the carousel
  const getVisibleCharacters = (centerIdx: number) => {
    if (characters.length <= maxVisibleCharacters) {
      return characters
    }

    const visible: string[] = []
    const half = Math.floor(maxVisibleCharacters / 2)

    // Create window with centerIdx in the middle
    for (let i = -half; i <= half; i++) {
      const idx = (centerIdx + i + characters.length) % characters.length
      visible.push(characters[idx])
    }

    return visible
  }

  const displayedCharacters = getVisibleCharacters(centerIndex)
  const hasMoreThanMax = characters.length > maxVisibleCharacters
  const middleIdx = Math.floor(displayedCharacters.length / 2)

  // Use displayed characters as key to force re-mount when they change
  const carouselKey = hasMoreThanMax ? displayedCharacters.join(',') : 'static'

  const [sliderInstanceRef, slider] = useKeenSlider<HTMLDivElement>(
    {
      loop: true,
      selector: '.carousel__cell',
      renderMode: 'custom',
      mode: 'free-snap',
      initial: middleIdx,
      // Disable animation on initial mount for smoother transitions
      ...(hasMoreThanMax && { animationEnded: () => {} }),
    },
    [carousel]
  )

  const [activeIndex, setActiveIndex] = useState(middleIdx)

  useEffect(() => {
    if (!slider.current) return

    const update = () => {
      const details = slider.current!.track.details
      if (!details) return

      const slide = details.slides[details.rel] as unknown as { index: number }
      if (slide?.index !== undefined) {
        setActiveIndex(slide.index)
      }
    }

    slider.current.on('detailsChanged', update)
    update()
  }, [slider])

  // Handle navigation to update center index
  const handlePrev = () => {
    if (hasMoreThanMax) {
      setCenterIndex((prev) => (prev - 1 + characters.length) % characters.length)
    } else {
      slider.current?.prev()
    }
  }

  const handleNext = () => {
    if (hasMoreThanMax) {
      setCenterIndex((prev) => (prev + 1) % characters.length)
    } else {
      slider.current?.next()
    }
  }

  return (
    <div className="wrapper_carrousel">
      <div className="scene">
        <div
          key={carouselKey}
          className="carousel keen-slider"
          ref={(el) => {
            sliderRef.current = el
            sliderInstanceRef(el)
          }}
        >
          {displayedCharacters.map((name, i) => {
            const data = getCharacterData(name)
            if (!data?.ID) return null

            const slug = toKebabCase(data.Fullname)
            const isActive = i === activeIndex
            const namelocalized = data ? l(data, 'Fullname', key as TenantKey) : name;    
            return (
              <div
                key={i}
                className={`carousel__cell ${isActive ? 'is-active' : ''}`}
              >
                <div className="relative w-full h-full">
                  <Link
                    href={`/characters/${slug}`}
                    prefetch={false}
                    className="absolute inset-0 z-40"
                  >
                    <span className="sr-only">{data.Fullname}</span>
                  </Link>

                  <Image
                    src={`/images/characters/portrait/CT_${data.ID}.webp`}
                    alt={data.Fullname}
                    className="carousel-card"
                    width={240}
                    height={340}
                    loading="lazy"
                  />

                  <div className="absolute top-4 right-1 z-30 flex flex-col items-end -space-y-1">
                    {rarityToStars(data.Rarity).map((_, i) => (
                      <Image
                        key={i}
                        src="/images/ui/star.webp"
                        alt="star"
                        width={20}
                        height={20}
                        style={{ width: 20, height: 20 }}
                      />
                    ))}
                  </div>

                  <div className="absolute bottom-[3.125rem] right-2 z-30 overlay-fade">
                    <ClassIcon className={data.Class as ClassType} />
                  </div>

                  <div className="absolute bottom-[1.375rem] right-1.5 z-30 overlay-fade">
                    <ElementIcon element={data.Element as ElementType} />
                  </div>

                  <div className="absolute bottom-0 left-0 w-full overlay-fade z-30">  
                                  
                    <CharacterNameDisplay fullname={namelocalized} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {displayedCharacters.length > 1 && (
        <div className="controls">
          <button
            onClick={handlePrev}
            aria-label="Previous slide"
            className="arrow-button"
          >
            <Image
              src="/images/ui/CM_Icon_Arrow_Story.webp"
              alt="Previous"
              width={24}
              height={24}
              style={{ width: 24, height: 24 }}
              className="rotate-180"
            />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next slide"
            className="arrow-button"
          >
            <Image
              src="/images/ui/CM_Icon_Arrow_Story.webp"
              alt="Next"
              width={24}
              height={24}
              style={{ width: 24, height: 24 }}
            />
          </button>
        </div>
      )}
    </div>
  )
}
