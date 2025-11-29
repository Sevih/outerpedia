'use client'

import React from 'react'
import ElementInlineTag from '@/app/components/ElementInline'
import ClassInlineTag from '@/app/components/ClassInlineTag'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import WeaponInlineTag from '@/app/components/WeaponInlineTag'
import AmuletInlineTag from '@/app/components/AmuletInlineTag'
import TalismanInlineTag from '@/app/components/TalismanInlineTag'
import ItemInlineDisplay from '@/app/components/ItemInline'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'
import type { BuffName, DebuffName } from '@/types/effect-names'

/**
 * Tags supportés :
 * {B/EffectName}  -> buff
 * {D/EffectName}  -> debuff
 * {C/ClassName}   -> classe
 * {E/Element}     -> élément
 * {P/CharacterName} -> personnage (CharacterLinkCard)
 * {I-W/WeaponName}  -> arme (weapon)
 * {I-A/AmuletName}  -> amulette
 * {I-T/TalismanName} -> talisman
 * {I-I/ItemName[,ItemName2,...]} -> items (ton composant ItemInlineDisplay)
 */

// Insère des <br /> pour chaque retour à la ligne trouvé dans `text`
function pushTextWithLineBreaks(
  acc: React.ReactNode[],
  text: string,
  keyPrefix: string
) {
  if (!text) return
  // Supporte \r\n (Windows) et \n
  const segments = text.split(/\r?\n/g)
  segments.forEach((seg, i) => {
    if (i > 0) acc.push(<br key={`${keyPrefix}-br-${i}`} />)
    if (seg) acc.push(<React.Fragment key={`${keyPrefix}-seg-${i}`}>{seg}</React.Fragment>)
  })
}


export default function parseText(text: string): React.ReactNode[] {
  // capture le type complet (B|D|C|E|P|I-W|I-A|I-T|I-I) puis le payload jusqu'à la }
  const regex = /\{((?:[BDCEP])|I-(?:W|A|T|I))\/([^}]+)\}/g

  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    const [full, type, rawName] = match
    const index = match.index

    // Texte brut avant le tag (avec gestion des retours à la ligne)
    if (lastIndex < index) {
      const raw = text.slice(lastIndex, index)
      pushTextWithLineBreaks(parts, raw, `t-${lastIndex}`)
    }

    const name = rawName.trim()

    // Composants spéciaux
    if (type === 'E') {
      parts.push(<ElementInlineTag key={`e-${index}-${name}`} element={name} />)
    } else if (type === 'C') {
      parts.push(<ClassInlineTag key={`c-${index}-${name}`} name={name} />)
    } else if (type === 'P') {
      parts.push(<CharacterLinkCard key={`p-${index}-${name}`} name={name} />)
    } else if (type === 'I-W') {
      parts.push(<WeaponInlineTag key={`w-${index}-${name}`} name={name} />)
    } else if (type === 'I-A') {
      parts.push(<AmuletInlineTag key={`a-${index}-${name}`} name={name} />)
    } else if (type === 'I-T') {
      parts.push(<TalismanInlineTag key={`t-${index}-${name}`} name={name} />)
    } else if (type === 'I-I') {
      // Si ton ItemInlineDisplay accepte une liste séparée par virgules :
      parts.push(<ItemInlineDisplay key={`i-${index}-${name}`} names={name} />)
    } else if (type === 'B') {
      parts.push(
        <EffectInlineTag
          key={`fx-${index}-${name}`}
          name={name as BuffName}
          type="buff"
        />
      )
    } else if (type === 'D') {
      parts.push(
        <EffectInlineTag
          key={`fx-${index}-${name}`}
          name={name as DebuffName}
          type="debuff"
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
    const raw = text.slice(lastIndex)
    pushTextWithLineBreaks(parts, raw, `t-end-${lastIndex}`)
  }

  return parts
}
