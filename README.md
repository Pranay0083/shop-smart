# ShopSmart

ShopSmart is a full-stack web application with React on the frontend and Express + Prisma on the backend.

## Architecture

- Frontend: React + Vite app in `client/`
- Backend: Express API in `server/`
- Database: SQLite through Prisma ORM
- Testing:
	- Frontend unit/integration: Vitest + React Testing Library + MSW
	- Frontend E2E: Playwright
	- Backend API tests: Jest + Supertest

### Runtime Flow

1. User interacts with frontend routes (`/`, `/login`, `/signup`, `/products/:id`).
2. Frontend calls backend APIs (`/api/auth/*`, `/api/products`, `/api/health`).
3. Backend handles auth/business logic and talks to Prisma where needed.
4. Responses are rendered in React UI.

## CI/CD Workflow

- CI file: `.github/workflows/ci.yml`
- Triggers:
	- `push`
	- `pull_request`
- Pipeline checks:
	- Install dependencies for client and server
	- Run ESLint
	- Run Prettier check
	- Run tests

## Design Decisions

- Kept auth concerns in `AuthContext` for reusable state handling.
- Added API helper functions under `client/src/api/` to avoid duplicate fetch logic.
- Introduced `products` endpoints for clear frontend-backend integration.
- Used test IDs in core UI for stable UI and E2E test selectors.
- Added idempotent setup script behavior to support repeatable environment setup.

## Challenges and Trade-offs

- Ensuring new product pages did not break existing auth/health tests.
- Balancing strict CI checks with current project structure (separate client/server packages).
- Making setup script rerunnable without damaging existing local state.

## Required Project Notes

1. SQLite3 is used for local database storage.
2. Prisma is used as ORM.
3. API endpoints are implemented for auth and product retrieval.
4. Deploy configuration can target backend (Render) and frontend (Vercel).
5. CORS is enabled in backend middleware and can be tuned for deployed domains.
