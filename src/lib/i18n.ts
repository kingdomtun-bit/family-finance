export type Lang = 'th' | 'en'

const translations = {
  // Navigation
  dashboard: { th: 'ภาพรวม', en: 'Dashboard' },
  accounts: { th: 'บัญชีธนาคาร', en: 'Accounts' },
  transactions: { th: 'รายการเงิน', en: 'Transactions' },
  savings: { th: 'เป้าหมายออม', en: 'Savings Goals' },
  debts: { th: 'หนี้สิน', en: 'Debts' },
  calendar: { th: 'ปฏิทิน', en: 'Calendar' },
  reports: { th: 'รายงาน', en: 'Reports' },
  settings: { th: 'ตั้งค่า', en: 'Settings' },

  // Common
  add: { th: 'เพิ่ม', en: 'Add' },
  edit: { th: 'แก้ไข', en: 'Edit' },
  delete: { th: 'ลบ', en: 'Delete' },
  save: { th: 'บันทึก', en: 'Save' },
  cancel: { th: 'ยกเลิก', en: 'Cancel' },
  confirm: { th: 'ยืนยัน', en: 'Confirm' },
  search: { th: 'ค้นหา', en: 'Search' },
  filter: { th: 'กรอง', en: 'Filter' },
  import: { th: 'นำเข้า', en: 'Import' },
  export: { th: 'ส่งออก', en: 'Export' },
  close: { th: 'ปิด', en: 'Close' },
  name: { th: 'ชื่อ', en: 'Name' },
  amount: { th: 'จำนวนเงิน', en: 'Amount' },
  date: { th: 'วันที่', en: 'Date' },
  category: { th: 'หมวดหมู่', en: 'Category' },
  description: { th: 'รายละเอียด', en: 'Description' },
  member: { th: 'สมาชิก', en: 'Member' },
  all: { th: 'ทั้งหมด', en: 'All' },
  total: { th: 'รวม', en: 'Total' },
  balance: { th: 'ยอดคงเหลือ', en: 'Balance' },
  income: { th: 'รายรับ', en: 'Income' },
  expense: { th: 'รายจ่าย', en: 'Expense' },
  transfer: { th: 'โอนเงิน', en: 'Transfer' },
  monthly: { th: 'รายเดือน', en: 'Monthly' },
  yearly: { th: 'รายปี', en: 'Yearly' },
  progress: { th: 'ความคืบหน้า', en: 'Progress' },
  target: { th: 'เป้าหมาย', en: 'Target' },
  remaining: { th: 'คงเหลือ', en: 'Remaining' },
  deadline: { th: 'กำหนด', en: 'Deadline' },
  completed: { th: 'สำเร็จแล้ว', en: 'Completed' },
  type: { th: 'ประเภท', en: 'Type' },
  bank: { th: 'ธนาคาร', en: 'Bank' },
  note: { th: 'หมายเหตุ', en: 'Note' },
  logout: { th: 'ออกจากระบบ', en: 'Logout' },
  login: { th: 'เข้าสู่ระบบ', en: 'Login' },
  email: { th: 'อีเมล', en: 'Email' },
  password: { th: 'รหัสผ่าน', en: 'Password' },
  familyName: { th: 'ชื่อครอบครัว', en: 'Family Name' },

  // Dashboard
  totalAssets: { th: 'สินทรัพย์รวม', en: 'Total Assets' },
  totalDebts: { th: 'หนี้รวม', en: 'Total Debts' },
  netWorth: { th: 'มูลค่าสุทธิ', en: 'Net Worth' },
  monthlyIncome: { th: 'รายรับเดือนนี้', en: 'Monthly Income' },
  monthlyExpense: { th: 'รายจ่ายเดือนนี้', en: 'Monthly Expenses' },
  recentTransactions: { th: 'รายการล่าสุด', en: 'Recent Transactions' },
  upcomingEvents: { th: 'กิจกรรมที่จะถึง', en: 'Upcoming Events' },
  savingsProgress: { th: 'ความคืบหน้าการออม', en: 'Savings Progress' },

  // Savings categories
  retirement: { th: 'เกษียณอายุ', en: 'Retirement' },
  education: { th: 'การศึกษาลูก', en: 'Child Education' },
  travel: { th: 'ท่องเที่ยว', en: 'Travel' },
  emergency: { th: 'กองฉุกเฉิน', en: 'Emergency Fund' },
  investment: { th: 'ลงทุน', en: 'Investment' },
  annual: { th: 'ค่าใช้จ่ายรายปี', en: 'Annual Expenses' },
  other: { th: 'อื่นๆ', en: 'Other' },

  // Expense categories
  food: { th: 'อาหาร', en: 'Food' },
  transport: { th: 'เดินทาง', en: 'Transport' },
  housing: { th: 'ที่อยู่อาศัย', en: 'Housing' },
  utilities: { th: 'ค่าสาธารณูปโภค', en: 'Utilities' },
  health: { th: 'สุขภาพ', en: 'Health' },
  entertainment: { th: 'บันเทิง', en: 'Entertainment' },
  shopping: { th: 'ช้อปปิ้ง', en: 'Shopping' },
  insurance: { th: 'ประกัน', en: 'Insurance' },
  savings_transfer: { th: 'โอนออม', en: 'Savings Transfer' },

  // Income categories
  salary: { th: 'เงินเดือน', en: 'Salary' },
  freelance: { th: 'งานอิสระ', en: 'Freelance' },
  rental: { th: 'ค่าเช่า', en: 'Rental' },
  bonus: { th: 'โบนัส', en: 'Bonus' },

  // Debt types
  mortgage: { th: 'สินเชื่อบ้าน', en: 'Mortgage' },
  car: { th: 'สินเชื่อรถ', en: 'Car Loan' },
  personal: { th: 'ส่วนตัว / สินเชื่อส่วนบุคคล', en: 'Personal / Personal Loan' },
  credit_card: { th: 'บัตรเครดิต', en: 'Credit Card' },
  student: { th: 'กยศ./สินเชื่อการศึกษา', en: 'Student Loan' },

  // Calendar categories
  medical: { th: 'นัดแพทย์', en: 'Medical' },
  finance: { th: 'การเงิน', en: 'Finance' },
  work: { th: 'การงาน', en: 'Work' },
  family: { th: 'ครอบครัว', en: 'Family' },

  // Account types
  savings_account: { th: 'ออมทรัพย์', en: 'Savings' },
  current: { th: 'กระแสรายวัน', en: 'Current' },
  fixed: { th: 'ฝากประจำ', en: 'Fixed Deposit' },

  // Messages
  noData: { th: 'ไม่มีข้อมูล', en: 'No data' },
  loading: { th: 'กำลังโหลด...', en: 'Loading...' },
  deleteConfirm: { th: 'ยืนยันการลบ?', en: 'Confirm delete?' },
  importCSV: { th: 'นำเข้า CSV จากธนาคาร', en: 'Import CSV from bank' },
  monthlyTarget: { th: 'เป้าออมต่อเดือน', en: 'Monthly savings target' },
  projection: { th: 'คาดการณ์', en: 'Projection' },
  interestRate: { th: 'ดอกเบี้ย (%/ปี)', en: 'Interest rate (%/year)' },
  paymentDate: { th: 'วันชำระ', en: 'Payment date' },
  lender: { th: 'เจ้าหนี้', en: 'Lender' },
  addAccount: { th: 'เพิ่มบัญชี', en: 'Add Account' },
  addTransaction: { th: 'เพิ่มรายการ', en: 'Add Transaction' },
  addGoal: { th: 'เพิ่มเป้าหมาย', en: 'Add Goal' },
  addDebt: { th: 'เพิ่มหนี้สิน', en: 'Add Debt' },
  addAppointment: { th: 'เพิ่มนัดหมาย', en: 'Add Appointment' },
  accountName: { th: 'ชื่อบัญชี', en: 'Account Name' },
  accountNumber: { th: 'เลขบัญชี', en: 'Account Number' },
  accountType: { th: 'ประเภทบัญชี', en: 'Account Type' },
  paidAmount: { th: 'ชำระแล้ว', en: 'Paid Amount' },
  addDeposit: { th: 'เพิ่มเงินออม', en: 'Add Deposit' },
  welcomeBack: { th: 'ยินดีต้อนรับกลับ', en: 'Welcome back' },
  familyFinance: { th: 'การเงินครอบครัว', en: 'Family Finance' },
  signIn: { th: 'เข้าสู่ระบบ', en: 'Sign In' },
  createAccount: { th: 'สร้างบัญชีใหม่', en: 'Create Account' },
  register: { th: 'ลงทะเบียน', en: 'Register' },
  alreadyHaveAccount: { th: 'มีบัญชีแล้ว?', en: 'Already have an account?' },
  noAccount: { th: 'ยังไม่มีบัญชี?', en: "Don't have an account?" },
  member1Name: { th: 'ชื่อสมาชิกคนที่ 1', en: 'Member 1 Name' },
  member2Name: { th: 'ชื่อสมาชิกคนที่ 2', en: 'Member 2 Name' },
  time: { th: 'เวลา', en: 'Time' },
  reminderDays: { th: 'แจ้งเตือนล่วงหน้า (วัน)', en: 'Remind before (days)' },
  frequency: { th: 'ความถี่', en: 'Frequency' },
  incomeSource: { th: 'แหล่งรายรับ', en: 'Income Source' },
  weekly: { th: 'รายสัปดาห์', en: 'Weekly' },
  daily: { th: 'รายวัน', en: 'Daily' },
  irregular: { th: 'ไม่สม่ำเสมอ', en: 'Irregular' },
} as const

export type TranslationKey = keyof typeof translations

export function t(key: TranslationKey, lang: Lang): string {
  return translations[key]?.[lang] ?? key
}

export function getMonthName(month: number, lang: Lang): string {
  const months = lang === 'th'
    ? ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return months[month] ?? ''
}
