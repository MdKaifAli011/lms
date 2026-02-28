import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Exam from "@/models/Exam"
import { slugify } from "@/lib/slugify"
import { isMongoId } from "@/lib/slugify"
import mongoose from "mongoose"

const ObjectId = mongoose.Types.ObjectId

function toExamJson(doc: {
  _id: mongoose.Types.ObjectId
  name: string
  slug: string
  status: string
  image?: string
  items?: number
  content?: string
  meta?: string
  visits?: number
  uniqueVisits?: number
  today?: number
  descriptions?: string[]
  orderNumber?: number
  lastModified?: string
  contentBody?: string
  seo?: Record<string, unknown>
  createdAt?: Date
  updatedAt?: Date
}) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    status: doc.status,
    image: doc.image ?? "No Image",
    items: doc.items ?? 0,
    content: doc.content ?? "-",
    meta: doc.meta ?? "-",
    visits: doc.visits ?? 0,
    uniqueVisits: doc.uniqueVisits ?? 0,
    today: doc.today ?? 0,
    descriptions: doc.descriptions ?? [],
    orderNumber: doc.orderNumber ?? 0,
    lastModified: doc.lastModified ?? (doc.updatedAt
      ? new Date(doc.updatedAt).toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : undefined),
    contentBody: doc.contentBody ?? "",
    seo: doc.seo ?? {},
    createdAt: doc.createdAt
      ? new Date(doc.createdAt).toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : undefined,
  }
}

/** GET /api/exams/[param] – get by slug (e.g. "ap") or by MongoDB _id (24-char hex) */
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
      ? await Exam.findById(param).lean()
      : await Exam.findOne({ slug: param.toLowerCase() }).lean()
    if (!doc) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }
    return NextResponse.json(toExamJson(doc as Parameters<typeof toExamJson>[0]))
  } catch (err) {
    console.error("GET /api/exams/[param] error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch exam" },
      { status: 500 }
    )
  }
}

/** PUT /api/exams/[param] – update exam; param must be MongoDB _id */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    const { param } = await params
    if (!param || !isMongoId(param)) {
      return NextResponse.json({ error: "Valid exam id is required" }, { status: 400 })
    }
    await connectDB()
    const body = await request.json()
    const existing = await Exam.findById(param).lean() as { name?: string; slug?: string } | null
    if (!existing) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    const name = (body.name ?? existing.name).trim()
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    let slug = existing.slug ?? ""
    if (name !== existing.name) {
      const baseSlug = slugify(name)
      if (!baseSlug) {
        return NextResponse.json({ error: "Valid exam name is required" }, { status: 400 })
      }
      const duplicate = await Exam.findOne({ slug: baseSlug, _id: { $ne: param } }).lean()
      if (duplicate) {
        return NextResponse.json(
          { error: "An exam with this name already exists", code: "DUPLICATE_EXAM" },
          { status: 409 }
        )
      }
      slug = baseSlug
    }

    const lastModified = new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    const update: Record<string, unknown> = {
      name,
      slug,
      lastModified,
      updatedAt: new Date(),
    }
    if (body.status !== undefined) update.status = body.status === "Inactive" ? "Inactive" : "Active"
    if (Array.isArray(body.descriptions)) update.descriptions = body.descriptions.filter((d: string) => String(d).trim() !== "")
    if (typeof body.orderNumber === "number") update.orderNumber = body.orderNumber
    if (body.image !== undefined || body.cardImageUrl !== undefined) {
      const imageUrl = (body.image ?? body.cardImageUrl)?.trim()
      update.image = imageUrl || "No Image"
    }
    if (body.contentBody !== undefined) update.contentBody = body.contentBody
    if (body.seo !== undefined && typeof body.seo === "object") {
      update.seo = { ...body.seo }
    }

    await Exam.collection.updateOne(
      { _id: new ObjectId(param) },
      { $set: update }
    )

    const updated = await Exam.findById(param).lean()
    if (!updated) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }
    return NextResponse.json(toExamJson(updated as Parameters<typeof toExamJson>[0]))
  } catch (err) {
    console.error("PUT /api/exams/[param] error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update exam" },
      { status: 500 }
    )
  }
}

/** DELETE /api/exams/[param] – delete exam (and cascade delete all its subjects); param must be MongoDB _id */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    const { param } = await params
    if (!param || !isMongoId(param)) {
      return NextResponse.json({ error: "Valid exam id is required" }, { status: 400 })
    }
    await connectDB()
    const Subject = (await import("@/models/Subject")).default
    await Subject.deleteMany({ examId: new ObjectId(param) })
    const doc = await Exam.findByIdAndDelete(param)
    if (!doc) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }
    return NextResponse.json({ ok: true, id: param })
  } catch (err) {
    console.error("DELETE /api/exams/[param] error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete exam" },
      { status: 500 }
    )
  }
}
