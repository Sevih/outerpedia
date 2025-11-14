type NoteEntry =
  | { type: 'p'; string: string }
  | { type: 'ul'; items: string[] }

type StageData = {
  team: string[][]
  note?: NoteEntry[]
}

export type TeamData = {
  [key: string]: StageData
}