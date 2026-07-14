# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Wazwan Way (repo/package name `kashmir-food-finder`) is a premium tourism web app for discovering Kashmiri dishes, restaurants, destinations, treks/camps, scenic drives, and cultural food guides — with a streaming AI concierge ("Waza AI") and a gamified XP/level system. Production runs at **wazwanway.com** (frontend on Vercel, backend on Render, MongoDB Atlas). The same frontend also ships as an Android app via Capacitor.

---

## 1. Tech Stack

**Frontend** (`frontend/`)
- **Next.js 14** (App Router) + **React 18**, JavaScript (not TypeScript).
- **Tailwind CSS 3** + route-scoped plain CSS + one CSS Module. Hybrid styling.
- **framer-motion 12** for animation/choreography; **lucide-react** icons; **react-markdown** for AI output; **nextjs-toploader** for the top progress bar; **jsonrepair** for tolerant JSON parsing of AI responses.
- **Capacitor 8** wraps the web build as an Android app.
- **Vitest** for tests; `@next/bundle-analyzer`; **sharp** for build-time image compression.

**Backend** (`backend/`)
- **Node.js (ESM, `"type": "module"`)** + **Express 4**.
- **MongoDB** via **Mongoose 8**.
- **jsonwebtoken** (JWT in httpOnly cookies), **bcryptjs**, **csrf-csrf** (double-submit CSRF), **express-mongo-sanitize**, **express-rate-limit** + **rate-limit-redis** + **ioredis**, **zod** (validation), **multer** + **file-type** (uploads with magic-byte checks).
- **openai** SDK pointed at **OpenRouter** (Waza AI LLM calls), **resend** (transactional email), **node-cache** (in-process caching).

**Repo root** also holds a large pile of **one-off scraper/converter/patch scripts and scratch HTML/image assets** (`fix*.js`, `convert*.js`, `*.html`, `*.png`, `standalone-home.html`, `full-homepage.html`). These are ad-hoc tooling and design scratch, **not part of the app build** — ignore them unless a task explicitly names one.

---

## 2. Commands

Run these from the specific app directory, not the repo root, unless noted.

**Frontend** (`cd frontend`)
- `npm run dev` — Next dev server with Turbo on :3000
- `npm run build` / `npm start` — production build / serve
- `npm test` — Vitest once; `npm run test:watch` — watch mode
- Single test: `npx vitest run lib/imageProvider.test.js` or `npx vitest -t "test name"`
- `ANALYZE=true npm run build` — bundle analyzer
- `npm run cap-sync` — sync web build into the Capacitor Android project

**Backend** (`cd backend`)
- `npm run dev` — `node --watch src/server.js` on :5000
- `npm start` — production server
- `npm run seed` — seed the DB (`src/scripts/seed.js`)
- Tests use Node's built-in runner: `node --test src/tests/explorer.test.js` (⚠️ connects to a real MongoDB)

**There is no lint command configured** in either package (no ESLint/Prettier script). "Linting" for this repo means matching existing style; do not invent a lint step. The repo root `package.json` proxies a few scripts (`npm run dev` → backend, `npm run dev:frontend`, `npm run seed`) but prefer running inside the app directory.

**Only two real test files exist:** `backend/src/tests/explorer.test.js` (gamification, integration-style against Mongo) and `frontend/lib/imageProvider.test.js` (Vitest unit). There is no CI test gate.

---

## 3. Folder Structure

```
backend/src/
  config/        db.js (Mongoose), redis.js (ioredis, optional), openrouter.js, explorerConfig.js (XP rules)
  controllers/   exploreController.js, collectionController.js  (only these two use controllers; rest inline in routes)
  data/          seedData.js (~127 dishes, ~14 restaurants, ~20 destinations), exploreSeedData.js (trails/collections/metadata)
  Knowledge/     kashmir-knowledge-base.md  (Waza AI RAG source, loaded once at startup)
  middleware/    auth.js, admin.js, validate.js, rateLimiter.js, errorMiddleware.js
  models/        14 Mongoose models (see §4)
  routes/        one *Routes.js per domain, mounted at /api/<domain>
  scripts/       seeders, slug backfills, migrations, one-off data fixes (see below)
  utils/         asyncHandler, createToken, explorer (gamification), sendEmail, sendSMS, metrics, rateLimitKeys, validation
  validations/   Zod schemas (auth/dish/restaurant/agency/chat/common)
  server.js      app bootstrap + middleware pipeline

frontend/
  app/           App Router routes; pattern is page.js (Server) + *Client.js (Client). Route-scoped CSS lives beside pages.
    api/proxy/[...path]/route.js   Node serverless proxy (see §5) — critical, do not remove
    api/chat, api/booking          other route handlers
    layout.js      global providers + chrome + fonts + metadata
    globals.css, shared-tokens.css  design tokens (see §6)
  components/    ~85 components (nav, cards, modals, WazaAI widget, image/skeletons, route-specific editorial folders)
  context/       AuthContext.js (useAuth), MobileNavigationContext.js (useMobileNavigation)
  hooks/         useDebounce.js, useIntersectionObserver.js
  lib/           api.js (client data layer), imageProvider.js + providers/, imageUtils.js, partnersData.js, blog/guide data
  data/          static JSON/JS mirrors (dishes.json, blogPosts.js, wazwanGuides.js, scenicDrivesData.js, etc.)
  scripts/       build-time image optimization utilities (.mjs/.js)
```

`backend/src/scripts/` categories: **seeding** (`seed.js` — wipes catalog collections but deliberately preserves `users`; `upsertSeed.js`; `seedTreksCamps.js`), **slug/migration** (`backfillAllSlugs.js`, `generateSlugs.js`, `migrateExplorer.js` — resets all XP/events), and **one-off content fixes** (`add_*`, `classify_dishes*`, `prune_street_food.js`, etc.). Diagnostics: `findAnyById.js`, `printAllCollections.js`, `exportIds.js`, `testEmail.js`.

---

## 4. Database Models

14 Mongoose models. All use `{ timestamps: true }` except `ExplorerEvent` (custom `createdAt`). A duplicated `slugify()` helper + a `pre("save")` hook auto-generates `slug` (unique + sparse) on most content models.

**User** — the hub. `name`, `email` (unique, lowercase), `password` (bcrypt-hashed in `pre("save")`, cost 10; `comparePassword()` instance method), `phoneNumber` (unique), `isAdmin` (bool), `role` (`user`|`agent`|`admin`), `isVerified`, `otp`/`otpExpiresAt`, `tokenVersion` (refresh-token revocation). Embeds `favorites[]` (polymorphic → Dish/Restaurant via `itemTypeModel` refPath), `savedRoutes[]` (slug strings). Gamification: `totalXP`, `dailyStreak`, `lastDailyLogin`, `lastDailyAIXP`, `achievements[]`, `challenges[]`.

**Catalog entities** (the four "things to experience") share a scoring triad — `authenticityScore`, `touristFriendlinessScore`, `luxuryScore` (each 1–5):
- **Dish** — `category` (enum: Wazwan/Street Food/Cafes/Budget Eats/Luxury Dining), `categoryType` (wazwan/kashmiri_cuisine/bakery/beverage), `courseType`, `foodType` (Veg/Non-veg), plus `history`, `touristTip`, `spiceLevel`, `popularityRating`. Indexed on popularity/category/foodType/categoryType/courseType. **Name is NOT unique** (only slug is).
- **Restaurant** — `city`, `priceLevel` (Budget/Mid-range/Luxury), `rating`, `linkedDishes[]` → Dish (the one explicit catalog↔catalog many-to-many), `googleMapsQuery`, tourist-trap flags. Name not unique.
- **Destination** — `location`, `bestSeasons[]`, and a rich embedded `metrics` object (crowdLevel, roadCondition, network, family/couple/kid/elderly-friendly, bbqAllowed, campingPossible, photographyScore, trekkingDifficulty, budgetLevel, etc.). Name unique.
- **Trail** — `type` (FOOD_TRAIL/ROAD_TRIP/WALKING_TRAIL/PICNIC_TRAIL), `difficulty`, plus scenic-drive/route-atlas fields (`distanceKm`, `roadCondition`, `fuelInfo`, waypoints with elevation + chapter headlines). Title unique.

**Polymorphic aggregation via `refPath`** is the dominant relational pattern — container models curate mixed catalog lists:
- **Collection** — `items[]` → Destination/Restaurant/Trail/Dish (dynamic ref on `items.itemType`).
- **Itinerary** — `creator` → User; `days[].stops[]` → Destination/Restaurant/Trail/Dish. Slug generated **only for public itineraries** (+ random suffix). `isAIGenerated` flag.
- **Trail.stops[]** → Destination/Restaurant/Dish (Trail excluded to avoid self-nesting).

**Adventure landing entities** — **Trek** and **Camp** are near-identical standalone models (name unique, `bgDesktop`/`bgMobile`, elevation, difficulty/remoteness) with no refs.

**Travel-agency subsystem** — **TravelAgency** (`user` → User owner, `verificationStatus`, `isListed`, social/media fields) receives **TravelAgencyInquiry** (`agency` → TravelAgency, tourist booking with `status` workflow) and can be reviewed via **Review**.

**Review** — `user` → User author, plus polymorphic-optional target: either `restaurant` → Restaurant **or** `agency` → TravelAgency (neither required; no enforced XOR). `rating` (1–5) + `comment`. Average rating is recomputed on the target when reviews are written.

**Lead/intake** — **RestaurantLead** (unauthenticated onboarding request, `status` enum, no refs). **ExplorerEvent** — the gamification/XP event log (`userId` → User, `action`, loose polymorphic `entityType`/`entityId`, `xpAwarded`; compound-indexed for per-entity dedup).

---

## 5. API Architecture

### The request path is deliberately indirect — read before touching auth/networking

Auth is **cookie-based** (httpOnly `accessToken` 15m + `refreshToken` 7d) plus **double-submit CSRF**. Making cookies survive on iOS Safari (ITP blocks third-party cookies) forced a specific topology — **do not "simplify" it**:

1. **Web browser** → `frontend/lib/api.js` `resolveApiUrl()` returns `""`, so all calls become **relative** (`/api/proxy/...`).
2. `frontend/app/api/proxy/[...path]/route.js` is a **Node.js serverless function** (NOT an edge rewrite — edge rewrites strip `Set-Cookie`) that proxies to the Express backend and manually re-emits every `Set-Cookie` via `getSetCookie()`, making cookies first-party. It must stay `runtime = "nodejs"` and `dynamic = "force-dynamic"`.
3. **Capacitor native app** hits the backend URL directly (relative paths don't work in a native shell); detected via `window.Capacitor?.isNativePlatform()`.

Consequently `next.config.js` `rewrites()` is intentionally empty, and its CSP `connect-src` allowlist must be updated when adding a new backend/API host.

### `lib/api.js` is the single client-side data layer

All frontend↔backend traffic goes through `request()` / `streamRequest()`. It provides: CSRF token fetch/attach (`x-csrf-token` header on mutations), a **5-min in-memory GET cache with stale-while-revalidate + in-flight dedup** (only for `/dishes`, `/restaurants`, `/destinations`), and automatic **401 → `/auth/refresh` → retry** with a queued-request lock. On refresh failure it dispatches a `session-expired` window event that `AuthContext` listens for. **Use the exported `endpoints` map; don't hardcode paths.** SSE streaming for the AI chat uses `streamRequest`.

### Backend middleware pipeline (`server.js`) — order matters

`cors` (explicit origin allowlist) → `express.json` → `cookieParser` → `mongoSanitize` → `globalSafetyLimiter` → request logger → **CSRF token GET route registered BEFORE `doubleCsrfProtection`** → `doubleCsrfProtection` on `/api` → `optionalAuth` → tiered limiter (`authenticatedLimiter` if `req.user` else `publicLimiter`; `/health` skipped) → feature routers → `errorHandler` last. `app.set("trust proxy", 1)` is required behind Render/Vercel. Static `/api/uploads` is served with `X-Content-Type-Options: nosniff`.

### Routers (all mounted under `/api/<domain>`)

`auth`, `users`, `dishes`, `restaurants`, `destinations`, `reviews`, `stats`, `chat`, `restaurant-leads`, `travel-agencies`, `upload`, `explorer`, `explore`, `collections`, `trails`, `treks`, `camps`. Conventions:
- **Public GETs** for catalog/content (dishes, restaurants, destinations, trails, treks, camps, collections, explore) — accept ObjectId **or** slug on detail routes, and set `Cache-Control: public, max-age=…, stale-while-revalidate=…`.
- **Admin writes** (POST/PUT/DELETE on dishes/restaurants/destinations/leads) via `adminOnly` + `userActionLimiter`.
- **Protected** user routes (favorites, profile, saved routes, reviews write, `/upload`, `/explorer/view`).
- **Agent** routes on `/travel-agencies` gate inline (`role === 'agent' || isAdmin`).
- Search endpoints **escape regex metacharacters** before building `$or` `$regex` queries.

The two `controllers/` (explore, collection) are the only extracted controllers; every other router inlines its handlers. `exploreController` assembles the Explore-Kashmir aggregate (hidden gems, scenic drives, seasonal experiences by current month, etc.); `collectionController` wraps a 5-min `NodeCache`.

### Waza AI chat (`chatRoutes.js` → `POST /api/chat`)

Streaming (SSE) RAG assistant over **OpenRouter**. Latency-optimized: KB (`Knowledge/kashmir-knowledge-base.md`) read once at startup and keyword-sectioned; catalog data cached in-memory (10-min TTL) with pre-built inverted word→record indexes; system prompt core built once at startup (date appended per request); **model fallback chain** (`llama-3.1-8b` → `nemotron-3-ultra-550b:free` → `qwen3-32b`) raced against a 4s TTFT timeout. Guests are cookie-limited (`waza_guest_chat_count`, `waza_guest_recipe_count`); over-limit returns `401 { requiresAuth: true }`. The web-search plugin is enabled only for "dynamic" queries (fares/hours/weather), which also get `" in Kashmir"` appended to force local results. The system prompt strictly forbids inventing facts and answering outside Kashmir.

---

## 6. UI/UX Philosophy

The design language is **"cinematic luxury editorial"** — a coffee-table travel magazine, not a utilitarian app. Every surface commits to a near-black canvas (`#050505`–`#0B0B0B`) with a **single warm gold accent** and heavy motion choreography. The app is **dark-mode only** (`<html class="dark">`, `color-scheme: dark`).

**Design tokens are fragmented across three layers** (the codebase is mid-migration — expect the same "gold" under several hex values):
- **`app/globals.css` `:root` — the live runtime theme.** Canonical accent `--saffron: #C8A46A` (also hardcoded as `#C8A46A` throughout JSX), `--saffron-light #E6C875`, `--crimson #7A1025` (largely vestigial now), `--walnut`/`--muted` remapped to whites/greys, `--border: rgba(255,255,255,0.08)` (the recurring hairline). Also a profile-page sub-palette.
- **`app/shared-tokens.css`** — warmer parchment-on-charcoal palette for auth + kashmiri-food routes: `--charcoal-950…700` ramp, `--ivory #f4ecdf`, `--gold #d4a256`, `--copper #b5693a`.
- **`tailwind.config.js`** — still carries a **legacy light/nature palette** (`pine`, `cedar`, `snow`, `saffron #d97706`) that the dark design mostly bypasses, plus luxury `gold #D4AF63`. Prefer the CSS-variable tokens / `#C8A46A` over Tailwind color names for brand color.

**Typography** (via `next/font/google` in `layout.js`, wired as CSS vars): **Cormorant Garamond** (`--font-display`, serif headlines — the luxury voice), **Inter** (`--font-body`, UI/copy), **Playfair Display**, **Fraunces** (Explore route serif), **JetBrains Mono** / **IBM Plex Mono** (uppercase micro-labels/eyebrows). Recurring motif: tiny gold uppercase eyebrows with wide `tracking-[0.15em–0.25em]` above serif headlines. (Note: `globals.css` also `@import`s Cormorant/Inter from the CDN — redundant with next/font.)

**Visual grammar:**
- **Glassmorphism everywhere** — `.glass-panel`, `.hp-glass`, `.nav-pill`, `.topbar` use `backdrop-filter: blur(20–24px) saturate(150–180%)` over `rgba(255,255,255,0.04–0.05)` with hairline borders, with explicit `@supports not (backdrop-filter)` opaque fallbacks and `-webkit-` prefixes for older iOS (a real Capacitor concern).
- **Gold as light** — gold glows (`box-shadow: 0 0 40px rgba(200,164,106,0.25)`), radial ambiance gradients, `.gold-gradient-text`, `pulse-glow`.
- **Motion as choreography** — signature eases `cubic-bezier(0.22,1,0.36,1)` (framer-motion) / `(0.19,1,0.22,1)` (CSS); word-by-word headline reveals (`blur(8px)→0` + y-offset); hero scroll parallax (`useScroll`/`useTransform`) + desktop mouse parallax (`useSpring`) + 25s Ken Burns zoom; cards lift `translateY(-4px…-6px)` with gold-tinted shadow on hover.
- **Separate desktop vs mobile trees** — the homepage renders two entirely different DOMs (`hidden md:block` vs `block md:hidden`). Mobile is app-like: floating glass `.nav-pill`, a swipeable 5-screen container, bento cards. Desktop is a full 10-section cinematic scroll.

**Key reusable components:** `WazaAI.js` (the signature floating AI widget — SSE streaming, `react-markdown`, rAF-batched tokens, guest gating → `AuthRequiredModal`), `ImageWithSkeleton.js` (central image component — shimmer skeleton → fade-in, provider blur placeholder, fallback to `/wazwan-hero.jpg`), `Navbar`/`MobileNav`/`MobileSwipeContainer`, `GlobalSearchModal` (debounced, event-opened), `FadeInWhenVisible` (IntersectionObserver reveal). Note `RestaurantCard.js`/`DishCard.js` are **legacy light-theme and unused by the homepage** — don't reach for them when building dark UI.

**Cross-component communication uses `window` CustomEvents as a lightweight event bus** (not shared state): `open-waza-ai-intro`, `open-waza-ai-prompt`, `open-search`, `session-expired`, `hardware-back-press`.

---

## 7. Performance Requirements

Performance is a first-class concern; preserve these patterns when editing:
- **Dynamic imports with `ssr:false`** for heavy/client-only widgets (`WazaAI`, `GlobalSearchModal`, `LandingCanvas`, restaurant tabs/modals, reel player) to keep them out of SSR and defer JS.
- **`next/font/google`** self-hosted with `display:"swap"` — no font-flash, no render-blocking CDN. Don't add render-blocking font `@import`s.
- **Image optimization** goes through `lib/imageProvider.js` (pluggable: `local` default, `cloudinary` when `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is set — `f_auto,q_auto,c_limit,g_auto`, responsive `srcSet` `[400,800,1200,1920]`, LQIP blur). Always use `ImageWithSkeleton` / `buildImageUrl`; **never hand-build image URLs**. `next.config.js` sets AVIF/WebP, device sizes, 30-day cache, and a `remotePatterns` allowlist (add new image hosts there).
- **API caching** — the `lib/api.js` 5-min TTL + SWR + dedup layer; the homepage ships server-embedded seed JSON so first paint needs no fetch.
- **Scroll/paint** — `body.is-dragging` strips `backdrop-filter` + pauses animations during swipes; `translate3d`/`translateZ(0)` layer promotion; rAF-throttled scroll handlers; `prefetch={false}` on most `<Link>`s; rAF-batched AI stream updates.
- **Accessibility** — comprehensive `@media (prefers-reduced-motion: reduce)` blocks and safe-area insets (`env(safe-area-inset-*)`) for notched devices. Respect both when adding motion or fixed chrome.
- Backend: public GETs are cache-friendly (`stale-while-revalidate`); the chat RAG cache (10-min) and collection `NodeCache` (5-min) avoid per-request DB hits. Dish/Restaurant carry query indexes — keep queries index-aligned and use `.lean()` for read-only.

---

## 8. Security Guidelines

The current code reflects a **completed security-hardening pass** (see the recent `chore: comprehensive security hardening` commit). The file `wazwan-way-security-audit.md` at the repo root is a **historical baseline** (scored the app 52/100) — many of its top findings (no rate limiting, JWT in localStorage, `Math.random()` OTP, no CSP, no input validation) have since been remediated. Treat it as context, not current state.

Current posture — **keep these intact:**
- **Auth**: JWT in **httpOnly, `secure`-in-prod, `sameSite:lax` cookies** (never localStorage). Access 15m / refresh 7d; refresh carries `tokenVersion` and `logout-all` + password reset bump it to revoke sessions. Login uses **email-OTP 2FA** (Resend). ⚠️ There is a **hardcoded 2FA bypass for `nasirkirmani1@gmail.com`** in `authRoutes.js` — flag it in any security review; do not replicate the pattern.
- **CSRF**: double-submit (`csrf-csrf`) on every mutating `/api/*` request; header `x-csrf-token`, minted at `GET /api/auth/csrf-token`. Client attaches it automatically via `lib/api.js`.
- **Input**: `express-mongo-sanitize` globally + **Zod schemas** (mostly `.strict()`) applied by `middleware/validate.js`, which reassigns `req.*` to parsed output. Escape regex metacharacters before `$regex`. `pick()` (`utils/validation.js`) guards against mass assignment. (Note: `destinationRoutes`, `userRoutes`, `restaurantLeadRoutes` currently rely on manual checks rather than Zod — prefer adding a schema when extending them.)
- **Uploads**: multer disk (5MB, image types) with **magic-byte validation via `file-type`**; invalid files are unlinked. Served with `nosniff`.
- **Rate limiting** (`middleware/rateLimiter.js`): tiered, Redis-backed when healthy else in-memory. `globalSafetyLimiter` (5000/min/IP) → `public` (100/15min) / `authenticated` (1000/15min) → endpoint-specific (`registration` 5/hr, `passwordReset` 3/hr by email, `fileUpload` 20/hr, `userAction` 30/min, `aiChat` guest 3 / user 10 / premium 50 / admin 1000 per hour). `authLimiter` is a bespoke **triple-counter (IP + account + IP·account) with exponential backoff** (threshold 5 → 1s…30s delays; reject >15 → 429 for 15min); `resetAuthCounters` clears on success. All limits are env-overridable.
- **Headers** (`next.config.js`): strict CSP, HSTS, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, COOP. Redis is optional and degrades to in-memory gracefully.

Never log or echo secrets (`JWT_SECRET`, `OPENROUTER_API_KEY`, Resend/Twilio keys). The AI system prompt hides internal "Bot Routing" annotations — don't surface them.

---

## 9. Rules for Modifying Code

- **Don't break the proxy/cookie topology** (§5). No edge rewrites for `/api`; keep the proxy route `nodejs` + `force-dynamic`; keep web API calls relative.
- **Route all client data access through `lib/api.js`** and the `endpoints` map. Route all images through `imageProvider`/`ImageWithSkeleton`.
- **Follow the `page.js` (Server, metadata/SEO/JSON-LD) + `*Client.js` (`"use client"`) split** for new data-driven routes. Use the `@/` path aliases (`@/components`, `@/lib`, `@/hooks`, `@/context`, `@/data`).
- **Match the existing styling approach**: Tailwind utilities (arbitrary values are normal here) + the `.glass-panel`/`.hp-*`/`.page-shell`/`.gold-gradient-text` global classes + route-scoped CSS. Use `#C8A46A`/CSS-variable gold, not the legacy Tailwind `saffron`.
- **Respect reduced-motion and safe-area rules** when adding animation or fixed chrome. Gate heavy client widgets behind `ssr:false` dynamic imports.
- **Backend conventions**: wrap async handlers in `asyncHandler`; add a Zod schema in `validations/` and apply via `validate()`; pick the right rate limiter; use `protect`/`optionalAuth`/`adminOnly`/`requireOwnerOrAdmin` rather than re-implementing auth checks. New content models should follow the `slug` + `pre("save")` slugify convention. New XP-earning actions belong in `config/explorerConfig.js` + `utils/explorer.js`.
- **Seeding**: `seed.js` wipes catalog collections but preserves real `users` — don't add users to the wipe. Slug/gamification migrations are destructive (`migrateExplorer.js` resets all XP) — never run against production data casually.
- **Capacitor Android build**: `next.config.js` `output: 'export'` + `images.unoptimized` are gated on `CAPACITOR_BUILD` / commented out **on purpose** — enabling `output: 'export'` breaks Vercel's server features and the API proxy. To build Android: temporarily enable export, `npm run build`, `npx cap sync`, then revert. `capacitor.config.json` uses `webDir: "out"`, appId `com.wazwanway.app`.
- **Ignore the repo-root scratch files** (`fix*.js`, `*.html`, loose images) unless explicitly told otherwise — they are not part of the app.

---

## 10. Environment

- `backend/.env` — `PORT`, `MONGODB_URI` (Mongoose, forces IPv4), `JWT_SECRET`, `REFRESH_TOKEN_SECRET`, `CSRF_SECRET`, `CLIENT_URL` (comma-separated extra allowed origins), `OPENROUTER_API_KEY` (Waza AI), `RESEND_API_KEY` (email; no-ops if unset, OTP logged to console in dev), optional `REDIS_URL` (rate limiting), optional Twilio creds (SMS is wired but phone flows return "coming soon"), and the many `RATE_LIMIT_*` overrides.
- `frontend/.env.local` — `NEXT_PUBLIC_API_URL`, optional `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`; `BACKEND_URL` for the proxy route.
