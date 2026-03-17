import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import PreviousYearPaper from "@/models/PreviousYearPaper";
import PreviousYearPaperQuestion from "@/models/PreviousYearPaperQuestion";
import mongoose from "mongoose";

function resolvePaperParam(param: string) {
  const isObjectId = mongoose.Types.ObjectId.isValid(param);
  return isObjectId ? { _id: new mongoose.Types.ObjectId(param) } : { slug: param };
}

/** POST /api/previous-year-paper/[param]/questions/reorder – set orderNumber for multiple questions */
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

    const order = body.order;
    if (!Array.isArray(order) || order.length === 0) {
      return NextResponse.json(
        { error: "Body must include order: [{ id, orderNumber }]" },
        { status: 400 }
      );
    }

    const updates = order
      .map((item: { id?: string; orderNumber?: number }) => {
        const id = item?.id;
        const orderNumber = typeof item?.orderNumber === "number" ? item.orderNumber : undefined;
        if (!id || !mongoose.Types.ObjectId.isValid(id) || orderNumber == null || orderNumber < 1) return null;
        return { id: new mongoose.Types.ObjectId(id), orderNumber };
      })
      .filter(Boolean) as { id: mongoose.Types.ObjectId; orderNumber: number }[];

    if (updates.length === 0) {
      return NextResponse.json({ error: "No valid order entries" }, { status: 400 });
    }

    await Promise.all(
      updates.map(({ id, orderNumber }) =>
        PreviousYearPaperQuestion.updateOne(
          { _id: id, paperId: paper._id },
          { $set: { orderNumber, updatedAt: new Date() } }
        )
      )
    );

    return NextResponse.json({ ok: true, updated: updates.length });
  } catch (err) {
    console.error("POST /api/previous-year-paper/[param]/questions/reorder error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to reorder" },
      { status: 500 }
    );
  }
}
