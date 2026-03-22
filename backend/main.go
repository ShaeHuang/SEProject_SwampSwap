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

	// CORS Configuration
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:3000",  // Create React App
			"http://localhost:3001",  
			"http://localhost:5173",  // Vite
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// PUBLIC ROUTES
	r.POST("/api/register", Register)
	r.POST("/api/login", Login)
	r.GET("/api/listings", GetListings)
	r.GET("/api/listings/:id", GetListingByID)
	r.GET("/api/user/:id", GetUserPublic)

	// PROTECTED ROUTES
	protected := r.Group("/api")
	protected.Use(JWTMiddleware())
	{
		protected.GET("/user", CurrentUser)
		protected.POST("/listings", CreateListing)
		protected.PUT("/listings/:id", UpdateListing)
		protected.DELETE("/listings/:id", DeleteListing)
		protected.PUT("/user", UpdateUser)
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