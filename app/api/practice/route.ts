import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import PracticePaper from "@/models/PracticePaper"
import Exam from "@/models/Exam"
import { slugify, isMongoId } from "@/lib/slugify"
import mongoose from "mongoose"

const ObjectId = mongoose.Types.ObjectId

type PracticePaperType = "practice" | "full_length" | "previous_paper"
/** 1=Exam, 2=Subject, 3=Unit, 4=Chapter, 5=Topic, 6=Subtopic, 7=Definition */
type ContentLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7

function toPaperJson(doc: {
  _id: mongoose.Types.ObjectId
  examId: mongoose.Types.ObjectId
  level: number
  subjectId?: mongoose.Types.ObjectId
  unitId?: mongoose.Types.ObjectId
  chapterId?: mongoose.Types.ObjectId
  topicId?: mongoose.Types.ObjectId
  subtopicId?: mongoose.Types.ObjectId
  definitionId?: mongoose.Types.ObjectId
  type: string
  title: string
  slug: string
  description?: string
  durationMinutes: number
  totalMarks: number
  totalQuestions: number
  difficulty?: string
  year?: number
  orderNumber: number
  status: string
  locked?: boolean
  image?: string
  createdAt?: Date
  updatedAt?: Date
}) {
  return {
    id: doc._id.toString(),
    examId: doc.examId?.toString(),
    level: doc.level as ContentLevel,
    subjectId: doc.subjectId?.toString() ?? undefined,
    unitId: doc.unitId?.toString() ?? undefined,
    chapterId: doc.chapterId?.toString() ?? undefined,
    topicId: doc.topicId?.toString() ?? undefined,
    subtopicId: doc.subtopicId?.toString() ?? undefined,
    definitionId: doc.definitionId?.toString() ?? undefined,
    type: doc.type as PracticePaperType,
    title: doc.title,
    slug: doc.slug,
    description: doc.description ?? "",
    durationMinutes: doc.durationMinutes ?? 60,
    totalMarks: doc.totalMarks ?? 100,
    totalQuestions: doc.totalQuestions ?? 30,
    difficulty: doc.difficulty ?? "Medium",
    year: doc.year ?? undefined,
    orderNumber: doc.orderNumber ?? 1,
    status: doc.status ?? "Active",
    locked: doc.locked ?? false,
    image: doc.image ?? "",
    createdAt: doc.createdAt
      ? new Date(doc.createdAt).toISOString()
      : undefined,
    updatedAt: doc.updatedAt
      ? new Date(doc.updatedAt).toISOString()
      : undefined,
  }
}

/** GET /api/practice – list practice papers. Query: examId, type, level, status */
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const examId = searchParams.get("examId")
    const type = searchParams.get("type") as PracticePaperType | null
    const level = searchParams.get("level")
    const status = searchParams.get("status")

    const filter: Record<string, unknown> = {}
    if (examId && isMongoId(examId)) filter.examId = new ObjectId(examId)
    if (type && ["practice", "full_length", "previous_paper"].includes(type)) filter.type = type
    if (level !== null && level !== "") {
      const l = parseInt(level, 10)
      if (l >= 1 && l <= 7) filter.level = l
    }
    if (status === "Active" || status === "Inactive") filter.status = status

    const list = await PracticePaper.find(filter)
      .sort({ examId: 1, type: 1, orderNumber: 1 })
      .lean()

    const papers = list.map((doc) => toPaperJson(doc as Parameters<typeof toPaperJson>[0]))
    return NextResponse.json(papers)
  } catch (err) {
    console.error("GET /api/practice error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch practice papers" },
      { status: 500 }
    )
  }
}

/** POST /api/practice – create a new practice paper. Requires examId, title, type. Slug is unique per exam. */
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const examId = body.examId?.trim()
    const title = (body.title ?? "").trim()
    const type = body.type as PracticePaperType

    if (!examId || !isMongoId(examId)) {
      return NextResponse.json({ error: "Valid examId is required" }, { status: 400 })
    }
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }
    if (!["practice", "full_length", "previous_paper"].includes(type)) {
      return NextResponse.json(
        { error: "type must be practice, full_length, or previous_paper" },
        { status: 400 }
      )
    }

    const examExists = await Exam.findById(examId).lean()
    if (!examExists) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    const baseSlug = slugify(title) || "practice-paper"
    const existing = await PracticePaper.findOne({
      examId: new ObjectId(examId),
      slug: baseSlug,
    }).lean()
    if (existing) {
      return NextResponse.json(
        {
          error: "A practice paper with this title already exists for this exam",
          code: "DUPLICATE_SLUG",
        },
        { status: 409 }
      )
    }

    let slug = baseSlug
    let n = 2
    while (
      await PracticePaper.findOne({ examId: new ObjectId(examId), slug }).lean()
    ) {
      slug = `${baseSlug}-${n}`
      n += 1
    }

    const level = Math.min(7, Math.max(1, Number(body.level) || 1)) as ContentLevel
    const maxOrder = await PracticePaper.findOne({
      examId: new ObjectId(examId),
      type,
    })
      .sort({ orderNumber: -1 })
      .select("orderNumber")
      .lean()
    const orderNumber = (maxOrder?.orderNumber ?? 0) + 1

    const doc = await PracticePaper.create({
      examId: new ObjectId(examId),
      level,
      subjectId: body.subjectId && isMongoId(String(body.subjectId)) ? new ObjectId(body.subjectId) : undefined,
      unitId: body.unitId && isMongoId(String(body.unitId)) ? new ObjectId(body.unitId) : undefined,
      chapterId: body.chapterId && isMongoId(String(body.chapterId)) ? new ObjectId(body.chapterId) : undefined,
      topicId: body.topicId && isMongoId(String(body.topicId)) ? new ObjectId(body.topicId) : undefined,
      subtopicId: body.subtopicId && isMongoId(String(body.subtopicId)) ? new ObjectId(body.subtopicId) : undefined,
      definitionId: body.definitionId && isMongoId(String(body.definitionId)) ? new ObjectId(body.definitionId) : undefined,
      type,
      title,
      slug,
      description: (body.description ?? "").trim() || undefined,
      durationMinutes: Math.max(1, Number(body.durationMinutes) || 60),
      totalMarks: Math.max(0, Number(body.totalMarks) || 100),
      totalQuestions: Math.max(0, Number(body.totalQuestions) || 30),
      difficulty: ["Easy", "Medium", "Hard", "Mixed"].includes(body.difficulty)
        ? body.difficulty
        : "Medium",
      year: type === "previous_paper" && body.year != null
        ? Number(body.year)
        : undefined,
      orderNumber,
      status: body.status === "Inactive" ? "Inactive" : "Active",
      locked: Boolean(body.locked),
      image: (body.image ?? "").trim() || undefined,
    })

    return NextResponse.json(toPaperJson(doc as Parameters<typeof toPaperJson>[0]))
  } catch (err) {
    console.error("POST /api/practice error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create practice paper" },
      { status: 500 }
    )
  }
}
