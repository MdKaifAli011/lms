import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import LevelWiseFlashcard from "@/models/LevelWiseFlashcard";
import LevelWiseFlashcardCard from "@/models/LevelWiseFlashcardCard";
import mongoose from "mongoose";

function resolveDeckParam(param: string) {
  const isObjectId = mongoose.Types.ObjectId.isValid(param);
  return isObjectId ? { _id: new mongoose.Types.ObjectId(param) } : { slug: param };
}

/** GET /api/level-wise-flashcards/[param]/cards – list cards for a deck */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    await connectDB();
    const { param } = await params;
    const query = resolveDeckParam(param);

    const deck = await LevelWiseFlashcard.findOne(query).select("_id").lean();
    if (!deck) {
      return NextResponse.json({ error: "Flashcard deck not found" }, { status: 404 });
    }

    const deckId = deck._id instanceof mongoose.Types.ObjectId
      ? deck._id
      : new mongoose.Types.ObjectId(String(deck._id));

    const cards = await LevelWiseFlashcardCard.find({ deckId })
      .sort({ orderNumber: 1 })
      .lean();

    const list = cards.map((c) => ({
      id: (c._id as mongoose.Types.ObjectId).toString(),
      deckId: deckId.toString(),
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
    }));

    return NextResponse.json(list);
  } catch (err) {
    console.error("GET /api/level-wise-flashcards/[param]/cards error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch cards" },
      { status: 500 }
    );
  }
}

/** POST /api/level-wise-flashcards/[param]/cards – create a card */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    await connectDB();
    const { param } = await params;
    const body = await request.json();
    const query = resolveDeckParam(param);

    const deck = await LevelWiseFlashcard.findOne(query).select("_id").lean();
    if (!deck) {
      return NextResponse.json({ error: "Flashcard deck not found" }, { status: 404 });
    }

    const front = (body.front ?? "").trim();
    const back = (body.back ?? "").trim();
    if (!front && !back) {
      return NextResponse.json({ error: "Front or back text is required" }, { status: 400 });
    }

    const maxOrder = await LevelWiseFlashcardCard.findOne({ deckId: deck._id })
      .sort({ orderNumber: -1 })
      .select("orderNumber")
      .lean();
    const orderNumber = ((maxOrder?.orderNumber as number) ?? 0) + 1;

    const doc = await LevelWiseFlashcardCard.create({
      deckId: deck._id,
      front: front || "(empty)",
      back: back || "(empty)",
      orderNumber,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      id: (doc._id as mongoose.Types.ObjectId).toString(),
      deckId: (deck._id as mongoose.Types.ObjectId).toString(),
      front: doc.front,
      back: doc.back,
      orderNumber: doc.orderNumber,
    });
  } catch (err) {
    console.error("POST /api/level-wise-flashcards/[param]/cards error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create card" },
      { status: 500 }
    );
  }
}
