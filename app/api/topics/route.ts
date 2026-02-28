import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Chapter from "@/models/Chapter"
import Topic from "@/models/Topic"
import { slugify } from "@/lib/slugify"
import { isMongoId } from "@/lib/slugify"
import mongoose from "mongoose"

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

/** GET /api/topics – list topics. Optional ?chapter=slug or ?chapterId=id to filter. Use ?contextapi=1 for minimal. */
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const contextapi = searchParams.get("contextapi") === "1" || searchParams.get("contextapi") === "true"
    const chapterSlug = searchParams.get("chapter")?.toLowerCase()
    const chapterIdParam = searchParams.get("chapterId")

    let filter: Record<string, unknown> = {}
    if (chapterIdParam && isMongoId(chapterIdParam)) {
      filter = { chapterId: new mongoose.Types.ObjectId(chapterIdParam) }
    } else if (chapterSlug) {
      const chapter = await Chapter.findOne({ slug: chapterSlug }).select("_id").lean()
      if (chapter) filter = { chapterId: (chapter as { _id: unknown })._id }
    }

    const query = Topic.find(filter).sort({ chapterId: 1, orderNumber: 1 })
    const topics = await (contextapi ? query.select("name slug status orderNumber chapterId") : query).lean()

    if (contextapi) {
      type MinimalDoc = { _id: { toString(): string }; chapterId: { toString(): string }; name?: string; slug?: string; status?: string; orderNumber?: number }
      const list = (topics as MinimalDoc[]).map((doc) => ({
        id: doc._id.toString(),
        chapterId: doc.chapterId.toString(),
        name: doc.name ?? "",
        slug: doc.slug ?? "",
        status: doc.status ?? "Active",
        order: doc.orderNumber ?? 0,
      }))
      return NextResponse.json(list)
    }

    const list = topics.map((doc) => toTopicJson(doc as Record<string, unknown>))
    return NextResponse.json(list)
  } catch (err) {
    console.error("GET /api/topics error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch topics" },
      { status: 500 }
    )
  }
}

/** POST /api/topics – create topic. Duplicate (same chapter + same slug) not allowed. */
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const name = (body.name ?? "").trim()
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    let chapterId: mongoose.Types.ObjectId
    if (body.chapterId && isMongoId(String(body.chapterId))) {
      chapterId = new mongoose.Types.ObjectId(body.chapterId)
    } else if (body.chapter && typeof body.chapter === "string") {
      const chapter = await Chapter.findOne({ slug: body.chapter.toLowerCase() }).select("_id").lean()
      if (!chapter) {
        return NextResponse.json({ error: "Chapter not found" }, { status: 404 })
      }
      chapterId = (chapter as { _id: mongoose.Types.ObjectId })._id
    } else {
      return NextResponse.json({ error: "chapterId or chapter (slug) is required" }, { status: 400 })
    }

    const baseSlug = slugify(name) || "topic"
    const existing = await Topic.findOne({ chapterId, slug: baseSlug }).lean()
    if (existing) {
      return NextResponse.json(
        {
          error: "A topic with this name already exists in this chapter",
          code: "DUPLICATE_TOPIC",
          existingSlug: (existing as { slug?: string }).slug,
        },
        { status: 409 }
      )
    }

    const maxOrder = await Topic.findOne({ chapterId }).sort({ orderNumber: -1 }).select("orderNumber").lean()
    const orderNumber = ((maxOrder as { orderNumber?: number } | null)?.orderNumber ?? 0) + 1

    const doc = await Topic.create({
      chapterId,
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

    return NextResponse.json(toTopicJson(doc.toObject() as Record<string, unknown>))
  } catch (err) {
    console.error("POST /api/topics error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create topic" },
      { status: 500 }
    )
  }
}
