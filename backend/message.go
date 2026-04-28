package main

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ----------------------------
// Model
// ----------------------------
type Message struct {
	gorm.Model
	SenderID   uint   `json:"sender_id"`
	ReceiverID uint   `json:"receiver_id"`
	Content    string `json:"content"`
	IsRead     bool   `json:"is_read" gorm:"default:false"`
}

type MessageResponse struct {
	ID         string `json:"id"`
	SenderID   string `json:"senderId"`
	ReceiverID string `json:"receiverId"`
	Content    string `json:"content"`
	CreatedAt  string `json:"createdAt"`
	IsRead     bool   `json:"isRead"`
}

type ConversationResponse struct {
	UserID      string `json:"userId"`
	Username    string `json:"username"`
	Avatar      string `json:"avatar,omitempty"`
	LastMessage string `json:"lastMessage"`
	LastAt      string `json:"lastAt"`
	UnreadCount int64  `json:"unreadCount"`
}

type SendMessageInput struct {
	ReceiverID uint   `json:"receiver_id" binding:"required"`
	Content    string `json:"content" binding:"required"`
}

// formatMessage converts a DB Message to the frontend-expected shape
func formatMessage(m Message) MessageResponse {
	return MessageResponse{
		ID:         fmt.Sprintf("%d", m.ID),
		SenderID:   fmt.Sprintf("%d", m.SenderID),
		ReceiverID: fmt.Sprintf("%d", m.ReceiverID),
		Content:    m.Content,
		CreatedAt:  m.CreatedAt.Format("2006-01-02T15:04:05Z"),
		IsRead:     m.IsRead,
	}
}

// ----------------------------
// GET /api/messages
// Returns all conversations for the authenticated user
// ----------------------------
func GetConversations(c *gin.Context) {
	uid, err := ExtractTokenID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Find all distinct users this user has exchanged messages with
	type Partner struct {
		UserID uint
	}

	var partners []Partner
	DB.Raw(`
		SELECT DISTINCT partner_id AS user_id FROM (
			SELECT receiver_id AS partner_id FROM messages
			WHERE sender_id = ? AND deleted_at IS NULL
			UNION
			SELECT sender_id AS partner_id FROM messages
			WHERE receiver_id = ? AND deleted_at IS NULL
		)
	`, uid, uid).Scan(&partners)

	conversations := make([]ConversationResponse, 0, len(partners))

	for _, p := range partners {
		// Get the other user's info
		var user User
		if err := DB.First(&user, p.UserID).Error; err != nil {
			continue
		}

		// Get the latest message in this thread
		var lastMsg Message
		DB.Where(
			"(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)",
			uid, p.UserID, p.UserID, uid,
		).Order("created_at DESC").First(&lastMsg)

		// Count unread messages FROM this partner TO me
		var unread int64
		DB.Model(&Message{}).Where(
			"sender_id = ? AND receiver_id = ? AND is_read = ?",
			p.UserID, uid, false,
		).Count(&unread)

		conversations = append(conversations, ConversationResponse{
			UserID:      fmt.Sprintf("%d", user.ID),
			Username:    user.Username,
			Avatar:      user.Avatar,
			LastMessage: lastMsg.Content,
			LastAt:      lastMsg.CreatedAt.Format("2006-01-02T15:04:05Z"),
			UnreadCount: unread,
		})
	}

	c.JSON(http.StatusOK, conversations)
}

// ----------------------------
// GET /api/messages/:userId
// Returns all messages between authenticated user and :userId
// ----------------------------
func GetMessagesWithUser(c *gin.Context) {
	uid, err := ExtractTokenID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	otherID := c.Param("userId")

	var messages []Message
	if err := DB.Where(
		"(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)",
		uid, otherID, otherID, uid,
	).Order("created_at ASC").Find(&messages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error: cannot fetch messages.",
			"details": err.Error(),
		})
		return
	}

	// Mark messages from the other user as read
	DB.Model(&Message{}).Where(
		"sender_id = ? AND receiver_id = ? AND is_read = ?",
		otherID, uid, false,
	).Update("is_read", true)

	result := make([]MessageResponse, 0, len(messages))
	for _, m := range messages {
		result = append(result, formatMessage(m))
	}

	c.JSON(http.StatusOK, result)
}

// ----------------------------
// POST /api/messages
// Send a message to another user
// ----------------------------
func SendMessage(c *gin.Context) {
	uid, err := ExtractTokenID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var input SendMessageInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request.",
			"details": err.Error(),
		})
		return
	}

	// Can't message yourself
	if input.ReceiverID == uid {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot send a message to yourself."})
		return
	}

	// Verify receiver exists
	var receiver User
	if err := DB.First(&receiver, input.ReceiverID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Recipient not found."})
		return
	}

	msg := Message{
		SenderID:   uid,
		ReceiverID: input.ReceiverID,
		Content:    input.Content,
	}

	if err := DB.Create(&msg).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error: failed to send message.",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, formatMessage(msg))
}