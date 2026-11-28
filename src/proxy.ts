import { NextRequest, NextResponse } from "next/server"
import { updateSession } from "@/shared/lib/supabase/proxy"

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000"

// Platform admin host. Hard-to-guess name is only a speed bump, the real
// protection is the server-side is_super_admin check in app/admin/layout.tsx.
const ADMIN_SUBDOMAIN = (process.env.NEXT_PUBLIC_ADMIN_SUBDOMAIN || "hq-7m4x").toLowerCase()
// Names that can never be a shop. Keep in sync with the customer app.
const RESERVED_SUBDOMAINS = new Set(["www", "app", "admin", ADMIN_SUBDOMAIN, "api", "mail", "default", "auth"])

function notFoundResponse(request: NextRequest, headers: Headers) {
  const url = request.nextUrl.clone()
  url.pathname = "/__not-found"
  return NextResponse.rewrite(url, { status: 404, headers })
}

/**
 * استخراج الـ Subdomain من الـ Hostname
 * يدعم:
 * - admin.localhost:3000 -> "admin"
 * - salon1.localhost:3000 -> "salon1"
 * - admin.yourdomain.com -> "admin"
 * - salon1.yourdomain.com -> "salon1"
 * - yourdomain.com أو localhost:3000 -> null
 */
export function extractSubdomain(request: NextRequest): string | null {
  const host = request.headers.get("host") || ""
  const hostname = host.split(":")[0]

  // Localhost development: [subdomain].localhost
  if (hostname.endsWith(".localhost")) {
    const sub = hostname.replace(".localhost", "").toLowerCase()
    return sub && sub !== "www" ? sub : null
  }

  // Localhost development: [subdomain].localhost.com
  if (hostname.endsWith(".localhost.com")) {
    const sub = hostname.replace(".localhost.com", "").toLowerCase()
    return sub && sub !== "www" ? sub : null
  }

  // Production domain: [subdomain].[rootDomain]
  const cleanRoot = ROOT_DOMAIN.split(":")[0].toLowerCase()
  if (hostname.endsWith(`.${cleanRoot}`)) {
    const sub = hostname.replace(`.${cleanRoot}`, "").toLowerCase()
    return sub && sub !== "www" ? sub : null
  }

  return null
}

/**
 * إنشاء رابط للسب-دومين المستهدف
 */
export function getSubdomainUrl(request: NextRequest, targetSubdomain: string, targetPath: string): URL {
  const host = request.headers.get("host") || ""
  const port = host.includes(":") ? `:${host.split(":")[1]}` : ""
  const hostname = host.split(":")[0]
  const protocol = request.nextUrl.protocol

  let baseDomain = ""
  if (hostname.endsWith(".localhost.com")) {
    baseDomain = "localhost.com"
  } else if (hostname.endsWith(".localhost")) {
    baseDomain = "localhost"
  } else {
    baseDomain = ROOT_DOMAIN.split(":")[0]
  }

  return new URL(`${protocol}//${targetSubdomain}.${baseDomain}${port}${targetPath}`)
}

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone()
  const pathname = url.pathname
  const subdomain = extractSubdomain(request)

  // 1. تحديث الجلسة ومزامنة الكوكيز
  const { response, supabase, user } = await updateSession(request)

  // =========================================================================
  // المسار 1: إدارة المنصة الرئيسية (Super Admin Domain: admin.domain.com)
  // =========================================================================
  if (subdomain === ADMIN_SUBDOMAIN) {
    // Owner and barber screens do not exist on the admin host.
    if (pathname.startsWith("/owner") || pathname.startsWith("/barber")) {
      return notFoundResponse(request, response.headers)
    }
    if (pathname === "/login") return response
    if (!user) return NextResponse.redirect(new URL("/login", request.url))
    if (!pathname.startsWith("/admin")) {
      url.pathname = `/admin${pathname === "/" ? "" : pathname}`
      return NextResponse.rewrite(url, { headers: response.headers })
    }
    return response
  }

  // The old "admin" host is retired. Reserved names never act as shops.
  if (subdomain && RESERVED_SUBDOMAINS.has(subdomain) && subdomain !== "app") {
    return notFoundResponse(request, response.headers)
  }

  // /admin only exists on the admin host.
  if (pathname.startsWith("/admin")) {
    return notFoundResponse(request, response.headers)
  }

  // =========================================================================
  // المسار 2: بوابة إدارة الأونر والموظفين (App Subdomain: app.localhost.com / app.domain.com)
  // =========================================================================
  if (subdomain === "app") {
    // إذا لم يكن مسجل دخول، يسمح له بصفحة الدخول فقط
    if (!user) {
      if (pathname === "/login") {
        return response
      }
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // قراءة رتبة المستخدم المسجل
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const role = profile?.role

    // Accounts that are not staff (for example a customer account) get nothing here.
    if (role !== "owner" && role !== "manager" && role !== "barber") {
      return notFoundResponse(request, response.headers)
    }

    // لو فتح /login أو الصفحة الرئيسية يوجه للداشبورد المخصصة له
    if (pathname === "/login" || pathname === "/") {
      const target = (role === "owner" || role === "manager") ? "/owner/dashboard" : "/barber/timeline"
      return NextResponse.redirect(new URL(target, request.url))
    }

    // حماية مسارات الأونر: الحلاق لا يدخل على /owner
    if (pathname.startsWith("/owner") && role !== "owner" && role !== "manager") {
      return NextResponse.redirect(new URL("/barber/timeline", request.url))
    }

    // جميع صفحات /owner و /barber تعمل هنا مباشرة وبدون rewrite
    return response
  }

  // =========================================================================
  // المسار 3: صالون محدد للعملاء والجمهور (Tenant Subdomain: [salon].domain.com)
  // =========================================================================
  if (subdomain) {
    // إذا حاول الأونر أو الحلاق فتح الداشبورد من سب دومين الكلاينت، نوجهه تلقائياً لبوابة app
    if (pathname.startsWith("/owner") || pathname.startsWith("/barber")) {
      return NextResponse.redirect(getSubdomainUrl(request, "app", pathname))
    }

    // المسارات المفتوحة للعملاء والجمهور
    const isPublicSubdomainRoute =
      pathname === "/" ||
      pathname === "/login" ||
      pathname === "/join" ||
      pathname.startsWith("/client")

    if (!user) {
      if (isPublicSubdomainRoute) {
        if (!pathname.startsWith(`/tenant/${subdomain}`)) {
          url.pathname = `/tenant/${subdomain}${pathname === "/" ? "" : pathname}`
          return NextResponse.rewrite(url, { headers: response.headers })
        }
        return response
      }
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // إذا كان المستخدم مسجل دخول كأونر أو حلاق وفتح /login، نوجهه للـ app
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const role = profile?.role
    if (role === "owner" || role === "manager" || role === "barber") {
      const target = (role === "owner" || role === "manager") ? "/owner/dashboard" : "/barber/timeline"
      if (pathname === "/login") {
        return NextResponse.redirect(getSubdomainUrl(request, "app", target))
      }
    }

    // Rewrite لواجهات العميل والحجز الخاصة بهذا الصالون
    if (!pathname.startsWith(`/tenant/${subdomain}`)) {
      url.pathname = `/tenant/${subdomain}${pathname === "/" ? "" : pathname}`
      return NextResponse.rewrite(url, { headers: response.headers })
    }

    return response
  }

  // =========================================================================
  // المسار 4: الدومين الرئيسي (Root Platform Domain: domain.com أو localhost:3000)
  // =========================================================================
  const isPublicRootRoute = pathname === "/" || pathname === "/login"

  if (!user) {
    if (isPublicRootRoute) return response
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // توجيه المستخدم المسجل حسب رتبته
  if (pathname === "/login" || pathname === "/") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const role = profile?.role
    if (role === "owner" || role === "manager") {
      return NextResponse.redirect(new URL("/owner/dashboard", request.url))
    }
    if (role === "barber") {
      return NextResponse.redirect(new URL("/barber/timeline", request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * استثناء ملفات Next.js الثابتة والصور ومسارات الـ API
     */
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}