# Sprint 3 — Team Report (SwampSwap)

## Team Members
- Xiangyu Zhou — Frontend
- Xueni Huang — Frontend
- Aidan Winney — Backend
- Kabeer Latane — Backend

---

# 1) Work Completed in Sprint 3 (By Member)

## Xiangyu Zhou (Frontend)

### Work Completed in Sprint 3
- Added avatar upload flow on **User Information / Profile** page and connected it to backend API.
- Expanded **Cypress E2E** coverage for the User Info page (auth redirect, empty state, listings rendering, error state, profile update).

### PR / Branch
- My work is submitted via PR: #62 (feat/user-info-avatar-upload-and-tests)

### Frontend Tests (Cypress)
- File: `frontend/cypress/e2e/user_info.cy.ts`

#### How to run
1) Backend: `cd backend && go mod tidy && go run .`  (http://localhost:8080)  
2) Frontend: `cd frontend && npm install && npm run dev`  (http://localhost:5173)  
3) Cypress: `cd frontend && npx cypress run --spec "cypress/e2e/user_info.cy.ts"`

#### Test Scenarios Covered (6)
1. Loads user profile (renders username/email).
2. Redirects to login when no token exists.
3. Shows empty-state UI when user has no listings.
4. Renders listings and validates Items Posted / Items Sold stats.
5. Shows error UI when profile loading fails (500).
6. Avatar update flow: intercepts `PUT /api/user` and verifies `avatar` is included in request payload.
---

## Xueni Huang (Frontend)
- [Fill in what Xueni did in Sprint 3]
- Frontend tests added:
  - Cypress:
  - Unit tests:

---

## Aidan Winney (Backend)
- [Fill in what Aidan did in Sprint 3]
- Backend unit tests added/updated:
  - (List test files + how to run)

---

## Kabeer Latane (Backend)
- [Fill in what Kabeer did in Sprint 3]
- Backend unit tests added/updated:
  - (List test files + how to run)

---

# 2) Frontend Tests Summary (Team)

## Unit Tests
- Xiangyu Zhou:
  - `frontend/cypress/e2e/user_info.cy.ts`
- Xueni Huang:
  - [List unit test file(s)]

---

# 3) Backend Unit Tests Summary (Team)
- [Backend member Aidan: list tests + how to run]
- [Backend member Kabeer: list tests + how to run]

Example:
- Run backend unit tests:
  - `cd backend && go test ./...`

---

# 4) Updated Backend API Documentation (Team)
- Link to API documentation file (if your repo has one):
  - `backend/docs/api.md` (example)
- Summary of what changed in Sprint 3:
  - [New endpoints]
  - [Updated request/response formats]
  - [Auth changes if any]
