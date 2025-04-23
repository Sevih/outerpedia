import { NextRequest } from 'next/server'
import path from 'path'
import fs from 'fs/promises'
import { toKebabCase } from '@/utils/formatText'

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
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
