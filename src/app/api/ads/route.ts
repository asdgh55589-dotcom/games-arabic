import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/ads — جلب إعلانات الصفحة الرئيسية (المرئية فقط)
export async function GET() {
  try {
    const ads = await db.homepageAd.findMany({
      where: { visible: true },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ ads })
  } catch (err) {
    console.error('[api/ads] failed:', err)
    return NextResponse.json({ ads: [] }, { status: 200 })
  }
}
