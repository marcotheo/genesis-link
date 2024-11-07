package services

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	v4 "github.com/aws/aws-sdk-go-v2/aws/signer/v4"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	clog "github.com/marcotheo/genesis-link/packages/backend/pkg/logger"
)

type S3Service struct {
	S3Client      *s3.Client
	PresignClient *s3.PresignClient
	Bucket        string
}

func InitS3Service() *S3Service {
	cfg := awsConfigInit()

	bucket := os.Getenv("ASSET_BUCKET")

	s3Client := s3.NewFromConfig(*cfg)
	presignerClient := s3.NewPresignClient(s3Client)
	return &S3Service{S3Client: s3Client, PresignClient: presignerClient, Bucket: bucket}
}

func (c *S3Service) PutObjectUrl(key string, lifetimeSecs int64) (*v4.PresignedHTTPRequest, error) {
	clog.Logger.Info("(S3) Generate Put Object Signed Url")

	// Create a presign client from the S3 client
	request, err := c.PresignClient.PresignPutObject(context.TODO(), &s3.PutObjectInput{
		Bucket: &c.Bucket,
		Key:    aws.String(key),
	}, func(opts *s3.PresignOptions) {
		opts.Expires = time.Duration(lifetimeSecs * int64(time.Second))
	})

	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	clog.Logger.Info("(S3) user added successfuly")

	return request, nil
}
