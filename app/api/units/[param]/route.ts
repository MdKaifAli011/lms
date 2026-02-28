import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Unit from "@/models/Unit"
import { slugify } from "@/lib/slugify"
import { isMongoId } from "@/lib/slugify"
import mongoose from "mongoose"

const ObjectId = mongoose.Types.ObjectId

function toUnitJson(doc: Record<string, unknown>): Record<string, unknown> {
  const createdAt = doc.createdAt as Date | undefined
  const updatedAt = doc.updatedAt as Date | undefined
  return {
    id: (doc._id as { toString: () => string }).toString(),
    subjectId: (doc.subjectId as { toString: () => string })?.toString(),
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
    if (!param || !isMongoId(param)) return NextResponse.json({ error: "Valid unit id is required" }, { status: 400 })
    await connectDB()
    const doc = await Unit.findById(param).lean()
    if (!doc) return NextResponse.json({ error: "Unit not found" }, { status: 404 })
    return NextResponse.json(toUnitJson(doc as Record<string, unknown>))
  } catch (err) {
    console.error("GET /api/units/[param] error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to fetch unit" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ param: string }> }) {
  try {
    const { param } = await params
    if (!param || !isMongoId(param)) return NextResponse.json({ error: "Valid unit id is required" }, { status: 400 })
    await connectDB()
    const body = await request.json()
    const existing = await Unit.findById(param).lean() as { name?: string; slug?: string; subjectId?: unknown } | null
    if (!existing) return NextResponse.json({ error: "Unit not found" }, { status: 404 })
    const name = (body.name ?? existing.name).trim()
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 })
    const subjectId = body.subjectId ?? existing.subjectId
    if (!subjectId) return NextResponse.json({ error: "subjectId is required" }, { status: 400 })
    const subjectObjId = typeof subjectId === "string" ? new ObjectId(subjectId) : subjectId
    let slug = existing.slug ?? ""
    if (name !== existing.name) {
      const baseSlug = slugify(name) || "unit"
      const duplicate = await Unit.findOne({ subjectId: subjectObjId, slug: baseSlug, _id: { $ne: param } }).lean()
      if (duplicate) return NextResponse.json({ error: "A unit with this name already exists in this subject", code: "DUPLICATE_UNIT" }, { status: 409 })
      slug = baseSlug
    }
    const lastModified = new Date().toLocaleString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })
    const update: Record<string, unknown> = { name, slug, subjectId: subjectObjId, lastModified, updatedAt: new Date() }
    if (body.status !== undefined) update.status = body.status === "Inactive" ? "Inactive" : "Active"
    if (Array.isArray(body.descriptions)) update.descriptions = body.descriptions.filter((d: string) => String(d).trim() !== "")
    if (typeof body.orderNumber === "number") update.orderNumber = body.orderNumber
    if (body.image !== undefined) update.image = body.image?.trim() || "No Image"
    if (body.contentBody !== undefined) update.contentBody = body.contentBody
    if (body.seo !== undefined && typeof body.seo === "object") update.seo = { ...body.seo }
    await Unit.collection.updateOne({ _id: new ObjectId(param) }, { $set: update })
    const updated = await Unit.findById(param).lean()
    if (!updated) return NextResponse.json({ error: "Unit not found" }, { status: 404 })
    return NextResponse.json(toUnitJson(updated as Record<string, unknown>))
  } catch (err) {
    console.error("PUT /api/units/[param] error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to update unit" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ param: string }> }) {
  try {
    const { param } = await params
    if (!param || !isMongoId(param)) return NextResponse.json({ error: "Valid unit id is required" }, { status: 400 })
    await connectDB()
    const Chapter = (await import("@/models/Chapter")).default
    await Chapter.deleteMany({ unitId: new ObjectId(param) })
    const doc = await Unit.findByIdAndDelete(param)
    if (!doc) return NextResponse.json({ error: "Unit not found" }, { status: 404 })
    return NextResponse.json({ ok: true, id: param })
  } catch (err) {
    console.error("DELETE /api/units/[param] error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to delete unit" }, { status: 500 })
  }
}
