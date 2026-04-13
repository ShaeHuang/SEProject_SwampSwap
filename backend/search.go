package main

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func SearchQuery(c *gin.Context) {
	keyword := c.Query("keyword")
	minPriceStr := c.Query("minprice")
	maxPriceStr := c.Query("maxprice")

	var listings []Listing
	query := DB.Model(&Listing{})

	if keyword != "" {
		query = query.Where(
			DB.Where("title LIKE ?", "%"+keyword+"%").
				Or("description LIKE ?", "%"+keyword+"%"),
		)
	}

	if minPriceStr != "" {
		if minPrice, err := strconv.ParseFloat(minPriceStr, 64); err == nil {
			query = query.Where("price >= ?", minPrice)
		}
	}

	if maxPriceStr != "" {
		if maxPrice, err := strconv.ParseFloat(maxPriceStr, 64); err == nil {
			query = query.Where("price <= ?", maxPrice)
		}
	}

	if err := query.Find(&listings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error: cannot fetch listings.",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, buildListingResponses(listings))
}