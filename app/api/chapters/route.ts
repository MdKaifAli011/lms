import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Unit from "@/models/Unit"
import Chapter from "@/models/Chapter"
import { slugify } from "@/lib/slugify"
import { isMongoId } from "@/lib/slugify"
import mongoose from "mongoose"

function toChapterJson(doc: Record<string, unknown>): Record<string, unknown> {
  const createdAt = doc.createdAt as Date | undefined
  const updatedAt = doc.updatedAt as Date | undefined
  return {
    id: (doc._id as { toString: () => string }).toString(),
    unitId: (doc.unitId as { toString: () => string })?.toString(),
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

/** GET /api/chapters – list chapters. Optional ?unit=slug or ?unitId=id to filter. Use ?contextapi=1 for minimal. */
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const contextapi = searchParams.get("contextapi") === "1" || searchParams.get("contextapi") === "true"
    const unitSlug = searchParams.get("unit")?.toLowerCase()
    const unitIdParam = searchParams.get("unitId")

    let filter: Record<string, unknown> = {}
    if (unitIdParam && isMongoId(unitIdParam)) {
      filter = { unitId: new mongoose.Types.ObjectId(unitIdParam) }
    } else if (unitSlug) {
      const unit = await Unit.findOne({ slug: unitSlug }).select("_id").lean()
      if (unit) filter = { unitId: (unit as { _id: unknown })._id }
    }

    const query = Chapter.find(filter).sort({ unitId: 1, orderNumber: 1 })
    const chapters = await (contextapi ? query.select("name slug status orderNumber unitId") : query).lean()

    if (contextapi) {
      type MinimalDoc = { _id: { toString(): string }; unitId: { toString(): string }; name?: string; slug?: string; status?: string; orderNumber?: number }
      const list = (chapters as MinimalDoc[]).map((doc) => ({
        id: doc._id.toString(),
        unitId: doc.unitId.toString(),
        name: doc.name ?? "",
        slug: doc.slug ?? "",
        status: doc.status ?? "Active",
        order: doc.orderNumber ?? 0,
      }))
      return NextResponse.json(list)
    }

    const list = chapters.map((doc) => toChapterJson(doc as Record<string, unknown>))
    return NextResponse.json(list)
  } catch (err) {
    console.error("GET /api/chapters error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch chapters" },
      { status: 500 }
    )
  }
}

/** POST /api/chapters – create chapter. Duplicate (same unit + same slug) not allowed. */
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const name = (body.name ?? "").trim()
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    let unitId: mongoose.Types.ObjectId
    if (body.unitId && isMongoId(String(body.unitId))) {
      unitId = new mongoose.Types.ObjectId(body.unitId)
    } else if (body.unit && typeof body.unit === "string") {
      const unit = await Unit.findOne({ slug: body.unit.toLowerCase() }).select("_id").lean()
      if (!unit) {
        return NextResponse.json({ error: "Unit not found" }, { status: 404 })
      }
      unitId = (unit as { _id: mongoose.Types.ObjectId })._id
    } else {
      return NextResponse.json({ error: "unitId or unit (slug) is required" }, { status: 400 })
    }

    const baseSlug = slugify(name) || "chapter"
    const existing = await Chapter.findOne({ unitId, slug: baseSlug }).lean()
    if (existing) {
      return NextResponse.json(
        {
          error: "A chapter with this name already exists in this unit",
          code: "DUPLICATE_CHAPTER",
          existingSlug: (existing as { slug?: string }).slug,
        },
        { status: 409 }
      )
    }

    const maxOrder = await Chapter.findOne({ unitId }).sort({ orderNumber: -1 }).select("orderNumber").lean()
    const orderNumber = ((maxOrder as { orderNumber?: number } | null)?.orderNumber ?? 0) + 1

    const doc = await Chapter.create({
      unitId,
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

    return NextResponse.json(toChapterJson(doc.toObject() as Record<string, unknown>))
  } catch (err) {
    console.error("POST /api/chapters error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create chapter" },
      { status: 500 }
    )
  }
}
