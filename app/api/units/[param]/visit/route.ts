import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Subject from "@/models/Subject"
import Unit from "@/models/Unit"
import { isMongoId } from "@/lib/slugify"
import mongoose from "mongoose"

/**
 * POST /api/units/[param]/visit – increment visit count.
 * param can be:
 * - MongoDB unit _id (24-char hex) → no query needed
 * - unit slug (e.g. "unit-1") → requires subject context: ?subject=slug or ?subjectId=id
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    const { param } = await params
    if (!param?.trim()) {
      return NextResponse.json({ error: "Unit id or slug is required" }, { status: 400 })
    }

    await connectDB()

    let doc: { visits?: number; today?: number } | null = null

    if (isMongoId(param)) {
      doc = await Unit.findByIdAndUpdate(
        param,
        { $inc: { visits: 1, today: 1 } },
        { new: true }
      )
        .select("visits today")
        .lean()
    } else {
      const slug = param.trim().toLowerCase()
      const { searchParams } = new URL(request.url)
      const subjectSlug = searchParams.get("subject")?.toLowerCase()
      const subjectIdParam = searchParams.get("subjectId")

      let subjectId: mongoose.Types.ObjectId | null = null
      if (subjectIdParam && isMongoId(subjectIdParam)) {
        subjectId = new mongoose.Types.ObjectId(subjectIdParam)
      } else if (subjectSlug) {
        const subject = await Subject.findOne({ slug: subjectSlug }).select("_id").lean()
        if (subject) subjectId = (subject as { _id: mongoose.Types.ObjectId })._id
      }

      if (!subjectId) {
        return NextResponse.json(
          { error: "When using unit slug, provide ?subject=slug or ?subjectId=id" },
          { status: 400 }
        )
      }

      doc = await Unit.findOneAndUpdate(
        { slug, subjectId },
        { $inc: { visits: 1, today: 1 } },
        { new: true }
      )
        .select("visits today")
        .lean()
    }

    if (!doc) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 })
    }
    return NextResponse.json({
      ok: true,
      visits: doc.visits ?? 0,
      today: doc.today ?? 0,
    })
  } catch (err) {
    console.error("POST /api/units/[param]/visit error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to record visit" },
      { status: 500 }
    )
  }
}
