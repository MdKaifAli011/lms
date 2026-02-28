import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Exam from "@/models/Exam"
import { isMongoId } from "@/lib/slugify"

/**
 * POST /api/exams/[param]/visit – increment visit count (for public exam pages).
 * [param] = exam slug (e.g. "neet") or MongoDB _id.
 * Returns the updated visits count.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    const { param } = await params
    if (!param) {
      return NextResponse.json({ error: "Missing slug or id" }, { status: 400 })
    }
    await connectDB()

    const filter = isMongoId(param)
      ? { _id: param }
      : { slug: param.toLowerCase() }

    const doc = await Exam.findOneAndUpdate(
      filter,
      { $inc: { visits: 1, today: 1 } },
      { new: true }
    )
      .select("visits today")
      .lean()

    if (!doc) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    return NextResponse.json({
      ok: true,
      visits: (doc as { visits?: number }).visits ?? 0,
      today: (doc as { today?: number }).today ?? 0,
    })
  } catch (err) {
    console.error("POST /api/exams/[param]/visit error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to record visit" },
      { status: 500 }
    )
  }
}
