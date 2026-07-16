import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireModerator } from '@/lib/auth'

// GET /api/admin/series — قائمة السلاسل
export async function GET() {
  try {
    await requireModerator()
    const mods = await db.mod.findMany({
      where: { series: { not: '' } },
      select: {
        series: true,
        thumbnailUrl: true,
        downloads: true,
        endorsements: true,
      },
    })

    const seriesMap = new Map<string, { count: number; downloads: number; endorsements: number; thumbnailUrl: string }>()
    for (const m of mods) {
      const existing = seriesMap.get(m.series)
      if (existing) {
        existing.count += 1
        existing.downloads += m.downloads
        existing.endorsements += m.endorsements
      } else {
        seriesMap.set(m.series, {
          count: 1,
          downloads: m.downloads,
          endorsements: m.endorsements,
          thumbnailUrl: m.thumbnailUrl,
        })
      }
    }

    const series = Array.from(seriesMap.entries())
      .map(([name, info]) => ({ name, ...info }))
      .sort((a, b) => b.count - a.count || b.downloads - a.downloads)

    return NextResponse.json({ series })
  } catch (err) {
    console.error('[admin/series GET] failed:', err)
    const status = (err as { status?: number })?.status || 500
    return NextResponse.json({ error: 'Failed' }, { status })
  }
}
