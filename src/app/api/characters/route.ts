import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET() {
  const dirPath = path.join(process.cwd(), 'src/data/char')

  try {
    const files = await fs.readdir(dirPath)

    const characters = await Promise.all(
      files
        .filter((f) => f.endsWith('.json'))
        .map(async (file) => {
          const content = await fs.readFile(path.join(dirPath, file), 'utf-8')
          return JSON.parse(content)
        })
    )

    return NextResponse.json(characters)
  } catch (err) {
    console.error('Error loading characters:', err)
    return NextResponse.json({ error: 'Failed to load characters' }, { status: 500 })
  }
}
