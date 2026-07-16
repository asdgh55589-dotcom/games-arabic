'use client'

import { useState } from 'react'
import { Play, Clock, Eye, Youtube, ChevronLeft, X, VideoOff } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatNumber } from '@/lib/format'
import type { ModVideoGroup } from '@/lib/types'

interface ModVideosProps {
  videoGroups: ModVideoGroup[]
}

/**
 * ModVideos — قسم الفيديوهات.
 * بياخد بيانات الفيديوهات من الـ DB عبر props.
 * - الفيديوهات مجمّعة في أقسام
 * - كل فيديو بيظهر كـ card أفقي عريض
 * - عند الضغط على فيديو، بيفتح modal مع الـ YouTube embed
 * - بيكشف الـ YouTube video ID من الرابط
 */
export function ModVideos({ videoGroups }: ModVideosProps) {
  const [activeVideo, setActiveVideo] = useState<{
    title: string
    url: string
    channel?: string | null
    views: number
    thumbnail?: string | null
  } | null>(null)

  // استخراج YouTube video ID من الرابط
  const extractYouTubeId = (url: string): string => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/)
    return match ? match[1] : ''
  }

  if (!videoGroups || videoGroups.length === 0) {
    return (
      <div className="grid place-items-center py-12 text-center">
        <VideoOff className="mb-3 h-12 w-12 text-muted-foreground/50" />
        <h3 className="text-lg font-semibold">لا توجد فيديوهات</h3>
        <p className="mt-1 text-sm text-muted-foreground">لم تتم إضافة أي فيديوهات لهذا التعريب.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-8">
        {videoGroups.map((group) => (
          <section key={group.id}>
            {/* عنوان القسم */}
            <div className="mb-4 flex items-center justify-between border-b border-border pb-2">
              <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
                <Youtube className="h-5 w-5 text-red-500" />
                {group.name}
              </h3>
              <Badge variant="secondary">{group.videos.length} فيديو</Badge>
            </div>

            {/* قائمة الفيديوهات — كل فيديو بطاقة أفقية عريضة */}
            {group.videos.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا توجد فيديوهات في هذا القسم.</p>
            ) : (
              <div className="space-y-3">
                {group.videos.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => setActiveVideo({
                      title: video.title,
                      url: video.url,
                      channel: video.channel,
                      views: video.views,
                      thumbnail: video.thumbnail,
                    })}
                    className="group flex w-full items-stretch gap-4 overflow-hidden rounded-lg border border-border bg-card text-right transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
                  >
                    {/* الصورة المصغّرة */}
                    <div className="relative aspect-video w-48 shrink-0 overflow-hidden bg-secondary sm:w-56 md:w-64">
                      {video.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="grid h-full place-items-center bg-secondary">
                          <Youtube className="h-10 w-10 text-muted-foreground" />
                        </div>
                      )}
                      {/* overlay غامق عند الـ hover */}
                      <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/30" />
                      {/* زر التشغيل في المنتصف */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="grid h-12 w-12 place-items-center rounded-full bg-red-600/90 shadow-lg backdrop-blur transition-transform group-hover:scale-110">
                          <Play className="h-5 w-5 fill-white text-white" />
                        </div>
                      </div>
                      {/* مدة الفيديو */}
                      {video.duration && (
                        <div className="absolute bottom-1.5 left-1.5 rounded bg-black/85 px-1.5 py-0.5 text-[11px] font-bold text-white">
                          {video.duration}
                        </div>
                      )}
                    </div>

                    {/* بيانات الفيديو */}
                    <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 p-3">
                      <h4 className="line-clamp-2 text-sm font-bold text-foreground group-hover:text-primary">
                        {video.title}
                      </h4>
                      {video.channel && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground/80">{video.channel}</span>
                        </div>
                      )}
                      <div className="mt-auto flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {formatNumber(video.views)} مشاهدة
                        </span>
                        {video.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {video.duration}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Modal تشغيل الفيديو */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
          onClick={() => setActiveVideo(null)}
        >
          <button
            onClick={() => setActiveVideo(null)}
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-md bg-white/10 text-white transition-colors hover:bg-red-600"
            aria-label="إغلاق"
          >
            <X className="h-5 w-5" />
          </button>

          <div
            className="w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video overflow-hidden rounded-lg bg-black shadow-2xl">
              {extractYouTubeId(activeVideo.url) ? (
                <iframe
                  src={`https://www.youtube.com/embed/${extractYouTubeId(activeVideo.url)}?autoplay=1`}
                  title={activeVideo.title}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-full items-center justify-center text-white/60">
                  تعذّر تحميل الفيديو
                </div>
              )}
            </div>
            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">{activeVideo.title}</h3>
                <div className="mt-1 flex items-center gap-3 text-sm text-white/60">
                  {activeVideo.channel && <span>{activeVideo.channel}</span>}
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {formatNumber(activeVideo.views)} مشاهدة
                  </span>
                </div>
              </div>
              <a
                href={activeVideo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex shrink-0 items-center gap-1.5 rounded-md bg-white/10 px-3 py-2 text-sm text-white transition-colors hover:bg-white/20"
              >
                فتح على YouTube
                <ChevronLeft className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
