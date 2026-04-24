'use client'
import { useState, useMemo, useRef } from 'react'
import { useStore } from '@/hooks/useStore'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { formatCurrency, formatDate } from '@/lib/utils'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, BANK_NAMES } from '@/types'
import { Plus, Trash2, ArrowUpRight, ArrowDownLeft, Search, Camera, Loader2 } from 'lucide-react'

export default function TransactionsPage() {
  const { lang } = useLanguage()
  const store = useStore()
  const [addOpen, setAddOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [filterMonth, setFilterMonth] = useState('')
  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState('')
  const [scanPreview, setScanPreview] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: 'food',
    description: '',
    date: new Date().toISOString().split('T')[0],
    account_id: '',
    member_id: '',
  })

  const compressImage = (file: File): Promise<{ base64: string; mediaType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onerror = () => reject(new Error('Cannot read file'))
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string
        const img = new Image()
        img.onerror = () => reject(new Error('Cannot load image'))
        img.onload = () => {
          const MAX = 1024
          let { width, height } = img
          if (width > MAX || height > MAX) {
            if (width > height) { height = Math.round(height * MAX / width); width = MAX }
            else { width = Math.round(width * MAX / height); height = MAX }
          }
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
          const compressed = canvas.toDataURL('image/jpeg', 0.8)
          resolve({ base64: compressed.split(',')[1], mediaType: 'image/jpeg' })
        }
        img.src = dataUrl
      }
      reader.readAsDataURL(file)
    })
  }

  const handleScanFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setScanning(true)
    setScanError('')

    try {
      const { base64, mediaType } = await compressImage(file)
      setScanPreview(`data:image/jpeg;base64,${base64}`)

      const res = await fetch('/api/scan-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, mediaType }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'scan failed')

      setForm(f => ({
        ...f,
        type: data.type === 'income' ? 'income' : 'expense',
        amount: String(data.amount || ''),
        category: data.category || (data.type === 'income' ? 'salary' : 'food'),
        description: data.merchant ? `${data.merchant}${data.description ? ' - ' + data.description : ''}` : (data.description || ''),
        date: data.date || f.date,
      }))
      setAddOpen(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'unknown error'
      setScanError(lang === 'th' ? `สแกนไม่สำเร็จ: ${msg}` : `Scan failed: ${msg}`)
    } finally {
      setScanning(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
      if (galleryInputRef.current) galleryInputRef.current.value = ''
    }
  }

  const handleAdd = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!form.account_id) return
    store.addTransaction({
      account_id: form.account_id,
      member_id: form.member_id || null,
      type: form.type,
      amount: parseFloat(form.amount) || 0,
      category: form.category,
      description: form.description,
      date: form.date,
    })
    setAddOpen(false)
    setForm(f => ({ ...f, amount: '', description: '' }))
  }

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  const filtered = useMemo(() => {
    let txs = store.transactions
    if (filterType !== 'all') txs = txs.filter(tx => tx.type === filterType)
    if (filterMonth) txs = txs.filter(tx => tx.date.startsWith(filterMonth))
    if (search) txs = txs.filter(tx => tx.description.toLowerCase().includes(search.toLowerCase()) || tx.category.includes(search.toLowerCase()))
    return txs
  }, [store.transactions, filterType, filterMonth, search])

  const totalIncome = filtered.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0)
  const totalExpense = filtered.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0)

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center py-3">
            <p className="text-xs text-gray-400">{t('income', lang)}</p>
            <p className="text-lg font-bold text-green-600">{formatCurrency(totalIncome)}</p>
          </Card>
          <Card className="text-center py-3">
            <p className="text-xs text-gray-400">{t('expense', lang)}</p>
            <p className="text-lg font-bold text-red-500">{formatCurrency(totalExpense)}</p>
          </Card>
          <Card className="text-center py-3">
            <p className="text-xs text-gray-400">{t('balance', lang)}</p>
            <p className={`text-lg font-bold ${totalIncome - totalExpense >= 0 ? 'text-indigo-600' : 'text-red-500'}`}>
              {formatCurrency(totalIncome - totalExpense)}
            </p>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-40">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={t('search', lang)}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none"
            value={filterType}
            onChange={e => setFilterType(e.target.value as any)}
          >
            <option value="all">{t('all', lang)}</option>
            <option value="income">{t('income', lang)}</option>
            <option value="expense">{t('expense', lang)}</option>
          </select>
          <input
            type="month"
            className="px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none"
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={scanning}
            onClick={() => galleryInputRef.current?.click()}
          >
            {scanning ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
            {lang === 'th' ? 'สแกนบิล' : 'Scan Bill'}
          </Button>
          <Button onClick={() => { setScanPreview(''); setAddOpen(true) }} size="sm">
            <Plus size={16} /> {t('addTransaction', lang)}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleScanFile}
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleScanFile}
          />
        </div>
        {scanError && (
          <p className="text-sm text-red-500 text-center">{scanError}</p>
        )}

        {/* List */}
        <Card className="p-0 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">{t('noData', lang)}</div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {filtered.map(tx => {
                const account = store.accounts.find(a => a.id === tx.account_id)
                const member = store.members.find(m => m.id === tx.member_id)
                return (
                  <div key={tx.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${tx.type === 'income' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                      {tx.type === 'income'
                        ? <ArrowDownLeft size={16} className="text-green-600 dark:text-green-400" />
                        : <ArrowUpRight size={16} className="text-red-500" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                        {tx.description || t(tx.category as any, lang)}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                        <span>{formatDate(tx.date, lang)}</span>
                        <span>•</span>
                        <span className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700">{t(tx.category as any, lang)}</span>
                        {account && <span>{BANK_NAMES[account.bank_name][lang]}</span>}
                        {member && <span style={{ color: member.avatar_color }}>• {member.name}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </p>
                      <button onClick={() => store.deleteTransaction(tx.id)} className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      <Modal open={addOpen} onClose={() => { setAddOpen(false); setScanPreview('') }} title={t('addTransaction', lang)}>
        <form onSubmit={handleAdd} className="space-y-4">
          {scanPreview && (
            <div className="rounded-xl overflow-hidden border border-indigo-200 dark:border-indigo-800">
              <img src={scanPreview} alt="scanned bill" className="w-full max-h-40 object-contain bg-gray-50 dark:bg-gray-800" />
              <p className="text-xs text-center text-indigo-600 dark:text-indigo-400 py-1 bg-indigo-50 dark:bg-indigo-900/30">
                {lang === 'th' ? '✓ สแกนบิลสำเร็จ — ตรวจสอบข้อมูลก่อนบันทึก' : '✓ Bill scanned — please verify before saving'}
              </p>
            </div>
          )}
          {/* Type toggle */}
          <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
            {(['income', 'expense'] as const).map(tp => (
              <button
                key={tp}
                type="button"
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${form.type === tp ? 'bg-white dark:bg-gray-600 shadow' : 'text-gray-500'} ${form.type === tp && tp === 'income' ? 'text-green-600' : ''} ${form.type === tp && tp === 'expense' ? 'text-red-500' : ''}`}
                onClick={() => {
                  setForm(f => ({ ...f, type: tp, category: tp === 'income' ? 'salary' : 'food' }))
                }}
              >
                {t(tp, lang)}
              </button>
            ))}
          </div>
          <Input
            label={`${t('amount', lang)} (฿)`}
            type="number"
            value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            placeholder="0.00"
            required
          />
          <Select
            label={t('category', lang)}
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
          >
            {categories.map(c => <option key={c} value={c}>{t(c as any, lang)}</option>)}
          </Select>
          <Textarea
            label={t('description', lang)}
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder={lang === 'th' ? 'รายละเอียด (ไม่บังคับ)' : 'Details (optional)'}
          />
          <Input
            label={t('date', lang)}
            type="date"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            required
          />
          <Select
            label={t('accounts', lang)}
            value={form.account_id}
            onChange={e => setForm(f => ({ ...f, account_id: e.target.value }))}
            required
          >
            <option value="">{lang === 'th' ? 'เลือกบัญชี' : 'Select account'}</option>
            {store.accounts.map(a => <option key={a.id} value={a.id}>{a.account_name} ({BANK_NAMES[a.bank_name][lang]})</option>)}
          </Select>
          <Select
            label={t('member', lang)}
            value={form.member_id}
            onChange={e => setForm(f => ({ ...f, member_id: e.target.value }))}
          >
            <option value="">{t('all', lang)}</option>
            {store.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </Select>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setAddOpen(false)}>{t('cancel', lang)}</Button>
            <Button type="submit" className="flex-1">{t('save', lang)}</Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  )
}
