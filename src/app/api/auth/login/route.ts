import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  verifyPassword,
  createToken,
  setSessionCookie,
  getSession,
} from '@/lib/auth'

// POST /api/auth/login — تسجيل الدخول
//
// Body: { username: string, password: string }
// Response: { user: SessionUser }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const username = (body?.username || '').trim()
    const password = body?.password || ''

    if (!username || !password) {
      return NextResponse.json(
        { error: 'اسم المستخدم وكلمة المرور مطلوبان' },
        { status: 400 }
      )
    }

    // بحث عن المستخدم بـ username أو email
    const user = await db.user.findFirst({
      where: {
        OR: [
          { username: { equals: username } },
          { email: { equals: username.toLowerCase() } },
        ],
      },
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'بيانات الدخول غير صحيحة' },
        { status: 401 }
      )
    }

    // التحقق من كلمة المرور
    const valid = await verifyPassword(password, user.password)

    if (!valid) {
      return NextResponse.json(
        { error: 'بيانات الدخول غير صحيحة' },
        { status: 401 }
      )
    }

    // التأكد إن المستخدم له صلاحية دخول لوحة التحكم
    if (user.role === 'member') {
      return NextResponse.json(
        { error: 'لا تملك صلاحية الوصول إلى لوحة التحكم' },
        { status: 403 }
      )
    }

    // إنشاء token وحفظه في cookie
    const token = await createToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    })

    await setSessionCookie(token)

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    })
  } catch (err) {
    console.error('[auth/login] failed:', err)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تسجيل الدخول' },
      { status: 500 }
    )
  }
}

// GET /api/auth/me — المستخدم الحالي
export async function GET() {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 })
    }
    return NextResponse.json({ user })
  } catch (err) {
    console.error('[auth/me] failed:', err)
    return NextResponse.json({ user: null }, { status: 200 })
  }
}
