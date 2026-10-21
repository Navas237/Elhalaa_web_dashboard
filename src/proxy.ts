import { NextRequest, NextResponse } from "next/server"
import { updateSession } from "@/shared/lib/supabase/proxy"

const PUBLIC_ROUTES = ["/", "/login"]
const OWNER_PREFIX = "/owner"
const BARBER_PREFIX = "/barber"
const OWNER_HOME = "/owner/dashboard"
const BARBER_HOME = "/barber/timeline"

type AppRole = "owner" | "barber"

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))
}

function isOwnerRoute(pathname: string) {
  return pathname.startsWith(OWNER_PREFIX)
}

function isBarberRoute(pathname: string) {
  return pathname.startsWith(BARBER_PREFIX)
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // updateSession refreshes the session cookies AND returns the already
  // authenticated user, so no second getUser() round-trip is needed here.
  const { response, supabase, user } = await updateSession(request)

  // Guest أو Rate Limit Error — treat as no user
  if (!user) {
    if (isPublicRoute(pathname)) {
      return response
    }
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // جيب الـ Role
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    if (isPublicRoute(pathname)) return response
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const role = profile.role as AppRole

  if (role !== "owner" && role !== "barber") {
    if (isPublicRoute(pathname)) return response
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // لو مسجل دخول وفتح login أو root
  if (pathname === "/login" || pathname === "/") {
    return NextResponse.redirect(
      new URL(role === "owner" ? OWNER_HOME : BARBER_HOME, request.url)
    )
  }

  // Owner مش يدخل barber routes
  if (role === "owner" && isBarberRoute(pathname)) {
    return NextResponse.redirect(new URL(OWNER_HOME, request.url))
  }

  // Barber مش يدخل owner routes
  if (role === "barber" && isOwnerRoute(pathname)) {
    return NextResponse.redirect(new URL(BARBER_HOME, request.url))
  }

  return response
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/owner/:path*",
    "/barber/:path*",
  ],
}