'use client'
import { useState } from 'react'
import { useStore } from '@/hooks/useStore'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { formatCurrency, formatDate } from '@/lib/utils'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { Debt } from '@/types'
import { Plus, BadgeDollarSign, Trash2, CreditCard, AlertCircle } from 'lucide-react'

const DEBT_TYPES = ['mortgage', 'car', 'personal', 'credit_card', 'student', 'other'] as const
const DEBT_ICONS: Record<string, string> = { mortgage: '🏠', car: '🚗', personal: '💳', credit_card: '💳', student: '🎓', other: '💸' }

export default function DebtsPage() {
  const { lang } = useLanguage()
  const store = useStore()
  const [addOpen, setAddOpen] = useState(false)
  const [payOpen, setPayOpen] = useState<Debt | null>(null)
  const [payAmount, setPayAmount] = useState('')

  const [form, setForm] = useState({
    name: '', lender: '', type: 'personal' as typeof DEBT_TYPES[number],
    total_amount: '', remaining_amount: '', interest_rate: '0',
    monthly_payment: '', payment_date: '', member_id: '',
  })

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    store.addDebt({
      name: form.name,
      lender: form.lender,
      type: form.type,
      total_amount: parseFloat(form.total_amount) || 0,
      remaining_amount: parseFloat(form.remaining_amount) || parseFloat(form.total_amount) || 0,
      interest_rate: parseFloat(form.interest_rate) || 0,
      monthly_payment: form.monthly_payment ? parseFloat(form.monthly_payment) : null,
      payment_date: form.payment_date ? parseInt(form.payment_date) : null,
      member_id: form.member_id || null,
    })
    setAddOpen(false)
    setForm({ name: '', lender: '', type: 'personal', total_amount: '', remaining_amount: '', interest_rate: '0', monthly_payment: '', payment_date: '', member_id: '' })
  }

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault()
    if (!payOpen) return
    store.payDebt(payOpen.id, parseFloat(payAmount) || 0)
    setPayOpen(null)
    setPayAmount('')
  }

  const totalDebt = store.debts.reduce((s, d) => s + d.remaining_amount, 0)
  const totalMonthly = store.debts.reduce((s, d) => s + (d.monthly_payment || 0), 0)

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Summary */}
        {store.debts.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-red-100 bg-red-50 dark:bg-red-900/10 dark:border-red-900">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-red-400" size={24} />
                <div>
                  <p className="text-xs text-red-400">{t('totalDebts', lang)}</p>
                  <p className="text-xl font-bold text-red-600">{formatCurrency(totalDebt)}</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <CreditCard className="text-orange-400" size={24} />
                <div>
                  <p className="text-xs text-gray-400">{lang === 'th' ? 'ผ่อนรายเดือน' : 'Monthly payments'}</p>
                  <p className="text-xl font-bold text-orange-600">{formatCurrency(totalMonthly)}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{store.debts.length} {lang === 'th' ? 'รายการ' : 'debts'}</p>
          <Button onClick={() => setAddOpen(true)} size="sm"><Plus size={16} /> {t('addDebt', lang)}</Button>
        </div>

        {store.debts.length === 0 ? (
          <Card className="text-center py-16">
            <BadgeDollarSign size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400 text-sm">{lang === 'th' ? 'ไม่มีหนี้สิน 🎉' : 'No debts! 🎉'}</p>
            <Button onClick={() => setAddOpen(true)} className="mt-4" size="sm"><Plus size={16} /> {t('addDebt', lang)}</Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {store.debts.map(debt => {
              const pct = Math.min(100, ((debt.total_amount - debt.remaining_amount) / debt.total_amount) * 100)
              const member = store.members.find(m => m.id === debt.member_id)
              const isPaid = debt.remaining_amount <= 0
              return (
                <Card key={debt.id} className={isPaid ? 'opacity-60' : ''}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{DEBT_ICONS[debt.type]}</span>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white">{debt.name}</p>
                        <p className="text-xs text-gray-400">
                          {t(debt.type as any, lang)}
                          {debt.lender && ` • ${debt.lender}`}
                          {member && <span style={{ color: member.avatar_color }}> • {member.name}</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {!isPaid && (
                        <button onClick={() => setPayOpen(debt)} className="text-xs px-2 py-1 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100 transition-colors font-medium">
                          {lang === 'th' ? 'ชำระ' : 'Pay'}
                        </button>
                      )}
                      <button onClick={() => store.deleteDebt(debt.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-400">{lang === 'th' ? 'ยอดกู้ทั้งหมด' : 'Total'}</p>
                      <p className="font-semibold">{formatCurrency(debt.total_amount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{t('remaining', lang)}</p>
                      <p className={`font-bold ${isPaid ? 'text-green-600' : 'text-red-500'}`}>{formatCurrency(debt.remaining_amount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{lang === 'th' ? 'ดอกเบี้ย' : 'Interest'}</p>
                      <p className="font-semibold">{debt.interest_rate}%</p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-1">
                    <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{lang === 'th' ? 'ชำระแล้ว' : 'Paid'} {pct.toFixed(1)}%</span>
                    {debt.monthly_payment && <span>{lang === 'th' ? 'ผ่อนเดือนละ' : 'Monthly'}: {formatCurrency(debt.monthly_payment)}</span>}
                    {debt.payment_date && <span>{lang === 'th' ? 'ทุกวันที่' : 'Every'} {debt.payment_date}</span>}
                  </div>
                  {isPaid && <p className="text-xs text-green-600 font-medium mt-1">✅ {lang === 'th' ? 'ชำระหมดแล้ว' : 'Fully paid!'}</p>}
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title={t('addDebt', lang)}>
        <form onSubmit={handleAdd} className="space-y-4">
          <Input label={t('name', lang)} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={lang === 'th' ? 'เช่น สินเชื่อบ้าน' : 'e.g. Home loan'} required />
          <Select label={t('type', lang)} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}>
            {DEBT_TYPES.map(dt => <option key={dt} value={dt}>{DEBT_ICONS[dt]} {t(dt as any, lang)}</option>)}
          </Select>
          <Input label={t('lender', lang)} value={form.lender} onChange={e => setForm(f => ({ ...f, lender: e.target.value }))} placeholder={lang === 'th' ? 'ชื่อธนาคาร/เจ้าหนี้' : 'Bank / lender name'} />
          <Input label={`${lang === 'th' ? 'ยอดกู้ทั้งหมด' : 'Total amount'} (฿)`} type="number" value={form.total_amount} onChange={e => setForm(f => ({ ...f, total_amount: e.target.value }))} required />
          <Input label={`${t('remaining', lang)} (฿)`} type="number" value={form.remaining_amount} onChange={e => setForm(f => ({ ...f, remaining_amount: e.target.value }))} placeholder={lang === 'th' ? 'ว่างไว้ = เท่ากับยอดกู้' : 'Leave empty = same as total'} />
          <Input label={t('interestRate', lang)} type="number" step="0.01" value={form.interest_rate} onChange={e => setForm(f => ({ ...f, interest_rate: e.target.value }))} placeholder="0.00" />
          <Input label={`${lang === 'th' ? 'ยอดผ่อนรายเดือน' : 'Monthly payment'} (฿)`} type="number" value={form.monthly_payment} onChange={e => setForm(f => ({ ...f, monthly_payment: e.target.value }))} />
          <Input label={t('paymentDate', lang)} type="number" min="1" max="31" value={form.payment_date} onChange={e => setForm(f => ({ ...f, payment_date: e.target.value }))} placeholder="1-31" />
          <Select label={t('member', lang)} value={form.member_id} onChange={e => setForm(f => ({ ...f, member_id: e.target.value }))}>
            <option value="">{t('all', lang)}</option>
            {store.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </Select>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setAddOpen(false)}>{t('cancel', lang)}</Button>
            <Button type="submit" className="flex-1">{t('save', lang)}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!payOpen} onClose={() => setPayOpen(null)} title={lang === 'th' ? 'บันทึกการชำระ' : 'Record Payment'} size="sm">
        {payOpen && (
          <form onSubmit={handlePay} className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {payOpen.name} — {lang === 'th' ? 'เหลือ' : 'Remaining'}: <strong>{formatCurrency(payOpen.remaining_amount)}</strong>
            </p>
            <Input
              label={`${lang === 'th' ? 'ยอดชำระ' : 'Payment amount'} (฿)`}
              type="number"
              value={payAmount}
              onChange={e => setPayAmount(e.target.value)}
              placeholder={payOpen.monthly_payment?.toString() || '0'}
              autoFocus
            />
            <div className="flex gap-3">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => setPayOpen(null)}>{t('cancel', lang)}</Button>
              <Button type="submit" className="flex-1">{t('confirm', lang)}</Button>
            </div>
          </form>
        )}
      </Modal>
    </AppLayout>
  )
}
