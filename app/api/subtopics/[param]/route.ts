import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Subtopic from "@/models/Subtopic"
import { slugify } from "@/lib/slugify"
import { isMongoId } from "@/lib/slugify"
import mongoose from "mongoose"

const ObjectId = mongoose.Types.ObjectId

function toSubtopicJson(doc: Record<string, unknown>): Record<string, unknown> {
  const createdAt = doc.createdAt as Date | undefined
  const updatedAt = doc.updatedAt as Date | undefined
  return {
    id: (doc._id as { toString: () => string }).toString(),
    topicId: (doc.topicId as { toString: () => string })?.toString(),
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
    lastModified: doc.lastModified ?? (updatedAt ? new Date(updatedAt).toLocaleString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }) : undefined),
    contentBody: doc.contentBody ?? "",
    seo: doc.seo ?? {},
    createdAt: createdAt ? new Date(createdAt).toLocaleString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }) : undefined,
  }
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ param: string }> }) {
  try {
    const { param } = await params
    if (!param || !isMongoId(param)) return NextResponse.json({ error: "Valid subtopic id is required" }, { status: 400 })
    await connectDB()
    const doc = await Subtopic.findById(param).lean()
    if (!doc) return NextResponse.json({ error: "Subtopic not found" }, { status: 404 })
    return NextResponse.json(toSubtopicJson(doc as Record<string, unknown>))
  } catch (err) {
    console.error("GET /api/subtopics/[param] error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to fetch subtopic" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ param: string }> }) {
  try {
    const { param } = await params
    if (!param || !isMongoId(param)) return NextResponse.json({ error: "Valid subtopic id is required" }, { status: 400 })
    await connectDB()
    const body = await request.json()
    const existing = await Subtopic.findById(param).lean() as { name?: string; slug?: string; topicId?: unknown } | null
    if (!existing) return NextResponse.json({ error: "Subtopic not found" }, { status: 404 })
    const name = (body.name ?? existing.name).trim()
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 })
    const topicId = body.topicId ?? existing.topicId
    if (!topicId) return NextResponse.json({ error: "topicId is required" }, { status: 400 })
    const topicObjId = typeof topicId === "string" ? new ObjectId(topicId) : topicId
    let slug = existing.slug ?? ""
    if (name !== existing.name) {
      const baseSlug = slugify(name) || "subtopic"
      const duplicate = await Subtopic.findOne({ topicId: topicObjId, slug: baseSlug, _id: { $ne: param } }).lean()
      if (duplicate) return NextResponse.json({ error: "A subtopic with this name already exists in this topic", code: "DUPLICATE_SUBTOPIC" }, { status: 409 })
      slug = baseSlug
    }
    const lastModified = new Date().toLocaleString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })
    const update: Record<string, unknown> = { name, slug, topicId: topicObjId, lastModified, updatedAt: new Date() }
    if (body.status !== undefined) update.status = body.status === "Inactive" ? "Inactive" : "Active"
    if (Array.isArray(body.descriptions)) update.descriptions = body.descriptions.filter((d: string) => String(d).trim() !== "")
    if (typeof body.orderNumber === "number") update.orderNumber = body.orderNumber
    if (body.image !== undefined) update.image = body.image?.trim() || "No Image"
    if (body.contentBody !== undefined) update.contentBody = body.contentBody
    if (body.seo !== undefined && typeof body.seo === "object") update.seo = { ...body.seo }
    await Subtopic.collection.updateOne({ _id: new ObjectId(param) }, { $set: update })
    const updated = await Subtopic.findById(param).lean()
    if (!updated) return NextResponse.json({ error: "Subtopic not found" }, { status: 404 })
    return NextResponse.json(toSubtopicJson(updated as Record<string, unknown>))
  } catch (err) {
    console.error("PUT /api/subtopics/[param] error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to update subtopic" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ param: string }> }) {
  try {
    const { param } = await params
    if (!param || !isMongoId(param)) return NextResponse.json({ error: "Valid subtopic id is required" }, { status: 400 })
    await connectDB()
    const definitionModel = (await import("@/models/Definition")).default
    await definitionModel.deleteMany({ subtopicId: new ObjectId(param) })
    const doc = await Subtopic.findByIdAndDelete(param)
    if (!doc) return NextResponse.json({ error: "Subtopic not found" }, { status: 404 })
    return NextResponse.json({ ok: true, id: param })
  } catch (err) {
    console.error("DELETE /api/subtopics/[param] error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to delete subtopic" }, { status: 500 })
  }
}
