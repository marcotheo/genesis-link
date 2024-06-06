include .env

.PHONY: run

MIG_DIR=pkg/sqlc/migrations

run:
	go run cmd/service/main.go

status:
	goose -dir ${MIG_DIR} turso $(DB_URL) status

up:
	goose -dir ${MIG_DIR} turso $(DB_URL) up

reset:
	goose -dir ${MIG_DIR} turso $(DB_URL) reset

