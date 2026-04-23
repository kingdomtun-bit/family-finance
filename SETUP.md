# Family Finance Dashboard — Setup Guide

## รันในเครื่องทันที (Local)
```bash
cd family-finance
npm install
npm run dev
# เปิด http://localhost:3000
```
รหัสผ่านเริ่มต้น: **family2024**

---

## Deploy ฟรีบน Vercel (เข้าจากมือถือได้)

### ขั้นตอนที่ 1 — GitHub
1. สมัคร [github.com](https://github.com)
2. สร้าง repository ใหม่ชื่อ `family-finance`
3. รันคำสั่งนี้:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/family-finance.git
git push -u origin main
```

### ขั้นตอนที่ 2 — Vercel
1. สมัคร [vercel.com](https://vercel.com)
2. กด **"Add New Project"** → เลือก GitHub repo
3. กด **Deploy** (ไม่ต้องตั้งค่าอะไร)
4. ได้ URL เช่น `https://family-finance-xxx.vercel.app`

---

## นำเข้า CSV จากธนาคาร
| ธนาคาร | วิธีดาวน์โหลด |
|--------|--------------|
| **กรุงไทย (KTB)** | Krungthai NEXT → ประวัติรายการ → Export CSV |
| **SCB** | SCB Easy → บัญชี → ดูประวัติ → Export |
| **ออมสิน (GSB)** | MyMo → รายการเดินบัญชี → Download |
| **TTB** | ttb touch → บัญชี → Statement → CSV |

---

## โครงสร้างแอป
```
/ (redirect)
/login      — เข้าสู่ระบบ / ลงทะเบียน
/dashboard  — ภาพรวมการเงิน
/accounts   — บัญชีธนาคาร + นำเข้า CSV
/transactions — รายการเงินทั้งหมด
/savings    — เป้าหมายออม 6 ก้อน
/debts      — ติดตามหนี้สิน
/calendar   — ปฏิทินนัดหมาย
/reports    — รายงาน/กราฟ
/settings   — ตั้งค่า + สำรองข้อมูล
```
