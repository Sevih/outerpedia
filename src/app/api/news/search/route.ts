// src/app/api/news/search/route.ts
// API route pour la recherche full-text dans les articles de news

import { NextRequest, NextResponse } from 'next/server'
import { searchNewsFullText, type NewsCategory } from '@/lib/news'
import type { VALanguage } from '@/tenants/config'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const query = searchParams.get('q')
  const category = searchParams.get('category') as NewsCategory | null
  const lang = (searchParams.get('lang') || 'en') as VALanguage

  // Validation
  if (!query || query.trim().length < 2) {
    return NextResponse.json(
      { error: 'Query must be at least 2 characters' },
      { status: 400 }
    )
  }

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
