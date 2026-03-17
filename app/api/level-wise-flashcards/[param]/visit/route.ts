import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import LevelWiseFlashcard from "@/models/LevelWiseFlashcard";
import mongoose from "mongoose";
import { getClientIp } from "@/lib/visit-block";
import { isIpBlocked } from "@/lib/visit-block";

/**
 * POST /api/level-wise-flashcards/[param]/visit – increment visit count for a flashcard deck.
 * [param] = deck id (MongoDB _id) or deck slug.
 * Returns the updated visits and today counts. Blocked IPs do not increment.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    const { param } = await params;
    if (!param?.trim()) {
      return NextResponse.json({ error: "Deck id or slug is required" }, { status: 400 });
    }

    const clientIp = getClientIp(request);
    const skipCount = !!(clientIp && (await isIpBlocked(clientIp)));

    await connectDB();

    const isObjectId = mongoose.Types.ObjectId.isValid(param);
    const query = isObjectId ? { _id: new mongoose.Types.ObjectId(param) } : { slug: param.trim().toLowerCase() };

    const doc = skipCount
      ? await LevelWiseFlashcard.findOne(query).select("visits today").lean()
      : await LevelWiseFlashcard.findOneAndUpdate(
          query,
          { $inc: { visits: 1, today: 1 } },
          { new: true }
        )
          .select("visits today")
          .lean();

    if (!doc) {
      return NextResponse.json({ error: "Flashcard deck not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      visits: (doc as { visits?: number }).visits ?? 0,
      today: (doc as { today?: number }).today ?? 0,
    });
  } catch (err) {
    console.error("POST /api/level-wise-flashcards/[param]/visit error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to record visit" },
      { status: 500 }
    );
  }
}
