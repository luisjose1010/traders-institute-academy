# SPEC — Traders Institute Academy

§G: Trading academy platform — landing page, student portal, admin dashboard. Monorepo pnpm, Vite frontend + Express backend, Turso DB, Vercel serverless.

---

## §C — Constraints

| # | Constraint |
|---|---|
| C1 | Frontend: Vite 7, React 19.1, Tailwind v4, shadcn/ui (new-york), wouter, @tanstack/react-query |
| C2 | Backend: Express 4, Turso (LibSQL), Drizzle ORM, zod, jsonwebtoken, bcryptjs |
| C3 | Monorepo: pnpm workspaces (`frontend`, `backend`), shared `tsconfig.base.json` |
| C4 | Deployment: frontend → Vercel static, backend → Vercel serverless (`api/index.ts`) |
| C5 | Theme: dark-only (#080808 bg, #C9A84C gold primary, #e74c3c admin red) |
| C6 | Auth: JWT Bearer token, 7d expiry, role in payload |
| C7 | Backend layered: Routes → Middlewares → Controllers → Services → DB |
| C8 | Node.js ≥22, pnpm ≥10 |

---

## §I — Interfaces

### API

```
api: GET  /api/health                     → 200 {status:"ok"}
api: PUT  /api/auth/profile                → 200 {id,name,email,role} (auth JWT, body: {name?,password?})
api: POST /api/auth/login                 → 200 {token, user:{id,name,email,role}} ∈ 401
api: GET  /api/admin/courses              → 200 [{id,name,description,status}] (admin JWT)
api: POST /api/admin/courses              → 201 {id,name,description,status} (admin JWT)
api: PUT  /api/admin/courses/:id          → 200 {id,name,description,status} ∈ 404 (admin JWT)
api: DELETE /api/admin/courses/:id        → 200 {id,name,description,status:inactive} ∈ 404 (admin JWT, soft delete)
api: GET  /api/admin/courses/:id/lessons  → 200 [{id,courseId,title,videoUrl,orderIndex}] (admin JWT)
api: POST /api/admin/courses/:id/lessons  → 201 {id,courseId,title,videoUrl,orderIndex} (admin JWT)
api: PUT  /api/admin/lessons/:id          → 200 {id,title,videoUrl,orderIndex} ∈ 404 (admin JWT)
api: DELETE /api/admin/lessons/:id        → 200 {id} ∈ 404 (admin JWT)
api: GET  /api/admin/users                → 200 [{id,name,email,role}] (admin JWT)
api: POST /api/admin/users                → 201 {id,name,email,role} (admin JWT)
api: POST /api/admin/grant-access         → 201 {granted:true} (admin JWT)
api: GET  /api/student/my-courses         → 200 [{id,name,description,status}] (student JWT)
api: GET  /api/student/courses/:id         → 200 {id,name,description,status} ∈ 403 (student JWT + access)
api: GET  /api/student/course/:id/lessons → 200 [{id,title,videoUrl,orderIndex}] ∈ 403 (student JWT + access)
api: GET  /api/student/course/:id/progress → 200 {courseId,total,completed,percent} ∈ 403 (student JWT + access)
api: POST /api/student/course/:id/complete-lesson → 200 {lessonId,completed:true} ∈ 403 (student JWT + access)
api: GET  /api/student/progress           → 200 [{lessonId,completedAt}] (student JWT)
```

### Database (Turso / LibSQL)

```
table: users         → id(text pk), name, email(unique), password_hash, role(admin|student)
table: courses       → id(int pk auto), name, description, status(active|inactive)
table: lessons       → id(int pk auto), course_id(fk→courses), title, video_url, order_index
table: course_access → user_id(fk→users), course_id(fk→courses), unique(user_id,course_id)
table: lesson_progress → user_id(fk→users), lesson_id(fk→lessons), completed_at(timestamp), unique(user_id,lesson_id)
```

### Environment

```
env: TURSO_DATABASE_URL  ! (backend)
env: TURSO_AUTH_TOKEN    ! (backend)
env: JWT_SECRET          ! (backend)
env: PORT                ? (backend, default 3000)
env: CORS_ORIGIN         ? (backend, comma-separated origins, default localhost:5173,3000)
env: VITE_API_URL        ? (frontend, default http://localhost:3000)
```

### Frontend Routes

```
route: /            → Home (landing page, public)
route: /dashboard   → AdminDashboard ∈ StudentDashboard (role-based, protected)
route: *            → NotFound (404)
```

### File Structure

```
traders-institute-academy/
├── pnpm-workspace.yaml
├── package.json              # root scripts
├── tsconfig.base.json
├── .gitignore
├── api/
│   └── index.ts             # Vercel serverless handler
├── frontend/                # Vite + React
│   ├── src/
│   │   ├── lib/api.ts       # typed fetch client
│   │   ├── hooks/useAuth.ts # auth state + JWT
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── StudentDashboard.tsx
│   │   │   └── not-found.tsx
│   │   └── components/
│   │       ├── landing/     # landing sections
│   │       └── ui/          # shadcn/ui
│   └── vite.config.ts
└── backend/                 # Express + Turso
    └── src/
        ├── routes/
        ├── middlewares/
        ├── controllers/
        ├── services/
        ├── schemas/
        ├── db/schema.ts
        └── lib/jwt.ts
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
| V13 | course status ∈ {active, inactive} |
| V14 | user role ∈ {admin, student} |

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
| T9 | x | Vercel serverless wrapper (`api/index.ts`) | C4 |
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
| T29 | . | password recovery flow (forgot/reset via email?) | |
| T30 | . | real enrollment/payment flow (Stripe?) | |
| T31 | . | notification system (email or in-app) | |
| T32 | . | mobile responsive polish (sidebar, course cards) | C1 |
| T33 | . | error boundaries + toast notifications on API errors | C1 |
| T34 | . | SEO meta tags + opengraph on landing | C1 |
| T35 | x | admin lessons manager (add/edit/delete lessons per course) | V2 |

---

## §B — Bugs

| id | date | cause | fix |
|---|---|---|---|
| | | | |

