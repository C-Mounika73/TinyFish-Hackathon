import { AlertTriangle, LocateFixed, LoaderCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { Bootstrap, Coordinates } from '../../lib/types'
import { api } from '../../lib/api'
import { getRoadRoute, type RouteResult } from '../../services/directions.service'
import { watchVolunteerLocation } from '../../services/geolocation.service'
import { FoodLoopMap } from './FoodLoopMap'
import { RouteInfoCard } from './RouteInfoCard'

export function VolunteerRouteExperience({ assignment, act }: { assignment: Bootstrap['assignments'][number]; act: (action: () => Promise<unknown>, success: string) => void }) {
  const [liveLocation, setLiveLocation] = useState<Coordinates | undefined>()
  const [locationStatus, setLocationStatus] = useState('Requesting browser location…')
  const [route, setRoute] = useState<RouteResult>()
  const [routeError, setRouteError] = useState('')
  const stage = assignment.status === 'Picked Up' ? 'ngo' : 'pickup'
  const pickup = assignment.pickupCoordinates
  const ngo = assignment.destinationCoordinates
  const volunteer = liveLocation
  const destination = stage === 'pickup' ? pickup : ngo
  const routeOrigin = liveLocation || assignment.volunteerCoordinates
  const staticPoints = useMemo(() => [pickup, ngo].filter(Boolean), [pickup, ngo])

  useEffect(() => watchVolunteerLocation((position) => { setLiveLocation(position); setLocationStatus('Live browser location active') }, setLocationStatus), [])
  useEffect(() => {
    const controller = new AbortController()
    setRoute(undefined); setRouteError('')
    if (!routeOrigin || !destination) { setRouteError('A confirmed pickup or NGO coordinate is required before routing.'); return () => controller.abort() }
    getRoadRoute(routeOrigin, destination, controller.signal).then(setRoute).catch((error) => { if (error.name !== 'AbortError') setRouteError(error instanceof Error ? error.message : 'Road route unavailable.') })
    return () => controller.abort()
  }, [assignment.id, stage, destination?.lat, destination?.lng, routeOrigin?.lat, routeOrigin?.lng])

  const openNavigation = () => {
    if (!destination) return
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}&travelmode=driving`, '_blank', 'noopener,noreferrer')
  }
  const confirmPickup = () => act(() => api.updateAssignment(assignment.id, 'Picked Up'), 'Pickup confirmed. The route is now in transit.')
  const uploadProof = () => act(() => api.updateAssignment(assignment.id, 'Delivered', true), 'Delivery confirmed with proof.')

  return <div className="route-experience"><div className="route-map-heading"><div><span className="eyebrow">Live route preview</span><h3>{stage === 'pickup' ? 'Get the food safely to the road.' : 'Complete the last mile with care.'}</h3></div><span className="map-location-status"><LocateFixed size={15} />{locationStatus}</span></div><div className="route-map-stage"><FoodLoopMap volunteer={volunteer} pickup={pickup} ngo={ngo} route={route} activeStage={stage} />{!liveLocation && <div className="location-prompt"><LocateFixed size={16} /><span>Enable location permission to add your blue live marker. Demo coordinates remain limited to the assignment record.</span></div>}{routeError && <div className="route-error"><AlertTriangle size={16} />{routeError}</div>}{!route && !routeError && <div className="route-loading"><LoaderCircle size={18} className="spin" /> Finding a road route…</div>}</div><RouteInfoCard assignment={assignment} route={route} stage={stage} locationStatus={locationStatus} onNavigate={openNavigation} onConfirmPickup={confirmPickup} onUploadProof={uploadProof} /><div className="route-legend"><span><i className="legend-dot legend-volunteer" />Volunteer</span><span><i className="legend-dot legend-pickup" />Pickup</span><span><i className="legend-dot legend-ngo" />NGO destination</span><span className="route-provider-note">Road geometry: OSRM · tiles: OpenStreetMap</span></div>{staticPoints.length < 2 && <p className="map-data-note">This assignment needs both confirmed pickup and NGO coordinates before a route can be drawn.</p>}</div>
}
