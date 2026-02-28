import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Chapter from "@/models/Chapter"
import { isMongoId } from "@/lib/slugify"

/** POST /api/chapters/reorder - batch update orderNumber for chapters */
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const order = Array.isArray(body.order) ? body.order : []
    if (order.length === 0) return NextResponse.json({ ok: true })
    const updates = order.filter(
      (item: { id?: string; orderNumber?: number }) =>
        item.id && isMongoId(String(item.id)) && typeof item.orderNumber === "number"
    )
    const lastModified = new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    for (const item of updates as { id: string; orderNumber: number }[]) {
      await Chapter.findByIdAndUpdate(item.id, { orderNumber: item.orderNumber, lastModified, updatedAt: new Date() })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("POST /api/chapters/reorder error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to reorder chapters" },
      { status: 500 }
    )
  }
}
