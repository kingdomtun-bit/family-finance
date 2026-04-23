'use client'
import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/hooks/useStore'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { formatCurrency, formatDate, isThisMonth, getDaysUntil } from '@/lib/utils'
import { StatCard, Card } from '@/components/ui/Card'
import { AppLayout } from '@/components/layout/AppLayout'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { TrendingUp, TrendingDown, Wallet, AlertCircle, Calendar, Target } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'

const MONTHS_SHORT_TH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
const MONTHS_SHORT_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function DashboardPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const store = useStore()

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('logged_in')) {
      router.push('/login')
    }
  }, [router])

  const totalAssets = store.accounts.reduce((s, a) => s + a.balance, 0)
  const totalDebts = store.debts.reduce((s, d) => s + d.remaining_amount, 0)
  const netWorth = totalAssets - totalDebts

  const thisMonthTx = store.transactions.filter(tx => isThisMonth(tx.date))
  const monthlyIncome = thisMonthTx.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0)
  const monthlyExpense = thisMonthTx.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0)

  // Last 6 months chart data
  const chartData = useMemo(() => {
    const months = MONTHS_SHORT_TH
    const now = new Date()
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
      const m = d.getMonth()
      const y = d.getFullYear()
      const txs = store.transactions.filter(tx => {
        const td = new Date(tx.date)
        return td.getMonth() === m && td.getFullYear() === y
      })
      return {
        name: lang === 'th' ? MONTHS_SHORT_TH[m] : MONTHS_SHORT_EN[m],
        income: txs.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0),
        expense: txs.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0),
      }
    })
  }, [store.transactions, lang])

  // Expense by category pie
  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {}
    thisMonthTx.filter(tx => tx.type === 'expense').forEach(tx => {
      map[tx.category] = (map[tx.category] || 0) + tx.amount
    })
    return Object.entries(map).map(([k, v]) => ({ name: t(k as any, lang), value: v })).sort((a, b) => b.value - a.value).slice(0, 5)
  }, [thisMonthTx, lang])

  const PIE_COLORS = ['#4f46e5', '#ec4899', '#f59e0b', '#10b981', '#ef4444']

  const upcomingAppts = store.appointments
    .filter(a => getDaysUntil(a.date) >= 0 && getDaysUntil(a.date) <= 30)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3)

  const recentTx = store.transactions.slice(0, 5)

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label={t('totalAssets', lang)}
            value={formatCurrency(totalAssets)}
            icon={<Wallet size={20} />}
            color="bg-indigo-500"
          />
          <StatCard
            label={t('netWorth', lang)}
            value={formatCurrency(netWorth)}
            icon={<TrendingUp size={20} />}
            color={netWorth >= 0 ? 'bg-green-500' : 'bg-red-500'}
          />
          <StatCard
            label={t('monthlyIncome', lang)}
            value={formatCurrency(monthlyIncome)}
            icon={<TrendingUp size={20} />}
            color="bg-emerald-500"
          />
          <StatCard
            label={t('monthlyExpense', lang)}
            value={formatCurrency(monthlyExpense)}
            icon={<TrendingDown size={20} />}
            color="bg-rose-500"
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Income vs Expense chart */}
          <Card className="lg:col-span-2">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
              {lang === 'th' ? 'รายรับ vs รายจ่าย (6 เดือน)' : 'Income vs Expense (6 months)'}
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Area type="monotone" dataKey="income" stroke="#4f46e5" fill="url(#colorIncome)" strokeWidth={2} name={t('income', lang)} />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="url(#colorExpense)" strokeWidth={2} name={t('expense', lang)} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Expense pie */}
          <Card>
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
              {lang === 'th' ? 'รายจ่ายเดือนนี้' : 'This Month Expenses'}
            </h3>
            {expenseByCategory.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-gray-400 text-sm">{t('noData', lang)}</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={130}>
                  <PieChart>
                    <Pie data={expenseByCategory} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value">
                      {expenseByCategory.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1 mt-2">
                  {expenseByCategory.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent transactions */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 dark:text-white">{t('recentTransactions', lang)}</h3>
              <Link href="/transactions" className="text-xs text-indigo-600 hover:underline">
                {lang === 'th' ? 'ดูทั้งหมด' : 'View all'}
              </Link>
            </div>
            {recentTx.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">{t('noData', lang)}</p>
            ) : (
              <div className="space-y-3">
                {recentTx.map(tx => (
                  <div key={tx.id} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${tx.type === 'income' ? 'bg-green-500' : 'bg-red-400'}`}>
                      {tx.type === 'income' ? '+' : '-'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{tx.description || t(tx.category as any, lang)}</p>
                      <p className="text-xs text-gray-400">{formatDate(tx.date, lang)}</p>
                    </div>
                    <p className={`text-sm font-bold flex-shrink-0 ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Upcoming & Savings */}
          <div className="space-y-4">
            {/* Savings goals quick */}
            <Card>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800 dark:text-white text-sm">{t('savingsProgress', lang)}</h3>
                <Link href="/savings" className="text-xs text-indigo-600 hover:underline">
                  {lang === 'th' ? 'ดูทั้งหมด' : 'All'}
                </Link>
              </div>
              {store.savingsGoals.slice(0, 3).length === 0 ? (
                <p className="text-gray-400 text-xs text-center py-2">{t('noData', lang)}</p>
              ) : (
                <div className="space-y-3">
                  {store.savingsGoals.slice(0, 3).map(g => {
                    const pct = Math.min(100, (g.current_amount / g.target_amount) * 100)
                    return (
                      <div key={g.id}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-700 dark:text-gray-300 font-medium">{lang === 'th' ? g.name_th || g.name : g.name}</span>
                          <span className="text-gray-500">{pct.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: g.color }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>

            {/* Upcoming appointments */}
            <Card>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800 dark:text-white text-sm">{t('upcomingEvents', lang)}</h3>
                <Link href="/calendar" className="text-xs text-indigo-600 hover:underline">
                  {lang === 'th' ? 'ดูทั้งหมด' : 'All'}
                </Link>
              </div>
              {upcomingAppts.length === 0 ? (
                <p className="text-gray-400 text-xs text-center py-2">{t('noData', lang)}</p>
              ) : (
                <div className="space-y-2">
                  {upcomingAppts.map(a => {
                    const days = getDaysUntil(a.date)
                    return (
                      <div key={a.id} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{ background: a.color + '20' }}>
                          <Calendar size={14} style={{ color: a.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{a.title}</p>
                          <p className="text-xs text-gray-400">
                            {days === 0 ? (lang === 'th' ? 'วันนี้' : 'Today') :
                              days === 1 ? (lang === 'th' ? 'พรุ่งนี้' : 'Tomorrow') :
                              `${days} ${lang === 'th' ? 'วัน' : 'days'}`}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Debt alert */}
        {totalDebts > 0 && (
          <Card className="border-orange-100 bg-orange-50 dark:bg-orange-900/10 dark:border-orange-800">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-orange-500 flex-shrink-0" size={20} />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                  {lang === 'th' ? `หนี้คงเหลือรวม ${formatCurrency(totalDebts)}` : `Total remaining debt: ${formatCurrency(totalDebts)}`}
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  {lang === 'th' ? 'คิดเป็น ' : 'That is '}
                  {totalAssets > 0 ? ((totalDebts / totalAssets) * 100).toFixed(1) : 0}%
                  {lang === 'th' ? ' ของสินทรัพย์ทั้งหมด' : ' of total assets'}
                </p>
              </div>
              <Link href="/debts" className="text-xs text-orange-600 font-medium hover:underline whitespace-nowrap">
                {lang === 'th' ? 'ดูหนี้สิน' : 'View Debts'}
              </Link>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
