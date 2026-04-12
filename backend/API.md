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
    "description": "Includes charger and original box",
    "price": 500,
    "category": "Digital Product",
    "condition": "Like new",
    "user_id": 1,
    "status": "available",
    "CreatedAt": "2026-02-22T15:25:00Z"
  }
]
```

### GET /api/listings/:id
Returns a single listing by ID.

**Response (200 OK):** Same as above, single object
**Response (404 Not Found):** `{"error": "Listing not found."}`

## Protected Endpoints (Require JWT)

### GET /api/user/listings
Return the authenticated user's own listings for profile management.

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "message": "success",
  "data": [
    {
      "ID": 1,
      "title": "Desk Lamp",
      "description": "Apartment pickup",
      "price": 25,
      "category": "Furniture",
      "condition": "Used",
      "user_id": 1,
      "status": "available"
    }
  ]
}
```

### POST /api/listings
Create a new listing.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "iPhone 13",
  "description": "Includes charger and original box",
  "price": 500,
  "category": "Digital Product",
  "condition": "Like new"
}
```

**Response (201 Created):** Created listing object

### PUT /api/listings/:id
Update a listing (owner only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:** Same as POST

**Response (200 OK):** Updated listing
**Response (401 Unauthorized):** Not owner or no auth

### DELETE /api/listings/:id
Delete a listing (owner only).

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):** `{"message": "Listing deleted successfully."}`
**Response (401 Unauthorized):** Not owner or no auth
