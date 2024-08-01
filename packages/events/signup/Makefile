# include .env

.PHONY: run

run:
	go run main.go

build:
	docker build -t golang-lambda-builder -f Dockerfile.lambda .
	docker run --rm -v "$(PWD)":/out golang-lambda-builder
	chmod +x bootstrap
	zip -r deployment.zip server bootstrap
