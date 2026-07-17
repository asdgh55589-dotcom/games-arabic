'use client'

import { useEffect } from 'react'

export function SeoUpdater() {
  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then(({ settings }) => {
        if (settings.meta_title) document.title = settings.meta_title
        if (settings.meta_description) setMeta('description', settings.meta_description)
        if (settings.og_image) setMeta('og:image', settings.og_image, true)
        if (settings.site_name) setMeta('og:site_name', settings.site_name, true)
        if (settings.og_locale) setMeta('og:locale', settings.og_locale, true)
        if (settings.og_type) setMeta('og:type', settings.og_type, true)
        if (settings.site_url) setMeta('og:url', settings.site_url, true)
        if (settings.theme_color) setMeta('theme-color', settings.theme_color)
        if (settings.twitter) setMeta('twitter:site', settings.twitter, true)
        if (settings.google_analytics_id) injectGA(settings.google_analytics_id)
      })
      .catch(() => {})
  }, [])

  return null
}

function setMeta(name: string, content: string, isProperty = false) {
  if (!content) return
  const attr = isProperty ? 'property' : 'name'
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function injectGA(id: string) {
  if (document.querySelector(`script[src*="googletagmanager"]`)) return
  const s1 = document.createElement('script')
  s1.async = true
  s1.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
  document.head.appendChild(s1)
  const s2 = document.createElement('script')
  s2.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');`
  document.head.appendChild(s2)
}
