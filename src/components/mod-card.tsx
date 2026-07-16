'use client'

import Link from 'next/link'
import { Clock, Tag, MoreVertical } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { timeAgo, formatArabicDate } from '@/lib/format'
import { translateGameName } from '@/lib/arabic-names'
import { ModStatsCompact } from '@/components/mod-stats'
import type { ModSummary } from '@/lib/types'

export type ModCardData = ModSummary

// 24 ساعة — بعدها تختفي شارة "جديد" / "تم التحديث"
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000

export function ModCard({ mod, compact = false }: { mod: ModCardData; compact?: boolean }) {
  const href = `/?view=mod&slug=${mod.slug}`

  const now = Date.now()
  const ageSinceCreated = now - new Date(mod.createdAt).getTime()
  const ageSinceUpdated = now - new Date(mod.updatedAt).getTime()

  let statusBadge: { text: string; color: string } | null = null
  if (ageSinceCreated < TWENTY_FOUR_HOURS_MS) {
    statusBadge = { text: 'جديد', color: 'bg-green-600 text-white' }
  } else if (ageSinceUpdated < TWENTY_FOUR_HOURS_MS) {
    statusBadge = { text: 'تم التحديث', color: 'bg-blue-600 text-white' }
  }

  const platform = mod.game?.platform || ''

  return (
    <Card dir="rtl" className="mod-card group relative flex min-h-[380px] flex-col overflow-hidden border-border bg-card p-0 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
      {/* ===== الصورة — مكبّرة، والمحتوى (العنوان ثم صورة الناشر) ملتحم فوقها ===== */}
      <Link href={href} className="relative block">
        <div className="relative z-0 aspect-[16/11] w-full overflow-hidden bg-secondary">
          <img
            src={mod.thumbnailUrl}
            alt={mod.name}
            loading="lazy"
            className="mod-card-image absolute inset-0 z-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* تدرّج غامق يغطي ثلثي الصورة تقريباً عشان العنوان وصورة الناشر يبانوا بوضوح فوقها */}
          <div className="absolute inset-x-0 bottom-0 z-[1] h-3/4 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />
        </div>

        {/* الشارات أعلى الصورة: المنصة + اللعبة + جديد/تم التحديث */}
        <div className="absolute inset-x-2 top-2 z-10 flex flex-wrap items-center gap-1.5">
          {platform && (
            <Badge variant="outline" className="border-white/20 bg-background/70 backdrop-blur shadow-md">
              {platform}
            </Badge>
          )}
          <Badge variant="outline" className="border-white/20 bg-background/70 text-muted-foreground backdrop-blur shadow-md">
            {translateGameName(mod.game.name)}
          </Badge>
          {statusBadge && (
            <Badge className={`${statusBadge.color} shadow-md`}>{statusBadge.text}</Badge>
          )}
        </div>

        {/* المحتوى الملتحم فوق الصورة: 1) العنوان  2) صورة الناشر + اسمه */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-3">
          <h3 className="line-clamp-2 text-base font-bold leading-tight text-white drop-shadow-md transition-colors group-hover:text-primary">
            {mod.name}
          </h3>
          {mod.author && (
            <span className="mt-1.5 flex items-center gap-1.5 text-xs text-white/85">
              {mod.author.avatarUrl && (
                <img
                  src={mod.author.avatarUrl}
                  alt=""
                  className="h-5 w-5 shrink-0 rounded-full object-cover ring-1 ring-white/50"
                  loading="lazy"
                />
              )}
              <span className="truncate">بواسطة {mod.author.username}</span>
            </span>
          )}
        </div>
      </Link>

      {/* زر الخيارات */}
      <button
        className="absolute left-1.5 top-1.5 z-10 grid h-7 w-7 place-items-center rounded-full bg-background/60 text-white opacity-0 backdrop-blur transition-opacity hover:text-primary group-hover:opacity-100 focus:opacity-100"
        aria-label="خيارات التعديل"
        onClick={(e) => e.preventDefault()}
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {/* المحتوى تحت الصورة — 3) الوصف مباشرة (بدون أي عنوان/شرح فاصل) */}
      <div className="flex flex-1 flex-col gap-2.5 px-3 pb-2 pt-2.5">
        {!compact && (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {mod.summary}
          </p>
        )}

        {/* 4) البيانات — على شكل شارات (pills) نظيفة، بنفس أسلوب صفحة التفاصيل */}
        <div className="flex flex-wrap items-center gap-1.5">
          <MetaPill icon={<Clock className="h-3 w-3" />} text={timeAgo(mod.updatedAt)} />
          <MetaPill icon={<Tag className="h-3 w-3" />} text={`v${mod.version}`} />
          <span className="hidden text-[11px] text-muted-foreground/60 sm:inline">
            {formatArabicDate(mod.releaseDate)}
          </span>
        </div>
      </div>

      {/* الشريط السفلي — نظام الإحصائيات الموحّد */}
      <ModStatsCompact mod={mod} />
    </Card>
  )
}

function MetaPill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="flex items-center gap-1 rounded-full border border-border bg-secondary/60 px-2 py-0.5 text-[11px] text-muted-foreground">
      {icon}
      {text}
    </span>
  )
}

export function ModCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border bg-card p-0">
      <div className="aspect-[16/11] animate-pulse bg-secondary" />
      <div className="space-y-2 px-3 pb-2 pt-2.5">
        <div className="h-3 w-4/5 animate-pulse rounded bg-secondary" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-secondary" />
        <div className="flex gap-1.5 pt-1">
          <div className="h-5 w-16 animate-pulse rounded-full bg-secondary" />
          <div className="h-5 w-12 animate-pulse rounded-full bg-secondary" />
        </div>
      </div>
      <div className="h-9 animate-pulse rounded-b bg-secondary" />
    </Card>
  )
}
