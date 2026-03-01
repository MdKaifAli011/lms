import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import PreviousYearPaper from "@/models/PreviousYearPaper";
import { slugify } from "@/lib/slugify";
import mongoose from "mongoose";

/** GET /api/previous-year-paper/[param] – get a single previous year paper by ID or slug */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    await connectDB();
    const { param } = await params;

    const isObjectId = mongoose.Types.ObjectId.isValid(param);
    const query = isObjectId ? { _id: param } : { slug: param };

    const doc = await PreviousYearPaper.findOne(query)
      .populate("examId", "name slug")
      .lean();

    if (!doc) {
      return NextResponse.json({ error: "Previous year paper not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: (doc._id as { toString: () => string }).toString(),
      examId: (doc.examId as { _id?: { toString: () => string }; name?: string; slug?: string })?._id?.toString() || doc.examId,
      examName: (doc.examId as { name?: string })?.name || "",
      examSlug: (doc.examId as { slug?: string })?.slug || "",
      title: doc.title,
      slug: doc.slug,
      description: doc.description || "",
      year: doc.year,
      session: doc.session || "",
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
    console.error("GET /api/previous-year-paper/[param] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch previous year paper" },
      { status: 500 }
    );
  }
}

/** PUT /api/previous-year-paper/[param] – update a previous year paper */
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

    const existingDoc = await PreviousYearPaper.findOne(query).lean();
    if (!existingDoc) {
      return NextResponse.json({ error: "Previous year paper not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    // Update basic fields
    if (body.title !== undefined) {
      const title = body.title.trim();
      if (!title) {
        return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
      }
      updateData.title = title;

      // Regenerate slug if title or year changed
      const currentTitle = (existingDoc as { title?: string }).title;
      const currentYear = (existingDoc as { year?: number }).year;
      const newYear = body.year !== undefined ? parseInt(body.year, 10) : currentYear;
      if (title !== currentTitle || newYear !== currentYear) {
        const baseSlug = slugify(`${title}-${newYear}`);
        const examId = (existingDoc as { examId: mongoose.Types.ObjectId }).examId;
        let slug = baseSlug;
        let counter = 1;
        while (await PreviousYearPaper.findOne({ examId, slug, _id: { $ne: (existingDoc as { _id: mongoose.Types.ObjectId })._id } }).lean()) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
        updateData.slug = slug;
      }
    }

    if (body.description !== undefined) updateData.description = body.description.trim();
    if (body.year !== undefined) updateData.year = parseInt(body.year, 10);
    if (body.session !== undefined) updateData.session = body.session.trim();
    if (body.durationMinutes !== undefined) updateData.durationMinutes = parseInt(body.durationMinutes, 10);
    if (body.totalMarks !== undefined) updateData.totalMarks = parseInt(body.totalMarks, 10);
    if (body.totalQuestions !== undefined) updateData.totalQuestions = parseInt(body.totalQuestions, 10);
    if (body.difficulty !== undefined) updateData.difficulty = body.difficulty;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.locked !== undefined) updateData.locked = body.locked === true;
    if (body.image !== undefined) updateData.image = body.image.trim();

    updateData.updatedAt = new Date();

    const doc = await PreviousYearPaper.findOneAndUpdate(
      query,
      { $set: updateData },
      { new: true }
    )
      .populate("examId", "name slug")
      .lean();

    if (!doc) {
      return NextResponse.json({ error: "Previous year paper not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: (doc._id as { toString: () => string }).toString(),
      examId: (doc.examId as { _id?: { toString: () => string }; name?: string })?._id?.toString() || doc.examId,
      examName: (doc.examId as { name?: string })?.name || "",
      title: doc.title,
      slug: doc.slug,
      description: doc.description || "",
      year: doc.year,
      session: doc.session || "",
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
    console.error("PUT /api/previous-year-paper/[param] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update previous year paper" },
      { status: 500 }
    );
  }
}

/** DELETE /api/previous-year-paper/[param] – delete a previous year paper */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    await connectDB();
    const { param } = await params;

    const isObjectId = mongoose.Types.ObjectId.isValid(param);
    const query = isObjectId ? { _id: param } : { slug: param };

    const doc = await PreviousYearPaper.findOneAndDelete(query).lean();

    if (!doc) {
      return NextResponse.json({ error: "Previous year paper not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Previous year paper deleted successfully",
      id: (doc._id as { toString: () => string }).toString(),
    });
  } catch (err) {
    console.error("DELETE /api/previous-year-paper/[param] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete previous year paper" },
      { status: 500 }
    );
  }
}
