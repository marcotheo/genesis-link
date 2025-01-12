package services

import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	clog "github.com/marcotheo/genesis-link/packages/backend/pkg/logger"
	"github.com/sashabaranov/go-openai"
)

type OpenAIService struct {
	Client *openai.Client
}

func InitOpenAIService() *OpenAIService {
	client := openai.NewClient(os.Getenv("OPENAI_API_KEY"))
	return &OpenAIService{Client: client}
}

func (c *OpenAIService) GenerateEmbedding(input string) (string, error) {
	clog.Logger.Info("(OPEN-AI) Generate Embedding")

	resp, err := c.Client.CreateEmbeddings(context.Background(), openai.EmbeddingRequest{
		Input: []string{input},
		Model: openai.AdaEmbeddingV2,
	})

	if err != nil {
		return "", err
	}

	embeddingString, err := json.Marshal(resp.Data[0].Embedding)
	if err != nil {
		fmt.Printf("Failed to marshal embedding: %v\n", err)
		return "", err
	}

	return string(embeddingString), nil
}
