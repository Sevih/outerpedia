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

/**
 * Parse text for element and class keywords, return array of nodes
 * Skips keywords that are part of proper nouns (e.g., "Furious Earth")
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

    // Check if there's a capitalized word right before this match (for proper nouns like "Furious Earth")
    // But skip if the previous word is also an element/class keyword or ends with punctuation
    let isPrecededByCapitalizedWord = false
    if (isAfterSpace && match.index >= 2) {
      // Look back to find the previous word
      const textBefore = text.slice(0, match.index).trim()
      const words = textBefore.split(/\s+/)
      let previousWord = words[words.length - 1]
      // Remove trailing punctuation (comma, period, etc.)
      previousWord = previousWord.replace(/[,.:;!?]$/, '')
      // Check if previous word starts with capital (and is not just a single char like "a")
      // BUT don't skip if the previous word is itself an element or class keyword
      const prevLower = previousWord.toLowerCase()
      const isPrevKeyword = allKeywords.some(k => k.toLowerCase() === prevLower)
      if (previousWord && previousWord.length > 1 && /^[A-Z]/.test(previousWord) && !isPrevKeyword) {
        isPrecededByCapitalizedWord = true
      }
    }

    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    // Skip conversion if it's part of a proper noun
    if (isPrecededByCapitalizedWord) {
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
