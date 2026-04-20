# AGENTS.md

## Dev Commands
- `npm run dev` - Start dev server (port 3000)
- `npm run build` - Run type-check then build
- `npm run lint` - Runs oxlint AND eslint (both with --fix)
- `npm run format` - Prettier format on src/

## Tech Stack
- Vue 3 + Vite + TypeScript + Element Plus + Pinia + Vue Router
- `@` alias maps to `src/`

## Lint Order
`npm run lint` runs both oxlint and eslint sequentially. Run both before committing.

## API Proxies (dev)
- `/api/ai` → `http://localhost:8083`
- `/api` → `http://localhost:8080`
- `/upload` → `http://localhost:8080`

Note: `/api/ai` must be defined before `/api` (vite matches in order).

## Project Structure
- `src/api/` - API definitions
- `src/stores/` - Pinia stores
- `src/views/` - Page components
- `src/components/` - Reusable components
- `src/utils/` - Utilities (request.ts, format.ts)

## Node Requirement
Node.js ^20.19.0 or >=22.12.0