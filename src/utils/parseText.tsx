'use client'

import React from 'react'
import ElementInlineTag from '@/app/components/ElementInline'
import ClassInlineTag from '@/app/components/ClassInlineTag'
import EffectInlineTag from '@/app/components/EffectInlineTag'

export default function parseText(text: string): React.ReactNode[] {
  const regex = /\{([BDCE])\/([^}]+)\}/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    const [full, type, name] = match
    const index = match.index

    // Texte brut avant la balise
    if (lastIndex < index) {
      parts.push(text.slice(lastIndex, index))
    }

    // Composants spéciaux
    if (type === 'E') {
      parts.push(<ElementInlineTag key={index} element={name} />)
    } else if (type === 'C') {
      parts.push(<ClassInlineTag key={index} name={name} />)
    } else {
      parts.push(
        <EffectInlineTag key={index} name={name} type={type === 'B' ? 'buff' : 'debuff'} />
      )
    }

    lastIndex = index + full.length
  }

  // Fin de texte
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts
}
