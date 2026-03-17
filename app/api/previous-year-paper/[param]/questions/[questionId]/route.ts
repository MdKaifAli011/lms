import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import PreviousYearPaper from "@/models/PreviousYearPaper";
import PreviousYearPaperQuestion from "@/models/PreviousYearPaperQuestion";
import mongoose from "mongoose";

function resolvePaperParam(param: string) {
  const isObjectId = mongoose.Types.ObjectId.isValid(param);
  return isObjectId ? { _id: new mongoose.Types.ObjectId(param) } : { slug: param };
}

/** GET /api/previous-year-paper/[param]/questions/[questionId] – get one question */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ param: string; questionId: string }> }
) {
  try {
    await connectDB();
    const { param, questionId } = await params;
    if (!questionId || !mongoose.Types.ObjectId.isValid(questionId)) {
      return NextResponse.json({ error: "Invalid question ID" }, { status: 400 });
    }

    const query = resolvePaperParam(param);
    const paper = await PreviousYearPaper.findOne(query).select("_id").lean();
    if (!paper) {
      return NextResponse.json({ error: "Previous year paper not found" }, { status: 404 });
    }

    const q = await PreviousYearPaperQuestion.findOne({
      _id: questionId,
      paperId: paper._id,
    }).lean();

    if (!q) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: (q._id as mongoose.Types.ObjectId).toString(),
      paperId: (paper._id as mongoose.Types.ObjectId).toString(),
      subject: (q as { subject?: string }).subject ?? "",
      questionText: q.questionText,
      type: q.type,
      options: q.options ?? [],
      correctOptionIndex: q.correctOptionIndex ?? 0,
      numericalAnswer: q.numericalAnswer ?? "",
      numericalTolerance: q.numericalTolerance ?? 0,
      numericalUnit: q.numericalUnit ?? "",
      marksCorrect: q.marksCorrect,
      marksIncorrect: q.marksIncorrect,
      imageUrl: q.imageUrl ?? "",
      imageCaption: q.imageCaption ?? "",
      orderNumber: q.orderNumber,
      difficulty: q.difficulty ?? "Medium",
      explanation: (q as { explanation?: string }).explanation ?? "",
      explanationImageUrl: (q as { explanationImageUrl?: string }).explanationImageUrl ?? "",
    });
  } catch (err) {
    console.error("GET /api/previous-year-paper/[param]/questions/[questionId] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch question" },
      { status: 500 }
    );
  }
}

/** PUT /api/previous-year-paper/[param]/questions/[questionId] – update a question */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ param: string; questionId: string }> }
) {
  try {
    await connectDB();
    const { param, questionId } = await params;
    const body = await request.json();
    if (!questionId || !mongoose.Types.ObjectId.isValid(questionId)) {
      return NextResponse.json({ error: "Invalid question ID" }, { status: 400 });
    }

    const query = resolvePaperParam(param);
    const paper = await PreviousYearPaper.findOne(query).select("_id").lean();
    if (!paper) {
      return NextResponse.json({ error: "Previous year paper not found" }, { status: 404 });
    }

    const existing = await PreviousYearPaperQuestion.findOne({
      _id: questionId,
      paperId: paper._id,
    }).lean();
    if (!existing) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (body.subject !== undefined) updateData.subject = typeof body.subject === "string" ? body.subject.trim() : "";
    if (body.questionText !== undefined) {
      const questionText = (body.questionText ?? "").trim();
      if (!questionText) {
        return NextResponse.json({ error: "Question text cannot be empty" }, { status: 400 });
      }
      updateData.questionText = questionText;
    }
    if (body.type !== undefined) updateData.type = body.type === "NVQ" ? "NVQ" : "MCQ";
    if (body.options !== undefined) updateData.options = Array.isArray(body.options) ? body.options.map((o: unknown) => String(o).trim()) : [];
    if (body.correctOptionIndex !== undefined) updateData.correctOptionIndex = Math.max(0, parseInt(body.correctOptionIndex, 10) || 0);
    if (body.numericalAnswer !== undefined) updateData.numericalAnswer = (body.numericalAnswer ?? "").trim();
    if (body.numericalTolerance !== undefined) updateData.numericalTolerance = typeof body.numericalTolerance === "number" ? body.numericalTolerance : parseFloat(body.numericalTolerance) || 0;
    if (body.numericalUnit !== undefined) updateData.numericalUnit = (body.numericalUnit ?? "").trim();
    if (body.marksCorrect !== undefined) updateData.marksCorrect = Math.max(0, parseInt(body.marksCorrect, 10) || 4);
    if (body.marksIncorrect !== undefined) updateData.marksIncorrect = Math.max(0, parseInt(body.marksIncorrect, 10) || 1);
    if (body.imageUrl !== undefined) updateData.imageUrl = (body.imageUrl ?? "").trim();
    if (body.imageCaption !== undefined) updateData.imageCaption = (body.imageCaption ?? "").trim();
    if (body.orderNumber !== undefined) updateData.orderNumber = Math.max(1, parseInt(body.orderNumber, 10) || 1);
    if (body.difficulty !== undefined) updateData.difficulty = ["Easy", "Medium", "Hard"].includes(body.difficulty) ? body.difficulty : "Medium";
    if (body.explanation !== undefined) updateData.explanation = (body.explanation ?? "").trim();
    if (body.explanationImageUrl !== undefined) updateData.explanationImageUrl = (body.explanationImageUrl ?? "").trim();

    const doc = await PreviousYearPaperQuestion.findOneAndUpdate(
      { _id: questionId, paperId: paper._id },
      { $set: updateData },
      { new: true }
    ).lean();

    if (!doc) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: (doc._id as mongoose.Types.ObjectId).toString(),
      paperId: (paper._id as mongoose.Types.ObjectId).toString(),
      subject: (doc as { subject?: string }).subject ?? "",
      questionText: doc.questionText,
      type: doc.type,
      options: doc.options ?? [],
      correctOptionIndex: doc.correctOptionIndex ?? 0,
      numericalAnswer: doc.numericalAnswer ?? "",
      numericalTolerance: doc.numericalTolerance ?? 0,
      numericalUnit: doc.numericalUnit ?? "",
      marksCorrect: doc.marksCorrect,
      marksIncorrect: doc.marksIncorrect,
      imageUrl: doc.imageUrl ?? "",
      imageCaption: doc.imageCaption ?? "",
      orderNumber: doc.orderNumber,
      difficulty: doc.difficulty ?? "Medium",
      explanation: (doc as { explanation?: string }).explanation ?? "",
      explanationImageUrl: (doc as { explanationImageUrl?: string }).explanationImageUrl ?? "",
    });
  } catch (err) {
    console.error("PUT /api/previous-year-paper/[param]/questions/[questionId] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update question" },
      { status: 500 }
    );
  }
}

/** DELETE /api/previous-year-paper/[param]/questions/[questionId] */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ param: string; questionId: string }> }
) {
  try {
    await connectDB();
    const { param, questionId } = await params;
    if (!questionId || !mongoose.Types.ObjectId.isValid(questionId)) {
      return NextResponse.json({ error: "Invalid question ID" }, { status: 400 });
    }

    const query = resolvePaperParam(param);
    const paper = await PreviousYearPaper.findOne(query).select("_id").lean();
    if (!paper) {
      return NextResponse.json({ error: "Previous year paper not found" }, { status: 404 });
    }

    const doc = await PreviousYearPaperQuestion.findOneAndDelete({
      _id: questionId,
      paperId: paper._id,
    }).lean();

    if (!doc) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Question deleted",
      id: (doc._id as mongoose.Types.ObjectId).toString(),
    });
  } catch (err) {
    console.error("DELETE /api/previous-year-paper/[param]/questions/[questionId] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete question" },
      { status: 500 }
    );
  }
}
