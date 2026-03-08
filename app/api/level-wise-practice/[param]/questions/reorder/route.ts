import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import LevelWisePractice from "@/models/LevelWisePractice";
import LevelWiseQuestion from "@/models/LevelWiseQuestion";
import mongoose from "mongoose";

function resolvePracticeParam(param: string) {
  const isObjectId = mongoose.Types.ObjectId.isValid(param);
  return isObjectId ? { _id: new mongoose.Types.ObjectId(param) } : { slug: param };
}

/** POST /api/level-wise-practice/[param]/questions/reorder – set orderNumber for multiple questions */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    await connectDB();
    const { param } = await params;
    const body = await request.json();

    const query = resolvePracticeParam(param);
    const practice = await LevelWisePractice.findOne(query).select("_id").lean();
    if (!practice) {
      return NextResponse.json({ error: "Practice paper not found" }, { status: 404 });
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
        LevelWiseQuestion.updateOne(
          { _id: id, practiceId: practice._id },
          { $set: { orderNumber, updatedAt: new Date() } }
        )
      )
    );

    return NextResponse.json({ ok: true, updated: updates.length });
  } catch (err) {
    console.error("POST /api/level-wise-practice/[param]/questions/reorder error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to reorder" },
      { status: 500 }
    );
  }
}
