import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Exam from "@/models/Exam"
import Subject from "@/models/Subject"
import { isMongoId } from "@/lib/slugify"
import mongoose from "mongoose"

/**
 * POST /api/subjects/[param]/visit – increment visit count.
 * param can be:
 * - MongoDB subject _id (24-char hex) → no query needed
 * - subject slug (e.g. "physics") → requires exam context: ?exam=slug or ?examId=id
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    const { param } = await params
    if (!param?.trim()) {
      return NextResponse.json({ error: "Subject id or slug is required" }, { status: 400 })
    }

    await connectDB()

    let doc: { visits?: number; today?: number } | null = null

    if (isMongoId(param)) {
      doc = await Subject.findByIdAndUpdate(
        param,
        { $inc: { visits: 1, today: 1 } },
        { new: true }
      )
        .select("visits today")
        .lean()
    } else {
      const slug = param.trim().toLowerCase()
      const { searchParams } = new URL(request.url)
      const examSlug = searchParams.get("exam")?.toLowerCase()
      const examIdParam = searchParams.get("examId")

      let examId: mongoose.Types.ObjectId | null = null
      if (examIdParam && isMongoId(examIdParam)) {
        examId = new mongoose.Types.ObjectId(examIdParam)
      } else if (examSlug) {
        const exam = await Exam.findOne({ slug: examSlug }).select("_id").lean()
        if (exam) examId = (exam as { _id: mongoose.Types.ObjectId })._id
      }

      if (!examId) {
        return NextResponse.json(
          { error: "When using subject slug, provide ?exam=slug or ?examId=id" },
          { status: 400 }
        )
      }

      doc = await Subject.findOneAndUpdate(
        { slug, examId },
        { $inc: { visits: 1, today: 1 } },
        { new: true }
      )
        .select("visits today")
        .lean()
    }

    if (!doc) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 })
    }
    return NextResponse.json({
      ok: true,
      visits: doc.visits ?? 0,
      today: doc.today ?? 0,
    })
  } catch (err) {
    console.error("POST /api/subjects/[param]/visit error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to record visit" },
      { status: 500 }
    )
  }
}
