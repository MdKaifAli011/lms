import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Exam from "@/models/Exam"
import Subject from "@/models/Subject"
import Unit from "@/models/Unit"
import Chapter from "@/models/Chapter"
import Topic from "@/models/Topic"
import { isMongoId } from "@/lib/slugify"
import mongoose from "mongoose"

/**
 * GET /api/sidebar-tree?examId=...
 * Returns full hierarchy for sidebar in one call: exam → subjects → units → chapters → topics.
 * No weightage/marks (sidebar only needs id, name, slug for navigation).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const examIdParam = searchParams.get("examId")
    if (!examIdParam || !isMongoId(examIdParam)) {
      return NextResponse.json({ error: "Valid examId is required" }, { status: 400 })
    }
    await connectDB()
    const examObjId = new mongoose.Types.ObjectId(examIdParam)
    const exam = await Exam.findById(examObjId).select("name slug").lean()
    if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 })

    const subjects = await Subject.find({ examId: examObjId, status: "Active" })
      .sort({ orderNumber: 1 })
      .select("name slug")
      .lean()
    const subjectIds = (subjects as { _id: mongoose.Types.ObjectId }[]).map((s) => s._id)

    const units = await Unit.find({ subjectId: { $in: subjectIds }, status: "Active" })
      .sort({ orderNumber: 1 })
      .select("name slug subjectId")
      .lean()
    const unitIds = (units as { _id: mongoose.Types.ObjectId }[]).map((u) => u._id)

    const chapters = await Chapter.find({ unitId: { $in: unitIds }, status: "Active" })
      .sort({ orderNumber: 1 })
      .select("name slug unitId")
      .lean()
    const chapterIds = (chapters as { _id: mongoose.Types.ObjectId }[]).map((c) => c._id)

    const topics = await Topic.find({ chapterId: { $in: chapterIds }, status: "Active" })
      .sort({ orderNumber: 1 })
      .select("name slug chapterId")
      .lean()

    const toId = (d: { _id: mongoose.Types.ObjectId }) => d._id.toString()

    const topicList = topics as (Record<string, unknown> & { _id: mongoose.Types.ObjectId; chapterId: mongoose.Types.ObjectId })[]
    const chapterList = chapters as (Record<string, unknown> & { _id: mongoose.Types.ObjectId; unitId: mongoose.Types.ObjectId })[]
    const unitList = units as (Record<string, unknown> & { _id: mongoose.Types.ObjectId; subjectId: mongoose.Types.ObjectId })[]
    const subjectList = subjects as (Record<string, unknown> & { _id: mongoose.Types.ObjectId })[]

    const tree = subjectList.map((s) => {
      const su = unitList.filter((u) => u.subjectId.toString() === toId(s))
      return {
        id: toId(s),
        name: s.name,
        slug: s.slug,
        units: su.map((u) => {
          const ch = chapterList.filter((c) => c.unitId.toString() === toId(u))
          return {
            id: toId(u),
            name: u.name,
            slug: u.slug,
            chapters: ch.map((c) => {
              const tp = topicList.filter((t) => t.chapterId.toString() === toId(c))
              return {
                id: toId(c),
                name: c.name,
                slug: c.slug,
                topics: tp.map((t) => ({
                  id: toId(t),
                  name: (t as { name?: string }).name,
                  slug: (t as { slug?: string }).slug,
                })),
              }
            }),
          }
        }),
      }
    })

    return NextResponse.json({
      exam: { id: examIdParam, name: (exam as { name?: string }).name, slug: (exam as { slug?: string }).slug },
      subjects: tree,
    })
  } catch (err) {
    console.error("GET /api/sidebar-tree error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch sidebar tree" },
      { status: 500 }
    )
  }
}
