import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Exam from "@/models/Exam"
import Subject from "@/models/Subject"
import { slugify } from "@/lib/slugify"
import { isMongoId } from "@/lib/slugify"
import mongoose from "mongoose"

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

/** GET /api/subjects – list subjects. Optional ?exam=slug or ?examId=id to filter. Use ?contextapi=1 for minimal. */
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const contextapi = searchParams.get("contextapi") === "1" || searchParams.get("contextapi") === "true"
    const examSlug = searchParams.get("exam")?.toLowerCase()
    const examIdParam = searchParams.get("examId")

    let filter: Record<string, unknown> = {}
    if (examIdParam && isMongoId(examIdParam)) {
      filter = { examId: new mongoose.Types.ObjectId(examIdParam) }
    } else if (examSlug) {
      const exam = await Exam.findOne({ slug: examSlug }).select("_id").lean()
      if (exam) filter = { examId: (exam as { _id: unknown })._id }
    }

    const query = Subject.find(filter).sort({ examId: 1, orderNumber: 1 })
    const subjects = await (contextapi ? query.select("name slug status orderNumber examId") : query).lean()

    if (contextapi) {
      type MinimalDoc = { _id: { toString(): string }; examId: { toString(): string }; name?: string; slug?: string; status?: string; orderNumber?: number }
      const list = (subjects as MinimalDoc[]).map((doc) => ({
        id: doc._id.toString(),
        examId: doc.examId.toString(),
        name: doc.name ?? "",
        slug: doc.slug ?? "",
        status: doc.status ?? "Active",
        order: doc.orderNumber ?? 0,
      }))
      return NextResponse.json(list)
    }

    const list = subjects.map((doc) => toSubjectJson(doc as Record<string, unknown>))
    return NextResponse.json(list)
  } catch (err) {
    console.error("GET /api/subjects error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch subjects" },
      { status: 500 }
    )
  }
}

/** POST /api/subjects – create subject. Duplicate (same exam + same slug) not allowed. */
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const name = (body.name ?? "").trim()
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    let examId: mongoose.Types.ObjectId
    if (body.examId && isMongoId(String(body.examId))) {
      examId = new mongoose.Types.ObjectId(body.examId)
    } else if (body.exam && typeof body.exam === "string") {
      const exam = await Exam.findOne({ slug: body.exam.toLowerCase() }).select("_id").lean()
      if (!exam) {
        return NextResponse.json({ error: "Exam not found" }, { status: 404 })
      }
      examId = (exam as { _id: mongoose.Types.ObjectId })._id
    } else {
      return NextResponse.json({ error: "examId or exam (slug) is required" }, { status: 400 })
    }

    const baseSlug = slugify(name) || "subject"
    const existing = await Subject.findOne({ examId, slug: baseSlug }).lean()
    if (existing) {
      return NextResponse.json(
        {
          error: "A subject with this name already exists in this exam",
          code: "DUPLICATE_SUBJECT",
          existingSlug: (existing as { slug?: string }).slug,
        },
        { status: 409 }
      )
    }

    const maxOrder = await Subject.findOne({ examId }).sort({ orderNumber: -1 }).select("orderNumber").lean()
    const orderNumber = ((maxOrder as { orderNumber?: number } | null)?.orderNumber ?? 0) + 1

    const doc = await Subject.create({
      examId,
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

    return NextResponse.json(toSubjectJson(doc.toObject() as Record<string, unknown>))
  } catch (err) {
    console.error("POST /api/subjects error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create subject" },
      { status: 500 }
    )
  }
}
