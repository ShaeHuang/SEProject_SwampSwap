package main

import (
	"net/http"
	"strconv"
	
	"github.com/gin-gonic/gin"
)

// GetUserProfile returns user information by ID
func GetUserProfile(c *gin.Context) {
	// Get user ID from URL parameter
	userIDStr := c.Param("id")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	// Query database for user
	var user User
	err = DB.Where("id = ?", uint(userID)).First(&user).Error
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	// Build response
	response := gin.H{
		"id":       strconv.FormatUint(uint64(user.ID), 10),
		"username": user.Username,
		"email":    user.Email,
		"avatar":   user.Avatar,
		"bio":      user.Bio,
		"joinedAt": user.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		"stats": gin.H{
			"itemsPosted": 0, // TODO: will be real once listings exist
			"itemsSold":   0, // TODO: will be real once listings exist
		},
	}

	c.JSON(http.StatusOK, response)
}