import type { Coordinates } from '../lib/types'

export type RouteResult = {
  geometry: [number, number][]
  distanceMeters: number
  durationSeconds: number
  provider: 'OSRM'
}

const ROUTING_URL = import.meta.env.VITE_OSRM_ROUTING_URL || 'https://router.project-osrm.org/route/v1/driving'

export async function getRoadRoute(origin: Coordinates, destination: Coordinates, signal?: AbortSignal): Promise<RouteResult> {
  const url = `${ROUTING_URL}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=false`
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error('The road-routing service is unavailable right now.')
  const payload = await response.json() as { code?: string; routes?: { distance: number; duration: number; geometry?: { coordinates: [number, number][] } }[] }
  const route = payload.routes?.[0]
  if (payload.code !== 'Ok' || !route?.geometry?.coordinates?.length) throw new Error('No road route was returned for these coordinates.')
  return { geometry: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]), distanceMeters: route.distance, durationSeconds: route.duration, provider: 'OSRM' }
}

export function formatDistance(meters: number) {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`
}

export function formatDuration(seconds: number) {
  const minutes = Math.max(1, Math.round(seconds / 60))
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`
}
