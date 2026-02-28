import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Subject from "@/models/Subject"
import { slugify } from "@/lib/slugify"
import { isMongoId } from "@/lib/slugify"
import mongoose from "mongoose"

const ObjectId = mongoose.Types.ObjectId

function toSubjectJson(doc: Record<string, unknown>): Record<string, unknown> {
  const createdAt = doc.createdAt as Date | undefined
  const updatedAt = doc.updatedAt as Date | undefined
  return {
    id: (doc._id as { toString: () => string }).toString(),
    examId: (doc.examId as { toString: () => string })?.toString(),
    name: doc.name,
    slug: doc.slug,
    status: doc.status,
    image: doc.image ?? "No Image",
    content: doc.content ?? "-",
    meta: doc.meta ?? "-",
    visits: doc.visits ?? 0,
    uniqueVisits: doc.uniqueVisits ?? 0,
    today: doc.today ?? 0,
    descriptions: doc.descriptions ?? [],
    orderNumber: doc.orderNumber ?? 0,
    lastModified: doc.lastModified ?? (updatedAt
      ? new Date(updatedAt).toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : undefined),
    contentBody: doc.contentBody ?? "",
    seo: doc.seo ?? {},
    createdAt: createdAt
      ? new Date(createdAt).toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : undefined,
  }
}

/** GET /api/subjects/[param] – get one subject by MongoDB _id */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    const { param } = await params
    if (!param || !isMongoId(param)) {
      return NextResponse.json({ error: "Valid subject id is required" }, { status: 400 })
    }
    await connectDB()
    const doc = await Subject.findById(param).lean()
    if (!doc) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 })
    }
    return NextResponse.json(toSubjectJson(doc as Record<string, unknown>))
  } catch (err) {
    console.error("GET /api/subjects/[param] error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch subject" },
      { status: 500 }
    )
  }
}

/** PUT /api/subjects/[param] – update subject; param must be MongoDB _id. No duplicate slug within same exam. */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    const { param } = await params
    if (!param || !isMongoId(param)) {
      return NextResponse.json({ error: "Valid subject id is required" }, { status: 400 })
    }
    await connectDB()
    const body = await request.json()
    const existing = await Subject.findById(param).lean() as { name?: string; slug?: string; examId?: unknown } | null
    if (!existing) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 })
    }

    const name = (body.name ?? existing.name).trim()
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const examId = body.examId ?? existing.examId
    if (!examId) {
      return NextResponse.json({ error: "examId is required" }, { status: 400 })
    }
    const examObjId = typeof examId === "string" ? new ObjectId(examId) : examId

    let slug = existing.slug ?? ""
    if (name !== existing.name) {
      const baseSlug = slugify(name) || "subject"
      const duplicate = await Subject.findOne({
        examId: examObjId,
        slug: baseSlug,
        _id: { $ne: param },
      }).lean()
      if (duplicate) {
        return NextResponse.json(
          { error: "A subject with this name already exists in this exam", code: "DUPLICATE_SUBJECT" },
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
      examId: examObjId,
      lastModified,
      updatedAt: new Date(),
    }
    if (body.status !== undefined) update.status = body.status === "Inactive" ? "Inactive" : "Active"
    if (Array.isArray(body.descriptions)) update.descriptions = body.descriptions.filter((d: string) => String(d).trim() !== "")
    if (typeof body.orderNumber === "number") update.orderNumber = body.orderNumber
    if (body.image !== undefined) update.image = body.image?.trim() || "No Image"
    if (body.contentBody !== undefined) update.contentBody = body.contentBody
    if (body.seo !== undefined && typeof body.seo === "object") update.seo = { ...body.seo }

    await Subject.collection.updateOne(
      { _id: new ObjectId(param) },
      { $set: update }
    )

    const updated = await Subject.findById(param).lean()
    if (!updated) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 })
    }
    return NextResponse.json(toSubjectJson(updated as Record<string, unknown>))
  } catch (err) {
    console.error("PUT /api/subjects/[param] error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update subject" },
      { status: 500 }
    )
  }
}

/** DELETE /api/subjects/[param] – delete subject; param must be MongoDB _id. Cascades: deletes all units for this subject. */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    const { param } = await params
    if (!param || !isMongoId(param)) {
      return NextResponse.json({ error: "Valid subject id is required" }, { status: 400 })
    }
    await connectDB()
    const Unit = (await import("@/models/Unit")).default
    await Unit.deleteMany({ subjectId: new ObjectId(param) })
    const doc = await Subject.findByIdAndDelete(param)
    if (!doc) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 })
    }
    return NextResponse.json({ ok: true, id: param })
  } catch (err) {
    console.error("DELETE /api/subjects/[param] error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete subject" },
      { status: 500 }
    )
  }
}
