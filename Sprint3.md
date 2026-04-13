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

### Work Completed in Sprint 3
- Added avatar support in registration and profile update flows.
- Added `category` and `condition` fields for listings.
- Enriched listing APIs with seller name and seller avatar.
- Added current user listings support with `GET /api/user/listings`.
- Updated listing edit logic to support partial updates.
- Added frontend APIs for current user profile, current user listings, listing edit, and listing delete.
- Added category filtering and richer listing display on the Marketplace page.
- Updated the Buy flow to redirect users to chat with a prefilled draft message.
- Prevented users from buying their own listings.
- Reworked the User Profile page around the current authenticated user.
- Added profile summary cards, avatar editing, and listing management on the profile page.
- Supported creating, editing, and deleting listings directly from the profile page.
- Added frontend tests for login, registration, marketplace, and user profile flows.

### PR / Branch
- My work is submitted via PR: #59

## Frontend Tests (Cypress)

- To validate the frontend behavior introduced in this update, Cypress end-to-end tests were added for the marketplace-related user flows. The test suite focuses on the Listings page and the Listing Detail page, covering both public access behavior and authenticated user interactions.
- These tests are designed to verify that the UI responds correctly to user actions such as browsing by category, applying filters, attempting protected actions, and submitting new listings. The suite also checks that the frontend sends the expected API requests for key operations, especially after introducing the new listing fields `category` and `condition`.
- To keep the tests deterministic and independent from backend database state, the Cypress tests use `cy.intercept()` to mock API responses. This allows the test suite to validate request payloads, route navigation, state updates, and access-control behavior in a controlled environment.
- The Cypress test suite is executed from the frontend project.

#### How to run
- The Cypress configuration uses the following local test target: Base URL: http://localhost:5173
- The primary end-to-end test file included in this update is: cypress/e2e/listings.cy.ts

## Test Scenarios Covered

1. Marketplace page rendering for guest users.This test verifies that unauthenticated users can open the Listings page and view the main marketplace interface, including listing cards, category navigation buttons, and the login entry point.

2. Category-based filtering. This test verifies that selecting a category correctly filters the visible listings and updates the URL query string to reflect the active category selection.

3. Filter clearing and reset behavior. This test verifies that the user can remove an active category filter by selecting `All`, and that the reset control restores the default filtering state for search, sort, and status.

4. Sorting and status filter interaction. This test verifies that the sort dropdown and status dropdown update the page state correctly while continuing to fetch data from the public listings endpoint.

5. Access control for protected buy actions. This test verifies that guest users attempting to buy an item are blocked from performing the protected action and are redirected to the login page with the appropriate feedback message.

6. Authenticated listing creation with extended fields. This test verifies that a logged-in user can open the “Sell an Item” dialog, submit a new listing, and send the correct API payload including `title`, `description`, `price`, `category`, and `condition`.

---

## Aidan Winney (Backend)
- [Fill in what Aidan did in Sprint 3]
- Backend unit tests added/updated:
  - (List test files + how to run)

---

## Kabeer Latane (Backend)
### Bug Fixes
- Fixed `search.go`: rewrote `SearchQuery` handler to use `c.Query()` instead of `ShouldBindJSON`, since GET requests don't carry JSON bodies — every search call was failing with a 400
- Fixed `search.go`: empty search results now return 200 with `[]` instead of 400 with an error message
- Fixed `main.go`: moved `uploadAvatar` from public routes to the protected route group — it requires authentication internally but the JWT middleware was never running on it

### New Feature: Messaging API
- Created `Message` model (`message.go`) with sender ID, receiver ID, content, and is_read flag
- Implemented `GET /api/messages` — returns conversation list for the authenticated user with last message, timestamp, and unread count per conversation partner
- Implemented `GET /api/messages/:userId` — returns full message thread between authenticated user and target user, sorted chronologically; marks incoming messages as read
- Implemented `POST /api/messages` — sends a message to another user with validation (receiver must exist, cannot message yourself)
- Designed all response shapes to match existing frontend TypeScript interfaces (`Message`, `ConversationItem`) for drop-in integration
- Added `Message` to database migration in `main.go`

### Unit Tests
- `search_test.go`: `TestSearchByKeyword`, `TestSearchByPriceRange`, `TestSearchNoMatches`, `TestSearchNoFilters`
- `message_test.go`: `TestSendAndGetMessages` (full send/reply/thread/conversation flow), `TestCannotMessageSelf`
- Updated `setupRouter()` in `user_test.go` to register `/api/search`, `/api/listings/:id/buy`, and all three messaging routes

### PRs
- PR #__ (`fix/search-and-cleanup`) — bug fixes + search tests
- PR #__ (`feat/messaging-backend`) — messaging API + tests

---

# 2) Frontend Tests Summary (Team)

## Unit Tests
- Xiangyu Zhou:
  - `frontend/cypress/e2e/user_info.cy.ts`
- Xueni Huang:
  - 'frontend/cypress/e2e/listings.cy.ts'

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
