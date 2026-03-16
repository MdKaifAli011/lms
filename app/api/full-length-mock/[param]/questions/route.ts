import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import FullLengthMock from "@/models/FullLengthMock";
import FullLengthMockQuestion from "@/models/FullLengthMockQuestion";
import mongoose from "mongoose";

function resolveMockParam(param: string) {
  const isObjectId = mongoose.Types.ObjectId.isValid(param);
  return isObjectId ? { _id: new mongoose.Types.ObjectId(param) } : { slug: param };
}

/** GET /api/full-length-mock/[param]/questions – list questions for a mock test */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    await connectDB();
    const { param } = await params;
    const query = resolveMockParam(param);

    const mock = await FullLengthMock.findOne(query).select("_id").lean();
    if (!mock) {
      return NextResponse.json({ error: "Mock test not found" }, { status: 404 });
    }
    const mockIdStr = (mock._id as mongoose.Types.ObjectId).toString();

    const questions = await FullLengthMockQuestion.find({ mockId: mock._id })
      .sort({ orderNumber: 1 })
      .lean();

    const list = questions.map((q) => ({
      id: (q._id as mongoose.Types.ObjectId).toString(),
      mockId: mockIdStr,
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
      updatedAt: (q as { updatedAt?: Date }).updatedAt
        ? new Date((q as { updatedAt: Date }).updatedAt).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : undefined,
    }));

    return NextResponse.json(list);
  } catch (err) {
    console.error("GET /api/full-length-mock/[param]/questions error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

/** POST /api/full-length-mock/[param]/questions – create a question */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    await connectDB();
    const { param } = await params;
    const body = await request.json();

    const query = resolveMockParam(param);
    const mock = await FullLengthMock.findOne(query).select("_id").lean();
    if (!mock) {
      return NextResponse.json({ error: "Mock test not found" }, { status: 404 });
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

    const maxOrder = await FullLengthMockQuestion.findOne({ mockId: mock._id })
      .sort({ orderNumber: -1 })
      .select("orderNumber")
      .lean();
    const orderNumber = ((maxOrder?.orderNumber as number) ?? 0) + 1;

    const doc = await FullLengthMockQuestion.create({
      mockId: mock._id,
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
      mockId: (mock._id as mongoose.Types.ObjectId).toString(),
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
    console.error("POST /api/full-length-mock/[param]/questions error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create question" },
      { status: 500 }
    );
  }
}
