import { NextRequest } from 'next/server'
import path from 'path'
import fs from 'fs/promises'
import { z } from 'zod'
import { checkRateLimit } from '@/utils/rate-limit'

// Validate character name format
const nameSchema = z.string().regex(/^[a-z0-9-]+$/, 'Invalid character name format').max(100)

export async function GET(req: NextRequest) {
  // Rate limiting: 100 requests per minute (read-only endpoint)
  const rateLimitResponse = checkRateLimit(req, { max: 100, windowSeconds: 60 })
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  const rawName = req.nextUrl.pathname.split('/').pop()?.toLowerCase()

  if (!rawName) {
    return new Response(JSON.stringify({ error: 'Missing name param' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Validate and sanitize name to prevent path traversal
  const validation = nameSchema.safeParse(rawName)
  if (!validation.success) {
    return new Response(JSON.stringify({ error: 'Invalid character name' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const name = validation.data

  // Use path.basename as additional protection against path traversal
  const safeFileName = path.basename(`${name}.json`)
  const filePath = path.join(process.cwd(), 'src/data/reco', safeFileName)

  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return new Response(content, {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch {
    // Répondre 200 avec un placeholder JSON au lieu de 404
    return new Response(
      JSON.stringify({ status: 'empty', message: 'No data available for this character.' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}