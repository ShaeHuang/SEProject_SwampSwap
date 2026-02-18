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
	DB.AutoMigrate(&User{}) //Create database of users
}
