'use client'

import Link from 'next/link'
import { Package, Download, ThumbsUp, Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatNumber, timeAgo } from '@/lib/format'
import type { GameSummary } from '@/lib/types'

export type GameCardData = GameSummary

// 30 ساعة بالميلي ثانية
const THIRTY_HOURS_MS = 30 * 60 * 60 * 1000

export function GameCard({ game }: { game: GameCardData }) {
  // شارة جديد/محدّث — تختفي بعد 30 ساعة
  const now = Date.now()
  const updatedAt = new Date(game.updatedAt).getTime()
  const ageSinceUpdated = now - updatedAt

  let badge: { text: string; color: string } | null = null
  if (ageSinceUpdated < THIRTY_HOURS_MS) {
    badge = { text: `محدّث ${timeAgo(game.updatedAt)}`, color: 'bg-blue-600 text-white' }
  }

  return (
    <Card className="mod-card group relative flex min-h-[280px] flex-col overflow-hidden border-border bg-card p-0 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5" dir="rtl">
      {/* صورة landscape — مقاس 1920×1080 (16:9) */}
      <Link href={`/?view=platform&platform=${game.platform}`} className="relative block">
        <div className="relative z-0 flex aspect-video items-center justify-center overflow-hidden rounded-t bg-secondary">
          <img
            src={game.thumbnailUrl}
            alt={game.name}
            loading="lazy"
            className="mod-card-image absolute z-2 max-h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
        </div>
        {/* شارة المنصة — يسار */}
        <Badge variant="outline" className="absolute left-2 top-2 border-border bg-background/80 backdrop-blur">
          {game.platform}
        </Badge>
        {/* شارة جديد/محدّث — يمين (بدون شارة مميز) */}
        {badge && (
          <Badge className={`absolute right-2 top-2 ${badge.color} shadow-md`}>
            {badge.text}
          </Badge>
        )}
        {/* اسم اللعبة تحت الصورة */}
        <div className="absolute bottom-0 right-0 left-0 p-3">
          <h3 className="text-base font-bold leading-tight text-foreground">{game.name}</h3>
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{game.tagline}</p>
        </div>
      </Link>

      {/* قسم المحتوى */}
      <div className="flex flex-1 flex-col px-3 pb-3 pt-3">
        <div className="border-b border-border py-2">
          <span className="text-xs text-muted-foreground">صدرت {game.releaseYear}</span>
        </div>
        <div className="flex flex-col gap-y-1 py-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-x-1">
            <Package className="h-3.5 w-3.5 shrink-0" />
            <span>{formatNumber(game.modCount)} تعديل</span>
          </div>
          <div className="flex items-center gap-x-1">
            <Download className="h-3.5 w-3.5 shrink-0" />
            <span>{formatNumber(game.totalDownloads)} تحميل</span>
          </div>
          <div className="flex items-center gap-x-1">
            <ThumbsUp className="h-3.5 w-3.5 shrink-0" />
            <span>{formatNumber(game.totalEndorsements)} تأييد</span>
          </div>
        </div>
      </div>

      {/* الشريط السفلي */}
      <Link
        href={`/?view=platform&platform=${game.platform}`}
        className="mt-auto flex min-h-9 items-center justify-center gap-x-1 rounded-b bg-secondary/50 px-3 text-xs font-medium text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
      >
        تصفح التعديلات
      </Link>
    </Card>
  )
}

export function GameCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border bg-card p-0">
      <div className="aspect-video animate-pulse bg-secondary" />
      <div className="space-y-2 px-3 pb-3 pt-3">
        <div className="h-3 w-1/4 animate-pulse rounded bg-secondary" />
        <div className="space-y-1 pt-1">
          <div className="h-3 w-1/3 animate-pulse rounded bg-secondary" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-secondary" />
          <div className="h-3 w-1/4 animate-pulse rounded bg-secondary" />
        </div>
      </div>
      <div className="h-9 animate-pulse rounded-b bg-secondary" />
    </Card>
  )
}
