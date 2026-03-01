import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import LevelWisePractice from "@/models/LevelWisePractice";
import { slugify } from "@/lib/slugify";
import mongoose from "mongoose";

const CONTENT_LEVEL_NAMES: Record<number, string> = {
  1: "Exam",
  2: "Subject",
  3: "Unit",
  4: "Chapter",
  5: "Topic",
  6: "Subtopic",
  7: "Definition",
};

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/** GET /api/level-wise-practice – list level-wise practice papers */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    
    const examId = searchParams.get("examId");
    const level = searchParams.get("level");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "0", 10);

    const query: Record<string, unknown> = {};
    if (examId) query.examId = examId;
    if (level) query.level = parseInt(level, 10);
    if (status) query.status = status;

    // Get total count for pagination
    const total = await LevelWisePractice.countDocuments(query);

    let dbQuery = LevelWisePractice.find(query)
      .sort({ examId: 1, level: 1, orderNumber: 1 })
      .populate("examId", "name slug")
      .populate("subjectId", "name slug")
      .populate("unitId", "name slug")
      .populate("chapterId", "name slug")
      .populate("topicId", "name slug")
      .populate("subtopicId", "name slug")
      .populate("definitionId", "name slug");

    // Apply pagination if limit is provided
    if (limit > 0) {
      const skip = (page - 1) * limit;
      dbQuery = dbQuery.skip(skip).limit(limit);
    }

    const papers = await dbQuery.lean();

    const list = papers.map((doc: Record<string, unknown>) => ({
      id: (doc._id as { toString: () => string }).toString(),
      examId: (doc.examId as { _id?: { toString: () => string }; name?: string; slug?: string })?._id?.toString() || doc.examId,
      examName: (doc.examId as { name?: string })?.name || "",
      examSlug: (doc.examId as { slug?: string })?.slug || "",
      level: doc.level,
      levelName: CONTENT_LEVEL_NAMES[doc.level as number] || "Unknown",
      subjectId: (doc.subjectId as { _id?: { toString: () => string }; name?: string })?._id?.toString() || doc.subjectId,
      subjectName: (doc.subjectId as { name?: string })?.name || null,
      unitId: (doc.unitId as { _id?: { toString: () => string }; name?: string })?._id?.toString() || doc.unitId,
      unitName: (doc.unitId as { name?: string })?.name || null,
      chapterId: (doc.chapterId as { _id?: { toString: () => string }; name?: string })?._id?.toString() || doc.chapterId,
      chapterName: (doc.chapterId as { name?: string })?.name || null,
      topicId: (doc.topicId as { _id?: { toString: () => string }; name?: string })?._id?.toString() || doc.topicId,
      topicName: (doc.topicId as { name?: string })?.name || null,
      subtopicId: (doc.subtopicId as { _id?: { toString: () => string }; name?: string })?._id?.toString() || doc.subtopicId,
      subtopicName: (doc.subtopicId as { name?: string })?.name || null,
      definitionId: (doc.definitionId as { _id?: { toString: () => string }; name?: string })?._id?.toString() || doc.definitionId,
      definitionName: (doc.definitionId as { name?: string })?.name || null,
      title: doc.title,
      slug: doc.slug,
      description: doc.description || "",
      durationMinutes: doc.durationMinutes,
      totalMarks: doc.totalMarks,
      totalQuestions: doc.totalQuestions,
      difficulty: doc.difficulty,
      orderNumber: doc.orderNumber,
      status: doc.status,
      locked: doc.locked || false,
      image: doc.image || "",
      createdAt: doc.createdAt
        ? new Date(doc.createdAt as Date).toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : undefined,
      updatedAt: doc.updatedAt
        ? new Date(doc.updatedAt as Date).toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : undefined,
    }));

    return NextResponse.json({ papers: list, total }, { headers: corsHeaders });
  } catch (err) {
    console.error("GET /api/level-wise-practice error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch practice papers" },
      { status: 500, headers: corsHeaders }
    );
  }
}

/** POST /api/level-wise-practice – create a new level-wise practice paper */
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    // Validate required fields
    const title = (body.title ?? "").trim();
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400, headers: corsHeaders });
    }

    const examId = body.examId;
    if (!examId || !mongoose.Types.ObjectId.isValid(examId)) {
      return NextResponse.json({ error: "Valid Exam ID is required" }, { status: 400, headers: corsHeaders });
    }

    const level = parseInt(body.level || "1", 10);
    if (level < 1 || level > 7) {
      return NextResponse.json({ error: "Level must be between 1 and 7" }, { status: 400, headers: corsHeaders });
    }

    // Generate unique slug
    const baseSlug = slugify(title);
    let slug = baseSlug;
    let counter = 1;
    while (await LevelWisePractice.findOne({ examId, slug }).lean()) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Get max order number for this exam
    const maxOrder = await LevelWisePractice.findOne({ examId })
      .sort({ orderNumber: -1 })
      .select("orderNumber")
      .lean();
    const orderNumber = (maxOrder?.orderNumber ?? 0) + 1;

    // Build the document
    const docData: Record<string, unknown> = {
      examId: new mongoose.Types.ObjectId(examId),
      level,
      title,
      slug,
      description: (body.description ?? "").trim(),
      durationMinutes: parseInt(body.durationMinutes || "60", 10),
      totalMarks: parseInt(body.totalMarks || "100", 10),
      totalQuestions: parseInt(body.totalQuestions || "30", 10),
      difficulty: body.difficulty || "Medium",
      orderNumber,
      status: body.status === "Inactive" ? "Inactive" : "Active",
      locked: body.locked === true,
      image: body.image?.trim() || "",
    };

    // Add hierarchy references based on level
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

    const doc = await LevelWisePractice.create(docData);

    return NextResponse.json({
      id: doc._id.toString(),
      examId: doc.examId.toString(),
      level: doc.level,
      levelName: CONTENT_LEVEL_NAMES[doc.level],
      title: doc.title,
      slug: doc.slug,
      description: doc.description,
      durationMinutes: doc.durationMinutes,
      totalMarks: doc.totalMarks,
      totalQuestions: doc.totalQuestions,
      difficulty: doc.difficulty,
      orderNumber: doc.orderNumber,
      status: doc.status,
      locked: doc.locked,
      image: doc.image,
      createdAt: doc.createdAt
        ? new Date(doc.createdAt).toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : undefined,
    }, { status: 201, headers: corsHeaders });
  } catch (err) {
    console.error("POST /api/level-wise-practice error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create practice paper" },
      { status: 500, headers: corsHeaders }
    );
  }
}
