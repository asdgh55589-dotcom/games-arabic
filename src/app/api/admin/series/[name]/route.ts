import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireModerator } from '@/lib/auth'

// PUT /api/admin/series/[name] — تحديث اسم السلسلة
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    await requireModerator()
    const { name: oldName } = await params
    const body = await req.json()
    const newName = body.name?.trim()

    if (!newName) return NextResponse.json({ error: 'الاسم مطلوب' }, { status: 400 })
    if (newName === oldName) return NextResponse.json({ ok: true })

    // Next.js App Router already decodes params.name, no need for decodeURIComponent
    await db.mod.updateMany({
      where: { series: oldName },
      data: { series: newName },
    })

    return NextResponse.json({ ok: true, oldName, newName })
  } catch (err) {
    console.error('[admin/series/[name] PUT] failed:', err)
    const status = (err as { status?: number })?.status || 500
    return NextResponse.json({ error: 'Failed' }, { status })
  }
}

// DELETE /api/admin/series/[name] — حذف السلسلة (تفريغ حقل series من كل التعريبات)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    await requireModerator()
    const { name } = await params

    // Next.js App Router already decodes params.name
    await db.mod.updateMany({
      where: { series: name },
      data: { series: '' },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[admin/series/[name] DELETE] failed:', err)
    const status = (err as { status?: number })?.status || 500
    return NextResponse.json({ error: 'Failed' }, { status })
  }
}
