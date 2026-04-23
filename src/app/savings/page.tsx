'use client'
import { useState } from 'react'
import { useStore } from '@/hooks/useStore'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { formatCurrency, formatDate, calculateProjection, getProgressColor } from '@/lib/utils'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { SavingsGoal } from '@/types'
import { Plus, PiggyBank, Trash2, TrendingUp, CalendarDays } from 'lucide-react'

const GOAL_CATEGORIES = ['retirement', 'education', 'travel', 'emergency', 'investment', 'annual', 'other'] as const
const GOAL_ICONS: Record<string, string> = {
  retirement: '👴', education: '🎓', travel: '✈️',
  emergency: '🆘', investment: '📈', annual: '📅', other: '💰'
}
const GOAL_COLORS = ['#4f46e5', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4']

export default function SavingsPage() {
  const { lang } = useLanguage()
  const store = useStore()
  const [addOpen, setAddOpen] = useState(false)
  const [depositOpen, setDepositOpen] = useState<SavingsGoal | null>(null)
  const [depositAmount, setDepositAmount] = useState('')

  const [form, setForm] = useState({
    name: '', name_th: '', category: 'emergency' as typeof GOAL_CATEGORIES[number],
    target_amount: '', current_amount: '0', monthly_target: '', deadline: '', color: GOAL_COLORS[0],
  })

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    store.addSavingsGoal({
      name: form.name,
      name_th: form.name_th || form.name,
      category: form.category,
      target_amount: parseFloat(form.target_amount) || 0,
      current_amount: parseFloat(form.current_amount) || 0,
      monthly_target: form.monthly_target ? parseFloat(form.monthly_target) : null,
      deadline: form.deadline || null,
      color: form.color,
      icon: GOAL_ICONS[form.category] || '💰',
    })
    setAddOpen(false)
    setForm({ name: '', name_th: '', category: 'emergency', target_amount: '', current_amount: '0', monthly_target: '', deadline: '', color: GOAL_COLORS[0] })
  }

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!depositOpen) return
    store.depositToGoal(depositOpen.id, parseFloat(depositAmount) || 0)
    setDepositOpen(null)
    setDepositAmount('')
  }

  const totalSaved = store.savingsGoals.reduce((s, g) => s + g.current_amount, 0)
  const totalTarget = store.savingsGoals.reduce((s, g) => s + g.target_amount, 0)

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Summary bar */}
        {store.savingsGoals.length > 0 && (
          <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-indigo-200 text-sm">{lang === 'th' ? 'ออมแล้วทั้งหมด' : 'Total Saved'}</p>
                <p className="text-3xl font-bold">{formatCurrency(totalSaved)}</p>
              </div>
              <div className="text-right">
                <p className="text-indigo-200 text-sm">{t('target', lang)}</p>
                <p className="text-xl font-semibold">{formatCurrency(totalTarget)}</p>
              </div>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${Math.min(100, (totalSaved / totalTarget) * 100)}%` }} />
            </div>
            <p className="text-xs text-indigo-200 mt-1">{((totalSaved / totalTarget) * 100).toFixed(1)}% {lang === 'th' ? 'ของเป้าหมายรวม' : 'of total goal'}</p>
          </Card>
        )}

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{store.savingsGoals.length} {lang === 'th' ? 'เป้าหมาย' : 'goals'}</p>
          <Button onClick={() => setAddOpen(true)} size="sm"><Plus size={16} /> {t('addGoal', lang)}</Button>
        </div>

        {store.savingsGoals.length === 0 ? (
          <Card className="text-center py-16">
            <PiggyBank size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400 text-sm">{t('noData', lang)}</p>
            <Button onClick={() => setAddOpen(true)} className="mt-4" size="sm"><Plus size={16} /> {t('addGoal', lang)}</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {store.savingsGoals.map(goal => {
              const pct = Math.min(100, (goal.current_amount / goal.target_amount) * 100)
              const proj = goal.monthly_target ? calculateProjection(goal.current_amount, goal.target_amount, goal.monthly_target) : null
              const progressColor = getProgressColor(pct)
              const isComplete = pct >= 100
              return (
                <Card key={goal.id} className={isComplete ? 'border-green-200 bg-green-50 dark:bg-green-900/10' : ''}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{goal.icon}</span>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white">
                          {lang === 'th' ? goal.name_th || goal.name : goal.name}
                        </p>
                        <p className="text-xs text-gray-400">{t(goal.category as any, lang)}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {!isComplete && (
                        <button onClick={() => setDepositOpen(goal)} className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-gray-400 hover:text-indigo-600 transition-colors">
                          <TrendingUp size={15} />
                        </button>
                      )}
                      <button onClick={() => store.deleteSavingsGoal(goal.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-bold text-gray-800 dark:text-gray-200">{formatCurrency(goal.current_amount)}</span>
                      <span className="text-gray-400">{formatCurrency(goal.target_amount)}</span>
                    </div>
                    <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: progressColor }}
                      />
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span style={{ color: progressColor }} className="font-medium">{pct.toFixed(1)}%</span>
                      <span className="text-gray-400">{lang === 'th' ? 'เหลือ' : 'Left'}: {formatCurrency(goal.target_amount - goal.current_amount)}</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-1">
                    {goal.monthly_target && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <TrendingUp size={12} />
                        {lang === 'th' ? 'ออมต่อเดือน' : 'Monthly'}: {formatCurrency(goal.monthly_target)}
                      </div>
                    )}
                    {goal.deadline && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <CalendarDays size={12} />
                        {t('deadline', lang)}: {formatDate(goal.deadline, lang)}
                      </div>
                    )}
                    {proj && !isComplete && (
                      <div className="flex items-center gap-1.5 text-xs text-indigo-500">
                        <CalendarDays size={12} />
                        {t('projection', lang)}: {formatDate(proj.completionDate, lang)} ({proj.monthsNeeded} {lang === 'th' ? 'เดือน' : 'months'})
                      </div>
                    )}
                    {isComplete && (
                      <p className="text-xs text-green-600 font-medium">✅ {t('completed', lang)}!</p>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Add goal modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title={t('addGoal', lang)}>
        <form onSubmit={handleAdd} className="space-y-4">
          <Select label={t('category', lang)} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as any, name_th: '', name: '' }))}>
            {GOAL_CATEGORIES.map(c => <option key={c} value={c}>{GOAL_ICONS[c]} {t(c as any, lang)}</option>)}
          </Select>
          <Input label={`${t('name', lang)} (EN)`} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Retirement Fund" required />
          <Input label={`${t('name', lang)} (ไทย)`} value={form.name_th} onChange={e => setForm(f => ({ ...f, name_th: e.target.value }))} placeholder="กองเกษียณ" />
          <Input label={`${t('target', lang)} (฿)`} type="number" value={form.target_amount} onChange={e => setForm(f => ({ ...f, target_amount: e.target.value }))} placeholder="1,000,000" required />
          <Input label={`${lang === 'th' ? 'มีอยู่แล้ว' : 'Already saved'} (฿)`} type="number" value={form.current_amount} onChange={e => setForm(f => ({ ...f, current_amount: e.target.value }))} placeholder="0" />
          <Input label={t('monthlyTarget', lang)} type="number" value={form.monthly_target} onChange={e => setForm(f => ({ ...f, monthly_target: e.target.value }))} placeholder="5,000" />
          <Input label={t('deadline', lang)} type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">{lang === 'th' ? 'สีธีม' : 'Color'}</label>
            <div className="flex gap-2">
              {GOAL_COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={`w-7 h-7 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setAddOpen(false)}>{t('cancel', lang)}</Button>
            <Button type="submit" className="flex-1">{t('save', lang)}</Button>
          </div>
        </form>
      </Modal>

      {/* Deposit modal */}
      <Modal open={!!depositOpen} onClose={() => setDepositOpen(null)} title={t('addDeposit', lang)} size="sm">
        {depositOpen && (
          <form onSubmit={handleDeposit} className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {lang === 'th' ? depositOpen.name_th || depositOpen.name : depositOpen.name}
            </p>
            <Input
              label={`${t('amount', lang)} (฿)`}
              type="number"
              value={depositAmount}
              onChange={e => setDepositAmount(e.target.value)}
              placeholder="0.00"
              required
              autoFocus
            />
            <div className="flex gap-3">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => setDepositOpen(null)}>{t('cancel', lang)}</Button>
              <Button type="submit" className="flex-1">{t('save', lang)}</Button>
            </div>
          </form>
        )}
      </Modal>
    </AppLayout>
  )
}
