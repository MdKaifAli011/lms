import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Exam from "@/models/Exam"
import { isMongoId } from "@/lib/slugify"
import { getClientIp } from "@/lib/visit-block"
import { isIpBlocked } from "@/lib/visit-block"

/**
 * POST /api/exams/[param]/visit – increment visit count (for public exam pages).
 * [param] = exam slug (e.g. "neet") or MongoDB _id.
 * Returns the updated visits count. Blocked IPs do not increment counts.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    const { param } = await params
    if (!param) {
      return NextResponse.json({ error: "Missing slug or id" }, { status: 400 })
    }

    const filter = isMongoId(param)
      ? { _id: param }
      : { slug: param.toLowerCase() }

    const clientIp = getClientIp(request)
    if (clientIp && (await isIpBlocked(clientIp))) {
      await connectDB()
      const doc = await Exam.findOne(filter).select("visits today").lean()
      if (!doc) {
        return NextResponse.json({ error: "Exam not found" }, { status: 404 })
      }
      return NextResponse.json({
        ok: true,
        visits: (doc as { visits?: number }).visits ?? 0,
        today: (doc as { today?: number }).today ?? 0,
      })
    }

    await connectDB()

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
