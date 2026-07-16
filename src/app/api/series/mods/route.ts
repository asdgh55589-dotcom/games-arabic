import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { parsePagination, pickSort } from '@/lib/api-utils'
import type { PaginatedMods } from '@/lib/types'

const SORTS = ['downloads', 'endorsements', 'newest', 'updated', 'views'] as const

const ORDER_BY: Record<string, Record<string, 'desc' | 'asc'>> = {
  downloads: { downloads: 'desc' },
  endorsements: { endorsements: 'desc' },
  newest: { releaseDate: 'desc' },
  updated: { updatedAt: 'desc' },
  views: { views: 'desc' },
}

// GET /api/series/mods?series=God of War — تعديلات سلسلة معينة
//
// Supported query params:
//   - series (required): the series name to filter by
//   - search: free-text search across name/summary
//   - sort: downloads | endorsements | newest | updated | views
//   - page, limit: pagination
//   - translationType: official | unofficial
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const seriesName = searchParams.get('series') || ''
  const search = searchParams.get('search')?.trim() || null
  const sort = pickSort(searchParams.get('sort'), SORTS, 'downloads')
  const { page, limit } = parsePagination(
    searchParams.get('page'),
    searchParams.get('limit'),
    { limit: 24, maxLimit: 100 }
  )
  const translationType = searchParams.get('translationType')

  if (!seriesName) {
    return NextResponse.json({ error: 'series is required' }, { status: 400 })
  }

  const where: Record<string, unknown> = { series: seriesName }
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { summary: { contains: search } },
    ]
  }
  if (translationType === 'official' || translationType === 'unofficial') {
    where.translationType = translationType
  }

  const [total, mods] = await Promise.all([
    db.mod.count({ where }),
    db.mod.findMany({
      where,
      orderBy: ORDER_BY[sort],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        author: true,
        game: { select: { name: true, slug: true, platform: true } },
        category: { select: { name: true, slug: true } },
      },
    }),
  ])

  return NextResponse.json<PaginatedMods>({
    mods,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  }, {
    headers: {
      // Series pages change infrequently — cache aggressively.
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
    },
  })
}
