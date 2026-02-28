import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Exam from "@/models/Exam"
import { isMongoId } from "@/lib/slugify"

/** POST /api/exams/reorder – batch update orderNumber for exams */
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
        Exam.findByIdAndUpdate(item.id, {
          orderNumber: item.orderNumber,
          updatedAt: new Date(),
          lastModified: new Date().toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        })
      )
    )
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("POST /api/exams/reorder error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to reorder exams" },
      { status: 500 }
    )
  }
}
