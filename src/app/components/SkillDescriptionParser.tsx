/**
 * Skill Description Parser
 * Parse skill descriptions with color tags, line breaks, and inline Element/Class tags
 */

import ElementInlineTag from './ElementInline'
import ClassInlineTag from './ClassInlineTag'
import { ELEMENTS, CLASSES } from '@/types/enums'

// Global counter for unique React keys
let globalKeyCounter = 0

/**
 * Parse text and render with colors, line breaks, Element and Class inline tags
 */
export function SkillDescription({ text }: { text: string }) {
  const parts: React.ReactNode[] = []
  const baseKey = globalKeyCounter
  globalKeyCounter += 10000 // Reserve 10000 keys for this description to be safe

  // First handle line breaks
  const lines = text.replace(/\\n/g, '\n').split('\n')

  lines.forEach((line, lineIndex) => {
    if (lineIndex > 0) {
      parts.push(<br key={`br-${baseKey}-${lineIndex}`} />)
    }

    // Parse color tags and elements/classes in this line
    let lineLastIndex = 0
    const lineParts: React.ReactNode[] = []

    // Handle <color=#...>text</color> tags
    const colorRegex = /<color=#(.*?)>(.*?)<\/color>/g
    let colorMatch

    while ((colorMatch = colorRegex.exec(line)) !== null) {
      // Add text before color tag
      if (colorMatch.index > lineLastIndex) {
        const beforeText = line.slice(lineLastIndex, colorMatch.index)
        lineParts.push(...parseElementsAndClasses(beforeText))
      }

      // Add colored text with parsed elements/classes inside
      const color = colorMatch[1]
      const coloredText = colorMatch[2]
      lineParts.push(
        <span key={`color-${globalKeyCounter++}`} style={{ color: `#${color}` }}>
          {parseElementsAndClasses(coloredText)}
        </span>
      )

      lineLastIndex = colorMatch.index + colorMatch[0].length
    }

    // Add remaining text in line
    if (lineLastIndex < line.length) {
      const remainingText = line.slice(lineLastIndex)
      lineParts.push(...parseElementsAndClasses(remainingText))
    }

    parts.push(...lineParts)
  })

  return <>{parts}</>
}

// Common lowercase words that can appear in proper nouns/titles
const TITLE_CONNECTORS = ['on', 'of', 'the', 'in', 'and', 'for', 'to', 'a', 'an', 'at', 'by', 'with', 'from']

/**
 * Parse text for element and class keywords, return array of nodes
 * Skips keywords that are part of proper nouns (e.g., "Furious Earth", "The People on Earth")
 */
function parseElementsAndClasses(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []

  // Create regex to match elements and classes
  const allKeywords = [...ELEMENTS, ...CLASSES]
  const regex = new RegExp(`\\b(${allKeywords.join('|')})\\b`, 'gi')

  let match
  let lastIndex = 0

  while ((match = regex.exec(text)) !== null) {
    const matched = match[0]
    const lower = matched.toLowerCase()

    // Skip if this keyword is part of a proper noun (preceded by a capitalized word)
    const beforeChar = match.index > 0 ? text[match.index - 1] : ' '
    const isAfterSpace = beforeChar === ' ' || beforeChar === '(' || beforeChar === '\n'

    // Check if there's a capitalized word DIRECTLY before this match (for proper nouns like "Furious Earth")
    // Only considers the immediately preceding word - connectors break the chain
    let isPartOfProperNoun = false
    if (isAfterSpace && match.index >= 2) {
      // Look at the word directly before this match
      const textBefore = text.slice(0, match.index).trim()
      const words = textBefore.split(/\s+/)

      if (words.length > 0) {
        const prevWord = words[words.length - 1].replace(/[,.:;!?\-/]+$/, '')
        const prevWordLower = prevWord.toLowerCase()
        const isKeyword = allKeywords.some(k => k.toLowerCase() === prevWordLower)

        // Only consider it a proper noun if the DIRECTLY preceding word is capitalized
        // and is NOT a connector (of, the, on, etc.) and NOT a keyword
        if (prevWord && prevWord.length > 1 && /^[A-Z]/.test(prevWord) &&
            !isKeyword && !TITLE_CONNECTORS.includes(prevWordLower)) {
          isPartOfProperNoun = true
        }
      }
    }

    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    // Skip conversion if it's part of a proper noun
    if (isPartOfProperNoun) {
      parts.push(matched)
    }
    // Check if it's an element
    else if (ELEMENTS.some(el => el.toLowerCase() === lower)) {
      parts.push(
        <ElementInlineTag key={`el-${globalKeyCounter++}`} element={lower} />
      )
    }
    // Check if it's a class
    else if (CLASSES.some(cl => cl.toLowerCase() === lower)) {
      parts.push(
        <ClassInlineTag key={`cl-${globalKeyCounter++}`} name={matched} />
      )
    }

    lastIndex = match.index + matched.length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : [text]
}
