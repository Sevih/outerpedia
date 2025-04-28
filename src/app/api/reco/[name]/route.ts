import { NextRequest } from 'next/server'
import path from 'path'
import fs from 'fs/promises'

export async function GET(req: NextRequest) {
  const name = req.nextUrl.pathname.split('/').pop()?.toLowerCase()

  if (!name) {
    return new Response(JSON.stringify({ error: 'Missing name param' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const filePath = path.join(process.cwd(), 'src/data/reco', `${name}.json`)

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