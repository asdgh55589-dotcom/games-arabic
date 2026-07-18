'use client'

import Link from 'next/link'
import { Users } from 'lucide-react'
import { useFetch } from '@/hooks/use-fetch'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { formatNumber } from '@/lib/format'

interface TeamData {
  name: string
  count: number
  downloads: number
  endorsements: number
  thumbnailUrl: string
}

interface TeamsResponse {
  teams: TeamData[]
}

export function TranslationTeamsPage() {
  useDocumentTitle('فرق التعريب')
  const { data, loading } = useFetch<TeamsResponse>('/api/teams')

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 lg:px-6" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">فرق التعريب</h1>
        <p className="mt-1 text-muted-foreground">
          اختر فريقاً لعرض جميع التعريبات التي قدّموها
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : !data?.teams || data.teams.length === 0 ? (
        <div className="grid place-items-center py-20 text-center">
          <Users className="mb-3 h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold">لا توجد فرق تعريب</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.teams.map((t) => (
            <Link
              key={t.name}
              href={`/?view=search&translationTeam=${encodeURIComponent(t.name)}`}
              className="group relative flex h-24 items-center justify-between overflow-hidden rounded-lg border border-border bg-card p-4 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
            >
              {t.thumbnailUrl && (
                <img
                  src={t.thumbnailUrl}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover opacity-35 transition-opacity group-hover:opacity-50"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-card via-card/75 to-card/40" />
              <div className="relative">
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary">{t.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatNumber(t.count)} تعريب · {formatNumber(t.downloads)} تحميل
                </p>
              </div>
              <Users className="relative h-8 w-8 text-muted-foreground/30 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
