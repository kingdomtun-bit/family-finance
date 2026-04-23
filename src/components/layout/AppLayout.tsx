'use client'
import { useState, ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useLanguage } from '@/hooks/useLanguage'
import { t, TranslationKey } from '@/lib/i18n'
import { usePathname } from 'next/navigation'

const PAGE_TITLES: Record<string, TranslationKey> = {
  '/dashboard': 'dashboard',
  '/accounts': 'accounts',
  '/transactions': 'transactions',
  '/savings': 'savings',
  '/debts': 'debts',
  '/calendar': 'calendar',
  '/reports': 'reports',
  '/settings': 'settings',
}

export function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { lang, toggleLang } = useLanguage()
  const pathname = usePathname()

  const titleKey = Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k))?.[1] ?? 'dashboard'
  const title = t(titleKey, lang)

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <Sidebar
        lang={lang}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        familyName={typeof window !== 'undefined' ? localStorage.getItem('family_name') ?? 'ครอบครัว' : 'ครอบครัว'}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={title}
          lang={lang}
          onToggleLang={toggleLang}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
