export type AuthRole = 'owner' | 'barber' | 'manager'

export interface AuthUser {
  id: string
  email: string
  role: AuthRole
  name: string
  avatar_url: string | null
  shop_id?: string | null
}

export interface LoginForm {
  email: string
  password: string
}