import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

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

return { response: supabaseResponse, supabase, user }
}