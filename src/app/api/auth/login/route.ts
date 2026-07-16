import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  verifyPassword,
  createToken,
  setSessionCookie,
  getSession,
  hashPassword,
} from '@/lib/auth'

const OWNER_USERNAME = 'GADMIx'
const OWNER_EMAIL = 'owner@games-arabic.com'
const OWNER_PASSWORD = 'GA@dm!n2026#S3cure'

async function ensureOwnerExists() {
  const existing = await db.user.findFirst({ where: { role: 'owner' } })
  if (existing) return
  const hash = await hashPassword(OWNER_PASSWORD)
  await db.user.create({
    data: {
      username: OWNER_USERNAME,
      email: OWNER_EMAIL,
      password: hash,
      role: 'owner',
      bio: 'مالك و مؤسس منصة ألعاب بالعربي',
    },
  })
}

// POST /api/auth/login — تسجيل الدخول
export async function POST(req: NextRequest) {
  try {
    await ensureOwnerExists()

    const body = await req.json().catch(() => ({}))
    const username = (body?.username || '').trim()
    const password = body?.password || ''

    if (!username || !password) {
      return NextResponse.json(
        { error: 'اسم المستخدم وكلمة المرور مطلوبان' },
        { status: 400 }
      )
    }

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

    const valid = await verifyPassword(password, user.password)

    if (!valid) {
      return NextResponse.json(
        { error: 'بيانات الدخول غير صحيحة' },
        { status: 401 }
      )
    }

    if (user.role === 'member') {
      return NextResponse.json(
        { error: 'لا تملك صلاحية الوصول إلى لوحة التحكم' },
        { status: 403 }
      )
    }

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
