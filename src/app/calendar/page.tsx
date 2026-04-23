'use client'
import { useState, useMemo } from 'react'
import { useStore } from '@/hooks/useStore'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { formatDate, getDaysUntil } from '@/lib/utils'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Appointment } from '@/types'
import { Plus, Calendar, Trash2, Edit2, Clock, Bell } from 'lucide-react'

const APPT_CATEGORIES = ['medical', 'finance', 'travel', 'work', 'family', 'personal', 'other'] as const
const APPT_COLORS: Record<string, string> = {
  medical: '#ef4444', finance: '#4f46e5', travel: '#06b6d4',
  work: '#f59e0b', family: '#ec4899', personal: '#8b5cf6', other: '#6b7280'
}
const APPT_ICONS: Record<string, string> = {
  medical: '🏥', finance: '💰', travel: '✈️',
  work: '💼', family: '👨‍👩‍👧', personal: '👤', other: '📌'
}

const MONTHS_TH = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS_TH = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
const DAYS_EN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export default function CalendarPage() {
  const { lang } = useLanguage()
  const store = useStore()
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [editItem, setEditItem] = useState<Appointment | null>(null)

  const [form, setForm] = useState({
    title: '', description: '', date: new Date().toISOString().split('T')[0],
    time: '', category: 'personal' as typeof APPT_CATEGORIES[number],
    member_id: '', reminder_days: '1',
  })

  const daysInMonth = useMemo(() => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const lastDay = new Date(year, month + 1, 0).getDate()
    const days: Array<{ date: Date | null; dateStr: string | null }> = []
    for (let i = 0; i < firstDay; i++) days.push({ date: null, dateStr: null })
    for (let d = 1; d <= lastDay; d++) {
      const date = new Date(year, month, d)
      days.push({ date, dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` })
    }
    return days
  }, [viewDate])

  const apptsByDate = useMemo(() => {
    const map: Record<string, Appointment[]> = {}
    store.appointments.forEach(a => {
      if (!map[a.date]) map[a.date] = []
      map[a.date].push(a)
    })
    return map
  }, [store.appointments])

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const color = APPT_COLORS[form.category]
    if (editItem) {
      store.updateAppointment(editItem.id, { ...form, color, reminder_days: parseInt(form.reminder_days) || 1 })
      setEditItem(null)
    } else {
      store.addAppointment({ ...form, color, reminder_days: parseInt(form.reminder_days) || 1 })
    }
    setAddOpen(false)
    setForm({ title: '', description: '', date: new Date().toISOString().split('T')[0], time: '', category: 'personal', member_id: '', reminder_days: '1' })
  }

  const openEdit = (a: Appointment) => {
    setEditItem(a)
    setForm({ title: a.title, description: a.description, date: a.date, time: a.time || '', category: a.category, member_id: a.member_id || '', reminder_days: String(a.reminder_days) })
    setAddOpen(true)
  }

  const selectedAppts = selectedDate ? (apptsByDate[selectedDate] || []) : []
  const upcomingAppts = store.appointments
    .filter(a => getDaysUntil(a.date) >= 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 10)

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Calendar */}
          <Card className="lg:col-span-2">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500">‹</button>
              <h2 className="font-bold text-gray-800 dark:text-white">
                {lang === 'th' ? MONTHS_TH[viewDate.getMonth()] : MONTHS_EN[viewDate.getMonth()]} {viewDate.getFullYear()}
              </h2>
              <button onClick={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500">›</button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {(lang === 'th' ? DAYS_TH : DAYS_EN).map(d => (
                <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {daysInMonth.map((cell, i) => {
                if (!cell.dateStr) return <div key={i} />
                const isToday = cell.dateStr === today.toISOString().split('T')[0]
                const isSelected = cell.dateStr === selectedDate
                const appts = apptsByDate[cell.dateStr] || []
                return (
                  <button
                    key={cell.dateStr}
                    onClick={() => setSelectedDate(s => s === cell.dateStr ? null : cell.dateStr)}
                    className={`relative aspect-square flex flex-col items-center justify-start p-1 rounded-xl text-sm transition-all ${isSelected ? 'bg-indigo-600 text-white' : isToday ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                  >
                    <span className="text-xs font-medium leading-none mt-1">{cell.date!.getDate()}</span>
                    {appts.length > 0 && (
                      <div className="flex gap-0.5 mt-1">
                        {appts.slice(0, 3).map((a, j) => (
                          <div key={j} className="w-1.5 h-1.5 rounded-full" style={{ background: isSelected ? 'white' : a.color }} />
                        ))}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Selected date appointments */}
            {selectedDate && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {formatDate(selectedDate, lang)}
                  </h3>
                  <button onClick={() => { setForm(f => ({ ...f, date: selectedDate })); setAddOpen(true) }}
                    className="text-xs text-indigo-600 hover:underline">+ {t('add', lang)}</button>
                </div>
                {selectedAppts.length === 0 ? (
                  <p className="text-xs text-gray-400">{t('noData', lang)}</p>
                ) : (
                  <div className="space-y-2">
                    {selectedAppts.map(a => {
                      const member = store.members.find(m => m.id === a.member_id)
                      return (
                        <div key={a.id} className="flex items-center gap-2 p-2 rounded-xl" style={{ background: a.color + '15' }}>
                          <span>{APPT_ICONS[a.category]}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: a.color }}>{a.title}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              {a.time && <><Clock size={10} />{a.time}</>}
                              {member && <span style={{ color: member.avatar_color }}>{member.name}</span>}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => openEdit(a)} className="p-1 hover:bg-white/50 rounded-lg"><Edit2 size={12} style={{ color: a.color }} /></button>
                            <button onClick={() => store.deleteAppointment(a.id)} className="p-1 hover:bg-white/50 rounded-lg"><Trash2 size={12} className="text-gray-400 hover:text-red-500" /></button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Upcoming list */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 dark:text-white text-sm">{t('upcomingEvents', lang)}</h3>
              <Button onClick={() => { setEditItem(null); setAddOpen(true) }} size="sm"><Plus size={14} /> {t('add', lang)}</Button>
            </div>
            {upcomingAppts.length === 0 ? (
              <Card className="text-center py-10">
                <Calendar size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-400 text-sm">{t('noData', lang)}</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {upcomingAppts.map(a => {
                  const days = getDaysUntil(a.date)
                  const member = store.members.find(m => m.id === a.member_id)
                  return (
                    <Card key={a.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedDate(a.date)}>
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0" style={{ background: a.color + '20' }}>
                          {APPT_ICONS[a.category]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{a.title}</p>
                          <p className="text-xs text-gray-400">{formatDate(a.date, lang)}{a.time && ` • ${a.time}`}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {member && (
                              <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: member.avatar_color + '20', color: member.avatar_color }}>
                                {member.name}
                              </span>
                            )}
                            <span className={`text-xs font-medium ${days === 0 ? 'text-red-500' : days <= 3 ? 'text-orange-500' : 'text-green-600'}`}>
                              {days === 0 ? (lang === 'th' ? 'วันนี้!' : 'Today!') :
                                days === 1 ? (lang === 'th' ? 'พรุ่งนี้' : 'Tomorrow') :
                                `${days} ${lang === 'th' ? 'วัน' : 'days'}`}
                            </span>
                          </div>
                        </div>
                        <button onClick={e => { e.stopPropagation(); store.deleteAppointment(a.id) }} className="p-1 hover:bg-red-50 rounded-lg text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal open={addOpen} onClose={() => { setAddOpen(false); setEditItem(null) }} title={editItem ? t('edit', lang) : t('addAppointment', lang)}>
        <form onSubmit={handleAdd} className="space-y-4">
          <Input label={t('name', lang)} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder={lang === 'th' ? 'ชื่อนัดหมาย' : 'Appointment title'} required />
          <Select label={t('category', lang)} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as any }))}>
            {APPT_CATEGORIES.map(c => <option key={c} value={c}>{APPT_ICONS[c]} {t(c as any, lang)}</option>)}
          </Select>
          <Textarea label={t('description', lang)} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder={lang === 'th' ? 'รายละเอียดเพิ่มเติม...' : 'Additional details...'} />
          <div className="grid grid-cols-2 gap-3">
            <Input label={t('date', lang)} type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
            <Input label={t('time', lang)} type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
          </div>
          <Select label={t('member', lang)} value={form.member_id} onChange={e => setForm(f => ({ ...f, member_id: e.target.value }))}>
            <option value="">{t('all', lang)}</option>
            {store.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </Select>
          <Input label={t('reminderDays', lang)} type="number" min="0" max="30" value={form.reminder_days} onChange={e => setForm(f => ({ ...f, reminder_days: e.target.value }))} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => { setAddOpen(false); setEditItem(null) }}>{t('cancel', lang)}</Button>
            <Button type="submit" className="flex-1">{editItem ? t('save', lang) : t('add', lang)}</Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  )
}
