# Vercel Deployment Reference

## Architecture

```
traders-institute-academy/
├── api/
│   └── index.js          ← Vercel serverless function (CommonJS)
├── backend/
│   ├── src/              ← TypeScript source (Express app)
│   │   └── app.ts        ← createApp() → Express instance
│   ├── dist/             ← Compiled JavaScript (tsc output, CommonJS)
│   │   └── app.js        ← exports.createApp
│   └── package.json      ← NO "type": "module"
├── frontend/
│   ├── src/              ← Vite + React SPA
│   └── dist/             ← Vite build output → root dist/
├── dist/                 ← Vercel outputDirectory (frontend static files)
├── vercel.json
└── package.json          ← root workspace config
```

## How It Works

### 1. Build Phase (`vercel.json` → `buildCommand`)
```
pnpm --filter backend build   # tsc: src/*.ts → dist/*.js (CommonJS)
pnpm --filter frontend build  # vite build → ../dist/
```

### 2. Runtime: Serverless Function (`api/index.js`)
```js
require("dotenv/config");
const { createApp } = require("../backend/dist/app.js");

module.exports = createApp();
```

Vercel routes `/api/(.*)` → `api/index.js`. The Express app handles all API routes internally.

### 3. Static Files
- Frontend static assets served from `dist/` (Vercel `outputDirectory`)
- SPA fallback: non-API routes → `index.html`

## Critical Rules (must NOT break)

### Rule 1: CommonJS everywhere for serverless
- Backend `tsconfig.json`: `"module": "commonjs"`, `"moduleResolution": "node"`, `"esModuleInterop": true`
- Backend `package.json`: NO `"type": "module"` field
- Root `package.json`: NO `"type": "module"` field
- `api/index.js`: plain `.js`, uses `require()` and `module.exports`

**Why:** Vercel serverless bundler works with `require()`. If any `.js` file is treated as ESM (due to `"type": "module"` in a parent `package.json`), `require()` of ESM modules fails with `ERR_REQUIRE_ESM`.

### Rule 2: API imports compiled dist, NOT TypeScript source
```
BAD:  import { createApp } from "../backend/src/app";   ← Vercel can't resolve TS at runtime
GOOD: const { createApp } = require("../backend/dist/app.js");  ← compiled JS, traced by bundler
```

Vercel's serverless bundler traces `require()` calls to include dependencies. It cannot trace TypeScript imports.

### Rule 3: VITE_API_URL must be set BEFORE build
```
# Vercel Environment Variables (set in dashboard)
VITE_API_URL=https://traders-institute-academy.vercel.app
```

`VITE_API_URL` is baked into the frontend bundle at build time (Vite replaces `import.meta.env.VITE_API_URL`). Changing it requires redeploy.

### Rule 4: CORS_ORIGIN supports both specific origins and `*`
```ts
// backend/src/app.ts
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
```

For production, set `CORS_ORIGIN=*` or the specific frontend domain.

### Rule 5: API base URL strips trailing slash
```ts
// frontend/src/lib/api.ts
const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/+$/, "");
```

Prevents double-slash URLs like `https://example.com//api/auth/login`.

## Vercel Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_API_URL` | Yes | Frontend API base URL (baked at build) |
| `CORS_ORIGIN` | Yes | Allowed CORS origins (use `*` or domain) |
| `TURSO_DATABASE_URL` | Yes | LibSQL/Turso database URL |
| `TURSO_AUTH_TOKEN` | Yes | Turso auth token |
| `JWT_SECRET` | Yes | JWT signing secret |
| `RESEND_API_KEY` | Yes | Resend email API key |
| `FRONTEND_URL` | Yes | Frontend URL (for email links) |

## vercel.json Reference
```json
{
  "buildCommand": "pnpm --filter backend build && pnpm --filter frontend build",
  "outputDirectory": "dist",
  "installCommand": "pnpm install",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## pnpm Build Scripts
```json
// root package.json
{
  "scripts": {
    "build:backend": "pnpm --filter backend build",
    "build:frontend": "pnpm --filter frontend build",
    "build": "pnpm run build:backend && pnpm run build:frontend"
  },
  "pnpm": {
    "onlyBuiltDependencies": ["esbuild"]
  }
}
```

`onlyBuiltDependencies: ["esbuild"]` — required for Vercel, which skips postinstall scripts except those explicitly allowed. Vite needs esbuild native binaries built during install.

## Backend tsconfig.json (CommonJS output)
```json
{
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "module": "commonjs",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "target": "es2022",
    "strict": true
  },
  "include": ["src/**/*"]
}
```

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `ERR_REQUIRE_ESM`: require() of ES Module | Backend or root has `"type": "module"` | Remove `"type": "module"` from both `package.json` files |
| `ERR_MODULE_NOT_FOUND`: Cannot find module | `api/index.js` imports TS source not compiled JS | Use `require("../backend/dist/app.js")` |
| CORS preflight redirect not allowed | Wrong `VITE_API_URL` or CORS origin mismatch | Set correct env vars, redeploy |
| Double slash in API URL (`//api/`) | `VITE_API_URL` has trailing slash | `.replace(/\/+$/, "")` in `api.ts` |
| esbuild not found during build | Vercel skips esbuild postinstall | Add `pnpm.onlyBuiltDependencies: ["esbuild"]` |
