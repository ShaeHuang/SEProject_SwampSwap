# Listings API

## Public Endpoints

### GET /api/listings
Returns all active listings.

**Query Parameters:**
- `search`: optional keyword matched against title and description
- `sort`: optional sort order, one of `latest`, `oldest`, `price_asc`, `price_desc`
- `status`: optional filter, one of `all`, `available`, `sold`

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "iPhone 13",
    "description": "Barely used",
    "price": 500,
    "user_id": 1,
    "status": "available",
    "buyer_id": null,
    "seller_username": "alice",
    "created_at": "2026-02-22T15:25:00Z",
    "updated_at": "2026-02-22T15:25:00Z"
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

### POST /api/admin/listings/:id/buy
Buy an available listing.

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "message": "Listing purchased successfully.",
  "id": 1,
  "title": "iPhone 13",
  "description": "Barely used",
  "price": 500,
  "user_id": 1,
  "status": "sold",
  "buyer_id": 2,
  "seller_username": "alice",
  "created_at": "2026-02-22T15:25:00Z",
  "updated_at": "2026-02-22T15:30:00Z"
}
```

**Response (400 Bad Request):**
- `{"error": "This listing is no longer available."}`
- `{"error": "You cannot buy your own listing."}`
