package main

import (
	"net/http"
	"strings"

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
	Status      string  `json:"status" gorm:"type:varchar(20);default:available"`
	BuyerID     *uint   `json:"buyer_id"`
}

type ListingResponse struct {
	ID             uint    `json:"id"`
	CreatedAt      string  `json:"created_at"`
	UpdatedAt      string  `json:"updated_at"`
	Title          string  `json:"title"`
	Description    string  `json:"description"`
	Price          float64 `json:"price"`
	UserID         uint    `json:"user_id"`
	Status         string  `json:"status"`
	BuyerID        *uint   `json:"buyer_id"`
	SellerUsername string  `json:"seller_username"`
}

type BuyListingResponse struct {
	ListingResponse
	Message string `json:"message"`
}

func normalizeListing(listing *Listing) {
	if strings.TrimSpace(listing.Status) == "" {
		listing.Status = "available"
	}
	if listing.Status != "sold" {
		listing.Status = "available"
		listing.BuyerID = nil
	}
}

func buildListingResponse(listing Listing) ListingResponse {
	response := ListingResponse{
		ID:          listing.ID,
		CreatedAt:   listing.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:   listing.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
		Title:       listing.Title,
		Description: listing.Description,
		Price:       listing.Price,
		UserID:      listing.UserID,
		Status:      listing.Status,
		BuyerID:     listing.BuyerID,
	}

	var seller User
	if err := DB.First(&seller, listing.UserID).Error; err == nil {
		response.SellerUsername = seller.Username
	}

	return response
}

func listingOrder(sort string) string {
	switch sort {
	case "oldest":
		return "created_at asc"
	case "price_asc":
		return "price asc, created_at desc"
	case "price_desc":
		return "price desc, created_at desc"
	default:
		return "created_at desc"
	}
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
	input.Status = "available"
	input.BuyerID = nil
	normalizeListing(&input)

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
	query := DB.Model(&Listing{})

	search := strings.TrimSpace(c.Query("search"))
	if search != "" {
		like := "%" + strings.ToLower(search) + "%"
		query = query.Where(
			"lower(title) LIKE ? OR lower(description) LIKE ?",
			like,
			like,
		)
	}

	status := strings.TrimSpace(strings.ToLower(c.DefaultQuery("status", "all")))
	if status == "available" || status == "sold" {
		query = query.Where("status = ?", status)
	}

	if err := query.Order(listingOrder(c.DefaultQuery("sort", "latest"))).Find(&listings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error: cannot fetch listings.",
			"details": err.Error(),
		})
		return
	}

	responses := make([]ListingResponse, 0, len(listings))
	for _, listing := range listings {
		normalizeListing(&listing)
		responses = append(responses, buildListingResponse(listing))
	}

	c.JSON(http.StatusOK, responses)
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

	normalizeListing(&listing)

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
	normalizeListing(&listing)

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

func BuyListing(c *gin.Context) {
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
			"error":   "Database error while fetching listing.",
			"details": err.Error(),
		})
		return
	}

	userID, err := ExtractTokenID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Unauthorized. Missing or invalid token.",
		})
		return
	}

	normalizeListing(&listing)

	if listing.UserID == userID {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "You cannot buy your own listing.",
		})
		return
	}

	if listing.Status != "available" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "This listing is no longer available.",
		})
		return
	}

	listing.Status = "sold"
	listing.BuyerID = &userID

	if err := DB.Save(&listing).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error while buying listing.",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, BuyListingResponse{
		ListingResponse: buildListingResponse(listing),
		Message:         "Listing purchased successfully.",
	})
}
