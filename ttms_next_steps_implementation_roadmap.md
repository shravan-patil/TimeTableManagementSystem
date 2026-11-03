# VJTI Time Table Management System (TTMS)
## Ordered Next Steps & Implementation Roadmap

**Project:** Time Table Management System (TTMS)  
**Institution:** Veermata Jijabai Technological Institute (VJTI), Matunga, Mumbai  
**Team Members:** Tanish Parekh (241080049), Rajgaurav Patil (241080051), Shrvan Patil (241080052), Shrinivas Patil (241080053), Satvik Prabhu (241080054)  
**Current Baseline:** `v1.0.0` Client-Side Prototype (Next.js 14, React 18, TypeScript, Tailwind CSS)  
**Target State:** Full Three-Tier Modular Monolith with PostgreSQL Persistence, RBAC Portals, Backtracking Solver, SQA Verification (`TC-01` to `TC-12`), and Docker Deployment

---

## Executive Gap Analysis: What Is Done vs. What Remains

Your current implementation (`DOCUMENTATION.md`) has successfully completed the **Coordinator UI Prototype** and **Client-Side Computation Engines** (`schedulingAlgorithm.ts`, `conflictDetector.ts`, `substitutionEngine.ts`) using in-memory React state in `src/app/page.tsx`.

However, comparing your codebase documentation against **Assignment 1 (Problem Statement)** and **Assignment 7 (Design Modeling)** reveals six core areas that must be completed in order:

| Area | Current State (`DOCUMENTATION.md`) | Target Design Spec (`Assignment 7`) |
| :--- | :--- | :--- |
| **1. Data Tier** | In-memory React state (`useState` in `page.tsx`), 14 TypeScript interfaces | **PostgreSQL** database with **15 tables in 3NF**, `UNIQUE` composite indexes, and `ON DELETE RESTRICT` foreign keys |
| **2. Application Tier** | Direct client-side function calls in browser | **Layered REST API** (Controllers $\rightarrow$ Services $\rightarrow$ `ConstraintChecker` $\rightarrow$ Repositories) |
| **3. Auth & Role Views** | Single Coordinator view (`Dr. V. M. Phalle` hardcoded) | **JWT Auth + RBAC** for **Coordinator Console**, dedicated **Faculty View (S9)**, and login-free **Public Student View (S10)** |
| **4. Solver & Domain Logic** | Single-pass greedy heuristic; 1:N batch-session mapping; substitute-only leave flow | **Backtracking Solver** with `STEP_LIMIT` & `bestPartial`; **Combined Batch Sessions (`M:N`)**; **Auto-Reschedule Fallback** |
| **5. UI Usability Tactics** | Modal-only session editing; unrestricted master record deletion | **Drag-and-Drop Grid Editing**, **Undo Last Move**, **In-Use Delete Prevention (`TC-02`)**, **"Combined" session tags** |
| **6. SQA & Deployment** | Manual browser verification via `npm run dev` | Automated Unit/API Test Suite (**`TC-01` to `TC-12`**) + **Docker Compose** (`frontend`, `backend`, `postgres`) |

---

## Phase 1: Database Schema & PostgreSQL Data Tier Setup
*Reference: Assignment 7 — Section 2 (Data Design, Tables 2, 3, and 4)*

### Step 1.1: Provision PostgreSQL & ORM / Query Builder
1. Set up a local and containerized **PostgreSQL 16** instance.
2. Integrate Prisma ORM, Drizzle ORM, or `node-postgres` (`pg`) within your project to manage migrations and parameterized SQL queries in the Repository layer.

### Step 1.2: Implement the 15 Normalized (3NF) Tables + Audit Log
Create the SQL migration scripts implementing all entities specified in **Table 2 of Assignment 7** plus your existing `change_logs` table:
1. `users` (`user_id`, `name`, `email`, `password_hash`, `role` CHECK IN `('coordinator', 'faculty')`)
2. `faculty` (`faculty_id`, `user_id` FK, `name`, `department`, `email`, `max_weekly_load`)
3. `subjects` (`subject_id`, `code`, `name`, `type` CHECK IN `('theory', 'lab', 'elective')`, `credits`, `hours_per_week`)
4. `batches` (`batch_id`, `name`, `year`, `strength`, `department`)
5. `rooms` (`room_id`, `name`, `capacity`, `type` CHECK IN `('classroom', 'lab', 'seminar')`)
6. `time_slots` (`slot_id`, `day`, `period_no`, `start_time`, `end_time`)
7. `faculty_availability` (PK `(faculty_id, slot_id)`, `is_available`)
8. `faculty_subjects` (PK `(faculty_id, subject_id)`)
9. `sessions` (`session_id`, `subject_id` FK, `faculty_id` FK, `duration_periods`, `weekly_count`, `room_type`)
10. `session_batches` (PK `(session_id, batch_id)` — **New M:N table** enabling combined multi-division classes)
11. `timetables` (`timetable_id`, `term`, `version`, `status` CHECK IN `('draft', 'under_review', 'finalized', 'published', 'revised', 'archived')`, `created_by` FK, `created_at`, `published_at`)
12. `timetable_entries` (`entry_id`, `timetable_id` FK, `session_id` FK, `slot_id` FK, `room_id` FK, `faculty_id` FK)
13. `entry_batches` (PK `(entry_id, batch_id)`, `timetable_id`, `slot_id` — **New M:N table** with controlled redundancy of `timetable_id` and `slot_id` to enforce batch uniqueness at the DB level)
14. `leaves` (`leave_id`, `faculty_id` FK, `from_date`, `to_date`, `reason`, `status`)
15. `substitutions` (`substitution_id`, `entry_id` FK, `leave_id` FK, `substitute_faculty_id` FK, `rescheduled_slot_id` FK, `rescheduled_room_id` FK, `action` CHECK IN `('substituted', 'rescheduled')`, `date`, `logged_at`)
16. `notifications` (`notification_id`, `user_id` FK, `entry_id` FK, `log_id` FK, `message`, `created_at`, `is_read`)
17. `change_logs` (`log_id`, `timetable_id` FK, `change_type`, `description`, `reason`, `changed_by`, `changed_on`)

### Step 1.3: Add Database-Level Integrity Constraints & Indexes
Implement the hard safety nets from **Assignment 7 — Table 4**:
- **Room Uniqueness:** `ALTER TABLE timetable_entries ADD CONSTRAINT uq_room_slot UNIQUE (timetable_id, room_id, slot_id);`
- **Faculty Uniqueness:** `ALTER TABLE timetable_entries ADD CONSTRAINT uq_faculty_slot UNIQUE (timetable_id, faculty_id, slot_id);`
- **Batch Uniqueness:** `ALTER TABLE entry_batches ADD CONSTRAINT uq_batch_slot UNIQUE (timetable_id, batch_id, slot_id);`
- **Referential Protection (`TC-02`):** Configure `ON DELETE RESTRICT` on foreign keys referencing `rooms`, `faculty`, `subjects`, and `batches` inside `sessions` and `timetable_entries` so records in active use cannot be deleted.
- **Performance Indexes:** Create composite indexes on `timetable_entries(timetable_id, slot_id)`, `timetable_entries(faculty_id)`, and `timetable_entries(room_id)`.

### Step 1.4: Database Seeding Script
Migrate your mock VJTI Computer/IT department dataset (faculty, subjects, SY/TY/B.Tech divisions, classrooms/labs, and time slots) into an automated database seed script (`prisma/seed.ts` or `db/seed.sql`).

---

## Phase 2: Backend Application Tier (Modular Monolith & REST API)
*Reference: Assignment 7 — Section 3 (Architectural Design, Tables 6 & 7) & Section 5 (Component Design)*

### Step 2.1: Structure the 3-Layer Backend Architecture
Organize your backend (either via Next.js App Router API routes under `src/app/api/` or a dedicated Express.js server in `server/`) into the three strict layers defined in **Figure 1 of Assignment 7**:
1. **Repositories Layer (`src/server/repositories/`)**: SQL/ORM data access only (`FacultyRepo`, `SubjectRepo`, `BatchRepo`, `RoomRepo`, `SessionRepo`, `TimetableRepo`, `LeaveRepo`, `NotificationRepo`).
2. **Services Layer (`src/server/services/`)**: Business logic (`AuthService`, `MasterDataService`, `WorkloadService`, `RoomAllocationService`, `ConstraintChecker`, `GenerationService`, `TimetableService`, `SubstitutionService`, `NotificationService`).
3. **Controllers & Middleware Layer (`src/server/controllers/` & `middleware/`)**: Request validation (Zod), JWT verification, Role-Based Access Control (RBAC), and standard JSON error formatting (`400`, `401`, `403`, `409 Conflict`).

### Step 2.2: Implement the REST API Endpoints
Implement the exact REST contract from **Assignment 7 — Table 7**:
- `POST /api/auth/login` — Authenticate user credentials, verify `bcrypt` password hash, and return a signed JWT containing `{ user_id, role, faculty_id }`.
- `GET, POST, PUT, DELETE /api/faculty`, `/api/subjects`, `/api/batches`, `/api/rooms`, `/api/sessions` — Coordinator CRUD operations with `in-use` check before deletion.
- `PUT /api/faculty/[id]/availability` — Accessible by `Coordinator` and the specific `Faculty` member to update `faculty_availability`.
- `POST /api/timetables/generate` — Coordinator endpoint that loads master data, runs `GenerationService`, and saves the generated draft in a database transaction.
- `PUT /api/entries/[id]` — Coordinator endpoint to move/edit a session (`slot_id`, `room_id`, `faculty_id`). Runs `ConstraintChecker.noClash()`. Returns `409 Conflict` with clash details if invalid, or `200 OK` and logs to `change_logs` if valid.
- `POST /api/timetables/[id]/publish` — Re-validates all entries via `ConstraintChecker`, sets status to `published`, and triggers `NotificationService.createNotifications()`.
- `GET /api/timetable?batch=&faculty=&room=` — **Public (no-login) read-only endpoint** returning only the currently `published` timetable filtered by batch, faculty, or room.
- `POST /api/leaves` — Accessible by `Faculty` and `Coordinator` to record a leave request and return impacted entries along with ranked substitute/reschedule suggestions.
- `POST /api/substitutions` — Coordinator endpoint to confirm a substitute or reschedule an entry, write to `substitutions` and `change_logs`, and dispatch notifications.
- `GET /api/notifications` & `PUT /api/notifications/read` — Fetch and mark change notifications as read for logged-in `Faculty` and `Coordinator`.

---

## Phase 3: Algorithmic Upgrades (Aligning `src/lib/` with Section 5 Pseudocode)
*Reference: Assignment 7 — Sections 5.2 to 5.7 (Algorithms 1, 2, 3, and 4)*

### Step 3.1: Unify `ConstraintChecker` as the Single Source of Truth
Refactor `src/lib/conflictDetector.ts` into the `ConstraintChecker` component specified in **Section 5.4 (Algorithm 2)** so that `GenerationService`, `TimetableService`, and `SubstitutionService` all invoke the exact same validation methods:
- Enforce multi-slot duration checks: verify that a session with `duration_periods > 1` (e.g., 2-hour lab) spans consecutive slots on the same day **without crossing a lunch break or the end of the day**.
- Enforce combined-batch capacity: verify `room.capacity >= sum(strength(b) for b in s.batches)`.
- Enforce combined-batch collision checks across every batch in `s.batches`.

### Step 3.2: Upgrade Scheduling Engine to True Backtracking (`Algorithm 1`)
Upgrade `src/lib/schedulingAlgorithm.ts` from a single-pass greedy heuristic to the **Backtracking Solver** defined in **Section 5.3**:
1. **Expand & Score Sessions:** Expand weekly occurrences and sort sessions most-constrained-first using the formula from Page 13:
   $$\text{constraintScore}(s) = \frac{1}{\text{options}} + 0.1 \times |\text{s.batches}| + 0.1 \times (\text{s.duration} - 1)$$
2. **Recursive `place(i)` with Backtracking:**
   - Maintain a step counter `steps` bounded by `STEP_LIMIT = 100000`.
   - Maintain `bestPartial` to record the deepest valid assignment reached so far.
   - If a candidate `(slot, room)` passes `noClash(s, slot, room)`, assign it and recurse `place(i + 1)`.
   - If downstream placement fails, **unassign (`backtrack`)** the session from the busy maps and try the next candidate.
3. **Graceful Partial Fallback:** If `STEP_LIMIT` is reached before 100% placement, return `Draft(bestPartial, unplaced)` with diagnostic reasons for each unplaced session.
4. **Deterministic Ordering:** Keep slot and room iteration strictly deterministic so repeated runs on identical input produce identical results (required for Test Cases `TC-03` and `TC-04`).

### Step 3.3: Add Rescheduling Fallback to Substitution Engine (`Algorithm 3`)
Enhance `src/lib/substitutionEngine.ts` according to **Section 5.5**:
- Sort eligible substitute faculty by ascending `loadRatio(f)` ($\text{currentWeeklyLoad}(f) / \text{maxLoad}(f)$) so the least-loaded eligible faculty member is recommended first.
- **Reschedule Proposal:** When `suggestSubstitutes(entry)` returns an empty list (no qualified faculty available in that slot), automatically scan for the first alternative `(slot, room)` pair where `noClash(entry.session, slot, room)` is `true` and propose rescheduling the session to that slot/room (or flag for manual action if none exists).

---

## Phase 4: Role-Based UI Screens & Usability Enhancements
*Reference: Assignment 7 — Section 4 (User Interface Design, Tables 10–13)*

### Step 4.1: Build Login Screen (`S1`) & Auth Context
1. Create `/login` (`Screen S1`) with email/password fields, role indicator, and clear error feedback.
2. Add client/server route guards so unauthenticated users are redirected to `/login` for administrative routes, while `/timetable` (`Screen S10`) remains publicly accessible.

### Step 4.2: Build the Dedicated Faculty Portal View (`S9`)
Currently, the UI only renders the Coordinator Console. Create the role-restricted **Faculty View (`Screen S9`)** with the navigation structure from **Table 12**:
- **My Timetable:** Personal weekly schedule grid highlighting assigned lectures, labs, and any substitute duties.
- **My Workload:** Personal assigned hours vs. `max_weekly_load` progress bar.
- **Availability & Leave:** Interactive 6-day $\times$ 7-period grid where the logged-in faculty member can toggle their own unavailable slots and submit leave requests (`from_date`, `to_date`, `reason`).
- **Notifications:** Personal feed of schedule changes and substitution assignments.
- *Security check:* Ensure generation controls, master data tables, and other faculty members' edit controls are completely hidden from the `Faculty` role.

### Step 4.3: Build the Login-Free Public Student/Viewer Dashboard (`S10`)
Create a standalone public route (`/timetable` or `/public`) matching **Screen S10**:
- Requires **no login**.
- Queries only the `Published` master timetable (`GET /api/timetable`).
- Provides instant filter dropdowns by **Batch/Division**, **Faculty Member**, or **Room**.
- Includes a one-click **Print / Export PDF** button.

### Step 4.4: Enhance the Shared Timetable Grid (`Section 4.5 & Table 13`)
Update `src/components/TimetableGrid.tsx` to fulfill all usability principles in **Table 13**:
1. **Drag-and-Drop Session Movement (Sequence Diagram 6.3):** Allow the Coordinator to drag a session card to a new `(day, period)` cell on the draft grid. Immediately call `PUT /api/entries/[id]`; if the backend returns `409 Conflict`, revert the card to its original cell and highlight the conflicting slot with a clear message (e.g., *"Room R2 is already booked at Mon P2 for SE-B"*).
2. **Undo Last Move:** Maintain an action history stack on the draft review screen so the Coordinator can click **"Undo Last Move"** to reverse the most recent manual edit.
3. **Combined Session Tag:** Render a distinct `"Combined"` badge on cells where `entry_batches.length > 1` (e.g., `"TY IT Div A + Div B"`).
4. **Accessibility Indicators:** Ensure every conflict cell includes a red border **plus** a warning icon and text label so meaning does not depend on color alone.

---

## Phase 5: Software Quality Assurance (SQA) & Test Execution
*Reference: Assignment 7 — Sections 1.3, 2.5, 3.7, and 5.7 (Test Cases `TC-01` to `TC-12`)*

Set up **Jest** or **Vitest** (for unit/service testing) and **Supertest / Playwright** (for API & UI integration testing) to verify the test suite referenced in your SQA Plan (`A5`):

1. **Unit Tests on `ConstraintChecker` & `WorkloadService`:**
   - Verify detection of faculty clash, room clash, batch clash, room capacity violation, room type mismatch (`Lab` vs `Classroom`), faculty unavailability violation, and weekly load overload.
   - Verify multi-period lab sessions cannot cross lunch breaks or end-of-day boundaries.
2. **Unit Tests on `GenerationService` (`TC-03`, `TC-04`):**
   - Verify deterministic repeatability (running `generateTimetable()` twice on the same seed data produces the exact same output).
   - Verify `STEP_LIMIT` termination and accurate reporting of `unplaced` sessions when impossible constraints are supplied.
3. **Database & API Integration Tests (`TC-01`, `TC-02`, etc.):**
   - **`TC-01`:** Valid Master Data CRUD operations.
   - **`TC-02`:** Attempt to `DELETE` a room or faculty member currently assigned to a timetable entry and verify the database/API blocks the deletion with `ON DELETE RESTRICT` (`400`/`409` error).
   - Verify `PUT /api/entries/[id]` rejects a double-booking move with HTTP `409 Conflict`.
   - Verify `POST /api/timetables/[id]/publish` blocks publication when any critical conflict exists.
   - Verify `POST /api/leaves` and `POST /api/substitutions` accurately update the timetable, record an audit log in `substitutions` / `change_logs`, and generate notifications.

---

## Phase 6: Containerization, Documentation & Final Deployment
*Reference: Assignment 7 — Section 3.5 (Request Flow and Deployment)*

### Step 6.1: Dockerize the Application Stack
Create the container configuration specified in **Section 3.5**:
1. `Dockerfile` for the Next.js / Node.js application build.
2. `docker-compose.yml` orchestrating:
   - `db`: PostgreSQL 16 container with persistent volume and healthcheck.
   - `app`: Application container running database migrations, seed script, and production server.
3. `.env.example` documenting `DATABASE_URL`, `JWT_SECRET`, and `NEXT_PUBLIC_API_URL`.

### Step 6.2: Cloud / Institute Server Deployment
Deploy the containerized stack to **Render**, **Vercel + Neon/Supabase PostgreSQL**, or the **VJTI Department Server** over HTTPS.

### Step 6.3: Final Project Viva & Submission Package
1. Update `DOCUMENTATION.md` with the final PostgreSQL ER schema, REST API documentation, and test execution report (`TC-01` to `TC-12` pass logs).
2. Prepare a live demo walkthrough covering the 4 UML Sequence Diagram scenarios from **Assignment 7 — Section 6**:
   - Scenario 1: Coordinator logs in and generates a conflict-free draft timetable (`Figure 2`).
   - Scenario 2: Coordinator drags a session to a clashing slot (triggers `409 Conflict` rejection) and then to a valid slot (`Figure 3`).
   - Scenario 3: Faculty member logs in, submits leave, and Coordinator assigns a recommended substitute (`Figure 4`).
   - Scenario 4: Coordinator publishes the timetable, and a Student views/prints it from the login-free public dashboard (`Figure 5`).

---

## Suggested Task Distribution for the 5-Member Team

| Team Member | Roll No. | Primary Responsibility Across Next Steps |
| :--- | :--- | :--- |
| **Tanish Hasmukh Parekh** | 241080049 | **Phase 3:** Refactor `ConstraintChecker`, upgrade `GenerationService` to Backtracking with `STEP_LIMIT`, add combined-batch (`M:N`) logic & reschedule fallback |
| **Rajgaurav Prashant Patil** | 241080051 | **Phase 1:** PostgreSQL schema setup (15 tables in 3NF), `UNIQUE` & `ON DELETE RESTRICT` constraints, indexes, and VJTI seed script |
| **Shrvan Abhijit Patil** | 241080052 | **Phase 2:** Backend Repositories, Services, and REST API Controllers (`/timetables`, `/entries`, `/leaves`, `/substitutions`, `/notifications`) |
| **Shrinivas Satyajit Patil** | 241080053 | **Phase 4:** JWT Auth (`S1`), Role-Based Access Control, Dedicated Faculty View (`S9`), Login-Free Public Timetable View (`S10`), Drag-and-Drop & Undo |
| **Satvik Nagesh Prabhu** | 241080054 | **Phase 5 & 6:** Automated Unit & API Test Suite (`TC-01` to `TC-12`), `Dockerfile` & `docker-compose.yml`, and deployment verification |