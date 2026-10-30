import type { Bootstrap, Donation, DonationStatus, Organization, Role } from './types'

type SessionPayload = { access_token: string; refresh_token?: string; expires_at?: number }
const sessionKey = 'foodloop-session'
const getSession = (): SessionPayload | null => { try { return JSON.parse(localStorage.getItem(sessionKey) || 'null') as SessionPayload | null } catch { return null } }
const saveSession = (session?: SessionPayload | null) => session ? localStorage.setItem(sessionKey, JSON.stringify(session)) : localStorage.removeItem(sessionKey)

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const session = getSession(); const headers = new Headers(options.headers); headers.set('Content-Type', 'application/json'); if (session?.access_token) headers.set('Authorization', `Bearer ${session.access_token}`)
  const response = await fetch(url, { ...options, headers, credentials: 'include' }); const body = await response.json().catch(() => ({})); if (!response.ok) throw new Error(body.error || 'Something went wrong. Please try again.'); return body as T
}

export const api = {
  getSession: () => request<{ user: Bootstrap['user']; role: Role; mode: 'live' }>('/api/session'),
  login: async (email: string, password: string) => { const result = await request<{ session: SessionPayload; user: Bootstrap['user'] }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }); saveSession(result.session); return result },
  register: async (payload: Record<string, unknown>) => { const result = await request<{ session?: SessionPayload; user: Bootstrap['user']; confirmationRequired: boolean }>('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }); if (result.session) saveSession(result.session); return result },
  resetPassword: (email: string) => request<{ ok: true }>('/api/auth/password-reset', { method: 'POST', body: JSON.stringify({ email }) }),
  logout: async () => { await request('/api/auth/logout', { method: 'POST' }).catch(() => undefined); saveSession(null) },
  getBootstrap: () => request<Bootstrap>('/api/bootstrap'),
  createDonation: (payload: Omit<Donation, 'id' | 'donorId' | 'donorName' | 'status'>) => request<{ donation: Donation }>('/api/donations', { method: 'POST', body: JSON.stringify(payload) }),
  requestDonation: (id: string) => request<{ donation: Donation }>(`/api/donations/${id}/request`, { method: 'POST', body: JSON.stringify({}) }),
  acceptDonation: (id: string) => request<{ donation: Donation }>(`/api/donations/${id}/accept`, { method: 'POST', body: JSON.stringify({}) }),
  rejectDonation: (id: string) => request<{ donation: Donation }>(`/api/donations/${id}/reject`, { method: 'POST', body: JSON.stringify({}) }),
  updateDonation: (id: string, status: DonationStatus) => request<{ donation: Donation }>(`/api/donations/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) }),
  assignVolunteer: (id: string) => request<{ assignment: Bootstrap['assignments'][number] }>(`/api/donations/${id}/assign`, { method: 'POST', body: JSON.stringify({}) }),
  updateAssignment: (id: string, status: 'Picked Up' | 'Delivered', proofUploaded = false) => request<{ assignment: Bootstrap['assignments'][number] }>(`/api/assignments/${id}/status`, { method: 'POST', body: JSON.stringify({ status, proofUploaded }) }),
  discover: (payload: { city: string; area: string; organizationType: string; keywords: string }) => request<{ configured: boolean; message: string; results: Organization[] }>('/api/discovery', { method: 'POST', body: JSON.stringify(payload) }),
  getDiscoveryHistory: () => request<{ organizations: Organization[] }>('/api/discovery/history'),
  verifyOrganization: (id: string, status: Organization['status']) => request<{ organization: Organization }>(`/api/discovery/${id}/verify`, { method: 'POST', body: JSON.stringify({ status }) }),
  markNotificationRead: (id: string) => request<{ ok: true }>(`/api/notifications/${id}/read`, { method: 'POST', body: JSON.stringify({}) }),
  markAllNotificationsRead: () => request<{ ok: true }>('/api/notifications/read-all', { method: 'POST', body: JSON.stringify({}) }),
  getProfile: () => request<{ profile: Record<string, unknown> }>('/api/profile'),
  updateProfile: (payload: Record<string, unknown>) => request<{ user: Bootstrap['user'] }>('/api/profile', { method: 'PATCH', body: JSON.stringify(payload) }),
  search: (term: string) => request<{ donations: Donation[]; users: Record<string, unknown>[] }>(`/api/search?q=${encodeURIComponent(term)}`),
  nearbyNgos: (lat: number, lng: number, radius: number) => request<{ radiusKm: number; total: number; verified: number; pending: number; active: number; availableCapacity: number; ngos: Record<string, unknown>[] }>(`/api/ngos/nearby?lat=${lat}&lng=${lng}&radius=${radius}`),
}
