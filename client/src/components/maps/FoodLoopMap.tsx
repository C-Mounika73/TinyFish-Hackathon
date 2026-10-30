import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import { useEffect, useMemo } from 'react'
import type { Coordinates } from '../../lib/types'
import type { RouteResult } from '../../services/directions.service'

const markerIcon = (kind: 'volunteer' | 'pickup' | 'ngo') => L.divIcon({ className: `foodloop-marker foodloop-marker-${kind}`, html: `<span>${kind === 'volunteer' ? '●' : kind === 'pickup' ? '✦' : '♥'}</span>`, iconSize: [34, 34], iconAnchor: [17, 17], popupAnchor: [0, -17] })

function ViewportController({ points }: { points: Coordinates[] }) {
  const map = useMap()
  useEffect(() => {
    if (points.length === 1) map.setView([points[0].lat, points[0].lng], 14, { animate: true })
    if (points.length > 1) map.fitBounds(points.map((point) => [point.lat, point.lng] as [number, number]), { padding: [42, 42], maxZoom: 15, animate: true })
  }, [map, points])
  return null
}

export function FoodLoopMap({ volunteer, pickup, ngo, route, activeStage }: { volunteer?: Coordinates; pickup?: Coordinates; ngo?: Coordinates; route?: RouteResult; activeStage: 'pickup' | 'ngo' }) {
  const points = useMemo(() => [volunteer, pickup, ngo].filter(Boolean) as Coordinates[], [volunteer, pickup, ngo])
  const center = points[0] || { lat: 16.5062, lng: 80.648 }
  return <div className="foodloop-map-shell"><MapContainer center={[center.lat, center.lng]} zoom={14} scrollWheelZoom className="foodloop-map"><TileLayer attribution='&copy; OpenStreetMap contributors' url="https://tile.openstreetmap.de/{z}/{x}/{y}.png" /><ViewportController points={points} />{volunteer && <Marker position={[volunteer.lat, volunteer.lng]} icon={markerIcon('volunteer')}><Popup><strong>Volunteer location</strong><br />Live browser location</Popup></Marker>}{pickup && <Marker position={[pickup.lat, pickup.lng]} icon={markerIcon('pickup')}><Popup><strong>Pickup location</strong><br />Food donor handoff</Popup></Marker>}{ngo && <Marker position={[ngo.lat, ngo.lng]} icon={markerIcon('ngo')}><Popup><strong>NGO destination</strong><br />Distribution handoff</Popup></Marker>}{route && <Polyline positions={route.geometry} pathOptions={{ color: activeStage === 'pickup' ? '#e98539' : '#1f7459', weight: 6, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }} />}</MapContainer><div className="map-provider-badge"><span className="pulse-dot" /> OpenStreetMap + OSRM road route</div></div>
}
