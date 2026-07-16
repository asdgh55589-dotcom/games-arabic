'use client'

import { Settings, Crown, Shield, Star, User as UserIcon } from 'lucide-react'

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">الإعدادات</h1>
        <p className="mt-1 text-sm text-muted-foreground">إعدادات الموقع العامة — متاحة للمالك فقط</p>
      </div>

      <div className="rounded-xl border border-border bg-card/30 p-5">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold">
          <Settings className="h-4 w-4" /> الصلاحيات والأدوار
        </h2>
        <div className="space-y-3 text-sm">
          <RoleRow icon={<Crown className="h-4 w-4 text-amber-500" />} name="مالك الموقع" desc="كل الصلاحيات + إدارة الأدوار + إعدادات الموقع" />
          <RoleRow icon={<Shield className="h-4 w-4 text-red-500" />} name="مدير" desc="إدارة كل التعريبات والألعاب + إدارة المستخدمين" />
          <RoleRow icon={<Star className="h-4 w-4 text-purple-500" />} name="مشرف" desc="نشر/تعديل التعريبات (تعريبه فقط) — لا حذف" />
          <RoleRow icon={<UserIcon className="h-4 w-4 text-blue-500" />} name="عضو" desc="لا يملك صلاحية لوحة التحكم" />
        </div>
      </div>

      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
        <h2 className="mb-2 text-base font-bold text-amber-500">قريباً</h2>
        <p className="text-sm text-muted-foreground">
          إعدادات الموقع العامة (اسم الموقع، الشعار، الألوان، إعدادات SEO، إلخ) ستضاف في إصدار لاحق.
        </p>
      </div>
    </div>
  )
}

function RoleRow({ icon, name, desc }: { icon: React.ReactNode; name: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-border/50 p-3">
      <div className="shrink-0">{icon}</div>
      <div>
        <div className="font-medium text-foreground">{name}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
    </div>
  )
}
