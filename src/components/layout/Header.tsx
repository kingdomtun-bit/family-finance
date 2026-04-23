'use client'
import { Menu, Bell } from 'lucide-react'
import { Lang } from '@/lib/i18n'

interface HeaderProps {
  title: string
  lang: Lang
  onToggleLang: () => void
  onMenuClick: () => void
  memberName?: string
}

export function Header({ title, lang, onToggleLang, onMenuClick, memberName }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center gap-3">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Menu size={20} className="text-gray-600 dark:text-gray-300" />
      </button>

      <h1 className="flex-1 font-bold text-gray-900 dark:text-white text-lg">{title}</h1>

      <button
        onClick={onToggleLang}
        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        {lang === 'th' ? 'EN' : 'TH'}
      </button>

      {memberName && (
        <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
            {memberName.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
    </header>
  )
}
