package main

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// FileConfig holds validation rules
type FileConfig struct {
	MaxSize      int64
	AllowedTypes []string
	AllowedExts  []string
}

// UploadResponse represents the API response for uploads
type UploadResponse struct {
	Success  bool   `json:"success"`
	Message  string `json:"message"`
	Filename string `json:"filename,omitempty"`
	Size     int64  `json:"size,omitempty"`
	URL      string `json:"url,omitempty"`
}

var imageConfig = FileConfig{
	MaxSize:      5 << 20,
	AllowedTypes: []string{"image/jpeg", "image/png", "image/gif", "image/webp"},
	AllowedExts:  []string{".jpg", ".jpeg", ".png", ".gif", ".webp"},
}

// generateUniqueFilename creates a unique filename to prevent collisions
func generateUniqueFilename(originalName string) string {
	ext := filepath.Ext(originalName)

	// Generate random bytes for uniqueness
	randomBytes := make([]byte, 8)
	rand.Read(randomBytes)
	randomStr := hex.EncodeToString(randomBytes)

	// Include timestamp for sortability
	timestamp := time.Now().Format("20060102-150405")

	return fmt.Sprintf("%s-%s%s", timestamp, randomStr, ext)
}

// validateFile performs comprehensive file validation
func validateFile(file *multipart.FileHeader, config FileConfig) error {
	// Check file size
	if file.Size > config.MaxSize {
		return fmt.Errorf("file size exceeds maximum of %d MB", config.MaxSize/(1<<20))
	}

	// Check extension
	ext := strings.ToLower(filepath.Ext(file.Filename))
	extAllowed := false
	for _, allowed := range config.AllowedExts {
		if ext == allowed {
			extAllowed = true
			break
		}
	}
	if !extAllowed {
		return fmt.Errorf("extension %s not allowed, use: %v", ext, config.AllowedExts)
	}

	// Verify actual content type
	src, err := file.Open()
	if err != nil {
		return err
	}
	defer src.Close()

	buffer := make([]byte, 512)
	if _, err := src.Read(buffer); err != nil {
		return err
	}

	contentType := http.DetectContentType(buffer)
	typeAllowed := false
	for _, allowed := range config.AllowedTypes {
		if strings.HasPrefix(contentType, allowed) {
			typeAllowed = true
			break
		}
	}
	if !typeAllowed {
		return fmt.Errorf("content type %s not allowed", contentType)
	}

	return nil
}

// uploadAvatar handles single image uploads
func uploadAvatar(c *gin.Context) {
	user_id, err := ExtractTokenID(c) //Get token
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	u, err := GetUserByID(user_id) //Get user from token
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	file, err := c.FormFile("avatar")
	if err != nil {
		c.JSON(http.StatusBadRequest, UploadResponse{
			Success: false,
			Message: "No image file provided",
		})
	}

	dst, uniqueName, file := processImage(c, file, "avatars")

	old_avatar_path := u.Avatar
	// Delete old avatar if it exists
	os.Remove(old_avatar_path)
	// Update avatar path
	u.Avatar = dst
	DB.Save(&u)

	c.JSON(http.StatusOK, UploadResponse{
		Success:  true,
		Message:  "Image uploaded successfully",
		Filename: uniqueName,
		Size:     file.Size,
		URL:      fmt.Sprintf("/avatars/%s", uniqueName),
	})
}

func processImage(c *gin.Context, file *multipart.FileHeader, folder string) (string, string, *multipart.FileHeader) {
	// Validate the file
	if err := validateFile(file, imageConfig); err != nil {
		c.JSON(http.StatusBadRequest, UploadResponse{
			Success: false,
			Message: err.Error(),
		})
		return "", "", nil
	}

	// Generate unique filename and save
	uniqueName := generateUniqueFilename(file.Filename)
	dst := filepath.Join("./"+folder, uniqueName)

	if err := c.SaveUploadedFile(file, dst); err != nil {
		c.JSON(http.StatusInternalServerError, UploadResponse{
			Success: false,
			Message: "Failed to save file",
		})
		return "", "", nil
	}

	return dst, uniqueName, file
}
