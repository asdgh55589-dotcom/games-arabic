import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'

// GET /api/auth/me — المستخدم الحالي (يتحقق من Supabase session)
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user: supabaseUser } } = await supabase.auth.getUser()

    if (!supabaseUser) {
      return NextResponse.json({ user: null })
    }

    // البحث عن الملف الشخصي في Neon DB
    const user = await db.user.findFirst({
      where: {
        OR: [
          { supabaseId: supabaseUser.id },
          { email: supabaseUser.email || '' },
        ],
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatarUrl: true,
        bannerUrl: true,
        bio: true,
        joinedAt: true,
      },
    })

    if (!user) {
      // المستخدم جديد — أنشئ ملف شخصي
      const newUser = await db.user.create({
        data: {
          supabaseId: supabaseUser.id,
          username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || 'مستخدم',
          email: supabaseUser.email || '',
          role: 'member',
        },
      })
      return NextResponse.json({
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          avatarUrl: newUser.avatarUrl,
        },
      })
    }

    return NextResponse.json({ user })
  } catch (err) {
    console.error('[auth/me] failed:', err)
    return NextResponse.json({ user: null })
  }
}
