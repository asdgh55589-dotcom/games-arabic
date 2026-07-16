import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

// GET /api/auth/me — المستخدم الحالي
//
// يرجّع بيانات المستخدم المسجّل دخوله أو null لو مش مسجّل.
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
