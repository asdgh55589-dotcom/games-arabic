import Link from 'next/link'
import { formatNumber } from '@/lib/format'
import type { SeriesSummary } from '@/lib/types'

/** بطاقة سلسلة موحّدة — نفس الشكل بالظبط في الصفحة الرئيسية وصفحة "سلاسل التعريبات"،
 *  عشان مايبقاش فيه قالبين مختلفين لنفس نوع البطاقة في الموقع. */
export function SeriesCard({ series }: { series: SeriesSummary }) {
  return (
    <Link
      href={`/?view=series-detail&series=${encodeURIComponent(series.name)}`}
      className="group relative flex h-32 flex-col justify-end overflow-hidden rounded-lg border border-border bg-card p-3 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
    >
      <img
        src={series.thumbnailUrl}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-40 transition-opacity group-hover:opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/70 to-transparent" />
      <div className="relative">
        <h3 className="line-clamp-1 text-sm font-bold text-foreground group-hover:text-primary">
          {series.name}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatNumber(series.count)} تعريب
        </p>
      </div>
    </Link>
  )
}

export function SeriesCardSkeleton() {
  return <div className="h-32 animate-pulse rounded-lg bg-secondary" />
}
