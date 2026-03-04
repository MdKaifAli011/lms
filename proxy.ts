import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const CORS_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
]

function corsHeaders(request: NextRequest): Headers {
  const origin = request.headers.get("origin") ?? ""
  const allowOrigin =
    origin && CORS_ORIGINS.includes(origin) ? origin : CORS_ORIGINS[0]
  const h = new Headers()
  h.set("Access-Control-Allow-Origin", allowOrigin)
  h.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
  h.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
  h.set("Access-Control-Max-Age", "86400")
  return h
}

export function proxy(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  const headers = corsHeaders(request)

  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers })
  }

  const response = NextResponse.next()
  headers.forEach((value, key) => response.headers.set(key, value))
  return response
}

export const config = {
  matcher: "/api/:path*",
}
