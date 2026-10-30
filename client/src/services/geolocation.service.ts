import type { Coordinates } from '../lib/types'

export function watchVolunteerLocation(onPosition: (position: Coordinates) => void, onError: (message: string) => void) {
  if (!('geolocation' in navigator)) {
    onError('This browser does not provide location services.')
    return () => undefined
  }
  const watchId = navigator.geolocation.watchPosition(
    (position) => onPosition({ lat: position.coords.latitude, lng: position.coords.longitude }),
    () => onError('Location permission is off. Enable it to show your live volunteer marker.'),
    { enableHighAccuracy: true, maximumAge: 15_000, timeout: 10_000 },
  )
  return () => navigator.geolocation.clearWatch(watchId)
}
