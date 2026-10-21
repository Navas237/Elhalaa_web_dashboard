'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, ArrowRight, Check, Loader2, Search } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import dynamic from 'next/dynamic'

const defaultCenter = { lat: 30.0444, lng: 31.2357 } // Cairo

interface MapPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (location: { address: string; latitude: number; longitude: number }) => void
  initialLat?: number
  initialLng?: number
}

const LeafletMap = dynamic(
  () => import('./LeafletMapComponent'),
  { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 text-[#E8192C] animate-spin" /></div> }
)

export function MapPickerModal({ isOpen, onClose, onConfirm, initialLat, initialLng }: MapPickerModalProps) {
  const [center, setCenter] = useState({ 
    lat: initialLat ?? defaultCenter.lat, 
    lng: initialLng ?? defaultCenter.lng 
  })
  const [address, setAddress] = useState('')
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const handleCenterChanged = useCallback((lat: number, lng: number) => {
    setCenter({ lat, lng })
  }, [])

  const handleDragEnd = useCallback(async (lat: number, lng: number) => {
    setIsGeocoding(true)
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`)
      const data = await response.json()
      if (data && data.display_name) {
        setAddress(data.display_name)
      } else {
        setAddress('موقع غير معروف')
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      setAddress('تعذر تحديد الموقع')
    } finally {
      setIsGeocoding(false)
    }
  }, [])

  const handleConfirm = () => {
    onConfirm({ address, latitude: center.lat, longitude: center.lng })
    onClose()
  }

  // Debounced Search
  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([])
      return
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&accept-language=ar&limit=5`)
        const data = await res.json()
        setSearchResults(data)
        setShowResults(true)
      } catch (err) {
        console.error(err)
      } finally {
        setIsSearching(false)
      }
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const handleSelectResult = (result: any) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    setCenter({ lat, lng })
    setAddress(result.display_name)
    setSearchQuery(result.name || result.display_name)
    setShowResults(false)
  }

  // Geolocation and initial geocode
  useEffect(() => {
    if (isOpen) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            setCenter({ lat: latitude, lng: longitude })
            handleDragEnd(latitude, longitude)
          },
          (error) => {
            console.log('Geolocation error:', error)
            if (!address) {
              handleDragEnd(center.lat, center.lng)
            }
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        )
      } else {
        if (!address) {
          handleDragEnd(center.lat, center.lng)
        }
      }
    }
  }, [isOpen]) // address dependency removed to avoid re-triggering

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] bg-white flex flex-col font-sans"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-white z-10 shadow-sm relative">
            <button 
              onClick={onClose}
              className="p-2 -mr-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-50 transition-colors"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-bold text-gray-900 flex-1">تحديد الموقع</h2>
          </div>

          {/* Map Area */}
          <div className="flex-1 relative bg-gray-50">
            {/* Search Bar */}
            <div className="absolute top-4 left-4 right-4 z-[400]">
              <div className="bg-white rounded-xl shadow-lg flex items-center px-4 border border-gray-100 focus-within:ring-2 focus-within:ring-[#F5A3AA] transition-all relative">
                <Search className="w-5 h-5 text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="ابحث عن مكان أو شارع..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => { if(searchResults.length > 0) setShowResults(true) }}
                  className="w-full h-12 px-3 text-base border-none outline-none bg-transparent placeholder:text-gray-400 text-gray-900"
                />
                {isSearching && <Loader2 className="w-4 h-4 animate-spin text-gray-400 absolute left-4" />}
              </div>
              
              {/* Search Results Dropdown */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[500] max-h-60 overflow-y-auto">
                  {searchResults.map((result, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectResult(result)}
                      className="w-full text-right px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-none transition-colors"
                    >
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">{result.name}</p>
                      <p className="text-xs text-gray-500 line-clamp-1 mt-1">{result.display_name}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <LeafletMap 
              center={center} 
              onCenterChanged={handleCenterChanged}
              onDragEnd={handleDragEnd}
            />
            
            {/* Fixed Center Pin */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[400] drop-shadow-md">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              >
                <MapPin className="w-10 h-10 text-[#E8192C] fill-[#E8192C]" />
              </motion.div>
              <div className="w-3 h-1 bg-black/20 rounded-full mx-auto mt-1 blur-[1px]" />
            </div>
          </div>

          {/* Footer Card */}
          <div className="bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.08)] p-6 z-[500] relative">
            <div className="mb-6 min-h-[4rem]">
              <p className="text-sm font-semibold text-gray-500 mb-2">الموقع المحدد</p>
              {isGeocoding ? (
                <div className="flex items-center gap-2 text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">جاري تحديد العنوان...</span>
                </div>
              ) : (
                <p className="text-base font-bold text-gray-900 line-clamp-2 leading-snug">
                  {address || 'يرجى تحريك الخريطة لتحديد الموقع'}
                </p>
              )}
            </div>

            <Button
              onClick={handleConfirm}
              disabled={!address || isGeocoding}
              className="w-full h-14 bg-[#E8192C] hover:bg-[#C0102A] text-white rounded-xl text-lg font-bold shadow-lg shadow-red-500/25 transition-all"
            >
              <Check className="w-5 h-5 ml-2" />
              تأكيد هذا الموقع
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
