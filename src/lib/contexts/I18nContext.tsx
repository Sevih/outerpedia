'use client'
import { createContext, useContext, useMemo, useState } from 'react'

export type Lng = 'en' | 'fr' | 'jp' | 'kr'
type Messages = Record<string, string>

type I18nCtx = {
  lang: Lng
  t: (k: string) => string
  setLang: (l: Lng) => void
}

const Ctx = createContext<I18nCtx | null>(null)

export const useI18n = () => {
  const v = useContext(Ctx)
  if (!v) throw new Error('I18nContext not provided')
  return v
}

export function I18nProvider({
  initialLang,
  messages,
  children,
}: {
  initialLang: Lng
  messages: Messages
  children: React.ReactNode
}) {
  const [lang, setLang] = useState<Lng>(initialLang)

  // Fabrique t côté client à partir du dictionnaire sérialisable
  const t = useMemo(() => {
    const dict = messages || {}
    return (k: string) => dict[k] ?? k
  }, [messages])

  const value = useMemo(() => ({ lang, t, setLang }), [lang, t])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
