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

func (a *UtilService) ConvertNullInt64(nullInt sql.NullInt64) int64 {
	if nullInt.Valid {
		return nullInt.Int64
	}

	return 0
}
