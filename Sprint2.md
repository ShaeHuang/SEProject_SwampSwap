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
- My work is submitted via PR: **#45** (`test/cypress-user-info`)

---

## Xueni Huang (Frontend)
### Frontend–Backend Integration (Listings + Login)
- Verified backend is running locally on `http://localhost:8080`:
  - `cd backend && go mod tidy && go run .`
- Verified frontend is running locally on `http://127.0.0.1:5173`:
  - `cd frontend && npm install && npm run dev`
- Integrated frontend login flow with backend authentication endpoints:
  - `POST /api/login`
  - `GET /api/user`
- Aligned frontend listing requests with backend listing endpoints:
  - `GET /api/listings`
  - `GET /api/listings/:id`
  - `POST /api/listings`
  - `PUT /api/listings/:id`
- Updated frontend listing types to match backend response fields such as `ID`, `CreatedAt`, and `UpdatedAt`

### Frontend Pages / Features Completed
- Implemented the **Listings** marketplace page:
  - Added listing cards, search input, category navigation, sorting, and status filters
- Added authenticated **Sell an Item** flow:
  - Users can open a dialog, enter title/description/price, and create a listing through the protected API
- Added purchase flow on both marketplace and listing detail pages:
  - Guests are redirected to login before buying
  - Authenticated users can update a listing to `sold`
- Improved logged-in marketplace experience:
  - Current user information is loaded and displayed on the listings page

### Frontend Testing
#### Cypress E2E Test
- Added Cypress E2E test for listings and listing detail flows:
  - File: `frontend/cypress/e2e/listings.cy.ts`
- What it checks:
  - Guest browsing of listings
  - Category, search state, sort, and status filter interactions
  - Redirect to login when unauthenticated users try to buy
  - Authenticated listing creation
  - Successful purchase on listing detail page
  - Proper frontend handling of backend `401` authorization errors
- How to run:
  - `cd frontend && npx cypress run --spec cypress/e2e/listings.cy.ts`


### PR / Branch
- My work is submitted on branch:  **#39** `feature/listing-login`

---

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
  - `frontend/cypress/e2e/listings.cy.ts`

## Unit Tests
- Xiangyu Zhou:
  - `frontend/src/__tests__/smoke.test.ts`
  

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
