"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Solución para el problema de iconos en Next.js con Leaflet
if (typeof window !== "undefined") {
  const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })

  L.Marker.prototype.options.icon = DefaultIcon
}

interface MapComponentProps {
  center: [number, number]
  zoom: number
  proyectos: Array<{
    id: number
    name: string
    type: string
    coordinates: { lat: number; lng: number }
    beneficiaries: number
    location: string
    status: string
    description: string
  }>
  onProjectSelect: (projectId: number) => void
}

export default function MapComponent({ center, zoom, proyectos, onProjectSelect }: MapComponentProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Cargando mapa...</p>
      </div>
    )
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: "400px", width: "100%" }}
      className="rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {proyectos.map((proyecto) => (
        <Marker
          key={proyecto.id}
          position={[proyecto.coordinates.lat, proyecto.coordinates.lng]}
          eventHandlers={{
            click: () => onProjectSelect(proyecto.id)
          }}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold text-sm">{proyecto.name}</h3>
              <p className="text-xs text-gray-600 mb-1">{proyecto.location}</p>
              <p className="text-xs mb-2">{proyecto.description}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-600">{proyecto.beneficiaries} beneficiarios</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  proyecto.status === 'activo' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {proyecto.status}
                </span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}