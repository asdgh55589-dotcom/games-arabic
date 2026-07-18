import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/auth/sync-user — مزامنة بيانات المستخدم من Supabase Auth إلى Neon DB
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { supabaseUserId, username, email } = body

    if (!supabaseUserId || !username || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // البحث عن المستخدم بـ supabaseId أو بالبريد الإلكتروني
    let user = await db.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
        ],
      },
    })

    if (user) {
      // تحديث بيانات المستخدم الموجود
      user = await db.user.update({
        where: { id: user.id },
        data: {
          supabaseId: supabaseUserId,
          username,
          email: email.toLowerCase(),
        },
      })
    } else {
      // إنشاء مستخدم جديد
      user = await db.user.create({
        data: {
          supabaseId: supabaseUserId,
          username,
          email: email.toLowerCase(),
          role: 'member',
        },
      })
    }

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
    console.error('[sync-user] failed:', err)
    return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 })
  }
}
