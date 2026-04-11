package main

import (
	"bytes"
	"encoding/json"
	"net/http/httptest"
	"os"
	"testing"
	"fmt"
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
		protected.PUT("/listings/:id/buy", BuyListing)
	}
	return r
}

// -----------------------
// TEST: REGISTER NEW USER
// -----------------------
func TestRegisterUser(t *testing.T) {
	r := setupRouter()

	// Register user
	body := []byte(`{"username":"awinney","password":"helloworld"}`)
	req := httptest.NewRequest("POST", "/api/register", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	wRegister := httptest.NewRecorder()
	r.ServeHTTP(wRegister, req)

	var registerResp map[string]string
	json.Unmarshal(wRegister.Body.Bytes(), &registerResp)

	expected_response := "{\"message\":\"registration was successful\"}"
	if wRegister.Body.String() != expected_response {
		t.Fatalf("Expected %s, got %s.", expected_response, wRegister.Body.String())
	}

}

// -----------------------
// TEST: LOGIN NEW USER
// -----------------------
func TestLoginUser(t *testing.T) {
	r := setupRouter()

	// Register user
	body := []byte(`{"username":"awinney","password":"helloworld"}`)
	req := httptest.NewRequest("POST", "/api/register", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	wRegister := httptest.NewRecorder()
	r.ServeHTTP(wRegister, req)

	var registerResp map[string]string
	json.Unmarshal(wRegister.Body.Bytes(), &registerResp)

	expectedResponse := "{\"message\":\"registration was successful\"}"
	if wRegister.Body.String() != expectedResponse {
		t.Fatalf("Expected %s, got %s.", expectedResponse, wRegister.Body.String())
	}

	// Login to get token
	loginBody := []byte(`{"id":"awinney","password":"helloworld"}`)
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

	if token[:3] != "eyJ" { //JWT format follows this rule
		t.Fatalf("Expected a token, got none back")
	}
}

// -----------------------
// TEST: FAILED LOGIN NEW USER
// -----------------------
func TestFailedLoginUser(t *testing.T) {
	r := setupRouter()

	// Register user
	body := []byte(`{"username":"awinney","password":"helloworld"}`)
	req := httptest.NewRequest("POST", "/api/register", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	wRegister := httptest.NewRecorder()
	r.ServeHTTP(wRegister, req)

	var registerResp map[string]string
	json.Unmarshal(wRegister.Body.Bytes(), &registerResp)

	expectedResponse := "{\"message\":\"registration was successful\"}"
	if wRegister.Body.String() != expectedResponse {
		t.Fatalf("Expected %s, got %s.", expectedResponse, wRegister.Body.String())
	}

	// Login to get token
	loginBody := []byte(`{"id":"awinney","password":"wrongpassword"}`) // Incorrect password here
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

	if token[:3] == "eyJ" { //JWT format follows this rule
		t.Fatalf("Expected no token, got one back")
	}
}

// -----------------------
// TEST: GET USER PUBLIC
// -----------------------
func TestGetUser(t *testing.T) {
	r := setupRouter()

	// Register user
	body := []byte(`{"username":"awinney","password":"helloworld"}`)
	req := httptest.NewRequest("POST", "/api/register", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	wRegister := httptest.NewRecorder()
	r.ServeHTTP(wRegister, req)

	var registerResp map[string]string
	json.Unmarshal(wRegister.Body.Bytes(), &registerResp)

	expectedResponse := "{\"message\":\"registration was successful\"}"
	if wRegister.Body.String() != expectedResponse {
		t.Fatalf("Expected %s, got %s.", expectedResponse, wRegister.Body.String())
	}

	// Login to get token
	loginBody := []byte(`{"id":"awinney","password":"helloworld"}`)
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

	if token[:3] != "eyJ" { //JWT format follows this rule
		t.Fatalf("Expected a token, got none back")
	}

	getBody := []byte(`{}`)
	reqGet := httptest.NewRequest("GET", "/api/user/1", bytes.NewBuffer(getBody))
	reqGet.Header.Set("Content-Type", "application/json")
	wGet := httptest.NewRecorder()
	r.ServeHTTP(wGet, reqGet)

	var getResp map[string]interface{}
	json.Unmarshal(wGet.Body.Bytes(), &getResp)

	getRespString := wGet.Body.String()
	responseTail := getRespString[len(getRespString)-21 : len(getRespString)-1] //Get username of user
	expectedResponse = "\"username\":\"awinney\""
	if responseTail != expectedResponse {
		t.Fatalf("Expected response '%s', got %s", expectedResponse, responseTail)
	}
}

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
	loginBody := []byte(`{"id":"kabir","password":"oldpass"}`)
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
	loginBody := []byte(`{"id":"seller","password":"pass1234"}`)
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

	DB.Unscoped().Where("ID BETWEEN ? AND ?", 1, 1000).Delete(&User{})
	DB.Unscoped().Where("ID BETWEEN ? AND ?", 1, 1000).Delete(&Listing{})
}
// -----------------------
// TEST: BUY LISTING
// -----------------------
func TestBuyListing(t *testing.T) {
	r := setupRouter()

	// Register seller
	sellerBody := []byte(`{"username":"seller1","password":"pass1234","email":"seller1@test.com"}`)
	req := httptest.NewRequest("POST", "/api/register", bytes.NewBuffer(sellerBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	// Login seller
	loginBody := []byte(`{"id":"seller1","password":"pass1234"}`)
	reqLogin := httptest.NewRequest("POST", "/api/login", bytes.NewBuffer(loginBody))
	reqLogin.Header.Set("Content-Type", "application/json")
	wLogin := httptest.NewRecorder()
	r.ServeHTTP(wLogin, reqLogin)

	var sellerLoginResp map[string]string
	json.Unmarshal(wLogin.Body.Bytes(), &sellerLoginResp)
	var sellerToken string
	for _, v := range sellerLoginResp {
		sellerToken = v
	}

	// Seller creates a listing
	listingBody := []byte(`{"title":"Old Bike","description":"works fine","price":50.0}`)
	reqListing := httptest.NewRequest("POST", "/api/listings", bytes.NewBuffer(listingBody))
	reqListing.Header.Set("Authorization", "Bearer "+sellerToken)
	reqListing.Header.Set("Content-Type", "application/json")
	wListing := httptest.NewRecorder()
	r.ServeHTTP(wListing, reqListing)

	if wListing.Code != 201 {
		t.Fatalf("CreateListing: expected 201, got %d. Body: %s", wListing.Code, wListing.Body.String())
	}

	// Get listing ID from response
	var createdListing map[string]interface{}
	json.Unmarshal(wListing.Body.Bytes(), &createdListing)
	listingID := int(createdListing["ID"].(float64))

	// Register buyer
	buyerBody := []byte(`{"username":"buyer1","password":"pass5678","email":"buyer1@test.com"}`)
	reqBuyer := httptest.NewRequest("POST", "/api/register", bytes.NewBuffer(buyerBody))
	reqBuyer.Header.Set("Content-Type", "application/json")
	wBuyer := httptest.NewRecorder()
	r.ServeHTTP(wBuyer, reqBuyer)

	// Login buyer
	buyerLoginBody := []byte(`{"id":"buyer1","password":"pass5678"}`)
	reqBuyerLogin := httptest.NewRequest("POST", "/api/login", bytes.NewBuffer(buyerLoginBody))
	reqBuyerLogin.Header.Set("Content-Type", "application/json")
	wBuyerLogin := httptest.NewRecorder()
	r.ServeHTTP(wBuyerLogin, reqBuyerLogin)

	var buyerLoginResp map[string]string
	json.Unmarshal(wBuyerLogin.Body.Bytes(), &buyerLoginResp)
	var buyerToken string
	for _, v := range buyerLoginResp {
		buyerToken = v
	}

	// TEST 1: Seller tries to buy own listing → expect 403
	buyOwnReq := httptest.NewRequest("PUT", fmt.Sprintf("/api/listings/%d/buy", listingID), nil)
	buyOwnReq.Header.Set("Authorization", "Bearer "+sellerToken)
	buyOwnReq.Header.Set("Content-Type", "application/json")
	wBuyOwn := httptest.NewRecorder()
	r.ServeHTTP(wBuyOwn, buyOwnReq)

	if wBuyOwn.Code != 403 {
		t.Fatalf("Seller buying own listing: expected 403, got %d. Body: %s", wBuyOwn.Code, wBuyOwn.Body.String())
	}

	// TEST 2: Buyer purchases listing → expect 200
	buyReq := httptest.NewRequest("PUT", fmt.Sprintf("/api/listings/%d/buy", listingID), nil)
	buyReq.Header.Set("Authorization", "Bearer "+buyerToken)
	buyReq.Header.Set("Content-Type", "application/json")
	wBuy := httptest.NewRecorder()
	r.ServeHTTP(wBuy, buyReq)

	if wBuy.Code != 200 {
		t.Fatalf("Buyer purchasing listing: expected 200, got %d. Body: %s", wBuy.Code, wBuy.Body.String())
	}

	var buyResp map[string]interface{}
	json.Unmarshal(wBuy.Body.Bytes(), &buyResp)
	if buyResp["status"] != "sold" {
		t.Fatalf("Expected status 'sold', got '%v'", buyResp["status"])
	}

	// TEST 3: Buyer tries to buy already-sold listing → expect 400
	buyAgainReq := httptest.NewRequest("PUT", fmt.Sprintf("/api/listings/%d/buy", listingID), nil)
	buyAgainReq.Header.Set("Authorization", "Bearer "+buyerToken)
	buyAgainReq.Header.Set("Content-Type", "application/json")
	wBuyAgain := httptest.NewRecorder()
	r.ServeHTTP(wBuyAgain, buyAgainReq)

	if wBuyAgain.Code != 400 {
		t.Fatalf("Buying sold listing: expected 400, got %d. Body: %s", wBuyAgain.Code, wBuyAgain.Body.String())
	}

	// Cleanup
	DB.Unscoped().Where("ID BETWEEN ? AND ?", 1, 1000).Delete(&User{})
	DB.Unscoped().Where("ID BETWEEN ? AND ?", 1, 1000).Delete(&Listing{})
}