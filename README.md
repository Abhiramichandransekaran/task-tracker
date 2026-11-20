# Team Issue & Task Tracker

A full-stack MERN (MongoDB, Express, React, Node.js) + TypeScript application to log tasks and bugs, filter by status or priority, update workflow progress, and delete resolved items.

---

## 1. Setup Instructions

### Prerequisites
- **Node.js** (v20+ recommended) & **npm**
- **MongoDB** running locally or a MongoDB Atlas URI

### Installation & Environment

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Abhiramichandransekaran/task-tracker.git
   cd task-tracker
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   ```
   *(On Windows PowerShell: `Copy-Item .env.example .env`)*

   Default `.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/task-tracker
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   ```

---

## 2. Commands to Run Both Servers

Run backend and frontend concurrently in two terminals:

- **Terminal 1 (Backend API - http://localhost:5000):**
  ```bash
  cd backend
  npm run dev
  ```

- **Terminal 2 (Frontend Client - http://localhost:5173):**
  ```bash
  cd frontend
  npm run dev
  ```

Open **http://localhost:5173** in your browser.

> **Admin Login Credentials:**
> - **Username:** `admin` (or `admin@tasktracker.com`)
> - **Password:** `admin123`

---

## 3. Running the Test Suite

API tests use **Vitest**, **Supertest**, and an isolated in-memory MongoDB (`mongodb-memory-server`):

```bash
cd backend
npm test
```

Tests cover:
1. Successful task creation via `POST /api/tasks` (201 Created and saved fields).
2. Validation error handling with descriptive Zod messages (400 Bad Request).
3. Status and priority updates via `PATCH /api/tasks/:id` (200 OK & 404 handling).
4. Server-side filtering via `GET /api/tasks?status=...&priority=...`.
5. Deletion confirmation via `DELETE /api/tasks/:id`.
6. Authentication endpoint validation (`POST /api/auth/login`).

---

## 4. Technical Trade-offs (3-Hour Time Box)

1. **Mirrored TypeScript Interfaces:**
   To adhere to the 3-hour constraint without introducing monorepo tooling (such as Turborepo or npm workspaces), API request and response interfaces are mirrored in `frontend/src/types.ts` rather than imported directly from the backend Zod schemas. With more time, a shared package would provide single-source-of-truth validation end-to-end.

2. **Server-Side Filtering vs. Cursor Pagination:**
   Tasks are sorted by newest first with server-side query filtering (`?status=` and `?priority=`). While ideal for small-to-medium team tracking, at higher scale this would be expanded to cursor-based pagination and a dedicated `/api/tasks/stats` aggregation endpoint.
