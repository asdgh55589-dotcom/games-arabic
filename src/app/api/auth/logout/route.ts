import { NextResponse } from 'next/server'
import { clearSessionCookie } from '@/lib/auth'

// POST /api/auth/logout — تسجيل الخروج
export async function POST() {
  try {
    await clearSessionCookie()
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[auth/logout] failed:', err)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تسجيل الخروج' },
      { status: 500 }
    )
  }
}
