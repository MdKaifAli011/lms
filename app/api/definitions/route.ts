import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Subtopic from "@/models/Subtopic"
import Definition from "@/models/Definition"
import { slugify } from "@/lib/slugify"
import { isMongoId } from "@/lib/slugify"
import mongoose from "mongoose"

function toDefinitionJson(doc: Record<string, unknown>): Record<string, unknown> {
  const createdAt = doc.createdAt as Date | undefined
  const updatedAt = doc.updatedAt as Date | undefined
  return {
    id: (doc._id as { toString: () => string }).toString(),
    subtopicId: (doc.subtopicId as { toString: () => string })?.toString(),
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

/** GET /api/definitions – list definitions. Optional ?subtopic=slug or ?subtopicId=id to filter. Use ?contextapi=1 for minimal. */
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const contextapi = searchParams.get("contextapi") === "1" || searchParams.get("contextapi") === "true"
    const subtopicSlug = searchParams.get("subtopic")?.toLowerCase()
    const subtopicIdParam = searchParams.get("subtopicId")

    let filter: Record<string, unknown> = {}
    if (subtopicIdParam && isMongoId(subtopicIdParam)) {
      filter = { subtopicId: new mongoose.Types.ObjectId(subtopicIdParam) }
    } else if (subtopicSlug) {
      const subtopic = await Subtopic.findOne({ slug: subtopicSlug }).select("_id").lean()
      if (subtopic) filter = { subtopicId: (subtopic as { _id: unknown })._id }
    }

    const query = Definition.find(filter).sort({ subtopicId: 1, orderNumber: 1 })
    const definitions = await (contextapi ? query.select("name slug status orderNumber subtopicId") : query).lean()

    if (contextapi) {
      type MinimalDoc = { _id: { toString(): string }; subtopicId: { toString(): string }; name?: string; slug?: string; status?: string; orderNumber?: number }
      const list = (definitions as MinimalDoc[]).map((doc) => ({
        id: doc._id.toString(),
        subtopicId: doc.subtopicId.toString(),
        name: doc.name ?? "",
        slug: doc.slug ?? "",
        status: doc.status ?? "Active",
        order: doc.orderNumber ?? 0,
      }))
      return NextResponse.json(list)
    }

    const list = definitions.map((doc) => toDefinitionJson(doc as Record<string, unknown>))
    return NextResponse.json(list)
  } catch (err) {
    console.error("GET /api/definitions error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch definitions" },
      { status: 500 }
    )
  }
}

/** POST /api/definitions – create definition. Duplicate (same subtopic + same slug) not allowed. */
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const name = (body.name ?? "").trim()
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    let subtopicId: mongoose.Types.ObjectId
    if (body.subtopicId && isMongoId(String(body.subtopicId))) {
      subtopicId = new mongoose.Types.ObjectId(body.subtopicId)
    } else if (body.subtopic && typeof body.subtopic === "string") {
      const subtopic = await Subtopic.findOne({ slug: body.subtopic.toLowerCase() }).select("_id").lean()
      if (!subtopic) {
        return NextResponse.json({ error: "Subtopic not found" }, { status: 404 })
      }
      subtopicId = (subtopic as { _id: mongoose.Types.ObjectId })._id
    } else {
      return NextResponse.json({ error: "subtopicId or subtopic (slug) is required" }, { status: 400 })
    }

    const baseSlug = slugify(name) || "definition"
    const existing = await Definition.findOne({ subtopicId, slug: baseSlug }).lean()
    if (existing) {
      return NextResponse.json(
        {
          error: "A definition with this name already exists in this subtopic",
          code: "DUPLICATE_DEFINITION",
          existingSlug: (existing as { slug?: string }).slug,
        },
        { status: 409 }
      )
    }

    const maxOrder = await Definition.findOne({ subtopicId }).sort({ orderNumber: -1 }).select("orderNumber").lean()
    const orderNumber = ((maxOrder as { orderNumber?: number } | null)?.orderNumber ?? 0) + 1

    const doc = await Definition.create({
      subtopicId,
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

    return NextResponse.json(toDefinitionJson(doc.toObject() as Record<string, unknown>))
  } catch (err) {
    console.error("POST /api/definitions error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create definition" },
      { status: 500 }
    )
  }
}
