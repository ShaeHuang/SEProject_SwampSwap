# Sprint 4 — (SwampSwap)

## Xueni Huang (Frontend)

### Work Completed in Sprint 4
- Added listing photo upload support in the frontend marketplace flow.
- Connected the Marketplace **Sell an Item** dialog to the backend `multipart/form-data` listing API.
- Added photo selection support when creating a listing from the User Profile page.
- Added a **Replace photos** option when editing an existing listing from the User Profile page.
- Updated the listing API helper so it automatically sends JSON when no photos are selected and `multipart/form-data` when photos are selected.
- Fixed frontend and backend field-name compatibility for photo uploads by sending `Title`, `Description`, `Price`, `Category`, `Condition`, and repeated `image` fields in multipart requests.
- Fixed an issue where listings created with photos saved the price as `$0` because the backend did not receive the expected multipart field names.
- Added frontend normalization for listing image paths returned by the backend so uploaded listing photos can be displayed correctly in the UI.
- Updated the Marketplace page, Listing Detail page, and User Profile listing cards to display uploaded listing images.
- Changed listing image display from cropped rendering to full-image rendering so users can see the complete uploaded photo.
- Fixed local development CORS issues when Vite runs on `localhost:5173`, `localhost:5174`, or `localhost:5175`.
- Fixed duplicate-key warnings in listing creation unit tests by ensuring mocked created listings use unique IDs.
- Added frontend unit tests for listing photo upload and multipart payload behavior.

### PR / Branch
- My work is submitted via branch: `feature/upload-image`
- PR: #78 (to be filled)

## Frontend Tests (Unit Tests)

- To validate the frontend behavior introduced in this update, unit tests were added and updated for marketplace-related listing creation and image upload flows. The test suite focuses on the Listings page and the listing API helper, covering both user-facing upload behavior and the request payload sent to the backend.
- These tests are designed to verify that the UI responds correctly when a user selects photos while creating a listing. The suite also checks that the frontend sends the expected data shape for key operations, especially after adding listing photos and switching from JSON requests to `multipart/form-data` requests when files are present.
- To keep the tests deterministic and independent from backend database state, the page tests mock API helpers such as `listListings()` and `createListing()`. This allows the test suite to validate request payloads, state updates, form behavior, and image upload behavior in a controlled environment.
- The unit test suite is executed from the frontend project.

### How to run
- The Vitest configuration uses the local jsdom test environment.
- The primary unit test files included in this update are:
  - `frontend/src/pages/Listings/Listings.test.tsx`
  - `frontend/src/api/listings.test.ts`
  - `frontend/src/lib/listing-images.test.ts`


## Test Scenarios Covered

1. Marketplace listing creation with existing fields. This test verifies that a logged-in user can open the “Sell an Item” dialog and submit a new listing with `title`, `description`, `price`, `category`, and `condition`.

2. Marketplace listing creation with selected photos. This test verifies that a user can choose an image file in the listing creation form and that the selected file is included in the `images` payload sent to `createListing()`.

3. Multipart request construction for listing photos. This test verifies that the frontend listing API sends `multipart/form-data` when images are present instead of sending a raw JSON request.

4. Backend-compatible field names for uploads. This test verifies that multipart requests use the field names expected by the backend: `Title`, `Description`, `Price`, `Category`, `Condition`, and `image`.

5. Listing image path normalization. This test verifies that listing image paths returned from the backend are normalized into usable frontend URLs, including paths served from `/listing-files`.

6. Full image display in listing UI. This update verifies that listing images are rendered with `object-contain` on marketplace cards, listing detail pages, and user profile listing cards so uploaded photos are not cropped.

7. Duplicate-key warning prevention. This test update ensures mocked created listings use unique IDs so React does not warn about duplicate list keys during create-listing tests.

2) Frontend Tests Summary (Team)
Unit Tests
Xueni Huang:
`frontend/src/pages/Listings/Listings.test.tsx`
`frontend/src/api/listings.test.ts`
`frontend/src/lib/listing-images.test.ts`


## Xiangyu Zhou (Frontend)

### Work Completed in Sprint 4
- Added Cypress E2E coverage for the **Chat** page to validate key user flows:
  - Refresh behavior (conversation list + current thread reload).
  - Sending a message and verifying it appears in the message thread.
- Fixed a Chat page bug where clicking **Refresh** only reloaded the conversation list, but did not reload the currently selected message thread.
- Aligned Chat page behavior with the new Cypress expectations by ensuring Refresh triggers both:
  - `loadConversations()` and
  - `loadThread(selectedUserId)` when a conversation is selected.
- Converted the bug into a tracked GitHub issue and closed it via PR(s) (see below).

### PR / Branch
- My work is submitted via PR: **#77** (`feat/chat-refresh-test`)
- My work is submitted via PR: **#79** (`fix-chat-cypress`)
- Related issues:
  - **#75** Chat page Refresh button does not reload the current message thread
  - **#76** Test: Add Cypress coverage for Chat page refresh and send flow

## Frontend Tests (Cypress E2E)

### How to run
- Start backend:
  - `cd backend && go mod tidy && go run .`
- Start frontend:
  - `cd frontend && npm install && npm run dev`
- Run Cypress Chat spec only:
  - `cd frontend && npx cypress run --spec "cypress/e2e/messages.cy.ts"`
- (Optional) Run all Cypress specs:
  - `cd frontend && npx cypress run`

### Test File
- `frontend/cypress/e2e/messages.cy.ts`

### Test Scenarios Covered

1) Refresh reloads the current thread and shows new incoming messages  
- **What it does:** Intercepts `/api/messages` (conversations) and `/api/messages/:userId` (thread). The first thread load returns empty, then after clicking **Refresh**, the thread returns a new incoming message.  
- **Why it matters:** Ensures the Refresh button actually updates the active thread (not just the left-side list).

2) Sending a message updates the thread UI  
- **What it does:** Intercepts `POST /api/messages`, validates the frontend sends the correct payload fields, and returns a mock created message. Then verifies the message content appears in the chat thread.  
- **Why it matters:** Confirms the send-message flow triggers the API call and updates the UI correctly.