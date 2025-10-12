'use client'

import React from 'react'
import ElementInlineTag from '@/app/components/ElementInline'
import ClassInlineTag from '@/app/components/ClassInlineTag'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import WeaponInlineTag from '@/app/components/WeaponInlineTag'
import AmuletInlineTag from '@/app/components/AmuletInlineTag'
import ItemInlineDisplay from '@/app/components/ItemInline'

/**
 * Tags supportés :
 * {B/EffectName}  -> buff
 * {D/EffectName}  -> debuff
 * {C/ClassName}   -> classe
 * {E/Element}     -> élément
 * {I-W/WeaponName}  -> arme (weapon)
 * {I-A/AmuletName}  -> amulette (à brancher si tu as le composant)
 * {I-I/ItemName[,ItemName2,...]} -> items (ton composant ItemInlineDisplay)
 */
export default function parseText(text: string): React.ReactNode[] {
  // capture le type complet (B|D|C|E|I-W|I-A|I-I) puis le payload jusqu’à la }
  const regex = /\{((?:[BDCE])|I-(?:W|A|I))\/([^}]+)\}/g

  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    const [full, type, rawName] = match
    const index = match.index

    // Texte brut avant le tag
    if (lastIndex < index) {
      parts.push(text.slice(lastIndex, index))
    }

    const name = rawName.trim()

    // Composants spéciaux
    if (type === 'E') {
      parts.push(<ElementInlineTag key={`e-${index}-${name}`} element={name} />)
    } else if (type === 'C') {
      parts.push(<ClassInlineTag key={`c-${index}-${name}`} name={name} />)
    } else if (type === 'I-W') {
      parts.push(<WeaponInlineTag key={`w-${index}-${name}`} name={name} />)
    } else if (type === 'I-A') {
       parts.push(<AmuletInlineTag key={`a-${index}-${name}`} name={name} />)
    } else if (type === 'I-I') {
      // Si ton ItemInlineDisplay accepte une liste séparée par virgules :
      parts.push(<ItemInlineDisplay key={`i-${index}-${name}`} names={name} />)
    } else if (type === 'B' || type === 'D') {
      parts.push(
        <EffectInlineTag
          key={`fx-${index}-${name}`}
          name={name}
          type={type === 'B' ? 'buff' : 'debuff'}
        />
      )
    } else {
      // fallback (ne devrait pas arriver)
      parts.push(full)
    }

    lastIndex = index + full.length
  }

  // Fin de texte
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts
}
