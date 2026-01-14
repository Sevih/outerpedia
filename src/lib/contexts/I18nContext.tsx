'use client'
import { createContext, useContext, useMemo, useState, Fragment, createElement, type ReactNode } from 'react'
import type { TenantKey } from '@/tenants/config'

export type Lng = TenantKey
type Messages = Record<string, string>

// ---- Types de t() avec surcharge : t(key) ou t(key, values) ----
// Note: t() returns string when no \n, ReactNode otherwise - typed as string for compatibility
type TValues = Record<string, unknown>
export type TFunction = {
  (key: string): string
  (key: string, values: TValues): string
}

/**
 * Converts \n in a string to <br /> elements for JSX rendering
 */
function nl2jsx(text: string): ReactNode {
  if (!text.includes('\n')) return text
  const parts = text.split('\n')
  return parts.map((line, i) =>
    createElement(Fragment, { key: i }, line, i < parts.length - 1 && createElement('br'))
  )
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

    const getRaw = (key: string, values?: TValues): string => {
      const template = dict[key]

      // En développement, on crash si la clé n'existe pas
      if (template === undefined) {
        if (process.env.NODE_ENV === 'development') {
          throw new Error(`[i18n] Missing translation key: "${key}"`)
        }
        // En production, on fallback sur la clé (pour éviter de casser le site)
        return key
      }

      if (values && typeof values === 'object') {
        return formatICU(template, values)
      }
      return template
    }

    const translate = ((key: string, values?: TValues) => {
      return nl2jsx(getRaw(key, values))
    }) as TFunction

    return translate
  }, [messages])

  const value = useMemo(() => ({ lang, t, setLang }), [lang, t])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
