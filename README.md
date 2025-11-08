# WorkZen HRMS (HRMS_1.0) — Detailed README

This repository contains the WorkZen Human Resource Management System (HRMS) — a full-stack web application for employee, attendance, leave and payroll management.

Overview

- Backend: Spring Boot (Java 21), JWT-based authentication, PostgreSQL
- Frontend: React + TypeScript (Vite), Tailwind CSS, shadcn UI components, TanStack Query

Structure

- `HRMS_Frontend/` — React frontend
  - `src/` — application code
  - `src/lib/api.ts` — API wrappers used by UI
  - `src/contexts/AuthContext.tsx` — manages auth state and tokens

- `src/main/java/com/workzen/` — Spring Boot backend
  - `controller/` — REST controllers (e.g., `AttendanceController.java`)
  - `service/` — business logic
  - `repository/` — data access (Spring Data JPA)
  - `entity/` — JPA entities
  - `dto/` — DTO objects

- `uploads/` — uploaded files (company logos, documents, profile pictures)

Quick start (development)

Prerequisites

- Java 21 (JDK)
- Maven (project includes `mvnw` wrapper)
- Node 18+ and npm
- PostgreSQL (or other database configured in application.properties)

Run the backend

Open a PowerShell terminal in the repository root and run:

```powershell
# Build and start backend
./mvnw clean package -DskipTests
./mvnw spring-boot:run
```

The backend usually listens on port `8081` (see `src/main/resources/application.properties`).

Run the frontend

```powershell
cd .\HRMS_Frontend
npm install
npm run dev
```

Vite dev server typically serves the frontend at `http://localhost:5173`.

Set the frontend to talk to the backend by setting the environment variable `VITE_API_BASE_URL` (defaults to `http://localhost:8081/api`). You can create a `.env` file in `HRMS_Frontend` with:

```
VITE_API_BASE_URL=http://localhost:8081/api
```

Authentication

- Login endpoint returns a JWT access token and `user` object. The frontend stores these in `localStorage` as `accessToken` and `user`.
- `AuthContext` initializes auth state from `localStorage` and exposes `login`, `logout`, and `hasRole` helpers.

Important endpoints (summary)

Authentication

- `POST /api/auth/login` — authenticate and receive JWT + user info

Employees

- `GET /api/employees`
- `GET /api/employees/{id}`
- `GET /api/employees/statistics` — used by Dashboard

Attendance

- `POST /api/attendance/check-in` — check-in for authenticated user
- `PATCH /api/attendance/check-out` — check-out for authenticated user
- `GET /api/attendance/today` — get today's attendance for authenticated user
- `GET /api/attendance/today/all` — get team status (active employees with their attendance status)
- `GET /api/attendance/my-attendance` — fetch attendance for user in date range

Leaves

- `GET /api/leave-applications`
- `POST /api/leave-applications`
- `PATCH /api/leave-applications/{id}/approve`
- `PATCH /api/leave-applications/{id}/reject`

Common issues & troubleshooting

1) 404/No static resource for `/api/...`

If logs show `No static resource api/attendance/today/all`, your Spring app is treating the path as a static resource. Check:

- `AttendanceController` is annotated with `@RestController` and mapped with `@RequestMapping("/api/attendance")`.
- Your main application class (`WorkZenHrmsApplication`) is in a package that includes `com.workzen` so component scanning picks up controllers.
- No custom static resource handlers in `WebMvcConfigurer` overshadow `/api/**`.

2) 500 errors in attendance endpoints

- Inspect the backend logs for stack traces. Often the cause is a repository query or missing DB data.
- Verify `attendanceRepository.findByEmployeeAndDate(...)` implementations and `leaveApplicationRepository` queries.
- Confirm the DB has employees and attendance/leave data for the requested date.

3) Frontend runtime errors (example: `lastMonthStats is not defined`)

- This can happen when frontend code expects an API that doesn't accept the same parameters. Adjust the frontend call or extend the backend API to accept query params.

Helpful developer commands

- Run backend tests:

```powershell
./mvnw test
```

- Build frontend for production (from `HRMS_Frontend`):

```powershell
npm run build
```

- Run frontend lint or tests: see `HRMS_Frontend/package.json` for available scripts.

Extending the project

- Backend: add controllers under `src/main/java/com/workzen/controller`, put business logic under `service`, and use repositories for DB access.
- Frontend: add pages/components under `HRMS_Frontend/src/pages` and `HRMS_Frontend/src/components`. Centralize API calls in `HRMS_Frontend/src/lib/api.ts` and manage server state with TanStack Query.

Suggested improvements

- Add a SQL seed script to populate test data (admin user, few employees and sample attendance for today).
- Add integration tests that exercise critical API endpoints (e.g., attendance endpoints used by dashboard).
- Provide a `.env.example` for both backend and frontend with the required variables.

If you'd like I can:

- Add a small seed SQL script and a data loader.
- Add an example `.env` files for frontend and backend.
- Implement the dashboard percent-change calculation with a backend query.

Architecture diagrams

1) High-level architecture (see `docs/architecture-flow.svg`)

  - Frontend (Vite + React) → calls REST API endpoints under `/api/*`.
  - Backend (Spring Boot): controllers receive requests, invoke services, which call repositories to persist/read from PostgreSQL.
  - The `docs/architecture-flow.svg` file in the `docs/` folder contains a visual diagram for the main request flow and an example attendance dataflow.

2) Dataflow example: Attendance check-in

 - User clicks "Check In" in the frontend.
 - Frontend POSTs to `POST /api/attendance/check-in` with Authorization header (Bearer token).
 - `AttendanceController.checkIn` resolves the authenticated `Employee`, delegates to `AttendanceService.checkIn`.
 - `AttendanceService` creates an `Attendance` entity with check-in time and persists via `AttendanceRepository`.
 - Frontend invalidates related TanStack Query caches (`attendance-today`, `attendance-history`) and updates the UI.

Files added

- `docs/architecture-flow.svg` — simple SVG diagram showing component interactions and attendance dataflow.

- `docs/er-diagram.svg` — ER diagram (simplified) created from the long ER diagram you provided.

- `docs/workzen_hrms ER-Diagram.png` — the original, high-resolution ER diagram (included as you requested). It is embedded below for convenience.

![WorkZen HRMS ER Diagram](docs/workzen_hrms%20ER-Diagram.png)

---

_Last updated: 2025-11-09_
