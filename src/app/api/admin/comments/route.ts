import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireModerator } from '@/lib/auth'

// DELETE /api/admin/comments — حذف تعليق
export async function DELETE(req: NextRequest) {
  try {
    await requireModerator()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const comment = await db.modComment.findUnique({ where: { id }, select: { id: true, modId: true } })
    if (!comment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Wrap delete + count update in a transaction for atomicity
    await db.$transaction(async (tx) => {
      await tx.modComment.delete({ where: { id } })
      const count = await tx.modComment.count({ where: { modId: comment.modId } })
      await tx.mod.update({ where: { id: comment.modId }, data: { comments: count } })
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[admin/comments DELETE] failed:', err)
    const status = (err as { status?: number })?.status || 500
    return NextResponse.json({ error: 'Failed' }, { status })
  }
}
