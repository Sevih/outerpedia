'use client'

import { useKeenSlider, KeenSliderPlugin } from 'keen-slider/react'
import 'keen-slider/keen-slider.min.css'
import { useRef, useState, useEffect } from 'react'
import allCharacters from '@/data/_allCharacters.json'
import type { ElementType, ClassType } from '@/types/enums'
import { CharacterNameDisplayCompactCarousel } from '@/app/components/CharacterNameDisplay'
import { ElementIcon } from '@/app/components/ElementIcon'
import { ClassIcon } from '@/app/components/ClassIcon'
import Link from 'next/link'
import { toKebabCase } from '@/utils/formatText'
import Image from 'next/image'

// ===== Fixed compact constants (≈ 30% smaller than original) =====
const S = 0.5 as const
const CARD_W = 240 * S // 168
const CARD_H = 340 * S // 238
const STAR = Math.round(20 * (S*2)) // 14
const ARROW = Math.round(24 * (S)) // 17
const INSET_TOP = Math.round(16 * (S*2)) // 11
const CLASS_BOTTOM = Math.round(50 * (S*2)) // 35
const ELEMENT_BOTTOM = Math.round(22 * (S*2)) // 15
const Z_BASE = Math.round(100) // 116

function getCharacterData(name: string) {
  return allCharacters.find((c) => c.Fullname === name) as
    | { ID: string | number; Fullname: string; Rarity: number; Class: ClassType; Element: ElementType }
    | undefined
}

function rarityToStars(rarity: number) {
  return Array.from({ length: rarity })
}

type Props = { characters: string[] }

const carousel: KeenSliderPlugin = (slider) => {
  function rotate() {
    const deg = 360 * slider.track.details.progress
    slider.container.style.transform = `translateZ(-${Z_BASE}px) rotateY(${-deg}deg)`
  }

  slider.on('created', () => {
    const deg = 360 / slider.slides.length
    slider.slides.forEach((el, idx) => {
      // place each slide on the ring with the new (smaller) radius
      el.setAttribute('style', `${el.getAttribute('style') ?? ''}; transform: rotateY(${deg * idx}deg) translateZ(${Z_BASE}px); width:${CARD_W}px; height:${CARD_H}px;`)
    })
    rotate()
  })

  slider.on('detailsChanged', () => {
    rotate()
    const active = slider.track.details.rel
    slider.slides.forEach((s, i) => s.classList.toggle('is-active', i === active))
  })
}

export default function CarouselSlotCompact(_props: Props) {
  const { characters } = _props
  const sliderRef = useRef<HTMLDivElement>(null)
  const [sliderInstanceRef, slider] = useKeenSlider<HTMLDivElement>(
    { loop: true, selector: '.carousel__cell', renderMode: 'custom', mode: 'free-snap' },
    [carousel]
  )
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (!slider.current) return
    const update = () => {
      const d = slider.current!.track.details
      if (!d) return
      const rel = d.slides[d.rel] as unknown as { index: number }
      if (rel?.index !== undefined) setActiveIndex(rel.index)
    }
    slider.current.on('detailsChanged', update)
    update()
  }, [slider])

  return (
    <div className="wrapper_carrousel_compact">
      <div className="scene" style={{ width: CARD_W , height: CARD_H  }}>
        <div
          className="carousel keen-slider"
          ref={(el) => {
            sliderRef.current = el
            sliderInstanceRef(el)
          }}
          // tighten the 3D container footprint so transitions align in compact mode
          style={{ width: CARD_W , height: CARD_H  }}
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
                style={{ width: CARD_W, height: CARD_H }}
              >
                <div className="relative w-full h-full">
                  <Link href={`/characters/${slug}`} prefetch={false} className="absolute inset-0 z-40">
                    <span className="sr-only">{data.Fullname}</span>
                  </Link>

                  {/* IMPORTANT: set explicit width/height on Image and remove object-fit cover to avoid cropping */}
                  <Image
                    src={`/images/characters/portrait/CT_${data.ID}.webp`}
                    alt={data.Fullname}
                    width={Math.round(CARD_W)}
                    height={Math.round(CARD_H)}
                    loading="lazy"
                    // no className with fixed CSS that could override size
                    style={{ width: CARD_W, height: CARD_H, borderRadius: 12 * S, boxShadow: '0 8px 20px rgba(0,0,0,0.35)' }}
                  />

                  {/* Rarity Stars */}
                  <div className="absolute z-30 flex flex-col items-end -space-y-1" style={{ top: INSET_TOP, right: 17 }}>
                    {rarityToStars(data.Rarity).map((_, idx) => (
                      <Image key={idx} src="/images/ui/star.webp" alt="star" width={STAR} height={STAR} style={{ width: STAR, height: STAR }} />
                    ))}
                  </div>

                  {/* Class Icon */}
                  <div className="absolute z-30 overlay-fade h-6 w-6" style={{ right: 17, bottom: CLASS_BOTTOM }}>
                      <ClassIcon className={data.Class as ClassType} />

                  </div>

                  {/* Element Icon */}
                  <div className="absolute z-30 overlay-fade h-6 w-6" style={{ right: 17, bottom: ELEMENT_BOTTOM }}>
                      <ElementIcon element={data.Element as ElementType} />
                  </div>

                  {/* Name Bar */}
                  <div className="absolute bottom-2 left-5 w-full overlay-fade z-30">
                    <CharacterNameDisplayCompactCarousel fullname={data.Fullname} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {characters.length > 1 && (
        <div className="controls" style={{ gap: 6 }}>
          <button onClick={() => slider.current?.prev()} aria-label="Previous slide" className="arrow-button">
            <Image src="/images/ui/CM_Icon_Arrow_Story.webp" alt="Previous" width={ARROW} height={ARROW} className="rotate-180" />
          </button>
          <button onClick={() => slider.current?.next()} aria-label="Next slide" className="arrow-button">
            <Image src="/images/ui/CM_Icon_Arrow_Story.webp" alt="Next" width={ARROW} height={ARROW} />
          </button>
        </div>
      )}
    </div>
  )
}
