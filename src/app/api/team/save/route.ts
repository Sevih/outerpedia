import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import pool from '@/lib/db'
import { checkRateLimit } from '@/utils/rate-limit'

// Validation schema for team data
const teamSchema = z.object({
  team: z.string().max(50000, 'Team data too large'), // ~50KB limit
  chainOrder: z.string().max(100, 'Chain order too large'),
  notes: z.string().max(10000, 'Notes too large').optional(),
  title: z.string().max(200, 'Title too long').optional(),
})

export async function POST(request: NextRequest) {
  // Rate limiting: 10 requests per minute per IP
  const rateLimitResponse = checkRateLimit(request, { max: 10, windowSeconds: 60 })
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const body = await request.json()

    // Validate input with Zod
    const validation = teamSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { team, chainOrder, notes, title } = validation.data

    // Generate a short unique ID (8 characters)
    const id = nanoid(8)

    // Save team data to MySQL
    await pool.execute(
      'INSERT INTO teams (id, team, chain_order, notes, title) VALUES (?, ?, ?, ?, ?)',
      [id, team, chainOrder, notes || '', title || '']
    )

    return NextResponse.json({ id }, { status: 200 })
  } catch (error) {
    console.error('Error saving team:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
