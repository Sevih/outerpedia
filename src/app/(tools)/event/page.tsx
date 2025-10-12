import { getActiveEvents } from '@/data/events/active'

export default function EventActivePage() {
  const list = getActiveEvents()
  if (list.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-bold">No active event</h1>
      </main>
    )
  }

  const ev = list[0] // le plus récent
  const Page = ev.Page

  return (
    <main>
      {list.length > 1 && (
        <div className="mx-auto max-w-3xl px-4 py-3 mb-2 text-sm rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
          Multiple events are active. Showing the most recent (“{ev.meta.title}”). See{' '}
          <a href="/event/history" className="underline">history</a> for all.
        </div>
      )}
      <Page />
    </main>
  )
}
