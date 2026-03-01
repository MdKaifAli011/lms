import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import FullLengthMock from "@/models/FullLengthMock";
import mongoose from "mongoose";

/** POST /api/full-length-mock/reorder – reorder mock tests */
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const { items } = body as { items: { id: string; orderNumber: number }[] };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Items array is required" },
        { status: 400 }
      );
    }

    // Validate all IDs
    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.id)) {
        return NextResponse.json(
          { error: `Invalid ID: ${item.id}` },
          { status: 400 }
        );
      }
    }

    // Update order numbers
    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(item.id) },
        update: { $set: { orderNumber: item.orderNumber } },
      },
    }));

    await FullLengthMock.bulkWrite(bulkOps);

    return NextResponse.json({ message: "Order updated successfully" });
  } catch (err) {
    console.error("POST /api/full-length-mock/reorder error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to reorder mock tests" },
      { status: 500 }
    );
  }
}
