/**
 * lib/auth.ts — نظام المصادقة الكامل (JWT + bcrypt + session).
 *
 * يستخدم:
 *   - bcryptjs لتشفير/التحقق من كلمات المرور
 *   - jose لإصدار/التحقق من JWT tokens (يدعم Edge runtime)
 *   - httpOnly cookies لتخزين الـ token بأمان
 *
 * الصلاحيات:
 *   - owner     → كل شيء + إدارة الأدوار + إعدادات الموقع
 *   - admin     → كل التعريبات/الألعاب + إدارة المستخدمين
 *   - moderator → نشر/تعديل التعريبات (تعريبه بس) — مش حذف
 *   - member    → مش لوحة تحكم
 */

import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { db } from './db'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-dev-secret-change-in-production'
)

const COOKIE_NAME = 'ga_admin_session'
const SESSION_DURATION = 60 * 60 * 24 * 7 // 7 أيام بالثواني

// ===== User type returned by getSession =====
export interface SessionUser {
  id: string
  username: string
  email: string
  role: string
  avatarUrl: string | null
}

// ===== Password helpers =====

/** تشفير كلمة المرور باستخدام bcrypt */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10)
}

/** التحقق من كلمة المرور مقابل الـ hash */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

// ===== JWT helpers =====

/** إصدار JWT token يحتوي بيانات المستخدم الأساسية */
export async function createToken(user: { id: string; username: string; email: string; role: string }): Promise<string> {
  return new SignJWT({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(JWT_SECRET)
}

/** التحقق من JWT token — يرجّع payload أو null */
export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return {
      id: payload.id as string,
      username: payload.username as string,
      email: payload.email as string,
      role: payload.role as string,
      avatarUrl: null,
    }
  } catch {
    return null
  }
}

// ===== Session helpers (server-side) =====

/** قراءة الـ session الحالي من الـ cookies — تستخدم في Server Components و APIs */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null

  const payload = await verifyToken(token)
  if (!payload) return null

  // تحقق إن المستخدم لسه موجود في الـ DB (مش متسحب)
  const user = await db.user.findUnique({
    where: { id: payload.id },
    select: { id: true, username: true, email: true, role: true, avatarUrl: true },
  })
  if (!user) return null

  return user
}

/** إنشاء session جديدة — بيحط الـ token في httpOnly cookie */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION,
  })
}

/** مسح الـ session — بيحذف الـ cookie */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

// ===== Authorization helpers =====

/** يتأكد إن المستخدم مسجّل دخول — يرجّع user أو يرمي redirect */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getSession()
  if (!user) {
    // في الـ middleware بنعمل redirect، لكن هنا بنرمي error عشان الـ API يرجّع 401
    throw new AuthError('Unauthorized', 401)
  }
  return user
}

/** يتأكد إن المستخدم أدمن أو أعلى (admin | owner) */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth()
  if (user.role !== 'admin' && user.role !== 'owner') {
    throw new AuthError('Forbidden — admin access required', 403)
  }
  return user
}

/** يتأكد إن المستخدم مالك فقط (owner) */
export async function requireOwner(): Promise<SessionUser> {
  const user = await requireAuth()
  if (user.role !== 'owner') {
    throw new AuthError('Forbidden — owner access required', 403)
  }
  return user
}

/** يتأكد إن المستخدم مشرف أو أعلى (moderator | admin | owner) */
export async function requireModerator(): Promise<SessionUser> {
  const user = await requireAuth()
  if (user.role !== 'moderator' && user.role !== 'admin' && user.role !== 'owner') {
    throw new AuthError('Forbidden — moderator access required', 403)
  }
  return user
}

/** فحص صلاحية: هل المستخدم يقدر يعدّل تعريب معيّن؟
 *  - admin/owner: أي تعريب
 *  - moderator: تعريبه فقط (authorId === user.id)
 */
export function canEditMod(user: SessionUser, mod: { authorId: string }): boolean {
  if (user.role === 'admin' || user.role === 'owner') return true
  if (user.role === 'moderator' && mod.authorId === user.id) return true
  return false
}

/** فحص صلاحية: هل المستخدم يقدر يحذف؟
 *  - admin/owner فقط
 */
export function canDelete(user: SessionUser): boolean {
  return user.role === 'admin' || user.role === 'owner'
}

// ===== Error class =====

export class AuthError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'AuthError'
    this.status = status
  }
}

// ===== Middleware helpers (Edge runtime compatible) =====

/** قراءة الـ token من Request cookies (للـ middleware — لا تستخدم `cookies()` من next/headers) */
export async function getSessionFromRequest(req: Request): Promise<SessionUser | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

// re-export cookie name for middleware
export const SESSION_COOKIE_NAME = COOKIE_NAME
