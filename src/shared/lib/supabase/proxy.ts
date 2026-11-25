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
            const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN
            const cookieOptions = {
              ...options,
              ...(process.env.NODE_ENV === 'production' && rootDomain
                ? { domain: `.${rootDomain}` }
                : {}),
            }
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