import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/games/[slug]/categories — أقسام لعبة معينة
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const game = await db.game.findUnique({
      where: { slug },
      include: { categories: true },
    })

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    return NextResponse.json({ categories: game.categories })
  } catch (err) {
    console.error('[api/games/[slug]/categories] failed:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
