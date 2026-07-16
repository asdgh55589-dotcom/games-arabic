'use client'

import Link from 'next/link'
import { ArrowLeft, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ModSummary } from '@/lib/types'
import { translateGameName } from '@/lib/arabic-names'

/** شريط "أحدث التعريبات" — بانر كبير متحرك (بديل حقيقي للهيرو القديم، مش شريط
 *  رفيع). بطاقات بحجم كبير بصورة خلفية كاملة، تتحرك أفقياً بشكل مستمر، وتتوقف
 *  عند تمرير الماوس. */
export function LatestModsTicker({ mods, loading }: { mods: ModSummary[]; loading: boolean }) {
  if (loading) {
    return (
      <section className="border-b border-border bg-card">
        <div className="flex gap-4 overflow-hidden px-4 py-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[260px] w-[420px] shrink-0 animate-pulse rounded-xl bg-secondary" />
          ))}
        </div>
      </section>
    )
  }

  if (!mods || mods.length === 0) return null

  // نكرر القائمة عشان السكرول يبقى متصل من غير فجوة (seamless loop)
  const loopItems = [...mods, ...mods]

  return (
    <section className="ticker-section relative overflow-hidden border-b border-border bg-background" dir="rtl">
      <div className="relative z-10 mx-auto flex max-w-[1200px] items-center gap-2 px-4 pb-3 pt-5">
        <Flame className="h-5 w-5 text-primary" fill="currentColor" />
        <h2 className="text-lg font-extrabold tracking-tight text-foreground">أحدث التعريبات</h2>
        <span className="text-xs text-muted-foreground">أحدث 3 من كل قسم — يتحدّث لحظياً</span>
      </div>

      <div className="ticker-viewport relative overflow-hidden pb-6">
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />

        <div className="ticker-track flex w-max gap-5 px-4">
          {loopItems.map((m, i) => (
            <TickerCard key={`${m.id}-${i}`} mod={m} />
          ))}
        </div>
      </div>

      <style>{`
        .ticker-track {
          animation: ticker-scroll 75s linear infinite;
        }
        .ticker-section:hover .ticker-track {
          animation-play-state: paused;
        }
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ticker-track { animation: none; }
        }
      `}</style>
    </section>
  )
}

function TickerCard({ mod }: { mod: ModSummary }) {
  return (
    <div className="group relative h-[260px] w-[420px] shrink-0 overflow-hidden rounded-xl border border-border shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-primary/20">
      <img
        src={mod.thumbnailUrl}
        alt={mod.name}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10" />

      <span className="absolute right-4 top-4 rounded-md border border-white/20 bg-black/50 px-2 py-1 text-xs font-medium text-white backdrop-blur">
        {mod.game?.platform}
      </span>

      <div className="absolute inset-x-0 bottom-0 p-5">
        <p className="mb-1 text-xs font-medium text-primary">{translateGameName(mod.game?.name || '')}</p>
        <h3 className="mb-3 line-clamp-2 text-xl font-extrabold leading-tight text-white drop-shadow-lg">
          {mod.name}
        </h3>
        <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href={`/?view=mod&slug=${mod.slug}`}>
            عرض التفاصيل <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
