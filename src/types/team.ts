import type { WithLocalizedFields } from './common'

export type NoteEntry =
  | { type: 'p'; string: string }
  | { type: 'ul'; items: string[] }

type BaseStageData = {
  team: string[][]
  note?: NoteEntry[]
  icon?: string
}

export type StageData = WithLocalizedFields<BaseStageData, 'note'>

export type TeamData = {
  [key: string]: StageData
}
