import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import PracticePaper from "@/models/PracticePaper"
import { isMongoId } from "@/lib/slugify"

/** POST /api/practice/reorder – batch update orderNumber for practice papers */
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const order = Array.isArray(body.order) ? body.order : []
    if (order.length === 0) {
      return NextResponse.json({ ok: true })
    }
    const updates = order.filter(
      (item: { id?: string; orderNumber?: number }) =>
        item.id && isMongoId(String(item.id)) && typeof item.orderNumber === "number"
    )
    await Promise.all(
      updates.map((item: { id: string; orderNumber: number }) =>
        PracticePaper.findByIdAndUpdate(item.id, {
          orderNumber: item.orderNumber,
          updatedAt: new Date(),
        })
      )
    )
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("POST /api/practice/reorder error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to reorder practice papers" },
      { status: 500 }
    )
  }
}
