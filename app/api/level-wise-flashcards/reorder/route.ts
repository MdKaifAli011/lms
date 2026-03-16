import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import LevelWiseFlashcard from "@/models/LevelWiseFlashcard";
import mongoose from "mongoose";

/** POST /api/level-wise-flashcards/reorder – reorder flashcard decks */
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

    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.id)) {
        return NextResponse.json(
          { error: `Invalid ID: ${item.id}` },
          { status: 400 }
        );
      }
    }

    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(item.id) },
        update: { $set: { orderNumber: item.orderNumber, updatedAt: new Date() } },
      },
    }));

    await LevelWiseFlashcard.bulkWrite(bulkOps);

    return NextResponse.json({ message: "Order updated successfully" });
  } catch (err) {
    console.error("POST /api/level-wise-flashcards/reorder error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to reorder flashcard decks" },
      { status: 500 }
    );
  }
}
