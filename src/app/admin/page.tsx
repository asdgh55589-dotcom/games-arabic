'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Package,
  Users,
  Download,
  ThumbsUp,
  MessageSquare,
  Star,
  Flame,
  TrendingUp,
  Crown,
  Loader2,
  Plus,
  Layers,
  Megaphone,
  ScrollText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatNumber, timeAgo } from '@/lib/format'

interface DashboardData {
  stats: {
    games: number
    mods: number
    users: number
    downloads: number
    endorsements: number
    comments: number
    featured: number
    trending: number
    series: number
  }
  recent: {
    mods: Array<{
      id: string
      name: string
      slug: string
      createdAt: string
      game: { name: string; platform: string }
    }>
    users: Array<{
      id: string
      username: string
      avatarUrl: string | null
      role: string
      joinedAt: string
    }>
    comments: Array<{
      id: string
      text: string
      createdAt: string
      guestName: string
      mod: { name: string; slug: string }
    }>
  }
}

const ROLE_BADGE: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  owner:     { label: 'مالك',  className: 'bg-amber-500 text-white',     icon: <Crown className="h-3 w-3" /> },
  admin:     { label: 'مدير',   className: 'bg-red-500 text-white',       icon: <Star className="h-3 w-3" /> },
  moderator: { label: 'مشرف',   className: 'bg-purple-500 text-white',    icon: <Star className="h-3 w-3" /> },
  member:    { label: 'عضو',    className: 'bg-blue-500 text-white',      icon: <Users className="h-3 w-3" /> },
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load')
        return r.json()
      })
      .then((d) => setData(d))
      .catch(() => setError('فشل تحميل بيانات الداشبورد'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid place-items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid place-items-center py-20 text-center">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  if (!data) return null

  const statsCards = [
    { label: 'التعريبات',     value: data.stats.mods,         icon: Package,       href: '/admin/mods',          color: 'text-primary' },
    { label: 'المستخدمون',    value: data.stats.users,        icon: Users,         href: '/admin/users',         color: 'text-blue-500' },
    { label: 'التحميلات',     value: data.stats.downloads,    icon: Download,      href: '/admin/mods',          color: 'text-green-500' },
    { label: 'التأييدات',     value: data.stats.endorsements, icon: ThumbsUp,      href: '/admin/endorsements',  color: 'text-amber-500' },
    { label: 'التعليقات',     value: data.stats.comments,     icon: MessageSquare, href: '/admin/comments',      color: 'text-purple-500' },
    { label: 'مميّزة',        value: data.stats.featured,     icon: Star,          href: '/admin/mods',          color: 'text-amber-400' },
    { label: 'رائجة',         value: data.stats.trending,     icon: Flame,         href: '/admin/mods',          color: 'text-orange-500' },
    { label: 'السلاسل',       value: data.stats.series,        icon: Layers,        href: '/admin/series',        color: 'text-cyan-500' },
  ]

  const quickActions = [
    { label: 'نشر تعريب', icon: Package, href: '/admin/mods/new', color: 'bg-primary hover:bg-primary/90' },
    { label: 'إضافة إعلان', icon: Megaphone, href: '/admin/ads', color: 'bg-purple-600 hover:bg-purple-700' },
    { label: 'إدارة التعليقات', icon: MessageSquare, href: '/admin/comments', color: 'bg-amber-600 hover:bg-amber-700' },
    { label: 'سجل النشاطات', icon: ScrollText, href: '/admin/audit', color: 'bg-zinc-700 hover:bg-zinc-600' },
  ]

  return (
    <div className="space-y-8">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">لوحة التحكم</h1>
          <p className="mt-1 text-sm text-muted-foreground">نظرة عامة على إحصائيات الموقع وآخر النشاطات</p>
        </div>
        <Button asChild>
          <Link href="/admin/mods/new">
            <Plus className="ml-2 h-4 w-4" />
            نشر تعريب جديد
          </Link>
        </Button>
      </div>

      {/* أزرار الإجراءات السريعة */}
      <div className="flex flex-wrap gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.label}
              href={action.href}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-all ${action.color} shadow-lg shadow-primary/10`}
            >
              <Icon className="h-4 w-4" />
              {action.label}
            </Link>
          )
        })}
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{stat.label}</span>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div className="mt-2 text-2xl font-bold text-foreground">
                {formatNumber(stat.value)}
              </div>
            </Link>
          )
        })}
      </div>

      {/* آخر النشاطات */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* آخر التعريبات */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-4 flex items-center justify-between border-b border-border pb-2">
            <h2 className="flex items-center gap-2 text-sm font-bold">
              <TrendingUp className="h-4 w-4 text-primary" />
              آخر التعريبات المنشورة
            </h2>
          </div>
          <div className="space-y-3">
            {data.recent.mods.map((mod) => (
              <Link
                key={mod.id}
                href={`/admin/mods/${mod.id}/edit`}
                className="block rounded-md p-2 transition-colors hover:bg-accent/50"
              >
                <div className="truncate text-sm font-medium">{mod.name}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {mod.game.name} · {timeAgo(mod.createdAt)}
                </div>
              </Link>
            ))}
            {data.recent.mods.length === 0 && (
              <p className="text-sm text-muted-foreground">لا توجد تعريبات بعد</p>
            )}
          </div>
        </div>

        {/* آخر المستخدمين */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-4 flex items-center justify-between border-b border-border pb-2">
            <h2 className="flex items-center gap-2 text-sm font-bold">
              <Users className="h-4 w-4 text-primary" />
              آخر المستخدمين المسجّلين
            </h2>
          </div>
          <div className="space-y-3">
            {data.recent.users.map((u) => {
              const role = ROLE_BADGE[u.role] || ROLE_BADGE.member
              return (
                <div key={u.id} className="flex items-center gap-2">
                  {u.avatarUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={u.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{u.username}</div>
                    <div className="text-xs text-muted-foreground">{timeAgo(u.joinedAt)}</div>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${role.className}`}>
                    {role.icon}
                    {role.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* آخر التعليقات */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-4 flex items-center justify-between border-b border-border pb-2">
            <h2 className="flex items-center gap-2 text-sm font-bold">
              <MessageSquare className="h-4 w-4 text-primary" />
              آخر التعليقات
            </h2>
          </div>
          <div className="space-y-3">
            {data.recent.comments.map((c) => (
              <Link
                key={c.id}
                href={`/?view=mod&slug=${c.mod.slug}`}
                target="_blank"
                className="block rounded-md p-2 transition-colors hover:bg-accent/50"
              >
                <div className="truncate text-sm font-medium">{c.guestName}</div>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{c.text}</p>
                <div className="mt-0.5 text-[11px] text-muted-foreground/70">
                  على {c.mod.name} · {timeAgo(c.createdAt)}
                </div>
              </Link>
            ))}
            {data.recent.comments.length === 0 && (
              <p className="text-sm text-muted-foreground">لا توجد تعليقات بعد</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
