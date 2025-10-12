import React from 'react'

export type EventMeta = {
  slug: string
  title: string
  cover?: string
  /** ISO recommandé. Accepte aussi 'YYYY-MM-DD' (interprété en UTC 00:00) */
  start: string
  /** ISO recommandé. Accepte aussi 'YYYY-MM-DD' (interprété en UTC 23:59:59.999) */
  end: string
}

export type EventDef = {
  meta: EventMeta
  Page: React.FC
}
