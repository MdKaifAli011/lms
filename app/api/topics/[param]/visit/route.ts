import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Chapter from "@/models/Chapter"
import Topic from "@/models/Topic"
import { isMongoId } from "@/lib/slugify"
import mongoose from "mongoose"

/**
 * POST /api/topics/[param]/visit – increment visit count.
 * param can be:
 * - MongoDB topic _id (24-char hex) → no query needed
 * - topic slug → requires chapter context: ?chapter=slug or ?chapterId=id
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    const { param } = await params
    if (!param?.trim()) {
      return NextResponse.json({ error: "Topic id or slug is required" }, { status: 400 })
    }

    await connectDB()

    let doc: { visits?: number; today?: number } | null = null

    if (isMongoId(param)) {
      doc = await Topic.findByIdAndUpdate(
        param,
        { $inc: { visits: 1, today: 1 } },
        { new: true }
      )
        .select("visits today")
        .lean()
    } else {
      const slug = param.trim().toLowerCase()
      const { searchParams } = new URL(request.url)
      const chapterSlug = searchParams.get("chapter")?.toLowerCase()
      const chapterIdParam = searchParams.get("chapterId")

      let chapterId: mongoose.Types.ObjectId | null = null
      if (chapterIdParam && isMongoId(chapterIdParam)) {
        chapterId = new mongoose.Types.ObjectId(chapterIdParam)
      } else if (chapterSlug) {
        const chapter = await Chapter.findOne({ slug: chapterSlug }).select("_id").lean()
        if (chapter) chapterId = (chapter as { _id: mongoose.Types.ObjectId })._id
      }

      if (!chapterId) {
        return NextResponse.json(
          { error: "When using topic slug, provide ?chapter=slug or ?chapterId=id" },
          { status: 400 }
        )
      }

      doc = await Topic.findOneAndUpdate(
        { slug, chapterId },
        { $inc: { visits: 1, today: 1 } },
        { new: true }
      )
        .select("visits today")
        .lean()
    }

    if (!doc) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 })
    }
    return NextResponse.json({
      ok: true,
      visits: doc.visits ?? 0,
      today: doc.today ?? 0,
    })
  } catch (err) {
    console.error("POST /api/topics/[param]/visit error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to record visit" },
      { status: 500 }
    )
  }
}
