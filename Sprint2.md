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

## [Aidan Winney] (Backend)
### Search Functionality for Backend API
- Created a new ``search.go`` file which supports lookup for existing listings.
  - The currently supported filters are:
    -  Keyword (substring in either the title or the description),
    -  Minimum selling price, and
    -  Maximum selling price.
  - The search functionality was made robust using pointers for the GORM model, allowing every field to be optional.
    - This allows queries to use any combination of the filters with no limitations.   
  - I am open to adding more filters based on the needs of the frontend in future sprints (by user, listing recency, et cetera).
- For how to run this new functionality, refer to the backend API documentation later on in this document.

### User Login API Change
- Overhauled the login API call in ``auth.go`` to support either an email or a username as the ID credential as requested by the frontend team.
  - The JSON input for "username" was changed to "id" to reflect this change.
 
### Unit Testing
- I added a couple of unit tests to verify the API functionality in ``user_test.go``, including these tests:
  - ``TestRegisterUser()``
  - ``TestLoginUser()``
  - ``TestFailedLoginUser()``
  - ``TestGetUser()``

### Bug Fixes and Cleaning up Backend Code
- Various bug fixes for the backend code, including:
  - Changed some unit tests that were failing due to my API changes.
  - Allowed the frontend to change the status of a listing through the ``PUT api/listings`` call in ``listings.go``, as it was causing the frontend team some issues due to the lack of functionality.
  - Fixed some formatting issues in ``test_listings.sh``.
- Main PR(s): #42, #47, #48, #51

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
### user_test.go
- To run, simply run ``go test .`` in the ``backend`` folder.
- Unit Tests:
  - ``TestRegisterUser()``
  - ``TestLoginUser()``
  - ``TestFailedLoginUser()``
  - ``TestGetUser()``
  - ``TestUpdateUser()``
  - ``TestGetUserPublicWithStats()``
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

# 4) SwampSwap Backend API Documentation

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

**Example Request:**
```json
{
  "username": "johndoe",
  "password": "securepass123",
  "email": "john@ufl.edu"
}
```

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
  "id": "1",
  "username": "johndoe",
  "email": "john@ufl.edu",
  "avatar": "",
  "bio": "Selling my stuff before graduation!",
  "joinedAt": "2026-03-22T17:30:00Z",
  "stats": {
    "itemsPosted": 5,
    "itemsSold": 2
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| id | string | User ID (as string for frontend compatibility) |
| username | string | Display name |
| email | string | Email address |
| avatar | string | URL to avatar image |
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
  "message": "success",
  "data": {
    "ID": 1,
    "CreatedAt": "2026-03-22T17:30:00Z",
    "UpdatedAt": "2026-03-22T17:30:00Z",
    "DeletedAt": null,
    "username": "johndoe",
    "email": "john@ufl.edu",
    "avatar": "",
    "bio": ""
  }
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
| avatar | string | No | New avatar URL |
| bio | string | No | New bio text |

All fields are optional. Only include the fields you want to update.

**Example Request:**
```json
{
  "bio": "International student, selling furniture",
  "email": "john@ufl.edu"
}
```

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
    "avatar": "",
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
    "user_id": 1,
    "status": "available"
  },
  {
    "ID": 2,
    "CreatedAt": "2026-03-22T18:00:00Z",
    "UpdatedAt": "2026-03-22T18:00:00Z",
    "DeletedAt": null,
    "title": "Mini Fridge",
    "description": "Works perfectly, graduating soon",
    "price": 40.00,
    "user_id": 1,
    "status": "sold"
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
  "status": "available"
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

**Example Request:**
```json
{
  "title": "Desk Lamp",
  "description": "LED lamp, barely used",
  "price": 15.00
}
```

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
  "status": "available"
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
| title | string | Yes | Updated title |
| description | string | Yes | Updated description |
| price | number | Yes | Updated price |

**Example Request:**
```json
{
  "title": "Desk Lamp - Price Drop",
  "description": "LED lamp, barely used. Must go!",
  "price": 10.00
}
```

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
  "status": "available"
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
