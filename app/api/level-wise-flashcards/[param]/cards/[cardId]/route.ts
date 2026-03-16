import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import LevelWiseFlashcard from "@/models/LevelWiseFlashcard";
import LevelWiseFlashcardCard from "@/models/LevelWiseFlashcardCard";
import mongoose from "mongoose";

function resolveDeckParam(param: string) {
  const isObjectId = mongoose.Types.ObjectId.isValid(param);
  return isObjectId ? { _id: new mongoose.Types.ObjectId(param) } : { slug: param };
}

/** GET /api/level-wise-flashcards/[param]/cards/[cardId] – get one card */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ param: string; cardId: string }> }
) {
  try {
    await connectDB();
    const { param, cardId } = await params;
    if (!cardId || !mongoose.Types.ObjectId.isValid(cardId)) {
      return NextResponse.json({ error: "Invalid card ID" }, { status: 400 });
    }

    const query = resolveDeckParam(param);
    const deck = await LevelWiseFlashcard.findOne(query).select("_id").lean();
    if (!deck) {
      return NextResponse.json({ error: "Flashcard deck not found" }, { status: 404 });
    }

    const c = await LevelWiseFlashcardCard.findOne({
      _id: cardId,
      deckId: deck._id,
    }).lean();

    if (!c) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: (c._id as mongoose.Types.ObjectId).toString(),
      deckId: (deck._id as mongoose.Types.ObjectId).toString(),
      front: c.front,
      back: c.back,
      orderNumber: c.orderNumber,
      updatedAt: (c as { updatedAt?: Date }).updatedAt
        ? new Date((c as { updatedAt: Date }).updatedAt).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : undefined,
    });
  } catch (err) {
    console.error("GET /api/level-wise-flashcards/[param]/cards/[cardId] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch card" },
      { status: 500 }
    );
  }
}

/** PUT /api/level-wise-flashcards/[param]/cards/[cardId] – update a card */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ param: string; cardId: string }> }
) {
  try {
    await connectDB();
    const { param, cardId } = await params;
    const body = await request.json();
    if (!cardId || !mongoose.Types.ObjectId.isValid(cardId)) {
      return NextResponse.json({ error: "Invalid card ID" }, { status: 400 });
    }

    const query = resolveDeckParam(param);
    const deck = await LevelWiseFlashcard.findOne(query).select("_id").lean();
    if (!deck) {
      return NextResponse.json({ error: "Flashcard deck not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (body.front !== undefined) updateData.front = (body.front ?? "").trim() || "(empty)";
    if (body.back !== undefined) updateData.back = (body.back ?? "").trim() || "(empty)";
    if (body.orderNumber !== undefined) updateData.orderNumber = Math.max(1, parseInt(body.orderNumber, 10) || 1);

    const doc = await LevelWiseFlashcardCard.findOneAndUpdate(
      { _id: cardId, deckId: deck._id },
      { $set: updateData },
      { new: true }
    ).lean();

    if (!doc) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: (doc._id as mongoose.Types.ObjectId).toString(),
      deckId: (deck._id as mongoose.Types.ObjectId).toString(),
      front: doc.front,
      back: doc.back,
      orderNumber: doc.orderNumber,
    });
  } catch (err) {
    console.error("PUT /api/level-wise-flashcards/[param]/cards/[cardId] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update card" },
      { status: 500 }
    );
  }
}

/** DELETE /api/level-wise-flashcards/[param]/cards/[cardId] */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ param: string; cardId: string }> }
) {
  try {
    await connectDB();
    const { param, cardId } = await params;
    if (!cardId || !mongoose.Types.ObjectId.isValid(cardId)) {
      return NextResponse.json({ error: "Invalid card ID" }, { status: 400 });
    }

    const query = resolveDeckParam(param);
    const deck = await LevelWiseFlashcard.findOne(query).select("_id").lean();
    if (!deck) {
      return NextResponse.json({ error: "Flashcard deck not found" }, { status: 404 });
    }

    const doc = await LevelWiseFlashcardCard.findOneAndDelete({
      _id: cardId,
      deckId: deck._id,
    }).lean();

    if (!doc) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Card deleted",
      id: (doc._id as mongoose.Types.ObjectId).toString(),
    });
  } catch (err) {
    console.error("DELETE /api/level-wise-flashcards/[param]/cards/[cardId] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete card" },
      { status: 500 }
    );
  }
}
