'use client'
import { useMemo, useState } from 'react'
import { useStore } from '@/hooks/useStore'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { formatCurrency, getCurrentYear } from '@/lib/utils'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts'

const MONTHS_TH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const PIE_COLORS = ['#4f46e5', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316']

export default function ReportsPage() {
  const { lang } = useLanguage()
  const store = useStore()
  const [year, setYear] = useState(getCurrentYear())
  const years = useMemo(() => {
    const ys = new Set<number>([getCurrentYear()])
    store.transactions.forEach(tx => ys.add(new Date(tx.date).getFullYear()))
    return Array.from(ys).sort((a, b) => b - a)
  }, [store.transactions])

  // Monthly income/expense for selected year
  const monthlyData = useMemo(() => {
    const months = lang === 'th' ? MONTHS_TH : MONTHS_EN
    return months.map((name, i) => {
      const txs = store.transactions.filter(tx => {
        const d = new Date(tx.date)
        return d.getMonth() === i && d.getFullYear() === year
      })
      return {
        name,
        income: txs.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0),
        expense: txs.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0),
      }
    })
  }, [store.transactions, year, lang])

  // Net per month
  const netData = useMemo(() => monthlyData.map(m => ({ ...m, net: m.income - m.expense })), [monthlyData])

  // Expense by category (full year)
  const expenseByCat = useMemo(() => {
    const map: Record<string, number> = {}
    store.transactions
      .filter(tx => tx.type === 'expense' && new Date(tx.date).getFullYear() === year)
      .forEach(tx => { map[tx.category] = (map[tx.category] || 0) + tx.amount })
    return Object.entries(map).map(([k, v]) => ({ name: t(k as any, lang), value: v })).sort((a, b) => b.value - a.value)
  }, [store.transactions, year, lang])

  // Per member
  const memberData = useMemo(() => {
    return store.members.map(m => {
      const txs = store.transactions.filter(tx => tx.member_id === m.id && new Date(tx.date).getFullYear() === year)
      return {
        name: m.name,
        income: txs.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0),
        expense: txs.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0),
        color: m.avatar_color,
      }
    })
  }, [store.members, store.transactions, year])

  const yearlyIncome = monthlyData.reduce((s, m) => s + m.income, 0)
  const yearlyExpense = monthlyData.reduce((s, m) => s + m.expense, 0)
  const yearlySavings = yearlyIncome - yearlyExpense

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Year selector */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{lang === 'th' ? 'ปี' : 'Year'}:</label>
          <select
            className="px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none"
            value={year}
            onChange={e => setYear(parseInt(e.target.value))}
          >
            {years.map(y => <option key={y} value={y}>{lang === 'th' ? y + 543 : y}</option>)}
          </select>
        </div>

        {/* Year summary */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-green-50 dark:bg-green-900/10 border-green-100">
            <p className="text-xs text-green-500">{lang === 'th' ? 'รายรับทั้งปี' : 'Yearly Income'}</p>
            <p className="text-xl font-bold text-green-700 dark:text-green-400">{formatCurrency(yearlyIncome)}</p>
          </Card>
          <Card className="bg-red-50 dark:bg-red-900/10 border-red-100">
            <p className="text-xs text-red-500">{lang === 'th' ? 'รายจ่ายทั้งปี' : 'Yearly Expense'}</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(yearlyExpense)}</p>
          </Card>
          <Card className={`${yearlySavings >= 0 ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100' : 'bg-orange-50 border-orange-100'}`}>
            <p className="text-xs text-indigo-500">{lang === 'th' ? 'ออมได้' : 'Net Savings'}</p>
            <p className={`text-xl font-bold ${yearlySavings >= 0 ? 'text-indigo-700 dark:text-indigo-400' : 'text-orange-600'}`}>{formatCurrency(yearlySavings)}</p>
          </Card>
        </div>

        {/* Monthly bar chart */}
        <Card>
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
            {lang === 'th' ? 'รายรับ-รายจ่ายรายเดือน' : 'Monthly Income & Expense'}
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Legend />
              <Bar dataKey="income" name={t('income', lang)} fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={20} />
              <Bar dataKey="expense" name={t('expense', lang)} fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Net line chart */}
        <Card>
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
            {lang === 'th' ? 'เงินออมสุทธิรายเดือน' : 'Monthly Net Savings'}
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={netData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Line type="monotone" dataKey="net" name={lang === 'th' ? 'ออมสุทธิ' : 'Net'} stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Expense by category */}
          <Card>
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
              {lang === 'th' ? 'รายจ่ายตามหมวดหมู่' : 'Expense by Category'}
            </h3>
            {expenseByCat.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">{t('noData', lang)}</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={expenseByCat} cx="50%" cy="50%" outerRadius={70} paddingAngle={2} dataKey="value">
                      {expenseByCat.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {expenseByCat.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">{((item.value / yearlyExpense) * 100).toFixed(1)}%</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{formatCurrency(item.value)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>

          {/* Per member */}
          <Card>
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
              {lang === 'th' ? 'รายรับ-จ่ายแต่ละสมาชิก' : 'Per Member Summary'}
            </h3>
            {memberData.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">{t('noData', lang)}</p>
            ) : (
              <div className="space-y-4">
                {memberData.map((m, i) => (
                  <div key={i} className="p-3 rounded-xl" style={{ background: m.color + '10' }}>
                    <p className="font-semibold text-sm mb-2" style={{ color: m.color }}>{m.name}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-gray-400">{t('income', lang)}</p>
                        <p className="font-bold text-green-600">{formatCurrency(m.income)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">{t('expense', lang)}</p>
                        <p className="font-bold text-red-500">{formatCurrency(m.expense)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Savings goals status */}
        {store.savingsGoals.length > 0 && (
          <Card>
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
              {lang === 'th' ? 'สถานะเป้าหมายออมทั้งหมด' : 'All Savings Goals Status'}
            </h3>
            <div className="space-y-3">
              {store.savingsGoals.map(g => {
                const pct = Math.min(100, (g.current_amount / g.target_amount) * 100)
                return (
                  <div key={g.id} className="flex items-center gap-3">
                    <span className="text-lg">{g.icon}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{lang === 'th' ? g.name_th || g.name : g.name}</span>
                        <span className="text-gray-400 text-xs">{formatCurrency(g.current_amount)} / {formatCurrency(g.target_amount)}</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: g.color }} />
                      </div>
                    </div>
                    <span className="text-xs font-bold w-12 text-right" style={{ color: g.color }}>{pct.toFixed(0)}%</span>
                  </div>
                )
              })}
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
