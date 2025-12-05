// src/app/api/news/search/route.ts
// API route pour la recherche full-text dans les articles de news

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { searchNewsFullText, type NewsCategory } from '@/lib/news'
import { checkRateLimit } from '@/utils/rate-limit'

export const dynamic = 'force-dynamic'

// Validation schema
const searchSchema = z.object({
  q: z.string().min(2, 'Query must be at least 2 characters').max(200, 'Query too long'),
  category: z.enum(['notice', 'maintenance', 'issues', 'event', 'winners', 'patchnotes', 'compendium', 'developer-notes', 'official-4-cut-cartoon', 'probabilities', 'world-introduction', 'media-archives']).optional(),
  lang: z.enum(['en', 'jp', 'kr']).optional(),
})

export async function GET(request: NextRequest) {
  // Rate limiting: 30 requests per minute per IP (search is expensive)
  const rateLimitResponse = checkRateLimit(request, { max: 30, windowSeconds: 60 })
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  const { searchParams } = new URL(request.url)

  // Validate query params with Zod
  const validation = searchSchema.safeParse({
    q: searchParams.get('q'),
    category: searchParams.get('category'),
    lang: searchParams.get('lang') || 'en',
  })

  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: validation.error.issues },
      { status: 400 }
    )
  }

  const { q: query, category, lang } = validation.data

  try {
    // Utiliser la fonction searchNewsFullText qui fait une recherche full-text dans le contenu complet
    const results = searchNewsFullText(query, category || undefined, lang)

    // Limiter les résultats pour éviter une réponse trop lourde
    const limitedResults = results.slice(0, 100)

    return NextResponse.json({
      query,
      category,
      lang,
      total: results.length,
      results: limitedResults,
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
