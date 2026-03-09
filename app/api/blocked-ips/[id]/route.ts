import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import BlockedIp from "@/models/BlockedIp"
import mongoose from "mongoose"

/** DELETE /api/blocked-ips/[id] – remove a blocked IP */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    }
    await connectDB()
    const doc = await BlockedIp.findByIdAndDelete(id).lean()
    if (!doc) {
      return NextResponse.json({ error: "Blocked IP not found" }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("DELETE /api/blocked-ips/[id] error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to remove blocked IP" },
      { status: 500 }
    )
  }
}
