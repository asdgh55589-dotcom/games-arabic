'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * useStickySidebar — هوك لتنفيذ سلوك "sticky sidebar" الذكي.
 *
 * السلوك المطلوب:
 *   - Scroll DOWN: الشريط بينزل مع الصفحة عادي لحد ما أسفل الشريط يوصل
 *     لأسفل الـ viewport. بعد كده الشريط بيلصق (sticky) من تحت — البطاقات بس
 *     هي اللي بتنزل.
 *   - Scroll UP: الشريط بيطلع مع الصفحة عادي لحد ما أعلى الشريط يوصل
 *     لـ topOffset من أعلى الـ viewport (تحت الـ navbar). بعد كده الشريط
 *     بيلصق من فوق — البطاقات بس هي اللي بتطلع.
 *
 * بنستخدم callback refs عشان الـ effect يشتغل تاني أول ما الـ sidebar
 * يترندر (بعد ما الـ loading يخلص).
 */
export interface StickyStyle {
  position?: 'sticky' | 'relative'
  top?: number | string
  transform?: string
}

export function useStickySidebar(topOffset: number = 64) {
  // بنستخدم state بدل ref عشان الـ effect يقدر يـ react على وجود الـ element
  const [sidebarEl, setSidebarEl] = useState<HTMLElement | null>(null)
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null)
  const [stickyStyle, setStickyStyle] = useState<StickyStyle>({})

  // Callback refs — React بيتصلهم بـ null أول ما الـ element يUnmount
  // و بـ node أول ما يMount. بنخزن الـ node في state.
  const sidebarRef = useCallback((node: HTMLElement | null) => {
    setSidebarEl(node)
  }, [])
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    setContainerEl(node)
  }, [])

  // Track لـ translate Y الحالي في ref عشان يفضل محفوظ بين الـ renders
  const translateYRef = useRef<number>(0)

  useEffect(() => {
    if (!sidebarEl || !containerEl) return

    const sidebar = sidebarEl
    const container = containerEl

    let frameId: number | null = null
    let lastScrollY = window.scrollY

    const compute = () => {
      frameId = null

      const sidebarHeight = sidebar.offsetHeight
      const containerHeight = container.offsetHeight
      const viewportHeight = window.innerHeight
      const scrollY = window.scrollY
      const availableHeight = viewportHeight - topOffset

      const containerRect = container.getBoundingClientRect()
      const containerTopInViewport = containerRect.top
      const containerBottomInViewport = containerRect.bottom

      // ============================================
      // Case 1: الشريط أقصر من المساحة المتاحة → sticky بسيط من فوق
      // ============================================
      if (sidebarHeight <= availableHeight) {
        // لو الـ container visible في الـ viewport
        if (containerTopInViewport < topOffset && containerBottomInViewport > topOffset) {
          setStickyStyle({
            position: 'sticky',
            top: `${topOffset}px`,
            transform: 'translateY(0px)',
          })
        } else {
          setStickyStyle({})
        }
        return
      }

      // ============================================
      // Case 2: الشريط أطول من المساحة المتاحة → sticky ديناميكي
      // ============================================

      // Phase A: الـ container لسه في موقعه الطبيعي (أعلى الشريط تحت topOffset)
      if (containerTopInViewport >= topOffset) {
        translateYRef.current = 0
        setStickyStyle({})
        return
      }

      // Phase D: الـ container كله عدّى فوق — خلّص
      if (containerBottomInViewport <= viewportHeight) {
        translateYRef.current = 0
        setStickyStyle({})
        return
      }

      // Phase B/C: الشريط لازم يلصق
      const delta = scrollY - lastScrollY
      lastScrollY = scrollY

      // Maximum translate up (negative number)
      const maxY = availableHeight - sidebarHeight
      const minY = 0

      let newY = translateYRef.current
      if (delta > 0) {
        // Scroll DOWN → lock to bottom (maxY, negative)
        newY = maxY
      } else if (delta < 0) {
        // Scroll UP → lock to top (minY = 0)
        newY = minY
      }
      translateYRef.current = newY

      setStickyStyle({
        position: 'sticky',
        top: `${topOffset}px`,
        transform: `translateY(${newY}px)`,
      })
    }

    const onScroll = () => {
      if (frameId === null) {
        frameId = requestAnimationFrame(compute)
      }
    }
    const onResize = () => {
      if (frameId === null) {
        frameId = requestAnimationFrame(compute)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    compute()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      if (frameId !== null) cancelAnimationFrame(frameId)
    }
  }, [sidebarEl, containerEl, topOffset])

  return { sidebarRef, containerRef, stickyStyle }
}
