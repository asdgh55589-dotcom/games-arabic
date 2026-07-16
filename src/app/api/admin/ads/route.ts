import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireModerator } from '@/lib/auth'
import { revalidateTag } from '@/lib/cache'

// GET /api/admin/ads — قائمة كل الإعلانات
export async function GET() {
  try {
    await requireModerator()
    const ads = await db.homepageAd.findMany({
      orderBy: { order: 'asc' },
    })
    return NextResponse.json({ ads })
  } catch (err) {
    console.error('[admin/ads GET] failed:', err)
    const status = (err as { status?: number })?.status || 500
    return NextResponse.json({ error: 'Failed' }, { status })
  }
}

// POST /api/admin/ads — إنشاء إعلان جديد
export async function POST(req: NextRequest) {
  try {
    await requireModerator()
    const body = await req.json()

    if (!body.url) {
      return NextResponse.json({ error: 'url مطلوب' }, { status: 400 })
    }

    const ad = await db.homepageAd.create({
      data: {
        type: body.type || 'youtube',
        url: body.url,
        title: body.title || '',
        description: body.description || '',
        link: body.link || null,
        size: body.size || 'medium',
        order: body.order || 0,
        visible: body.visible !== undefined ? Boolean(body.visible) : true,
      },
    })

    await revalidateTag('ads')

    return NextResponse.json({ ad }, { status: 201 })
  } catch (err) {
    console.error('[admin/ads POST] failed:', err)
    const status = (err as { status?: number })?.status || 500
    return NextResponse.json({ error: 'Failed' }, { status })
  }
}
