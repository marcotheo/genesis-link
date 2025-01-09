package services

import (
	"context"
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

func (c *OpenAIService) GenerateEmbedding(input string) ([]float32, error) {
	clog.Logger.Info("(OPEN-AI) Generate Embedding")

	resp, err := c.Client.CreateEmbeddings(context.Background(), openai.EmbeddingRequest{
		Input: []string{input},
		Model: openai.AdaEmbeddingV2,
	})

	if err != nil {
		return nil, err
	}

	clog.Logger.Info("(S3) user added successfuly")

	return resp.Data[0].Embedding, nil
}
