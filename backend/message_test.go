package main

import (
	"encoding/json"
	"fmt"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
)

// getTestToken registers a user, logs them in, and returns the JWT.
func getTestToken(r *gin.Engine, username, password, email string) string {
	regBody := fmt.Sprintf(`{"username":"%s","password":"%s","email":"%s"}`, username, password, email)
	req := httptest.NewRequest("POST", "/api/register", strings.NewReader(regBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	loginBody := fmt.Sprintf(`{"id":"%s","password":"%s"}`, username, password)
	req = httptest.NewRequest("POST", "/api/login", strings.NewReader(loginBody))
	req.Header.Set("Content-Type", "application/json")
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	var resp map[string]string
	json.Unmarshal(w.Body.Bytes(), &resp)
	for _, v := range resp {
		return v
	}
	return ""
}

// -----------------------
// TEST: send a message and read the thread back
// -----------------------
func TestSendAndGetMessages(t *testing.T) {
	r := setupRouter()

	tokenA := getTestToken(r, "alice", "pass1234", "alice@test.com")
	getTestToken(r, "bob", "pass5678", "bob@test.com") // user id 2

	// Alice sends Bob a message
	sendBody := `{"receiver_id":2,"content":"Hey, is this still available?"}`
	req := httptest.NewRequest("POST", "/api/messages", strings.NewReader(sendBody))
	req.Header.Set("Authorization", "Bearer "+tokenA)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != 201 {
		t.Fatalf("SendMessage: expected 201, got %d. Body: %s", w.Code, w.Body.String())
	}

	var sent map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &sent)
	if sent["content"] != "Hey, is this still available?" {
		t.Errorf("expected content echoed back, got: %v", sent["content"])
	}

	// Alice fetches the thread with Bob (user id 2)
	req = httptest.NewRequest("GET", "/api/messages/2", nil)
	req.Header.Set("Authorization", "Bearer "+tokenA)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Fatalf("GetMessagesWithUser: expected 200, got %d. Body: %s", w.Code, w.Body.String())
	}

	var thread []map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &thread)
	if len(thread) != 1 {
		t.Fatalf("expected 1 message in thread, got %d", len(thread))
	}
}

// -----------------------
// TEST: conversations list returns the partner
// -----------------------
func TestGetConversations(t *testing.T) {
	r := setupRouter()

	tokenA := getTestToken(r, "alice", "pass1234", "alice@test.com")
	getTestToken(r, "bob", "pass5678", "bob@test.com")

	// Alice sends Bob a message so a conversation exists
	sendBody := `{"receiver_id":2,"content":"first message"}`
	req := httptest.NewRequest("POST", "/api/messages", strings.NewReader(sendBody))
	req.Header.Set("Authorization", "Bearer "+tokenA)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	// Alice fetches her conversation list
	req = httptest.NewRequest("GET", "/api/messages", nil)
	req.Header.Set("Authorization", "Bearer "+tokenA)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Fatalf("GetConversations: expected 200, got %d. Body: %s", w.Code, w.Body.String())
	}

	var convos []map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &convos)
	if len(convos) != 1 {
		t.Fatalf("expected 1 conversation, got %d", len(convos))
	}
	if convos[0]["username"] != "bob" {
		t.Errorf("expected partner username=bob, got %v", convos[0]["username"])
	}
}

// -----------------------
// TEST: cannot message yourself
// -----------------------
func TestSendMessageToSelf(t *testing.T) {
	r := setupRouter()

	tokenA := getTestToken(r, "alice", "pass1234", "alice@test.com")

	body := `{"receiver_id":1,"content":"talking to myself"}`
	req := httptest.NewRequest("POST", "/api/messages", strings.NewReader(body))
	req.Header.Set("Authorization", "Bearer "+tokenA)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != 400 {
		t.Fatalf("expected 400 for self-message, got %d. Body: %s", w.Code, w.Body.String())
	}
}

// -----------------------
// TEST: cannot message a user that doesn't exist
// -----------------------
func TestSendMessageToNonexistentUser(t *testing.T) {
	r := setupRouter()

	tokenA := getTestToken(r, "alice", "pass1234", "alice@test.com")

	body := `{"receiver_id":999,"content":"is anyone there"}`
	req := httptest.NewRequest("POST", "/api/messages", strings.NewReader(body))
	req.Header.Set("Authorization", "Bearer "+tokenA)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != 404 {
		t.Fatalf("expected 404 for nonexistent receiver, got %d. Body: %s", w.Code, w.Body.String())
	}
}