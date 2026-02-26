# Listings API

## Public Endpoints

### GET /api/listings
Returns all active listings.

**Response (200 OK):**
```json
[
  {
    "ID": 1,
    "title": "iPhone 13",
    "description": "Barely used",
    "price": 500,
    "user_id": 1,
    "CreatedAt": "2026-02-22T15:25:00Z"
  }
]
```

### GET /api/listings/:id
Returns a single listing by ID.

**Response (200 OK):** Same as above, single object
**Response (404 Not Found):** `{"error": "Listing not found."}`

## Protected Endpoints (Require JWT)

### POST /api/admin/listings
Create a new listing.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "iPhone 13",
  "description": "Barely used",
  "price": 500
}
```

**Response (201 Created):** Created listing object

### PUT /api/admin/listings/:id
Update a listing (owner only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:** Same as POST

**Response (200 OK):** Updated listing
**Response (401 Unauthorized):** Not owner or no auth

### DELETE /api/admin/listings/:id
Delete a listing (owner only).

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):** `{"message": "Listing deleted successfully."}`
**Response (401 Unauthorized):** Not owner or no auth