import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Subject from "@/models/Subject"
import Unit from "@/models/Unit"
import { slugify } from "@/lib/slugify"
import { isMongoId } from "@/lib/slugify"
import mongoose from "mongoose"

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

/** GET /api/units – list units. Optional ?subject=slug or ?subjectId=id to filter. Use ?contextapi=1 for minimal. */
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const contextapi = searchParams.get("contextapi") === "1" || searchParams.get("contextapi") === "true"
    const subjectSlug = searchParams.get("subject")?.toLowerCase()
    const subjectIdParam = searchParams.get("subjectId")

    let filter: Record<string, unknown> = {}
    if (subjectIdParam && isMongoId(subjectIdParam)) {
      filter = { subjectId: new mongoose.Types.ObjectId(subjectIdParam) }
    } else if (subjectSlug) {
      const subject = await Subject.findOne({ slug: subjectSlug }).select("_id").lean()
      if (subject) filter = { subjectId: (subject as { _id: unknown })._id }
    }

    const query = Unit.find(filter).sort({ subjectId: 1, orderNumber: 1 })
    const units = await (contextapi ? query.select("name slug status orderNumber subjectId") : query).lean()

    if (contextapi) {
      type MinimalDoc = { _id: { toString(): string }; subjectId: { toString(): string }; name?: string; slug?: string; status?: string; orderNumber?: number }
      const list = (units as MinimalDoc[]).map((doc) => ({
        id: doc._id.toString(),
        subjectId: doc.subjectId.toString(),
        name: doc.name ?? "",
        slug: doc.slug ?? "",
        status: doc.status ?? "Active",
        order: doc.orderNumber ?? 0,
      }))
      return NextResponse.json(list)
    }

    const list = units.map((doc) => toUnitJson(doc as Record<string, unknown>))
    return NextResponse.json(list)
  } catch (err) {
    console.error("GET /api/units error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch units" },
      { status: 500 }
    )
  }
}

/** POST /api/units – create unit. Duplicate (same subject + same slug) not allowed. */
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const name = (body.name ?? "").trim()
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    let subjectId: mongoose.Types.ObjectId
    if (body.subjectId && isMongoId(String(body.subjectId))) {
      subjectId = new mongoose.Types.ObjectId(body.subjectId)
    } else if (body.subject && typeof body.subject === "string") {
      const subject = await Subject.findOne({ slug: body.subject.toLowerCase() }).select("_id").lean()
      if (!subject) {
        return NextResponse.json({ error: "Subject not found" }, { status: 404 })
      }
      subjectId = (subject as { _id: mongoose.Types.ObjectId })._id
    } else {
      return NextResponse.json({ error: "subjectId or subject (slug) is required" }, { status: 400 })
    }

    const baseSlug = slugify(name) || "unit"
    const existing = await Unit.findOne({ subjectId, slug: baseSlug }).lean()
    if (existing) {
      return NextResponse.json(
        {
          error: "A unit with this name already exists in this subject",
          code: "DUPLICATE_UNIT",
          existingSlug: (existing as { slug?: string }).slug,
        },
        { status: 409 }
      )
    }

    const maxOrder = await Unit.findOne({ subjectId }).sort({ orderNumber: -1 }).select("orderNumber").lean()
    const orderNumber = ((maxOrder as { orderNumber?: number } | null)?.orderNumber ?? 0) + 1

    const doc = await Unit.create({
      subjectId,
      name,
      slug: baseSlug,
      status: body.status === "Inactive" ? "Inactive" : "Active",
      image: body.image?.trim() ? body.image.trim() : "No Image",
      content: "-",
      meta: "-",
      visits: 0,
      uniqueVisits: 0,
      today: 0,
      descriptions: Array.isArray(body.descriptions) ? body.descriptions.filter((d: string) => String(d).trim() !== "") : [],
      orderNumber,
    })

    return NextResponse.json(toUnitJson(doc.toObject() as Record<string, unknown>))
  } catch (err) {
    console.error("POST /api/units error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create unit" },
      { status: 500 }
    )
  }
}
