import { NextResponse } from 'next/server'

const THUMBNAIL_OPTIONS = [
  'maxresdefault.jpg',  // 1280x720 (pas toujours dispo)
  'hqdefault.jpg',      // 480x360 (quasi toujours disponible)
  'mqdefault.jpg',      // 320x180
  'default.jpg',        // 120x90 (toujours disponible)
]

// Cache en mémoire : videoId -> URL de la thumbnail trouvée
// TTL de 24h (les thumbnails YouTube ne changent pas souvent)
const cache = new Map<string, { url: string; timestamp: number }>()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 heures

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const { videoId } = await params
  const cleanVideoId = videoId?.trim()

  if (!cleanVideoId) {
    return NextResponse.json({ error: 'Missing videoId' }, { status: 400 })
  }

  // Vérifie le cache
  const cached = cache.get(cleanVideoId)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.redirect(cached.url, { status: 302 })
  }

  // Teste chaque thumbnail jusqu'à en trouver une qui existe
  for (const thumb of THUMBNAIL_OPTIONS) {
    const url = `https://img.youtube.com/vi/${cleanVideoId}/${thumb}`

    try {
      const response = await fetch(url, { method: 'HEAD' })

      if (response.ok) {
        // Met en cache et redirige
        cache.set(cleanVideoId, { url, timestamp: Date.now() })
        return NextResponse.redirect(url, { status: 302 })
      }
    } catch {
      // Continue vers le fallback suivant
    }
  }

  // Fallback ultime - default.jpg existe toujours
  const fallbackUrl = `https://img.youtube.com/vi/${cleanVideoId}/default.jpg`
  cache.set(cleanVideoId, { url: fallbackUrl, timestamp: Date.now() })
  return NextResponse.redirect(fallbackUrl, { status: 302 })
}
