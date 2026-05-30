# SPEC — Traders Institute Academy

§G: Trading academy platform — landing page, student portal, admin dashboard. Monorepo pnpm, Vite frontend + Express backend, Turso DB, Vercel serverless. Deployment reference → `VERCEL.md`. Courses have 3 states: active (grant access, student viewable), inactive (no new access, existing students viewable), archived (hidden, no access).

---

## §C — Constraints

| # | Constraint |
|---|---|
| C1 | Frontend: Vite 7, React 19.1, Tailwind v4, shadcn/ui (new-york), wouter, @tanstack/react-query |
| C2 | Backend: Express 4, Turso (LibSQL), Drizzle ORM, zod, jsonwebtoken, bcryptjs |
| C3 | Monorepo: pnpm workspaces (`frontend`, `backend`), shared `tsconfig.base.json` |
| C4 | Deployment: frontend → Vercel static, backend → Vercel serverless (`api/index.js` using require() of compiled CJS dist) |
| C5 | Theme: dark-only (#080808 bg, #C9A84C gold primary, #e74c3c admin red) |
| C6 | Auth: JWT Bearer token, 7d expiry, role in payload |
| C7 | Backend layered: Routes → Middlewares → Controllers → Services → DB |
| C8 | Node.js ≥22, pnpm ≥10 |
| C9 | Email: Resend (free tier → only delivers to verified domain or account email `luis06jose@gmail.com`) |
| C10 | Payment: manual verification via admin panel (create student → grant access after payment confirmed) |
| C11 | Build: lazy-loaded routes (React.lazy + Suspense), code-split chunks per page |
| C12 | Vercel serverless: backend compiles to CommonJS (`module:commonjs`), root + backend ⊥ `"type":"module"`, api/index.js uses `require()` |

---

## §I — Interfaces

### API

```
api: GET  /api/health                     → 200 {status:"ok"}
api: PUT  /api/auth/profile                → 200 {id,name,email,role} (auth JWT, body: {name?,password?})
api: POST /api/auth/login                 → 200 {token, user:{id,name,email,role}} ∈ 401
api: POST /api/auth/forgot-password       → 200 {sent:true} (body: {email})
api: POST /api/auth/reset-password        → 200 {reset:true} (body: {token,password})
api: GET  /api/admin/courses?page&limit&search&status → 200 {items,total,page,limit,totalPages} (admin JWT, paginated, status∈{active,inactive,archived})
api: POST /api/admin/courses              → 201 {id,name,description,status∈{active,inactive,archived}} (admin JWT)
api: PUT  /api/admin/courses/:id          → 200 {id,name,description,status∈{active,inactive,archived}} ∈ 404 (admin JWT)
api: DELETE /api/admin/courses/:id        → 200 {id,name,description,status:archived} ∈ 404 (admin JWT, soft delete → archived)
api: GET  /api/admin/courses/:id/lessons  → 200 [{id,courseId,title,videoUrl,orderIndex}] (admin JWT)
api: POST /api/admin/courses/:id/lessons  → 201 {id,courseId,title,videoUrl,orderIndex} (admin JWT)
api: PUT  /api/admin/lessons/:id          → 200 {id,title,videoUrl,orderIndex} ∈ 404 (admin JWT)
api: DELETE /api/admin/lessons/:id        → 200 {id} ∈ 404 (admin JWT)
api: GET  /api/admin/users?page&limit&search&role → 200 {items,total,page,limit,totalPages} (admin JWT, paginated)
api: POST /api/admin/users                → 201 {id,name,email,role} (admin JWT)
api: PUT  /api/admin/users/:id            → 200 {id,name,email,role} ∈ 404 (admin JWT, body: {name?,email?,password?})
api: POST /api/admin/grant-access         → 201 {granted:true} (admin JWT)
api: POST /api/admin/revoke-access        → 200 {revoked:true} (admin JWT)
api: GET  /api/admin/users/:userId/access → 200 [{courseId,courseName}] (admin JWT)
api: GET  /api/student/my-courses         → 200 [{id,name,description,status}] (student JWT)
api: GET  /api/student/courses/:id         → 200 {id,name,description,status} ∈ 403 (student JWT + access)
api: GET  /api/student/course/:id/lessons → 200 [{id,title,videoUrl,orderIndex}] ∈ 403 (student JWT + access)
api: GET  /api/student/course/:id/progress → 200 {courseId,total,completed,percent} ∈ 403 (student JWT + access)
api: POST /api/student/course/:id/complete-lesson → 200 {lessonId,completed:true} ∈ 403 (student JWT + access)
api: GET  /api/student/progress           → 200 [{lessonId,completedAt}] (student JWT)
api: GET  /api/notifications              → 200 [{id,title,message,read,createdAt}] (auth JWT)
api: GET  /api/notifications/unread-count → 200 {count} (auth JWT)
api: PUT  /api/notifications/:id/read     → 200 {id} (auth JWT)
api: PUT  /api/notifications/read-all     → 200 {marked:true} (auth JWT)
```

### Database (Turso / LibSQL)

```
table: users         → id(text pk), name, email(unique), password_hash, role(admin|student)
table: courses       → id(int pk auto), name, description, status(active|inactive|archived)
table: lessons       → id(int pk auto), course_id(fk→courses), title, video_url, order_index
table: course_access → user_id(fk→users), course_id(fk→courses), unique(user_id,course_id)
table: lesson_progress → user_id(fk→users), lesson_id(fk→lessons), completed_at(timestamp), unique(user_id,lesson_id)
```

### Environment

```
env: TURSO_DATABASE_URL  ! (backend)
env: TURSO_AUTH_TOKEN    ! (backend)
env: JWT_SECRET          ! (backend)
env: RESEND_API_KEY      ! (backend, email delivery)
env: FRONTEND_URL        ! (backend, for email reset links)
env: PORT                ? (backend, default 3000)
env: CORS_ORIGIN         ? (backend, comma-separated origins or *, default localhost:5173,3000)
env: VITE_API_URL        ! (frontend, baked at build time, default http://localhost:3000)
```

### Frontend Routes

```
route: /              → Home (landing page, public)
route: /dashboard     → AdminDashboard ∈ StudentDashboard (role-based, protected)
route: /dashboard/course/:id → CourseDetail (video player + lesson list)
route: /reset-password/:token → ResetPassword (public)
route: *              → NotFound (404)
```

### Key Components (non-landing)

| Component | Path | Purpose |
|---|---|---|
| DashboardLayout | components/DashboardLayout.tsx | Shared sidebar+header for all dashboard views |
| ProfileEditor | components/ProfileEditor.tsx | Shared profile form (admin + student) |
| Pagination | components/Pagination.tsx | Reusable pagination with page size selector |
| UserSearch | components/UserSearch.tsx | Student search dropdown (admin only) |
| NotificationBell | components/NotificationBell.tsx | Bell icon + dropdown with mark-read |
| ErrorBoundary | components/ErrorBoundary.tsx | React error boundary with recovery |

### shadcn/ui Components (kept / removed)

| Kept (13) | Removed (40) |
|---|---|
| accordion, button, card, dialog, input, label, separator, skeleton, textarea, toast, toaster, toggle, tooltip | alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb, button-group, calendar, carousel, chart, checkbox, collapsible, command, context-menu, drawer, dropdown-menu, empty, field, form, hover-card, input-group, input-otp, item, kbd, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, sheet, sidebar, slider, sonner, spinner, switch, table, tabs, toggle-group |

### Radix Packages

| Kept (8) | Removed (19) |
|---|---|
| react-accordion, react-dialog, react-label, react-separator, react-slot, react-toast, react-toggle, react-tooltip | react-alert-dialog, react-aspect-ratio, react-avatar, react-checkbox, react-collapsible, react-context-menu, react-dropdown-menu, react-hover-card, react-menubar, react-navigation-menu, react-popover, react-progress, react-radio-group, react-scroll-area, react-select, react-slider, react-switch, react-tabs, react-toggle-group |

```
traders-institute-academy/
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
├── .gitignore
├── SPEC.md
├── VERCEL.md
├── api/
│   └── index.js                          ← Vercel serverless (CJS, require compiled dist)
├── frontend/
│   ├── src/
│   │   ├── lib/api.ts
│   │   ├── hooks/useAuth.ts
│   │   ├── App.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── StudentDashboard.tsx
│   │   │   ├── CourseDetail.tsx
│   │   │   ├── ResetPassword.tsx
│   │   │   └── not-found.tsx
│   │   └── components/
│   │       ├── landing/ (Navbar, Hero, TheEdge, CourseModules, SocialProof,
│   │       │              EnrollmentPath, FAQ, FinalCTA, Footer,
│   │       │              LoginModal, ForgotPasswordModal)
│   │       ├── ui/ (13 shadcn/ui components)
│   │       ├── DashboardLayout.tsx
│   │       ├── ProfileEditor.tsx
│   │       ├── Pagination.tsx
│   │       ├── UserSearch.tsx
│   │       ├── NotificationBell.tsx
│   │       └── ErrorBoundary.tsx
│   └── vite.config.ts                    ← outDir → ../dist/
├── dist/                                  ← Vercel outputDirectory (static)
└── backend/
    ├── src/
    │   ├── routes/
    │   ├── middlewares/
    │   ├── controllers/
    │   ├── services/
    │   ├── schemas/
    │   ├── db/schema.ts
    │   └── lib/jwt.ts
    └── dist/                              ← tsc output (CommonJS)
```

---

## §V — Invariants

| # | Invariant |
|---|---|
| V1 | ∀ req → auth middleware before handler (except `/api/health`, `/api/auth/login`) |
| V2 | admin routes → `requireAdmin` middleware after auth |
| V3 | student routes → `requireStudent` middleware after auth |
| V4 | `GET /api/student/course/:id/lessons` → course_access check for `userId` |
| V5 | password stored as bcrypt hash ⊥ plaintext |
| V6 | JWT payload → `{userId, role}` signed with `JWT_SECRET` |
| V7 | frontend stores token in `localStorage` → key `tia_token` |
| V8 | frontend stores user info → key `tia_user` |
| V9 | frontend role-based routing → admin ≠ student dashboard |
| V10 | login → `POST /api/auth/login` → store token+user → redirect `/dashboard` |
| V11 | `VITE_API_URL` ? → defaults to `http://localhost:3000` in `api.ts` |
| V12 | ⊥ course_access duplicate → unique(user_id, course_id) |
| V13 | course status ∈ {active, inactive, archived} |
| V14 | user role ∈ {admin, student} |
| V15 | `GET /api/admin/courses` → paginated `{items,total,page,limit,totalPages}` + query: `page`, `limit`(≤50), `search`, `status` |
| V16 | `GET /api/admin/users` → paginated `{items,total,page,limit,totalPages}` + query: `page`, `limit`(≤50), `search`, `role` |
| V17 | Dashboard → sidebar-only nav on desktop, hamburger on mobile |
| V18 | Profile editor → shared component, PUT `/api/auth/profile` |
| V19 | ⊥ unused shadcn/ui components → removed 40, kept 13 with active imports |
| V20 | ⊥ orphaned Radix packages → removed 19, kept 8 matching kept UI components |
| V21 | Admin can edit student accounts → `PUT /api/admin/users/:id` (name?, email?, password?) |
| V22 | Vercel serverless → backend compiles to CJS, root+backend ⊥ `"type":"module"`, api/index.js `require()` compiled dist |
| V23 | `VITE_API_URL` baked at build time → change requires redeploy |
| V24 | `api/index.js` strips trailing slash from `VITE_API_URL` → prevents `//api/` double slash |
| V25 | CORS allows `*` origin → open to all when `CORS_ORIGIN=*` |
| V26 | Auth state uses React Context → single shared state, not independent per component |
| V27 | Course status ∈ {active, inactive, archived} → 3 distinct states, archived excluded from student views |
| V28 | `buildQuery` must serialize ALL PaginationParams fields → page, limit, search, status, role |
| V29 | CourseMultiSelect → entire tag clickable for removal, only active courses selectable |

---

## §T — Tasks

### Completed

| id | status | task | cites |
|---|---|---|---|
| T1 | x | init pnpm monorepo (`frontend`, `backend`, `api/`) | C3 |
| T2 | x | Vite+React frontend (shadcn/ui, wouter, @tanstack/react-query) | C1 |
| T3 | x | landing page sections (Hero, Facts, Curriculum, Enroll, FAQ, CTA, Footer) | |
| T4 | x | Express backend layered (routes→controllers→services) | C7 |
| T5 | x | Turso DB + Drizzle ORM schema (4 tables) | I.db |
| T6 | x | `POST /api/auth/login` — JWT auth | V6, V10 |
| T7 | x | admin endpoints: create user, create course, grant access | V2, I.api |
| T8 | x | student endpoints: my courses, course lessons with access check | V3, V4, I.api |
| T9 | x | Vercel serverless wrapper (`api/index.js` require compiled dist) | C4, C12, V22 |
| T10 | x | seed: admin + test student + 4 courses + 15 lessons | |
| T11 | x | `useAuth` hook → real API, JWT + role in localStorage | V7, V8 |
| T12 | x | `LoginModal` → real API call, error handling | V10 |
| T13 | x | `App.tsx` role-based routing (admin vs student) | V9 |
| T14 | x | `AdminDashboard` — create courses, create students, grant access, list | I.api |
| T15 | x | `StudentDashboard` — fetch courses from API, course cards | I.api |
| T16 | x | `Navbar` admin badge + dynamic links | |
| T17 | x | `api.ts` typed fetch client for all endpoints | I.api |
| T18 | x | `GET /api/admin/courses`, `GET /api/admin/users` list endpoints | I.api |

### Production Pipeline (pending)

| id | status | task | cites |
|---|---|---|---|
| T19 | x | course detail page → `/dashboard/course/:id` with lesson list | C1 |
| T20 | x | video player component (embedded YouTube/Vimeo or custom) | C1 |
| T21 | x | student progress tracking → track lesson completion in DB | I.db |
| T22 | x | progress API: `POST /api/student/course/:id/progress`, `GET /api/student/progress` | V3, I.api |
| T23 | x | edit course → `PUT /api/admin/courses/:id` | V2, I.api |
| T24 | x | delete course → `DELETE /api/admin/courses/:id` (soft delete) | V2 |
| T25 | x | admin list students in UI (not just create) | T14 |
| T26 | x | profile page — update name, email, password | C1, V1 |
| T27 | x | CORS config → production domain allowlist | C4 |
| T28 | x | `vercel.json` root config (buildCommand, rewrites, rootDir) | C4 |
| T29 | x | password recovery flow (forgot/reset via Resend email) | |
| T30 | x | real enrollment/payment flow — manual via admin (create student → grant access after payment) | |
| T31 | x | notification system (in-app notifications + Resend email on events) | |
| T32 | x | mobile responsive polish (sidebar, course cards) | C1 |
| T33 | x | error boundaries + toast notifications on API errors | C1 |
| T34 | x | SEO meta tags + opengraph on landing | C1 |
| T35 | x | admin lessons manager (add/edit/delete lessons per course) | V2 |
| T36 | x | backend pagination: `GET /api/admin/courses?page&limit&search&status` + `GET /api/admin/users?page&limit&search&role` | V15, V16 |
| T37 | x | frontend Pagination component with page size selector (5/10/20/50) | V15, V16 |
| T38 | x | shared ProfileEditor component (admin + student, PUT /api/auth/profile) | V18 |
| T39 | x | sidebar-only desktop nav (removed navbar buttons, sidebar fixed 240px) | V17 |
| T40 | x | fix landing links: Student Login in footer opens modal, Secure Your Spot opens modal | |
| T41 | x | purge unused shadcn/ui components (53→13) + orphaned Radix packages (27→8) | V19, V20 |
| T42 | x | admin overview compact: stat cards max-width 220px, quick actions as button row | |
| T43 | x | remove UUID display from admin UI, add student search + click-to-view-access | |
| T44 | x | admin edit student accounts — PUT /api/admin/users/:id, inline edit form | V21 |
| T45 | x | course multi-select autocomplete for Grant Access — supports batch granting | |
| T46 | x | migrate AdminDashboard, StudentDashboard, DashboardLayout to Tailwind v4 | |
| T47 | x | lazy-load routes with React.lazy + Suspense for code splitting | |
| T48 | x | unified .env + .env.example at project root for Vercel deploy | |
| T49 | x | Vercel CORS fix: allow `*` origin + strip trailing slash from API_BASE | V24, V25 |
| T50 | x | Vercel CJS fix: backend → CommonJS, api/index.js → require(../backend/dist/app.js) | V22, C12 |
| T51 | x | convert useAuth to React Context → single shared state, fix stale auth after login | V26 |
| T52 | x | fix buildQuery → serialize status and role params (root cause of Archived filter not working) | V28 |
| T53 | x | add 3rd course state: inactive (no new access, existing students can view) + archived (hidden) | V27 |
| T54 | x | admin course tabs → 3 pills (Active/Inactive/Archived) with distinct colors | V27 |
| T55 | x | student services → exclude archived courses from my-courses, getCourse, getCourseLessons | V27 |
| T56 | x | CourseMultiSelect → entire tag clickable (cursor-pointer + hover), only active courses loaded | V29 |

---

## §B — Bugs / Known Limitations

| id | date | cause | fix |
|---|---|---|---|
| B1 | 2026-05-29 | Resend free tier: emails only deliver to verified domain or account email (`luis06jose@gmail.com`) | Verify domain in Resend dashboard or upgrade to paid tier |
| B2 | 2026-05-29 | `db.$count` doesn't exist in Drizzle ORM | Use `sql<number>\`count(*)\`` instead |
| B3 | 2026-05-30 | Vercel deploy: pnpm ignores esbuild build scripts → vite fails silently | Added `pnpm.onlyBuiltDependencies: ["esbuild"]` to root package.json |
| B4 | 2026-05-30 | CORS preflight blocked: wrong `VITE_API_URL` domain + double slash `//api/auth/login` | Set correct env vars in Vercel, strip trailing slash, allow `CORS_ORIGIN=*` |
| B5 | 2026-05-30 | `ERR_REQUIRE_ESM`: root `"type":"module"` treated api/index.js as ESM → can't require backend ESM | Remove `"type":"module"` from root+backend, compile backend to CJS |
| B6 | 2026-05-30 | `ERR_MODULE_NOT_FOUND`: api/index.ts imported `../backend/src/app` → TS source not bundled at runtime | Change to `require("../backend/dist/app.js")` → import compiled CJS output |
| B7 | 2026-05-30 | Nav click → landing reload: `useAuth` was plain hook with independent state per component; `Router`'s `user` stayed null after `LoginModal` login → redirected back to `/` | Convert to React Context (`AuthProvider`) → single shared state |
| B8 | 2026-05-30 | Archived tab → all active courses shown: `buildQuery` only serialized page/limit/search, ignoring status and role params → query param dropped, API returned unfiltered results | Added status+role to buildQuery + invariant V28 |

