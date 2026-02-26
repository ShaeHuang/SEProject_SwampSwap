package main

import (
	"fmt"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func main() {
	ConnectDatabase()
	r := gin.Default()
	public := r.Group("/api")
	
	public.POST("/register", Register)
	public.POST("/login", Login)
	public.GET("/listings", GetListings)
	public.GET("/listings/:id", GetListingByID)
	protected := r.Group("/api/admin")
	protected.Use(JWTMiddleware())
	protected.GET("/user", CurrentUser)
	protected.POST("/listings", CreateListing)
	protected.PUT("/listings/:id", UpdateListing)
	protected.DELETE("/listings/:id", DeleteListing)
	err := r.Run(":8080")
	if err != nil {
		return
	}
}

func ConnectDatabase() {
	database, err := gorm.Open(sqlite.Open("users.db"), &gorm.Config{}) //Open database with GORM
	if err != nil {
		panic("database failed to connect")
	} else {
		fmt.Println("database connection successful")
	}

	DB = database
	DB.AutoMigrate(&User{}, &Listing{}) //Create database of users
}
