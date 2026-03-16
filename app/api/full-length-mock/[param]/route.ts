import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import FullLengthMock from "@/models/FullLengthMock";
import { slugify } from "@/lib/slugify";
import mongoose from "mongoose";

/** GET /api/full-length-mock/[param] – get a single mock test by ID or slug */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    await connectDB();
    const { param } = await params;

    const isObjectId = mongoose.Types.ObjectId.isValid(param);
    const query = isObjectId ? { _id: param } : { slug: param };

    const doc = await FullLengthMock.findOne(query)
      .populate("examId", "name slug")
      .lean();

    if (!doc) {
      return NextResponse.json({ error: "Mock test not found" }, { status: 404 });
    }

    // Read regulations from raw collection so it's always present (avoids Mongoose omitting if schema was cached)
    const rawDoc = await FullLengthMock.collection.findOne({ _id: (doc as { _id: mongoose.Types.ObjectId })._id });
    const regulations =
      rawDoc && typeof (rawDoc as { regulations?: string }).regulations === "string"
        ? (rawDoc as { regulations: string }).regulations
        : "";

    return NextResponse.json({
      id: (doc._id as { toString: () => string }).toString(),
      examId: (doc.examId as { _id?: { toString: () => string }; name?: string; slug?: string })?._id?.toString() || doc.examId,
      examName: (doc.examId as { name?: string })?.name || "",
      examSlug: (doc.examId as { slug?: string })?.slug || "",
      title: doc.title,
      slug: doc.slug,
      description: doc.description || "",
      durationMinutes: doc.durationMinutes,
      totalMarks: doc.totalMarks,
      totalQuestions: doc.totalQuestions,
      difficulty: doc.difficulty,
      orderNumber: doc.orderNumber,
      status: doc.status,
      mockId: (doc as { mockId?: string }).mockId ?? "",
      locked: doc.locked || false,
      image: doc.image || "",
      regulations,
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
    console.error("GET /api/full-length-mock/[param] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch mock test" },
      { status: 500 }
    );
  }
}

/** PUT /api/full-length-mock/[param] – update a mock test */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    await connectDB();
    const { param } = await params;
    const body = await request.json();

    const isObjectId =
      typeof param === "string" &&
      param.length === 24 &&
      /^[0-9a-fA-F]{24}$/.test(param) &&
      mongoose.Types.ObjectId.isValid(param);
    const query = isObjectId ? { _id: new mongoose.Types.ObjectId(param) } : { slug: param };

    const existingDoc = await FullLengthMock.findOne(query).lean();
    if (!existingDoc) {
      return NextResponse.json({ error: "Mock test not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    // Update basic fields
    if (body.title !== undefined) {
      const title = body.title.trim();
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
        while (await FullLengthMock.findOne({ examId, slug, _id: { $ne: (existingDoc as { _id: mongoose.Types.ObjectId })._id } }).lean()) {
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
    if (body.mockId !== undefined) updateData.mockId = String(body.mockId).trim() || "";
    if (body.regulations !== undefined) updateData.regulations = typeof body.regulations === "string" ? body.regulations : "";

    updateData.updatedAt = new Date();

    // When updating regulations, write via native driver so it always persists (avoids Mongoose schema cache omitting the field)
    if (body.regulations !== undefined) {
      const regulationsValue = typeof body.regulations === "string" ? body.regulations : "";
      await FullLengthMock.collection.updateOne(
        { _id: (existingDoc as { _id: mongoose.Types.ObjectId })._id },
        { $set: { regulations: regulationsValue, updatedAt: new Date() } }
      );
    }

    const doc = await FullLengthMock.findOneAndUpdate(
      query,
      { $set: updateData },
      { new: true }
    )
      .populate("examId", "name slug")
      .lean();

    if (!doc) {
      return NextResponse.json({ error: "Mock test not found" }, { status: 404 });
    }

    // Re-fetch from DB so regulations is always present (Mongoose .lean() returns raw doc from DB)
    const rawDoc = await FullLengthMock.collection.findOne({ _id: (doc as { _id: mongoose.Types.ObjectId })._id });
    const regulationsFromDb = rawDoc && typeof (rawDoc as { regulations?: string }).regulations === "string"
      ? (rawDoc as { regulations: string }).regulations
      : "";

    return NextResponse.json({
      id: (doc._id as { toString: () => string }).toString(),
      examId: (doc.examId as { _id?: { toString: () => string }; name?: string; slug?: string })?._id?.toString() || doc.examId,
      examName: (doc.examId as { name?: string })?.name || "",
      examSlug: (doc.examId as { slug?: string })?.slug || "",
      title: doc.title,
      slug: doc.slug,
      description: doc.description || "",
      durationMinutes: doc.durationMinutes,
      totalMarks: doc.totalMarks,
      totalQuestions: doc.totalQuestions,
      difficulty: doc.difficulty,
      orderNumber: doc.orderNumber,
      status: doc.status,
      mockId: (doc as { mockId?: string }).mockId ?? "",
      locked: doc.locked || false,
      image: doc.image || "",
      regulations: regulationsFromDb,
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
    console.error("PUT /api/full-length-mock/[param] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update mock test" },
      { status: 500 }
    );
  }
}

/** DELETE /api/full-length-mock/[param] – delete a mock test */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    await connectDB();
    const { param } = await params;

    const isObjectId = mongoose.Types.ObjectId.isValid(param);
    const query = isObjectId ? { _id: param } : { slug: param };

    const doc = await FullLengthMock.findOneAndDelete(query).lean();

    if (!doc) {
      return NextResponse.json({ error: "Mock test not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Mock test deleted successfully",
      id: (doc._id as { toString: () => string }).toString(),
    });
  } catch (err) {
    console.error("DELETE /api/full-length-mock/[param] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete mock test" },
      { status: 500 }
    );
  }
}
