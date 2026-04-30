# Sprint 4 — (SwampSwap)

## Team Members
- Xiangyu Zhou — Frontend
- Xueni Huang — Frontend
- Aidan Winney — Backend
- Kabeer Latane — Backend

---

# Sprint 4 Combined Demo Video (Frontend then Backend)
https://youtu.be/WXnlaw3i6ic

---

# 1) Work Completed in Sprint 3 (By Member)

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

## Aidan Winney (Backend)

### Upgrade Image Support for Listings to Enable Multiple Images
- The ``image.go`` and ``listings.go`` files were modified so that multiple files can be parsed.
  - Two API endpoints are affected, being:
    - POST /api/listings, and
    - PUT /api/listings/:id
  - POST /api/listings now uses the processMultipleImages() function inside of it, which is a simple loop that calls the original processImage() function and appends all of its returns into lists to be returned.
  - Since SQLite does not support lists/arrays/slices as a type in a database, the list of image paths had to use ``json.Marshal()`` to convert it into a JSON-formatted byte slice. To retrieve the list of image paths, ``json.Unmarshal()`` is used to convert the []byte type into a []string type.
  - The syntax for loading the images had to be modified slightly, leading to issues with null pointer reference.
    - To remedy this, error checking was done to verify if the user sent images before referencing the images.
- I also updated ``API.md`` to reflect these changes. 
  
### Update Unit Tests for Multiple Image Listings
- One unit test in ``user_test.go`` needed to be updated to support the new multi-image functionality.
  - To do so, CreateFormFile() is called twice with two unique images.
  - The check for the images was from "does the image on the listing exist" to "does the listing have x images in it (slice length)" to reflect this.
  - When updating the listing, it goes from 2 images to 1 image, so the length check follows that change accordingly.

### Updated Unit Tests:
- As previously stated, I edited one existing test case, being ``TestListingCategoryRoundTripImage()``.

### Test Scenarios Covered
- TestListingCategoryRoundTripImage — Creates a user and adds a listing to them with two images, then updates the listing with a new singular image, both through ``multipart/form-data``.

### PR / Branch 
  - #69 (Support Multi-Image Uploads for Listings) through ``multi_image_listings``
  - #80, #82, #83 and #84 (Doc/api.md fix, Update Sprint4.md and API.md (plus minor unit test bug fix), Update video link in Sprint4.md, & added my part to sprint4.md) through ``doc/api.md-fix``, ``aidan_sprint_4_md``, ``update_sprint4_vid_link``, and ``doc/sprint4.md``

---

## Kabeer Latane (Backend)

### Work Completed in Sprint 4
- Designed and implemented the messaging system end-to-end across the backend and frontend.
- Created the Message GORM model in backend/message.go with sender, receiver, content, and is_read fields, and added it to AutoMigrate in both main.go and the test setup.
- Built three new REST endpoints behind JWT authentication:
  - GET /api/messages — returns the authenticated user's conversation list with partner username, avatar, last message preview, timestamp, and unread count, sorted by most recent activity.
  - GET /api/messages/:userId — returns the full chronological thread between the current user and a specific partner. As a deliberate side effect, marks all unread messages from the partner as read, which powers read receipts on the frontend without a separate write call.
  - POST /api/messages — sends a new message. Validates that the receiver exists and is not the sender; sender ID is always derived from the JWT, never from the request body, to prevent impersonation.
- Registered the new routes inside the protected group in main.go and the test router in user_test.go.
- Rewrote frontend/src/api/message.ts to replace mock data with real backend calls, keeping function signatures identical to the mock so the existing Chat page component required no changes.
- Handled the snake_case (receiver_id) request format vs. camelCase string ID response format cleanly across the API boundary, matching Go binding tags on input and TypeScript types on output.
- Added live polling to the Chat page: a 5-second interval re-fetches the active thread and conversation list silently in the background, so new messages and unread counts appear without requiring a manual refresh.
- Implemented read receipt UI: sender's own messages display "✓ Sent" by default and update to "✓✓ Read" once the recipient opens the thread, surfacing the backend's isRead flag visually. Combined with polling, this updates within five seconds of the recipient reading the message.
- Added an empty-state message in the conversation sidebar for users with no conversations yet.
- Added the messaging API documentation section to backend/API.md, including the three endpoints, the Message data model, and a note explaining the snake_case/camelCase boundary.
- Resolved a merge incident where backend/message.go was created locally but never staged before commit, breaking main for the team. Diagnosed via teammate's compile error, restored the file via a hotfix branch by checking it out from the original feature branch.

### PR / Branch
- fix/messaging-bug — initial backend messaging implementation
- fix/restore-message-go — hotfix to restore the missing message.go file on main
- feat/chat-improvements — frontend API rewrite, live polling, read receipts, empty state, Cypress E2E tests
- doc/api.md-fix — backend API documentation for the messaging endpoints

### Test Scenarios Covered
- TestSendAndGetMessages — Registers two users (alice and bob), sends a message from alice to bob via POST /api/messages, then fetches the thread via GET /api/messages/:userId. Verifies the send returns 201 with the content echoed back, and the thread fetch returns the message correctly.
- TestGetConversations — After alice sends a message to bob, calls GET /api/messages as alice. Verifies the conversation list returns exactly one entry with bob's username as the partner.
- TestSendMessageToSelf — Attempts to send a message where receiver_id equals the sender's own ID. Verifies the endpoint rejects the request with a 400 status code.
- TestSendMessageToNonexistentUser — Attempts to send a message to a user ID that does not exist in the database. Verifies the endpoint returns a 404 status code.

---

# 2) Frontend Tests Summary (Team)

## Unit Tests
- Xueni Huang:
  - `frontend/src/pages/Listings/Listings.test.tsx`
  - `frontend/src/api/listings.test.ts`
  - `frontend/src/lib/listing-images.test.ts`
  - 'frontend/cypress/e2e/listings.cy.ts'
- Xiangyu Zhou:
  - `frontend/cypress/e2e/messages.cy.ts`
  - `frontend/cypress/e2e/user_info.cy.ts`
  - `frontend/src/__tests__/smoke.test.ts`

---

# 3) Backend Unit Tests Summary (Team)
### user_test.go, search_test.go, and message_test.go
- To run, simply run ``go test .`` in the ``backend`` folder.
- Unit Tests:
  - ``TestRegisterUser()``
  - ``TestLoginUser()``
  - ``TestFailedLoginUser()``
  - ``TestGetUser()``
  - ``TestUpdateUser()``
  - ``TestGetUserPublicWithStats()``
  - ``TestRegisterUserAvatar()``
  - ``TestUpdateUserAvatar()``
  - ``TestListingCategoryRoundTripImage()``
  - ``TestUploadAvatar()``
  - ``TestSearchByKeyword()``
  - ``TestSearchByPriceRange()``
  - ``TestSearchNoMatches()``
  - ``TestSearchNoFilters()``
  - ``TestSendAndGetMessages()``
  - ``TestGetConversations()``
  - ``TestSendMessageToSelf()``
  - ``TestSendMessageToNonexistentUser()``
### test_listings.sh
- To run, boot up the server in one terminal with ``go run .`` in the ``backend`` folder, then in another Bash terminal, do ``chmod +x test_listings.sh`` if needed, then ``bash test_listings.sh`` to run the tests.
- Unit Tests:
  - Test 1: Register User
  - Test 2: Login and Get Token
  - Test 3: Create Listing (Authenticated)
  - Test 4: Get All Listings (Public)
  - Test 5: Get Listing by ID (Public)
  - Test 6: Update Listing (Owner)
  - Test 7: Update Listing Without Auth (Should Fail)
  - Test 8: Create Second Listing
  - Test 9: Verify Multiple Listings
  - Test 10: Delete Listing (Owner)
  - Test 11: Verify Deletion
  - Test 12: Delete Without Auth (Should Fail)
  
---

# 4) Updated Backend API Documentation (Team)

## Overview

SwampSwap is a second-hand marketplace for university students. The backend is built with Go using the Gin web framework, GORM as the ORM, SQLite as the database, and JWT for authentication.

**Base URL:** `http://localhost:8080`

All endpoints are prefixed with `/api`. Protected endpoints require a JWT token in the `Authorization` header as `Bearer <token>`.

---

## Authentication

### Register

Creates a new user account.

**Endpoint:** `POST /api/register`
**Auth Required:** No

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| username | string | Yes | Unique username |
| password | string | Yes | User password (stored as bcrypt hash) |
| email | string | No | User email address |
| avatar | image | No | User avatar |

**Example Request:**
```json
{
  "username": "johndoe",
  "password": "securepass123",
  "email": "john@ufl.edu"
}
```

If an avatar is present, use ``multipart/form-data``, and configure it such that:
| Key | Type | Value |
|-------|------|----------|
| Username | Text | \<your username\> |
| Password | Text | \<your password\> |
| Email | Text | \<your email\> |
| avatar | File | \<path to image file\> |

**Success Response (200 OK):**
```json
{
  "message": "registration was successful"
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Key: 'RegisterInput.Username' Error:Field validation for 'Username' failed on the 'required' tag"
}
```

---

### Login

Authenticates a user and returns a JWT token valid for 10 hours.

**Endpoint:** `POST /api/login`
**Auth Required:** No

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Registered username or email |
| password | string | Yes | User password |

**Example Request:**
```json
{
  "id": "johndoe",
  "password": "securepass123"
}
```

**Success Response (200 OK):**
```json
{
  "login successful, user token:": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "incorrect username/password"
}
```

**Note:** Save the returned token. Include it in all protected endpoint requests as:
`Authorization: Bearer <token>`

---

## Users

### Get User Profile (Public)

Returns a user's public profile including computed listing statistics.

**Endpoint:** `GET /api/user/:id`
**Auth Required:** No

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | User ID |

**Success Response (200 OK):**
```json
{
  "avatar": "avatars\\20260413-194336-a2926659efe62207.jpg",
  "bio": "Selling my stuff before graduation!",
  "email": "john@ufl.edu",
  "id": "1",
  "joinedAt": "2026-03-22T17:30:00Z",
  "stats": {
    "itemsPosted": 5,
    "itemsSold": 2
  },
  "username": "johndoe",
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| id | string | User ID (as string for frontend compatibility) |
| username | string | Display name |
| email | string | Email address |
| avatar | string | Path to avatar image |
| bio | string | User bio text |
| joinedAt | string | ISO 8601 timestamp of account creation |
| stats.itemsPosted | number | Total listings created by this user |
| stats.itemsSold | number | Listings with status "sold" |

**Error Response (404 Not Found):**
```json
{
  "error": "User not found"
}
```

---

### Get Current User

Returns the authenticated user's information based on the JWT token.

**Endpoint:** `GET /api/user`
**Auth Required:** Yes

**Success Response (200 OK):**
```json
{
  "data": {
    "ID": 1,
    "CreatedAt": "2026-03-22T17:30:00Z",
    "UpdatedAt": "2026-03-22T17:30:00Z",
    "DeletedAt": null,
    "username": "johndoe",
    "email": "john@ufl.edu",
    "avatar": "avatars\\20260413-194336-a2926659efe62207.jpg",
    "bio": "Selling my stuff before graduation!"
  },
  "message": "success"
}
```

---

### Update User Profile

Updates the authenticated user's profile fields. Only provided fields are updated.

**Endpoint:** `PUT /api/user`
**Auth Required:** Yes

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| username | string | No | New username |
| password | string | No | New password (will be hashed) |
| email | string | No | New email |
| avatar | image | No | New avatar image |
| bio | string | No | New bio text |

All fields are optional. Only include the fields you want to update.

**Example Request:**
```json
{
  "bio": "International student, selling furniture",
  "email": "john@ufl.edu"
}
```

If an avatar is present, use ``multipart/form-data``, and configure it such that:
| Key | Type | Value |
|-------|------|----------|
| Username | Text | \<your new username\> |
| Password | Text | \<your new password\> |
| Email | Text | \<your new email\> |
| Bio | Text | \<your new bio\> |
| avatar | File | \<path to new image file\> |


**Success Response (200 OK):**
```json
{
  "message": "User updated successfully",
  "user": {
    "ID": 1,
    "CreatedAt": "2026-03-22T17:30:00Z",
    "UpdatedAt": "2026-03-22T18:00:00Z",
    "DeletedAt": null,
    "username": "johndoe",
    "email": "john@ufl.edu",
    "avatar": "avatars\\20260413-202315-295fb5fc6d24974f.jpg",
    "bio": "International student, selling furniture"
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Unauthorized"
}
```

---

### Upload User Avatar

Uploads the authenticated user's avatar.

**Endpoint:** `POST /api/avatar`
**Auth Required:** Yes

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| avatar | image | Yes | New avatar image |

Since an avatar is present, use ``multipart/form-data``, and configure it such that:
| avatar | File | \<path to image file\> |


**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "filename": "20260413-205040-e1deba058177b6e7.jpg",
  "size": 93304,
  "url": "/avatars/20260413-205040-e1deba058177b6e7.jpg"
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "No image file provided"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Unauthorized"
}
```

---

## Listings

### Get All Listings

Returns all listings in the database.

**Endpoint:** `GET /api/listings`
**Auth Required:** No

**Success Response (200 OK):**
```json
[
  {
    "ID": 1,
    "CreatedAt": "2026-03-22T17:30:00Z",
    "UpdatedAt": "2026-03-22T17:30:00Z",
    "DeletedAt": null,
    "title": "Used Desk",
    "description": "Wooden desk, good condition",
    "price": 25.00,
    "category": "Furniture",
    "condition": "New",
    "user_id": 1,
    "status": "available",
    "image": "listings\\20260413-203042-ddd926e6a86f37bc.jpg",
    "seller_name": "seller",
    "seller_avatar": "avatars\\20260413-202315-295fb5fc6d24974f.jpg"
  },
  {
    "ID": 2,
    "CreatedAt": "2026-03-22T18:00:00Z",
    "UpdatedAt": "2026-03-22T18:00:00Z",
    "DeletedAt": null,
    "title": "Mini Fridge",
    "description": "Works perfectly, graduating soon",
    "price": 40.00,
    "category": "Appliance",
    "condition": "New",
    "user_id": 1,
    "status": "sold",
    "image": "listings\\20260413-203042-ddd926e6a86f37bc.jpg",
    "seller_name": "seller",
    "seller_avatar": "avatars\\20260413-202315-295fb5fc6d24974f.jpg"
  }
]
```

---

### Get Single Listing

Returns a single listing by ID.

**Endpoint:** `GET /api/listings/:id`
**Auth Required:** No

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Listing ID |

**Success Response (200 OK):**
```json
{
  "ID": 1,
  "CreatedAt": "2026-03-22T17:30:00Z",
  "UpdatedAt": "2026-03-22T17:30:00Z",
  "DeletedAt": null,
  "title": "Used Desk",
  "description": "Wooden desk, good condition",
  "price": 25.00,
  "user_id": 1,
  "status": "available",
  "image": "listings\\20260413-203042-ddd926e6a86f37bc.jpg",
  "seller_name": "seller",
  "seller_avatar": "avatars\\20260413-202315-295fb5fc6d24974f.jpg"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Listing not found."
}
```

---

### Create Listing

Creates a new listing. The listing is automatically assigned to the authenticated user.

**Endpoint:** `POST /api/listings`
**Auth Required:** Yes

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Listing title |
| description | string | Yes | Item description |
| price | number | Yes | Price in dollars |
| category | string | Yes | Category of item |
| condition | number | Yes | Item condition |
| image | image | No | Image(s) of item |

**Example Request:**
```json
{
  "title": "Desk Lamp",
  "description": "LED lamp, barely used",
  "price": 15.00,
  "image": <lamp.png>
}
```

If image(s) are present, use ``multipart/form-data``, and configure it such that:
| Key | Type | Value |
|-------|------|----------|
| Title | text | \<your item title\> |
| Description | text | \<your item description\> |
| Price | text | \<your item price\> |
| Category | text | \<your item category\> |
| Condition | text | \<your item condition\> |
| image | file | \<path(s) to image file(s)\> |

**Success Response (201 Created):**
```json
{
  "ID": 3,
  "CreatedAt": "2026-03-22T18:30:00Z",
  "UpdatedAt": "2026-03-22T18:30:00Z",
  "DeletedAt": null,
  "title": "Desk Lamp",
  "description": "LED lamp, barely used",
  "price": 15.00,
  "user_id": 1,
  "status": "available",
  "image": "WyJsaXN0aW5nc1xcMjAyNjA0MjktMTczMzU5LWExMGU3NTUyMGFkNTNhMjQuanBnIl0=",
  "seller_name": "seller",
  "seller_avatar": "avatars\\20260413-202315-295fb5fc6d24974f.jpg"
}
```
To support multiple images, the paths are stored as bytes in the database which can be unmarshalled to get them back.

**Error Response (401 Unauthorized):**
```json
{
  "error": "Unauthorized. Missing or invalid token."
}
```

---

### Update Listing

Updates a listing. Only the owner of the listing can update it.

**Endpoint:** `PUT /api/listings/:id`
**Auth Required:** Yes

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Listing ID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | No | Updated title |
| description | string | No | Updated description |
| price | number | No | Updated price |
| category | string | No | Updated category |
| condition | number | No | Updated condition |
| image | image | No | Updated image(s) |

All fields are optional. Only include the fields you want to update.

**Example Request:**
```json
{
  "title": "Desk Lamp - Price Drop",
  "description": "LED lamp, barely used. Must go!",
  "price": 10.00,
  "image": <lamp.png>
}
```

If an image is present, use ``multipart/form-data``, and configure it such that:
| Key | Type | Value |
|-------|------|----------|
| Title | text | \<your new item title\> |
| Description | text | \<your new item description\> |
| Price | text | \<your new item price\> |
| Category | text | \<your new item category\> |
| Condition | text | \<your new item condition\> |
| image | file | \<new path(s) to image file(s)\> |

**Success Response (200 OK):**
```json
{
  "ID": 3,
  "CreatedAt": "2026-03-22T18:30:00Z",
  "UpdatedAt": "2026-03-22T19:00:00Z",
  "DeletedAt": null,
  "title": "Desk Lamp - Price Drop",
  "description": "LED lamp, barely used. Must go!",
  "price": 10.00,
  "user_id": 1,
  "status": "available",
  "image": "WyJsaXN0aW5nc1xcMjAyNjA0MjktMTczMzU5LWExMGU3NTUyMGFkNTNhMjQuanBnIl0=",
  "seller_name": "seller",
  "seller_avatar": "avatars\\20260413-202315-295fb5fc6d24974f.jpg"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Not authorized to update this listing."
}
```

---

### Delete Listing

Deletes a listing. Only the owner of the listing can delete it.

**Endpoint:** `DELETE /api/listings/:id`
**Auth Required:** Yes

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Listing ID |

**Success Response (200 OK):**
```json
{
  "message": "Listing deleted successfully."
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Not authorized to delete this listing."
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Listing not found."
}
```

### Search/Filter Listings

Filters existing listings by a keyword, a minimum price, and/or a maximum price.

**Endpoint:** `GET /api/search`
**Auth Required:** No

**Path Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| keyword | string | No | String to look for in title or description of listing |
| minprice | number | No | Float that defines the min price value of the listings filter |
| maxprice | number | No | Float that defines the max price value of the listings filter |

**Success Response (200 OK):**
```json
{
  "ID": 1,
  "CreatedAt": "2026-03-22T17:30:00Z",
  "UpdatedAt": "2026-03-22T17:30:00Z",
  "DeletedAt": null,
  "title": "Used Desk",
  "description": "Wooden desk, good condition",
  "price": 25.00,
  "user_id": 1,
  "status": "available"
}
```

**Error Response (400 Bad Request):**
```json
{
    "error": "Query error: no matches found."
}
```
---
## Messaging

### Get Conversations

Returns a summary list of all users the authenticated user has exchanged messages with. Each entry represents one conversation, sorted by most recent activity first.

**Endpoint:** `GET /api/messages`
**Auth Required:** Yes

**Success Response (200 OK):**
```json
[
  {
    "userId": "2",
    "username": "alice",
    "avatar": "avatars\\20260413-202315-295fb5fc6d24974f.jpg",
    "lastMessage": "Yes, still available.",
    "lastAt": "2026-04-01T12:00:00Z",
    "unreadCount": 1
  },
  {
    "userId": "5",
    "username": "bob",
    "avatar": "",
    "lastMessage": "Tonight works for pickup.",
    "lastAt": "2026-04-01T10:15:00Z",
    "unreadCount": 0
  }
]
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| userId | string | The conversation partner's user ID |
| username | string | Partner's display name |
| avatar | string | Partner's avatar path (empty string if not set) |
| lastMessage | string | Content of the most recent message in the thread |
| lastAt | string | ISO 8601 timestamp of the most recent message |
| unreadCount | number | Count of unread messages from the partner to the current user |

**Error Response (401 Unauthorized):**
```json
{
  "error": "Unauthorized"
}
```

---

### Get Thread With User

Returns the full message history between the authenticated user and the specified partner, ordered chronologically. As a side effect, all unread messages **from the partner to the current user** are marked as read.

**Endpoint:** `GET /api/messages/:userId`
**Auth Required:** Yes

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | The conversation partner's user ID |

**Success Response (200 OK):**
```json
[
  {
    "id": "1",
    "senderId": "1",
    "receiverId": "2",
    "content": "Hey, is this still available?",
    "createdAt": "2026-04-01T11:55:00Z",
    "isRead": true
  },
  {
    "id": "2",
    "senderId": "2",
    "receiverId": "1",
    "content": "Yes, still available.",
    "createdAt": "2026-04-01T12:00:00Z",
    "isRead": false
  }
]
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| id | string | Message ID |
| senderId | string | Sender's user ID |
| receiverId | string | Receiver's user ID |
| content | string | Message text |
| createdAt | string | ISO 8601 timestamp of when the message was sent |
| isRead | boolean | Whether the receiver has opened the thread since this message was sent |

**Note:** The frontend uses this side effect to power read receipts. When the recipient calls this endpoint, the sender's unread messages flip to `isRead: true`. On the sender's next poll of the same thread, their messages will reflect the new read state.

**Error Response (401 Unauthorized):**
```json
{
  "error": "Unauthorized"
}
```

---

### Send Message

Sends a new message to another user. The sender is automatically derived from the JWT token.

**Endpoint:** `POST /api/messages`
**Auth Required:** Yes

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| receiver_id | number | Yes | ID of the user receiving the message |
| content | string | Yes | Message text (must be non-empty) |

**Example Request:**
```json
{
  "receiver_id": 2,
  "content": "Hey, is this still available?"
}
```

**Success Response (201 Created):**
```json
{
  "id": "3",
  "senderId": "1",
  "receiverId": "2",
  "content": "Hey, is this still available?",
  "createdAt": "2026-04-01T12:05:00Z",
  "isRead": false
}
```

**Error Response (400 Bad Request):**

Returned when `receiver_id` equals the sender's own ID, or when `content` is empty.

```json
{
  "error": "Cannot send a message to yourself"
}
```

**Error Response (404 Not Found):**

Returned when the specified `receiver_id` does not match an existing user.

```json
{
  "error": "Receiver not found"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Unauthorized"
}
```

**Note:** Field naming differs intentionally between request and response. Inputs use snake_case (`receiver_id`) to match Go binding tags; outputs use camelCase string IDs (`senderId`, `receiverId`) to match the frontend TypeScript types.


---

## Data Models

### User

| Field | Type | Description |
|-------|------|-------------|
| ID | uint | Auto-incremented primary key |
| CreatedAt | timestamp | Account creation time |
| UpdatedAt | timestamp | Last profile update time |
| Username | string | Unique username |
| Password | string | Bcrypt-hashed password (never returned in responses) |
| Email | string | Email address |
| Avatar | string | URL to avatar image |
| Bio | string | User biography |

### Listing

| Field | Type | Description |
|-------|------|-------------|
| ID | uint | Auto-incremented primary key |
| CreatedAt | timestamp | Listing creation time |
| UpdatedAt | timestamp | Last update time |
| Title | string | Item title |
| Description | string | Item description |
| Price | float64 | Price in dollars |
| Status | string | "available" (default) or "sold" |
| Image | []byte | Byte representation of image path(s) |
| UserID | uint | Foreign key to User who created the listing |


---
### Message

| Field | Type | Description |
|-------|------|-------------|
| ID | uint | Auto-incremented primary key |
| CreatedAt | timestamp | Send time |
| UpdatedAt | timestamp | Last modification time |
| SenderID | uint | Foreign key to User who sent the message |
| ReceiverID | uint | Foreign key to User who receives the message |
| Content | string | Message text |
| IsRead | bool | True once the receiver has opened the thread containing this message |
---

## Error Handling

All error responses follow this format:

```json
{
  "error": "Description of what went wrong"
}
```

Some errors include additional detail:

```json
{
  "error": "Database error: failed to create listing.",
  "details": "specific error message"
}
```

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created (new listing) |
| 400 | Bad request (invalid JSON, missing fields) |
| 401 | Unauthorized (missing or invalid JWT token) |
| 404 | Not found (user or listing doesn't exist) |
| 500 | Server error (database failure) |

---

## Authentication Flow

1. User registers via `POST /api/register`
2. User logs in via `POST /api/login` and receives a JWT token
3. Token is included in all protected requests as: `Authorization: Bearer <token>`
4. Tokens expire after 10 hours
5. Token contains the user's ID, which is used to identify them for protected operations

---

## CORS Configuration

The backend allows cross-origin requests from:
- `http://localhost:3000`
- `http://localhost:3001`
- `http://localhost:5173`

Allowed methods: GET, POST, PUT, DELETE, OPTIONS
Allowed headers: Origin, Content-Type, Authorization

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Language | Go |
| Web Framework | Gin |
| ORM | GORM |
| Database | SQLite |
| Authentication | JWT (dgrijalva/jwt-go) |
| Password Hashing | bcrypt |
| CORS | gin-contrib/cors |

---