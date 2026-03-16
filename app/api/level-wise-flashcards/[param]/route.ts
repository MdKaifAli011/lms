import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import LevelWiseFlashcard from "@/models/LevelWiseFlashcard";
import LevelWiseFlashcardCard from "@/models/LevelWiseFlashcardCard";
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

function mapDocToResponse(doc: Record<string, unknown>) {
  return {
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
  };
}

/** GET /api/level-wise-flashcards/[param] – get a single deck by ID or slug */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    await connectDB();
    const { param } = await params;
    const isObjectId = mongoose.Types.ObjectId.isValid(param);
    const query = isObjectId ? { _id: param } : { slug: param };

    const doc = await LevelWiseFlashcard.findOne(query)
      .populate("examId", "name slug")
      .populate("subjectId", "name slug")
      .populate("unitId", "name slug")
      .populate("chapterId", "name slug")
      .populate("topicId", "name slug")
      .populate("subtopicId", "name slug")
      .populate("definitionId", "name slug")
      .lean();

    if (!doc) {
      return NextResponse.json({ error: "Flashcard deck not found" }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json(mapDocToResponse(doc as Record<string, unknown>), { headers: corsHeaders });
  } catch (err) {
    console.error("GET /api/level-wise-flashcards/[param] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch flashcard deck" },
      { status: 500, headers: corsHeaders }
    );
  }
}

/** PUT /api/level-wise-flashcards/[param] – update a flashcard deck */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    await connectDB();
    const { param } = await params;
    const body = await request.json();
    const isObjectId = mongoose.Types.ObjectId.isValid(param);
    const query = isObjectId ? { _id: param } : { slug: param };

    const existingDoc = await LevelWiseFlashcard.findOne(query).lean();
    if (!existingDoc) {
      return NextResponse.json({ error: "Flashcard deck not found" }, { status: 404, headers: corsHeaders });
    }

    const updateData: Record<string, unknown> = {};

    if (body.title !== undefined) {
      const title = toTitleCase(body.title.trim());
      if (!title) {
        return NextResponse.json({ error: "Title cannot be empty" }, { status: 400, headers: corsHeaders });
      }
      updateData.title = title;
      const currentTitle = (existingDoc as { title?: string }).title;
      if (title !== currentTitle) {
        const baseSlug = slugify(title);
        const examId = (existingDoc as { examId: mongoose.Types.ObjectId }).examId;
        let slug = baseSlug;
        let counter = 1;
        while (
          await LevelWiseFlashcard.findOne({
            examId,
            slug,
            _id: { $ne: (existingDoc as { _id: mongoose.Types.ObjectId })._id },
          }).lean()
        ) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
        updateData.slug = slug;
      }
    }

    if (body.description !== undefined) updateData.description = body.description.trim();
    if (body.status !== undefined) updateData.status = body.status;
    if (body.locked !== undefined) updateData.locked = body.locked === true;
    if (body.seo !== undefined && typeof body.seo === "object") {
      updateData.seo = { ...(body.seo as Record<string, unknown>) };
    }

    const unsetData: Record<string, string> = {};
    if (body.level !== undefined) {
      const level = parseInt(body.level, 10);
      if (level < 1 || level > 7) {
        return NextResponse.json({ error: "Level must be between 1 and 7" }, { status: 400, headers: corsHeaders });
      }
      updateData.level = level;
      if (level >= 2 && body.subjectId && mongoose.Types.ObjectId.isValid(body.subjectId)) {
        updateData.subjectId = new mongoose.Types.ObjectId(body.subjectId);
      } else {
        unsetData.subjectId = "";
      }
      if (level >= 3 && body.unitId && mongoose.Types.ObjectId.isValid(body.unitId)) {
        updateData.unitId = new mongoose.Types.ObjectId(body.unitId);
      } else {
        unsetData.unitId = "";
      }
      if (level >= 4 && body.chapterId && mongoose.Types.ObjectId.isValid(body.chapterId)) {
        updateData.chapterId = new mongoose.Types.ObjectId(body.chapterId);
      } else {
        unsetData.chapterId = "";
      }
      if (level >= 5 && body.topicId && mongoose.Types.ObjectId.isValid(body.topicId)) {
        updateData.topicId = new mongoose.Types.ObjectId(body.topicId);
      } else {
        unsetData.topicId = "";
      }
      if (level >= 6 && body.subtopicId && mongoose.Types.ObjectId.isValid(body.subtopicId)) {
        updateData.subtopicId = new mongoose.Types.ObjectId(body.subtopicId);
      } else {
        unsetData.subtopicId = "";
      }
      if (level >= 7 && body.definitionId && mongoose.Types.ObjectId.isValid(body.definitionId)) {
        updateData.definitionId = new mongoose.Types.ObjectId(body.definitionId);
      } else {
        unsetData.definitionId = "";
      }
    } else {
      if (body.subjectId !== undefined) {
        if (body.subjectId && mongoose.Types.ObjectId.isValid(body.subjectId)) {
          updateData.subjectId = new mongoose.Types.ObjectId(body.subjectId);
        } else {
          unsetData.subjectId = "";
        }
      }
      if (body.unitId !== undefined) {
        if (body.unitId && mongoose.Types.ObjectId.isValid(body.unitId)) {
          updateData.unitId = new mongoose.Types.ObjectId(body.unitId);
        } else {
          unsetData.unitId = "";
        }
      }
      if (body.chapterId !== undefined) {
        if (body.chapterId && mongoose.Types.ObjectId.isValid(body.chapterId)) {
          updateData.chapterId = new mongoose.Types.ObjectId(body.chapterId);
        } else {
          unsetData.chapterId = "";
        }
      }
      if (body.topicId !== undefined) {
        if (body.topicId && mongoose.Types.ObjectId.isValid(body.topicId)) {
          updateData.topicId = new mongoose.Types.ObjectId(body.topicId);
        } else {
          unsetData.topicId = "";
        }
      }
      if (body.subtopicId !== undefined) {
        if (body.subtopicId && mongoose.Types.ObjectId.isValid(body.subtopicId)) {
          updateData.subtopicId = new mongoose.Types.ObjectId(body.subtopicId);
        } else {
          unsetData.subtopicId = "";
        }
      }
      if (body.definitionId !== undefined) {
        if (body.definitionId && mongoose.Types.ObjectId.isValid(body.definitionId)) {
          updateData.definitionId = new mongoose.Types.ObjectId(body.definitionId);
        } else {
          unsetData.definitionId = "";
        }
      }
    }

    updateData.updatedAt = new Date();
    const updateOp: Record<string, unknown> = { $set: updateData };
    if (Object.keys(unsetData).length > 0) {
      updateOp.$unset = unsetData;
    }

    const doc = await LevelWiseFlashcard.findOneAndUpdate(query, updateOp, { new: true })
      .populate("examId", "name slug")
      .populate("subjectId", "name slug")
      .populate("unitId", "name slug")
      .populate("chapterId", "name slug")
      .populate("topicId", "name slug")
      .populate("subtopicId", "name slug")
      .populate("definitionId", "name slug")
      .lean();

    if (!doc) {
      return NextResponse.json({ error: "Flashcard deck not found" }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json(mapDocToResponse(doc as Record<string, unknown>), { headers: corsHeaders });
  } catch (err) {
    console.error("PUT /api/level-wise-flashcards/[param] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update flashcard deck" },
      { status: 500, headers: corsHeaders }
    );
  }
}

/** DELETE /api/level-wise-flashcards/[param] – delete deck and all its cards */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    await connectDB();
    const { param } = await params;
    const isObjectId = mongoose.Types.ObjectId.isValid(param);
    const query = isObjectId ? { _id: param } : { slug: param };

    const doc = await LevelWiseFlashcard.findOne(query).select("_id").lean();
    if (!doc) {
      return NextResponse.json({ error: "Flashcard deck not found" }, { status: 404, headers: corsHeaders });
    }

    const deckId = doc._id as mongoose.Types.ObjectId;
    const cardsResult = await LevelWiseFlashcardCard.deleteMany({ deckId });
    const cardsDeleted = cardsResult.deletedCount ?? 0;
    await LevelWiseFlashcard.findOneAndDelete(query);

    return NextResponse.json(
      {
        message: "Flashcard deck deleted successfully",
        id: deckId.toString(),
        cardsDeleted,
      },
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error("DELETE /api/level-wise-flashcards/[param] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete flashcard deck" },
      { status: 500, headers: corsHeaders }
    );
  }
}
