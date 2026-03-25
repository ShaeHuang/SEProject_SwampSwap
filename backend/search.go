package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Query struct {
	gorm.Model
	Keyword  *string  `json:"keyword"`
	MinPrice *float64 `json:"minprice"`
	MaxPrice *float64 `json:"maxprice"`
}

func SearchQuery(c *gin.Context) {
	var input Query

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid JSON format.",
			"details": err.Error(),
		})
		return
	}

	var listings []Listing
	query := DB.Model(&Listing{})

	if input.Keyword != nil {
		query = query.Where(
			DB.Where("title LIKE ?", "%"+*input.Keyword+"%").
				Or("description LIKE ?", "%"+*input.Keyword+"%"),
		)
	}
	if input.MinPrice != nil {
		query = query.Where("price >= ?", *input.MinPrice)
	}
	if input.MaxPrice != nil {
		query = query.Where("price <= ?", *input.MaxPrice)
	}

	err := query.Find(&listings).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error: cannot fetch listings.",
			"details": err.Error(),
		})
		return
	}

	if len(listings) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Query error: no matches found.",
		})
		return
	}

	c.JSON(http.StatusOK, listings)
}
