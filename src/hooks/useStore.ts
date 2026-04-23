'use client'
import { useState, useEffect, useCallback } from 'react'
import { BankAccount, Transaction, SavingsGoal, Debt, Appointment, Member, IncomeSource } from '@/types'
import { generateId } from '@/lib/utils'

const STORAGE_KEY = 'family_finance_data'

interface Store {
  members: Member[]
  accounts: BankAccount[]
  transactions: Transaction[]
  savingsGoals: SavingsGoal[]
  debts: Debt[]
  appointments: Appointment[]
  incomeSources: IncomeSource[]
}

const defaultStore: Store = {
  members: [],
  accounts: [],
  transactions: [],
  savingsGoals: [],
  debts: [],
  appointments: [],
  incomeSources: [],
}

function load(): Store {
  if (typeof window === 'undefined') return defaultStore
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...defaultStore, ...JSON.parse(raw) } : defaultStore
  } catch {
    return defaultStore
  }
}

function save(store: Store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export function useStore() {
  const [store, setStore] = useState<Store>(defaultStore)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setStore(load())
    setLoaded(true)
  }, [])

  const update = useCallback((updater: (prev: Store) => Store) => {
    setStore(prev => {
      const next = updater(prev)
      save(next)
      return next
    })
  }, [])

  // Members
  const addMember = (m: Omit<Member, 'id' | 'created_at' | 'family_id'>) =>
    update(s => ({ ...s, members: [...s.members, { ...m, id: generateId(), family_id: 'family', created_at: new Date().toISOString() }] }))

  // Accounts
  const addAccount = (a: Omit<BankAccount, 'id' | 'created_at' | 'family_id'>) =>
    update(s => ({ ...s, accounts: [...s.accounts, { ...a, id: generateId(), family_id: 'family', created_at: new Date().toISOString() }] }))
  const updateAccount = (id: string, data: Partial<BankAccount>) =>
    update(s => ({ ...s, accounts: s.accounts.map(a => a.id === id ? { ...a, ...data } : a) }))
  const deleteAccount = (id: string) =>
    update(s => ({ ...s, accounts: s.accounts.filter(a => a.id !== id) }))

  // Transactions
  const addTransaction = (tx: Omit<Transaction, 'id' | 'created_at' | 'family_id'>) => {
    update(s => {
      const newTx: Transaction = { ...tx, id: generateId(), family_id: 'family', created_at: new Date().toISOString() }
      const accounts = s.accounts.map(a => {
        if (a.id === tx.account_id) {
          const delta = tx.type === 'income' ? tx.amount : -tx.amount
          return { ...a, balance: a.balance + delta }
        }
        return a
      })
      return { ...s, transactions: [newTx, ...s.transactions], accounts }
    })
  }
  const deleteTransaction = (id: string) => {
    const tx = store.transactions.find(t => t.id === id)
    update(s => {
      const accounts = tx ? s.accounts.map(a => {
        if (a.id === tx.account_id) {
          const delta = tx.type === 'income' ? -tx.amount : tx.amount
          return { ...a, balance: a.balance + delta }
        }
        return a
      }) : s.accounts
      return { ...s, transactions: s.transactions.filter(t => t.id !== id), accounts }
    })
  }

  // Savings
  const addSavingsGoal = (g: Omit<SavingsGoal, 'id' | 'created_at' | 'family_id'>) =>
    update(s => ({ ...s, savingsGoals: [...s.savingsGoals, { ...g, id: generateId(), family_id: 'family', created_at: new Date().toISOString() }] }))
  const updateSavingsGoal = (id: string, data: Partial<SavingsGoal>) =>
    update(s => ({ ...s, savingsGoals: s.savingsGoals.map(g => g.id === id ? { ...g, ...data } : g) }))
  const deleteSavingsGoal = (id: string) =>
    update(s => ({ ...s, savingsGoals: s.savingsGoals.filter(g => g.id !== id) }))
  const depositToGoal = (id: string, amount: number) =>
    update(s => ({ ...s, savingsGoals: s.savingsGoals.map(g => g.id === id ? { ...g, current_amount: g.current_amount + amount } : g) }))

  // Debts
  const addDebt = (d: Omit<Debt, 'id' | 'created_at' | 'family_id'>) =>
    update(s => ({ ...s, debts: [...s.debts, { ...d, id: generateId(), family_id: 'family', created_at: new Date().toISOString() }] }))
  const updateDebt = (id: string, data: Partial<Debt>) =>
    update(s => ({ ...s, debts: s.debts.map(d => d.id === id ? { ...d, ...data } : d) }))
  const deleteDebt = (id: string) =>
    update(s => ({ ...s, debts: s.debts.filter(d => d.id !== id) }))
  const payDebt = (id: string, amount: number) =>
    update(s => ({ ...s, debts: s.debts.map(d => d.id === id ? { ...d, remaining_amount: Math.max(0, d.remaining_amount - amount) } : d) }))

  // Appointments
  const addAppointment = (a: Omit<Appointment, 'id' | 'created_at' | 'family_id'>) =>
    update(s => ({ ...s, appointments: [...s.appointments, { ...a, id: generateId(), family_id: 'family', created_at: new Date().toISOString() }] }))
  const updateAppointment = (id: string, data: Partial<Appointment>) =>
    update(s => ({ ...s, appointments: s.appointments.map(a => a.id === id ? { ...a, ...data } : a) }))
  const deleteAppointment = (id: string) =>
    update(s => ({ ...s, appointments: s.appointments.filter(a => a.id !== id) }))

  // Income Sources
  const addIncomeSource = (i: Omit<IncomeSource, 'id' | 'created_at' | 'family_id'>) =>
    update(s => ({ ...s, incomeSources: [...s.incomeSources, { ...i, id: generateId(), family_id: 'family', created_at: new Date().toISOString() }] }))
  const deleteIncomeSource = (id: string) =>
    update(s => ({ ...s, incomeSources: s.incomeSources.filter(i => i.id !== id) }))

  return {
    ...store,
    loaded,
    addMember,
    addAccount, updateAccount, deleteAccount,
    addTransaction, deleteTransaction,
    addSavingsGoal, updateSavingsGoal, deleteSavingsGoal, depositToGoal,
    addDebt, updateDebt, deleteDebt, payDebt,
    addAppointment, updateAppointment, deleteAppointment,
    addIncomeSource, deleteIncomeSource,
  }
}
