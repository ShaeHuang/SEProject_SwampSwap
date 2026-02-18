package main

import (
	"errors"
	"html"
	"strings"

	"github.com/jinzhu/gorm"
	"golang.org/x/crypto/bcrypt"
)

type User struct { //User model for database
	gorm.Model
	Username string `gorm:"type:varchar;not null;unique" json:"username"`
	Password string `gorm:"type:varchar;not null;" json:"password"`
}

func GetUserByID(uid uint) (User, error) {
	var u User
	if err := DB.First(&u, uid).Error; err != nil { //Find the user if they exist
		return u, errors.New("User not found!")
	}

	u.Password = "" //Wipe password from view
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
