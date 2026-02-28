import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Topic from "@/models/Topic"
import { slugify } from "@/lib/slugify"
import { isMongoId } from "@/lib/slugify"
import mongoose from "mongoose"

const ObjectId = mongoose.Types.ObjectId

function toTopicJson(doc: Record<string, unknown>): Record<string, unknown> {
  const createdAt = doc.createdAt as Date | undefined
  const updatedAt = doc.updatedAt as Date | undefined
  return {
    id: (doc._id as { toString: () => string }).toString(),
    chapterId: (doc.chapterId as { toString: () => string })?.toString(),
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
    if (!param || !isMongoId(param)) return NextResponse.json({ error: "Valid topic id is required" }, { status: 400 })
    await connectDB()
    const doc = await Topic.findById(param).lean()
    if (!doc) return NextResponse.json({ error: "Topic not found" }, { status: 404 })
    return NextResponse.json(toTopicJson(doc as Record<string, unknown>))
  } catch (err) {
    console.error("GET /api/topics/[param] error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to fetch topic" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ param: string }> }) {
  try {
    const { param } = await params
    if (!param || !isMongoId(param)) return NextResponse.json({ error: "Valid topic id is required" }, { status: 400 })
    await connectDB()
    const body = await request.json()
    const existing = await Topic.findById(param).lean() as { name?: string; slug?: string; chapterId?: unknown } | null
    if (!existing) return NextResponse.json({ error: "Topic not found" }, { status: 404 })
    const name = (body.name ?? existing.name).trim()
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 })
    const chapterId = body.chapterId ?? existing.chapterId
    if (!chapterId) return NextResponse.json({ error: "chapterId is required" }, { status: 400 })
    const chapterObjId = typeof chapterId === "string" ? new ObjectId(chapterId) : chapterId
    let slug = existing.slug ?? ""
    if (name !== existing.name) {
      const baseSlug = slugify(name) || "topic"
      const duplicate = await Topic.findOne({ chapterId: chapterObjId, slug: baseSlug, _id: { $ne: param } }).lean()
      if (duplicate) return NextResponse.json({ error: "A topic with this name already exists in this chapter", code: "DUPLICATE_TOPIC" }, { status: 409 })
      slug = baseSlug
    }
    const lastModified = new Date().toLocaleString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })
    const update: Record<string, unknown> = { name, slug, chapterId: chapterObjId, lastModified, updatedAt: new Date() }
    if (body.status !== undefined) update.status = body.status === "Inactive" ? "Inactive" : "Active"
    if (Array.isArray(body.descriptions)) update.descriptions = body.descriptions.filter((d: string) => String(d).trim() !== "")
    if (typeof body.orderNumber === "number") update.orderNumber = body.orderNumber
    if (body.image !== undefined) update.image = body.image?.trim() || "No Image"
    if (body.contentBody !== undefined) update.contentBody = body.contentBody
    if (body.seo !== undefined && typeof body.seo === "object") update.seo = { ...body.seo }
    await Topic.collection.updateOne({ _id: new ObjectId(param) }, { $set: update })
    const updated = await Topic.findById(param).lean()
    if (!updated) return NextResponse.json({ error: "Topic not found" }, { status: 404 })
    return NextResponse.json(toTopicJson(updated as Record<string, unknown>))
  } catch (err) {
    console.error("PUT /api/topics/[param] error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to update topic" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ param: string }> }) {
  try {
    const { param } = await params
    if (!param || !isMongoId(param)) return NextResponse.json({ error: "Valid topic id is required" }, { status: 400 })
    await connectDB()
    const subtopicModel = (await import("@/models/Subtopic")).default
    await subtopicModel.deleteMany({ topicId: new ObjectId(param) })
    const doc = await Topic.findByIdAndDelete(param)
    if (!doc) return NextResponse.json({ error: "Topic not found" }, { status: 404 })
    return NextResponse.json({ ok: true, id: param })
  } catch (err) {
    console.error("DELETE /api/topics/[param] error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to delete topic" }, { status: 500 })
  }
}
