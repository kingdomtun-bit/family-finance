'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'

const FAMILY_PASSWORD = 'family2024'

export default function LoginPage() {
  const router = useRouter()
  const { lang, toggleLang } = useLanguage()
  const [mode, setMode] = useState<'login' | 'register'>('login')

  useEffect(() => {
    if (!localStorage.getItem('family_password')) {
      setMode('register')
    }
  }, [])
  const [form, setForm] = useState({ familyName: '', member1: '', member2: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    await new Promise(r => setTimeout(r, 400))
    const savedPass = localStorage.getItem('family_password') || FAMILY_PASSWORD
    if (form.password !== savedPass) {
      setError(lang === 'th' ? 'รหัสผ่านไม่ถูกต้อง' : 'Incorrect password')
      setLoading(false)
      return
    }
    localStorage.setItem('logged_in', 'true')
    router.push('/dashboard')
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    localStorage.setItem('family_name', form.familyName || 'ครอบครัว')
    localStorage.setItem('family_password', form.password || FAMILY_PASSWORD)
    localStorage.setItem('member1_name', form.member1 || 'สมาชิก 1')
    localStorage.setItem('member2_name', form.member2 || 'สมาชิก 2')
    // Init store with members
    const members = [
      { id: '1', family_id: 'family', name: form.member1 || 'สมาชิก 1', avatar_color: '#4f46e5', created_at: new Date().toISOString() },
      { id: '2', family_id: 'family', name: form.member2 || 'สมาชิก 2', avatar_color: '#ec4899', created_at: new Date().toISOString() },
    ]
    const existing = JSON.parse(localStorage.getItem('family_finance_data') || '{}')
    localStorage.setItem('family_finance_data', JSON.stringify({ ...existing, members }))
    localStorage.setItem('logged_in', 'true')
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl text-white text-3xl mb-4 shadow-lg">💰</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('familyFinance', lang)}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {lang === 'th' ? 'จัดการการเงินครอบครัวอย่างชาญฉลาด' : 'Smart family finance management'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
          <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
            <button
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'login' ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white' : 'text-gray-500'}`}
              onClick={() => setMode('login')}
            >
              {t('login', lang)}
            </button>
            <button
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'register' ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white' : 'text-gray-500'}`}
              onClick={() => setMode('register')}
            >
              {t('register', lang)}
            </button>
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label={t('password', lang)}
                type="password"
                placeholder={lang === 'th' ? 'รหัสผ่านครอบครัว' : 'Family password'}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? t('loading', lang) : t('signIn', lang)}
              </Button>
              <p className="text-xs text-center text-gray-400">
                {lang === 'th' ? 'รหัสผ่านเริ่มต้น: family2024' : 'Default password: family2024'}
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <Input
                label={t('familyName', lang)}
                placeholder={lang === 'th' ? 'เช่น ครอบครัวสมิธ' : 'e.g. Smith Family'}
                value={form.familyName}
                onChange={e => setForm(f => ({ ...f, familyName: e.target.value }))}
              />
              <Input
                label={t('member1Name', lang)}
                placeholder={lang === 'th' ? 'ชื่อสมาชิกคนที่ 1' : 'Member 1 name'}
                value={form.member1}
                onChange={e => setForm(f => ({ ...f, member1: e.target.value }))}
                required
              />
              <Input
                label={t('member2Name', lang)}
                placeholder={lang === 'th' ? 'ชื่อสมาชิกคนที่ 2' : 'Member 2 name'}
                value={form.member2}
                onChange={e => setForm(f => ({ ...f, member2: e.target.value }))}
                required
              />
              <Input
                label={t('password', lang)}
                type="password"
                placeholder={lang === 'th' ? 'ตั้งรหัสผ่านครอบครัว' : 'Set family password'}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? t('loading', lang) : t('createAccount', lang)}
              </Button>
            </form>
          )}
        </div>

        <div className="text-center mt-4">
          <button onClick={toggleLang} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            {lang === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'}
          </button>
        </div>
      </div>
    </div>
  )
}
