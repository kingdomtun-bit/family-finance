'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/hooks/useStore'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { LogOut, User, Shield, Trash2, Download, Bell } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const { lang, toggleLang } = useLanguage()
  const store = useStore()
  const [familyName, setFamilyName] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [saved, setSaved] = useState(false)
  const [member1Name, setMember1Name] = useState('')
  const [member2Name, setMember2Name] = useState('')

  useEffect(() => {
    setFamilyName(localStorage.getItem('family_name') || '')
    setMember1Name(store.members[0]?.name || '')
    setMember2Name(store.members[1]?.name || '')
  }, [store.members])

  const handleSaveFamily = (e: React.FormEvent) => {
    e.preventDefault()
    if (familyName) localStorage.setItem('family_name', familyName)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault()
    const current = localStorage.getItem('family_password') || 'family2024'
    if (password !== current) {
      alert(lang === 'th' ? 'รหัสผ่านปัจจุบันไม่ถูกต้อง' : 'Incorrect current password')
      return
    }
    localStorage.setItem('family_password', newPassword)
    setPassword('')
    setNewPassword('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleExportData = () => {
    const data = localStorage.getItem('family_finance_data')
    if (!data) return
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `family-finance-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        localStorage.setItem('family_finance_data', JSON.stringify(data))
        window.location.reload()
      } catch {
        alert(lang === 'th' ? 'ไฟล์ไม่ถูกต้อง' : 'Invalid file')
      }
    }
    reader.readAsText(file)
  }

  const handleClearData = () => {
    const msg = lang === 'th' ? 'ต้องการลบข้อมูลทั้งหมดใช่ไหม? ไม่สามารถกู้คืนได้' : 'Delete all data? This cannot be undone.'
    if (confirm(msg)) {
      localStorage.removeItem('family_finance_data')
      window.location.reload()
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('logged_in')
    router.push('/login')
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Language */}
        <Card>
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            🌐 {lang === 'th' ? 'ภาษา / Language' : 'Language / ภาษา'}
          </h3>
          <div className="flex gap-3">
            <button
              className={`flex-1 py-3 rounded-xl text-sm font-medium border-2 transition-all ${lang === 'th' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'border-gray-200 dark:border-gray-600 text-gray-500'}`}
              onClick={() => lang !== 'th' && toggleLang()}
            >
              🇹🇭 ภาษาไทย
            </button>
            <button
              className={`flex-1 py-3 rounded-xl text-sm font-medium border-2 transition-all ${lang === 'en' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'border-gray-200 dark:border-gray-600 text-gray-500'}`}
              onClick={() => lang !== 'en' && toggleLang()}
            >
              🇬🇧 English
            </button>
          </div>
        </Card>

        {/* Family info */}
        <Card>
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <User size={18} /> {lang === 'th' ? 'ข้อมูลครอบครัว' : 'Family Info'}
          </h3>
          <form onSubmit={handleSaveFamily} className="space-y-4">
            <Input
              label={t('familyName', lang)}
              value={familyName}
              onChange={e => setFamilyName(e.target.value)}
              placeholder={lang === 'th' ? 'ชื่อครอบครัว' : 'Family name'}
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                <p className="text-xs text-indigo-400 mb-1">{t('member1Name', lang)}</p>
                <p className="font-semibold text-indigo-700 dark:text-indigo-300">{member1Name || '-'}</p>
              </div>
              <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-xl">
                <p className="text-xs text-pink-400 mb-1">{t('member2Name', lang)}</p>
                <p className="font-semibold text-pink-700 dark:text-pink-300">{member2Name || '-'}</p>
              </div>
            </div>
            <Button type="submit" size="sm">{saved ? '✅ ' + t('save', lang) : t('save', lang)}</Button>
          </form>
        </Card>

        {/* Password */}
        <Card>
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Shield size={18} /> {lang === 'th' ? 'เปลี่ยนรหัสผ่าน' : 'Change Password'}
          </h3>
          <form onSubmit={handleSavePassword} className="space-y-4">
            <Input
              label={lang === 'th' ? 'รหัสผ่านปัจจุบัน' : 'Current password'}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <Input
              label={lang === 'th' ? 'รหัสผ่านใหม่' : 'New password'}
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
            />
            <Button type="submit" size="sm" variant="outline">{lang === 'th' ? 'เปลี่ยนรหัสผ่าน' : 'Change Password'}</Button>
          </form>
        </Card>

        {/* Data management */}
        <Card>
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Download size={18} /> {lang === 'th' ? 'จัดการข้อมูล' : 'Data Management'}
          </h3>
          <div className="space-y-3">
            <Button onClick={handleExportData} variant="outline" className="w-full justify-start gap-2">
              <Download size={16} /> {lang === 'th' ? 'สำรองข้อมูล (Export JSON)' : 'Backup Data (Export JSON)'}
            </Button>
            <div>
              <label className="w-full flex items-center justify-start gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium cursor-pointer transition-colors">
                <Download size={16} className="rotate-180" /> {lang === 'th' ? 'กู้คืนข้อมูล (Import JSON)' : 'Restore Data (Import JSON)'}
                <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
              </label>
            </div>
            <Button onClick={handleClearData} variant="danger" size="sm" className="w-full justify-start">
              <Trash2 size={16} /> {lang === 'th' ? 'ลบข้อมูลทั้งหมด' : 'Clear All Data'}
            </Button>
          </div>
        </Card>

        {/* Stats */}
        <Card>
          <h3 className="font-semibold text-gray-800 dark:text-white mb-3">{lang === 'th' ? 'สถิติข้อมูล' : 'Data Stats'}</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: lang === 'th' ? 'บัญชีธนาคาร' : 'Accounts', value: store.accounts.length },
              { label: lang === 'th' ? 'รายการเงิน' : 'Transactions', value: store.transactions.length },
              { label: lang === 'th' ? 'เป้าหมายออม' : 'Savings Goals', value: store.savingsGoals.length },
              { label: lang === 'th' ? 'หนี้สิน' : 'Debts', value: store.debts.length },
              { label: lang === 'th' ? 'นัดหมาย' : 'Appointments', value: store.appointments.length },
            ].map(stat => (
              <div key={stat.label} className="flex justify-between py-1.5 border-b border-gray-50 dark:border-gray-700 last:border-0">
                <span className="text-gray-500">{stat.label}</span>
                <span className="font-bold text-indigo-600">{stat.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Logout */}
        <Button onClick={handleLogout} variant="danger" className="w-full" size="lg">
          <LogOut size={18} /> {t('logout', lang)}
        </Button>
      </div>
    </AppLayout>
  )
}
