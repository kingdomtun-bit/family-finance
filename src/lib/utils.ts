import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'THB'): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('th-TH').format(amount)
}

export function formatDate(date: string, lang: 'th' | 'en' = 'th'): string {
  return new Intl.DateTimeFormat(lang === 'th' ? 'th-TH' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateShort(date: string): string {
  const d = new Date(date)
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
}

export function getDaysUntil(dateStr: string): number {
  const now = new Date()
  const target = new Date(dateStr)
  const diff = target.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function getMonthsUntil(dateStr: string): number {
  const now = new Date()
  const target = new Date(dateStr)
  return (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth())
}

export function calculateProjection(
  currentAmount: number,
  targetAmount: number,
  monthlyContribution: number
): { monthsNeeded: number; completionDate: string } {
  if (monthlyContribution <= 0) return { monthsNeeded: 0, completionDate: '' }
  const remaining = targetAmount - currentAmount
  const monthsNeeded = Math.ceil(remaining / monthlyContribution)
  const completionDate = new Date()
  completionDate.setMonth(completionDate.getMonth() + monthsNeeded)
  return { monthsNeeded, completionDate: completionDate.toISOString().split('T')[0] }
}

export function getProgressColor(percent: number): string {
  if (percent >= 100) return '#10b981'
  if (percent >= 75) return '#3b82f6'
  if (percent >= 50) return '#f59e0b'
  return '#ef4444'
}

export function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function getCurrentYear(): number {
  return new Date().getFullYear()
}

export function isThisMonth(dateStr: string): boolean {
  const date = new Date(dateStr)
  const now = new Date()
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}
