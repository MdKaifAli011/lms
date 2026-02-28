import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Topic from "@/models/Topic"
import { isMongoId } from "@/lib/slugify"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ param: string }> }) {
  try {
    const { param } = await params
    if (!param || !isMongoId(param)) return NextResponse.json({ error: "Valid topic id is required" }, { status: 400 })
    await connectDB()
    const doc = await Topic.findById(param).select("slug chapterId seo").lean()
    if (!doc) return NextResponse.json({ error: "Topic not found" }, { status: 404 })
    const seo = (doc as { seo?: Record<string, unknown> }).seo ?? {}
    return NextResponse.json({
      id: (doc as { _id?: { toString: () => string } })._id?.toString(),
      chapterId: (doc as { chapterId?: { toString: () => string } }).chapterId?.toString(),
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
    })
  } catch (err) {
    console.error("GET /api/topics/[param]/meta error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to fetch meta" }, { status: 500 })
  }
}
