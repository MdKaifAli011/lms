import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import LevelWiseFlashcard from "@/models/LevelWiseFlashcard";
import "@/models/Exam";
import "@/models/Subject";
import "@/models/Unit";
import "@/models/Chapter";
import "@/models/Topic";
import "@/models/Subtopic";
import "@/models/Definition";
import { slugify } from "@/lib/slugify";
import { toTitleCase } from "@/lib/titleCase";
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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/** GET /api/level-wise-flashcards – list flashcard decks */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const examId = searchParams.get("examId");
    const level = searchParams.get("level");
    const status = searchParams.get("status");
    const subjectId = searchParams.get("subjectId");
    const unitId = searchParams.get("unitId");
    const chapterId = searchParams.get("chapterId");
    const topicId = searchParams.get("topicId");
    const subtopicId = searchParams.get("subtopicId");
    const definitionId = searchParams.get("definitionId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "0", 10);

    const query: Record<string, unknown> = {};
    if (examId) query.examId = examId;
    if (level) query.level = parseInt(level, 10);
    if (status) query.status = status;
    if (subjectId && mongoose.Types.ObjectId.isValid(subjectId)) query.subjectId = new mongoose.Types.ObjectId(subjectId);
    if (unitId && mongoose.Types.ObjectId.isValid(unitId)) query.unitId = new mongoose.Types.ObjectId(unitId);
    if (chapterId && mongoose.Types.ObjectId.isValid(chapterId)) query.chapterId = new mongoose.Types.ObjectId(chapterId);
    if (topicId && mongoose.Types.ObjectId.isValid(topicId)) query.topicId = new mongoose.Types.ObjectId(topicId);
    if (subtopicId && mongoose.Types.ObjectId.isValid(subtopicId)) query.subtopicId = new mongoose.Types.ObjectId(subtopicId);
    if (definitionId && mongoose.Types.ObjectId.isValid(definitionId)) query.definitionId = new mongoose.Types.ObjectId(definitionId);

    const total = await LevelWiseFlashcard.countDocuments(query);

    let dbQuery = LevelWiseFlashcard.find(query)
      .sort({ examId: 1, level: 1, orderNumber: 1 })
      .populate("examId", "name slug")
      .populate("subjectId", "name slug")
      .populate("unitId", "name slug")
      .populate("chapterId", "name slug")
      .populate("topicId", "name slug")
      .populate("subtopicId", "name slug")
      .populate("definitionId", "name slug");

    if (limit > 0) {
      const skip = (page - 1) * limit;
      dbQuery = dbQuery.skip(skip).limit(limit);
    }

    const decks = await dbQuery.lean();

    const list = decks.map((doc: Record<string, unknown>) => ({
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
      orderNumber: doc.orderNumber,
      status: doc.status,
      locked: doc.locked || false,
      seo: (doc.seo as Record<string, unknown>) ?? undefined,
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

    return NextResponse.json({ decks: list, total }, { headers: corsHeaders });
  } catch (err) {
    console.error("GET /api/level-wise-flashcards error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch flashcard decks" },
      { status: 500, headers: corsHeaders }
    );
  }
}

/** POST /api/level-wise-flashcards – create a new flashcard deck */
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const title = toTitleCase((body.title ?? "").trim());
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

    const baseSlug = slugify(title);
    let slug = baseSlug;
    let counter = 1;
    while (await LevelWiseFlashcard.findOne({ examId, slug }).lean()) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const maxOrder = await LevelWiseFlashcard.findOne({ examId })
      .sort({ orderNumber: -1 })
      .select("orderNumber")
      .lean();
    const orderNumber = (maxOrder?.orderNumber ?? 0) + 1;

    const docData: Record<string, unknown> = {
      examId: new mongoose.Types.ObjectId(examId),
      level,
      title,
      slug,
      description: (body.description ?? "").trim(),
      orderNumber,
      status: body.status === "Inactive" ? "Inactive" : "Active",
      locked: body.locked === true,
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

    if (level < 2) {
      delete docData.subjectId;
      delete docData.unitId;
      delete docData.chapterId;
      delete docData.topicId;
      delete docData.subtopicId;
      delete docData.definitionId;
    } else if (level < 3) {
      delete docData.unitId;
      delete docData.chapterId;
      delete docData.topicId;
      delete docData.subtopicId;
      delete docData.definitionId;
    } else if (level < 4) {
      delete docData.chapterId;
      delete docData.topicId;
      delete docData.subtopicId;
      delete docData.definitionId;
    } else if (level < 5) {
      delete docData.topicId;
      delete docData.subtopicId;
      delete docData.definitionId;
    } else if (level < 6) {
      delete docData.subtopicId;
      delete docData.definitionId;
    } else if (level < 7) {
      delete docData.definitionId;
    }

    const doc = await LevelWiseFlashcard.create(docData);

    return NextResponse.json(
      {
        id: doc._id.toString(),
        examId: doc.examId.toString(),
        level: doc.level,
        levelName: CONTENT_LEVEL_NAMES[doc.level],
        title: doc.title,
        slug: doc.slug,
        description: doc.description,
        orderNumber: doc.orderNumber,
        status: doc.status,
        locked: doc.locked,
        createdAt: doc.createdAt
          ? new Date(doc.createdAt).toLocaleString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : undefined,
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (err) {
    console.error("POST /api/level-wise-flashcards error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create flashcard deck" },
      { status: 500, headers: corsHeaders }
    );
  }
}
