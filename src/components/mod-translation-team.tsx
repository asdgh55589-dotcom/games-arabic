'use client'

import {
  Users,
  Mail,
  Globe,
  Send,
  Twitter,
  Youtube,
  MessageCircle,
  Crown,
  Award,
  Star,
  Edit3,
  Languages,
  CheckCircle2,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { ModTeamMember, ModContactLink } from '@/lib/types'

interface ModTranslationTeamProps {
  teamMembers: ModTeamMember[]
  contactLinks: ModContactLink[]
}

const CONTACT_ICONS: Record<string, React.ReactNode> = {
  mail: <Mail className="h-5 w-5" />,
  website: <Globe className="h-5 w-5" />,
  telegram: <Send className="h-5 w-5" />,
  twitter: <Twitter className="h-5 w-5" />,
  youtube: <Youtube className="h-5 w-5" />,
  discord: <MessageCircle className="h-5 w-5" />,
}

const CONTACT_COLORS: Record<string, string> = {
  mail: '#6b7280',
  website: '#3b82f6',
  telegram: '#229ED9',
  twitter: '#1DA1F2',
  youtube: '#FF0000',
  discord: '#5865F2',
}

/**
 * ModTranslationTeam — تاب فريق التعريب.
 * بياخد بيانات الفريق من الـ DB عبر props.
 * بيتكوّن من 3 أقسام:
 *   1. فريق التعريب — قائمة أعضاء الفريق
 *   2. التواصل — روابط تواصل الفريق
 *   3. إنجازات الفريق (ثابتة)
 */
export function ModTranslationTeam({ teamMembers, contactLinks }: ModTranslationTeamProps) {
  return (
    <div className="space-y-6">
      {/* ===== القسم الأول: فريق التعريب ===== */}
      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border bg-card/40 px-5 py-3">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-primary/15 text-primary">
            <Users className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-foreground">فريق التعريب</h3>
          <Badge variant="secondary" className="mr-auto">{teamMembers.length} أعضاء</Badge>
        </div>

        {teamMembers.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">لا يوجد معلومات عن فريق التعريب.</p>
        ) : (
          <div className="divide-y divide-border">
            {teamMembers.map((member, i) => (
              <div
                key={member.id}
                className="flex items-center gap-4 p-4 transition-colors hover:bg-accent/30"
              >
                <Avatar className="h-12 w-12 shrink-0 border-2 border-border">
                  <AvatarImage src={member.avatarUrl || undefined} alt={member.name} />
                  <AvatarFallback>{member.name[0]}</AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{member.name}</span>
                    {i === 0 && (
                      <Badge variant="secondary" className="gap-1 bg-amber-500/15 text-amber-500">
                        <Crown className="h-3 w-3" />
                        قائد الفريق
                      </Badge>
                    )}
                  </div>
                  <div className="mt-0.5 text-sm text-muted-foreground">{member.role}</div>
                  {member.contribution && (
                    <div className="mt-1 text-xs text-muted-foreground/80">{member.contribution}</div>
                  )}
                </div>

                {/* أيقونة الدور */}
                <div className="hidden shrink-0 text-primary sm:block">
                  {i === 0 ? (
                    <Crown className="h-5 w-5" />
                  ) : i < 3 ? (
                    <Languages className="h-5 w-5" />
                  ) : i === 3 ? (
                    <Edit3 className="h-5 w-5" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ===== القسم الثاني: التواصل ===== */}
      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border bg-card/40 px-5 py-3">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-primary/15 text-primary">
            <Mail className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-foreground">التواصل</h3>
          <Badge variant="secondary" className="mr-auto">{contactLinks.length} طرق</Badge>
        </div>

        {contactLinks.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">لا توجد روابط تواصل.</p>
        ) : (
          <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {contactLinks.map((contact) => (
              <a
                key={contact.id}
                href={contact.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-lg border border-border bg-card/60 p-3 transition-all hover:border-primary/50 hover:bg-primary/5"
              >
                <div
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-md text-white"
                  style={{ backgroundColor: CONTACT_COLORS[contact.type] || '#4b5563' }}
                >
                  {CONTACT_ICONS[contact.type] || <Globe className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">{contact.label}</div>
                  <div className="truncate text-[11px] text-muted-foreground">
                    {contact.url.replace(/^https?:\/\//, '').replace(/^mailto:/, '')}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </Card>

      {/* ===== قسم إنجازات الفريق ===== */}
      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border bg-card/40 px-5 py-3">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-primary/15 text-primary">
            <Award className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-foreground">إنجازات الفريق</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">
          <div className="flex flex-col items-center rounded-lg border border-border bg-card/40 p-4 text-center">
            <Award className="mb-2 h-6 w-6 text-amber-500" />
            <div className="text-sm font-bold text-foreground">فريق موثّق</div>
            <div className="text-xs text-muted-foreground">عضو منذ 2021</div>
          </div>
          <div className="flex flex-col items-center rounded-lg border border-border bg-card/40 p-4 text-center">
            <Star className="mb-2 h-6 w-6 text-primary" />
            <div className="text-sm font-bold text-foreground">مترجم نشط</div>
            <div className="text-xs text-muted-foreground">+50 تعريب منشور</div>
          </div>
          <div className="flex flex-col items-center rounded-lg border border-border bg-card/40 p-4 text-center">
            <Crown className="mb-2 h-6 w-6 text-amber-400" />
            <div className="text-sm font-bold text-foreground">مساهم مميّز</div>
            <div className="text-xs text-muted-foreground">جائزة المجتمع 2024</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
