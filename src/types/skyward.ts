export type NoteEntry =
  | { type: "p"; string: string }
  | { type: "ul"; items: string[] }
