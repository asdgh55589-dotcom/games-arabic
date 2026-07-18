import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/teams — قائمة بكل فرق التعريب وعدد التعريبات في كل فريق
export async function GET() {
  try {
    const mods = await db.mod.findMany({
      where: { translationTeam: { not: '' } },
      select: {
        translationTeam: true,
        thumbnailUrl: true,
        downloads: true,
        endorsements: true,
      },
    })

    // جمّع الفرق: لكل اسم فريق، احسب العدد وآخر تحميلات + التأييدات
    const teamsMap = new Map<string, { count: number; downloads: number; endorsements: number; thumbnailUrl: string }>()
    for (const m of mods) {
      const t = m.translationTeam
      const existing = teamsMap.get(t)
      if (existing) {
        existing.count += 1
        existing.downloads += m.downloads
        existing.endorsements += m.endorsements
      } else {
        teamsMap.set(t, {
          count: 1,
          downloads: m.downloads,
          endorsements: m.endorsements,
          thumbnailUrl: m.thumbnailUrl,
        })
      }
    }

    const teams = Array.from(teamsMap.entries())
      .map(([name, info]) => ({ name, ...info }))
      .sort((a, b) => b.count - a.count || b.downloads - a.downloads)

    return NextResponse.json(
      { teams },
      {
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (err) {
    console.error('[api/teams] failed:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
