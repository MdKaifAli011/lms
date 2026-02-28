import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Exam from "@/models/Exam"
import { slugify } from "@/lib/slugify"

/** GET /api/exams – list exams. Use ?contextapi=1 to get only id, name, slug, status, order (sorted by order). */
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const contextapi = searchParams.get("contextapi") === "1" || searchParams.get("contextapi") === "true"

    const query = Exam.find({}).sort({ orderNumber: 1 })
    const exams = await (contextapi ? query.select("name slug status orderNumber") : query).lean()

    if (contextapi) {
      type MinimalDoc = { _id: { toString(): string }; name?: string; slug?: string; status?: string; orderNumber?: number }
      const list = (exams as MinimalDoc[]).map((doc) => ({
        id: doc._id.toString(),
        name: doc.name ?? "",
        slug: doc.slug ?? "",
        status: doc.status ?? "Active",
        order: doc.orderNumber ?? 0,
      }))
      return NextResponse.json(list)
    }

    const list = exams.map((doc: Record<string, unknown>) => ({
      id: (doc._id as { toString: () => string }).toString(),
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
      lastModified: doc.lastModified ?? undefined,
      createdAt: doc.createdAt
        ? new Date(doc.createdAt as Date).toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : undefined,
    }))
    return NextResponse.json(list)
  } catch (err) {
    console.error("GET /api/exams error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch exams" },
      { status: 500 }
    )
  }
}

/** POST /api/exams – create a new exam. Rejects if an exam with the same name (slug) already exists (no duplicates). */
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const name = (body.name ?? "").trim()
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const baseSlug = slugify(name)
    if (!baseSlug) {
      return NextResponse.json({ error: "Valid exam name is required" }, { status: 400 })
    }

    const existing = await Exam.findOne({ slug: baseSlug }).lean()
    if (existing) {
      return NextResponse.json(
        {
          error: "An exam with this name already exists",
          code: "DUPLICATE_EXAM",
          existingSlug: (existing as { slug?: string }).slug,
          existingId: (existing as { _id?: unknown })._id?.toString(),
        },
        { status: 409 }
      )
    }

    const maxOrder = await Exam.findOne({}).sort({ orderNumber: -1 }).select("orderNumber").lean()
    const orderNumber = (maxOrder?.orderNumber ?? 0) + 1

    const doc = await Exam.create({
      name,
      slug: baseSlug,
      status: body.status === "Inactive" ? "Inactive" : "Active",
      image: (body.image ?? body.cardImageUrl)?.trim() ? (body.image ?? body.cardImageUrl).trim() : "No Image",
      items: 0,
      content: "-",
      meta: "-",
      visits: 0,
      uniqueVisits: 0,
      today: 0,
      descriptions: Array.isArray(body.descriptions) ? body.descriptions.filter((d: string) => String(d).trim() !== "") : [],
      orderNumber,
    })

    return NextResponse.json({
      id: doc._id.toString(),
      name: doc.name,
      slug: doc.slug,
      status: doc.status,
      image: doc.image,
      items: doc.items,
      content: doc.content,
      meta: doc.meta,
      visits: doc.visits,
      uniqueVisits: doc.uniqueVisits,
      today: doc.today,
      descriptions: doc.descriptions,
      orderNumber: doc.orderNumber,
      lastModified: doc.updatedAt
        ? new Date(doc.updatedAt).toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : undefined,
      createdAt: doc.createdAt
        ? new Date(doc.createdAt).toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : undefined,
    })
  } catch (err) {
    console.error("POST /api/exams error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create exam" },
      { status: 500 }
    )
  }
}
