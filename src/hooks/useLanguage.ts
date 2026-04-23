'use client'
import { useState, useEffect } from 'react'
import { Lang } from '@/lib/i18n'

export function useLanguage() {
  const [lang, setLang] = useState<Lang>('th')

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Lang | null
    if (saved) setLang(saved)
  }, [])

  const toggleLang = () => {
    const next: Lang = lang === 'th' ? 'en' : 'th'
    setLang(next)
    localStorage.setItem('lang', next)
  }

  return { lang, toggleLang }
}
