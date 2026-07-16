'use client'

import { useEffect, useState } from 'react'
import { Loader2, Crown, Shield, Star, User as UserIcon, Trash2, Plus, Search, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { timeAgo } from '@/lib/format'

interface UserItem {
  id: string
  username: string
  email: string
  avatarUrl: string | null
  bio: string | null
  role: string
  joinedAt: string
  _count: { mods: number }
}

const ROLE_BADGE: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  owner:     { label: 'مالك', icon: <Crown className="h-3 w-3" />, className: 'bg-amber-500 text-white' },
  admin:     { label: 'مدير',  icon: <Shield className="h-3 w-3" />, className: 'bg-red-500 text-white' },
  moderator: { label: 'مشرف',  icon: <Star className="h-3 w-3" />,  className: 'bg-purple-500 text-white' },
  member:    { label: 'عضو',   icon: <UserIcon className="h-3 w-3" />, className: 'bg-blue-500 text-white' },
}

export default function AdminUsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)

  // نموذج إضافة مستخدم
  const [newUsername, setNewUsername] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState('member')

  // نموذج تغيير كلمة المرور
  const [changePwUserId, setChangePwUserId] = useState<string | null>(null)
  const [newPw, setNewPw] = useState('')

  useEffect(() => {
    fetch('/api/admin/users')
      .then((r) => {
        if (!r.ok) throw new Error('Failed')
        return r.json()
      })
      .then((data) => data?.users ? setUsers(data.users) : null)
      .catch(() => setError('فشل تحميل المستخدمين'))
      .finally(() => setLoading(false))
  }, [])

  const filteredUsers = users.filter((u) => {
    const matchSearch = !search || u.username.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  const onRoleChange = async (user: UserItem, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'فشل التحديث')
      toast({ title: 'تم التحديث', description: `تم تغيير دور ${user.username} إلى ${ROLE_BADGE[newRole]?.label || newRole}` })
      setUsers((p) => p.map((u) => u.id === user.id ? { ...u, role: newRole } : u))
    } catch (err) {
      toast({ title: 'خطأ', description: err instanceof Error ? err.message : 'فشل التحديث', variant: 'destructive' })
    }
  }

  const onChangePassword = async (userId: string) => {
    if (!newPw || newPw.length < 6) {
      toast({ title: 'كلمة المرور قصيرة', description: 'يجب أن تكون 6 أحرف على الأقل', variant: 'destructive' })
      return
    }
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPw }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'فشل التحديث')
      toast({ title: 'تم التحديث', description: 'تم تغيير كلمة المرور بنجاح' })
      setChangePwUserId(null)
      setNewPw('')
    } catch (err) {
      toast({ title: 'خطأ', description: err instanceof Error ? err.message : 'فشل', variant: 'destructive' })
    }
  }

  const onDelete = async (user: UserItem) => {
    if (!confirm(`هل أنت متأكد من حذف المستخدم "${user.username}"؟`)) return
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data?.error || 'فشل الحذف')
      }
      toast({ title: 'تم الحذف', description: `تم حذف ${user.username}` })
      setUsers((p) => p.filter((u) => u.id !== user.id))
    } catch (err) {
      toast({ title: 'خطأ', description: err instanceof Error ? err.message : 'فشل الحذف', variant: 'destructive' })
    }
  }

  const onAddUser = async () => {
    if (!newUsername || !newEmail || !newPassword) {
      toast({ title: 'بيانات ناقصة', variant: 'destructive' })
      return
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      toast({ title: 'بريد غير صالح', description: 'أدخل صيغة بريد إلكتروني صحيحة', variant: 'destructive' })
      return
    }
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername, email: newEmail, password: newPassword, role: newRole }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'فشل الإنشاء')
      toast({ title: 'تم الإنشاء', description: `تم إنشاء ${newUsername} بنجاح` })
      setUsers((p) => [{ ...data.user, _count: { mods: 0 } } as UserItem, ...p])
      setNewUsername(''); setNewEmail(''); setNewPassword(''); setNewRole('member')
      setShowAddForm(false)
    } catch (err) {
      toast({ title: 'خطأ', description: err instanceof Error ? err.message : 'فشل الإنشاء', variant: 'destructive' })
    }
  }

  if (loading) {
    return <div className="grid place-items-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  if (error) {
    return (
      <div className="grid place-items-center py-20 text-center">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">المستخدمون</h1>
          <p className="mt-1 text-sm text-muted-foreground">{filteredUsers.length} مستخدم</p>
        </div>
        <Button onClick={() => setShowAddForm((s) => !s)}>
          <Plus className="ml-2 h-4 w-4" /> إضافة مستخدم
        </Button>
      </div>

      {/* الفلاتر */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم أو البريد..."
            className="h-10 pr-10"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-10 rounded-md border border-border bg-background px-3 text-sm"
        >
          <option value="all">كل الأدوار</option>
          <option value="owner">مالك</option>
          <option value="admin">مدير</option>
          <option value="moderator">مشرف</option>
          <option value="member">عضو</option>
        </select>
      </div>

      {/* نموذج إضافة */}
      {showAddForm && (
        <div className="space-y-3 rounded-xl border border-border bg-card/40 p-4">
          <h3 className="text-sm font-bold">إضافة مستخدم جديد</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label>اسم المستخدم</Label>
              <Input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
            </div>
            <div>
              <Label>البريد الإلكتروني</Label>
              <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
            </div>
            <div>
              <Label>كلمة المرور</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div>
              <Label>الدور</Label>
              <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm">
                <option value="member">عضو</option>
                <option value="moderator">مشرف</option>
                <option value="admin">مدير</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAddForm(false)}>إلغاء</Button>
            <Button onClick={onAddUser}>إنشاء</Button>
          </div>
        </div>
      )}

      {/* القائمة */}
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-right">
          <thead className="border-b border-border bg-card/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">المستخدم</th>
              <th className="hidden px-4 py-3 font-semibold md:table-cell">البريد</th>
              <th className="px-4 py-3 font-semibold">الدور</th>
              <th className="hidden px-4 py-3 font-semibold sm:table-cell">التعريبات</th>
              <th className="hidden px-4 py-3 font-semibold lg:table-cell">انضم في</th>
              <th className="px-4 py-3 font-semibold">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredUsers.map((u) => {
              const role = ROLE_BADGE[u.role] || ROLE_BADGE.member
              return (
                <tr key={u.id} className="text-sm transition-colors hover:bg-accent/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {u.avatarUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={u.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                      )}
                      <span className="font-medium">{u.username}</span>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-muted-foreground md:table-cell">{u.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => onRoleChange(u, e.target.value)}
                      className={`rounded px-2 py-1 text-xs font-bold ${role.className}`}
                    >
                      <option value="member" className="bg-background text-foreground">عضو</option>
                      <option value="moderator" className="bg-background text-foreground">مشرف</option>
                      <option value="admin" className="bg-background text-foreground">مدير</option>
                      {u.role === 'owner' && <option value="owner" className="bg-background text-foreground">مالك</option>}
                    </select>
                  </td>
                  <td className="hidden px-4 py-3 text-xs sm:table-cell">{u._count.mods}</td>
                  <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">{timeAgo(u.joinedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => { setChangePwUserId(u.id); setNewPw('') }}
                        title="تغيير كلمة المرور"
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                      {u.role !== 'owner' && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-400 hover:bg-red-500/10 hover:text-red-500"
                          onClick={() => onDelete(u)}
                          title="حذف"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* نموذج تغيير كلمة المرور (Modal) */}
      {changePwUserId && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50" onClick={() => setChangePwUserId(null)}>
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-3 text-sm font-bold">تغيير كلمة المرور</h3>
            <Input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="كلمة المرور الجديدة"
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') onChangePassword(changePwUserId) }}
            />
            <div className="mt-3 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setChangePwUserId(null)}>إلغاء</Button>
              <Button size="sm" onClick={() => onChangePassword(changePwUserId)}>حفظ</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
