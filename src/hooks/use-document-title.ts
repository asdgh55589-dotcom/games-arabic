'use client'

import { useEffect } from 'react'

const BASE_TITLE = 'NexusMods — Mod Your Game'

/**
 * Set the document title for the current view. Pass a non-empty title to
 * override the base; pass `undefined` (or null) to reset to the base.
 *
 * Because this is a single-route SPA, every view sets its own title for
 * browser-tab identification, screen-reader announcements, and history entries.
 */
export function useDocumentTitle(title?: string | null) {
  useEffect(() => {
    if (title) {
      document.title = `${title} · NexusMods`
    } else {
      document.title = BASE_TITLE
    }
    return () => {
      document.title = BASE_TITLE
    }
  }, [title])
}
