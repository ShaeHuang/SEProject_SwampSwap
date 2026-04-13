// package main

// import (
// 	"encoding/json"
// 	"net/http/httptest"
// 	"testing"

// 	"github.com/gin-gonic/gin"
// )
package main

import (
	"encoding/json"
	"net/http/httptest"
	"strings"
	"testing"
	"github.com/gin-gonic/gin"
)

func setupSearchRouter() *gin.Engine {
	r := setupRouter()

	// Seed test data: register a seller, login, create listings
	helpers := []struct {
		method string
		path   string
		body   string
		auth   string
	}{
		{"POST", "/api/register", `{"username":"searchseller","password":"pass1234","email":"ss@test.com"}`, ""},
	}

	for _, h := range helpers {
		req := httptest.NewRequest(h.method, h.path, stringReader(h.body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)
	}

	// Login to get token
	req := httptest.NewRequest("POST", "/api/login", stringReader(`{"id":"searchseller","password":"pass1234"}`))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	var loginResp map[string]string
	json.Unmarshal(w.Body.Bytes(), &loginResp)
	var token string
	for _, v := range loginResp {
		token = v
	}

	// Create listings
	listings := []string{
		`{"title":"Wooden Desk","description":"Solid oak desk","price":75.0,"category":"Furniture","condition":"Used"}`,
		`{"title":"Gaming Mouse","description":"RGB wireless mouse","price":30.0,"category":"Digital Product","condition":"Like new"}`,
		`{"title":"Winter Jacket","description":"Warm parka for cold weather","price":45.0,"category":"Clothing","condition":"Gently used"}`,
	}

	for _, body := range listings {
		req := httptest.NewRequest("POST", "/api/listings", stringReader(body))
		req.Header.Set("Authorization", "Bearer "+token)
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)
	}

	return r
}

func stringReader(s string) *strings.Reader {
	return strings.NewReader(s)
}

// -----------------------
// TEST: SEARCH BY KEYWORD
// -----------------------
func TestSearchByKeyword(t *testing.T) {
	r := setupSearchRouter()

	req := httptest.NewRequest("GET", "/api/search?keyword=desk", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Fatalf("Expected 200, got %d. Body: %s", w.Code, w.Body.String())
	}

	var results []map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &results)

	if len(results) != 1 {
		t.Fatalf("Expected 1 result for 'desk', got %d", len(results))
	}
}

// -----------------------
// TEST: SEARCH BY PRICE RANGE
// -----------------------
func TestSearchByPriceRange(t *testing.T) {
	r := setupSearchRouter()

	req := httptest.NewRequest("GET", "/api/search?minprice=40&maxprice=80", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Fatalf("Expected 200, got %d. Body: %s", w.Code, w.Body.String())
	}

	var results []map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &results)

	// Should match Wooden Desk (75) and Winter Jacket (45)
	if len(results) != 2 {
		t.Fatalf("Expected 2 results for price range 40-80, got %d", len(results))
	}
}

// -----------------------
// TEST: SEARCH NO MATCHES RETURNS EMPTY ARRAY
// -----------------------
func TestSearchNoMatches(t *testing.T) {
	r := setupSearchRouter()

	req := httptest.NewRequest("GET", "/api/search?keyword=nonexistentxyz", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Fatalf("Expected 200 for no matches, got %d. Body: %s", w.Code, w.Body.String())
	}

	var results []map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &results)

	if len(results) != 0 {
		t.Fatalf("Expected 0 results, got %d", len(results))
	}
}

// -----------------------
// TEST: SEARCH NO FILTERS RETURNS ALL
// -----------------------
func TestSearchNoFilters(t *testing.T) {
	r := setupSearchRouter()

	req := httptest.NewRequest("GET", "/api/search", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Fatalf("Expected 200, got %d. Body: %s", w.Code, w.Body.String())
	}

	var results []map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &results)

	if len(results) < 3 {
		t.Fatalf("Expected at least 3 results with no filters, got %d", len(results))
	}
}