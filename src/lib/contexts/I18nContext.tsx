'use client'
import { createContext, useContext, useMemo, useState } from 'react'

export type Lng = 'en' | 'jp' | 'kr'
type Messages = Record<string, string>

// ---- Types de t() avec surcharge : t(key) ou t(key, values) ----
type TValues = Record<string, unknown>
type TFunction = {
  (key: string): string
  (key: string, values: TValues): string
}

// ---- Contexte ----
type I18nCtx = {
  lang: Lng
  t: TFunction
  setLang: (l: Lng) => void
}

const Ctx = createContext<I18nCtx | null>(null)

export const useI18n = () => {
  const v = useContext(Ctx)
  if (!v) throw new Error('I18nContext not provided')
  return v
}

// ---- Formatters (ICU plural basique + interpolation) ----
function formatICU(template: string, values: TValues) {
  // Plural ICU basique : {count, plural, one {...} other {...}}
  const withPlural = template.replace(
    /\{(\w+),\s*plural,\s*one\s*\{([^}]*)\}\s*other\s*\{([^}]*)\}\}/g,
    (_match, varName: string, one: string, other: string) => {
      const raw = values[varName]
      const n = typeof raw === 'number' ? raw : Number(raw)
      const chosen = n === 1 ? one : other
      // remplace # par la valeur numérique
      return chosen.replace(/#/g, String(n))
    }
  )

  // Interpolation simple : "Hello {name}"
  const withVars = withPlural.replace(
    /\{(\w+)\}/g,
    (_m, varName: string) => (values[varName] !== undefined ? String(values[varName]) : '')
  )

  return withVars
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

  const t: TFunction = useMemo(() => {
    const dict = messages || {}

    // Implémentation avec surcharge réelle
    const translate = ((key: string, values?: TValues) => {
      const template = dict[key] ?? key
      if (values && typeof values === 'object') {
        return formatICU(template, values)
      }
      return template
    }) as TFunction

    return translate
  }, [messages])

  const value = useMemo(() => ({ lang, t, setLang }), [lang, t])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
