import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import BlockedIp from "@/models/BlockedIp"

/** GET /api/blocked-ips – list all blocked IPs */
export async function GET() {
  try {
    await connectDB()
    const list = await BlockedIp.find({})
      .sort({ createdAt: -1 })
      .lean()
    const items = list.map((doc) => ({
      id: (doc._id as { toString: () => string }).toString(),
      ip: doc.ip,
      reason: doc.reason ?? "",
      createdAt: doc.createdAt
        ? new Date(doc.createdAt).toISOString()
        : undefined,
    }))
    return NextResponse.json(items)
  } catch (err) {
    console.error("GET /api/blocked-ips error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to list blocked IPs" },
      { status: 500 }
    )
  }
}

/** POST /api/blocked-ips – add a blocked IP. Body: { ip: string, reason?: string } */
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json().catch(() => ({}))
    const ip = typeof body.ip === "string" ? body.ip.trim() : ""
    if (!ip) {
      return NextResponse.json({ error: "ip is required" }, { status: 400 })
    }
    const reason = typeof body.reason === "string" ? body.reason.trim() : undefined
    const existing = await BlockedIp.findOne({ ip }).select("_id").lean()
    if (existing) {
      return NextResponse.json({ error: "This IP is already blocked" }, { status: 409 })
    }
    const doc = await BlockedIp.create({ ip, reason })
    return NextResponse.json({
      id: (doc._id as { toString: () => string }).toString(),
      ip: doc.ip,
      reason: doc.reason ?? "",
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : undefined,
    })
  } catch (err) {
    console.error("POST /api/blocked-ips error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to add blocked IP" },
      { status: 500 }
    )
  }
}
