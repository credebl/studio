import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(): Promise<NextResponse> {
  const themesDir = path.join(process.cwd(), 'public', 'themes')
  const files = fs.readdirSync(themesDir)

  const themes = files
    .filter((file) => file.endsWith('_theme.css'))
    .map((file) => {
      const value = file.replace('_theme.css', '').toLowerCase()
      return { name: value.toUpperCase(), value }
    })

  return NextResponse.json(themes)
}
