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
To support deleting images from listings, attaching no images to the call will remove the current image(s) from the listings. To keep the current listing image(s), you must upload them again.

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