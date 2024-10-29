package services

import (
	"database/sql"

	"github.com/google/uuid"
)

type UtilService struct {
}

func InitUtilService() *UtilService {
	return &UtilService{}
}

func (a *UtilService) GenerateUUID() string {
	id := uuid.New()
	return id.String()
}

func (a *UtilService) ConvertNullString(ns sql.NullString) string {
	if ns.Valid {
		return ns.String
	}

	return ""
}
