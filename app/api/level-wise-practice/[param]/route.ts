import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import LevelWisePractice from "@/models/LevelWisePractice";
import LevelWiseQuestion from "@/models/LevelWiseQuestion";
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

/** GET /api/level-wise-practice/[param] – get a single practice paper by ID or slug */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    await connectDB();
    const { param } = await params;

    const isObjectId = mongoose.Types.ObjectId.isValid(param);
    const query = isObjectId ? { _id: param } : { slug: param };

    const doc = await LevelWisePractice.findOne(query)
      .populate("examId", "name slug")
      .populate("subjectId", "name slug")
      .populate("unitId", "name slug")
      .populate("chapterId", "name slug")
      .populate("topicId", "name slug")
      .populate("subtopicId", "name slug")
      .populate("definitionId", "name slug")
      .lean();

    if (!doc) {
      return NextResponse.json({ error: "Practice paper not found" }, { status: 404 });
    }

    return NextResponse.json({
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
    });
  } catch (err) {
    console.error("GET /api/level-wise-practice/[param] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch practice paper" },
      { status: 500 }
    );
  }
}

/** PUT /api/level-wise-practice/[param] – update a practice paper */
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

    const existingDoc = await LevelWisePractice.findOne(query).lean();
    if (!existingDoc) {
      return NextResponse.json({ error: "Practice paper not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    // Update basic fields
    if (body.title !== undefined) {
      const title = toTitleCase(body.title.trim());
      if (!title) {
        return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
      }
      updateData.title = title;

      // Regenerate slug if title changed
      const currentTitle = (existingDoc as { title?: string }).title;
      if (title !== currentTitle) {
        const baseSlug = slugify(title);
        const examId = (existingDoc as { examId: mongoose.Types.ObjectId }).examId;
        let slug = baseSlug;
        let counter = 1;
        while (await LevelWisePractice.findOne({ examId, slug, _id: { $ne: (existingDoc as { _id: mongoose.Types.ObjectId })._id } }).lean()) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
        updateData.slug = slug;
      }
    }

    if (body.description !== undefined) updateData.description = body.description.trim();
    if (body.durationMinutes !== undefined) updateData.durationMinutes = parseInt(body.durationMinutes, 10);
    if (body.totalMarks !== undefined) updateData.totalMarks = parseInt(body.totalMarks, 10);
    if (body.totalQuestions !== undefined) updateData.totalQuestions = parseInt(body.totalQuestions, 10);
    if (body.difficulty !== undefined) updateData.difficulty = body.difficulty;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.locked !== undefined) updateData.locked = body.locked === true;
    if (body.image !== undefined) updateData.image = body.image.trim();

    // Update level and hierarchy (do not store null; use $unset to remove keys above level)
    const unsetData: Record<string, string> = {};
    if (body.level !== undefined) {
      const level = parseInt(body.level, 10);
      if (level < 1 || level > 7) {
        return NextResponse.json({ error: "Level must be between 1 and 7" }, { status: 400 });
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

    const doc = await LevelWisePractice.findOneAndUpdate(
      query,
      updateOp,
      { new: true }
    )
      .populate("examId", "name slug")
      .populate("subjectId", "name slug")
      .populate("unitId", "name slug")
      .populate("chapterId", "name slug")
      .populate("topicId", "name slug")
      .populate("subtopicId", "name slug")
      .populate("definitionId", "name slug")
      .lean();

    if (!doc) {
      return NextResponse.json({ error: "Practice paper not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: (doc._id as { toString: () => string }).toString(),
      examId: (doc.examId as { _id?: { toString: () => string }; name?: string })?._id?.toString() || doc.examId,
      examName: (doc.examId as { name?: string })?.name || "",
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
      updatedAt: doc.updatedAt
        ? new Date(doc.updatedAt as Date).toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : undefined,
    });
  } catch (err) {
    console.error("PUT /api/level-wise-practice/[param] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update practice paper" },
      { status: 500 }
    );
  }
}

/** DELETE /api/level-wise-practice/[param] – delete a practice paper and all its questions (cascading) */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    await connectDB();
    const { param } = await params;

    const isObjectId = mongoose.Types.ObjectId.isValid(param);
    const query = isObjectId ? { _id: param } : { slug: param };

    const doc = await LevelWisePractice.findOne(query).select("_id").lean();
    if (!doc) {
      return NextResponse.json({ error: "Practice paper not found" }, { status: 404 });
    }

    const practiceId = doc._id as mongoose.Types.ObjectId;

    const questionsResult = await LevelWiseQuestion.deleteMany({ practiceId });
    const questionsDeleted = questionsResult.deletedCount ?? 0;

    await LevelWisePractice.findOneAndDelete(query);

    return NextResponse.json({
      message: "Practice paper deleted successfully",
      id: practiceId.toString(),
      questionsDeleted,
    });
  } catch (err) {
    console.error("DELETE /api/level-wise-practice/[param] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete practice paper" },
      { status: 500 }
    );
  }
}
