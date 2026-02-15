package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type UserInput struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func Login(c *gin.Context) {
	var input UserInput
	if err := c.ShouldBindJSON(&input); err != nil { //Binds JSON to input type
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err := LoginCheck(input.Username, input.Password) //Check if login is valid
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "incorrect username/password"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "login successful"})
}

func Register(c *gin.Context) {
	var input UserInput
	if err := c.ShouldBindJSON(&input); err != nil { //Binds JSON to input type
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	u := User{} //Create new user instance
	u.Username = input.Username
	u.Password = input.Password
	_, err := u.SaveUser() //Save new user to database
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "registration was successful"})
}
