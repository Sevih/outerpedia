import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import pool from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { team, chainOrder, notes } = body

    if (!team || !chainOrder) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Generate a short unique ID (8 characters)
    const id = nanoid(8)

    // Save team data to MySQL
    await pool.execute(
      'INSERT INTO teams (id, team, chain_order, notes) VALUES (?, ?, ?, ?)',
      [id, team, chainOrder, notes || '']
    )

    return NextResponse.json({ id }, { status: 200 })
  } catch (error) {
    console.error('Error saving team:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
