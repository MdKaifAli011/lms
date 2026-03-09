import { NextRequest } from "next/server"
import connectDB from "@/lib/db"
import BlockedIp from "@/models/BlockedIp"

/**
 * Get client IP from request headers (works behind proxy: Vercel, Nginx, etc.).
 */
export function getClientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim()
    if (first) return first
  }
  const realIp = request.headers.get("x-real-ip")?.trim()
  if (realIp) return realIp
  return null
}

/**
 * Returns true if the given IP is in the blocked list (visits from this IP should not be counted).
 */
export async function isIpBlocked(ip: string): Promise<boolean> {
  if (!ip || !ip.trim()) return false
  await connectDB()
  const normalized = ip.trim()
  const found = await BlockedIp.findOne({ ip: normalized }).select("_id").lean()
  return !!found
}
