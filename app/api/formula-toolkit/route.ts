import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import FormulaToolkit from "@/models/FormulaToolkit";
import "@/models/Exam";
import "@/models/Subject";
import "@/models/Unit";
import "@/models/Chapter";
import "@/models/Topic";
import "@/models/Subtopic";
import "@/models/Definition";
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

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

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

/** GET /api/formula-toolkit – list formula toolkits */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const examId = searchParams.get("examId");
    const level = searchParams.get("level");
    const status = searchParams.get("status");

    const query: Record<string, unknown> = {};
    if (examId) query.examId = examId;
    if (level) query.level = parseInt(level, 10);
    if (status) query.status = status;

    const list = await FormulaToolkit.find(query)
      .sort({ examId: 1, orderNumber: 1 })
      .populate("examId", "name slug")
      .populate("subjectId", "name slug")
      .populate("unitId", "name slug")
      .populate("chapterId", "name slug")
      .populate("topicId", "name slug")
      .populate("subtopicId", "name slug")
      .populate("definitionId", "name slug")
      .lean();

    const result = (list as Record<string, unknown>[]).map(mapDoc);
    return NextResponse.json(result, { headers: corsHeaders });
  } catch (err) {
    console.error("GET /api/formula-toolkit error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch formula toolkits" },
      { status: 500, headers: corsHeaders }
    );
  }
}

/** POST /api/formula-toolkit – create a formula toolkit */
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const title = (body.title ?? "").trim();
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400, headers: corsHeaders });
    }

    const examId = body.examId;
    if (!examId || !mongoose.Types.ObjectId.isValid(examId)) {
      return NextResponse.json({ error: "Valid Exam ID is required" }, { status: 400, headers: corsHeaders });
    }

    const level = parseInt(body.level ?? "1", 10);
    if (level < 1 || level > 7) {
      return NextResponse.json({ error: "Level must be between 1 and 7" }, { status: 400, headers: corsHeaders });
    }

    const baseSlug = slugify(title);
    let slug = baseSlug;
    let counter = 1;
    while (await FormulaToolkit.findOne({ examId, slug }).lean()) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const maxOrder = await FormulaToolkit.findOne({ examId }).sort({ orderNumber: -1 }).select("orderNumber").lean();
    const orderNumber = ((maxOrder as { orderNumber?: number } | null)?.orderNumber ?? 0) + 1;

    const docData: Record<string, unknown> = {
      examId: new mongoose.Types.ObjectId(examId),
      level,
      title,
      slug,
      description: (body.description ?? "").trim(),
      fileUrl: (body.fileUrl ?? "").trim(),
      pages: parseInt(body.pages ?? "0", 10) || 0,
      size: (body.size ?? "").trim(),
      subjectLabel: (body.subjectLabel ?? "").trim(),
      orderNumber,
      status: body.status === "Inactive" ? "Inactive" : "Active",
    };

    if (level >= 2 && body.subjectId && mongoose.Types.ObjectId.isValid(body.subjectId)) {
      docData.subjectId = new mongoose.Types.ObjectId(body.subjectId);
    }
    if (level >= 3 && body.unitId && mongoose.Types.ObjectId.isValid(body.unitId)) {
      docData.unitId = new mongoose.Types.ObjectId(body.unitId);
    }
    if (level >= 4 && body.chapterId && mongoose.Types.ObjectId.isValid(body.chapterId)) {
      docData.chapterId = new mongoose.Types.ObjectId(body.chapterId);
    }
    if (level >= 5 && body.topicId && mongoose.Types.ObjectId.isValid(body.topicId)) {
      docData.topicId = new mongoose.Types.ObjectId(body.topicId);
    }
    if (level >= 6 && body.subtopicId && mongoose.Types.ObjectId.isValid(body.subtopicId)) {
      docData.subtopicId = new mongoose.Types.ObjectId(body.subtopicId);
    }
    if (level >= 7 && body.definitionId && mongoose.Types.ObjectId.isValid(body.definitionId)) {
      docData.definitionId = new mongoose.Types.ObjectId(body.definitionId);
    }

    const doc = await FormulaToolkit.create(docData);

    const populated = await FormulaToolkit.findById(doc._id)
      .populate("examId", "name slug")
      .populate("subjectId", "name slug")
      .populate("unitId", "name slug")
      .populate("chapterId", "name slug")
      .populate("topicId", "name slug")
      .populate("subtopicId", "name slug")
      .populate("definitionId", "name slug")
      .lean();

    return NextResponse.json(mapDoc(populated as Record<string, unknown>), { status: 201, headers: corsHeaders });
  } catch (err) {
    console.error("POST /api/formula-toolkit error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create formula toolkit" },
      { status: 500, headers: corsHeaders }
    );
  }
}
