import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Unit from "@/models/Unit"
import Chapter from "@/models/Chapter"
import { isMongoId } from "@/lib/slugify"
import mongoose from "mongoose"

/**
 * POST /api/chapters/[param]/visit – increment visit count.
 * param can be:
 * - MongoDB chapter _id (24-char hex) → no query needed
 * - chapter slug → requires unit context: ?unit=slug or ?unitId=id
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    const { param } = await params
    if (!param?.trim()) {
      return NextResponse.json({ error: "Chapter id or slug is required" }, { status: 400 })
    }

    await connectDB()

    let doc: { visits?: number; today?: number } | null = null

    if (isMongoId(param)) {
      doc = await Chapter.findByIdAndUpdate(
        param,
        { $inc: { visits: 1, today: 1 } },
        { new: true }
      )
        .select("visits today")
        .lean()
    } else {
      const slug = param.trim().toLowerCase()
      const { searchParams } = new URL(request.url)
      const unitSlug = searchParams.get("unit")?.toLowerCase()
      const unitIdParam = searchParams.get("unitId")

      let unitId: mongoose.Types.ObjectId | null = null
      if (unitIdParam && isMongoId(unitIdParam)) {
        unitId = new mongoose.Types.ObjectId(unitIdParam)
      } else if (unitSlug) {
        const unit = await Unit.findOne({ slug: unitSlug }).select("_id").lean()
        if (unit) unitId = (unit as { _id: mongoose.Types.ObjectId })._id
      }

      if (!unitId) {
        return NextResponse.json(
          { error: "When using chapter slug, provide ?unit=slug or ?unitId=id" },
          { status: 400 }
        )
      }

      doc = await Chapter.findOneAndUpdate(
        { slug, unitId },
        { $inc: { visits: 1, today: 1 } },
        { new: true }
      )
        .select("visits today")
        .lean()
    }

    if (!doc) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 })
    }
    return NextResponse.json({
      ok: true,
      visits: doc.visits ?? 0,
      today: doc.today ?? 0,
    })
  } catch (err) {
    console.error("POST /api/chapters/[param]/visit error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to record visit" },
      { status: 500 }
    )
  }
}
