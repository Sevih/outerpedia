'use client'

import Image from 'next/image'
import classesRaw from '@/data/class.json'

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
  name: keyof typeof classes
  subclass?: string
}

export default function ClassInlineTag({ name, subclass }: Props) {
  const classData = classes[name]
  if (!classData) return <span className="text-red-500">{name}</span>

  const subclassData = subclass && classData.subclasses?.[subclass]
  const displayName = subclassData ? subclass : name
  const displayImage = subclassData ? subclass.toLowerCase() : name.toLowerCase()

  return (
    <span className="inline-flex items-end gap-1 align-bottom">
      <span className="inline-block w-[24px] h-[24px] relative align-bottom">
        <Image
          src={`/images/ui/class/${displayImage}.webp`}
          alt={displayName}
          fill
          sizes="24px"
          className="object-contain"
        />
      </span>
      <span>{displayName}</span>
    </span>
  )
}