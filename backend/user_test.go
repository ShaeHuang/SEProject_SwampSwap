package main

import (
	"bytes"
	"encoding/json"
	"io"
	"mime/multipart"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/gin-gonic/gin"
)

// SET UP ROUTER FOR TESTS
func setupRouter() *gin.Engine {
	os.Setenv("API_SECRET", "testsecret")

	ConnectDatabase()
	DB.Migrator().DropTable(&User{}, &Listing{}, &Message{})
	DB.AutoMigrate(&User{}, &Listing{}, &Message{})
	r := gin.Default()

	public := r.Group("/api")
	{
		public.GET("/user/:id", GetUserPublic)
		public.POST("/register", Register)
		public.POST("/login", Login)
		public.GET("/listings", GetListings)
		public.GET("/listings/:id", GetListingByID)
		public.GET("/search", SearchQuery)
	}

	protected := r.Group("/api")
	protected.Use(JWTMiddleware())
	{
		protected.GET("/user", CurrentUser)
		protected.GET("/user/listings", GetCurrentUserListings)
		protected.POST("/listings", CreateListing)
		protected.PUT("/listings/:id", UpdateListing)
		protected.DELETE("/listings/:id", DeleteListing)
		protected.PUT("/user", UpdateUser)
		protected.PUT("/listings/:id/buy", BuyListing)
		protected.POST("/avatar", uploadAvatar)
		protected.GET("/messages", GetConversations)
		protected.GET("/messages/:userId", GetMessagesWithUser)
		protected.POST("/messages", SendMessage)
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
		listingBody := []byte(`{"title":"` + title + `","description":"test","price":10.0,"category":"Furniture","condition":"Used"}`)
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

func TestListingCategoryRoundTrip(t *testing.T) {
	r := setupRouter()

	body := []byte(`{"username":"categoryseller","password":"pass1234","email":"category@test.com"}`)
	req := httptest.NewRequest("POST", "/api/register", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	loginBody := []byte(`{"id":"categoryseller","password":"pass1234"}`)
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

	createBody := []byte(`{"title":"Desk Lamp","description":"Warm light","price":25.0,"category":"Furniture","condition":"Used"}`)
	reqCreate := httptest.NewRequest("POST", "/api/listings", bytes.NewBuffer(createBody))
	reqCreate.Header.Set("Authorization", "Bearer "+token)
	reqCreate.Header.Set("Content-Type", "application/json")
	wCreate := httptest.NewRecorder()
	r.ServeHTTP(wCreate, reqCreate)

	if wCreate.Code != 201 {
		t.Fatalf("CreateListing: expected 201, got %d. Body: %s", wCreate.Code, wCreate.Body.String())
	}

	var created Listing
	if err := json.Unmarshal(wCreate.Body.Bytes(), &created); err != nil {
		t.Fatalf("failed to decode created listing: %v", err)
	}

	if created.Category != "Furniture" {
		t.Fatalf("expected created category Furniture, got %s", created.Category)
	}

	if created.Condition != "Used" {
		t.Fatalf("expected created condition Used, got %s", created.Condition)
	}

	reqGet := httptest.NewRequest("GET", "/api/listings/1", nil)
	wGet := httptest.NewRecorder()
	r.ServeHTTP(wGet, reqGet)

	if wGet.Code != 200 {
		t.Fatalf("GetListingByID: expected 200, got %d. Body: %s", wGet.Code, wGet.Body.String())
	}

	var fetched Listing
	if err := json.Unmarshal(wGet.Body.Bytes(), &fetched); err != nil {
		t.Fatalf("failed to decode fetched listing: %v", err)
	}

	if fetched.Category != "Furniture" {
		t.Fatalf("expected fetched category Furniture, got %s", fetched.Category)
	}

	if fetched.Condition != "Used" {
		t.Fatalf("expected fetched condition Used, got %s", fetched.Condition)
	}

	updateBody := []byte(`{"title":"Desk Lamp","description":"Warm light","price":25.0,"category":"Digital Product","condition":"Like new"}`)
	reqUpdate := httptest.NewRequest("PUT", "/api/listings/1", bytes.NewBuffer(updateBody))
	reqUpdate.Header.Set("Authorization", "Bearer "+token)
	reqUpdate.Header.Set("Content-Type", "application/json")
	wUpdate := httptest.NewRecorder()
	r.ServeHTTP(wUpdate, reqUpdate)

	if wUpdate.Code != 200 {
		t.Fatalf("UpdateListing: expected 200, got %d. Body: %s", wUpdate.Code, wUpdate.Body.String())
	}

	var updated Listing
	if err := json.Unmarshal(wUpdate.Body.Bytes(), &updated); err != nil {
		t.Fatalf("failed to decode updated listing: %v", err)
	}

	if updated.Category != "Digital Product" {
		t.Fatalf("expected updated category Digital Product, got %s", updated.Category)
	}

	if updated.Condition != "Like new" {
		t.Fatalf("expected updated condition Like new, got %s", updated.Condition)
	}
}

func TestGetCurrentUserListings(t *testing.T) {
	r := setupRouter()

	body := []byte(`{"username":"owner","password":"pass1234","email":"owner@test.com"}`)
	req := httptest.NewRequest("POST", "/api/register", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	loginBody := []byte(`{"id":"owner","password":"pass1234"}`)
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

	for _, title := range []string{"Desk", "Chair"} {
		listingBody := []byte(`{"title":"` + title + `","description":"Apartment pickup","price":20.0,"category":"Furniture","condition":"Used"}`)
		reqListing := httptest.NewRequest("POST", "/api/listings", bytes.NewBuffer(listingBody))
		reqListing.Header.Set("Authorization", "Bearer "+token)
		reqListing.Header.Set("Content-Type", "application/json")
		wListing := httptest.NewRecorder()
		r.ServeHTTP(wListing, reqListing)

		if wListing.Code != 201 {
			t.Fatalf("CreateListing: expected 201, got %d. Body: %s", wListing.Code, wListing.Body.String())
		}
	}

	reqMine := httptest.NewRequest("GET", "/api/user/listings", nil)
	reqMine.Header.Set("Authorization", "Bearer "+token)
	wMine := httptest.NewRecorder()
	r.ServeHTTP(wMine, reqMine)

	if wMine.Code != 200 {
		t.Fatalf("GetCurrentUserListings: expected 200, got %d. Body: %s", wMine.Code, wMine.Body.String())
	}

	var response struct {
		Data []Listing `json:"data"`
	}
	if err := json.Unmarshal(wMine.Body.Bytes(), &response); err != nil {
		t.Fatalf("failed to decode listings response: %v", err)
	}

	if len(response.Data) != 2 {
		t.Fatalf("expected 2 listings, got %d", len(response.Data))
	}

	if response.Data[0].Category != "Furniture" || response.Data[0].Condition != "Used" {
		t.Fatalf("expected category Furniture and condition Used, got %s and %s", response.Data[0].Category, response.Data[0].Condition)
	}
}

// -----------------------
// TEST: REGISTER NEW USER WITH AVATAR
// -----------------------
func TestRegisterUserAvatar(t *testing.T) {
	r := setupRouter()

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	_ = writer.WriteField("Username", "avatartest")
	_ = writer.WriteField("Password", "new_password")
	file, err := os.Open("test_imgs/cat.jpeg")
	if err != nil {
		t.Fatal(err)
	}
	defer file.Close()
	part, err := writer.CreateFormFile("avatar", "cat.jpeg")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := io.Copy(part, file); err != nil {
		t.Fatal(err)
	}
	writer.Close()
	req := httptest.NewRequest("POST", "/api/register", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
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
// TEST: UPDATE USER WITH AVATAR
// -----------------------
func TestUpdateUserAvatar(t *testing.T) {
	r := setupRouter()

	// Register user
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	_ = writer.WriteField("Username", "unupdated_avatar")
	_ = writer.WriteField("Password", "oldpass")
	file, err := os.Open("test_imgs/cat.jpeg")
	if err != nil {
		t.Fatal(err)
	}
	defer file.Close()
	part, err := writer.CreateFormFile("avatar", "cat.jpeg")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := io.Copy(part, file); err != nil {
		t.Fatal(err)
	}
	writer.Close()

	req := httptest.NewRequest("POST", "/api/register", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	// Login to get token
	loginBody := []byte(`{"id":"unupdated_avatar","password":"oldpass"}`)
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
	updateBody := &bytes.Buffer{}
	updateWriter := multipart.NewWriter(updateBody)
	_ = updateWriter.WriteField("Username", "updated_avatar")
	_ = updateWriter.WriteField("Password", "new_password")
	_ = updateWriter.WriteField("Email", "a.winney@ufl.edu")
	_ = updateWriter.WriteField("Bio", "SwampSwap dev")
	updateFile, err := os.Open("test_imgs/dog.jpg")
	if err != nil {
		t.Fatal(err)
	}
	defer updateFile.Close()
	updatePart, err := updateWriter.CreateFormFile("avatar", "dog.jpg")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := io.Copy(updatePart, updateFile); err != nil {
		t.Fatal(err)
	}
	updateWriter.Close()
	reqUpdate := httptest.NewRequest("PUT", "/api/user", updateBody)
	reqUpdate.Header.Set("Authorization", "Bearer "+token)
	reqUpdate.Header.Set("Content-Type", updateWriter.FormDataContentType())

	wUpdate := httptest.NewRecorder()
	r.ServeHTTP(wUpdate, reqUpdate)

	if wUpdate.Code != 200 {
		t.Fatalf("Expected 200, got %d. Body: %s", wUpdate.Code, wUpdate.Body.String())
	}

	var updateResp map[string]interface{}
	json.Unmarshal(wUpdate.Body.Bytes(), &updateResp)

	user := updateResp["user"].(map[string]interface{})

	if user["username"] != "updated_avatar" {
		t.Fatalf("Expected username 'updated_avatar', got %v", user["username"])
	}

	if user["email"] != "a.winney@ufl.edu" {
		t.Fatalf("Expected email 'a.winney@ufl.edu', got %v", user["email"])
	}

	if user["bio"] != "SwampSwap dev" {
		t.Fatalf("Expected bio 'SwampSwap dev', got %v", user["bio"])
	}

	if user["avatar"] == "" {
		t.Fatalf("Expected an avatar path, got none")
	}
}

// -----------------------
// TEST: CREATE AND UPDATE LISTING WITH IMAGE
// -----------------------
func TestListingCategoryRoundTripImage(t *testing.T) {
	r := setupRouter()

	body := []byte(`{"username":"categoryseller_image","password":"pass1234","email":"category@test.com"}`)
	req := httptest.NewRequest("POST", "/api/register", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	loginBody := []byte(`{"id":"categoryseller_image","password":"pass1234"}`)
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

	createBody := &bytes.Buffer{}
	createWriter := multipart.NewWriter(createBody)
	_ = createWriter.WriteField("Title", "Desk Lamp")
	_ = createWriter.WriteField("Description", "Warm light")
	_ = createWriter.WriteField("Price", "20")
	_ = createWriter.WriteField("Category", "Furniture")
	_ = createWriter.WriteField("Condition", "Used")
	createFile, err := os.Open("test_imgs/lamp.jpg")
	if err != nil {
		t.Fatal(err)
	}
	defer createFile.Close()
	createPart, err := createWriter.CreateFormFile("image", "lamp.jpg")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := io.Copy(createPart, createFile); err != nil {
		t.Fatal(err)
	}
	createWriter.Close()
	reqCreate := httptest.NewRequest("POST", "/api/listings", createBody)
	reqCreate.Header.Set("Authorization", "Bearer "+token)
	reqCreate.Header.Set("Content-Type", createWriter.FormDataContentType())
	wCreate := httptest.NewRecorder()
	r.ServeHTTP(wCreate, reqCreate)

	if wCreate.Code != 201 {
		t.Fatalf("CreateListing: expected 201, got %d. Body: %s", wCreate.Code, wCreate.Body.String())
	}

	var created Listing
	if err := json.Unmarshal(wCreate.Body.Bytes(), &created); err != nil {
		t.Fatalf("failed to decode created listing: %v", err)
	}

	if created.Category != "Furniture" {
		t.Fatalf("expected created category Furniture, got %s", created.Category)
	}

	if created.Condition != "Used" {
		t.Fatalf("expected created condition Used, got %s", created.Condition)
	}

	if created.Image == "" {
		t.Fatalf("expected an image on the created listing, but it has none")
	}

	reqGet := httptest.NewRequest("GET", "/api/listings/1", nil)
	wGet := httptest.NewRecorder()
	r.ServeHTTP(wGet, reqGet)

	if wGet.Code != 200 {
		t.Fatalf("GetListingByID: expected 200, got %d. Body: %s", wGet.Code, wGet.Body.String())
	}

	var fetched Listing
	if err := json.Unmarshal(wGet.Body.Bytes(), &fetched); err != nil {
		t.Fatalf("failed to decode fetched listing: %v", err)
	}

	if fetched.Category != "Furniture" {
		t.Fatalf("expected fetched category Furniture, got %s", fetched.Category)
	}

	if fetched.Condition != "Used" {
		t.Fatalf("expected fetched condition Used, got %s", fetched.Condition)
	}

	if fetched.Image == "" {
		t.Fatalf("expected an image on the fetched listing, but it has none")
	}

	updateBody := &bytes.Buffer{}
	updateWriter := multipart.NewWriter(updateBody)
	_ = updateWriter.WriteField("Title", "Desk Lamp")
	_ = updateWriter.WriteField("Description", "Warm light")
	_ = updateWriter.WriteField("Price", "30")
	_ = updateWriter.WriteField("Category", "Digital Product")
	_ = updateWriter.WriteField("Condition", "Like new")
	updateFile, err := os.Open("test_imgs/lamp2.jpg")
	if err != nil {
		t.Fatal(err)
	}
	defer updateFile.Close()
	updatePart, err := updateWriter.CreateFormFile("image", "lamp2.jpg")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := io.Copy(updatePart, updateFile); err != nil {
		t.Fatal(err)
	}
	updateWriter.Close()
	reqUpdate := httptest.NewRequest("PUT", "/api/listings/1", updateBody)
	reqUpdate.Header.Set("Authorization", "Bearer "+token)
	reqUpdate.Header.Set("Content-Type", updateWriter.FormDataContentType())
	wUpdate := httptest.NewRecorder()
	r.ServeHTTP(wUpdate, reqUpdate)

	if wUpdate.Code != 200 {
		t.Fatalf("UpdateListing: expected 200, got %d. Body: %s", wUpdate.Code, wUpdate.Body.String())
	}

	var updated Listing
	if err := json.Unmarshal(wUpdate.Body.Bytes(), &updated); err != nil {
		t.Fatalf("failed to decode updated listing: %v", err)
	}

	if updated.Category != "Digital Product" {
		t.Fatalf("expected updated category Digital Product, got %s", updated.Category)
	}

	if updated.Condition != "Like new" {
		t.Fatalf("expected updated condition Like new, got %s", updated.Condition)
	}

	if updated.Image == "" {
		t.Fatalf("expected an image on the updated listing, but it has none")
	}
}

// -----------------------
// TEST: UPLOAD AVATAR
// -----------------------
func TestUploadAvatar(t *testing.T) {
	r := setupRouter()

	body := []byte(`{"username":"seller","password":"pass1234"}`)
	req := httptest.NewRequest("POST", "/api/register", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

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

	// Call PUT /api/avatar (protected route)
	updateBody := &bytes.Buffer{}
	updateWriter := multipart.NewWriter(updateBody)
	updateFile, err := os.Open("test_imgs/bunny.jpg")
	if err != nil {
		t.Fatal(err)
	}
	defer updateFile.Close()
	updatePart, err := updateWriter.CreateFormFile("avatar", "bunny.jpg")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := io.Copy(updatePart, updateFile); err != nil {
		t.Fatal(err)
	}
	updateWriter.Close()
	reqUpdate := httptest.NewRequest("POST", "/api/avatar", updateBody)
	reqUpdate.Header.Set("Authorization", "Bearer "+token)
	reqUpdate.Header.Set("Content-Type", updateWriter.FormDataContentType())

	wUpdate := httptest.NewRecorder()
	r.ServeHTTP(wUpdate, reqUpdate)

	if wUpdate.Code != 200 {
		t.Fatalf("Expected 200, got %d. Body: %s", wUpdate.Code, wUpdate.Body.String())
	}
}
