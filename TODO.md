# FoodLoop AI TODO

## 1. Public landing experience and design system
- [x] Create the FoodLoop AI logo, responsive navigation, hero with the required headline/subheading and Donate Food / Join as an NGO CTAs.
- [ ] Add every requested landing section: Mission, How It Works, Who Can Participate, Impact, Nearby NGOs, Why Choose FoodLoop AI, Testimonials, Contact and Footer. Mission, How It Works, Impact, trust/why-choose, testimonials-style quote and Footer are present; Nearby NGOs, Who Can Participate and Contact remain to be expanded.
- [x] Use the approved Shared Table modernism direction: forest green, sage, warm cream/off-white, soft orange, charcoal, rounded cards, subtle shadows, clean typography, food imagery, responsive layouts and restrained transitions.
- [x] Only display calculated demo impact metrics backed by completed demo records; clearly label demo metrics and sample organizations.

## 2. Authentication and role access
- [x] Support real Supabase email/password registration/login entry for Food Donors, NGOs, Volunteers and Administrators with full name, email, phone, password, account type, location and organization details where applicable; administrator registration requires a server invitation token.
- [x] Replace the demo `x-demo-role` boundary with verified Supabase-authenticated bearer sessions, derive role from the server session, enforce role checks on API routes and redirect a URL role mismatch to the authenticated role.
- [x] Remove demo mode from the shipped runtime; missing Supabase configuration is reported as an actionable setup error and never replaced with sample records.

## 3. Donor workflow
- [x] Build the donor dashboard with total, active and completed donations, meals donated and food rescued in kilograms.
- [x] Implement donation creation with food name/description/category, vegetarian/non-vegetarian, quantity kg, estimated meals, preparation time, safe consumption deadline, pickup availability deadline, storage conditions, allergen information, pickup address, optional valid coordinates, image, required food-safety declaration and validation.
- [x] Block donations past their safe consumption deadline, invalid deadline ordering, invalid coordinates and unsafe/undeclared food.
- [x] Provide demo tracking, history-style donation rows, impact and in-app notifications with statuses Available, Requested, Accepted, Pickup Assigned, Picked Up, Delivered, Completed, Cancelled and Expired represented across the API/schema.

## 4. NGO discovery and management
- [x] Build the NGO dashboard with available/accepted/pending-pickup/completed-distribution metrics and total meals distributed.
- [ ] Add the remaining production-grade donation filters for food name, distance, category, vegetarian/non-vegetarian, quantity and collection deadline; the live coordinate/radius NGO finder is delivered at `/find-ngos`.
- [x] Show food image, donor, type, quantity, meals, pickup location, computed distance when coordinates are valid, safe-consumption deadline and availability status.
- [ ] Complete verified-NGO request/accept/reject/distribution workflow with database-backed atomic status updates. The demo has request, accept, reject, assign, pickup and delivery-proof routes; concurrency-safe claiming and persistent distribution confirmation remain.
- [x] Prevent duplicate requests/claims with unique constraints, row locks and atomic Supabase RPC functions for request, acceptance and volunteer assignment.
- [x] Provide the demo NGO profile, organization name, description, address, service area, verification status and distribution capacity; production acceptance must still be restricted to verified persisted NGOs.

## 5. Volunteer workflow
- [x] Provide a volunteer profile surface, assigned pickup, pickup/delivery locations, deadline, navigation link, pickup confirmation, delivery confirmation requiring a proof upload, completed assignment state and activity metrics in demo mode.
- [x] Allow NGOs to assign an available persisted volunteer to accepted/requested donations through an atomic database function.

## 6. Administration and verification
- [x] Protect the admin verification endpoint with a server-side role check within the explicitly labeled demo mode.
- [x] Display demo users, donors, NGOs, volunteers, donations, pending verifications, completed distributions and reported-issue metrics.
- [ ] Expand persisted NGO/donor verification, account management, donation/status monitoring, complaints, discovered-organization review and analytics after real authentication/persistence is wired.
- [x] Use verification states Pending, Verified and Rejected. TinyFish-discovered organizations begin as “Discovered – Pending Verification” and cannot be treated as verified automatically.

## 7. TinyFish discovery integration
- [x] Implement a backend-only Discover NGOs service accepting city, area/locality, organization type and keywords.
- [x] Use the official TinyFish Search contract: `GET https://api.search.tinyfish.ai`, `X-API-Key`, query parameters for intent/location/language/domain filters, and normalized result fields for title/snippet/url/domain.
- [x] Keep `TINYFISH_API_KEY` exclusively on the backend; validate inputs, handle timeouts/errors, avoid unnecessary repeat calls and never fabricate missing data.
- [x] Show loading, error, empty, retry, result cards, discovery status and search history. If credentials are missing, show a configuration/setup message instead of fabricated live results.
- [x] Support discovery wording for restaurants, hotels, bakeries, college canteens, catering services and event venues; the demo stores normalized records in memory with source URL and discovery timestamp, while durable search history remains a persistence follow-up.

## 8. Matching, maps and notifications
- [x] Implement transparent rule-based matching using valid geographic distance, NGO capacity, pickup availability and remaining safe collection time, with visible matching reasons; do not claim machine learning.
- [x] Provide an interactive volunteer delivery map with Leaflet/OpenStreetMap tiles, pan/zoom, pickup/NGO markers, browser geolocation, OSRM road geometry, route distance/duration, stage-aware navigation, mobile layout and list/error fallback using only confirmed coordinates. A Google Maps primary adapter remains optional.
- [ ] Persist recipient-targeted in-app notifications and read/mark-read handling is live for request, acceptance and assignment events; pickup, delivery, completion and verification-event notifications remain to be emitted from every transition.

## 9. Impact analytics
- [x] Build charts and visual indicators for total food rescued kg, meals donated, successful donations, verified NGOs, active donors, volunteers and distribution trends in the demo admin workspace.
- [x] Calculate headline metrics from completed demo donation records and distinguish estimated/demo metrics from verified production measurements. Trend history remains labeled demo data until persisted distribution records exist.

## 10. Persistence, schema and safety
- [x] Add normalized PostgreSQL-compatible/Supabase SQL schema for users, donor_profiles, ngo_profiles, volunteer_profiles, donations, donation_requests, volunteer_assignments, notifications, discovered_organizations, ngo_verifications, distribution_records, impact_statistics and reports.
- [x] Include primary/foreign keys, timestamps, indexes, status constraints, role relationships, donor safety/deadline checks, coordinate checks and Row Level Security coverage for all listed user-facing tables; production policies still need to be authored against `auth.uid()`.
- [x] Keep food safety fields and donor/NGO collection/distribution confirmation fields. Support applicable Indian FSSAI surplus-food requirements without asserting legal certification.

## 11. Engineering and delivery
- [x] Finish the Supabase Authentication boundary and Supabase repository adapter. The current stack is React, TypeScript, Vite, Node.js, Express, Zod and Recharts with no in-memory demo repository.
- [x] Include modular APIs, input validation, server authorization checks, error/loading/empty states, environment configuration, schema, reusable UI components and `.env.example` with no real credentials.
- [x] Include `public/manus-routes.json`, README setup/run instructions, TinyFish status, environment variables, database setup and remaining configuration requirements.
- [x] Run diagnostics, build checks, API workflow checks and preview visual validation; do not enable auto-publish.
