import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Exam from "@/models/Exam"
import Subject from "@/models/Subject"
import Unit from "@/models/Unit"
import Chapter from "@/models/Chapter"
import Topic from "@/models/Topic"
import Subtopic from "@/models/Subtopic"
import Definition from "@/models/Definition"
import { isMongoId } from "@/lib/slugify"
import mongoose from "mongoose"

/** GET /api/syllabus-hierarchy?examId=... – syllabus tree API: full 7-level hierarchy with weightage and marks (one call). */
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
      .select("name slug weightage marks")
      .lean()
    const subjectIds = (subjects as { _id: mongoose.Types.ObjectId }[]).map((s) => s._id)

    const units = await Unit.find({ subjectId: { $in: subjectIds }, status: "Active" })
      .sort({ orderNumber: 1 })
      .select("name slug subjectId weightage marks")
      .lean()
    const unitIds = (units as { _id: mongoose.Types.ObjectId }[]).map((u) => u._id)

    const chapters = await Chapter.find({ unitId: { $in: unitIds }, status: "Active" })
      .sort({ orderNumber: 1 })
      .select("name slug unitId weightage marks")
      .lean()
    const chapterIds = (chapters as { _id: mongoose.Types.ObjectId }[]).map((c) => c._id)

    const topics = await Topic.find({ chapterId: { $in: chapterIds }, status: "Active" })
      .sort({ orderNumber: 1 })
      .select("name slug chapterId weightage marks")
      .lean()
    const topicIds = (topics as { _id: mongoose.Types.ObjectId }[]).map((t) => t._id)

    const subtopics = await Subtopic.find({ topicId: { $in: topicIds }, status: "Active" })
      .sort({ orderNumber: 1 })
      .select("name slug topicId weightage marks")
      .lean()
    const subtopicIds = (subtopics as { _id: mongoose.Types.ObjectId }[]).map((s) => s._id)

    const definitions = await Definition.find({ subtopicId: { $in: subtopicIds }, status: "Active" })
      .sort({ orderNumber: 1 })
      .select("name slug subtopicId weightage marks")
      .lean()

    const toId = (d: { _id: mongoose.Types.ObjectId }) => d._id.toString()

    const definitionList = definitions as (Record<string, unknown> & { _id: mongoose.Types.ObjectId; subtopicId: mongoose.Types.ObjectId })[]
    const subtopicList = subtopics as (Record<string, unknown> & { _id: mongoose.Types.ObjectId; topicId: mongoose.Types.ObjectId })[]
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
        weightage: s.weightage,
        marks: s.marks,
        level: "subject" as const,
        units: su.map((u) => {
          const ch = chapterList.filter((c) => c.unitId.toString() === toId(u))
          return {
            id: toId(u),
            name: u.name,
            slug: u.slug,
            weightage: u.weightage,
            marks: u.marks,
            level: "unit" as const,
            chapters: ch.map((c) => {
              const tp = topicList.filter((t) => t.chapterId.toString() === toId(c))
              return {
                id: toId(c),
                name: c.name,
                slug: c.slug,
                weightage: c.weightage,
                marks: c.marks,
                level: "chapter" as const,
                topics: tp.map((t) => {
                  const st = subtopicList.filter((st0) => st0.topicId.toString() === toId(t))
                  return {
                    id: toId(t),
                    name: t.name,
                    slug: t.slug,
                    weightage: t.weightage,
                    marks: t.marks,
                    level: "topic" as const,
                    subtopics: st.map((st0) => {
                      const defs = definitionList.filter((d) => d.subtopicId.toString() === toId(st0))
                      return {
                        id: toId(st0),
                        name: st0.name,
                        slug: st0.slug,
                        weightage: st0.weightage,
                        marks: st0.marks,
                        level: "subtopic" as const,
                        definitions: defs.map((d) => ({
                          id: toId(d),
                          name: d.name,
                          slug: d.slug,
                          weightage: d.weightage,
                          marks: d.marks,
                          level: "definition" as const,
                        })),
                      }
                    }),
                  }
                }),
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
    console.error("GET /api/syllabus-hierarchy error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch syllabus hierarchy" },
      { status: 500 }
    )
  }
}
