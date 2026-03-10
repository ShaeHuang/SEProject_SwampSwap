package main

import (
	"fmt"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func main() {
	ConnectDatabase()
	r := gin.Default()

	// CORS Configuration - allows frontend to call backend
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:3000",  // Create React App
			"http://localhost:3001",  
			"http://localhost:5173",  // Vite (common in modern React)
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// PUBLIC ROUTES (no authentication required)
	// Auth endpoints
	r.POST("/api/register", Register)
	r.POST("/api/login", Login)
	
	// Browsing listings (allow non-logged-in users to browse)
	r.GET("/api/listings", GetListings)
	r.GET("/api/listings/:id", GetListingByID)

	// PROTECTED ROUTES (authentication required)
	protected := r.Group("/api")
	protected.Use(JWTMiddleware())
	{
		// User management
		protected.GET("/user", CurrentUser)
		
		// Listing management (requires login)
		protected.POST("/listings", CreateListing)
		protected.PUT("/listings/:id", UpdateListing)
		protected.DELETE("/listings/:id", DeleteListing)
	}

	err := r.Run(":8080")
	if err != nil {
		panic("Failed to start server: " + err.Error())
	}
}

func ConnectDatabase() {
	database, err := gorm.Open(sqlite.Open("users.db"), &gorm.Config{})
	if err != nil {
		panic("database failed to connect")
	} else {
		fmt.Println("database connection successful")
	}

	DB = database
	DB.AutoMigrate(&User{}, &Listing{})
}
/*```

---

## What Changed?

### 1. **Consistent Paths** ✅
All listing operations now use `/api/listings`:
- `GET /api/listings` - Browse (public)
- `GET /api/listings/:id` - View details (public)
- `POST /api/listings` - Create (protected)
- `PUT /api/listings/:id` - Update (protected)
- `DELETE /api/listings/:id` - Delete (protected)

### 2. **Logical Access Control** ✅
- **Public:** Anyone can browse/view listings (good for marketplace)
- **Protected:** Must be logged in to create/edit/delete

### 3. **Added Vite Port** ✅
Added `http://localhost:5173` to CORS (Vite is increasingly common)

---

## Complete API Endpoint List

After this fix, your full API will be:

### Public (No Auth Required)
```
POST   /api/register
POST   /api/login
GET    /api/listings
GET    /api/listings/:id
```

### Protected (Auth Required)
```
GET    /api/user
POST   /api/listings
PUT    /api/listings/:id
DELETE /api/listings/:id
```
*/

