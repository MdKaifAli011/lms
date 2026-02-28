import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Topic from "@/models/Topic"
import Subtopic from "@/models/Subtopic"
import { isMongoId } from "@/lib/slugify"
import mongoose from "mongoose"

/**
 * POST /api/subtopics/[param]/visit – increment visit count.
 * param can be:
 * - MongoDB subtopic _id (24-char hex) → no query needed
 * - subtopic slug → requires topic context: ?topic=slug or ?topicId=id
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    const { param } = await params
    if (!param?.trim()) {
      return NextResponse.json({ error: "Subtopic id or slug is required" }, { status: 400 })
    }

    await connectDB()

    let doc: { visits?: number; today?: number } | null = null

    if (isMongoId(param)) {
      doc = await Subtopic.findByIdAndUpdate(
        param,
        { $inc: { visits: 1, today: 1 } },
        { new: true }
      )
        .select("visits today")
        .lean()
    } else {
      const slug = param.trim().toLowerCase()
      const { searchParams } = new URL(request.url)
      const topicSlug = searchParams.get("topic")?.toLowerCase()
      const topicIdParam = searchParams.get("topicId")

      let topicId: mongoose.Types.ObjectId | null = null
      if (topicIdParam && isMongoId(topicIdParam)) {
        topicId = new mongoose.Types.ObjectId(topicIdParam)
      } else if (topicSlug) {
        const topic = await Topic.findOne({ slug: topicSlug }).select("_id").lean()
        if (topic) topicId = (topic as { _id: mongoose.Types.ObjectId })._id
      }

      if (!topicId) {
        return NextResponse.json(
          { error: "When using subtopic slug, provide ?topic=slug or ?topicId=id" },
          { status: 400 }
        )
      }

      doc = await Subtopic.findOneAndUpdate(
        { slug, topicId },
        { $inc: { visits: 1, today: 1 } },
        { new: true }
      )
        .select("visits today")
        .lean()
    }

    if (!doc) {
      return NextResponse.json({ error: "Subtopic not found" }, { status: 404 })
    }
    return NextResponse.json({
      ok: true,
      visits: doc.visits ?? 0,
      today: doc.today ?? 0,
    })
  } catch (err) {
    console.error("POST /api/subtopics/[param]/visit error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to record visit" },
      { status: 500 }
    )
  }
}
