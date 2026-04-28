package main

import (
	"fmt"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func main() {
	if err := os.MkdirAll("./avatars", 0755); err != nil {
		panic(fmt.Sprintf("Failed to create uploads directory: %v", err))
	}
	if err := os.MkdirAll("./listings", 0755); err != nil {
		panic(fmt.Sprintf("Failed to create uploads directory: %v", err))
	}

	ConnectDatabase()
	r := gin.Default()
	r.MaxMultipartMemory = 8 << 20

	// CORS Configuration
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:3000", // Create React App
			"http://localhost:3001",
			"http://localhost:5173", // Vite
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	r.Static("/files", "./avatars")
	r.Static("/listing-files", "./listings")

	// PUBLIC ROUTES
	r.POST("/api/register", Register)
	r.POST("/api/login", Login)
	r.GET("/api/listings", GetListings)
	r.GET("/api/listings/:id", GetListingByID)
	r.GET("/api/user/:id", GetUserPublic)
	r.GET("/api/search", SearchQuery)

	// PROTECTED ROUTES
	protected := r.Group("/api")
	protected.Use(JWTMiddleware())
	{
		protected.GET("/user", CurrentUser)
		protected.GET("/user/listings", GetCurrentUserListings)
		protected.POST("/listings", CreateListing)
		protected.PUT("/listings/:id", UpdateListing)
		protected.DELETE("/listings/:id", DeleteListing)
		protected.PUT("/user", UpdateUser)
		protected.PUT("/listings/:id/buy", BuyListing)
		protected.POST("/avatar", uploadAvatar)
		protected.GET("/messages", GetConversations)
		protected.GET("/messages/:userId", GetMessagesWithUser)
		protected.POST("/messages", SendMessage)
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
	DB.AutoMigrate(&User{}, &Listing{}, &Message{})
}
