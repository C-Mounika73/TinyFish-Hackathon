export type Role = 'donor' | 'ngo' | 'volunteer' | 'admin'
export type DonationStatus = 'Available' | 'Requested' | 'Accepted' | 'Pickup Assigned' | 'Picked Up' | 'Delivered' | 'Completed' | 'Cancelled' | 'Expired'

export type Donation = {
  id: string
  donorId: string
  donorName: string
  foodName: string
  description: string
  category: string
  dietary: 'Vegetarian' | 'Non-vegetarian'
  quantityKg: number
  estimatedMeals: number
  preparationAt: string
  safeUntil: string
  pickupUntil: string
  storage: string
  allergens: string
  pickupAddress: string
  coordinates?: { lat: number; lng: number }
  image: string
  status: DonationStatus
  donorDeclaredSafe: boolean
}

export type Organization = {
  id: string
  name: string
  description: string
  website?: string
  location?: string
  sourceUrl: string
  contact?: string
  status: 'Discovered – Pending Verification' | 'Verified' | 'Rejected'
  discoveredAt: string
}

export type Coordinates = { lat: number; lng: number }

export type Bootstrap = {
  user: { id: string; name: string; email: string; role: Role; organization?: string; location: string; verified?: boolean; capacity?: number }
  role: Role
  mode: 'live'
  dataSource: string
  donations: Donation[]
  metrics: Record<string, number>
  notifications: { id: string; title: string; body: string; createdAt: string; unread: boolean; tone: string }[]
  assignments: { id: string; donationId: string; donationName: string; donorName: string; ngoName: string; quantityKg: number; volunteerId: string; donorLocation: string; destination: string; pickupCoordinates?: Coordinates; destinationCoordinates?: Coordinates; volunteerCoordinates?: Coordinates; deadline: string; status: string; proofUploaded: boolean }[]
  discoveredOrganizations: Organization[]
  matches: { donationId: string; score: number; distanceKm: number | null; reasons: string[] }[]
  impact: { meals: number; kg: number; successfulDonations: number; verifiedNgos: number; activeDonors: number; volunteers: number; demo?: false }
}
