include .env

.PHONY: run

MIG_DIR=pkg/sqlc/migrations

run:
	go run cmd/service/main.go

db-status:
	goose -dir ${MIG_DIR} turso $(DB_URL) status

db-up:
	goose -dir ${MIG_DIR} turso $(DB_URL) up

db-reset:
	goose -dir ${MIG_DIR} turso $(DB_URL) reset

sam-build:
	docker build -t golang-lambda-builder .
	docker run --rm -v "$(PWD)":/out golang-lambda-builder

sam-test:
	./build-test.sh

