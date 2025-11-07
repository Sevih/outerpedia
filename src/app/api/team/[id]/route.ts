import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import type { RowDataPacket } from 'mysql2'

interface TeamRow extends RowDataPacket {
  team: string
  chain_order: string
  notes: string
  created_at: Date
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Missing team ID' }, { status: 400 })
    }

    // Query team from MySQL
    const [rows] = await pool.execute<TeamRow[]>(
      'SELECT team, chain_order, notes, created_at FROM teams WHERE id = ?',
      [id]
    )

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    const teamData = rows[0]

    return NextResponse.json({
      team: teamData.team,
      chainOrder: teamData.chain_order,
      notes: teamData.notes,
      createdAt: teamData.created_at
    }, { status: 200 })
  } catch (error) {
    console.error('Error loading team:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
