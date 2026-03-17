import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import PreviousYearPaper from "@/models/PreviousYearPaper";
import PreviousYearPaperQuestion from "@/models/PreviousYearPaperQuestion";
import mongoose from "mongoose";

function resolvePaperParam(param: string) {
  const isObjectId = mongoose.Types.ObjectId.isValid(param);
  return isObjectId ? { _id: new mongoose.Types.ObjectId(param) } : { slug: param };
}

/** GET /api/previous-year-paper/[param]/questions – list questions for a paper */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    await connectDB();
    const { param } = await params;
    const query = resolvePaperParam(param);

    const paper = await PreviousYearPaper.findOne(query).select("_id").lean();
    if (!paper) {
      return NextResponse.json({ error: "Previous year paper not found" }, { status: 404 });
    }

    const questions = await PreviousYearPaperQuestion.find({ paperId: paper._id })
      .sort({ orderNumber: 1 })
      .lean();

    const list = questions.map((q) => ({
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
    }));

    return NextResponse.json(list);
  } catch (err) {
    console.error("GET /api/previous-year-paper/[param]/questions error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

/** POST /api/previous-year-paper/[param]/questions – create a question */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    await connectDB();
    const { param } = await params;
    const body = await request.json();

    const query = resolvePaperParam(param);
    const paper = await PreviousYearPaper.findOne(query).select("_id").lean();
    if (!paper) {
      return NextResponse.json({ error: "Previous year paper not found" }, { status: 404 });
    }

    const questionText = (body.questionText ?? "").trim();
    if (!questionText) {
      return NextResponse.json({ error: "Question text is required" }, { status: 400 });
    }

    const type = body.type === "NVQ" ? "NVQ" : "MCQ";
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const options = Array.isArray(body.options) ? body.options.map((o: unknown) => String(o).trim()) : [];
    const correctOptionIndex = Math.max(0, parseInt(body.correctOptionIndex, 10) || 0);
    const numericalAnswer = (body.numericalAnswer ?? "").trim();
    const numericalTolerance = typeof body.numericalTolerance === "number" ? body.numericalTolerance : parseFloat(body.numericalTolerance) || 0;
    const numericalUnit = (body.numericalUnit ?? "").trim();
    const marksCorrect = Math.max(0, parseInt(body.marksCorrect, 10) || 4);
    const marksIncorrect = Math.max(0, parseInt(body.marksIncorrect, 10) || 1);
    const imageUrl = (body.imageUrl ?? "").trim();
    const imageCaption = (body.imageCaption ?? "").trim();
    const difficulty = ["Easy", "Medium", "Hard"].includes(body.difficulty) ? body.difficulty : "Medium";
    const explanation = (body.explanation ?? "").trim();
    const explanationImageUrl = (body.explanationImageUrl ?? "").trim();

    const maxOrder = await PreviousYearPaperQuestion.findOne({ paperId: paper._id })
      .sort({ orderNumber: -1 })
      .select("orderNumber")
      .lean();
    const orderNumber = ((maxOrder?.orderNumber as number) ?? 0) + 1;

    const doc = await PreviousYearPaperQuestion.create({
      paperId: paper._id,
      subject: subject || undefined,
      questionText,
      type,
      options: type === "MCQ" ? options : undefined,
      correctOptionIndex: type === "MCQ" ? Math.min(correctOptionIndex, Math.max(0, options.length - 1)) : undefined,
      numericalAnswer: type === "NVQ" ? numericalAnswer : undefined,
      numericalTolerance: type === "NVQ" ? numericalTolerance : undefined,
      numericalUnit: type === "NVQ" ? numericalUnit : undefined,
      marksCorrect,
      marksIncorrect,
      imageUrl: imageUrl || undefined,
      imageCaption: imageCaption || undefined,
      orderNumber,
      difficulty,
      explanation: explanation || undefined,
      explanationImageUrl: explanationImageUrl || undefined,
      updatedAt: new Date(),
    });

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
    console.error("POST /api/previous-year-paper/[param]/questions error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create question" },
      { status: 500 }
    );
  }
}
