'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Package,
  Gamepad2,
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatNumber, formatArabicDate, timeAgo } from '@/lib/format'

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

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading || !data) {
    return (
      <div className="grid place-items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const statsCards = [
    { label: 'التعريبات',    value: data.stats.mods,        icon: Package,        href: '/admin/mods' },
    { label: 'الألعاب',      value: data.stats.games,       icon: Gamepad2,       href: '/admin/games' },
    { label: 'المستخدمون',   value: data.stats.users,       icon: Users,          href: '/admin/users' },
    { label: 'التحميلات',    value: data.stats.downloads,   icon: Download,       href: '/admin/mods' },
    { label: 'التأييدات',    value: data.stats.endorsements,icon: ThumbsUp,       href: '/admin/mods' },
    { label: 'التعليقات',    value: data.stats.comments,    icon: MessageSquare,  href: '/admin/mods' },
    { label: 'مميّزة',       value: data.stats.featured,    icon: Star,           href: '/admin/mods' },
    { label: 'رائجة',        value: data.stats.trending,    icon: Flame,          href: '/admin/mods' },
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
                <Icon className="h-4 w-4 text-primary" />
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
