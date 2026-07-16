import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, hashPassword } from '@/lib/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

// PUT /api/admin/users/[id] — تعديل مستخدم (دور، بيانات، كلمة مرور)
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await requireAdmin()
    const { id } = await params
    const body = await req.json()

    const target = await db.user.findUnique({ where: { id } })
    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // الصلاحيات على الأدوار:
    //   - admin يقدر يغيّر دور لأي حد (إلا إنه يعمل owner)
    //   - owner بس اللي يقدر يعمل owner أو يغيّر owner تاني
    const newRole = body.role
    if (newRole) {
      // مش مسموح لأي حد (حتى owner) إنه يغيّر دوره هو نفسه
      if (id === currentUser.id && newRole !== currentUser.role) {
        return NextResponse.json(
          { error: 'لا يمكنك تغيير دورك الخاص' },
          { status: 403 }
        )
      }
      // بس owner يقدر يعمل/يشيل owner
      if (newRole === 'owner' && currentUser.role !== 'owner') {
        return NextResponse.json(
          { error: 'Forbidden — only owners can assign owner role' },
          { status: 403 }
        )
      }
      // admin ما يقدرش يغيّر owner تاني
      if (target.role === 'owner' && currentUser.role !== 'owner') {
        return NextResponse.json(
          { error: 'Forbidden — only owners can modify other owners' },
          { status: 403 }
        )
      }
    }

    const updateData: Record<string, unknown> = {}
    const allowed = ['username', 'email', 'avatarUrl', 'bio', 'role']
    for (const field of allowed) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    // كلمة المرور الجديدة (لو موجودة)
    if (body.password) {
      updateData.password = await hashPassword(body.password)
    }

    await db.user.update({ where: { id }, data: updateData })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[admin/users/[id] PUT] failed:', err)
    const status = (err as { status?: number })?.status || 500
    const message = err instanceof Error ? err.message : 'Failed to update user'
    return NextResponse.json({ error: message }, { status })
  }
}

// DELETE /api/admin/users/[id] — حذف مستخدم
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await requireAdmin()
    const { id } = await params

    if (id === currentUser.id) {
      return NextResponse.json(
        { error: 'لا يمكنك حذف حسابك الخاص' },
        { status: 403 }
      )
    }

    const target = await db.user.findUnique({ where: { id }, select: { role: true } })
    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // admin ما يقدرش يحذف owner
    if (target.role === 'owner' && currentUser.role !== 'owner') {
      return NextResponse.json(
        { error: 'Forbidden — only owners can delete owners' },
        { status: 403 }
      )
    }

    await db.user.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[admin/users/[id] DELETE] failed:', err)
    const status = (err as { status?: number })?.status || 500
    return NextResponse.json({ error: 'Failed to delete user' }, { status })
  }
}
