import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Subtopic from "@/models/Subtopic"
import Definition from "@/models/Definition"
import { isMongoId } from "@/lib/slugify"
import mongoose from "mongoose"

/**
 * POST /api/definitions/[param]/visit – increment visit count.
 * param can be:
 * - MongoDB definition _id (24-char hex) → no query needed
 * - definition slug → requires subtopic context: ?subtopic=slug or ?subtopicId=id
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    const { param } = await params
    if (!param?.trim()) {
      return NextResponse.json({ error: "Definition id or slug is required" }, { status: 400 })
    }

    await connectDB()

    let doc: { visits?: number; today?: number } | null = null

    if (isMongoId(param)) {
      doc = await Definition.findByIdAndUpdate(
        param,
        { $inc: { visits: 1, today: 1 } },
        { new: true }
      )
        .select("visits today")
        .lean()
    } else {
      const slug = param.trim().toLowerCase()
      const { searchParams } = new URL(request.url)
      const subtopicSlug = searchParams.get("subtopic")?.toLowerCase()
      const subtopicIdParam = searchParams.get("subtopicId")

      let subtopicId: mongoose.Types.ObjectId | null = null
      if (subtopicIdParam && isMongoId(subtopicIdParam)) {
        subtopicId = new mongoose.Types.ObjectId(subtopicIdParam)
      } else if (subtopicSlug) {
        const subtopic = await Subtopic.findOne({ slug: subtopicSlug }).select("_id").lean()
        if (subtopic) subtopicId = (subtopic as { _id: mongoose.Types.ObjectId })._id
      }

      if (!subtopicId) {
        return NextResponse.json(
          { error: "When using definition slug, provide ?subtopic=slug or ?subtopicId=id" },
          { status: 400 }
        )
      }

      doc = await Definition.findOneAndUpdate(
        { slug, subtopicId },
        { $inc: { visits: 1, today: 1 } },
        { new: true }
      )
        .select("visits today")
        .lean()
    }

    if (!doc) {
      return NextResponse.json({ error: "Definition not found" }, { status: 404 })
    }
    return NextResponse.json({
      ok: true,
      visits: doc.visits ?? 0,
      today: doc.today ?? 0,
    })
  } catch (err) {
    console.error("POST /api/definitions/[param]/visit error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to record visit" },
      { status: 500 }
    )
  }
}
