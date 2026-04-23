export type Lang = 'th' | 'en'

export interface Member {
  id: string
  family_id: string
  name: string
  avatar_color: string
  created_at: string
}

export interface BankAccount {
  id: string
  family_id: string
  member_id: string | null
  bank_name: 'KTB' | 'SCB' | 'GSB' | 'TTB'
  account_name: string
  account_number: string
  account_type: 'savings' | 'current' | 'fixed'
  balance: number
  currency: string
  color: string
  created_at: string
  member?: Member
}

export interface Transaction {
  id: string
  family_id: string
  account_id: string
  member_id: string | null
  type: 'income' | 'expense' | 'transfer'
  amount: number
  category: string
  description: string
  date: string
  created_at: string
  account?: BankAccount
  member?: Member
}

export interface SavingsGoal {
  id: string
  family_id: string
  name: string
  name_th: string
  target_amount: number
  current_amount: number
  deadline: string | null
  category: 'retirement' | 'education' | 'travel' | 'emergency' | 'investment' | 'annual' | 'other'
  color: string
  icon: string
  monthly_target: number | null
  created_at: string
}

export interface Debt {
  id: string
  family_id: string
  member_id: string | null
  name: string
  lender: string
  total_amount: number
  remaining_amount: number
  interest_rate: number
  monthly_payment: number | null
  payment_date: number | null
  type: 'mortgage' | 'car' | 'personal' | 'credit_card' | 'student' | 'other'
  created_at: string
  member?: Member
}

export interface Appointment {
  id: string
  family_id: string
  member_id: string | null
  title: string
  description: string
  date: string
  time: string | null
  category: 'medical' | 'finance' | 'travel' | 'work' | 'personal' | 'family' | 'other'
  color: string
  reminder_days: number
  created_at: string
  member?: Member
}

export interface IncomeSource {
  id: string
  family_id: string
  member_id: string | null
  name: string
  amount: number
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'irregular'
  category: 'salary' | 'freelance' | 'investment' | 'rental' | 'other'
  created_at: string
  member?: Member
}

export const EXPENSE_CATEGORIES = [
  'food', 'transport', 'housing', 'utilities', 'health',
  'education', 'entertainment', 'shopping', 'insurance', 'savings_transfer', 'other'
]

export const INCOME_CATEGORIES = [
  'salary', 'freelance', 'investment', 'rental', 'bonus', 'other'
]

export const BANK_COLORS: Record<string, string> = {
  KTB: '#00a0e9',
  SCB: '#4e2a84',
  GSB: '#e91e8c',
  TTB: '#ff6600',
}

export const BANK_NAMES: Record<string, { th: string; en: string }> = {
  KTB: { th: 'กรุงไทย', en: 'Krungthai' },
  SCB: { th: 'ไทยพาณิชย์', en: 'SCB' },
  GSB: { th: 'ออมสิน', en: 'GSB' },
  TTB: { th: 'ทหารไทยธนชาต', en: 'TTB' },
}
