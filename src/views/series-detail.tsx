'use client'

import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Package, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { ModCard, ModCardSkeleton } from '@/components/mod-card'
import { useFetch } from '@/hooks/use-fetch'
import { useDebounced } from '@/hooks/use-debounced'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { formatNumber } from '@/lib/format'
import type { PaginatedMods } from '@/lib/types'

export function SeriesDetailPage() {
  const searchParams = useSearchParams()
  const seriesName = searchParams.get('series') || ''
  useDocumentTitle(seriesName || 'سلسلة التعريبات')

  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('downloads')
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebounced(search, 250)

  const url = useMemo(() => {
    if (!seriesName) return null
    const params = new URLSearchParams()
    params.set('series', seriesName)
    params.set('sort', sort)
    params.set('page', String(page))
    params.set('limit', '24')
    if (debouncedSearch) params.set('search', debouncedSearch)
    return `/api/series/mods?${params.toString()}`
  }, [seriesName, sort, page, debouncedSearch])

  const { data, loading } = useFetch<PaginatedMods>(url, [url])

  const filterKey = `${seriesName}:${debouncedSearch}:${sort}`
  const [lastFilterKey, setLastFilterKey] = useState(filterKey)
  if (filterKey !== lastFilterKey) {
    setLastFilterKey(filterKey)
    setPage(1)
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 lg:px-6" dir="rtl">
      {/* مسار التنقل */}
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/?view=series" className="hover:text-foreground">سلاسل التعريبات</Link>
        <ArrowRight className="h-4 w-4 rotate-180" />
        <span className="text-foreground">{seriesName}</span>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{seriesName}</h1>
        <p className="mt-1 text-muted-foreground">
          {data ? `${formatNumber(data.total)} تعريب` : 'جارٍ التحميل…'}
        </p>
      </div>

      {/* الفلاتر */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن التعريبات…"
            aria-label="ابحث عن التعريبات"
            className="h-10 pr-10"
          />
        </div>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="h-10 w-[160px]" aria-label="ترتيب">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="downloads">الأكثر تحميلاً</SelectItem>
            <SelectItem value="endorsements">الأكثر تأييداً</SelectItem>
            <SelectItem value="newest">الأحدث</SelectItem>
            <SelectItem value="updated">المحدّثة حديثاً</SelectItem>
            <SelectItem value="views">الأكثر مشاهدة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* الشبكة */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <ModCardSkeleton key={i} />)}
        </div>
      ) : (data?.mods?.length ?? 0) === 0 ? (
        <div className="grid place-items-center py-20 text-center">
          <Package className="mb-3 h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold">لا توجد تعريبات</h3>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {data?.mods?.map((m) => <ModCard key={m.id} mod={m} />)}
          </div>
          {data && data.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>السابق</Button>
              <span className="text-sm text-muted-foreground" aria-live="polite">صفحة {page} من {data.totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>التالي</Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
