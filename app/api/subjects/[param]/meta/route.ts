import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Subject from "@/models/Subject"
import { isMongoId } from "@/lib/slugify"

/** GET /api/subjects/[param]/meta - fetch only meta/SEO by subject id */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    const { param } = await params
    if (!param || !isMongoId(param)) {
      return NextResponse.json({ error: "Valid subject id is required" }, { status: 400 })
    }
    await connectDB()
    const doc = await Subject.findById(param).select("slug examId seo").lean()
    if (!doc) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 })
    }
    const seo = (doc as { seo?: Record<string, unknown> }).seo ?? {}
    const meta = {
      id: (doc as { _id?: { toString: () => string } })._id?.toString(),
      examId: (doc as { examId?: { toString: () => string } }).examId?.toString(),
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
    console.error("GET /api/subjects/[param]/meta error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch meta" },
      { status: 500 }
    )
  }
}
