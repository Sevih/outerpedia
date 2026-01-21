type CharacterWithTags = {
  tags?: string[]
  limited?: boolean
}

export type RecruitBadge = {
  src: string
  altKey: string
}

/**
 * Returns the recruitment badge for a character based on their tags.
 * Priority: Collab > Seasonal > Premium > Free > Limited (fallback)
 */
export function getRecruitBadge(char: CharacterWithTags): RecruitBadge | null {
  const tags = new Set(char.tags ?? [])

  if (tags.has('collab')) {
    return { src: '/images/ui/CM_Recruit_Tag_Collab.webp', altKey: 'collab' }
  }
  if (tags.has('seasonal')) {
    return { src: '/images/ui/CM_Recruit_Tag_Seasonal.webp', altKey: 'seasonal' }
  }
  if (tags.has('premium')) {
    return { src: '/images/ui/CM_Recruit_Tag_Premium.webp', altKey: 'premium' }
  }
  if (tags.has('free')) {
    return { src: '/images/ui/CM_Recruit_Tag_Free.webp', altKey: 'free' }
  }
  if (char.limited) {
    return { src: '/images/ui/CM_Recruit_Tag_Fes.webp', altKey: 'limited' }
  }
  return null
}
