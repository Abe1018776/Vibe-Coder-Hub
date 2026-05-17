# Hebrew translation & i18n — design

**Status:** approved (design phase complete, ready for implementation plan)
**Date:** 2026-05-17

## Goal

Make the public-facing site bilingual (English + Hebrew) with a per-user language switcher, RTL layout when Hebrew is active, and browser-locale-driven default for first-time visitors. The admin dashboard stays English-only.

## Non-goals

- Translating user-supplied content stored in the database (freelancer bios, gig titles, showcase project names, competition descriptions) — those stay in the language the user wrote them.
- Translating API JSON payloads — only the rendered UI.
- Translating the admin dashboard (`/admin/**`).
- A CMS / translation-management workflow — translations live in version-controlled JSON files.
- SEO via per-locale URLs — we are explicitly using cookie-based locale switching with shared URLs (acknowledged tradeoff).

## Decisions (locked from brainstorming)

| Question | Decision |
|---|---|
| Library | `next-intl` (no i18n routing mode) |
| URL strategy | Same URLs for both locales; cookie-driven |
| Default locale | Resolved from `Accept-Language` header; falls back to `en` |
| RTL | Full RTL layout when locale is `he` |
| Coverage | Public pages only; admin stays English |
| Clerk widgets | Use `@clerk/localizations` (`heIL` / `enUS`) |
| Font | Add `Noto Sans Hebrew` fallback alongside existing `Inter` |

## Architecture

```
Request flow
────────────
                                 ┌─────────────────────────┐
HTTP request ───► root layout ──►│ resolveLocale()         │
                                 │  1. cookie NEXT_LOCALE  │
                                 │  2. Accept-Language     │
                                 │  3. fallback "en"       │
                                 └──────────┬──────────────┘
                                            │ locale: "en" | "he"
                                            ▼
                  ┌──────────────────────────────────────────────┐
                  │ <html lang={locale} dir={locale==="he"?...}> │
                  │   <ClerkProvider localization={…}>           │
                  │     <NextIntlClientProvider messages={…}>    │
                  │       {children}                             │
                  │     </NextIntlClientProvider>                │
                  │   </ClerkProvider>                           │
                  │ </html>                                       │
                  └──────────────────────────────────────────────┘

User picks language ──► server action setLocale(locale)
                          ├─ writes NEXT_LOCALE cookie
                          └─ revalidatePath("/", "layout")
                          (next request re-renders with new locale)
```

## Components & files to add

| Path | Purpose |
|---|---|
| `messages/en.json` | English translations, source of truth shape |
| `messages/he.json` | Hebrew translations |
| `src/i18n/request.ts` | next-intl server config — loads messages for the resolved locale |
| `src/lib/i18n/locale.ts` | `resolveLocale()` server helper (cookie → Accept-Language → fallback) |
| `src/lib/i18n/actions.ts` | `setLocale(locale)` server action |
| `src/components/LocaleSwitcher.tsx` | Client dropdown that calls the server action |
| `src/components/DirIcon.tsx` | Tiny helper to render direction-aware arrows |

## Components & files to modify

| Path | Change |
|---|---|
| `package.json` | Add `next-intl`, `@clerk/localizations` |
| `tsconfig.json` | Add next-intl TS plugin entry for typed message keys |
| `next.config.ts` | Wrap config with `createNextIntlPlugin('./src/i18n/request.ts')` |
| `src/app/layout.tsx` | Resolve locale, set `<html lang dir>`, wrap with `NextIntlClientProvider`, localize Clerk |
| `src/app/globals.css` | Add Noto Sans Hebrew import; update body font-family chain |
| `src/components/PublicHeader.tsx` | Replace hardcoded labels with `t()`, mount `<LocaleSwitcher />`, swap to logical Tailwind utilities |
| `src/app/(public)/**/*.tsx` | Replace hardcoded strings with `t()`; swap physical → logical Tailwind utilities; swap direction-aware icons |
| `src/app/gigs/public/**`, `src/app/gigs/thread/**` | Same as above |
| `src/app/competitions/public/**` | Same as above |
| `src/app/sign-in/**`, `src/app/sign-up/**` | Same as above (Clerk widget itself translated via `localization` prop) |
| `src/app/not-found.tsx` | Same as above |

## Locale resolution rules

```ts
async function resolveLocale(): Promise<"en" | "he"> {
  const cookieVal = (await cookies()).get("NEXT_LOCALE")?.value;
  if (cookieVal === "he" || cookieVal === "en") return cookieVal;

  const accept = (await headers()).get("accept-language") ?? "";
  if (/^\s*he\b/i.test(accept) || /[,;]\s*he\b/i.test(accept)) return "he";
  return "en";
}
```

- The cookie is set only when the user *explicitly* picks a language via the switcher — first-time visitors are routed purely by `Accept-Language`.
- The locale union is `"en" | "he"`; any other cookie value is ignored (defensive against tampering).
- Cookie attributes: `Path=/`, `Max-Age=31536000` (1 year), `SameSite=Lax`, no `HttpOnly`.

## Translation file structure

```
messages/
  en.json   ← canonical shape; TS plugin uses it to type-check keys
  he.json   ← same shape, Hebrew values
```

Top-level namespaces:

```
common         shared: buttons, statuses, form labels
header         PublicHeader nav + auth buttons
landing        / (hero, features, CTA, social proof)
freelancers    /freelancers + /freelancers/[id]
directory      /directory
showcase       /showcase
competitions   /competitions + /competitions/public/[slug]
gigs           /gigs/public/[slug] + /gigs/thread/[token]
docs           /docs
notFound       /not-found
auth           sign-in/sign-up wrapper text
errors         form validation, server error messages
```

Conventions:
- camelCase dot-separated keys: `landing.hero.title`
- One key per visible string — no in-code concatenation
- ICU placeholders for variables: `"social.builders": "{count, plural, one {# builder} other {# builders}}"`
- Dates / numbers via next-intl's `useFormatter()`, never hand-formatted

Terminology (Hebrew):

| English | Hebrew |
|---|---|
| Vibe Coder Hub | Vibe Coder Hub (brand stays Latin) |
| Builder / Vibe Coder | מפתח |
| Showcase | תצוגה |
| Competition | תחרות |
| Gig | ג'וב |
| Directory | מדריך |
| Docs | תיעוד |
| Sign in / Sign up | התחברות / הרשמה |
| Dashboard | לוח בקרה |

## Language switcher

- Client component in `src/components/LocaleSwitcher.tsx`
- shadcn `DropdownMenu` (already installed), `Languages` icon from lucide
- Trigger displays current locale: `EN` for English, `עב` for Hebrew
- Two menu items, each calls `setLocale(locale)` server action
- `useTransition` for a pending state so the dropdown disables while the action runs
- Mounted in `PublicHeader.tsx`:
  - Desktop: to the left of Sign In / User button
  - Mobile: top of the slide-out menu

## RTL handling

Set `dir` on `<html>` based on resolved locale. Migrate physical Tailwind utilities to logical ones in all public-facing files:

| Physical | Logical |
|---|---|
| `ml-*`, `mr-*` | `ms-*`, `me-*` |
| `pl-*`, `pr-*` | `ps-*`, `pe-*` |
| `text-left`, `text-right` | `text-start`, `text-end` |
| `left-*`, `right-*` | `start-*`, `end-*` |
| `border-l*`, `border-r*` | `border-s*`, `border-e*` |
| `rounded-l*`, `rounded-r*` | `rounded-s*`, `rounded-e*` |

Tailwind v4 (already installed) supports all of these natively.

**Direction-aware icons**: introduce `<DirIcon ltr={...} rtl={...} />` for arrow / chevron CTAs; ~10 occurrences to update by hand.

**Skip**: `src/app/admin/**` (stays LTR), shadcn primitives shared with admin unless they hold obviously LTR-only utilities.

**Code blocks / IDs**: any element that holds Latin-only content inside Hebrew prose gets an explicit `dir="ltr"`.

## Font

- Keep `Inter` for Latin glyphs.
- Add `Noto Sans Hebrew` from Google Fonts.
- Body font-family chain: `Inter, "Noto Sans Hebrew", system-ui, sans-serif` — the browser picks the right glyph per script.

## Clerk integration

```tsx
import { heIL, enUS } from "@clerk/localizations";

<ClerkProvider localization={locale === "he" ? heIL : enUS}>
```

Clerk's sign-in / sign-up widget content (form labels, errors, OAuth buttons) is translated by the library. We only need to translate our wrapper page chrome.

## Error & validation messages

- Server-thrown user-facing errors (in `/api/**` routes the public site hits): return error *keys*, not strings, when the response is surfaced in the UI. The client looks them up via the `errors` namespace.
- Zod validation messages on public forms: translate via Zod's error map; map zod issue codes to keys in the `errors` namespace.
- Defensive note: admin API errors keep English strings — admin UI doesn't pass them through `t()`.

## Missing-translation handling

- **Dev**: log warning to the server/browser console, fall back to the key string (loud, makes gaps obvious).
- **Prod**: silently fall back to the English value (graceful).
- Configured via `getRequestConfig` + `onError` in `src/i18n/request.ts`.

## Testing & rollout

**Type safety**
- `pnpm typecheck` passes — next-intl TS plugin enforces that every `t('x.y')` call references a real key in `en.json`.

**Build verification**
- `pnpm build` succeeds with no missing-translation warnings (run with `NODE_ENV=production` so the dev warnings don't trip the script).

**Manual smoke (run with `pnpm dev`)**

Test matrix:

| Step | EN expected | HE expected |
|---|---|---|
| Visit `/` with `Accept-Language: he` (and no cookie) | n/a | Hebrew, RTL |
| Visit `/` with `Accept-Language: en` | English, LTR | n/a |
| Open switcher, pick Hebrew | — | Page reloads in Hebrew, RTL |
| Open switcher, pick English | English, LTR | — |
| Reload page after picking | Locale persists (cookie) | Locale persists (cookie) |
| `/freelancers`, `/directory`, `/showcase`, `/competitions`, `/docs`, `/gigs/public/<seed-slug>`, `/sign-in`, `/sign-up`, any unknown URL (not-found page) | All English, LTR | All Hebrew, RTL |
| Forms with validation (e.g. competition submission) | EN error messages | HE error messages |
| Admin pages (`/admin`) | English always, LTR always (regardless of cookie) | English, LTR (unchanged) |
| Arrows in CTAs | Point right (→) | Point left (←) |
| Numbers in counters | LTR digits inside RTL paragraph | LTR digits inside RTL paragraph |

**Visual checks**
- No clipped layouts, no overlapping elements
- Tooltips/popovers anchor correctly on both sides
- Mobile menu open/close from the correct side
- Clerk sign-in widget reads naturally in Hebrew

**Regression checks**
- Admin pages render and function identically pre/post change
- API routes return unchanged JSON shapes
- Existing tests pass (project currently has none — confirm `pnpm typecheck` + `pnpm lint` pass)

## Risks

- **Translation quality**: I'll author Hebrew strings; user (native speaker) should review the final `he.json` before merge.
- **Tailwind logical-utility migration**: mostly mechanical, but visual regressions are possible in admin-adjacent shared components. Mitigated by limiting scope to public files and skipping shadcn primitives unless they're broken.
- **Cookie + edge caching**: shared-URL locales mean any CDN cache key must include the cookie or `Accept-Language`. Vercel respects the `Vary` header — confirm `Vary: Cookie, Accept-Language` is set on responses that render localized content (next-intl handles this automatically via its server-side resolution path; verify in `pnpm build` output).
- **SEO**: shared URLs across locales is intentional but does mean Google won't index Hebrew separately. Acknowledged tradeoff; revisit only if Hebrew SEO becomes a goal.

## Out-of-scope follow-ups (do not implement now)

- Admin dashboard translation
- DB-stored content translation
- Per-locale URLs / `hreflang` SEO setup
- Additional languages (Arabic, Russian)
- Translation-management tooling
