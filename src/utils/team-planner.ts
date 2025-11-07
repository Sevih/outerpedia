// app/(tools)/team-planner/utils.ts

import type { TeamSlot, EncodedTeamData } from '@/types/team-planner'
import _allCharacters from '@/data/_allCharacters.json'
import type { CharacterLite } from '@/types/types'

const characters = _allCharacters as CharacterLite[]

/**
 * Valide si un chain skill peut être utilisé à une position donnée
 * @param chainType - Type de chain skill (Start, Join, Finish)
 * @param chainIndex - Index dans la skill chain (0-3, où 0 = premier slot, 3 = dernier slot)
 * @returns true si la position est valide pour ce type de chain
 */
export function isValidChainPosition(chainType: string | undefined, chainIndex: number): boolean {
  if (!chainType) return true // Pas de restriction si pas de chain type

  switch (chainType) {
    case 'Start':
      return chainIndex === 0 // Seulement en première position
    case 'Join':
      return true // Valide partout
    case 'Finish':
      return chainIndex === 3 // Seulement en dernière position
    default:
      return true
  }
}

/**
 * Calcule le CP par tour pour un personnage en fonction du nombre d'alliés du même élément
 * @param elementCount - Nombre de personnages du même élément dans l'équipe
 * @returns CP par tour (4, 6, 7, ou 8)
 */
export function calculateCPPerTurn(elementCount: number): number {
  switch (elementCount) {
    case 1:
      return 4
    case 2:
      return 6
    case 3:
      return 7
    case 4:
      return 8
    default:
      return 4
  }
}

/**
 * Encode l'état de l'équipe dans une chaîne URL-safe
 * Format: characterId1,characterId2,characterId3,characterId4|chainOrder1,chainOrder2,chainOrder3,chainOrder4|base64Notes
 */
export function encodeTeamToURL(team: TeamSlot[], chainOrder: number[], notes: string): string {
  const teamIds = team.map(slot => slot.characterId || '').join(',')
  const chainOrderStr = chainOrder.join(',')
  const encodedNotes = notes ? btoa(encodeURIComponent(notes)) : ''
  return `${teamIds}|${chainOrderStr}|${encodedNotes}`
}

/**
 * Decode l'état de l'équipe depuis une chaîne URL
 */
export function decodeTeamFromURL(encoded: string): EncodedTeamData | null {
  try {
    const parts = encoded.split('|')
    const [teamPart, chainPart, notesPart] = parts

    if (!teamPart || !chainPart) return null

    const characterIds = teamPart.split(',')
    if (characterIds.length !== 4) return null

    const chainOrderArr = chainPart.split(',').map(Number)
    if (chainOrderArr.length !== 4) return null
    if (chainOrderArr.some(n => isNaN(n) || n < 1 || n > 4)) return null

    const team: TeamSlot[] = characterIds.map((id, index) => {
      const characterId = id || null
      const character = characterId ? characters.find(c => c.ID === characterId) : null
      return {
        position: index + 1,
        characterId,
        characterName: character?.Fullname || null
      }
    })

    const notes = notesPart ? decodeURIComponent(atob(notesPart)) : ''

    return { team, chainOrder: chainOrderArr, notes }
  } catch {
    return null
  }
}
