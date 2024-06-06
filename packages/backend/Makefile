include .env

.PHONY: run

MIG_DIR=pkg/db/migrations

run:
	go run cmd/service/main.go

status:
	goose -dir pkg/db/migrations turso $(DB_URL) status

up:
	goose -dir pkg/db/migrations turso $(DB_URL) up

reset:
	goose -dir pkg/db/migrations turso $(DB_URL) reset

