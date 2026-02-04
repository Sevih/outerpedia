import type { Metadata } from 'next'
import OstClient from './OstClient'
import bgmMapping from '@/data/bgm_mapping.json'

export const metadata: Metadata = {
  title: 'OST - Outerpedia',
  description: 'Listen to and download the official Outerplane soundtrack',
}

export default function OstPage() {
  return <OstClient tracks={bgmMapping} />
}
