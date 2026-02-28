import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Definition from "@/models/Definition"
import { isMongoId } from "@/lib/slugify"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ param: string }> }) {
  try {
    const { param } = await params
    if (!param || !isMongoId(param)) return NextResponse.json({ error: "Valid definition id is required" }, { status: 400 })
    await connectDB()
    const doc = await Definition.findById(param).select("slug subtopicId seo").lean()
    if (!doc) return NextResponse.json({ error: "Definition not found" }, { status: 404 })
    const seo = (doc as { seo?: Record<string, unknown> }).seo ?? {}
    return NextResponse.json({
      id: (doc as { _id?: { toString: () => string } })._id?.toString(),
      subtopicId: (doc as { subtopicId?: { toString: () => string } }).subtopicId?.toString(),
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
    console.error("GET /api/definitions/[param]/meta error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to fetch meta" }, { status: 500 })
  }
}
