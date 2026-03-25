package main

import (
	"net/http"

	// "strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ----------------------------
// Model
// ----------------------------
type Listing struct {
	gorm.Model
	Title       string  `json:"title"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
	UserID      uint    `json:"user_id"`
	Status      string  `json:"status" gorm:"default:available"`
}

// ----------------------------
// CREATE LISTING (POST)
// ----------------------------
func CreateListing(c *gin.Context) {
	var input Listing

	// Parse incoming JSON
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid JSON format.",
			"details": err.Error(),
		})
		return
	}

	// Extract user from JWT
	userID, err := ExtractTokenID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Unauthorized. Missing or invalid token.",
		})
		return
	}

	// Assign listing to user
	input.UserID = userID

	// Save to DB
	if err := DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error: failed to create listing.",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, input)
}

// ----------------------------
// GET ALL LISTINGS
// ----------------------------
func GetListings(c *gin.Context) {
	var listings []Listing

	if err := DB.Find(&listings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error: cannot fetch listings.",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, listings)
}

// ----------------------------
// GET SINGLE LISTING BY ID
// ----------------------------
func GetListingByID(c *gin.Context) {
	id := c.Param("id")
	var listing Listing

	if err := DB.First(&listing, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Listing not found.",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error while retrieving listing.",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, listing)
}

// ----------------------------
// UPDATE LISTING (PUT)
// ----------------------------
func UpdateListing(c *gin.Context) {
	id := c.Param("id")
	var listing Listing

	// Load existing listing
	if err := DB.First(&listing, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Listing not found.",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error while fetching listing.",
			"details": err.Error(),
		})
		return
	}

	// Check owner
	userID, err := ExtractTokenID(c)
	if err != nil || listing.UserID != userID {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Not authorized to update this listing.",
		})
		return
	}

	// Parse incoming data
	var input Listing
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid JSON format.",
			"details": err.Error(),
		})
		return
	}

	// Update fields
	listing.Title = input.Title
	listing.Description = input.Description
	listing.Price = input.Price
	listing.Status = input.Status

	// Save to DB
	if err := DB.Save(&listing).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error while updating listing.",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, listing)
}

// ----------------------------
// DELETE LISTING (DELETE)
// ----------------------------
func DeleteListing(c *gin.Context) {
	id := c.Param("id")
	var listing Listing

	// Fetch listing
	if err := DB.First(&listing, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Listing not found.",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error while fetching listing.",
			"details": err.Error(),
		})
		return
	}

	// Check owner
	userID, err := ExtractTokenID(c)
	if err != nil || listing.UserID != userID {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Not authorized to delete this listing.",
		})
		return
	}

	// Delete listing
	if err := DB.Delete(&listing).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error while deleting listing.",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Listing deleted successfully.",
	})
}
