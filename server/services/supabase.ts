import { createClient, type SupabaseClient, type User as AuthUser } from '@supabase/supabase-js'

export type AppRole = 'donor' | 'ngo' | 'volunteer' | 'admin'
export type AppUser = { id: string; authUserId: string; name: string; email: string; phone?: string; role: AppRole; organization?: string; location?: string; address?: string; verified?: boolean; capacity?: number; createdAt?: string }

let adminClient: SupabaseClient | undefined
let anonClient: SupabaseClient | undefined

export function supabaseConfigured() { return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) }
export function authConfigured() { return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) }
export function requireSupabase() {
  if (!supabaseConfigured()) throw new Error('Supabase is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to the server environment.')
  return getAdminClient()
}
export function requireAuthClient() {
  if (!authConfigured()) throw new Error('Supabase email/password authentication is not configured. Add SUPABASE_URL and SUPABASE_ANON_KEY to the server environment.')
  return getAnonClient()
}
export function getAdminClient() {
  if (!adminClient) {
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) throw new Error('Supabase server credentials are missing.')
    adminClient = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
  }
  return adminClient
}
export function getAnonClient() {
  if (!anonClient) {
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_ANON_KEY
    if (!url || !key) throw new Error('Supabase browser authentication credentials are missing.')
    anonClient = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
  }
  return anonClient
}

export async function verifyAccessToken(accessToken: string): Promise<AuthUser> {
  const { data, error } = await requireSupabase().auth.getUser(accessToken)
  if (error || !data.user) throw new Error('Your session is invalid or has expired. Please sign in again.')
  return data.user
}

export async function getAppUser(authUserId: string): Promise<AppUser | null> {
  const { data, error } = await requireSupabase().from('users').select('id, auth_user_id, full_name, email, phone, role, location, address, created_at, donor_profiles(organization_name, verified_status), ngo_profiles(organization_name, capacity_meals, verified_status), volunteer_profiles(availability, vehicle_type)').eq('auth_user_id', authUserId).maybeSingle()
  if (error) throw error
  if (!data) return null
  const donor = Array.isArray(data.donor_profiles) ? data.donor_profiles[0] : data.donor_profiles
  const ngo = Array.isArray(data.ngo_profiles) ? data.ngo_profiles[0] : data.ngo_profiles
  return { id: data.id, authUserId: data.auth_user_id, name: data.full_name, email: data.email, phone: data.phone || undefined, role: data.role, location: data.location || undefined, address: data.address || undefined, organization: donor?.organization_name || ngo?.organization_name || undefined, verified: donor?.verified_status === 'Verified' || ngo?.verified_status === 'Verified', capacity: ngo?.capacity_meals || undefined, createdAt: data.created_at }
}
