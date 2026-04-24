import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const maxDuration = 60

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })
  }

  let image: string, mediaType: string
  try {
    const body = await req.json()
    image = body.image
    mediaType = body.mediaType
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!image) {
    return NextResponse.json({ error: 'No image provided' }, { status: 400 })
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: (mediaType as 'image/jpeg') || 'image/jpeg',
          data: image,
        },
      },
      `Analyze this receipt/bill image. Return ONLY a JSON object, no markdown, no explanation.

{"amount":0,"date":"YYYY-MM-DD","merchant":"","type":"expense","category":"other","description":""}

Rules:
- amount = total number only (e.g. 900)
- type = "income" if receiving money, "expense" if paying
- category: food, transport, housing, utilities, health, entertainment, shopping, insurance, savings_transfer, salary, freelance, rental, bonus, other
- date today = ${new Date().toISOString().split('T')[0]}
- For Thai bank transfer screenshots: type="expense", category="other"`,
    ])

    const text = result.response.text().trim()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: `No JSON in response: ${text.slice(0, 100)}` }, { status: 422 })
    }

    const data = JSON.parse(jsonMatch[0])
    return NextResponse.json(data)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
