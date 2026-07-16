'use client'

import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search as SearchIcon, Package } from 'lucide-react'
import Link from 'next/link'
import { ModCard, ModCardSkeleton } from '@/components/mod-card'
import { useFetch } from '@/hooks/use-fetch'
import { useDocumentTitle } from '@/hooks/use-document-title'
import type { SearchResponse } from '@/lib/types'

export function SearchPage() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''

  useDocumentTitle(q ? `بحث: ${q}` : 'بحث')

  const url = useMemo(() => `/api/search?q=${encodeURIComponent(q)}&limit=24`, [q])
  const { data, loading } = useFetch<SearchResponse>(url, [q])

  const totalResults = data?.mods?.length ?? 0

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 lg:px-6" dir="rtl">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <SearchIcon className="h-4 w-4" />
          نتائج البحث
        </div>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          {q ? <>&quot;{q}&quot;</> : 'بحث'}
        </h1>
        <p className="mt-1 text-muted-foreground" aria-live="polite">
          {loading ? 'جارٍ البحث…' : `${totalResults} نتيجة`}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <ModCardSkeleton key={i} />)}
        </div>
      ) : totalResults === 0 ? (
        <div className="grid place-items-center py-20 text-center">
          <SearchIcon className="mb-3 h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold">لا توجد نتائج</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            جرّب كلمات أخرى أو تصفّح{' '}
            <Link href="/" className="text-primary hover:underline">الصفحة الرئيسية</Link>
          </p>
        </div>
      ) : (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <Package className="h-5 w-5 text-primary" aria-hidden="true" />
            التعريبات ({totalResults})
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {data?.mods.map((m) => <ModCard key={m.id} mod={m} />)}
          </div>
        </section>
      )}
    </div>
  )
}
