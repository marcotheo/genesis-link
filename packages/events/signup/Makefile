# include .env

.PHONY: run

run:
	go run main.go

build:
	docker build -t go-event-signup-builder -f Dockerfile.lambda .
	docker run --rm -v "$(PWD)":/out go-event-signup-builder
	chmod +x bootstrap
	zip -r deployment.zip server bootstrap

root-build:
	docker build -t go-event-signup-builder -f Dockerfile.lambda .
	docker run --rm -v "$(PWD)/packages/events/signup":/out go-event-signup-builder
	chmod +x bootstrap
	zip -r deployment.zip server bootstrap
