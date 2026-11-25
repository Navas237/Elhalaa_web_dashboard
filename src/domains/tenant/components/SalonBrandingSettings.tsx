'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Store, 
  Palette, 
  Type, 
  ExternalLink, 
  Save, 
  Loader2, 
  CheckCircle2, 
  Image as ImageIcon,
  Phone,
  Sparkles,
  Globe
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { getTenantByOwnerId, updateTenantBranding } from '../services/tenant.service'
import type { Tenant } from '../types/tenant.types'

const PRESET_COLORS = [
  { name: 'أحمر أنيق', value: '#2A1238' },
  { name: 'كحلي ملكي', value: '#1E3A8A' },
  { name: 'زمردي راقي', value: '#059669' },
  { name: 'ذهبي / برونزي', value: '#D97706' },
  { name: 'بنفسجي عصري', value: '#7C3AED' },
  { name: 'أسود كلاسيك', value: '#111827' },
]

export function SalonBrandingSettings({ ownerId }: { ownerId: string }) {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Form fields
  const [salonName, setSalonName] = useState('')
  const [subdomain, setSubdomain] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#2A1238')
  const [logoUrl, setLogoUrl] = useState('')
  const [badgeText, setBadgeText] = useState('')
  const [heroTitle, setHeroTitle] = useState('')
  const [tagline, setTagline] = useState('')
  const [description, setDescription] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true)
        const t = await getTenantByOwnerId(ownerId)
        if (t) {
          setTenant(t)
          setSalonName(t.name || '')
          setSubdomain(t.subdomain || '')
          const b = t.branding || ({} as any)
          setPrimaryColor(b.primary_color || '#2A1238')
          setLogoUrl(b.logo_url || '')
          setBadgeText(b.badge_text || '')
          setHeroTitle(b.hero_title || 'احجز موعدك في')
          setTagline(b.tagline || 'أرقى صالون بالمنطقة')
          setDescription(b.description || '')
          setWhatsappNumber(b.whatsapp_number || '')
        }
      } catch (err: any) {
        console.error('Failed to load tenant settings:', err)
        setErrorMessage('تعذر تحميل إعدادات الصالون')
      } finally {
        setIsLoading(false)
      }
    }
    if (ownerId) {
      load()
    }
  }, [ownerId])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tenant) return

    try {
      setIsSaving(true)
      setSavedSuccess(false)
      setErrorMessage('')

      const updated = await updateTenantBranding(tenant.id, {
        name: salonName.trim() || tenant.name,
        subdomain: subdomain.trim().toLowerCase() || tenant.subdomain,
        branding: {
          ...tenant.branding,
          primary_color: primaryColor,
          logo_url: logoUrl.trim() || null,
          badge_text: badgeText.trim(),
          hero_title: heroTitle.trim(),
          tagline: tagline.trim(),
          description: description.trim(),
          whatsapp_number: whatsappNumber.trim(),
        },
      })

      setTenant(updated)
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 4000)
    } catch (err: any) {
      console.error('Error saving settings:', err)
      setErrorMessage(err.message || 'حدث خطأ أثناء حفظ الإعدادات')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center py-12 gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-medium">جاري تحميل إعدادات الصالون...</p>
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-center py-8">
        <p className="text-sm text-slate-500">لم يتم العثور على صالون مسجل لهذا الحساب بعد.</p>
      </div>
    )
  }

  const clientUrl = typeof window !== 'undefined'
    ? `${window.location.protocol}//${subdomain || tenant.subdomain}.localhost:3000`
    : `http://${subdomain || tenant.subdomain}.localhost:3000`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-6 border border-slate-100"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm"
            style={{ backgroundColor: primaryColor }}
          >
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">هوية الصالون والموقع للعملاء</h3>
            <p className="text-xs text-slate-400">تحكم بالاسم والألوان والنصوص التي يراها عملاؤك</p>
          </div>
        </div>

        {/* Live Preview Button */}
        <a
          href={clientUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors w-fit"
        >
          <Globe className="w-4 h-4 text-slate-400" />
          معاينة موقع العميل
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Alerts */}
        {savedSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 text-sm font-semibold"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            تم حفظ إعدادات الصالون بنجاح! تم تحديث موقع العميل فورياً.
          </motion.div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-primary-light border border-primary-light text-rose-800 text-sm font-medium">
            {errorMessage}
          </div>
        )}

        {/* Grid 1: Name & Subdomain */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Type className="w-4 h-4 text-slate-400" />
              اسم الصالون (يظهر في الهيدر والفوتر والصفحة)
            </label>
            <Input
              type="text"
              value={salonName}
              onChange={(e) => setSalonName(e.target.value)}
              placeholder="مثال: صالون همبكه الكارف"
              className="h-12 rounded-xl border-slate-200 text-sm font-medium focus-visible:ring-1"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-slate-400" />
              السب-دومين (رابط موقعك)
            </label>
            <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden bg-slate-50 focus-within:ring-1 focus-within:ring-slate-900 focus-within:border-slate-900">
              <Input
                type="text"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="vip"
                dir="ltr"
                className="h-12 border-0 bg-transparent text-sm font-bold text-slate-800 focus-visible:ring-0 shadow-none px-3"
                required
              />
              <span className="text-xs font-bold text-slate-400 px-3 bg-slate-100 py-3 border-r border-slate-200" dir="ltr">
                .localhost:3000
              </span>
            </div>
          </div>
        </div>

        {/* Brand Primary Color */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-slate-400" />
            لون الهوية المميز للصالون (Primary Brand Color)
          </label>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Color Input */}
            <div className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 bg-slate-50 w-fit">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-9 h-9 rounded-lg border-0 cursor-pointer bg-transparent"
              />
              <span className="text-xs font-mono font-bold text-slate-700 px-2" dir="ltr">
                {primaryColor}
              </span>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((col) => (
                <button
                  key={col.value}
                  type="button"
                  onClick={() => setPrimaryColor(col.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    primaryColor.toLowerCase() === col.value.toLowerCase()
                      ? 'border-slate-900 scale-110 shadow-sm'
                      : 'border-white'
                  }`}
                  style={{ backgroundColor: col.value }}
                  title={col.name}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Logo URL */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-slate-400" />
            رابط لوجو الصالون (Logo URL)
          </label>
          <div className="flex items-center gap-3">
            <Input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png (اتركه فارغاً للأيقونة الافتراضية)"
              dir="ltr"
              className="h-12 rounded-xl border-slate-200 text-xs font-medium"
            />
            {logoUrl && (
              <div className="w-12 h-12 rounded-xl border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center bg-slate-50">
                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        <div className="w-full h-px bg-slate-100 my-4" />

        {/* Homepage Texts Section */}
        <div>
          <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            نصوص الصفحة الرئيسية (Hero Section)
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Badge Text */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">
                الشارة الترويجية أعلى العنوان (Badge)
              </label>
              <Input
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                placeholder="مثال: صالون الحلاقة والعناية بالرجل"
                className="h-12 rounded-xl border-slate-200 text-sm font-medium"
              />
            </div>

            {/* Hero Title */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">
                عنوان الهيرو الرئيسي
              </label>
              <Input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                placeholder="مثال: احجز موعدك في"
                className="h-12 rounded-xl border-slate-200 text-sm font-medium"
              />
            </div>

            {/* Tagline */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">
                الشعار بجوار اسم الصالون (Tagline)
              </label>
              <Input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="مثال: أرقى صالون بالمنطقة"
                className="h-12 rounded-xl border-slate-200 text-sm font-medium"
              />
            </div>

            {/* WhatsApp */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                رقم التواصل / الواتساب
              </label>
              <Input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="مثال: +201012345678"
                dir="ltr"
                className="h-12 rounded-xl border-slate-200 text-sm font-medium"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2 mt-4">
            <label className="text-xs font-bold text-slate-700">
              الوصف التعريفي (يظهر تحت العنوان الرئيسي)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اختر حلاقك المفضل، وحدد الخدمة والوقت المناسب — كل ذلك في أقل من دقيقة."
              rows={3}
              className="w-full p-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            disabled={isSaving}
            className="w-full h-13 rounded-2xl text-base font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                جاري حفظ الإعدادات...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                حفظ إعدادات وهوية الصالون
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  )
}
