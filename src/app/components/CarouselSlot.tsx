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
  const sliderRef = useRef<HTMLDivElement>(null)
  const [sliderInstanceRef, slider] = useKeenSlider<HTMLDivElement>(
    {
      loop: true,
      selector: '.carousel__cell',
      renderMode: 'custom',
      mode: 'free-snap',
    },
    [carousel]
  )

  const [activeIndex, setActiveIndex] = useState(0)

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

  return (
    <div className="wrapper_carrousel">
      <div className="scene">
        <div
          className="carousel keen-slider"
          ref={(el) => {
            sliderRef.current = el
            sliderInstanceRef(el)
          }}
        >
          {characters.map((name, i) => {
            const data = getCharacterData(name)
            if (!data?.ID) return null

            const slug = toKebabCase(data.Fullname)
            const isActive = i === activeIndex

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
                    <CharacterNameDisplay fullname={data.Fullname} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {characters.length > 1 && (
        <div className="controls">
          <button
            onClick={() => slider.current?.prev()}
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
            onClick={() => slider.current?.next()}
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
