'use client'

import Image from 'next/image'
import classesRaw from '@/data/class.json'
import { useI18n } from '@/lib/contexts/I18nContext'

const classes = classesRaw as ClassMap

type SubclassInfo = {
  description: string
  image: string
}

type ClassInfo = {
  description: string
  image: string
  subclasses?: Record<string, SubclassInfo>
}

type ClassMap = Record<string, ClassInfo>

type Props = {
  name: string        // ex: 'ATTACKER', 'MAGE', 'PRIEST', ...
  subclass?: string   // ex: 'WIZARD', 'VANGUARD', ...
  notext?: boolean
}

// petit helper
const capitalize = (s: string) => (s ? s[0].toUpperCase() + s.slice(1).toLowerCase() : s)

export default function ClassInlineTag({ name, subclass, notext = false }: Props) {
  const { t } = useI18n()

  const classData = classes[name]
  if (!classData) return <span className="text-red-500">{name}</span>

  const hasSubclass = !!(subclass && classData.subclasses?.[subclass])
  const displayKey = hasSubclass ? subclass! : name

  // Clés i18n dynamiques
  const translationKey = hasSubclass
    ? `SYS_CLASS_NAME_${displayKey.toUpperCase()}`
    : `SYS_CLASS_${displayKey.toUpperCase()}`

  const label = t(translationKey, { defaultValue: capitalize(displayKey) })

  // image : même logique que toi (minuscule)
  const imageKey = displayKey.toLowerCase()

  return (
    <span className="inline-flex items-end gap-1 align-bottom">
      <span className="inline-block w-[24px] h-[24px] relative align-bottom">
        <Image
          src={`/images/ui/class/${imageKey}.webp`}
          alt={label}
          fill
          sizes="24px"
          className="object-contain"
        />
      </span>
      {!notext && <span className="text-orange-400">{label}</span>}
    </span>
  )
}