package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strconv"
	"testing"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupListingTestDB(t *testing.T) {
	t.Helper()

	gin.SetMode(gin.TestMode)
	t.Setenv("API_SECRET", "test-secret")

	databasePath := filepath.Join(t.TempDir(), "test.db")
	database, err := gorm.Open(sqlite.Open(databasePath), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open test database: %v", err)
	}

	DB = database
	if err := DB.AutoMigrate(&User{}, &Listing{}); err != nil {
		t.Fatalf("failed to migrate test database: %v", err)
	}
}

func setupListingTestRouter() *gin.Engine {
	router := gin.Default()

	public := router.Group("/api")
	public.GET("/listings", GetListings)
	public.GET("/listings/:id", GetListingByID)

	protected := router.Group("/api/admin")
	protected.Use(JWTMiddleware())
	protected.POST("/listings/:id/buy", BuyListing)

	return router
}

func createTestUser(t *testing.T, username string) User {
	t.Helper()

	user := User{
		Username: username,
		Password: "hashed-password",
	}

	if err := DB.Create(&user).Error; err != nil {
		t.Fatalf("failed to create user: %v", err)
	}

	return user
}

func createTestListing(t *testing.T, listing Listing) Listing {
	t.Helper()

	if err := DB.Create(&listing).Error; err != nil {
		t.Fatalf("failed to create listing: %v", err)
	}

	return listing
}

func authHeaderForUser(t *testing.T, userID uint) string {
	t.Helper()

	token, err := GenerateToken(userID)
	if err != nil {
		t.Fatalf("failed to generate token: %v", err)
	}

	return "Bearer " + token
}

func TestGetListingsSupportsSearchAndSort(t *testing.T) {
	setupListingTestDB(t)
	router := setupListingTestRouter()

	seller := createTestUser(t, "seller-one")
	createTestListing(t, Listing{
		Title:       "Campus Laptop",
		Description: "Lightly used for one semester",
		Price:       450,
		UserID:      seller.ID,
		Status:      "available",
	})
	createTestListing(t, Listing{
		Title:       "Laptop Sleeve",
		Description: "Protective case for everyday use",
		Price:       20,
		UserID:      seller.ID,
		Status:      "available",
	})
	createTestListing(t, Listing{
		Title:       "Dorm Chair",
		Description: "Comfortable reading chair",
		Price:       40,
		UserID:      seller.ID,
		Status:      "sold",
	})

	request := httptest.NewRequest(
		http.MethodGet,
		"/api/listings?search=laptop&sort=price_desc",
		nil,
	)
	recorder := httptest.NewRecorder()

	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", recorder.Code)
	}

	var listings []ListingResponse
	if err := json.Unmarshal(recorder.Body.Bytes(), &listings); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if len(listings) != 2 {
		t.Fatalf("expected 2 listings, got %d", len(listings))
	}

	if listings[0].Title != "Campus Laptop" {
		t.Fatalf("expected highest priced laptop first, got %q", listings[0].Title)
	}

	if listings[0].SellerUsername != "seller-one" {
		t.Fatalf("expected seller username in response, got %q", listings[0].SellerUsername)
	}
}

func TestBuyListingMarksItemSold(t *testing.T) {
	setupListingTestDB(t)
	router := setupListingTestRouter()

	seller := createTestUser(t, "seller-two")
	buyer := createTestUser(t, "buyer-two")
	listing := createTestListing(t, Listing{
		Title:       "Mini Fridge",
		Description: "Great for dorm rooms",
		Price:       80,
		UserID:      seller.ID,
		Status:      "available",
	})

	request := httptest.NewRequest(
		http.MethodPost,
		"/api/admin/listings/"+strconv.Itoa(int(listing.ID))+"/buy",
		nil,
	)
	request.Header.Set("Authorization", authHeaderForUser(t, buyer.ID))
	recorder := httptest.NewRecorder()

	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d with body %s", recorder.Code, recorder.Body.String())
	}

	var response BuyListingResponse
	if err := json.Unmarshal(recorder.Body.Bytes(), &response); err != nil {
		t.Fatalf("failed to decode buy response: %v", err)
	}

	if response.Status != "sold" {
		t.Fatalf("expected sold status, got %q", response.Status)
	}

	if response.BuyerID == nil || *response.BuyerID != buyer.ID {
		t.Fatalf("expected buyer ID %d, got %+v", buyer.ID, response.BuyerID)
	}

	var stored Listing
	if err := DB.First(&stored, listing.ID).Error; err != nil {
		t.Fatalf("failed to reload listing: %v", err)
	}

	if stored.Status != "sold" {
		t.Fatalf("expected stored listing to be sold, got %q", stored.Status)
	}
}

func TestBuyListingRejectsOwnerPurchase(t *testing.T) {
	setupListingTestDB(t)
	router := setupListingTestRouter()

	seller := createTestUser(t, "seller-three")
	listing := createTestListing(t, Listing{
		Title:       "Desk Lamp",
		Description: "Warm light with USB port",
		Price:       18,
		UserID:      seller.ID,
		Status:      "available",
	})

	request := httptest.NewRequest(
		http.MethodPost,
		"/api/admin/listings/"+strconv.Itoa(int(listing.ID))+"/buy",
		nil,
	)
	request.Header.Set("Authorization", authHeaderForUser(t, seller.ID))
	recorder := httptest.NewRecorder()

	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d", recorder.Code)
	}
}

func TestMain(m *testing.M) {
	gin.SetMode(gin.TestMode)
	os.Exit(m.Run())
}
