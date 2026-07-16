'use client'

import Link from 'next/link'
import { ArrowLeft, Zap, Package, Star, Shield, Cpu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useFetch } from '@/hooks/use-fetch'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { ModCard, ModCardSkeleton } from '@/components/mod-card'
import { SeriesCard, SeriesCardSkeleton } from '@/components/series-card'
import { LatestModsTicker } from '@/components/latest-mods-ticker'
import type { HomeData } from '@/lib/types'

const PLATFORMS = [
  { key: 'PC', label: 'ARABIC PC', arabicLabel: 'ألعاب الكمبيوتر' },
  { key: 'PS4', label: 'ARABIC PS4', arabicLabel: 'ألعاب البلايستيشن 4' },
  { key: 'PS3', label: 'ARABIC PS3', arabicLabel: 'ألعاب البلايستيشن 3' },
  { key: 'PS2', label: 'ARABIC PS2', arabicLabel: 'ألعاب البلايستيشن 2' },
  { key: 'PS1', label: 'ARABIC PS1', arabicLabel: 'ألعاب البلايستيشن 1' },
] as const

export function HomePage() {
  useDocumentTitle(null)
  const { data, loading } = useFetch<HomeData>('/api/home')

  return (
    <div dir="rtl">
      {/* شريط "أحدث التعريبات" المتحرك — بديل البانر الرئيسي القديم (نقطة 9) */}
      <LatestModsTicker mods={data?.tickerMods ?? []} loading={loading} />

      {/* أحدث الإصدارات — أحدث البطاقات المحدثة/الجديدة من جميع الأقسام */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1200px] px-4 py-10">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" fill="currentColor" />
              <h2 className="text-base font-bold uppercase tracking-wider text-foreground">أحدث الإصدارات</h2>
            </div>
            <Button asChild variant="ghost" size="sm" className="shrink-0 text-primary hover:text-primary">
              <Link href="/?view=mods&sort=updated">
                عرض الكل <ArrowLeft className="mr-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <ModCardSkeleton key={i} />)
              : data?.latestMods?.slice(0, 8).map((m) => <ModCard key={m.id} mod={m} />)}
          </div>
        </div>
      </section>

      {/* أقسام المنصات الخمسة — كل قسم يستخدم ModCard بنفس التصميم */}
      {PLATFORMS.map((platform) => {
        const mods = data?.modsByPlatform?.[platform.key] || []
        if (mods.length === 0 && !loading) return null
        return (
          <section key={platform.key} className="border-t border-border">
            <div className="mx-auto max-w-[1200px] px-4 py-10">
              {/* عنوان القسم */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    {platform.label}
                  </h2>
                  <span className="text-sm text-muted-foreground">— {platform.arabicLabel}</span>
                </div>
                <Button asChild variant="ghost" size="sm" className="shrink-0 text-primary hover:text-primary">
                  <Link href={`/?view=games&platform=${platform.key}`}>
                    عرض الكل <ArrowLeft className="mr-1.5 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              {/* 4 بطاقات ModCard — نفس تصميم أحدث الإصدارات والتعديلات الرائجة */}
              <div className="grid grid-cols-2 gap-4 sm:gap-5 sm:grid-cols-3 lg:grid-cols-4">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => <ModCardSkeleton key={i} />)
                  : mods.map((m) => <ModCard key={m.id} mod={m} />)}
              </div>
            </div>
          </section>
        )
      })}

      {/* التعديلات الرائجة */}
      <section className="border-t border-border bg-card/20">
        <div className="mx-auto max-w-[1200px] px-4 py-12">
          <SectionHeader
            title="التعديلات الرائجة"
            subtitle="ما يحمّله الجميع الآن"
            href="/?view=mods&sort=downloads"
          />
          <div className="grid grid-cols-2 gap-4 sm:gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <ModCardSkeleton key={i} />)
              : data?.trendingMods?.slice(0, 8).map((m) => <ModCard key={m.id} mod={m} />)}
          </div>
        </div>
      </section>

      {/* سلاسل التعريبات */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1200px] px-4 py-12">
          <SectionHeader
            title="سلاسل التعريبات"
            subtitle="استكشف التعريبات حسب السلسلة"
            href="/?view=series"
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SeriesCardSkeleton key={i} />)
              : data?.topSeries?.slice(0, 6).map((s) => <SeriesCard key={s.name} series={s} />)}
          </div>
        </div>
      </section>

      {/* بانر Vortex */}
      <section className="border-t border-border bg-card/20">
        <div className="mx-auto max-w-[1200px] px-4 py-12">
          <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-8 lg:p-12">
            <div className="absolute -left-12 -top-12 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
            <div className="relative grid gap-6 lg:grid-cols-2 lg:items-center">
              <div>
                <Badge className="mb-3 bg-primary text-primary-foreground">
                  <Cpu className="ml-1.5 h-3 w-3" /> Vortex
                </Badge>
                <h2 className="text-3xl font-bold">مدير التعديلات الذكي</h2>
                <p className="mt-3 text-muted-foreground">
                  ثبت مئات التعديلات بنقرة واحدة. يتكفل Vortex بترتيب التحميل والتعارضات والتحديثات لتركز على اللعب.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link href="/?view=vortex">تحميل Vortex <ArrowLeft className="mr-1.5 h-4 w-4" /></Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/?view=premium">اعرف المزيد</Link>
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <PremiumFeature icon={<Zap className="h-5 w-5" />} title="تثبيت بنقرة" desc="بدون إدارة ملفات يدوية" />
                <PremiumFeature icon={<Shield className="h-5 w-5" />} title="تحديثات تلقائية" desc="ابقَ محدثاً تلقائياً" />
                <PremiumFeature icon={<Star className="h-5 w-5" />} title="كشف التعارضات" desc="ترتيب تحميل ذكي" />
                <PremiumFeature icon={<Package className="h-5 w-5" />} title="ملفات شخصية" desc="بدّل الإعدادات فوراً" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* المفضلة لدى المجتمع */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1200px] px-4 py-12">
          <SectionHeader
            title="المفضلة لدى المجتمع"
            subtitle="أكثر التعديلات تأييداً على الإطلاق"
            href="/?view=mods&sort=endorsements"
          />
          <div className="grid grid-cols-2 gap-4 sm:gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <ModCardSkeleton key={i} />)
              : data?.topEndorsed?.slice(0, 4).map((m) => <ModCard key={m.id} mod={m} />)}
          </div>
        </div>
      </section>
    </div>
  )
}

function SectionHeader({ title, subtitle, href }: { title: string; subtitle: string; href: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <Button asChild variant="ghost" size="sm" className="shrink-0 text-primary hover:text-primary">
        <Link href={href}>
          عرض الكل
          <ArrowLeft className="mr-1.5 h-4 w-4" />
        </Link>
      </Button>
    </div>
  )
}

function PremiumFeature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/60 p-4">
      <div className="mb-2 grid h-9 w-9 place-items-center rounded-md bg-primary/15 text-primary">
        {icon}
      </div>
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{desc}</div>
    </div>
  )
}
