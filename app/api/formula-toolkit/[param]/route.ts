import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import FormulaToolkit from "@/models/FormulaToolkit";
import { slugify } from "@/lib/slugify";
import mongoose from "mongoose";

const LEVEL_NAMES: Record<number, string> = {
  1: "Exam",
  2: "Subject",
  3: "Unit",
  4: "Chapter",
  5: "Topic",
  6: "Subtopic",
  7: "Definition",
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function mapDoc(doc: Record<string, unknown>) {
  return {
    id: (doc._id as { toString: () => string }).toString(),
    examId: (doc.examId as { _id?: { toString: () => string }; name?: string; slug?: string })?._id?.toString() ?? doc.examId,
    examName: (doc.examId as { name?: string })?.name ?? "",
    examSlug: (doc.examId as { slug?: string })?.slug ?? "",
    level: doc.level,
    levelName: LEVEL_NAMES[doc.level as number] ?? "Unknown",
    subjectId: (doc.subjectId as { _id?: { toString: () => string }; name?: string })?._id?.toString() ?? doc.subjectId ?? null,
    subjectName: (doc.subjectId as { name?: string })?.name ?? (doc.subjectLabel as string) ?? null,
    unitId: (doc.unitId as { _id?: { toString: () => string }; name?: string })?._id?.toString() ?? doc.unitId ?? null,
    unitName: (doc.unitId as { name?: string })?.name ?? null,
    chapterId: (doc.chapterId as { _id?: { toString: () => string }; name?: string })?._id?.toString() ?? doc.chapterId ?? null,
    chapterName: (doc.chapterId as { name?: string })?.name ?? null,
    topicId: (doc.topicId as { _id?: { toString: () => string }; name?: string })?._id?.toString() ?? doc.topicId ?? null,
    topicName: (doc.topicId as { name?: string })?.name ?? null,
    subtopicId: (doc.subtopicId as { _id?: { toString: () => string }; name?: string })?._id?.toString() ?? doc.subtopicId ?? null,
    subtopicName: (doc.subtopicId as { name?: string })?.name ?? null,
    definitionId: (doc.definitionId as { _id?: { toString: () => string }; name?: string })?._id?.toString() ?? doc.definitionId ?? null,
    definitionName: (doc.definitionId as { name?: string })?.name ?? null,
    title: doc.title,
    slug: doc.slug,
    description: doc.description ?? "",
    fileUrl: doc.fileUrl ?? "",
    pages: doc.pages ?? 0,
    size: doc.size ?? "",
    subjectLabel: doc.subjectLabel ?? "",
    orderNumber: doc.orderNumber ?? 1,
    status: doc.status ?? "Active",
  };
}

/** GET /api/formula-toolkit/[param] */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    await connectDB();
    const { param } = await params;
    const isId = mongoose.Types.ObjectId.isValid(param);
    const query = isId ? { _id: param } : { slug: param };

    const doc = await FormulaToolkit.findOne(query)
      .populate("examId", "name slug")
      .populate("subjectId", "name slug")
      .populate("unitId", "name slug")
      .populate("chapterId", "name slug")
      .populate("topicId", "name slug")
      .populate("subtopicId", "name slug")
      .populate("definitionId", "name slug")
      .lean();

    if (!doc) {
      return NextResponse.json({ error: "Formula toolkit not found" }, { status: 404, headers: corsHeaders });
    }
    return NextResponse.json(mapDoc(doc as Record<string, unknown>), { headers: corsHeaders });
  } catch (err) {
    console.error("GET /api/formula-toolkit/[param] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch formula toolkit" },
      { status: 500, headers: corsHeaders }
    );
  }
}

/** PUT /api/formula-toolkit/[param] */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    await connectDB();
    const { param } = await params;
    const body = await request.json();
    const isId = mongoose.Types.ObjectId.isValid(param);
    const query = isId ? { _id: param } : { slug: param };

    const existing = await FormulaToolkit.findOne(query).lean();
    if (!existing) {
      return NextResponse.json({ error: "Formula toolkit not found" }, { status: 404, headers: corsHeaders });
    }

    const update: Record<string, unknown> = {};
    if (body.title !== undefined) {
      const title = body.title.trim();
      if (!title) return NextResponse.json({ error: "Title cannot be empty" }, { status: 400, headers: corsHeaders });
      update.title = title;
      const currentTitle = (existing as { title?: string }).title;
      if (title !== currentTitle) {
        const baseSlug = slugify(title);
        const examId = (existing as { examId: mongoose.Types.ObjectId }).examId;
        let slug = baseSlug;
        let c = 1;
        const id = (existing as { _id: mongoose.Types.ObjectId })._id;
        while (await FormulaToolkit.findOne({ examId, slug, _id: { $ne: id } }).lean()) {
          slug = `${baseSlug}-${c}`;
          c++;
        }
        update.slug = slug;
      }
    }
    if (body.description !== undefined) update.description = body.description.trim();
    if (body.fileUrl !== undefined) update.fileUrl = body.fileUrl.trim();
    if (body.pages !== undefined) update.pages = parseInt(body.pages, 10) || 0;
    if (body.size !== undefined) update.size = body.size.trim();
    if (body.subjectLabel !== undefined) update.subjectLabel = body.subjectLabel.trim();
    if (body.status !== undefined) update.status = body.status === "Inactive" ? "Inactive" : "Active";

    const level = body.level !== undefined ? parseInt(body.level, 10) : (existing as { level?: number }).level;
    if (body.level !== undefined) {
      if (level < 1 || level > 7) {
        return NextResponse.json({ error: "Level must be between 1 and 7" }, { status: 400, headers: corsHeaders });
      }
      update.level = level;
    }

    if (level >= 2 && body.subjectId !== undefined) {
      update.subjectId = body.subjectId && mongoose.Types.ObjectId.isValid(body.subjectId) ? new mongoose.Types.ObjectId(body.subjectId) : null;
    }
    if (level >= 3 && body.unitId !== undefined) {
      update.unitId = body.unitId && mongoose.Types.ObjectId.isValid(body.unitId) ? new mongoose.Types.ObjectId(body.unitId) : null;
    }
    if (level >= 4 && body.chapterId !== undefined) {
      update.chapterId = body.chapterId && mongoose.Types.ObjectId.isValid(body.chapterId) ? new mongoose.Types.ObjectId(body.chapterId) : null;
    }
    if (level >= 5 && body.topicId !== undefined) {
      update.topicId = body.topicId && mongoose.Types.ObjectId.isValid(body.topicId) ? new mongoose.Types.ObjectId(body.topicId) : null;
    }
    if (level >= 6 && body.subtopicId !== undefined) {
      update.subtopicId = body.subtopicId && mongoose.Types.ObjectId.isValid(body.subtopicId) ? new mongoose.Types.ObjectId(body.subtopicId) : null;
    }
    if (level >= 7 && body.definitionId !== undefined) {
      update.definitionId = body.definitionId && mongoose.Types.ObjectId.isValid(body.definitionId) ? new mongoose.Types.ObjectId(body.definitionId) : null;
    }

    update.updatedAt = new Date();

    const doc = await FormulaToolkit.findOneAndUpdate(query, { $set: update }, { new: true })
      .populate("examId", "name slug")
      .populate("subjectId", "name slug")
      .populate("unitId", "name slug")
      .populate("chapterId", "name slug")
      .populate("topicId", "name slug")
      .populate("subtopicId", "name slug")
      .populate("definitionId", "name slug")
      .lean();

    if (!doc) {
      return NextResponse.json({ error: "Formula toolkit not found" }, { status: 404, headers: corsHeaders });
    }
    return NextResponse.json(mapDoc(doc as Record<string, unknown>), { headers: corsHeaders });
  } catch (err) {
    console.error("PUT /api/formula-toolkit/[param] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update formula toolkit" },
      { status: 500, headers: corsHeaders }
    );
  }
}

/** DELETE /api/formula-toolkit/[param] */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    await connectDB();
    const { param } = await params;
    const isId = mongoose.Types.ObjectId.isValid(param);
    const query = isId ? { _id: param } : { slug: param };
    const doc = await FormulaToolkit.findOneAndDelete(query).lean();
    if (!doc) {
      return NextResponse.json({ error: "Formula toolkit not found" }, { status: 404, headers: corsHeaders });
    }
    return NextResponse.json({
      message: "Formula toolkit deleted successfully",
      id: (doc._id as { toString: () => string }).toString(),
    }, { headers: corsHeaders });
  } catch (err) {
    console.error("DELETE /api/formula-toolkit/[param] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete formula toolkit" },
      { status: 500, headers: corsHeaders }
    );
  }
}
