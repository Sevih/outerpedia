'use client'

import { useKeenSlider, KeenSliderPlugin } from 'keen-slider/react'
import 'keen-slider/keen-slider.min.css'
import { useState } from 'react'
import allCharacters from '@/data/_allCharacters.json'
import type { ElementType, ClassType } from '@/types/enums'
import { CharacterNameDisplay } from '@/app/components/CharacterNameDisplay'
import { ElementIcon } from '@/app/components/ElementIcon'
import { ClassIcon } from '@/app/components/ClassIcon'
import Link from 'next/link'
import { toKebabCase } from '@/utils/formatText'
import Image from 'next/image'
import { l } from '@/lib/localize'
import { useTenant } from '@/lib/contexts/TenantContext'
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

// Plugin pour créer l'effet carousel 3D rotatif
const carousel: KeenSliderPlugin = (slider) => {
  const maxVisibleSlides = 5 // Maximum de cartes visibles

  // Calculer la distance z en fonction du nombre de slides pour éviter le chevauchement
  function getZDistance(slideCount: number): number {
    // Formule: plus il y a de slides, plus le cercle doit être grand
    // On garde 165px comme base et on augmente proportionnellement
    const baseZ = 165
    const additionalZ = Math.max(0, (slideCount - 5) * 15) // +15px par slide au-delà de 5
    return baseZ + additionalZ
  }

  function rotate() {
    const z = getZDistance(slider.slides.length)
    const deg = 360 * slider.track.details.progress
    slider.container.style.transform = `translateZ(-${z}px) rotateY(${-deg}deg)`
  }

  function updateVisibility() {
    const currentSlide = slider.track.details.rel
    const totalSlides = slider.slides.length

    slider.slides.forEach((slide, idx) => {
      // Calculer la distance de cette slide par rapport à la slide active
      let distance = idx - currentSlide

      // Gérer le wrap-around pour les carousels en boucle
      if (distance > totalSlides / 2) {
        distance -= totalSlides
      } else if (distance < -totalSlides / 2) {
        distance += totalSlides
      }

      const absDistance = Math.abs(distance)

      // Masquer les slides trop éloignées (au-delà de 2 de chaque côté)
      if (absDistance > Math.floor(maxVisibleSlides / 2)) {
        slide.style.opacity = '0'
        slide.style.visibility = 'hidden'
      } else {
        slide.style.opacity = '1'
        slide.style.visibility = 'visible'
      }

      // Marquer la slide active
      slide.classList.toggle('is-active', idx === currentSlide)
    })
  }

  slider.on('created', () => {
    const z = getZDistance(slider.slides.length)
    const deg = 360 / slider.slides.length
    slider.slides.forEach((element, idx) => {
      element.style.transform = `rotateY(${deg * idx}deg) translateZ(${z}px)`
      element.style.transition = 'opacity 0.3s ease, visibility 0.3s ease'
    })
    rotate()
    updateVisibility()
  })

  slider.on('detailsChanged', () => {
    rotate()
    updateVisibility()
  })
}

export default function CarouselSlotV2({ characters }: Props) {
  const { key } = useTenant()
  const [isAnimating, setIsAnimating] = useState(false)

  const [sliderRef, instanceRef] = useKeenSlider(
    {
      initial: 0,
      loop: true,
      selector: '.carousel__cell',
      renderMode: 'custom',
      mode: 'free-snap',
      defaultAnimation: {
        duration: 400,
      },
      animationStarted() {
        setIsAnimating(true)
      },
      animationEnded() {
        setIsAnimating(false)
      },
    },
    [carousel]
  )

  return (
    <div className="wrapper_carrousel">
      <div className="scene">
        <div ref={sliderRef} className="carousel keen-slider">
          {characters.map((name, idx) => {
            const data = getCharacterData(name)
            if (!data?.ID) return null

            const slug = toKebabCase(data.Fullname)
            const namelocalized = data ? l(data, 'Fullname', key as TenantKey) : name

            return (
              <div key={`${name}-${idx}`} className="carousel__cell">
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
                    width={120}
                    height={231}
                    loading="lazy"
                  />

                  <div className="absolute top-4 right-1 z-30 flex flex-col items-end -space-y-1 overlay-fade">
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

      {/* Controls */}
      {characters.length > 1 && (
        <div className="controls">
          <button
            onClick={() => !isAnimating && instanceRef.current?.prev()}
            aria-label="Previous slide"
            className="arrow-button"
            disabled={isAnimating}
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
            onClick={() => !isAnimating && instanceRef.current?.next()}
            aria-label="Next slide"
            className="arrow-button"
            disabled={isAnimating}
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
