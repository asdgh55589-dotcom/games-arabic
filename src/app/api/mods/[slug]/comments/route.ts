import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface RouteParams {
  params: Promise<{ slug: string }>
}

// GET /api/mods/[slug]/comments — قائمة التعليقات
//
// Query params:
//   - sort: newest | popular | oldest
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { slug } = await params
  const { searchParams } = new URL(req.url)
  const sort = searchParams.get('sort') || 'newest'

  const mod = await db.mod.findUnique({ where: { slug }, select: { id: true } })
  if (!mod) {
    return NextResponse.json({ error: 'Mod not found' }, { status: 404 })
  }

  // جلب كل التعليقات (مع الردود)
  const comments = await db.modComment.findMany({
    where: {
      modId: mod.id,
      parentId: null, // التعليقات الرئيسية فقط — الردود هتجي معاها كـ relation
    },
    include: {
      replies: {
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: sort === 'oldest'
      ? { createdAt: 'asc' }
      : sort === 'popular'
        ? { likes: 'desc' }
        : { createdAt: 'desc' },
  })

  // لو newest → المثبّت دائماً الأول
  const sorted = sort === 'newest'
    ? [...comments].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
    : comments

  // عدّاد إجمالي التعليقات (رئيسية + ردود)
  const totalCount = await db.modComment.count({ where: { modId: mod.id } })

  return NextResponse.json({ comments: sorted, total: totalCount })
}

// POST /api/mods/[slug]/comments — إضافة تعليق جديد
//
// Body: { text: string, guestName?: string, guestAvatar?: string, parentId?: string }
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params
    const body = await req.json().catch(() => ({}))

    if (!body.text || typeof body.text !== 'string' || body.text.trim().length === 0) {
      return NextResponse.json({ error: 'نص التعليق مطلوب' }, { status: 400 })
    }
    if (body.text.length > 2000) {
      return NextResponse.json({ error: 'التعليق طويل جداً (الحد الأقصى 2000 حرف)' }, { status: 400 })
    }

    const mod = await db.mod.findUnique({ where: { slug }, select: { id: true } })
    if (!mod) {
      return NextResponse.json({ error: 'Mod not found' }, { status: 404 })
    }

    // لو فيه parentId → تأكد إن الـ parent موجود وينتمي لنفس الـ mod
    if (body.parentId) {
      const parent = await db.modComment.findUnique({
        where: { id: body.parentId },
        select: { id: true, modId: true },
      })
      if (!parent || parent.modId !== mod.id) {
        return NextResponse.json({ error: 'التعليق الأصلي غير موجود' }, { status: 400 })
      }
    }

    const comment = await db.modComment.create({
      data: {
        modId: mod.id,
        parentId: body.parentId || null,
        guestName: body.guestName || 'زائر',
        guestAvatar: body.guestAvatar || null,
        text: body.text.trim(),
      },
    })

    // تحديث عدّاد التعليقات على الـ Mod
    await db.mod.update({
      where: { id: mod.id },
      data: { comments: { increment: 1 } },
    })

    return NextResponse.json({ comment }, { status: 201 })
  } catch (err) {
    console.error('[comments POST] failed:', err)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}
