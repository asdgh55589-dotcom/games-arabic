'use client'

import { useEffect, useState } from 'react'
import { Loader2, Layers } from 'lucide-react'
import { formatNumber } from '@/lib/format'

interface SeriesItem {
  name: string
  count: number
  downloads: number
  endorsements: number
  thumbnailUrl: string
}

export default function AdminSeriesPage() {
  const [series, setSeries] = useState<SeriesItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/series')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => data?.series ? setSeries(data.series) : null)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="grid place-items-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">السلاسل</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {series.length} سلسلة — السلاسل بتتولّد تلقائياً من تعريبات المنصات
        </p>
      </div>

      {series.length === 0 ? (
        <div className="grid place-items-center py-20 text-center">
          <Layers className="mb-3 h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold">لا توجد سلاسل</h3>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-right">
            <thead className="border-b border-border bg-card/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">السلسلة</th>
                <th className="px-4 py-3 font-semibold">التعريبات</th>
                <th className="hidden px-4 py-3 font-semibold sm:table-cell">التحميلات</th>
                <th className="hidden px-4 py-3 font-semibold md:table-cell">التأييدات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {series.map((s) => (
                <tr key={s.name} className="text-sm transition-colors hover:bg-accent/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.thumbnailUrl} alt="" className="h-8 w-12 rounded object-cover" />
                      <span className="font-medium">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">{s.count}</td>
                  <td className="hidden px-4 py-3 text-xs sm:table-cell">{formatNumber(s.downloads)}</td>
                  <td className="hidden px-4 py-3 text-xs md:table-cell">{formatNumber(s.endorsements)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
