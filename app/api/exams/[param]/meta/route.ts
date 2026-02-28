import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Exam from "@/models/Exam"
import { isMongoId } from "@/lib/slugify"

/** GET /api/exams/[param]/meta – fetch only meta/SEO (title, description, keywords, og, etc.) by slug or id */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    const { param } = await params
    if (!param) {
      return NextResponse.json({ error: "Missing slug or id" }, { status: 400 })
    }
    await connectDB()
    const doc = isMongoId(param)
      ? await Exam.findById(param).select("slug seo").lean()
      : await Exam.findOne({ slug: param.toLowerCase() }).select("slug seo").lean()

    if (!doc) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    const seo = (doc as { seo?: Record<string, unknown> }).seo ?? {}
    const meta = {
      id: (doc as { _id?: { toString: () => string } })._id?.toString(),
      slug: (doc as { slug?: string }).slug,
      metaTitle: (seo.metaTitle as string) ?? "",
      metaDescription: (seo.metaDescription as string) ?? "",
      metaKeywords: (seo.metaKeywords as string) ?? "",
      ogTitle: (seo.ogTitle as string) ?? "",
      ogDescription: (seo.ogDescription as string) ?? "",
      ogImageUrl: (seo.ogImageUrl as string) ?? "",
      canonicalUrl: (seo.canonicalUrl as string) ?? "",
      noIndex: (seo.noIndex as boolean) ?? false,
      noFollow: (seo.noFollow as boolean) ?? false,
    }

    return NextResponse.json(meta)
  } catch (err) {
    console.error("GET /api/exams/[param]/meta error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch meta" },
      { status: 500 }
    )
  }
}
