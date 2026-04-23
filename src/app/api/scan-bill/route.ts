import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })
  }

  const { image, mediaType } = await req.json()
  if (!image) {
    return NextResponse.json({ error: 'No image provided' }, { status: 400 })
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: mediaType || 'image/jpeg',
        data: image,
      },
    },
    `Analyze this receipt/bill image and extract the following information. Return ONLY valid JSON, no explanation.

{
  "amount": <number, total amount in the bill, no currency symbol>,
  "date": "<YYYY-MM-DD format, today if not visible>",
  "merchant": "<store/merchant name or empty string>",
  "type": "<'income' or 'expense' — bills/receipts are usually 'expense'>",
  "category": "<one of: food, transport, housing, utilities, health, entertainment, shopping, insurance, savings_transfer, salary, freelance, rental, bonus, other>",
  "description": "<brief description in Thai or English based on the content>"
}

Rules:
- amount must be a number (e.g. 250.00)
- category 'food' for restaurants, grocery, food delivery
- category 'transport' for fuel, taxi, BTS, MRT, parking
- category 'health' for pharmacy, hospital, clinic
- category 'shopping' for retail stores, online shopping
- category 'utilities' for electric, water, internet, phone bills
- category 'entertainment' for movies, games, subscriptions
- If unclear, use 'other'
- date today is ${new Date().toISOString().split('T')[0]}`,
  ])

  const text = result.response.text()
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return NextResponse.json({ error: 'Could not parse bill data' }, { status: 422 })
  }

  const data = JSON.parse(jsonMatch[0])
  return NextResponse.json(data)
}
