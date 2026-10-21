import { createClient } from "@/shared/lib/supabase/client"
import { LoginForm } from "../types/auth.types"

export async function signIn(
  form: LoginForm
) {
  const supabase = createClient()

  const {data, error} = await  supabase.auth.signInWithPassword({
    email : form.email ,
    password : form.password
  })
    if (error) throw new Error(error?.message)
        return data 
}

export async function signOut() {
  const supabase = createClient()

  return supabase.auth.signOut()
}

export async function getProfile(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, role, name, avatar_url')
    .eq('id', userId)
    .single()

  if (error) throw new Error(error.message)

  return data
}

export async function getCurrentUser() {
  const supabase = createClient()

  return supabase.auth.getUser()
}