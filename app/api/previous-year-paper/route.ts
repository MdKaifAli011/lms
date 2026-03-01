import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import PreviousYearPaper from "@/models/PreviousYearPaper";
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

/** GET /api/previous-year-paper – list previous year papers */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    
    const examId = searchParams.get("examId");
    const year = searchParams.get("year");
    const status = searchParams.get("status");

    const query: Record<string, unknown> = {};
    if (examId) query.examId = examId;
    if (year) query.year = parseInt(year, 10);
    if (status) query.status = status;

    const papers = await PreviousYearPaper.find(query)
      .sort({ examId: 1, year: -1, orderNumber: 1 })
      .populate("examId", "name slug")
      .lean();

    const list = papers.map((doc: Record<string, unknown>) => ({
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
    }));

    return NextResponse.json(list, { headers: corsHeaders });
  } catch (err) {
    console.error("GET /api/previous-year-paper error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch previous year papers" },
      { status: 500, headers: corsHeaders }
    );
  }
}

/** POST /api/previous-year-paper – create a new previous year paper */
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

    const year = parseInt(body.year, 10);
    if (!year || isNaN(year)) {
      return NextResponse.json({ error: "Valid Year is required" }, { status: 400, headers: corsHeaders });
    }

    // Generate unique slug
    const baseSlug = slugify(`${title}-${year}`);
    let slug = baseSlug;
    let counter = 1;
    while (await PreviousYearPaper.findOne({ examId, slug }).lean()) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Get max order number for this exam
    const maxOrder = await PreviousYearPaper.findOne({ examId })
      .sort({ orderNumber: -1 })
      .select("orderNumber")
      .lean();
    const orderNumber = (maxOrder?.orderNumber ?? 0) + 1;

    const doc = await PreviousYearPaper.create({
      examId: new mongoose.Types.ObjectId(examId),
      title,
      slug,
      description: (body.description ?? "").trim(),
      year,
      session: (body.session ?? "").trim(),
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
      year: doc.year,
      session: doc.session,
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
    console.error("POST /api/previous-year-paper error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create previous year paper" },
      { status: 500, headers: corsHeaders }
    );
  }
}
