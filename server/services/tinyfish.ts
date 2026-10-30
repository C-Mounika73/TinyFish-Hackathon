import type { DiscoveredOrganization } from './repository.js'

const SEARCH_ENDPOINT = 'https://api.search.tinyfish.ai'

type TinyFishResult = { title?: string; snippet?: string; url?: string; domain?: string }

type SearchInput = { city: string; area: string; organizationType: string; keywords: string }

export async function discoverWithTinyFish(input: SearchInput): Promise<{ configured: boolean; message: string; results: DiscoveredOrganization[] }> {
  const apiKey = process.env.TINYFISH_API_KEY
  if (!apiKey) {
    return { configured: false, message: 'TinyFish is not configured in this environment. Add TINYFISH_API_KEY to enable live public-web discovery. No fabricated results were returned.', results: [] }
  }

  const query = [input.organizationType || 'food distribution NGO', input.keywords, input.area, input.city].filter(Boolean).join(' ')
  const params = new URLSearchParams({ query, purpose: 'Find publicly listed organizations that distribute surplus food and may serve as NGO partners.', location: 'IN', language: 'en' })
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12000)
  try {
    const response = await fetch(`${SEARCH_ENDPOINT}?${params.toString()}`, { headers: { 'X-API-Key': apiKey, Accept: 'application/json' }, signal: controller.signal })
    const body = await response.json() as { results?: TinyFishResult[]; error?: { message?: string } }
    if (!response.ok) throw new Error(body.error?.message || `TinyFish returned HTTP ${response.status}`)
    const results = (body.results || []).filter((result) => result.url && result.title).slice(0, 10).map((result, index) => ({
      id: `tf-${Date.now()}-${index}`,
      name: result.title || 'Unnamed organization',
      description: result.snippet || 'Public source did not provide a description.',
      website: result.url,
      location: [input.area, input.city].filter(Boolean).join(', ') || undefined,
      sourceUrl: result.url || '',
      status: 'Discovered – Pending Verification' as const,
      discoveredAt: new Date().toISOString(),
    }))
    return { configured: true, message: results.length ? `TinyFish returned ${results.length} public results. Each record remains pending verification.` : 'TinyFish returned no matching public results.', results }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'TinyFish discovery failed.'
    return { configured: true, message: `TinyFish discovery failed safely: ${message}`, results: [] }
  } finally {
    clearTimeout(timeout)
  }
}
