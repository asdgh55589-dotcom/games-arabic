'use client'

import Link from 'next/link'
import { Package } from 'lucide-react'
import { useFetch } from '@/hooks/use-fetch'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { formatNumber } from '@/lib/format'
import type { SeriesSummary } from '@/lib/types'

interface SeriesData {
  series: SeriesSummary[]
}

export function SeriesPage() {
  useDocumentTitle('سلاسل التعريبات')
  const { data, loading } = useFetch<SeriesData>('/api/series')

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 lg:px-6" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">سلاسل التعريبات</h1>
        <p className="mt-1 text-muted-foreground">
          اختر سلسلة لعرض جميع التعريبات الخاصة بها
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : !data?.series || data.series.length === 0 ? (
        <div className="grid place-items-center py-20 text-center">
          <Package className="mb-3 h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold">لا توجد سلاسل</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.series.map((s) => (
            <Link
              key={s.name}
              href={`/?view=series-detail&series=${encodeURIComponent(s.name)}`}
              className="group relative flex h-24 items-center justify-between overflow-hidden rounded-lg border border-border bg-card p-4 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
            >
              {s.thumbnailUrl && (
                <img
                  src={s.thumbnailUrl}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover opacity-35 transition-opacity group-hover:opacity-50"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-card via-card/75 to-card/40" />
              <div className="relative">
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary">{s.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatNumber(s.count)} تعريب · {formatNumber(s.downloads)} تحميل
                </p>
              </div>
              <Package className="relative h-8 w-8 text-muted-foreground/30 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
