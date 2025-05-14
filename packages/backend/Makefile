GOPATH := $(shell go env GOPATH)
GOBIN := $(GOPATH)/bin

include .env

.PHONY: run

MIG_DIR=pkg/sqlc/migrations
GOOSE=goose

run:
	go run cmd/service/main.go

build:
	docker build -t golang-lambda-builder -f Dockerfile.lambda .
	docker run --rm -v "$(PWD)":/out golang-lambda-builder
	chmod +x bootstrap
	zip -r deployment.zip server bootstrap

root-build:
	docker build -t golang-lambda-builder -f Dockerfile.lambda .
	docker run --rm -v "$(PWD)/packages/backend":/out golang-lambda-builder
	chmod +x bootstrap
	zip -r deployment.zip server bootstrap

migration:
	goose -dir ${MIG_DIR} create $(NAME) sql

db-status:
	goose -dir ${MIG_DIR} turso $(DB_URL) status

db-up:
	goose -dir ${MIG_DIR} turso $(DB_URL) up

db-reset:
	goose -dir ${MIG_DIR} turso $(DB_URL) reset

db-down-latest:
	goose -dir ${MIG_DIR} turso $(DB_URL) down