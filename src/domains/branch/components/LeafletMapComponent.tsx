'use client'

import React, { useEffect } from 'react'
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

interface LeafletMapProps {
  center: { lat: number; lng: number }
  onCenterChanged: (lat: number, lng: number) => void
  onDragEnd: (lat: number, lng: number) => void
}

function MapEvents({ onCenterChanged, onDragEnd }: any) {
  const map = useMapEvents({
    move: () => {
      const c = map.getCenter()
      onCenterChanged(c.lat, c.lng)
    },
    moveend: () => {
      const c = map.getCenter()
      onDragEnd(c.lat, c.lng)
    }
  })
  return null
}

function MapUpdater({ center }: { center: { lat: number, lng: number } }) {
  const map = useMap()
  useEffect(() => {
    // Only pan if it's far, to avoid stuttering on user drag
    const current = map.getCenter()
    if (Math.abs(current.lat - center.lat) > 0.0001 || Math.abs(current.lng - center.lng) > 0.0001) {
      map.setView([center.lat, center.lng], map.getZoom())
    }
  }, [center.lat, center.lng, map])
  return null
}

export default function LeafletMapComponent({ center, onCenterChanged, onDragEnd }: LeafletMapProps) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={17}
      zoomControl={false}
      style={{ width: '100%', height: '100%', zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEvents onCenterChanged={onCenterChanged} onDragEnd={onDragEnd} />
      <MapUpdater center={center} />
    </MapContainer>
  )
}
