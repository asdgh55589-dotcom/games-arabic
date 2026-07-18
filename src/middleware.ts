/**
 * middleware.ts — حماية الـ routes الخاصة بلوحة التحكم + تحديث Supabase session.
 *
 * مهم: الـ middleware بيشتغل في Edge runtime، فمينفعش نستورد Prisma أو أي
 * Node-only module هنا. بنستورد بس دوال JWT من jose مباشرة + Supabase SSR.
 *
 *   - /admin/*         → لازم يكون مسجّل دخول (moderator أو أعلى) — admin JWT
 *   - /api/admin/*     → نفس الشرط
 *   - /admin/login     → مسموح للجميع (للتسجيل)
 *   - /api/auth/login  → مسموح للجميع
 *   - باقي الـ routes → Supabase session refresh
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { updateSession } from '@/lib/supabase/middleware'

const SESSION_COOKIE_NAME = 'ga_admin_session'
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-dev-secret-change-in-production'
)

const PUBLIC_ADMIN_PATHS = ['/admin/login']

/** قراءة الـ token من Request cookies + verify (Edge-compatible) */
async function getSessionFromRequest(req: NextRequest): Promise<{ role: string } | null> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return { role: payload.role as string }
  } catch {
    return null
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // حماية /admin/* (مش /admin/login)
  if (pathname.startsWith('/admin') && !PUBLIC_ADMIN_PATHS.includes(pathname)) {
    const user = await getSessionFromRequest(req)
    if (!user) {
      const loginUrl = new URL('/admin/login', req.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
    // مش moderator أو أعلى → redirect لـ /admin/login مع رسالة خطأ
    if (user.role !== 'moderator' && user.role !== 'admin' && user.role !== 'owner') {
      const loginUrl = new URL('/admin/login', req.url)
      loginUrl.searchParams.set('error', 'insufficient_role')
      return NextResponse.redirect(loginUrl)
    }
  }

  // حماية /api/admin/* (مش /api/auth/*)
  if (pathname.startsWith('/api/admin')) {
    const user = await getSessionFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (user.role !== 'moderator' && user.role !== 'admin' && user.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden — insufficient role' }, { status: 403 })
    }
  }

  // تحديث Supabase session لباقي الـ routes
  const { response } = await updateSession(req)
  return response
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
}
