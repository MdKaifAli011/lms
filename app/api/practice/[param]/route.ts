import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import PracticePaper from "@/models/PracticePaper"
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
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : undefined,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : undefined,
  }
}

/** GET /api/practice/[param] – get by slug or MongoDB _id */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    const { param } = await params
    if (!param) {
      return NextResponse.json({ error: "Missing slug or id" }, { status: 400 })
    }
    await connectDB()
    const doc = isMongoId(param)
      ? await PracticePaper.findById(param).lean()
      : await PracticePaper.findOne({ slug: param.toLowerCase() }).lean()
    if (!doc) {
      return NextResponse.json({ error: "Practice paper not found" }, { status: 404 })
    }
    return NextResponse.json(toPaperJson(doc as Parameters<typeof toPaperJson>[0]))
  } catch (err) {
    console.error("GET /api/practice/[param] error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch practice paper" },
      { status: 500 }
    )
  }
}

/** PUT /api/practice/[param] – update; param must be MongoDB _id */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    const { param } = await params
    if (!param || !isMongoId(param)) {
      return NextResponse.json({ error: "Valid practice paper id is required" }, { status: 400 })
    }
    await connectDB()
    const body = await request.json()
    const existing = await PracticePaper.findById(param).lean() as {
      examId: mongoose.Types.ObjectId
      title?: string
      slug?: string
      type?: string
    } | null
    if (!existing) {
      return NextResponse.json({ error: "Practice paper not found" }, { status: 404 })
    }

    const title = (body.title ?? existing.title ?? "").trim()
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    let slug = existing.slug ?? ""
    if (title !== existing.title) {
      const baseSlug = slugify(title) || "practice-paper"
      const duplicate = await PracticePaper.findOne({
        examId: existing.examId,
        slug: baseSlug,
        _id: { $ne: new ObjectId(param) },
      }).lean()
      if (duplicate) {
        return NextResponse.json(
          { error: "A practice paper with this title already exists for this exam", code: "DUPLICATE_SLUG" },
          { status: 409 }
        )
      }
      slug = baseSlug
    }

    const update: Record<string, unknown> = {
      title,
      slug,
      updatedAt: new Date(),
    }
    if (body.examId !== undefined && isMongoId(String(body.examId))) {
      update.examId = new ObjectId(body.examId)
    }
    if (body.subjectId !== undefined) {
      update.subjectId = body.subjectId && isMongoId(String(body.subjectId)) ? new ObjectId(body.subjectId) : null
    }
    if (body.unitId !== undefined) {
      update.unitId = body.unitId && isMongoId(String(body.unitId)) ? new ObjectId(body.unitId) : null
    }
    if (body.chapterId !== undefined) {
      update.chapterId = body.chapterId && isMongoId(String(body.chapterId)) ? new ObjectId(body.chapterId) : null
    }
    if (body.topicId !== undefined) {
      update.topicId = body.topicId && isMongoId(String(body.topicId)) ? new ObjectId(body.topicId) : null
    }
    if (body.subtopicId !== undefined) {
      update.subtopicId = body.subtopicId && isMongoId(String(body.subtopicId)) ? new ObjectId(body.subtopicId) : null
    }
    if (body.definitionId !== undefined) {
      update.definitionId = body.definitionId && isMongoId(String(body.definitionId)) ? new ObjectId(body.definitionId) : null
    }
    if (["practice", "full_length", "previous_paper"].includes(body.type)) {
      update.type = body.type
    }
    if (body.level !== undefined) {
      const l = Math.min(7, Math.max(1, Number(body.level)))
      update.level = l
    }
    if (body.description !== undefined) update.description = String(body.description).trim() || ""
    if (typeof body.durationMinutes === "number") update.durationMinutes = Math.max(1, body.durationMinutes)
    if (typeof body.totalMarks === "number") update.totalMarks = Math.max(0, body.totalMarks)
    if (typeof body.totalQuestions === "number") update.totalQuestions = Math.max(0, body.totalQuestions)
    if (["Easy", "Medium", "Hard", "Mixed"].includes(body.difficulty)) update.difficulty = body.difficulty
    if (body.year !== undefined) update.year = body.type === "previous_paper" ? Number(body.year) : null
    if (typeof body.orderNumber === "number") update.orderNumber = body.orderNumber
    if (body.status === "Active" || body.status === "Inactive") update.status = body.status
    if (typeof body.locked === "boolean") update.locked = body.locked
    if (body.image !== undefined) update.image = String(body.image).trim() || ""

    await PracticePaper.findByIdAndUpdate(param, { $set: update })
    const updated = await PracticePaper.findById(param).lean()
    if (!updated) {
      return NextResponse.json({ error: "Practice paper not found" }, { status: 404 })
    }
    return NextResponse.json(toPaperJson(updated as Parameters<typeof toPaperJson>[0]))
  } catch (err) {
    console.error("PUT /api/practice/[param] error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update practice paper" },
      { status: 500 }
    )
  }
}

/** DELETE /api/practice/[param] – delete; param must be MongoDB _id */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    const { param } = await params
    if (!param || !isMongoId(param)) {
      return NextResponse.json({ error: "Valid practice paper id is required" }, { status: 400 })
    }
    await connectDB()
    const doc = await PracticePaper.findByIdAndDelete(param)
    if (!doc) {
      return NextResponse.json({ error: "Practice paper not found" }, { status: 404 })
    }
    return NextResponse.json({ ok: true, id: param })
  } catch (err) {
    console.error("DELETE /api/practice/[param] error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete practice paper" },
      { status: 500 }
    )
  }
}
