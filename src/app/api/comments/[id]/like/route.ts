import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/comments/[id]/like — إعجاب بتعليق
export async function POST(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const comment = await db.modComment.findUnique({ where: { id }, select: { id: true, likes: true, dislikes: true } })
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    const updated = await db.modComment.update({
      where: { id },
      data: { likes: { increment: 1 } },
      select: { likes: true, dislikes: true },
    })

    return NextResponse.json({ likes: updated.likes, dislikes: updated.dislikes })
  } catch (err) {
    console.error('[comments like] failed:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
