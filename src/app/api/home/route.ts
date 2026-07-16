import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { HomeData, ApiError, ModSummary, SeriesSummary } from '@/lib/types'

// GET /api/home - aggregated homepage data
//
// Returns everything the home page needs in a single request:
//   - site stats (counts + sums)
//   - featured games (for optional carousel)
//   - trending mods (isTrending=true, sorted by downloads)
//   - latest mods (sorted by updatedAt — most recently updated/new)
//   - top endorsed mods (sorted by endorsements)
//   - top series (by mod count, with first mod as poster)
//   - mods grouped by platform (PC/PS4/PS3/PS2/PS1, 4 each)
//
// We run all queries in parallel via Promise.all to keep latency low.
export async function GET() {
  try {
    const modInclude = {
      author: true,
      game: { select: { name: true, slug: true, platform: true } },
      category: { select: { name: true, slug: true } },
    } as const

    const [
      games,
      mods,
      downloadsAgg,
      endorsementsAgg,
      users,
      featuredGames,
      trendingMods,
      latestMods,
      topEndorsed,
      pcMods,
      ps4Mods,
      ps3Mods,
      ps2Mods,
      ps1Mods,
      seriesRows,
      pcLatest,
      ps4Latest,
      ps3Latest,
      ps2Latest,
      ps1Latest,
    ] = await Promise.all([
      db.game.count(),
      db.mod.count(),
      db.mod.aggregate({ _sum: { downloads: true } }),
      db.mod.aggregate({ _sum: { endorsements: true } }),
      db.user.count(),
      db.game.findMany({
        where: { featured: true },
        orderBy: { totalDownloads: 'desc' },
        take: 8,
      }),
      db.mod.findMany({
        where: { isTrending: true },
        orderBy: { downloads: 'desc' },
        take: 12,
        include: modInclude,
      }),
      db.mod.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 8,
        include: modInclude,
      }),
      db.mod.findMany({
        orderBy: { endorsements: 'desc' },
        take: 8,
        include: modInclude,
      }),
      // تعديلات لكل منصة — 4 بطاقات لكل قسم
      db.mod.findMany({
        where: { game: { platform: 'PC' } },
        orderBy: { downloads: 'desc' },
        take: 4,
        include: modInclude,
      }),
      db.mod.findMany({
        where: { game: { platform: 'PS4' } },
        orderBy: { downloads: 'desc' },
        take: 4,
        include: modInclude,
      }),
      db.mod.findMany({
        where: { game: { platform: 'PS3' } },
        orderBy: { downloads: 'desc' },
        take: 4,
        include: modInclude,
      }),
      db.mod.findMany({
        where: { game: { platform: 'PS2' } },
        orderBy: { downloads: 'desc' },
        take: 4,
        include: modInclude,
      }),
      db.mod.findMany({
        where: { game: { platform: 'PS1' } },
        orderBy: { downloads: 'desc' },
        take: 4,
        include: modInclude,
      }),
      // أعلى 6 سلاسل حسب عدد التعريبات — نستخدم thumbnailUrl من أول
      // تعريب في السلسلة كصورة معرفة للسلسلة.
      db.mod.findMany({
        where: { series: { not: '' } },
        select: {
          series: true,
          thumbnailUrl: true,
          downloads: true,
          endorsements: true,
        },
        orderBy: { downloads: 'desc' },
      }),
      // أحدث 3 تعريبات لكل منصة — تُستخدم في شريط "أحدث التعريبات" المتحرك
      // اللي بديل البانر الرئيسي (بدل الأكثر تحميلاً، هنا بالأحدث فعلياً).
      db.mod.findMany({
        where: { game: { platform: 'PC' } },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: modInclude,
      }),
      db.mod.findMany({
        where: { game: { platform: 'PS4' } },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: modInclude,
      }),
      db.mod.findMany({
        where: { game: { platform: 'PS3' } },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: modInclude,
      }),
      db.mod.findMany({
        where: { game: { platform: 'PS2' } },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: modInclude,
      }),
      db.mod.findMany({
        where: { game: { platform: 'PS1' } },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: modInclude,
      }),
    ])

    // جمّع السلاسل: لكل اسم سلسلة، احسب العدد وآخر تحميلات + التأييدات +
    // الصورة المصغرة (من أحدث تعريب).
    const seriesMap = new Map<string, { count: number; downloads: number; endorsements: number; thumbnailUrl: string }>()
    for (const m of seriesRows) {
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
    const topSeries: SeriesSummary[] = Array.from(seriesMap.entries())
      .map(([name, info]) => ({ name, ...info }))
      .sort((a, b) => b.count - a.count || b.downloads - a.downloads)
      .slice(0, 6)

    const modsByPlatform: Record<string, ModSummary[]> = {
      PC: pcMods as unknown as ModSummary[],
      PS4: ps4Mods as unknown as ModSummary[],
      PS3: ps3Mods as unknown as ModSummary[],
      PS2: ps2Mods as unknown as ModSummary[],
      PS1: ps1Mods as unknown as ModSummary[],
    }

    // شريط "أحدث التعريبات" المتحرك — 3 أحدث من كل قسم منصة (15 عنصر إجمالاً)
    const tickerMods: ModSummary[] = [
      ...(pcLatest as unknown as ModSummary[]),
      ...(ps4Latest as unknown as ModSummary[]),
      ...(ps3Latest as unknown as ModSummary[]),
      ...(ps2Latest as unknown as ModSummary[]),
      ...(ps1Latest as unknown as ModSummary[]),
    ]

    return NextResponse.json<HomeData>({
      stats: {
        games,
        mods,
        downloads: downloadsAgg._sum.downloads || 0,
        endorsements: endorsementsAgg._sum.endorsements || 0,
        users,
      },
      featuredGames,
      trendingMods: trendingMods as unknown as ModSummary[],
      latestMods: latestMods as unknown as ModSummary[],
      topEndorsed: topEndorsed as unknown as ModSummary[],
      topSeries,
      modsByPlatform,
      tickerMods,
    }, {
      headers: {
        // Home page aggregates many parallel DB queries — cache aggressively to
        // cut DB load. The data includes download/endorse counters that move
        // often, so keep max-age short (30s) but allow stale serving for 120s
        // while a background revalidate fetches fresh data.
        'Cache-Control': 'public, max-age=30, stale-while-revalidate=120',
      },
    })
  } catch (err) {
    console.error('[api/home] failed:', err)
    return NextResponse.json<ApiError>(
      { error: 'Failed to load homepage data' },
      { status: 500 }
    )
  }
}
