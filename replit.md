# Vibe Coder Marketplace

Internal Upwork-style platform for AI-native builders (Vibe coders using Replit, Cursor, Lovable, etc.). Features a gig board, freelancer CRM, availability board, product showcase, and shareable public reply pages with voice note support.

## Architecture

pnpm workspace monorepo using TypeScript throughout.

### Artifacts
- **`artifacts/api-server`** — Express 5 REST API (port 8080), handles all data + object storage
- **`artifacts/vibe-marketplace`** — React + Vite SPA (port 22512), served at `/`

### Shared libs
- **`lib/db`** — Drizzle ORM schema + PostgreSQL client
- **`lib/api-spec`** — OpenAPI spec (`openapi.yaml`) + Orval codegen config
- **`lib/api-client-react`** — Generated React Query hooks from OpenAPI spec
- **`lib/api-zod`** — Generated Zod validators from OpenAPI spec

## Stack
- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec in `lib/api-spec/openapi.yaml`)
- **Frontend**: React 19, Vite 7, TanStack Query, shadcn/ui, Tailwind CSS, wouter routing
- **Object storage**: Google Cloud Storage (via env `DEFAULT_OBJECT_STORAGE_BUCKET_ID`)
- **Build**: esbuild (API server bundle)

## Key Commands

```sh
# Run codegen (must fix lib/api-zod/src/index.ts after — see below)
pnpm --filter @workspace/api-spec run codegen

# IMPORTANT: after codegen, reset api-zod index
echo 'export * from "./generated/api";' > lib/api-zod/src/index.ts

# Typecheck all libs
pnpm -w run typecheck:libs

# Push DB schema
pnpm --filter @workspace/db run push

# Build API server
pnpm --filter @workspace/api-server run build
```

## DB Schema (lib/db/src/schema/)
- `gigs.ts` — Gigs (task/hourly/build types, status, tags, recordings)
- `gigReplies.ts` — Replies to gigs (text + voice note path)
- `freelancers.ts` — Freelancer profiles (skills, tools, avatar, portfolio)
- `availabilitySlots.ts` — Time slots posted by freelancers for booking
- `showcaseProjects.ts` — Product Hunt-style project cards with upvotes
- `tags.ts` — Tags with categories (tool/skill/gig_type/general)

## API Routes (artifacts/api-server/src/routes/)
- `gigs.ts` — CRUD gigs + replies (GET/POST/PUT/DELETE)
- `freelancers.ts` — CRUD freelancers with search
- `availability.ts` — CRUD availability slots with booking
- `showcase.ts` — CRUD showcase projects + upvote
- `tags.ts` — CRUD tags
- `stats.ts` — Dashboard stats + recent activity feed
- `storage.ts` — Object storage upload URL request + file serving
- `health.ts` — Health check

## Frontend Pages (artifacts/vibe-marketplace/src/pages/)
- `Dashboard.tsx` — Stats cards + recent activity feed (`/`)
- `GigBoard.tsx` — Filterable gig list (`/gigs`)
- `CreateGig.tsx` — Post new gig form with screen recording upload (`/gigs/new`)
- `GigDetail.tsx` — Admin gig view with WhatsApp share, replies, status control (`/gigs/:id`)
- `GigPublic.tsx` — Public shareable gig page, no auth, voice note reply form (`/gigs/:id/public`)
- `Freelancers.tsx` — Searchable freelancer grid (`/freelancers`)
- `CreateFreelancer.tsx` — Add freelancer form with avatar upload (`/freelancers/new`)
- `FreelancerProfile.tsx` — Freelancer detail + availability slots (`/freelancers/:id`)
- `Availability.tsx` — Availability board with booking dialog (`/availability`)
- `Showcase.tsx` — Product Hunt-style showcase with upvotes (`/showcase`)
- `Tags.tsx` — Tag management (`/tags`)

## Important Notes

### Orval codegen quirk
After running `pnpm --filter @workspace/api-spec run codegen` (or orval directly), `lib/api-zod/src/index.ts` gets an extra line added (`export * from "./generated/api.schemas"`). This file doesn't exist — it must be reset to just `export * from "./generated/api";` before typechecking.

### Object storage
Presigned upload URLs: `POST /api/storage/upload-url` with `{fileName, contentType, isPublic}`
File serving: `GET /api/storage/objects/{path}`

### Public gig page
`/gigs/:id/public` renders without the sidebar layout — it's a standalone shareable page designed for WhatsApp links. No authentication required. Supports text + in-browser voice note recording via MediaRecorder API.

### WhatsApp share
The share button on `/gigs/:id` opens `wa.me/?text=...` with a pre-filled message including the public page URL (`/gigs/:id/public`).
