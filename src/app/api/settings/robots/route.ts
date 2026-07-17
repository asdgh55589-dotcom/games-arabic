import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const setting = await db.siteSetting.findUnique({ where: { key: 'robots_txt' } })
    const content = setting?.value || 'User-agent: *\nAllow: /'
    return new NextResponse(content, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch {
    return new NextResponse('User-agent: *\nAllow: /', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }
}
