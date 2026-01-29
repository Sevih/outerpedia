'use client'

import { ReactNode } from 'react'
import parseText from '@/utils/parseText'
import rawProsCons from '@/data/hero-pros-cons.json'
import type { ProsConsMap } from '@/types/hero-content'
import { lArray } from '@/lib/localize'
import { useI18n } from '@/lib/contexts/I18nContext'

const prosCons = rawProsCons as ProsConsMap

type Props = {
  slug: string
}

/**
 * Check if a character has pros/cons data
 */
export function hasProsCons(slug: string): boolean {
  return !!prosCons[slug]
}

function ListItem({ children, type }: { children: ReactNode; type: 'pro' | 'con' }) {
  return (
    <li className="flex items-start gap-2 py-1.5">
      <span className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded-full flex items-center justify-center ${
        type === 'pro'
          ? 'bg-emerald-500/20 text-emerald-400'
          : 'bg-rose-500/20 text-rose-400'
      }`}>
        {type === 'pro' ? (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </span>
      <span className="text-gray-200 leading-relaxed">{children}</span>
    </li>
  )
}

function Card({ items, label, type }: { items: string[]; label: string; type: 'pro' | 'con' }) {
  if (items.length === 0) return null

  const isPro = type === 'pro'

  return (
    <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
      isPro
        ? 'bg-gradient-to-br from-emerald-950/60 to-emerald-900/30 border-emerald-500/20 hover:border-emerald-500/40 shadow-lg shadow-emerald-900/10'
        : 'bg-gradient-to-br from-rose-950/60 to-rose-900/30 border-rose-500/20 hover:border-rose-500/40 shadow-lg shadow-rose-900/10'
    }`}>
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            isPro
              ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-md shadow-emerald-500/30'
              : 'bg-gradient-to-br from-rose-400 to-rose-600 shadow-md shadow-rose-500/30'
          }`}>
            {isPro ? (
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <h3 className={`text-lg font-bold tracking-wide ${isPro ? 'text-emerald-300' : 'text-rose-300'}`}>
            {label}
          </h3>
        </div>
      </div>

      {/* Separator */}
      <div className={`mx-5 h-px ${isPro ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`} />

      {/* Content */}
      <div className="px-5 py-4">
        <ul className="space-y-1">
          {items.map((item, i) => (
            <ListItem key={i} type={type}>
              {parseText(item.charAt(0).toUpperCase() + item.slice(1))}
            </ListItem>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function ProsConsSection({ slug }: Props) {
  const { t, lang } = useI18n()

  const pc = prosCons[slug]
  if (!pc) return null

  const pros = lArray(pc, 'pro', lang)
  const cons = lArray(pc, 'con', lang)

  if (pros.length === 0 && cons.length === 0) return null

  return (
    <section id="pros-cons" className="mt-8">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        {t('pros_cons_title', { defaultValue: 'Pros & Cons' })}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card items={pros} label={t('pros.label')} type="pro" />
        <Card items={cons} label={t('cons.label')} type="con" />
      </div>
    </section>
  )
}
