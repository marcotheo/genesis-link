package services

import (
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
