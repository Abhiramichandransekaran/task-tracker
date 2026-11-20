# Team Task & Bug Tracker

A lightweight full-stack tracker where team members log tasks or bugs, filter them by status or priority, move them through `todo → in_progress → done`, and delete resolved items.

**Stack:** MongoDB (Mongoose) · Express 5 · React 19 · Node.js · TypeScript (strict) · Zod · Vitest + Supertest · Vite

---

## Project structure

```
task-tracker/
├── backend/                  Express + Mongoose REST API
│   ├── src/
│   │   ├── models/Task.ts        Mongoose schema and model
│   │   ├── schemas/taskSchemas.ts Zod request schemas (create, update, list query)
│   │   ├── routes/tasks.ts       /api/tasks route handlers
│   │   ├── app.ts                Express app (JSON parsing, routes, 404 + error handler)
│   │   └── server.ts             Connects to MongoDB, starts the server
│   ├── tests/tasks.test.ts   API tests (Vitest + Supertest + in-memory MongoDB)
│   └── .env.example
└── frontend/                 React + Vite single-page app
    ├── src/
    │   ├── types.ts              API payload types shared across the UI
    │   ├── api.ts                Typed fetch client, maps API errors to field errors
    │   ├── hooks/useTasks.ts     Loading, filtering and mutations
    │   └── components/           TaskForm, TaskFilters, TaskList, TaskItem, Toast
    └── .env.example
```

---

## Prerequisites

- **Node.js** 20 or newer, and npm
- **MongoDB** running locally ([MongoDB Community Server](https://www.mongodb.com/try/download/community)), or a MongoDB Atlas connection string

The automated tests do **not** need MongoDB installed. They start an in-memory MongoDB server.

---

## Setup

### 1. Clone

```bash
git clone https://github.com/Abhiramichandransekaran/task-tracker.git
cd task-tracker
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env          # Windows PowerShell: Copy-Item .env.example .env
```

`backend/.env`:

| Variable      | Description                 | Example                                     |
|---------------|-----------------------------|---------------------------------------------|
| `PORT`        | Port the API listens on     | `5000`                                      |
| `MONGODB_URI` | MongoDB connection string   | `mongodb://localhost:27017/task-tracker`    |

### 3. Frontend

```bash
cd ../frontend
npm install
cp .env.example .env          # optional, the defaults work for local development
```

`frontend/.env` (optional):

| Variable           | Description                                                        | Default                 |
|--------------------|--------------------------------------------------------------------|-------------------------|
| `API_PROXY_TARGET` | Where the Vite dev server forwards `/api` requests                 | `http://localhost:5000` |
| `VITE_API_URL`     | Call the API directly instead of through the dev proxy             | empty                   |

---

## Running the app

Use two terminals.

```bash
# Terminal 1: API on http://localhost:5000
cd backend
npm run dev
```

```bash
# Terminal 2: UI on http://localhost:5173
cd frontend
npm run dev
```

Open **http://localhost:5173**. In development, the UI calls `/api/...` on its own origin and Vite proxies those requests to the backend, so no CORS setup is needed.

### Production build

```bash
cd backend  && npm run build && npm start      # compiles to backend/dist
cd frontend && npm run build                   # type-checks, then outputs frontend/dist
```

---

## Running the tests

```bash
cd backend
npm test
```

11 API tests run against an in-memory MongoDB (`mongodb-memory-server`). The first run downloads a MongoDB binary, so it takes longer.

| Area | What is covered |
|------|-----------------|
| `POST /api/tasks` | **201 Created** with saved fields and defaults (`status: todo`, `priority: medium`, `createdAt`) |
| Validation | **400** with field messages for a too-short title, a missing title, invalid enums, and malformed JSON |
| `PATCH /api/tasks/:id` | **Status update** is persisted. 400 for an invalid status. **404** for a missing task and for an invalid ID format |
| `GET /api/tasks` | Server-side filtering by `status` and `priority`. 400 for an unknown filter value |
| `DELETE /api/tasks/:id` | Confirmation response, and 404 when the task does not exist |

Type checks: `npx tsc --noEmit` in either `backend/` or `frontend/`.

---

## API reference

Base URL: `http://localhost:5000/api/tasks`

| Method   | Path                | Body                                        | Success              | Errors |
|----------|---------------------|---------------------------------------------|----------------------|--------|
| `GET`    | `/?status=&priority=` | none                                      | `200` task array, newest first | `400` invalid filter |
| `POST`   | `/`                 | `{ title, description?, status?, priority? }` | `201` created task | `400` validation |
| `PATCH`  | `/:id`              | `{ status?, priority? }` (at least one)     | `200` updated task   | `400` validation, `404` |
| `DELETE` | `/:id`              | none                                        | `200 { message, id }` | `404` |

**Task fields**

| Field         | Type   | Rules |
|---------------|--------|-------|
| `title`       | string | Required, 3–100 characters (trimmed) |
| `description` | string | Optional, up to 500 characters |
| `status`      | enum   | `todo` \| `in_progress` \| `done`, defaults to `todo` |
| `priority`    | enum   | `low` \| `medium` \| `high`, defaults to `medium` |
| `createdAt`   | Date   | Set automatically |

**Validation error shape** (400)

```json
{
  "message": "Validation failed",
  "errors": [{ "field": "title", "message": "Title must be at least 3 characters" }]
}
```

The ID check is strict: anything that is not a 24-character hex ObjectId returns `404 Task not found`. That covers both "does not exist" and "invalid ID format", as the spec asks.

---

## Frontend features

- **Task list** with a priority icon (one, two or three bars), a status pill, relative "added" time, and loading, empty, filtered-empty and error states
- **Filtering** by status (tabs with counts) and priority. Both filters are sent to the API as query parameters.
- **Create form** that shows the backend's Zod messages under the matching field
- **Quick updates:** change status from each row, and delete with an inline confirmation. Each action shows a short confirmation toast.
- **Type safety:** strict TypeScript, typed API client and component props, no `any`
- Responsive down to 375px, light and dark themes, visible keyboard focus, and reduced-motion support

---

## Admin Authentication

The application features a secure admin login gate:

| Credential | Value |
|---|---|
| **Username** | `admin` (or `admin@tasktracker.com`) |
| **Password** | `admin123` |

- **Dedicated Admin Login Screen**: Restricts workspace access to authenticated administrators with strict validation and error alerts.
- **Session Persistence**: Stored securely in `localStorage` with topbar user profile and one-click Sign Out.
- **REST Auth Endpoint**: `POST /api/auth/login` validated with Zod.

---

## Trade-offs (3-hour time box)

1. **Types are mirrored, not shared.** The frontend's `types.ts` restates the backend's Zod schemas by hand. A shared workspace package (or exporting the Zod schemas to the client) would make the types truly single-source, but it adds monorepo tooling. With more time, I would share the schemas so a field change cannot drift between the two apps.
2. **No pagination or stats endpoint.** `GET /api/tasks` returns every matching task. The status-tab counts come from a second request filtered only by priority. This is fine for a team-sized list. At scale, I would add cursor pagination and a `GET /api/tasks/stats` aggregation endpoint, plus indexes on `status` and `priority`.

Also out of scope: authentication and per-user ownership, and automated frontend tests (the UI was checked by hand in a browser at mobile, tablet and desktop widths).
