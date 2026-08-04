# shiftwerk
A personal planner which shifts can be planned for small companies

## Problem / who it's for 
A small company which has 5-6 employees plan and write down the working hours still on Paper. The Boss has to summarize all that by hand every month. New Employees are coming and others are going, because they're students and every time he need to create a new paper with plan etc. The Boss want to be digital.

## v1 Scope - what it DOES
- Employees clock in / out (button now, QR later)
- Admin sees who worked which shift + total hour
- AI plans shifts
- Admin queries hours in natural language

## Out of scope (v2 shelf)
- Multi-company
- QR trigger
- Coverage checks
- Public holidays
- TimeEntry <-> shift link

## Domain model
- User
    - Fields: name, username, email, birthdate, role
    - Relationships: has many Shifts, TimeEntries, Absences
- TimeEntry
    - Fields: employee -> user, clockIn, clockOut (nullable)
    - Realtionships: belongt to User, hours = computed
- Shift
    - Fields: employee -> User, date, plannedStart, plannedEnd
    - Relationships: belongs to User
- Absence 
    - Fields: employee -> user, type, from, to
    - Relationships: belongs to User


## Tech stack
- Express
- Mongoose
- Passport
- Jest/Supertest
- Docker
- Gea (Frontend)
- agent loop

## Architecture / strategy
- Layered backend:
    - models -> manager -> routes -> middleware
- TDD

## Plan / milestones
1. Skeleton (health check + passing test)
2. User model (test-first)
3. TimeEntry, Shift, Absence
4. Auth + RBAC
5. gea frontend
6. Agent loop
7. Docker

## AI features (planned - design finalized at milestone 6)
- Shift planner:
    - an agent loop that reads employees + absences + constraints, drafts a schedule, validates it (no one scheduled during an absence, hour lmits), and revises until valid. Multi-step, not a single API call.
- Hours query:
    - An agent that turns "give me Ali's hours this month" into DB lookups via tools, then answers in plain language

## How to run
tBD - not runnable yet