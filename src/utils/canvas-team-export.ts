// utils/canvas-team-export.ts

import type { TeamSlot } from '@/types/team-planner'
import type { CharacterLite } from '@/types/types'
import type { TenantKey } from '@/tenants/config'
import { getT } from '@/i18n'
import _allCharacters from '@/data/_allCharacters.json'
import portraitCoordinates from '@/data/portrait-coordinates.json'

const characters = _allCharacters as CharacterLite[]

/**
 * Charge une image et retourne une Promise
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * Calcule le CP par tour pour un personnage en fonction du nombre d'alliés du même élément
 */
function calculateCPPerTurn(team: TeamSlot[], characterId: string | null): number {
  if (!characterId) return 0

  const character = characters.find(c => c.ID === characterId)
  if (!character?.Element) return 4

  const sameElementCount = team.filter(t => {
    if (!t.characterId) return false
    const char = characters.find(c => c.ID === t.characterId)
    return char?.Element === character.Element
  }).length

  switch (sameElementCount) {
    case 1: return 4
    case 2: return 6
    case 3: return 7
    case 4: return 8
    default: return 4
  }
}

/**
 * Calcule la moyenne des CP par tour de l'équipe
 */
function getAverageCPPerTurn(team: TeamSlot[]): number {
  const activeSlots = team.filter(t => t.characterId !== null)
  if (activeSlots.length === 0) return 0

  const totalCP = activeSlots.reduce((sum, slot) => {
    return sum + calculateCPPerTurn(team, slot.characterId)
  }, 0)

  return totalCP / activeSlots.length
}

/**
 * Dessine un rectangle arrondi
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

/**
 * Dessine un personnage dans la disposition en croix
 */
async function drawCrossCharacter(
  ctx: CanvasRenderingContext2D,
  slot: TeamSlot,
  x: number,
  y: number,
  size: number,
  team: TeamSlot[],
  lang: TenantKey
) {
  if (!slot.characterId) {
    // Slot vide - bordure pointillée
    ctx.setLineDash([8, 4])
    ctx.strokeStyle = '#4b5563'
    ctx.lineWidth = 2
    drawRoundedRect(ctx, x, y, size, size, 8)
    ctx.stroke()
    ctx.setLineDash([])

    ctx.fillStyle = '#6b7280'
    ctx.font = `${size * 0.4}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('+', x + size / 2, y + size / 2)
    return
  }

  const character = characters.find(c => c.ID === slot.characterId)
  if (!character) return

  // Portrait du personnage
  try {
    const portrait = await loadImage(`/images/characters/portrait/CT_${slot.characterId}.webp`)

    // Obtenir les coordonnées de crop pour ce personnage
    const charCoords = portraitCoordinates.characters[slot.characterId as keyof typeof portraitCoordinates.characters]
    const defaultCoords = portraitCoordinates._defaultCrop

    const offsetX = charCoords?.offsetX ?? defaultCoords.offsetX
    const offsetY = charCoords?.offsetY ?? defaultCoords.offsetY
    const zoom = 0.70 // Zoom ajusté pour le canvas

    // Background
    ctx.fillStyle = '#111827'
    drawRoundedRect(ctx, x, y, size, size, 8)
    ctx.fill()

    // Portrait avec clip arrondi et crop correct
    ctx.save()
    drawRoundedRect(ctx, x, y, size, size, 8)
    ctx.clip()

    // Dans le composant CharacterPortrait :
    // - Image Next.js: 176x340 (dimensions chargées par Next.js)
    // - objectFit: 'none' (garde taille 176x340)
    // - transform: scale(0.60) avec transformOrigin: 'top left'
    // - objectPosition: -offsetX -offsetY

    // L'image canvas fait 240x462 (taille originale)
    const originalWidth = 240
    const originalHeight = 462

    // Ratio pour ajuster à la taille du slot (140px est la taille par défaut dans le TSX)
    const ratio = size / 140

    // On veut simplement appliquer le même zoom (0.60) sur notre image 240x462
    // Comme dans le TSX on zoom une image de 176x340
    const finalWidth = originalWidth * zoom * ratio
    const finalHeight = originalHeight * zoom * ratio

    // Les offsets sont appliqués sur l'image avant le scale
    // Donc on les multiplie par le zoom et le ratio
    const finalOffsetX = offsetX * zoom * ratio
    const finalOffsetY = offsetY * zoom * ratio

    // Dessiner l'image croppée (soustraire l'offset pour simuler objectPosition négatif)
    ctx.drawImage(
      portrait,
      x - finalOffsetX,
      y - finalOffsetY,
      finalWidth,
      finalHeight
    )
    ctx.restore()

    // Bordure du portrait
    ctx.strokeStyle = '#4b5563'
    ctx.lineWidth = 2
    drawRoundedRect(ctx, x, y, size, size, 8)
    ctx.stroke()

    // Icône d'élément (en haut à droite)
    if (character.Element) {
      try {
        const elemIcon = await loadImage(`/images/ui/elem/${character.Element.toLowerCase()}.webp`)
        const iconSize = size * 0.3
        ctx.drawImage(elemIcon, x + size - iconSize, y, iconSize, iconSize)
      } catch (e) {
        console.warn('Could not load element icon:', e)
      }
    }

    // Icône de classe (sous l'élément)
    if (character.Class) {
      try {
        const classIcon = await loadImage(`/images/ui/class/${character.Class.toLowerCase()}.webp`)
        const iconSize = size * 0.3
        ctx.drawImage(classIcon, x + size - iconSize, y + iconSize * 0.9, iconSize, iconSize)
      } catch (e) {
        console.warn('Could not load class icon:', e)
      }
    }

    // Étoiles de rareté
    const starSize = size * 0.14
    const totalStarsWidth = character.Rarity * starSize * 0.8
    const starsStartX = x + (size - totalStarsWidth) / 2

    try {
      const star = await loadImage('/images/ui/star.webp')
      for (let i = 0; i < character.Rarity; i++) {
        ctx.drawImage(star, starsStartX + i * starSize * 0.8, y + size - starSize * 1.1, starSize, starSize)
      }
    } catch (e) {
      console.warn('Could not load star icon:', e)
    }

    // CP per turn (sous le portrait)
    const cpPerTurn = calculateCPPerTurn(team, slot.characterId)
    const t = getT(lang)
    ctx.font = 'bold 14px Arial'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#d1d5db'
    ctx.fillText(`${t('teamPlanner.cpPerTurn')}: ${cpPerTurn}`, x + size / 2, y + size + 18)

  } catch (error) {
    console.error('Error loading character portrait:', error)
  }
}

/**
 * Dessine la skill chain order (horizontale comme sur la page)
 */
async function drawChainOrder(
  ctx: CanvasRenderingContext2D,
  team: TeamSlot[],
  chainOrder: number[],
  startX: number,
  startY: number,
  lang: TenantKey
) {
  const t = getT(lang)
  const slotWidth = 80
  const slotHeight = 240
  const spacing = 12

  // Titre "SKILL CHAIN ORDER"
  ctx.font = 'bold 16px Arial'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#9ca3af'
  ctx.fillText(t('teamPlanner.skillChainOrder'), startX + (slotWidth * 4 + spacing * 3) / 2, startY - 15)

  for (let chainIndex = 0; chainIndex < 4; chainIndex++) {
    const position = chainOrder[chainIndex]
    const slot = team.find(s => s.position === position)
    const x = startX + chainIndex * (slotWidth + spacing)
    const y = startY

    // Background du slot avec masque
    try {
      const mask = await loadImage('/images/ui/teamBuilder/T_FX_SkillChain_Mask.png')
      ctx.globalAlpha = 0.2
      ctx.drawImage(mask, x, y, slotWidth, slotHeight)
      ctx.globalAlpha = 1.0
    } catch {
      // Fallback: rectangle simple
      ctx.fillStyle = '#1f2937'
      drawRoundedRect(ctx, x, y, slotWidth, slotHeight, 8)
      ctx.fill()
    }

    // Bordure arrondie
    ctx.strokeStyle = '#4b5563'
    ctx.lineWidth = 2
    drawRoundedRect(ctx, x, y, slotWidth, slotHeight, 8)
    ctx.stroke()

    if (slot?.characterId) {
      const character = characters.find(c => c.ID === slot.characterId)

      // Portrait (zoomé et centré avec clip arrondi)
      // Dans le TSX: <Image> avec object-contain + transform scale(1.7) depuis center
      try {
        const portrait = await loadImage(`/images/characters/portrait/CT_${slot.characterId}.webp`)

        // Taille originale de l'image: 240x462
        const originalWidth = 240
        const originalHeight = 462

        // Calculer le ratio pour object-contain dans un slot de 80x240
        const widthRatio = slotWidth / originalWidth
        const heightRatio = slotHeight / originalHeight
        const containRatio = Math.min(widthRatio, heightRatio)

        // Taille après object-contain
        const containedWidth = originalWidth * containRatio
        const containedHeight = originalHeight * containRatio

        // Appliquer le scale(1.7) depuis le centre
        const scale = 1.7
        const finalWidth = containedWidth * scale
        const finalHeight = containedHeight * scale

        // Centrer dans le slot
        const centerX = x + slotWidth / 2
        const centerY = y + slotHeight / 2

        ctx.save()
        drawRoundedRect(ctx, x, y, slotWidth, slotHeight, 8)
        ctx.clip()

        // Dessiner l'image centrée et zoomée
        ctx.drawImage(
          portrait,
          centerX - finalWidth / 2,
          centerY - finalHeight / 2,
          finalWidth,
          finalHeight
        )
        ctx.restore()
      } catch (e) {
        console.warn('Could not load chain portrait:', e)
      }

      // Chain Type indicator au bas
      if (character?.Chain_Type) {
        const isValidPosition =
          (character.Chain_Type === 'Start' && chainIndex === 0) ||
          (character.Chain_Type === 'Finish' && chainIndex === 3) ||
          character.Chain_Type === 'Join'

        // Background du badge
        ctx.fillStyle = isValidPosition ? 'rgba(37, 99, 235, 0.8)' : 'rgba(55, 65, 81, 0.8)'
        ctx.fillRect(x, y + slotHeight - 30, slotWidth, 30)

        ctx.font = 'bold 10px Arial'
        ctx.textAlign = 'center'
        ctx.fillStyle = isValidPosition ? '#ffffff' : '#d1d5db'

        let chainText = ''
        if (character.Chain_Type === 'Start') {
          chainText = `${t('characters.chains.starter')}\n${t('teamPlanner.chain.exclusive')}`
        } else if (character.Chain_Type === 'Finish') {
          chainText = `${t('characters.chains.finisher')}\n${t('teamPlanner.chain.exclusive')}`
        } else {
          chainText = t('characters.chains.companion')
        }

        const lines = chainText.split('\n')
        lines.forEach((line, i) => {
          ctx.fillText(line, x + slotWidth / 2, y + slotHeight - 20 + i * 11)
        })
      }
    } else {
      // Slot vide
      ctx.fillStyle = '#6b7280'
      ctx.font = '48px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('?', x + slotWidth / 2, y + slotHeight / 2)
    }

    // Numéro de position dans la chain (petit badge en haut à gauche)
    ctx.fillStyle = '#1f2937'
    ctx.fillRect(x - 2, y - 2, 24, 24)
    ctx.fillStyle = '#6ee7b7'
    ctx.font = 'bold 16px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${chainIndex + 1}`, x + 10, y + 10)
  }
}

/**
 * Génère une image de l'équipe au format 1920x1080
 * Reproduit fidèlement l'apparence de la page view
 */
export async function generateTeamImage1920x1080(
  team: TeamSlot[],
  chainOrder: number[],
  notes: string = '',
  title: string = '',
  lang: TenantKey = 'en'
): Promise<Blob> {
  const t = getT(lang)
  const canvas = document.createElement('canvas')
  canvas.width = 1920
  canvas.height = 1080
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Could not get canvas context')
  }

  // Background général (comme le body de la page)
  ctx.fillStyle = '#111827'
  ctx.fillRect(0, 0, 1920, 1080)

  let currentY = 80

  // ============ TITRE DE L'ÉQUIPE (si présent) ============
  if (title) {
    // Section titre (fond gris-800 avec bordure)
    ctx.fillStyle = '#1f2937'
    drawRoundedRect(ctx, 60, currentY, 1800, 80, 8)
    ctx.fill()

    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 1
    drawRoundedRect(ctx, 60, currentY, 1800, 80, 8)
    ctx.stroke()

    // Titre centré en cyan
    ctx.font = 'bold 42px Arial'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#22d3ee'
    ctx.fillText(title, 960, currentY + 50)

    currentY += 110
  }

  // ============ SECTION TEAM CONFIGURATION ============
  const sectionTop = currentY
  const sectionHeight = 550

  // Background de la section principale
  ctx.fillStyle = '#1f2937'
  drawRoundedRect(ctx, 60, sectionTop, 1800, sectionHeight, 8)
  ctx.fill()

  ctx.strokeStyle = '#374151'
  ctx.lineWidth = 1
  drawRoundedRect(ctx, 60, sectionTop, 1800, sectionHeight, 8)
  ctx.stroke()

  // Titre "Team Configuration"
  ctx.font = 'bold 28px Arial'
  ctx.textAlign = 'left'
  ctx.fillStyle = '#ffffff'
  ctx.fillText(t('teamPlanner.teamConfiguration'), 90, sectionTop + 45)

  // ============ LAYOUT HORIZONTAL: Croix | CP | Chain ============
  const contentY = sectionTop + 90

  // === GAUCHE: Disposition en croix ===
  const crossCenterX = 320
  const crossCenterY = contentY + 200
  const crossSize = 100
  const crossSpacing = 140  // Augmenté de 140 à 160 pour plus d'espacement

  // Position 1 - Droite
  await drawCrossCharacter(ctx, team[0], crossCenterX + crossSpacing - crossSize / 2, crossCenterY - crossSize / 2, crossSize, team, lang)

  // Position 2 - Haut
  await drawCrossCharacter(ctx, team[1], crossCenterX - crossSize / 2, crossCenterY - crossSpacing - crossSize / 2, crossSize, team, lang)

  // Position 3 - Bas
  await drawCrossCharacter(ctx, team[2], crossCenterX - crossSize / 2, crossCenterY + crossSpacing - crossSize / 2, crossSize, team, lang)

  // Position 4 - Gauche
  await drawCrossCharacter(ctx, team[3], crossCenterX - crossSpacing - crossSize / 2, crossCenterY - crossSize / 2, crossSize, team, lang)

  // Cercle central avec Average CP/turn
  const avgCP = getAverageCPPerTurn(team)

  ctx.beginPath()
  ctx.arc(crossCenterX, crossCenterY, 55, 0, Math.PI * 2)  // Augmenté le rayon de 45 à 55 pour plus d'espace
  ctx.fillStyle = 'rgba(17, 24, 39, 0.3)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(75, 85, 99, 0.5)'
  ctx.lineWidth = 1
  ctx.stroke()

  // Texte "Average CP/turn" en haut
  ctx.font = 'bold 10px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#9ca3af'
  ctx.fillText(t('teamPlanner.averageCPTurn'), crossCenterX, crossCenterY - 15)

  // Valeur CP en bas (plus grande)
  ctx.font = 'bold 28px Arial'
  ctx.fillStyle = '#22d3ee'
  ctx.fillText(avgCP.toFixed(1), crossCenterX, crossCenterY + 15)

  // === DROITE: Skill Chain Order ===
  await drawChainOrder(ctx, team, chainOrder, 1050, contentY + 30, lang)

  // ============ NOTES (si présentes) ============
  if (notes && notes.trim()) {
    const notesY = sectionTop + sectionHeight + 30

    // Parser le Markdown en segments avec styles
    interface TextSegment {
      text: string
      bold: boolean
      italic: boolean
      strikethrough: boolean
      isBullet: boolean
      fontSize?: number  // Taille personnalisée (18px par défaut)
      color?: string     // Couleur personnalisée (#d1d5db par défaut)
    }

    const parseMarkdownLine = (line: string): TextSegment[] => {
      const segments: TextSegment[] = []

      // Détecter si c'est une liste à puces
      const isBullet = /^[\s]*[-*+]\s+/.test(line)
      if (isBullet) {
        line = line.replace(/^[\s]*[-*+]\s+/, '')
        segments.push({ text: '• ', bold: false, italic: false, strikethrough: false, isBullet: true })
      }

      // Parser les liens [text](url) -> text
      line = line.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

      // Parser les tags de style personnalisé: <size=20>text</size>, <color=#ff0000>text</color>
      // On peut aussi combiner: <size=24><color=#ff0000>Big Red Text</color></size>
      const styleRegex = /<(size|color)=([^>]+)>([^<]*)<\/\1>|~~([^~]+)~~|(\*\*\*|___)([^*_]+)(\5)|(\*\*|__)([^*_]+)(\8)|(\*|_)([^*_]+)(\11)/g
      let lastIndex = 0
      let match

      while ((match = styleRegex.exec(line)) !== null) {
        // Ajouter le texte avant le match
        if (match.index > lastIndex) {
          const plainText = line.substring(lastIndex, match.index)
          if (plainText) {
            segments.push({ text: plainText, bold: false, italic: false, strikethrough: false, isBullet })
          }
        }

        // Ajouter le texte formaté
        if (match[1] === 'size') {
          // Size tag: <size=20>text</size>
          const fontSize = parseInt(match[2])
          const content = match[3]

          // Parser les tags imbriqués (color ou formatage)
          const nestedSegments = parseNestedFormatting(content, isBullet)
          nestedSegments.forEach(seg => {
            segments.push({ ...seg, fontSize })
          })
        } else if (match[1] === 'color') {
          // Color tag: <color=#ff0000>text</color>
          const color = match[2]
          const content = match[3]

          // Parser les tags imbriqués (size ou formatage)
          const nestedSegments = parseNestedFormatting(content, isBullet)
          nestedSegments.forEach(seg => {
            segments.push({ ...seg, color })
          })
        } else if (match[4]) {
          // Strikethrough: ~~text~~
          segments.push({ text: match[4], bold: false, italic: false, strikethrough: true, isBullet })
        } else if (match[5] && (match[5] === '***' || match[5] === '___')) {
          // Bold + Italic: ***text*** ou ___text___
          segments.push({ text: match[6], bold: true, italic: true, strikethrough: false, isBullet })
        } else if (match[8] && (match[8] === '**' || match[8] === '__')) {
          // Bold: **text** ou __text__
          segments.push({ text: match[9], bold: true, italic: false, strikethrough: false, isBullet })
        } else if (match[11] && (match[11] === '*' || match[11] === '_')) {
          // Italic: *text* ou _text_
          segments.push({ text: match[12], bold: false, italic: true, strikethrough: false, isBullet })
        }

        lastIndex = match.index + match[0].length
      }

      // Ajouter le reste du texte
      if (lastIndex < line.length) {
        const plainText = line.substring(lastIndex)
        if (plainText) {
          segments.push({ text: plainText, bold: false, italic: false, strikethrough: false, isBullet })
        }
      }

      return segments.length > 0 ? segments : [{ text: line, bold: false, italic: false, strikethrough: false, isBullet }]
    }

    // Helper pour parser le formatage imbriqué dans les tags
    const parseNestedFormatting = (text: string, isBullet: boolean): TextSegment[] => {
      const segments: TextSegment[] = []
      const nestedRegex = /<(size|color)=([^>]+)>([^<]*)<\/\1>|~~([^~]+)~~|(\*\*\*|___)([^*_]+)(\5)|(\*\*|__)([^*_]+)(\8)|(\*|_)([^*_]+)(\11)/g
      let lastIndex = 0
      let match

      while ((match = nestedRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          const plainText = text.substring(lastIndex, match.index)
          if (plainText) {
            segments.push({ text: plainText, bold: false, italic: false, strikethrough: false, isBullet })
          }
        }

        if (match[1] === 'size') {
          segments.push({ text: match[3], bold: false, italic: false, strikethrough: false, isBullet, fontSize: parseInt(match[2]) })
        } else if (match[1] === 'color') {
          segments.push({ text: match[3], bold: false, italic: false, strikethrough: false, isBullet, color: match[2] })
        } else if (match[4]) {
          segments.push({ text: match[4], bold: false, italic: false, strikethrough: true, isBullet })
        } else if (match[5]) {
          segments.push({ text: match[6], bold: true, italic: true, strikethrough: false, isBullet })
        } else if (match[8]) {
          segments.push({ text: match[9], bold: true, italic: false, strikethrough: false, isBullet })
        } else if (match[11]) {
          segments.push({ text: match[12], bold: false, italic: true, strikethrough: false, isBullet })
        }

        lastIndex = match.index + match[0].length
      }

      if (lastIndex < text.length) {
        const plainText = text.substring(lastIndex)
        if (plainText) {
          segments.push({ text: plainText, bold: false, italic: false, strikethrough: false, isBullet })
        }
      }

      return segments.length > 0 ? segments : [{ text, bold: false, italic: false, strikethrough: false, isBullet }]
    }

    // Préparer les lignes avec formatage
    const parsedLines: TextSegment[][] = []

    notes.split('\n').forEach(paragraph => {
      if (!paragraph.trim()) {
        parsedLines.push([{ text: '', bold: false, italic: false, strikethrough: false, isBullet: false }])
        return
      }

      // Supprimer les titres markdown
      paragraph = paragraph.replace(/^#{1,6}\s+/, '')

      const segments = parseMarkdownLine(paragraph)
      parsedLines.push(segments)
    })

    // Limiter à 8 lignes
    const displayLines = parsedLines.slice(0, 8)
    const lineHeight = 26
    const notesHeight = 80 + (displayLines.length * lineHeight) + 20

    // Background notes section
    ctx.fillStyle = '#1f2937'
    drawRoundedRect(ctx, 60, notesY, 1800, notesHeight, 8)
    ctx.fill()

    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 1
    drawRoundedRect(ctx, 60, notesY, 1800, notesHeight, 8)
    ctx.stroke()

    // Titre "Notes"
    ctx.font = 'bold 24px Arial'
    ctx.textAlign = 'left'
    ctx.fillStyle = '#ffffff'
    ctx.fillText(t('teamPlanner.notes.title'), 90, notesY + 40)

    // Dessiner les notes avec formatage
    displayLines.forEach((segments, lineIndex) => {
      let x = 90
      const y = notesY + 80 + lineIndex * lineHeight

      segments.forEach(segment => {
        // Définir le style de police avec taille personnalisée
        const fontStyle = segment.italic ? 'italic' : 'normal'
        const fontWeight = segment.bold ? 'bold' : 'normal'
        const fontSize = segment.fontSize || 18
        ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px Arial`

        // Appliquer la couleur personnalisée
        ctx.fillStyle = segment.color || '#d1d5db'

        // Dessiner le texte
        ctx.fillText(segment.text, x, y)

        // Dessiner le strikethrough si nécessaire
        if (segment.strikethrough) {
          const metrics = ctx.measureText(segment.text)
          const lineY = y - fontSize * 0.3 // Position relative à la taille du texte
          ctx.strokeStyle = segment.color || '#d1d5db'
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.moveTo(x, lineY)
          ctx.lineTo(x + metrics.width, lineY)
          ctx.stroke()
        }

        // Avancer la position X
        const metrics = ctx.measureText(segment.text)
        x += metrics.width
      })
    })

    // Indicateur si plus de lignes disponibles
    if (parsedLines.length > 8) {
      ctx.font = '18px Arial'
      ctx.fillStyle = '#9ca3af'
      ctx.fillText('...', 90, notesY + 80 + displayLines.length * lineHeight)
    }
  }

  // ============ WATERMARK ============
  ctx.font = 'bold 18px Arial'
  ctx.textAlign = 'right'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
  ctx.fillText('outerpedia.com', 1850, 1050)

  // Convertir en Blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Failed to generate image blob'))
      }
    }, 'image/png')
  })
}

/**
 * Copie l'image dans le presse-papiers
 */
export async function copyImageToClipboard(blob: Blob): Promise<void> {
  try {
    // Vérifier si l'API Clipboard est disponible
    if (!navigator.clipboard || !navigator.clipboard.write) {
      throw new Error('Clipboard API not available')
    }

    // Créer un ClipboardItem avec l'image
    const clipboardItem = new ClipboardItem({
      'image/png': blob
    })

    await navigator.clipboard.write([clipboardItem])
  } catch (error) {
    console.error('Failed to copy image to clipboard:', error)
    throw error
  }
}

/**
 * Télécharge l'image générée (fallback si clipboard ne marche pas)
 */
export function downloadImage(blob: Blob, filename: string = 'team-composition.png') {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
