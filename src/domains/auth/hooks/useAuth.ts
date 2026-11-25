'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { signIn, signOut, getProfile, getCurrentUser } from '../services/auth.service'
import type { AuthUser, LoginForm } from '../types/auth.types'

async function fetchAuthUser(): Promise<AuthUser | null> {
  try {
    const { data: { user: authUser } } = await getCurrentUser()
    if (authUser) {
      const profile = await getProfile(authUser.id)
      return profile
    }
  } catch (err) {
    // Ignore error
  }
  return null
}

export function useAuth() {
  const router = useRouter()
  const queryClient = useQueryClient()
  
  const { data: user = null, isLoading: isInitializing } = useQuery({
    queryKey: ['auth-user'],
    queryFn: fetchAuthUser,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function login(form: LoginForm) {
    setLoading(true)
    setError(null)

    try {
      const data = await signIn(form)
      const profile = await getProfile(data.user.id)
      
      queryClient.setQueryData(['auth-user'], profile)

      const adminSub = process.env.NEXT_PUBLIC_ADMIN_SUBDOMAIN || 'hq-7m4x'
      if (window.location.hostname.split('.')[0] === adminSub) {
        // Platform admin host: the proxy serves /admin here, the server re-checks is_super_admin.
        router.push('/')
      } else if (profile.role === 'owner' || profile.role === 'manager') {
        router.push('/owner/dashboard')
      } else {
        router.push('/barber/timeline')
      }
    } catch (err: any) {
      setError(err.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة')
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    await signOut()
    queryClient.setQueryData(['auth-user'], null)
    router.push('/login')
  }

  return { user, isInitializing, loading, error, login, logout }
}