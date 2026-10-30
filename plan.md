# FoodLoop AI implementation plan

## Product shape

FoodLoop AI is delivered as a responsive React + TypeScript application served by an Express backend. The application has a public landing page, authenticated role-based application shell, four role dashboards, NGO discovery, impact analytics, persistent notifications, interactive route maps, a profile/settings surface and coordinate/radius-based NGO finding. It never falls back to fabricated demo records when credentials are absent.

## Implementation approach

- **Frontend:** Vite-powered React and TypeScript SPA with React Router, Tailwind CSS, Lucide icons, Recharts, responsive layout primitives, accessible form controls, and reusable cards/badges/table components.
- **Backend:** Express API with Zod request validation, bearer-token Supabase session verification, server-side role checks, ownership checks, atomic donation request/acceptance/assignment functions, rule-based matching, TinyFish discovery service, and explicit configuration errors. The API never exposes `TINYFISH_API_KEY`.
- **Persistence:** Supabase is the only application data source. The committed SQL schema covers users, role profiles, donations, requests, assignments, notifications, discovered organizations, verifications, distributions, impact statistics, and reports, with keys, timestamps, indexes, status constraints, RLS policies and workflow RPCs.
- **External discovery:** TinyFish Search will use the documented `GET https://api.search.tinyfish.ai` endpoint and `X-API-Key` header. Searches will accept city, area, organization type, and keywords; results will be normalized without fabricating missing values and stored as pending verification. Fetch enrichment is optional and isolated behind the same backend service. If the key is absent, the UI will show a configuration state rather than pretending live search works.
- **Maps:** The first implementation will use coordinate-aware location cards and an OpenStreetMap-ready map panel with a fallback list view if a map provider is not configured. Distances will be computed only when valid coordinates exist.
- **Authentication:** Supabase email/password registration and login create an application profile, persist a role, return a bearer session, and require an administrator invitation token for admin registration. Production authorization is enforced in the API layer, and protected routes redirect or return 403 rather than trusting URL changes.
- **Analytics:** Metrics are derived from persisted donations/distribution records. If the database is unavailable, the UI shows an honest configuration/authentication state rather than invented totals.

## Design direction

### Candidate styles

- **Harvest Ledger editorial** — 0.07 probability: warm editorial nonprofit storytelling with ledger-like data panels.
- **Civic Garden utility** — 0.08 probability: calm civic-tech surfaces with botanical linework and practical task cards.
- **Shared Table modernism** — 0.06 probability: generous cream canvas, forest-green anchors, and communal rounded modules.

**Chosen style: Shared Table modernism.**

- **Design movement:** Contemporary social-impact product design with the warmth of modern editorial food packaging.
- **Core principles:** human-first clarity, visible trust signals, calm operational density, and hopeful but grounded storytelling.
- **Color philosophy:** forest green signals action and reliability; sage softens the interface; warm cream creates hospitality; orange marks urgency and food-safety deadlines; charcoal keeps long operational copy legible.
- **Layout paradigm:** an asymmetric editorial flow with an offset hero, left-anchored section labels, and dashboard modules that feel like a coordinated table rather than a grid of unrelated widgets.
- **Signature elements:** a small leaf-loop mark in the wordmark, orange “rescue window” pills for deadlines, and a recurring stitched route motif connecting donor, NGO, and volunteer steps.
- **Interaction philosophy:** interactions should feel like handoffs—clear next actions, reassuring confirmations, and status changes that explain what happened rather than merely changing color.
- **Animation:** use short ease-out fades and 8–12px slide-ins for cards, subtle number-count transitions only for dashboard summaries, and no looping motion that competes with food-safety or pickup deadlines.
- **Typography system:** Fraunces for large humanist headlines and Inter for navigation, labels, body copy, and data. Use generous line-height in editorial sections and compact 12–13px metadata in operational cards.
- **Brand essence:** a trusted coordination layer that helps local food move safely from surplus to shared meals; caring, practical, transparent.
- **Brand voice:** direct, neighborly, and evidence-led. Example lines: “A safe meal is waiting for a route.” “Every pickup closes a small gap between surplus and need.”
- **Wordmark & logo:** a compact looped-leaf symbol that forms an abstract F beside the FoodLoop AI wordmark; keep it simple enough to work as a favicon and dashboard avatar.
- **Signature brand color:** FoodLoop Forest `#173F35`.

## Planned project structure

```text
foodloopai/
├── client/
│   ├── src/
│   │   ├── components/       # shared UI, shell, status, cards, charts
│   │   ├── data/             # static presentation copy only
│   │   ├── lib/              # API client, formatting, matching helpers
│   │   ├── pages/            # landing, auth, dashboards, discovery
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── styles.css
│   └── index.html
├── server/
│   ├── services/             # Supabase repository/auth, TinyFish, matching
│   ├── routes/               # auth, donations, discovery, analytics, admin
│   ├── db/                   # schema and persistence adapter
│   └── index.ts
├── public/manus-routes.json
├── supabase/schema.sql
├── .env.example
├── README.md
├── TODO.md
└── plan.md
```

## Build workflow

1. Establish package scripts, diagnostics, routing manifest, environment template, schema, and the shared design system.
2. Implement the public landing page and authenticated application shell with role-derived access.
3. Add donor, NGO, volunteer, and admin dashboard views around the shared repository model.
4. Add Express routes for donation lifecycle, requests, assignments, notifications, matching, impact, and discovery.
5. Add TinyFish Search integration using the documented contract plus setup/error states.
6. Add Supabase authentication/persistence, atomic SQL workflow functions, RLS, profiles and README setup instructions.
7. Start the preview server, verify route manifest and build, inspect diagnostics, and checkpoint the working version.

## Constraints and honest status

The TinyFish API key and Supabase credentials are not present in the current project configuration, so discovery and authenticated workflows surface setup messages until the corresponding variables are supplied. No production claim is made for FSSAI compliance without applicable operational review. Maps render only confirmed coordinates and live routing responses.
