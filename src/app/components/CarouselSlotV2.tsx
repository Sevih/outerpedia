'use client'

import { useKeenSlider, KeenSliderPlugin } from 'keen-slider/react'
import 'keen-slider/keen-slider.min.css'
import { useState } from 'react'
import Image from 'next/image'
import CharacterCard, { findCharacter } from '@/app/components/CharacterCard'

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
            const char = findCharacter(name)
            if (!char?.ID) return null

            return (
              <div key={`${name}-${idx}`} className="carousel__cell">
                <CharacterCard
                  name={name}
                  size="md"
                  asContent
                  responsive
                  showLimited={false}
                />
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
