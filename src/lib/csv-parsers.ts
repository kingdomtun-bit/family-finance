import { Transaction } from '@/types'

interface ParsedRow {
  date: string
  description: string
  amount: number
  type: 'income' | 'expense'
  balance?: number
}

function parseThaiDate(raw: string): string {
  // Format: DD/MM/YYYY or DD-MM-YYYY (Buddhist Era year)
  const cleaned = raw.trim().replace(/-/g, '/')
  const parts = cleaned.split('/')
  if (parts.length !== 3) return new Date().toISOString().split('T')[0]
  let year = parseInt(parts[2])
  // Convert Buddhist Era to CE
  if (year > 2400) year -= 543
  const month = String(parseInt(parts[1])).padStart(2, '0')
  const day = String(parseInt(parts[0])).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseAmount(raw: string): number {
  return parseFloat(raw.replace(/,/g, '').replace(/[^0-9.-]/g, '')) || 0
}

// KTB (Krungthai): CSV columns - วันที่, รายการ, จำนวนเงิน(เดบิต), จำนวนเงิน(เครดิต), คงเหลือ
export function parseKTB(csvText: string): ParsedRow[] {
  const lines = csvText.trim().split('\n')
  const results: ParsedRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.replace(/"/g, '').trim())
    if (cols.length < 4) continue
    const debit = parseAmount(cols[2] || '0')
    const credit = parseAmount(cols[3] || '0')
    if (debit === 0 && credit === 0) continue
    results.push({
      date: parseThaiDate(cols[0]),
      description: cols[1] || '',
      amount: debit > 0 ? debit : credit,
      type: debit > 0 ? 'expense' : 'income',
      balance: cols[4] ? parseAmount(cols[4]) : undefined,
    })
  }
  return results
}

// SCB: CSV columns - Date, Description, Withdrawal, Deposit, Balance
export function parseSCB(csvText: string): ParsedRow[] {
  const lines = csvText.trim().split('\n')
  const results: ParsedRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.replace(/"/g, '').trim())
    if (cols.length < 4) continue
    const withdrawal = parseAmount(cols[2] || '0')
    const deposit = parseAmount(cols[3] || '0')
    if (withdrawal === 0 && deposit === 0) continue
    results.push({
      date: parseThaiDate(cols[0]),
      description: cols[1] || '',
      amount: withdrawal > 0 ? withdrawal : deposit,
      type: withdrawal > 0 ? 'expense' : 'income',
      balance: cols[4] ? parseAmount(cols[4]) : undefined,
    })
  }
  return results
}

// GSB (ออมสิน): CSV columns - วันที่, เวลา, รายการ, ถอน, ฝาก, คงเหลือ
export function parseGSB(csvText: string): ParsedRow[] {
  const lines = csvText.trim().split('\n')
  const results: ParsedRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.replace(/"/g, '').trim())
    if (cols.length < 5) continue
    const withdrawal = parseAmount(cols[3] || '0')
    const deposit = parseAmount(cols[4] || '0')
    if (withdrawal === 0 && deposit === 0) continue
    results.push({
      date: parseThaiDate(cols[0]),
      description: cols[2] || '',
      amount: withdrawal > 0 ? withdrawal : deposit,
      type: withdrawal > 0 ? 'expense' : 'income',
      balance: cols[5] ? parseAmount(cols[5]) : undefined,
    })
  }
  return results
}

// TTB: CSV columns - วันที่, รายการ, ถอน/เดบิต, ฝาก/เครดิต, ยอดคงเหลือ
export function parseTTB(csvText: string): ParsedRow[] {
  const lines = csvText.trim().split('\n')
  const results: ParsedRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.replace(/"/g, '').trim())
    if (cols.length < 4) continue
    const debit = parseAmount(cols[2] || '0')
    const credit = parseAmount(cols[3] || '0')
    if (debit === 0 && credit === 0) continue
    results.push({
      date: parseThaiDate(cols[0]),
      description: cols[1] || '',
      amount: debit > 0 ? debit : credit,
      type: debit > 0 ? 'expense' : 'income',
      balance: cols[4] ? parseAmount(cols[4]) : undefined,
    })
  }
  return results
}

export function parseCSVByBank(csvText: string, bank: string): ParsedRow[] {
  switch (bank) {
    case 'KTB': return parseKTB(csvText)
    case 'SCB': return parseSCB(csvText)
    case 'GSB': return parseGSB(csvText)
    case 'TTB': return parseTTB(csvText)
    default: return []
  }
}

export function guessCategory(description: string): string {
  const desc = description.toLowerCase()
  if (desc.includes('food') || desc.includes('ร้านอาหาร') || desc.includes('7-11') || desc.includes('coffee') || desc.includes('grab food')) return 'food'
  if (desc.includes('grab') || desc.includes('bolt') || desc.includes('น้ำมัน') || desc.includes('bts') || desc.includes('mrt')) return 'transport'
  if (desc.includes('ค่าเช่า') || desc.includes('rent') || desc.includes('ค่าบ้าน')) return 'housing'
  if (desc.includes('ไฟ') || desc.includes('น้ำประปา') || desc.includes('เน็ต') || desc.includes('dtac') || desc.includes('ais') || desc.includes('true')) return 'utilities'
  if (desc.includes('โรงพยาบาล') || desc.includes('หมอ') || desc.includes('ยา') || desc.includes('clinic')) return 'health'
  if (desc.includes('โรงเรียน') || desc.includes('มหาวิทยาลัย') || desc.includes('เรียน') || desc.includes('หนังสือ')) return 'education'
  if (desc.includes('ประกัน') || desc.includes('insurance')) return 'insurance'
  if (desc.includes('เงินเดือน') || desc.includes('salary') || desc.includes('payroll')) return 'salary'
  if (desc.includes('shopee') || desc.includes('lazada') || desc.includes('amazon')) return 'shopping'
  return 'other'
}

export type { ParsedRow }
