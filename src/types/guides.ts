import type { Localized } from './common'

export type Guide = {
  category: string
  title: string | Localized
  description: string | Localized
  icon: string
  last_updated: string
  author: string
  second_image?: string
}

export type { Localized }
