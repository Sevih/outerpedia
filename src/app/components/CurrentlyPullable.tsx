import fs from 'fs'
import path from 'path'
import CurrentlyPullableClient from './CurrentlyPullableClient'

type BannerEntry = {
  name: string
  start: string
  end: string
}

function toUkResetIso(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00Z`).toISOString()
}

function isBannerActive(start: string, end: string): boolean {
  const now = new Date()
  const startDate = new Date(toUkResetIso(start))
  const endDate = new Date(toUkResetIso(end))
  return now >= startDate && now < endDate
}

export default async function CurrentlyPullable() {
  const bannerPath = path.resolve(process.cwd(), 'src/data/banner.json')
  const bannerData: BannerEntry[] = JSON.parse(fs.readFileSync(bannerPath, 'utf8'))

  const activeBanners = bannerData
    .filter(entry => isBannerActive(entry.start, entry.end))
    .map(({ name, end }) => ({
      name, // Fullname in English
      endDate: toUkResetIso(end),
    }))

  return <CurrentlyPullableClient banners={activeBanners} />
}
