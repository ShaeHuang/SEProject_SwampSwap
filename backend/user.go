package main

import (
	"errors"
	"fmt"
	"html"
	"strings"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"net/http"
	"gorm.io/gorm"

)

type User struct {
	gorm.Model
	Username string `gorm:"type:varchar;not null;unique" json:"username"`
	Password string `gorm:"type:varchar;not null;" json:"-"`
	Email    string `gorm:"type:varchar;" json:"email"`
	Avatar   string `gorm:"type:varchar;" json:"avatar"`
	Bio      string `gorm:"type:varchar;" json:"bio"`
}

func GetUserByID(uid uint) (User, error) {
	var u User
	if err := DB.First(&u, uid).Error; err != nil { //Find the user if they exist
		return u, errors.New("User not found!")
	}

	// u.Password = "" //Wipe password from view
	return u, nil
}

func VerifyPassword(password, hashedPassword string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}

func LoginCheck(username string, password string) (string, error) {
	var err error
	u := User{}
	err = DB.Model(User{}).Where("username = ?", username).Take(&u).Error //Verify that user exists before proceeding
	err = VerifyPassword(password, u.Password)
	if err != nil {
		return "", err //Incorrect username or password
	}

	token, err := GenerateToken(u.ID)
	if err != nil {
		return "", err
	}

	return token, nil
}

func (u *User) SaveUser() (*User, error) {
	var err error
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost) //Hash password
	if err != nil {
		return &User{}, err
	}

	u.Password = string(hashedPassword)                           //Convert hash to string
	u.Username = html.EscapeString(strings.TrimSpace(u.Username)) //Remove any spaces in username
	err = DB.Create(&u).Error                                     //Add user to database
	if err != nil {
		return &User{}, err
	}

	return u, nil
}



func GetUserPublic(c *gin.Context) {
	id := c.Param("id")
	var u User

	if err := DB.First(&u, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var itemsPosted int64
	DB.Model(&Listing{}).Where("user_id = ?", u.ID).Count(&itemsPosted)

	var itemsSold int64
	DB.Model(&Listing{}).Where("user_id = ? AND status = ?", u.ID, "sold").Count(&itemsSold)

	c.JSON(http.StatusOK, gin.H{
		"id":       fmt.Sprintf("%d", u.ID),
		"username": u.Username,
		"email":    u.Email,
		"avatar":   u.Avatar,
		"bio":      u.Bio,
		"joinedAt": u.CreatedAt.Format("2006-01-02T15:04:05Z"),
		"stats": gin.H{
			"itemsPosted": itemsPosted,
			"itemsSold":   itemsSold,
		},
	})
}


type UpdateUserInput struct {
    Username string `json:"username"`
    Password string `json:"password"`
	Email    string `json:"email"`
	Avatar   string `json:"avatar"`
	Bio      string `json:"bio"`
}

func UpdateUser(c *gin.Context) {
    uid, err := ExtractTokenID(c)
    if err != nil {
        c.JSON(401, gin.H{"error": "Unauthorized"})
        return
    }

    var u User
    if err := DB.First(&u, uid).Error; err != nil {
        c.JSON(404, gin.H{"error": "User not found"})
        return
    }

    var input UpdateUserInput
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(400, gin.H{"error": "Invalid JSON"})
        return
    }

    // Update username if provided
    if input.Username != "" {
        u.Username = html.EscapeString(strings.TrimSpace(input.Username))
    }

    // Update password if provided
    if input.Password != "" {
        hashed, _ := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
        u.Password = string(hashed)
    }
	// Update email if provided
	if input.Email != "" {
		u.Email = html.EscapeString(strings.TrimSpace(input.Email))
	}

	// Update avatar if provided
	if input.Avatar != "" {
		u.Avatar = strings.TrimSpace(input.Avatar)
	}

	// Update bio if provided
	if input.Bio != "" {
		u.Bio = strings.TrimSpace(input.Bio)
	}

	if err := DB.Save(&u).Error; err != nil {
		c.JSON(400, gin.H{
			"error":   "Could not update user",
			"details": err.Error(),
		})
		return
	}

	u.Password = "" //not necessary anymore since we are globally handling it with json:"-"`

	c.JSON(200, gin.H{
		"message": "User updated successfully",
		"user":    u,
	})
}