package main

import (
	"errors"
	"html"
	"strings"

	"github.com/jinzhu/gorm"
)

type User struct { //User model for database
	gorm.Model
	Username string `gorm:"type:varchar;not null;unique" json:"username"`
	Password string `gorm:"type:varchar;not null;" json:"password"`
}

func LoginCheck(username string, password string) (string, error) {
	var err error
	u := User{}
	err = DB.Model(User{}).Where("username = ?", username).Take(&u).Error //Verify that user exists before proceeding
	if err != nil {
		return "", err //Incorrect username
	}

	var passBool bool = password == u.Password //Check password
	if !passBool {
		err = errors.New("incorrect password")
		return "", err
	}

	return password, nil
}

func (u *User) SaveUser() (*User, error) {
	var err error
	u.Username = html.EscapeString(strings.TrimSpace(u.Username)) //Remove any spaces in username
	err = DB.Create(&u).Error                                     //Add user to database
	if err != nil {
		return &User{}, err
	}

	return u, nil
}
