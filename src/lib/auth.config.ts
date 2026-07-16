/**
 * lib/auth.config.ts — إعدادات Auth.js للـ Edge runtime (middleware).
 */
import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: { signIn: '/admin/login' },
  providers: [],
  callbacks: {
    authorized({ auth, request }: any) {
      const isLoggedIn = !!auth?.user
      const isAdminPath = request.nextUrl.pathname.startsWith('/admin')
      const isAdminApi = request.nextUrl.pathname.startsWith('/api/admin')
      if (isAdminPath || isAdminApi) {
        if (request.nextUrl.pathname === '/admin/login') return true
        if (!isLoggedIn) return false
        const role = (auth?.user as { role?: string })?.role
        if (role !== 'moderator' && role !== 'admin' && role !== 'owner') return false
      }
      return true
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.role = (user as any).role || 'member'
        token.id = (user as any).id
      }
      return token
    },
    async session({ session, token }: any) {
      if (session?.user) {
        session.user.role = token.role
        session.user.id = token.id
      }
      return session
    },
  },
  session: { strategy: 'jwt' as const },
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'fallback-dev-secret',
} satisfies NextAuthConfig
