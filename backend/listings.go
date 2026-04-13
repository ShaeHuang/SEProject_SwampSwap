package main

import (
	"net/http"
	"os"

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
	Category    string  `json:"category"`
	Condition   string  `json:"condition"`
	UserID      uint    `json:"user_id"`
	Status      string  `json:"status" gorm:"default:available"`
	Image       string  `json:"image"`
}

type ListingResponse struct {
	Listing
	SellerName   string `json:"seller_name"`
	SellerAvatar string `json:"seller_avatar"`
}

type UpdateListingInput struct {
	Title       *string  `json:"title"`
	Description *string  `json:"description"`
	Price       *float64 `json:"price"`
	Category    *string  `json:"category"`
	Condition   *string  `json:"condition"`
	Status      *string  `json:"status"`
	Image       *string  `json:"image"`
}

func buildListingResponses(listings []Listing) []ListingResponse {
	if len(listings) == 0 {
		return []ListingResponse{}
	}

	seenUserIDs := make(map[uint]struct{}, len(listings))
	userIDs := make([]uint, 0, len(listings))
	for _, listing := range listings {
		if _, exists := seenUserIDs[listing.UserID]; exists {
			continue
		}
		seenUserIDs[listing.UserID] = struct{}{}
		userIDs = append(userIDs, listing.UserID)
	}

	var users []User
	if err := DB.Select("id", "username", "avatar").Where("id IN ?", userIDs).Find(&users).Error; err != nil {
		users = nil
	}

	sellerByID := make(map[uint]User, len(users))
	for _, user := range users {
		sellerByID[user.ID] = user
	}

	responses := make([]ListingResponse, 0, len(listings))
	for _, listing := range listings {
		seller := sellerByID[listing.UserID]
		responses = append(responses, ListingResponse{
			Listing:      listing,
			SellerName:   seller.Username,
			SellerAvatar: seller.Avatar,
		})
	}

	return responses
}

func buildListingResponse(listing Listing) ListingResponse {
	responses := buildListingResponses([]Listing{listing})
	if len(responses) == 0 {
		return ListingResponse{Listing: listing}
	}

	return responses[0]
}

// ----------------------------
// CREATE LISTING (POST)
// ----------------------------
func CreateListing(c *gin.Context) {
	var input Listing

	// Parse incoming JSON
	if err := c.ShouldBind(&input); err != nil {
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

	//Process image input
	file, err := c.FormFile("image")
	if err == nil {
		dst, _, _ := processImage(c, file, "listings")
		input.Image = dst
	}

	// Save to DB
	if err := DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error: failed to create listing.",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, buildListingResponse(input))
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

	c.JSON(http.StatusOK, buildListingResponses(listings))
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

	c.JSON(http.StatusOK, buildListingResponse(listing))
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
	var input UpdateListingInput
	if err := c.ShouldBind(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid JSON format.",
			"details": err.Error(),
		})
		return
	}

	//Process image input
	file, err := c.FormFile("image")
	if err == nil {
		dst, _, _ := processImage(c, file, "listings")
		input.Image = &dst
	}

	old_image_path := listing.Image
	// Delete old image if it exists
	os.Remove(old_image_path)

	// Update fields
	if input.Title != nil {
		listing.Title = *input.Title
	}
	if input.Description != nil {
		listing.Description = *input.Description
	}
	if input.Price != nil {
		listing.Price = *input.Price
	}
	if input.Category != nil {
		listing.Category = *input.Category
	}
	if input.Condition != nil {
		listing.Condition = *input.Condition
	}
	if input.Status != nil {
		listing.Status = *input.Status
	}
	if input.Image != nil {
		listing.Image = *input.Image
	}

	// Save to DB
	if err := DB.Save(&listing).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error while updating listing.",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, buildListingResponse(listing))
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

// ----------------------------
// BUY LISTING (PUT /api/listings/:id/buy)
// ----------------------------
func BuyListing(c *gin.Context) {
	id := c.Param("id")
	var listing Listing

	if err := DB.First(&listing, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Listing not found."})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error while fetching listing.",
			"details": err.Error(),
		})
		return
	}

	// Must be authenticated
	userID, err := ExtractTokenID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized."})
		return
	}

	// Buyer must NOT be the owner
	if listing.UserID == userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You cannot buy your own listing."})
		return
	}

	// Must still be available
	if listing.Status != "available" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "This listing has already been sold."})
		return
	}

	listing.Status = "sold"
	if err := DB.Save(&listing).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error while updating listing.",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, listing)
}
