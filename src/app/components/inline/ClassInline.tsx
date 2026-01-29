'use client'

import InlineWrapper from './InlineWrapper'
import classesRaw from '@/data/class.json'
import { useI18n } from '@/lib/contexts/I18nContext'

type SubclassInfo = { description: string; image: string }
type ClassInfo = { description: string; image: string; subclasses?: Record<string, SubclassInfo> }
type ClassMap = Record<string, ClassInfo>

const classes = classesRaw as ClassMap

const capitalize = (s: string) => (s ? s[0].toUpperCase() + s.slice(1).toLowerCase() : s)

type Props = {
  name: string
  subclass?: string
}

export default function ClassInline({ name, subclass }: Props) {
  const { t } = useI18n()

  const classData = classes[name]
  if (!classData) return <span className="text-red-500">{name}</span>

  const hasSubclass = !!(subclass && classData.subclasses?.[subclass])
  const displayKey = hasSubclass ? subclass! : name

  const translationKey = hasSubclass
    ? `SYS_CLASS_NAME_${displayKey.toUpperCase()}`
    : `SYS_CLASS_${displayKey.toUpperCase()}`

  const label = t(translationKey, { defaultValue: capitalize(displayKey) })
  const imageKey = displayKey.toLowerCase()
  const iconPath = `/images/ui/class/${imageKey}.webp`

  return (
    <InlineWrapper
      icon={iconPath}
      label={label}
      color="text-orange-400"
    />
  )
}
