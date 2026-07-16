import { Fragment } from 'react'
import { ThumbsUp, Download, Eye } from 'lucide-react'
import { formatNumber } from '@/lib/format'
import type { ModSummary } from '@/lib/types'

// ===== مصدر واحد موحّد للإحصائيات =====
// أي مكان في الموقع يعرض إحصائيات تعديل (بطاقة، صفحة تفاصيل، إلخ) لازم يستخدم
// getModStatEntries عشان الأرقام والتسميات والترتيب يفضلوا متطابقين دايماً بين
// "جوه البطاقة" و"خارج البطاقة" — لا حسابات وهمية منفصلة في كل مكان.
export function getModStatEntries(mod: Pick<ModSummary, 'endorsements' | 'downloads' | 'views'>) {
  return [
    { key: 'endorsements', icon: ThumbsUp, value: mod.endorsements, label: 'تأييدات' },
    { key: 'downloads', icon: Download, value: mod.downloads, label: 'تحميلات' },
    { key: 'views', icon: Eye, value: mod.views, label: 'مشاهدات' },
  ] as const
}

/** الشريط السفلي المدمج المستخدم داخل ModCard في كل الموقع */
export function ModStatsCompact({ mod }: { mod: Pick<ModSummary, 'endorsements' | 'downloads' | 'views'> }) {
  const entries = getModStatEntries(mod)
  return (
    <div className="mt-auto flex min-h-9 items-center justify-center gap-x-4 rounded-b bg-secondary/50 px-3">
      {entries.map((e) => (
        <span key={e.key} className="flex items-center gap-x-1 text-xs text-muted-foreground" title={e.label}>
          <e.icon className="h-3.5 w-3.5 shrink-0" />
          <span className="sr-only">{e.label} </span>
          <span>{formatNumber(e.value)}</span>
        </span>
      ))}
    </div>
  )
}

/** شريط الإحصائيات الاحترافي فوق البنر في صفحة تفاصيل التعريب —
 *  نفس القيم بالظبط اللي في ModStatsCompact، بس بتصميم badge أكبر. */
export function ModStatsBadges({ mod }: { mod: Pick<ModSummary, 'endorsements' | 'downloads' | 'views'> }) {
  const entries = getModStatEntries(mod)
  return (
    <>
      {entries.map((e, i) => (
        <Fragment key={e.key}>
          {i > 0 && <span className="text-foreground/30">•</span>}
          <span className="flex items-center gap-1.5 rounded-md border border-white/10 bg-background/40 px-2 py-1 backdrop-blur-sm transition-colors hover:border-primary/40 hover:bg-background/60">
            <span className="text-primary"><e.icon className="h-3.5 w-3.5" /></span>
            <span className="flex flex-col leading-tight">
              <span className="text-xs font-bold text-foreground">{formatNumber(e.value)}</span>
              <span className="text-[10px] text-muted-foreground">{e.label}</span>
            </span>
          </span>
        </Fragment>
      ))}
    </>
  )
}
