'use client'

import React from 'react'
import {
  ElementInline,
  ClassInline,
  StatInline,
  EffectInline,
  WeaponInline,
  AmuletInline,
  TalismanInline,
  EeInline,
  SetInline,
  ItemInline,
  CharacterInline,
  SkillInline,
} from '@/app/components/inline'
import type { BuffName, DebuffName } from '@/types/effect-names'
import type stats from '@/data/stats.json'

type StatName = keyof typeof stats
type SkillType = 'S1' | 'S2' | 'S3' | 'Passive' | 'Chain'

/**
 * Tags supportés :
 * {B/EffectName}  -> buff
 * {D/EffectName}  -> debuff
 * {S/StatName}    -> stat (ex: {S/ATK}, {S/SPEED})
 * {C/ClassName}   -> classe (ex: {C/Mage} ou {C/Mage|Wizard} pour subclass)
 * {E/Element}     -> élément
 * {P/CharacterName} -> personnage
 * {EE/EEName}     -> exclusive equipment
 * {I-W/WeaponName}  -> arme (weapon)
 * {I-A/AmuletName}  -> amulette
 * {I-T/TalismanName} -> talisman
 * {I-I/ItemName}    -> item
 * {AS/SetName}      -> armor set (ex: {AS/Attack} ou {AS/Attack Set})
 * {SK/CharacterName|SkillType} -> skill (ex: {SK/Valentine|S3}, SkillType: S1|S2|S3|Passive|Chain)
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
  // capture le type complet (B|D|S|C|E|P|EE|AS|SK|I-W|I-A|I-T|I-I) puis le payload jusqu'à la }
  const regex = /\{((?:[BDSCEP])|EE|AS|SK|I-(?:W|A|T|I))\/([^}]+)\}/g

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
      parts.push(<ElementInline key={`e-${index}-${name}`} element={name} />)
    } else if (type === 'C') {
      // Support subclass avec syntaxe {C/Class|Subclass}
      const [className, subclass] = name.split('|')
      parts.push(
        <ClassInline
          key={`c-${index}-${name}`}
          name={className}
          subclass={subclass}
        />
      )
    } else if (type === 'P') {
      parts.push(<CharacterInline key={`p-${index}-${name}`} name={name} />)
    } else if (type === 'I-W') {
      parts.push(<WeaponInline key={`w-${index}-${name}`} name={name} />)
    } else if (type === 'I-A') {
      parts.push(<AmuletInline key={`a-${index}-${name}`} name={name} />)
    } else if (type === 'I-T') {
      parts.push(<TalismanInline key={`t-${index}-${name}`} name={name} />)
    } else if (type === 'I-I') {
      parts.push(<ItemInline key={`i-${index}-${name}`} name={name} />)
    } else if (type === 'B') {
      parts.push(
        <EffectInline
          key={`fx-${index}-${name}`}
          name={name as BuffName}
          type="buff"
        />
      )
    } else if (type === 'D') {
      parts.push(
        <EffectInline
          key={`fx-${index}-${name}`}
          name={name as DebuffName}
          type="debuff"
        />
      )
    } else if (type === 'EE') {
      parts.push(<EeInline key={`ee-${index}-${name}`} name={name} />)
    } else if (type === 'S') {
      parts.push(<StatInline key={`s-${index}-${name}`} name={name as StatName} />)
    } else if (type === 'AS') {
      parts.push(<SetInline key={`as-${index}-${name}`} name={name} />)
    } else if (type === 'SK') {
      // Syntaxe: {SK/CharacterName|SkillType}
      const [character, skillType] = name.split('|')
      parts.push(
        <SkillInline
          key={`sk-${index}-${name}`}
          character={character}
          skill={skillType as SkillType}
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
