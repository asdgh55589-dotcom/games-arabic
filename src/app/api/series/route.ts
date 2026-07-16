import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/series — قائمة بكل السلاسل وعدد التعريبات في كل واحدة
export async function GET() {
  try {
    const mods = await db.mod.findMany({
      where: { series: { not: '' } },
      select: {
        series: true,
        thumbnailUrl: true,
        downloads: true,
        endorsements: true,
      },
    })

    // جمّع السلاسل: لكل اسم سلسلة، احسب العدد وآخر تحميلات + التأييدات +
    // الصورة المصغرة (من أحدث تعريب).
    const seriesMap = new Map<string, { count: number; downloads: number; endorsements: number; thumbnailUrl: string }>()
    for (const m of mods) {
      const s = m.series
      const existing = seriesMap.get(s)
      if (existing) {
        existing.count += 1
        existing.downloads += m.downloads
        existing.endorsements += m.endorsements
      } else {
        seriesMap.set(s, {
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

    return NextResponse.json(
      { series },
      {
        headers: {
          // Series list changes only when new series are added or mod counts shift
          // significantly — cache for 5 minutes, serve stale up to 10 minutes.
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (err) {
    console.error('[api/series] failed:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
