'use client'

import { useState } from 'react'
import {
  Download,
  FileArchive,
  AlertTriangle,
  Calendar,
  Clock,
  HardDrive,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  PackageX,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { formatArabicDate, timeAgo } from '@/lib/format'
import { getPlatformInfo } from '@/components/platform-upload-icons'
import type { ModFile } from '@/lib/types'

interface DownloadSectionProps {
  files: ModFile[]
}

/**
 * ModDownloadSection — قسم التحميل.
 * بياخد بيانات الملفات من الـ DB عبر props (مش hardcoded).
 * كل ملف فيه:
 *   - عنوان + وصف + تنبيه
 *   - تاريخ الإصدار + آخر تحديث + حجم الملف (في صف واحد)
 *   - روابط تحميل متعددة — بيكشف المنصة من الرابط تلقائياً ويعرض أيقونتها الحقيقية
 */
export function ModDownloadSection({ files }: DownloadSectionProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(files.length > 0 ? [files[0].id] : []))

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (!files || files.length === 0) {
    return (
      <div className="grid place-items-center py-12 text-center">
        <PackageX className="mb-3 h-12 w-12 text-muted-foreground/50" />
        <h3 className="text-lg font-semibold">لا توجد ملفات تحميل</h3>
        <p className="mt-1 text-sm text-muted-foreground">لم يتم رفع أي ملفات لهذا التعريب بعد.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {files.map((file) => {
        const isExpanded = expandedIds.has(file.id)
        return (
          <Card key={file.id} className="overflow-hidden border-border bg-card">
            {/* رأس الملف — دائماً ظاهر */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <FileArchive className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-foreground">{file.title}</h3>
                    {file.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{file.description}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => toggleExpand(file.id)}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  aria-label={isExpanded ? 'إخفاء التفاصيل' : 'إظهار التفاصيل'}
                >
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>

              {/* صف البيانات المدمج — تاريخ الإصدار + آخر تحديث + الحجم */}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border/50 pt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  <span>الإصدار:</span>
                  <span className="font-bold text-foreground">v{file.version}</span>
                </span>
                <span className="text-border">|</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span>تاريخ النشر:</span>
                  <span className="font-bold text-foreground">{formatArabicDate(file.releaseDate)}</span>
                </span>
                <span className="text-border">|</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span>آخر تحديث:</span>
                  <span className="font-bold text-foreground">{timeAgo(file.updatedAt)}</span>
                </span>
                <span className="text-border">|</span>
                <span className="flex items-center gap-1.5">
                  <HardDrive className="h-3.5 w-3.5 text-primary" />
                  <span>الحجم:</span>
                  <span className="font-bold text-foreground">{file.fileSize} .{file.fileFormat}</span>
                </span>
              </div>
            </div>

            {/* التفاصيل الموسّعة — التنبيه + الروابط */}
            {isExpanded && (
              <div className="border-t border-border bg-background/40 p-4">
                {/* التنبيه */}
                {file.alert && (
                  <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-500" />
                    <p className="text-xs text-yellow-100/90">{file.alert}</p>
                  </div>
                )}

                {/* الروابط — كل رابط بيكشف المنصة من الـ URL */}
                {file.links.length > 0 ? (
                  <div>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      روابط التحميل ({file.links.length})
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {file.links.map((link) => {
                        const info = getPlatformInfo(link.url)
                        return (
                          <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-2.5 rounded-lg border border-border bg-card/60 p-2.5 transition-all hover:border-primary/50 hover:bg-primary/5"
                          >
                            <div
                              className="grid h-9 w-9 shrink-0 place-items-center rounded-md p-1.5 text-white"
                              style={{ backgroundColor: info.color }}
                            >
                              {info.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-medium text-foreground">
                                {link.label || info.name}
                              </div>
                              <div className="text-[11px] text-muted-foreground">
                                اضغط للتحميل
                              </div>
                            </div>
                            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                          </a>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">لا توجد روابط تحميل لهذا الملف.</p>
                )}
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}
