'use client'

import { useSmoothWheelScroll } from '@/hooks/use-smooth-wheel-scroll'

/**
 * SmoothScrollProvider — مكون بسيط بيفعّل الـ smooth wheel scroll hook.
 * بيتحط في الـ root layout عشان يشتغل على كل الصفحات.
 * مابيرندرش أي حاجة — مجرد بيشغّل الـ hook.
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useSmoothWheelScroll()
  return <>{children}</>
}
