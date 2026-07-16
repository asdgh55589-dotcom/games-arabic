'use client'

import { forwardRef } from 'react'
import Link from 'next/link'
import { Flame, Heart, Zap, ThumbsUp, Download, Eye } from 'lucide-react'
import { formatNumber } from '@/lib/format'
import type { ModSummary } from '@/lib/types'

/**
 * variant — يحدد البيانات الإضافية المعروضة في كل عنصر بالشريط الجانبي.
 * - `latest`: شارة جديد/محدّث + التقييم + التحميلات
 * - `trending`: التحميلات + المشاهدات
 * - `topEndorsed`: التأييدات بس
 */
type SidebarVariant = 'latest' | 'trending' | 'topEndorsed'

// 30 ساعة بالميلي ثانية — الشارة تختفي بعد هذا الوقت
const THIRTY_HOURS_MS = 30 * 60 * 60 * 1000

/**
 * SidebarItem — عنصر واحد في الشريط الجانبي.
 * تصميم أكبر شوية من الـ dropdown: صورة أكبر + اسم أوضح + المنصة + بيانات إضافية.
 * البيانات الإضافية تختلف حسب variant (القسم).
 */
function SidebarItem({ mod, variant }: { mod: ModSummary; variant: SidebarVariant }) {
  // حساب شارة جديد/محدّث (للأقسام اللي بتعمل variant=latest)
  const now = Date.now()
  const createdAt = new Date(mod.createdAt).getTime()
  const updatedAt = new Date(mod.updatedAt).getTime()
  const ageSinceCreated = now - createdAt
  const ageSinceUpdated = now - updatedAt

  let statusBadge: { text: string; color: string } | null = null
  if (ageSinceCreated < THIRTY_HOURS_MS) {
    statusBadge = { text: 'جديد', color: 'bg-green-600 text-white' }
  } else if (ageSinceUpdated < THIRTY_HOURS_MS && ageSinceUpdated !== ageSinceCreated) {
    statusBadge = { text: 'محدّث', color: 'bg-blue-600 text-white' }
  }

  return (
    <Link
      href={`/?view=mod&slug=${mod.slug}`}
      className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-accent"
    >
      <img
        src={mod.thumbnailUrl}
        alt={mod.name}
        loading="lazy"
        className="h-12 w-16 shrink-0 rounded object-cover"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="line-clamp-2 text-sm font-medium leading-tight text-foreground">
          {mod.name}
        </span>
        <span className="text-xs text-muted-foreground">
          {mod.game?.platform || ''}
        </span>
        {/* البيانات الإضافية — تختلف حسب القسم (variant) */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
          {variant === 'latest' && (
            <>
              {/* شارة جديد/محدّث + اللايكات + التحميلات */}
              {statusBadge && (
                <span className={`rounded px-1 py-0.5 text-[9px] font-bold ${statusBadge.color}`}>
                  {statusBadge.text}
                </span>
              )}
              <span className="flex items-center gap-0.5" title="التأييدات">
                <ThumbsUp className="h-3.5 w-3.5 text-primary" />
                {formatNumber(mod.endorsements)}
              </span>
              <span className="flex items-center gap-0.5" title="التحميلات">
                <Download className="h-3.5 w-3.5 text-primary" />
                {formatNumber(mod.downloads)}
              </span>
            </>
          )}
          {variant === 'trending' && (
            <>
              {/* التحميلات + المشاهدات */}
              <span className="flex items-center gap-0.5" title="التحميلات">
                <Download className="h-3.5 w-3.5 text-primary" />
                {formatNumber(mod.downloads)}
              </span>
              <span className="flex items-center gap-0.5" title="المشاهدات">
                <Eye className="h-3.5 w-3.5 text-primary" />
                {formatNumber(mod.views)}
              </span>
            </>
          )}
          {variant === 'topEndorsed' && (
            <>
              {/* التأييدات بس */}
              <span className="flex items-center gap-0.5" title="التأييدات">
                <ThumbsUp className="h-3.5 w-3.5 text-primary" />
                {formatNumber(mod.endorsements)}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}

/**
 * SidebarList — قائمة عناصر مع خطوط فاصلة ناعمة (gradient) بين كل عنصر.
 * الخط الفاصل بيختفي من الناحيتين عشان مظهر أنظف.
 */
function SidebarList({ items, variant }: { items: ModSummary[]; variant: 'latest' | 'trending' | 'topEndorsed' }) {
  return (
    <div className="space-y-0">
      {items.map((mod, i) => (
        <div key={mod.id}>
          <SidebarItem mod={mod} variant={variant} />
          {/* خط فاصل ناعم بين العناصر — ما نحطش خط بعد العنصر الأخير */}
          {i < items.length - 1 && (
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          )}
        </div>
      ))}
    </div>
  )
}

interface HomeSidebarProps {
  /** أحدث الإصدارات — مرتبة حسب updatedAt */
  latest: ModSummary[]
  /** التعريبات الرائجة الآن — مرتبة حسب التحميلات */
  trending: ModSummary[]
  /** أكثر التعريبات إعجاباً — مرتبة حسب التأييدات */
  topEndorsed: ModSummary[]
}

/**
 * HomeSidebar — شريط جانبي في الصفحة الرئيسية على اليمين (RTL).
 *
 * يحتوي على ثلاثة أقسام:
 * 1. "أحدث الإصدارات" — يعرض أحدث التعريبات مع شارة جديد/محدّث + التقييم + التحميلات
 * 2. "التعريبات الرائجة الآن" — يعرض التعريبات الرائجة مع التحميلات + المشاهدات
 * 3. "أكثر التعريبات إعجاباً" — يعرض أكثر التعريبات تأييداً مع التأييدات
 *
 * كل عنصر فيه: صورة مصغرة كبيرة + اسم التعريب + المنصة + بيانات إضافية (حسب القسم).
 *
 * بيقبل ref عشان الـ parent يقدر يتحكم في sticky style.
 */
export const HomeSidebar = forwardRef<HTMLElement, HomeSidebarProps>(
  function HomeSidebar({ latest, trending, topEndorsed }, ref) {
    return (
      <aside
        ref={ref}
        className="w-[340px] shrink-0"
        dir="rtl"
      >
        <div className="space-y-4">
          {/* ===== القسم الأول: أحدث الإصدارات ===== */}
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="mb-3 px-1">
              <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Zap className="h-4 w-4 text-primary" fill="currentColor" />
                أحدث الإصدارات
              </h3>
              <p className="mt-0.5 pr-6 text-[11px] text-muted-foreground">
                أحدث ما تم نشره وتعديله
              </p>
            </div>
            <SidebarList items={latest.slice(0, 5)} variant="latest" />
          </div>

          {/* ===== القسم الثاني: التعريبات الرائجة الآن ===== */}
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="mb-3 px-1">
              <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Flame className="h-4 w-4 text-primary" />
                التعريبات الرائجة الآن
              </h3>
              <p className="mt-0.5 pr-6 text-[11px] text-muted-foreground">
                ما يحمّله الجميع الآن
              </p>
            </div>
            <SidebarList items={trending.slice(0, 5)} variant="trending" />
          </div>

          {/* ===== القسم الثالث: أكثر التعريبات إعجاباً ===== */}
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="mb-3 px-1">
              <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Heart className="h-4 w-4 text-primary" />
                أكثر التعريبات إعجاباً
              </h3>
              <p className="mt-0.5 pr-6 text-[11px] text-muted-foreground">
                أكثر تعريبات حصلت على إعجابات على الإطلاق
              </p>
            </div>
            <SidebarList items={topEndorsed.slice(0, 5)} variant="topEndorsed" />
          </div>
        </div>
      </aside>
    )
  }
)
