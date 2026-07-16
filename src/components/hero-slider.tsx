'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronLeft, ChevronRight, Info } from 'lucide-react'
import type { ModSummary } from '@/lib/types'

/**
 * لوحة ألوان كل منصة — 2-3 ألوان مطابقين للون المنصة.
 * بنختار لون عشوائي من اللوحة لكل شريحة عشان كل شريحة تبان مميزة.
 */
const PLATFORM_PALETTE: Record<string, string[]> = {
  PC:  ['#f97316', '#fb923c', '#ea580c'], // برتقالي
  NS:  ['#e60012', '#ef4444', '#dc2626'], // أحمر نينتندو
  PS4: ['#3b82f6', '#60a5fa', '#2563eb'], // أزرق
  PS3: ['#1e40af', '#3b82f6', '#1d4ed8'], // أزرق غامق
  PS2: ['#06b6d4', '#0891b2', '#0e7490'], // سماوي
  PS1: ['#94a3b8', '#cbd5e1', '#64748b'], // رمادي
}

/** مدة عرض كل شريحة قبل ما تنتقل للتالية (بالملي ثانية). */
const SLIDER_INTERVAL = 6000

interface HeroSliderProps {
  /** قائمة أحدث التعريبات اللي هتتعرض كشرائح. */
  slides: ModSummary[]
}

/**
 * HeroSlider — شريط متحرك في واجهة الموقع بيعرض أحدث التعريبات.
 *
 * التصميم مستوحى من nexusmods و المواقع الاحترافية:
 * - صورة خلفية بـ fade + scale animation عند تبديل الشرائح
 * - gradient داكن لأسفل + gradient جانبي + توهج ملون بلون المنصة
 * - شارة (pill) بلون المنصة فيها اسم القسم
 * - عنوان كبير + تصنيف + حجم
 * - زر "عرض التفاصيل" بلون المنصة
 * - عدّاد الشرائح (01/05) أعلى يسار
 * - أسهم تنقل يمين و يسار
 * - شريط تقدم سفلي بـ requestAnimationFrame
 * - نقاط (dots) النشطة بتبقى أعرض و بلون المنصة
 */
export function HeroSlider({ slides }: HeroSliderProps) {
  const [active, setActive] = useState(0)
  const [progress, setProgress] = useState(0)
  // نحتفظ بـ active في ref عشان الـ interval يقدر يقراها بدون ما يعتمد عليها
  // في ال deps (و كده بنتجنب إن الـ interval يتعمله reset مع كل تغيير).
  const activeRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const progressRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null)
  const startRef = useRef<number>(Date.now())

  // تحديث activeRef كل ما active تتغير
  useEffect(() => {
    activeRef.current = active
  }, [active])

  const goTo = useCallback((idx: number) => {
    setActive(idx)
    setProgress(0)
    startRef.current = Date.now()
  }, [])

  const next = useCallback(() => goTo((activeRef.current + 1) % slides.length), [slides.length, goTo])
  const prev = useCallback(() => goTo((activeRef.current - 1 + slides.length) % slides.length), [slides.length, goTo])

  // Auto-advance — بينقل للشريحة التالية كل SLIDER_INTERVAL ملي ثانية.
  // نعتمد على activeRef (مش active) عشان الـ interval ما يتعملهش reset مع كل تغيير،
  // و بالتالي مفيش race condition لما المستخدم يدوس سهم.
  useEffect(() => {
    if (slides.length === 0) return
    timerRef.current = setInterval(() => {
      setActive((p) => (p + 1) % slides.length)
      setProgress(0)
      startRef.current = Date.now()
    }, SLIDER_INTERVAL)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [slides.length])

  // Smooth progress bar via rAF — بيتحرك سلس لحد ما الشريحة التالية تيجي
  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - startRef.current
      setProgress(Math.min((elapsed / SLIDER_INTERVAL) * 100, 100))
      progressRef.current = requestAnimationFrame(tick)
    }
    progressRef.current = requestAnimationFrame(tick)
    return () => {
      if (progressRef.current) cancelAnimationFrame(progressRef.current)
    }
  }, [active])

  if (slides.length === 0) return null

  const slide = slides[active]
  const platform = slide.game?.platform || 'PC'
  const palette = PLATFORM_PALETTE[platform] || PLATFORM_PALETTE.PC
  // اختيار لون ثابت لكل شريحة بناءً على الـ index عشان ما يتغيرش مع كل render
  const color = palette[active % palette.length]
  const meta = {
    label: `ARABIC ${platform}`,
    color,
  }

  return (
    <section
      className="relative overflow-hidden select-none"
      style={{ height: 'clamp(360px, 52vh, 580px)' }}
      dir="rtl"
    >
      {/* ===== الصورة الخلفية ===== */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0"
        >
          <img src={slide.imageUrl} alt={slide.name} className="h-full w-full object-cover" />
          {/* gradient داكن لأسفل عشان النص يبان واضح */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, #0a0a0a 0%, rgba(10,10,10,0.55) 45%, rgba(10,10,10,0.05) 100%)',
            }}
          />
          {/* gradient جانبي من اليسار */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to left, rgba(10,10,10,0.65) 0%, transparent 55%)' }}
          />
          {/* توهج ملون بلون المنصة في أسفل اليمين */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at 75% 100%, ${meta.color}30 0%, transparent 60%)` }}
          />
        </motion.div>
      </AnimatePresence>

      {/* ===== المحتوى النصي (محاذى لأسفل RTL) ===== */}
      <div className="absolute inset-0 flex items-end pointer-events-none">
        <div className="w-full px-6 pb-12 sm:px-12 sm:pb-16 lg:px-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={`txt-${active}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="pointer-events-auto max-w-[650px]"
            >
              {/* شارة القسم بلون المنصة */}
              <span
                className="mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest"
                style={{
                  backgroundColor: meta.color,
                  color: '#fff',
                }}
              >
                {meta.label}
              </span>

              {/* العنوان */}
              <h2
                className="mb-2 font-black leading-tight text-white"
                style={{
                  fontSize: 'clamp(1.5rem, 3.8vw, 3.2rem)',
                  textShadow: '0 2px 24px rgba(0,0,0,0.6)',
                }}
              >
                {slide.name}
              </h2>

              {/* القسم + الحجم */}
              <p className="mb-5 text-sm font-semibold text-gray-300">
                {slide.category?.name || slide.game?.name}
                {slide.fileSize && <span className="mx-2 opacity-30">•</span>}
                {slide.fileSize && <span className="text-gray-400">{slide.fileSize}</span>}
              </p>

              {/* زر عرض التفاصيل */}
              <a
                href={`/?view=mod&slug=${slide.slug}`}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-black shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: meta.color,
                  color: '#fff',
                  boxShadow: `0 8px 24px ${meta.color}55`,
                }}
              >
                <Info size={15} />
                عرض التفاصيل
              </a>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ===== عدّاد الشرائح — أعلى يسار ===== */}
      <div className="absolute left-6 top-5 flex items-center gap-1.5 pointer-events-none" dir="ltr">
        <span
          className="text-sm font-black tabular-nums text-white"
          style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}
        >
          {String(active + 1).padStart(2, '0')}
        </span>
        <span className="text-xs text-white/25">/</span>
        <span className="text-xs font-bold tabular-nums text-white/35">
          {String(slides.length).padStart(2, '0')}
        </span>
      </div>

      {/* ===== سهم التنقل — يمين (next في RTL) ===== */}
      {/* في RTL، اليمين = الأمام (التالية)، و اليسار = الخلف (السابقة) */}
      <button
        onClick={next}
        aria-label="الشريحة التالية"
        className="absolute right-4 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full transition-all duration-150 hover:scale-110 active:scale-90"
        style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.18)',
        }}
      >
        <ChevronRight size={18} className="text-white" />
      </button>

      {/* ===== سهم التنقل — يسار (prev في RTL) ===== */}
      <button
        onClick={prev}
        aria-label="الشريحة السابقة"
        className="absolute left-4 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full transition-all duration-150 hover:scale-110 active:scale-90"
        style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.18)',
        }}
      >
        <ChevronLeft size={18} className="text-white" />
      </button>

      {/* ===== شريط التقدم + النقاط — أسفل ===== */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-2 px-6 pb-3 sm:px-12 lg:px-16" dir="ltr">
        {/* شريط التقدم */}
        <div
          className="h-[2px] w-full overflow-hidden rounded-full"
          style={{ background: 'rgba(255,255,255,0.1)' }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(to right, ${meta.color}, #fff)`,
              transition: 'none',
            }}
          />
        </div>
        {/* النقاط */}
        <div className="flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`الانتقال للشريحة ${i + 1}`}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === active ? '22px' : '6px',
                height: '6px',
                backgroundColor: i === active ? meta.color : 'rgba(255,255,255,0.22)',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
