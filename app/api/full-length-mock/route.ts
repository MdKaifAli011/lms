import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import FullLengthMock from "@/models/FullLengthMock";
import "@/models/Exam";
import { slugify } from "@/lib/slugify";
import mongoose from "mongoose";

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

/** GET /api/full-length-mock – list full-length mock tests (supports pagination + search) */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    const examId = searchParams.get("examId");
    const status = searchParams.get("status");
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const search = searchParams.get("search")?.trim();

    const usePagination = pageParam != null && limitParam != null;
    const page = Math.max(1, parseInt(pageParam ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(limitParam ?? "10", 10)));

    const matchStage: Record<string, unknown> = {};
    if (examId && mongoose.Types.ObjectId.isValid(examId)) matchStage.examId = new mongoose.Types.ObjectId(examId);
    if (status) matchStage.status = status;
    if (search) {
      matchStage.$or = [{ title: { $regex: search, $options: "i" } }];
    }

    if (usePagination) {
      const pipeline: mongoose.PipelineStage[] = [
        { $match: Object.keys(matchStage).length ? matchStage : {} },
        { $sort: { examId: 1, orderNumber: 1 } },
        { $lookup: { from: "exams", localField: "examId", foreignField: "_id", as: "exam", pipeline: [{ $project: { name: 1, slug: 1 } }] } },
        { $unwind: { path: "$exam", preserveNullAndEmptyArrays: true } },
      ];
      if (search) {
        pipeline.push({
          $match: {
            $or: [
              { title: { $regex: search, $options: "i" } },
              { "exam.name": { $regex: search, $options: "i" } },
            ],
          },
        });
      }
      pipeline.push(
        { $facet: {
          total: [{ $count: "count" }],
          papers: [
            { $skip: (page - 1) * limit },
            { $limit: limit },
            { $project: {
              _id: 1,
              examId: 1,
              examName: "$exam.name",
              examSlug: "$exam.slug",
              title: 1,
              slug: 1,
              description: 1,
              durationMinutes: 1,
              totalMarks: 1,
              totalQuestions: 1,
              difficulty: 1,
              orderNumber: 1,
              status: 1,
              locked: 1,
              image: 1,
              createdAt: 1,
              updatedAt: 1,
            } },
          ],
        } }
      );

      const result = await FullLengthMock.aggregate(pipeline).then((r) => r[0] as { total: { count: number }[]; papers: Record<string, unknown>[] });
      const total = result.total[0]?.count ?? 0;
      const papers = result.papers ?? [];

      const list = papers.map((doc) => ({
        id: (doc._id as mongoose.Types.ObjectId).toString(),
        examId: (doc.examId as mongoose.Types.ObjectId).toString(),
        examName: doc.examName ?? "",
        examSlug: doc.examSlug ?? "",
        title: doc.title,
        slug: doc.slug,
        description: doc.description ?? "",
        durationMinutes: doc.durationMinutes,
        totalMarks: doc.totalMarks,
        totalQuestions: doc.totalQuestions,
        difficulty: doc.difficulty,
        orderNumber: doc.orderNumber,
        status: doc.status,
        locked: doc.locked ?? false,
        image: doc.image ?? "",
        createdAt: doc.createdAt
          ? new Date(doc.createdAt as Date).toLocaleString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })
          : undefined,
        updatedAt: doc.updatedAt
          ? new Date(doc.updatedAt as Date).toLocaleString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })
          : undefined,
      }));

      return NextResponse.json({ papers: list, total }, { headers: corsHeaders });
    }

    const query: Record<string, unknown> = {};
    if (examId) query.examId = examId;
    if (status) query.status = status;
    if (search) query.$or = [{ title: { $regex: search, $options: "i" } }];

    const papers = await FullLengthMock.find(query)
      .sort({ examId: 1, orderNumber: 1 })
      .populate("examId", "name slug")
      .lean();

    let filtered = papers as Record<string, unknown>[];
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((doc) => {
        const titleMatch = (doc.title as string)?.toLowerCase().includes(searchLower);
        const examName = (doc.examId as { name?: string })?.name ?? "";
        return titleMatch || examName.toLowerCase().includes(searchLower);
      });
    }

    const list = filtered.map((doc) => ({
      id: (doc._id as { toString: () => string }).toString(),
      examId: (doc.examId as { _id?: { toString: () => string } })?._id?.toString() ?? doc.examId,
      examName: (doc.examId as { name?: string })?.name ?? "",
      examSlug: (doc.examId as { slug?: string })?.slug ?? "",
      title: doc.title,
      slug: doc.slug,
      description: doc.description ?? "",
      durationMinutes: doc.durationMinutes,
      totalMarks: doc.totalMarks,
      totalQuestions: doc.totalQuestions,
      difficulty: doc.difficulty,
      orderNumber: doc.orderNumber,
      status: doc.status,
      locked: doc.locked ?? false,
      image: doc.image ?? "",
      createdAt: doc.createdAt
        ? new Date(doc.createdAt as Date).toLocaleString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })
        : undefined,
      updatedAt: doc.updatedAt
        ? new Date(doc.updatedAt as Date).toLocaleString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })
        : undefined,
    }));

    return NextResponse.json(list, { headers: corsHeaders });
  } catch (err) {
    console.error("GET /api/full-length-mock error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch mock tests" },
      { status: 500, headers: corsHeaders }
    );
  }
}

/** POST /api/full-length-mock – create a new full-length mock test */
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

    // Generate unique slug
    const baseSlug = slugify(title);
    let slug = baseSlug;
    let counter = 1;
    while (await FullLengthMock.findOne({ examId, slug }).lean()) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Get max order number for this exam
    const maxOrder = await FullLengthMock.findOne({ examId })
      .sort({ orderNumber: -1 })
      .select("orderNumber")
      .lean();
    const orderNumber = (maxOrder?.orderNumber ?? 0) + 1;

    const doc = await FullLengthMock.create({
      examId: new mongoose.Types.ObjectId(examId),
      title,
      slug,
      description: (body.description ?? "").trim(),
      durationMinutes: parseInt(body.durationMinutes || "180", 10),
      totalMarks: parseInt(body.totalMarks || "300", 10),
      totalQuestions: parseInt(body.totalQuestions || "90", 10),
      difficulty: body.difficulty || "Mixed",
      orderNumber,
      status: body.status === "Inactive" ? "Inactive" : "Active",
      locked: body.locked === true,
      image: body.image?.trim() || "",
    });

    return NextResponse.json({
      id: doc._id.toString(),
      examId: doc.examId.toString(),
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
    console.error("POST /api/full-length-mock error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create mock test" },
      { status: 500, headers: corsHeaders }
    );
  }
}
