'use client'
import { useState, useRef } from 'react'
import { useStore } from '@/hooks/useStore'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { formatCurrency } from '@/lib/utils'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { BANK_COLORS, BANK_NAMES, BankAccount } from '@/types'
import { parseCSVByBank, guessCategory, ParsedRow } from '@/lib/csv-parsers'
import { Plus, Upload, Trash2, CreditCard } from 'lucide-react'

const BANKS = ['KTB', 'SCB', 'GSB', 'TTB'] as const

export default function AccountsPage() {
  const { lang } = useLanguage()
  const store = useStore()
  const [addOpen, setAddOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [importAccount, setImportAccount] = useState<BankAccount | null>(null)
  const [importRows, setImportRows] = useState<ParsedRow[]>([])
  const [importing, setImporting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    bank_name: 'KTB' as typeof BANKS[number],
    account_name: '',
    account_number: '',
    account_type: 'savings' as 'savings' | 'current' | 'fixed',
    balance: '',
    member_id: '',
  })

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    store.addAccount({
      bank_name: form.bank_name,
      account_name: form.account_name,
      account_number: form.account_number,
      account_type: form.account_type,
      balance: parseFloat(form.balance) || 0,
      member_id: form.member_id || null,
      currency: 'THB',
      color: BANK_COLORS[form.bank_name],
    })
    setAddOpen(false)
    setForm({ bank_name: 'KTB', account_name: '', account_number: '', account_type: 'savings', balance: '', member_id: '' })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !importAccount) return
    const reader = new FileReader()
    reader.onload = ev => {
      const text = ev.target?.result as string
      const rows = parseCSVByBank(text, importAccount.bank_name)
      setImportRows(rows)
    }
    reader.readAsText(file, 'UTF-8')
  }

  const handleImport = async () => {
    if (!importAccount || importRows.length === 0) return
    setImporting(true)
    for (const row of importRows) {
      store.addTransaction({
        account_id: importAccount.id,
        member_id: importAccount.member_id,
        type: row.type,
        amount: row.amount,
        category: guessCategory(row.description),
        description: row.description,
        date: row.date,
      })
    }
    setImporting(false)
    setImportOpen(false)
    setImportRows([])
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {lang === 'th' ? `${store.accounts.length} บัญชี` : `${store.accounts.length} accounts`}
          </p>
          <Button onClick={() => setAddOpen(true)} size="sm">
            <Plus size={16} /> {t('addAccount', lang)}
          </Button>
        </div>

        {store.accounts.length === 0 ? (
          <Card className="text-center py-16">
            <CreditCard size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400 text-sm">{t('noData', lang)}</p>
            <Button onClick={() => setAddOpen(true)} className="mt-4" size="sm">
              <Plus size={16} /> {t('addAccount', lang)}
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {store.accounts.map(acc => {
              const member = store.members.find(m => m.id === acc.member_id)
              return (
                <Card key={acc.id}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ background: BANK_COLORS[acc.bank_name] }}>
                        {acc.bank_name}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white">{acc.account_name}</p>
                        <p className="text-xs text-gray-400">{BANK_NAMES[acc.bank_name][lang]} • {t(acc.account_type as any, lang)}</p>
                        {acc.account_number && <p className="text-xs text-gray-400">{acc.account_number.replace(/(.{3})/g, '$1-').slice(0, -1)}</p>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setImportAccount(acc); setImportOpen(true) }}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-indigo-600 transition-colors"
                        title={t('importCSV', lang)}
                      >
                        <Upload size={15} />
                      </button>
                      <button
                        onClick={() => store.deleteAccount(acc.id)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-gray-400">{t('balance', lang)}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(acc.balance)}</p>
                    </div>
                    {member && (
                      <div className="text-xs px-2 py-1 rounded-full" style={{ background: member.avatar_color + '20', color: member.avatar_color }}>
                        {member.name}
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* Total */}
        {store.accounts.length > 0 && (
          <Card className="bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800">
            <div className="flex items-center justify-between">
              <p className="font-medium text-indigo-800 dark:text-indigo-300">{t('total', lang)}</p>
              <p className="text-xl font-bold text-indigo-700 dark:text-indigo-300">
                {formatCurrency(store.accounts.reduce((s, a) => s + a.balance, 0))}
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Add account modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title={t('addAccount', lang)}>
        <form onSubmit={handleAdd} className="space-y-4">
          <Select label={t('bank', lang)} value={form.bank_name} onChange={e => setForm(f => ({ ...f, bank_name: e.target.value as any }))}>
            {BANKS.map(b => <option key={b} value={b}>{BANK_NAMES[b][lang]} ({b})</option>)}
          </Select>
          <Input label={t('accountName', lang)} value={form.account_name} onChange={e => setForm(f => ({ ...f, account_name: e.target.value }))} required />
          <Input label={t('accountNumber', lang)} value={form.account_number} onChange={e => setForm(f => ({ ...f, account_number: e.target.value }))} placeholder="xxx-x-xxxxx-x" />
          <Select label={t('accountType', lang)} value={form.account_type} onChange={e => setForm(f => ({ ...f, account_type: e.target.value as any }))}>
            <option value="savings">{t('savings_account', lang)}</option>
            <option value="current">{t('current', lang)}</option>
            <option value="fixed">{t('fixed', lang)}</option>
          </Select>
          <Input label={`${t('balance', lang)} (฿)`} type="number" value={form.balance} onChange={e => setForm(f => ({ ...f, balance: e.target.value }))} placeholder="0.00" />
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

      {/* Import CSV modal */}
      <Modal open={importOpen} onClose={() => { setImportOpen(false); setImportRows([]) }} title={t('importCSV', lang)}>
        <div className="space-y-4">
          {importAccount && (
            <div className="p-3 rounded-xl text-sm font-medium" style={{ background: BANK_COLORS[importAccount.bank_name] + '15', color: BANK_COLORS[importAccount.bank_name] }}>
              {BANK_NAMES[importAccount.bank_name][lang]} — {importAccount.account_name}
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {lang === 'th'
                ? 'ดาวน์โหลด CSV จากแอปธนาคาร แล้วอัปโหลดที่นี่'
                : 'Download CSV from your bank app, then upload here'}
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>
          {importRows.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {lang === 'th' ? `พบ ${importRows.length} รายการ` : `Found ${importRows.length} transactions`}
              </p>
              <div className="max-h-48 overflow-y-auto border border-gray-100 dark:border-gray-700 rounded-xl divide-y divide-gray-50 dark:divide-gray-700">
                {importRows.slice(0, 10).map((r, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 text-xs">
                    <span className="text-gray-500">{r.date}</span>
                    <span className="flex-1 mx-2 text-gray-700 dark:text-gray-300 truncate">{r.description}</span>
                    <span className={r.type === 'income' ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
                      {r.type === 'income' ? '+' : '-'}{formatCurrency(r.amount)}
                    </span>
                  </div>
                ))}
                {importRows.length > 10 && (
                  <div className="px-3 py-2 text-xs text-gray-400 text-center">
                    +{importRows.length - 10} {lang === 'th' ? 'รายการ' : 'more'}
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => { setImportOpen(false); setImportRows([]) }}>{t('cancel', lang)}</Button>
            <Button className="flex-1" onClick={handleImport} disabled={importRows.length === 0 || importing}>
              <Upload size={16} /> {importing ? t('loading', lang) : `${t('import', lang)} (${importRows.length})`}
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  )
}
