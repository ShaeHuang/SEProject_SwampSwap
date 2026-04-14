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

### Image Support for Profile Avatars and Listings
- Created a new ``image.go`` file that enables the backend to store images for the frontend to use.
    - These images are not stored inside the database, but instead in directories in the backend folder.
        - For avatars, they are stored in the backend/avatars folder.
        - For listing images, they are stored in the backend/listings folder.
        - There is also a backend/test_imgs folder for images used in unit tests.
    - The listing and users will link to their respective uploaded images through a string delineating the relative path of the image in the backend.
    - Only singular images are supported currently; next sprint I will add support for multiple images in listings through string slices.

### multipart/form-data support
- Since images cannot be added in raw JSON data, the backend had to accommodate for that through ``multipart/form-data``.
    - Thus, any of the API calls that can take images had their bindings loosened to support both JSON and ``multipart/form-data``.
    - This keeps the existing frontend code functional but also allows for new frontend functionality with images.
        - The affected endpoints include:
            - ``POST /api/register``,
            - ``PUT /user``,
            - ``POST /listings``,
            - ``PUT /listings/:id``, and
            - ``POST /avatar``
    - The added unit tests take advantage of this change to verify image functionality for the backend.


### New Unit Tests
- I added 4 new unit tests to test the functionality of the image support in the backend, which includes:
    - ``TestRegisterUserAvatar()``,
    - ``TestUpdateUserAvatar()``,
    - ``TestListingCategoryRoundTripImage()``, and
    - ``TestUploadAvatar()``
- These unit tests cover:
    - Registering a user with an avatar through ``multipart/form-data``,
    - Updating a user with an avatar through ``multipart/form-data``,
    - Creating a user and adding a listing to them with an image, then updating the listing with a new image, both through ``multipart/form-data``, and
    - Uploading an avatar for an existing user through ``multipart/form-data``.

### PRs
    - #57 (Added avatar upload endpoint to API)
    - #61 (Streamline image code & add support for an image for listings)

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
### user_test.go and search_test.go
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
| image | image | No | Image of item |

**Example Request:**
```json
{
  "title": "Desk Lamp",
  "description": "LED lamp, barely used",
  "price": 15.00
}
```

If an image is present, use ``multipart/form-data``, and configure it such that:
| Key | Type | Value |
|-------|------|----------|
| Title | text | \<your item title\> |
| Description | text | \<your item description\> |
| Price | text | \<your item price\> |
| Category | text | \<your item category\> |
| Condition | text | \<your item condition\> |
| image | file | \<path to image file\> |

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
  "image": "listings\\20260413-204250-99754756f6387b69.jpg",
  "seller_name": "seller",
  "seller_avatar": "avatars\\20260413-202315-295fb5fc6d24974f.jpg"
}
```

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
| image | image | No | Updated image |

All fields are optional. Only include the fields you want to update.

**Example Request:**
```json
{
  "title": "Desk Lamp - Price Drop",
  "description": "LED lamp, barely used. Must go!",
  "price": 10.00
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
| image | file | \<new path to image file\> |

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
  "image": "listings\\20260413-204250-99754756f6387b69.jpg",
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
| UserID | uint | Foreign key to User who created the listing |

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
