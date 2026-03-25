# Sprint 2 — Team Report (SwampSwap)

## Team Members
- Xiangyu Zhou — Frontend
- Xueni Huang — Frontend
- Aidan Winney — Backend
- Kabeer Latane — Backend

---

# 1) Work Completed in Sprint 2 (By Member)

## Xiangyu Zhou (Frontend)
### Frontend–Backend Integration (User Info)
- Verified backend is running locally on `http://localhost:8080`:
  - `cd backend && go mod tidy && go run .`
- Verified frontend is running locally on `http://localhost:5173`:
  - `cd frontend && npm install && npm run dev`
- Confirmed the **User Information** page loads real data from backend endpoint:
  - `GET /api/user/:id`
- Created a test user locally for demo / verification (example):
  - `POST /api/register` then verified with `curl http://localhost:8080/api/user/1`

### Frontend Testing
#### Cypress E2E Test
- Added Cypress E2E test for User Info page:
  - File: `frontend/cypress/e2e/user_info.cy.ts`
- What it checks:
  - Visit homepage → click “User Information” → confirm username + email appear
- How to run:
  - `cd frontend && npx cypress run`

#### Unit Test (Vitest)
- Added a basic Vitest unit “smoke test” to confirm unit test setup:
  - File: `frontend/src/__tests__/smoke.test.ts`
- How to run:
  - `cd frontend && npm test`

### PR / Branch
- My work is submitted via PR: **#39** (`test/cypress-user-info`)

---

## [Xueni Huang] (Frontend)
- (Fill in your Sprint 2 work here)
- Frontend pages/features completed:
- Cypress / Unit tests added:
- PR(s):

---

## [Aidan Winney] (Backend)
- (Fill in your Sprint 2 work here)
- Backend endpoints implemented/updated:
- Backend unit tests added:
- PR(s):

---

## [Kabeer Latane] (Backend)
- (Fill in your Sprint 2 work here)
- Backend endpoints implemented/updated:
- Backend unit tests added:
- PR(s):

---

# 2) Frontend Tests Summary (Team)
## Cypress (E2E)
- Xiangyu Zhou:
  - `frontend/cypress/e2e/user_info.cy.ts`
- [Xueni Huang]:
  - (Add your Cypress test file path here)

## Unit Tests
- Xiangyu Zhou:
  - `frontend/src/__tests__/smoke.test.ts`
- [Xueni Huang]:
  - (Add your unit test file path here)

---

# 3) Backend Unit Tests Summary (Team)
- [Aidan Winney]:
  - (List backend unit test files + run command)
- [Kabeer Latane]:
  - (List backend unit test files + run command)

Suggested run command format:
```bash
cd backend
go test ./...
