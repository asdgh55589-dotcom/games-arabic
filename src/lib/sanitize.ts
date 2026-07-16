/**
 * Sanitize a URL for safe use in `href` attributes.
 *
 * Allows `http:`, `https:`, `mailto:`, and `tel:` schemes plus relative URLs.
 * Blocks `javascript:`, `data:`, `vbscript:`, and anything else that could
 * execute script when clicked. This is the primary XSS defense for URLs that
 * come from user-authored content (e.g. markdown link syntax).
 */
export function sanitizeUrl(url: string): string | null {
  if (!url) return null
  const trimmed = url.trim()
  if (!trimmed) return null

  // Allow relative URLs (/, ./, ../, #, ?)
  if (/^[/?#]/.test(trimmed)) return trimmed

  // Allow explicit safe schemes
  if (/^(https?|mailto|tel):/i.test(trimmed)) return trimmed

  // Block everything else (javascript:, data:, vbscript:, etc.)
  return null
}
