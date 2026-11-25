export interface TenantBranding {
  logo_url: string | null
  primary_color: string
  cover_image_url?: string | null
  tagline?: string
  description?: string
  hero_title?: string
  hero_subtitle?: string
  badge_text?: string
  phone_number?: string
  whatsapp_number?: string
  instagram_url?: string
}

export interface Tenant {
  id: string
  owner_id: string
  name: string
  subdomain: string
  custom_domain: string | null
  timezone: string
  is_active: boolean
  allow_barber_self_signup: boolean
  barber_signup_requires_approval: boolean
  branding: TenantBranding
  created_at: string
  updated_at: string
}

export interface TenantContextValue {
  tenant: Tenant
  isLoading: boolean
  error: Error | null
}
