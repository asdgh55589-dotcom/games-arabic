import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { hashPassword } from '@/lib/auth'

// GET /api/admin/users — قائمة المستخدمين
export async function GET() {
  try {
    await requireAdmin()
    const users = await db.user.findMany({
      orderBy: { joinedAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        bio: true,
        role: true,
        joinedAt: true,
        _count: { select: { mods: true } },
      },
    })
    return NextResponse.json({ users })
  } catch (err) {
    console.error('[admin/users GET] failed:', err)
    const status = (err as { status?: number })?.status || 500
    return NextResponse.json({ error: 'Failed' }, { status })
  }
}

// POST /api/admin/users — إنشاء مستخدم جديد (admin/owner)
export async function POST(req: NextRequest) {
  try {
    const currentUser = await requireAdmin()
    const body = await req.json()

    if (!body.username || !body.email || !body.password) {
      return NextResponse.json({ error: 'username, email, password مطلوبة' }, { status: 400 })
    }

    // التحقق من عدم التكرار
    const existing = await db.user.findFirst({
      where: {
        OR: [{ username: body.username }, { email: body.email }],
      },
    })
    if (existing) {
      return NextResponse.json({ error: 'اسم المستخدم أو البريد مستخدم بالفعل' }, { status: 400 })
    }

    // الصلاحيات: بس owner يقدر ينشئ admin/owner
    const role = body.role || 'member'
    if ((role === 'admin' || role === 'owner') && currentUser.role !== 'owner') {
      return NextResponse.json(
        { error: 'Forbidden — only owners can create admin/owner accounts' },
        { status: 403 }
      )
    }

    const passwordHash = await hashPassword(body.password)
    const user = await db.user.create({
      data: {
        username: body.username,
        email: body.email,
        password: passwordHash,
        avatarUrl: body.avatarUrl || null,
        bio: body.bio || null,
        role,
      },
      select: { id: true, username: true, email: true, role: true, avatarUrl: true },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (err) {
    console.error('[admin/users POST] failed:', err)
    const status = (err as { status?: number })?.status || 500
    const message = err instanceof Error ? err.message : 'Failed to create user'
    return NextResponse.json({ error: message }, { status })
  }
}
