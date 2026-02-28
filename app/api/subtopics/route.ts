import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Topic from "@/models/Topic"
import Subtopic from "@/models/Subtopic"
import { slugify } from "@/lib/slugify"
import { isMongoId } from "@/lib/slugify"
import mongoose from "mongoose"

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

/** GET /api/subtopics – list subtopics. Optional ?topic=slug or ?topicId=id to filter. Use ?contextapi=1 for minimal. */
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const contextapi = searchParams.get("contextapi") === "1" || searchParams.get("contextapi") === "true"
    const topicSlug = searchParams.get("topic")?.toLowerCase()
    const topicIdParam = searchParams.get("topicId")

    let filter: Record<string, unknown> = {}
    if (topicIdParam && isMongoId(topicIdParam)) {
      filter = { topicId: new mongoose.Types.ObjectId(topicIdParam) }
    } else if (topicSlug) {
      const topic = await Topic.findOne({ slug: topicSlug }).select("_id").lean()
      if (topic) filter = { topicId: (topic as { _id: unknown })._id }
    }

    const query = Subtopic.find(filter).sort({ topicId: 1, orderNumber: 1 })
    const subtopics = await (contextapi ? query.select("name slug status orderNumber topicId") : query).lean()

    if (contextapi) {
      type MinimalDoc = { _id: { toString(): string }; topicId: { toString(): string }; name?: string; slug?: string; status?: string; orderNumber?: number }
      const list = (subtopics as MinimalDoc[]).map((doc) => ({
        id: doc._id.toString(),
        topicId: doc.topicId.toString(),
        name: doc.name ?? "",
        slug: doc.slug ?? "",
        status: doc.status ?? "Active",
        order: doc.orderNumber ?? 0,
      }))
      return NextResponse.json(list)
    }

    const list = subtopics.map((doc) => toSubtopicJson(doc as Record<string, unknown>))
    return NextResponse.json(list)
  } catch (err) {
    console.error("GET /api/subtopics error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch subtopics" },
      { status: 500 }
    )
  }
}

/** POST /api/subtopics – create subtopic. Duplicate (same topic + same slug) not allowed. */
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const name = (body.name ?? "").trim()
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    let topicId: mongoose.Types.ObjectId
    if (body.topicId && isMongoId(String(body.topicId))) {
      topicId = new mongoose.Types.ObjectId(body.topicId)
    } else if (body.topic && typeof body.topic === "string") {
      const topic = await Topic.findOne({ slug: body.topic.toLowerCase() }).select("_id").lean()
      if (!topic) {
        return NextResponse.json({ error: "Topic not found" }, { status: 404 })
      }
      topicId = (topic as { _id: mongoose.Types.ObjectId })._id
    } else {
      return NextResponse.json({ error: "topicId or topic (slug) is required" }, { status: 400 })
    }

    const baseSlug = slugify(name) || "subtopic"
    const existing = await Subtopic.findOne({ topicId, slug: baseSlug }).lean()
    if (existing) {
      return NextResponse.json(
        {
          error: "A subtopic with this name already exists in this topic",
          code: "DUPLICATE_SUBTOPIC",
          existingSlug: (existing as { slug?: string }).slug,
        },
        { status: 409 }
      )
    }

    const maxOrder = await Subtopic.findOne({ topicId }).sort({ orderNumber: -1 }).select("orderNumber").lean()
    const orderNumber = ((maxOrder as { orderNumber?: number } | null)?.orderNumber ?? 0) + 1

    const doc = await Subtopic.create({
      topicId,
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

    return NextResponse.json(toSubtopicJson(doc.toObject() as Record<string, unknown>))
  } catch (err) {
    console.error("POST /api/subtopics error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create subtopic" },
      { status: 500 }
    )
  }
}
