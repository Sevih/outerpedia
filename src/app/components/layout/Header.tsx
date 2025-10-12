import { getActiveEvents } from '@/data/events/active'
import HeaderClient from './HeaderClient'

export default function Header() {
  const list = getActiveEvents()
  const ev = list[0] ?? null
  const extra = list.length > 1 ? list.length - 1 : 0
  return <HeaderClient activeEvent={ev?.meta ?? null} extraActiveCount={extra} />
}
