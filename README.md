# FoodLoop AI

FoodLoop AI is a role-based food rescue platform that routes safe surplus meals from donors to verified NGOs and volunteers. The application now uses a live Supabase-backed server boundary: it does not ship demo users, in-memory donations, fabricated impact numbers, hardcoded organizations or `x-demo-role` authorization.

## Implemented

The app includes a responsive landing page, Supabase email/password registration and login, role-specific profiles, donor donation creation with safety/deadline validation, NGO request and donor acceptance workflow, volunteer assignment and delivery-proof gating, persisted notifications, admin verification actions, TinyFish-backed public discovery, live rule-based matching, impact analytics from distribution records, a Leaflet/OpenStreetMap/OSRM volunteer route experience, and a coordinate/radius-based **Find NGOs Near Me** page.

When Supabase or TinyFish credentials are absent, the UI shows an actionable configuration or authentication error and no fabricated live records are returned. Public landing metrics display `—` until authenticated live impact data is available.

## Run locally

```bash
pnpm install
pnpm dev
```

Vite listens on port `3000` and proxies `/api` to the Express API on port `3001`. Build and typecheck with:

```bash
pnpm typecheck
pnpm build
```

## Environment variables

Copy `.env.example` to `.env` and configure the services you intend to use:

- `SUPABASE_URL`: project URL.
- `SUPABASE_ANON_KEY`: browser-authentication key used by the server's email/password auth client.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only key used for trusted profile reads, persistence and workflow RPCs. Never expose it to the browser.
- `ADMIN_REGISTRATION_TOKEN`: server-only invitation token required to create an administrator account.
- `TINYFISH_API_KEY`: backend-only TinyFish Search key. Missing credentials produce a configuration state and no fabricated discovery results.
- `VITE_OSRM_ROUTING_URL`: optional OSRM-compatible routing endpoint. The default public endpoint returns actual road geometry, distance and duration.
- `VITE_MAP_PROVIDER_URL`: optional Leaflet-compatible tile URL. The current fallback uses an OpenStreetMap-derived public tile host.

## Database setup

Create a Supabase project and run `supabase/schema.sql` in its SQL editor. The schema defines users, donor/NGO/volunteer profiles, donations, requests, atomic request/accept/assignment functions, volunteer assignments, notifications, discovered organizations, verifications, distributions, impact statistics and reports. It includes keys, indexes, safety/deadline/coordinate checks and row-level policies. The server calls the atomic functions through the service-role client after authenticating the user's Supabase access token.

Supabase email confirmation settings affect whether registration immediately returns a session. If confirmation is required, the UI tells the user to confirm their email before signing in.

## TinyFish status

`server/services/tinyfish.ts` uses the documented Search REST contract and keeps `TINYFISH_API_KEY` server-side. Results are normalized from public source data, persisted as `Pending`, and never promoted to verified status automatically. Administrators must review discovered organizations.

## Maps and routing

The volunteer dashboard uses `client/src/components/maps/VolunteerRouteExperience.tsx` with Leaflet controls, OpenStreetMap-derived tiles, confirmed pickup/destination/volunteer markers, browser geolocation and an OSRM road polyline. The NGO finder uses the same map family and filters persisted NGOs by Haversine distance from confirmed browser/profile coordinates. No straight-line route is drawn as a substitute for road geometry, and no location is invented when permission or coordinates are unavailable.

## Folder structure

- `client/src/`: React pages, reusable UI, auth/session API client, maps and styling.
- `server/`: Express API, Supabase auth helpers, persistence repository and TinyFish service.
- `supabase/schema.sql`: normalized schema, atomic workflow RPCs and RLS policies.
- `public/manus-routes.json`: managed Preview route manifest.
- `plan.md` and `TODO.md`: implementation decisions, delivered outcomes and explicit follow-ups.
