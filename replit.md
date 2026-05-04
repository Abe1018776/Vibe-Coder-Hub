# Vibe Coder Marketplace

Internal Upwork-style platform for AI-native builders (Vibe coders using Replit, Cursor, Lovable, etc.). Features a gig board, freelancer CRM, availability board, product showcase, and private per-applicant conversation threads with Clerk authentication and voice note support.

## Architecture

pnpm workspace monorepo using TypeScript throughout.

### Artifacts
- **`artifacts/api-server`** — Express 5 REST API (port 8080), handles all data + object storage + Clerk middleware
- **`artifacts/vibe-marketplace`** — React + Vite SPA, served under `/vibe-marketplace` base path

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
- **Frontend**: React 19, Vite 7, TanStack Query, shadcn/ui, Tailwind CSS v4, wouter routing
- **Auth**: Clerk (`@clerk/express` + `@clerk/react`) with proxy middleware
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
# (Use push-force for destructive changes)
pnpm --filter @workspace/db run push-force

# Build API server
pnpm --filter @workspace/api-server run build
```

## DB Schema (lib/db/src/schema/)
- `gigs.ts` — Gigs (task/hourly/build types, status, tags, recordings, publicSlug)
- `gigReplies.ts` — Legacy flat replies (kept for backward compat)
- `gigConversations.ts` — Private per-applicant conversation thread (gigId, freelancerName, email, threadToken)
- `gigMessages.ts` — Messages in a conversation (senderType: poster|freelancer, content, voiceNotePath)
- `freelancers.ts` — Freelancer profiles (skills, tools, avatar, portfolio)
- `availabilitySlots.ts` — Time slots posted by freelancers for booking
- `showcaseProjects.ts` — Product Hunt-style project cards with upvotes
- `tags.ts` — Tags with categories (tool/skill/gig_type/general)

## API Routes (artifacts/api-server/src/routes/)
- `gigs.ts` — CRUD gigs + legacy replies (GET/POST/PUT/DELETE)
- `conversations.ts` — Private thread endpoints (see below)
- `freelancers.ts` — CRUD freelancers with search
- `availability.ts` — CRUD availability slots with booking
- `showcase.ts` — CRUD showcase projects + upvote
- `tags.ts` — CRUD tags
- `stats.ts` — Dashboard stats + recent activity feed
- `storage.ts` — Object storage upload URL request + file serving
- `health.ts` — Health check

### Conversation endpoints (conversations.ts)
- `POST /api/gigs/public/:slug/apply` — No auth. Creates a conversation + initial message. Returns `{ threadToken, conversationId }`.
- `GET /api/thread/:token` — No auth. Freelancer fetches their thread (includes gig title + all messages).
- `POST /api/thread/:token/messages` — No auth. Freelancer sends a follow-up message.
- `GET /api/gigs/:id/conversations` — **Auth required**. Poster lists all applicant conversations for a gig.
- `POST /api/conversations/:id/messages` — **Auth required**. Poster replies to a specific conversation.

## Frontend Pages (artifacts/vibe-marketplace/src/pages/)
### Protected (requires Clerk sign-in)
- `Dashboard.tsx` — Stats cards + recent activity feed (`/`)
- `GigBoard.tsx` — Filterable gig list (`/gigs`)
- `CreateGig.tsx` — Post new gig form with screen recording upload (`/gigs/new`)
- `GigDetail.tsx` — Admin gig view with applicant ConversationPanel, WhatsApp share, status control (`/gigs/:id`)
- `Freelancers.tsx` — Searchable freelancer grid (`/freelancers`)
- `CreateFreelancer.tsx` — Add freelancer form with avatar upload (`/freelancers/new`)
- `FreelancerProfile.tsx` — Freelancer detail + availability slots (`/freelancers/:id`)
- `Availability.tsx` — Availability board with booking dialog (`/availability`)
- `Showcase.tsx` — Product Hunt-style showcase with upvotes (`/showcase`)
- `Tags.tsx` — Tag management (`/tags`)

### Public (no auth)
- `GigPublicBySlug.tsx` — Public shareable gig page at `/gigs/public/:slug`. Application form with voice note recording. On submit returns a private thread link the freelancer must save.
- `GigPublic.tsx` — Legacy public gig by numeric id (`/gigs/:id/public`)
- `GigThread.tsx` — Freelancer's private thread view at `/gigs/thread/:token`. Shows full message history, allows follow-up replies (text + voice note). Polls every 10 seconds.
- Sign-in / Sign-up — Clerk-powered auth pages at `/sign-in` and `/sign-up`

## Authentication (Clerk)

- Clerk app provisioned via `setupClerkWhitelabelAuth`
- Env vars: `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PROXY_URL`
- API server uses `@clerk/express` `clerkMiddleware` + `getAuth()` on protected routes
- Clerk JS proxy middleware mounted at `/api/__clerk` (active in production only)
- Frontend: `ClerkProvider` wraps all routes; `Show when="signed-in"` guards the dashboard
- Public routes: `/gigs/public/:slug`, `/gigs/thread/:token`, `/sign-in/*`, `/sign-up/*`

## Important Notes

### Orval codegen quirk
After running `pnpm --filter @workspace/api-spec run codegen`, `lib/api-zod/src/index.ts` gets an extra line added (`export * from "./generated/api.schemas"`). This file doesn't exist — it must be reset to just `export * from "./generated/api";` before typechecking.

### Object storage
Presigned upload URLs: `POST /api/storage/upload-url` with `{fileName, contentType, isPublic}`
File serving: `GET /api/storage/objects/{path}`

### Thread link security model
When a freelancer applies via the public gig page, the API creates a conversation with a random 16-char `threadToken` (nanoid). The response includes this token. The freelancer page shows the token as a full URL they must bookmark — there is no account required. The token is the only credential; losing it means losing access to the thread.

### WhatsApp share
The share button on `/gigs/:id` opens `wa.me/?text=...` with a pre-filled message including the public page URL (`/gigs/public/:slug`).

### DB compilation
The `lib/db` package uses TypeScript project references. After adding new schema files, run `pnpm --filter @workspace/db exec tsc -p tsconfig.json` to regenerate declaration files before the api-server typecheck will see the new exports.
