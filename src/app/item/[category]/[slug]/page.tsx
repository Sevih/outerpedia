import weaponData from '@/data/weapon.json'
import accessoryData from '@/data/amulet.json'
import setData from '@/data/sets.json'
//import talismanData from '@/data/talisman.json'
//import eeData from '@/data/ee.json'

import renderWeapon from '@/app/components/renderWeapon'
import renderAccessory from '@/app/components/renderAccessory'
import renderSet from '@/app/components/renderSet'
//import renderTalisman from '@/app/components/renderTalisman'
//import renderEE from '@/app/components/renderEE'


import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { toKebabCase } from '@/utils/formatText'

type Params = { category: string; slug: string }
type GenericItem = { 
  name: string; 
  effect_name?: string; 
  class?: string; 
  mainStats?: string[]; 
  effect_desc1?: string; 
  effect?: string; 
  icon_effect?: string; 
  icon_item?: string; 
  image?: string; 
  set_icon?: string
 }

type SetItem = {
  name: string
  rarity: number
  class?: string
  mainStats?: string[]
  substats?: string[]
  set_icon?: string
  effect_2_1?: string
  effect_2_4?: string
  effect_4_1?: string
  effect_4_4?: string
  source?: string
  boss?: string
  mode?: string
  image_prefix?: string
}


const datasets: Record<string, unknown[] | Record<string, unknown>> = {
  weapon: weaponData,
  accessory: accessoryData,
  set: setData,
  //talisman: talismanData,
  //ee: eeData,
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function isValidItem(item: unknown): item is GenericItem {
  return typeof item === 'object' && item !== null && 'name' in item && typeof (item as { name?: unknown }).name === 'string'
}

function findEntry(data: unknown[] | Record<string, unknown>, slug: string): GenericItem | null {
  const entries = Array.isArray(data) ? data : Object.values(data)
  const match = entries.find((item) => isValidItem(item) && toKebabCase(item.name) === slug) as GenericItem | undefined
  return match ?? null
}

function getItemImageUrl(entry: GenericItem, category: string): string {
//  if (category === 'ee') {
  //  return `https://outerpedia.com/images/equipment/effect/${entry.icon_effect}.png`
  //}
  if (category === 'set') {
    return `https://outerpedia.com/images/equipment/set/${entry.set_icon}.png`
  }
  //if (category === 'talisman') {
    //return `https://outerpedia.com/images/equipment/talisman/${entry.icon_item}.png`
  //}
  if (category === 'weapon') {
    return `https://outerpedia.com/images/equipment/${entry.image?.replace('.webp', '.png') || 'default.png'}`
  }
  if (category === 'accessory') {
    return `https://outerpedia.com/images/equipment/${entry.image?.replace('.webp', '.png') || 'default.png'}`
  }
  return `https://outerpedia.com/images/equipment/icon/${entry.image?.replace('.webp', '.png') || 'default.png'}`
}

function generateItemKeywords(entry: GenericItem, category: string, slug: string): string[] {
  const base = [
    'outerplane',
    'outerpedia',
    'outerplane item',
    'outerplane gear',
    'outerplane database',
    entry.name,
    slug,
    category,
  ]

  const extras: string[] = []

  if (entry.class) extras.push(entry.class)
  if (entry.effect_name) extras.push(entry.effect_name)
  if (entry.name.includes('Set')) extras.push('gear set', 'set bonus')
  if (entry.name.includes('Talisman')) extras.push('talisman effect', 'relic')

  return base.concat(extras)
}

// 📦 Routes statiques
export async function generateStaticParams() {
  const params: Params[] = []

  for (const [category, data] of Object.entries(datasets)) {
    const entries = Array.isArray(data) ? data : Object.values(data)
    for (const item of entries) {
      if (isValidItem(item)) {
        params.push({ category, slug: toKebabCase(item.name) })
      }
    }
  }

  return params
}

// 🧠 SEO metadata
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { category, slug } = await params
  const data = datasets[category]
  if (!data) return { title: 'Item not found', description: 'This item does not exist.' }

  const entry = findEntry(data, slug)
  if (!entry) return { title: 'Item not found', description: 'This item does not exist.' }

  const url = `https://outerpedia.com/item/${category}/${slug}`
  const image = getItemImageUrl(entry, category)

  return {
    title: `${entry.name} | ${capitalize(category)} | Outerpedia`,
    description: `Details, stats, and effects for ${entry.name} (${category}) in Outerplane.`,
    keywords: generateItemKeywords(entry, category, slug),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${entry.name} | ${capitalize(category)} | Outerpedia`,
      description: `Find detailed information about ${entry.name}, including stats, rarity, and effects.`,
      type: 'article',
      url,
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary',
      title: `${entry.name} | ${capitalize(category)} | Outerpedia`,
      description: `Outerplane ${category} database: ${entry.name} full details.`,
      images: [image],
    },
  }
}

// 🔍 Page
export default async function ItemPage({ params }: { params: Promise<Params> }) {
  const { category, slug } = await params

  const data = datasets[category]
  if (!data) notFound()

  const entry = findEntry(data, slug)
  if (!entry) notFound()

  return (
    <div className="p-6 text-white">
      {renderItem(category, entry)}
    </div>
  )
}

function renderItem(category: string, entry: GenericItem) {
  switch (category) {
    case 'weapon':
      return renderWeapon(entry)
    case 'accessory':
      return renderAccessory(entry)
    case 'set':
      return renderSet(entry as SetItem) 
    //case 'talisman':
      //return renderTalisman(entry)
    //case 'ee':
      //return renderEE(entry)
    default:
      return <div>Unsupported item type: {category}</div>
  }
}
