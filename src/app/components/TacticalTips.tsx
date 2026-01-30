'use client'

import { useTenant } from '@/lib/contexts/TenantContext'
import { lRec, type LangMap } from '@/lib/localize'
import { getT } from '@/i18n'
import parseText from '@/utils/parseText'
import type { TenantKey } from '@/tenants/config'

// Presets disponibles (clés i18n)
const TITLE_PRESETS = ['tactical', 'strategy', 'general', 'important', 'mechanics', 'phase1', 'phase2'] as const

type TitlePreset = typeof TITLE_PRESETS[number]

type TipSection = {
  title: TitlePreset | LangMap
  tips: (string | LangMap)[]
}

type Props = {
  /** Preset key or custom LangMap for the main title. Defaults to 'tactical' */
  title?: TitlePreset | LangMap
  /** Simple list of tips (mutually exclusive with sections) */
  tips?: (string | LangMap)[]
  /** Grouped tips with sub-headings (mutually exclusive with tips) */
  sections?: TipSection[]
}

function isPreset(title: TitlePreset | LangMap): title is TitlePreset {
  return typeof title === 'string' && TITLE_PRESETS.includes(title as TitlePreset)
}

function resolveTitle(title: TitlePreset | LangMap, t: ReturnType<typeof getT>, lang: TenantKey): string {
  if (isPreset(title)) {
    return t(`tips.${title}`)
  }
  return lRec(title as LangMap, lang)
}

function LightbulbIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zM9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1z"/>
    </svg>
  )
}

function TipList({ tips, lang }: { tips: (string | LangMap)[]; lang: TenantKey }) {
  return (
    <ul className="space-y-2 list-disc list-inside marker:text-sky-400">
      {tips.map((tip, index) => (
        <li key={index} className="text-neutral-300">
          {parseText(lRec(tip, lang))}
        </li>
      ))}
    </ul>
  )
}

export default function TacticalTips({ title = 'tactical', tips, sections }: Props) {
  const { key: lang } = useTenant()
  const t = getT(lang)

  const mainTitle = resolveTitle(title, t, lang)

  return (
    <div className="rounded-lg bg-neutral-800/50 border-l-4 border-sky-500 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-neutral-800/80 border-b border-neutral-700">
        <LightbulbIcon className="w-5 h-5 text-sky-400" />
        <h3 className="text-lg font-semibold text-sky-300">{mainTitle}</h3>
      </div>

      {/* Content */}
      <div className="p-4">
        {tips && <TipList tips={tips} lang={lang} />}

        {sections?.map((section, index) => (
          <div key={index} className={index > 0 ? 'mt-4' : ''}>
            <h4 className="text-base font-medium text-white/90 mb-2 pl-2 border-l-2 border-sky-400/50">
              {resolveTitle(section.title, t, lang)}
            </h4>
            <TipList tips={section.tips} lang={lang} />
          </div>
        ))}
      </div>
    </div>
  )
}
