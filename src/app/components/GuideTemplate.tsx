// app/components/GuideTemplate.tsx
'use client'

import { useState } from 'react'
import VersionSelector from '@/app/components/VersionSelector'
import GuideHeading from '@/app/components/GuideHeading'

type Version = {
  label: string
  content: React.ReactNode
}

type GuideTemplateProps = {
  /** Titre principal du guide (sera en H2) */
  title: string
  /** Description introductive du guide */
  introduction?: string
  /** Versions disponibles du guide */
  versions: Record<string, Version>
  /** Version par défaut sélectionnée */
  defaultVersion?: string
  /** Contenu additionnel avant les versions (ex: avertissements) */
  beforeVersions?: React.ReactNode
  /** Contenu additionnel après les versions (ex: liens externes) */
  afterVersions?: React.ReactNode
}

/**
 * Template standardisé pour tous les guides avec SEO optimisé
 * Inclut automatiquement:
 * - Structure HTML sémantique (H2, sections)
 * - Sélecteur de versions
 * - Introduction formatée
 */
export default function GuideTemplate({
  title,
  introduction,
  versions,
  defaultVersion = 'default',
  beforeVersions,
  afterVersions,
}: GuideTemplateProps) {
  const [selected, setSelected] = useState<string>(defaultVersion)

  return (
    <div className="guide-content">
      {/* Titre principal visible */}
      <GuideHeading level={2}>{title}</GuideHeading>

      {/* Introduction si fournie */}
      {introduction && (
        <p className="text-neutral-300 mb-6 leading-relaxed">
          {introduction}
        </p>
      )}

      {/* Contenu avant sélection de version */}
      {beforeVersions && (
        <div className="mb-6">
          {beforeVersions}
        </div>
      )}

      {/* Sélecteur de versions */}
      {Object.keys(versions).length > 1 && (
        <VersionSelector
          versions={versions}
          selected={selected}
          onSelect={setSelected}
        />
      )}

      {/* Contenu de la version sélectionnée */}
      <section className="guide-version-content mt-6">
        {versions[selected]?.content || (
          <p className="text-red-400">Version content not found</p>
        )}
      </section>

      {/* Contenu après les versions */}
      {afterVersions && (
        <div className="mt-8">
          {afterVersions}
        </div>
      )}
    </div>
  )
}