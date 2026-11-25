import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const freshlySet = new Set<string>()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            freshlySet.add(name)
            // Host-only cookie (no Domain attribute): a session on app.* is never sent to
            // the admin host or to shop hosts.
            const { domain: _ignored, ...cookieOptions } = options as Record<string, unknown>
            supabaseResponse.cookies.set(name, value, cookieOptions)
          })
        },
      },
    }
  )



// بعد إنشاء الـ supabase client مباشرة
const { data: { user } } = await supabase.auth.getUser()

// Migration of old sessions: earlier builds wrote the auth cookies with
// Domain=.<root>, which every host (shop sites, hq) receives. For each such cookie
// the browser sent, write a host-only copy and expire the domain-wide one.
// Without this, the old cookie would keep travelling to every subdomain.
const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN
if (process.env.NODE_ENV === 'production' && root) {
  const legacyDomains = Array.from(new Set([`.${root}`, `.${root.split(':')[0]}`]))
  for (const c of request.cookies.getAll()) {
    if (!c.name.startsWith('sb-') || freshlySet.has(c.name)) continue
    // Raw Set-Cookie headers: the cookies API keys by name, so it can not hold the
    // host-only copy and the expiry of the domain-wide copy at the same time.
    const name = encodeURIComponent(c.name)
    supabaseResponse.headers.append('Set-Cookie', `${name}=${c.value}; Path=/; Max-Age=${400 * 24 * 60 * 60}; SameSite=Lax; Secure`)
    for (const domain of legacyDomains) {
      supabaseResponse.headers.append('Set-Cookie', `${name}=; Path=/; Domain=${domain}; Max-Age=0; SameSite=Lax; Secure`)
    }
  }
}

return { response: supabaseResponse, supabase, user }
}