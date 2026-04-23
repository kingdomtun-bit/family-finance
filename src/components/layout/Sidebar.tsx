'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { t, Lang } from '@/lib/i18n'
import {
  LayoutDashboard, CreditCard, ArrowLeftRight, PiggyBank,
  BadgeDollarSign, Calendar, BarChart3, Settings, X
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, key: 'dashboard' as const },
  { href: '/accounts', icon: CreditCard, key: 'accounts' as const },
  { href: '/transactions', icon: ArrowLeftRight, key: 'transactions' as const },
  { href: '/savings', icon: PiggyBank, key: 'savings' as const },
  { href: '/debts', icon: BadgeDollarSign, key: 'debts' as const },
  { href: '/calendar', icon: Calendar, key: 'calendar' as const },
  { href: '/reports', icon: BarChart3, key: 'reports' as const },
  { href: '/settings', icon: Settings, key: 'settings' as const },
]

interface SidebarProps {
  lang: Lang
  open?: boolean
  onClose?: () => void
  familyName?: string
}

export function Sidebar({ lang, open, onClose, familyName = 'ครอบครัว' }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 z-50 flex flex-col transition-transform duration-300',
        'lg:translate-x-0 lg:static lg:z-auto',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-lg">💰</div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-sm leading-tight">
                {lang === 'th' ? 'การเงินครอบครัว' : 'Family Finance'}
              </p>
              <p className="text-xs text-gray-400">{familyName}</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, key }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  active
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                )}
              >
                <Icon size={18} />
                {t(key, lang)}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs text-center text-gray-400">Family Finance v1.0</p>
        </div>
      </aside>
    </>
  )
}
