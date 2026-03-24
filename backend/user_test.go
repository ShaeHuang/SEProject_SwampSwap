package main

import (
	"bytes"
	"encoding/json"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/gin-gonic/gin"
)

// SET UP ROUTER FOR TESTS
func setupRouter() *gin.Engine {
	os.Setenv("API_SECRET", "testsecret")

	ConnectDatabase()
	DB.Migrator().DropTable(&User{}, &Listing{})
    DB.AutoMigrate(&User{}, &Listing{})
	r := gin.Default()

	public := r.Group("/api")
	{
		public.GET("/user/:id", GetUserPublic)
		public.POST("/register", Register)
		public.POST("/login", Login)
		public.GET("/listings", GetListings)
	}

	protected := r.Group("/api")
	protected.Use(JWTMiddleware())
	{
		protected.PUT("/user", UpdateUser)
		protected.POST("/listings", CreateListing)
	}
	return r
}

// -----------------------
// TEST: GET USER PUBLIC
// -----------------------

// -----------------------
// TEST: UPDATE USER
// -----------------------
func TestUpdateUser(t *testing.T) {
	r := setupRouter()

	// Register user
	body := []byte(`{"username":"kabir","password":"oldpass"}`)
	req := httptest.NewRequest("POST", "/api/register", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	// Login to get token
	loginBody := []byte(`{"username":"kabir","password":"oldpass"}`)
	reqLogin := httptest.NewRequest("POST", "/api/login", bytes.NewBuffer(loginBody))
	reqLogin.Header.Set("Content-Type", "application/json")
	wLogin := httptest.NewRecorder()
	r.ServeHTTP(wLogin, reqLogin)

	var loginResp map[string]string
	json.Unmarshal(wLogin.Body.Bytes(), &loginResp)

	var token string
	for _, v := range loginResp {
		token = v
	}

	// Call PUT /api/user (protected route)
	updateBody := []byte(`{"username":"kabirUpdated","password":"newpass123","email":"kabir@uf.edu","bio":"SwampSwap dev"}`)
	reqUpdate := httptest.NewRequest("PUT", "/api/user", bytes.NewBuffer(updateBody))
	reqUpdate.Header.Set("Authorization", "Bearer "+token)
	reqUpdate.Header.Set("Content-Type", "application/json")

	wUpdate := httptest.NewRecorder()
	r.ServeHTTP(wUpdate, reqUpdate)

	if wUpdate.Code != 200 {
		t.Fatalf("Expected 200, got %d. Body: %s", wUpdate.Code, wUpdate.Body.String())
	}

	var updateResp map[string]interface{}
	json.Unmarshal(wUpdate.Body.Bytes(), &updateResp)

	user := updateResp["user"].(map[string]interface{})

	if user["username"] != "kabirUpdated" {
		t.Fatalf("Expected username 'kabirUpdated', got %v", user["username"])
	}

	if user["email"] != "kabir@uf.edu" {
		t.Fatalf("Expected email 'kabir@uf.edu', got %v", user["email"])
	}

	if user["bio"] != "SwampSwap dev" {
		t.Fatalf("Expected bio 'SwampSwap dev', got %v", user["bio"])
	}
}

func TestGetUserPublicWithStats(t *testing.T) {
	r := setupRouter()

	// Register a user
	body := []byte(`{"username":"seller","password":"pass1234","email":"seller@test.com"}`)
	req := httptest.NewRequest("POST", "/api/register", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	// Login to get token
	loginBody := []byte(`{"username":"seller","password":"pass1234"}`)
	reqLogin := httptest.NewRequest("POST", "/api/login", bytes.NewBuffer(loginBody))
	reqLogin.Header.Set("Content-Type", "application/json")
	wLogin := httptest.NewRecorder()
	r.ServeHTTP(wLogin, reqLogin)

	var loginResp map[string]string
	json.Unmarshal(wLogin.Body.Bytes(), &loginResp)
	var token string
	for _, v := range loginResp {
		token = v
	}

	// Create two listings via the API
	for _, title := range []string{"Old Desk", "Used Lamp"} {
		listingBody := []byte(`{"title":"` + title + `","description":"test","price":10.0}`)
		reqListing := httptest.NewRequest("POST", "/api/listings", bytes.NewBuffer(listingBody))
		reqListing.Header.Set("Authorization", "Bearer "+token)
		reqListing.Header.Set("Content-Type", "application/json")
		wListing := httptest.NewRecorder()
		r.ServeHTTP(wListing, reqListing)

		if wListing.Code != 201 {
			t.Fatalf("CreateListing: expected 201, got %d. Body: %s", wListing.Code, wListing.Body.String())
		}
	}

	// Mark one listing as sold directly in DB
	DB.Model(&Listing{}).Where("title = ?", "Old Desk").Update("status", "sold")

	// Fetch user profile and check stats
	req2 := httptest.NewRequest("GET", "/api/user/1", nil)
	w2 := httptest.NewRecorder()
	r.ServeHTTP(w2, req2)

	var resp map[string]interface{}
	json.Unmarshal(w2.Body.Bytes(), &resp)

	stats := resp["stats"].(map[string]interface{})
	if stats["itemsPosted"] != float64(2) {
		t.Fatalf("Expected itemsPosted 2, got %v", stats["itemsPosted"])
	}
	if stats["itemsSold"] != float64(1) {
		t.Fatalf("Expected itemsSold 1, got %v", stats["itemsSold"])
	}
}