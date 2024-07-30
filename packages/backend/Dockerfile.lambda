FROM amazonlinux:2

# Install Go
RUN yum update -y && \
    yum install -y golang tar gzip git

# Set Go environment variables
ENV GOPATH=/go
ENV PATH=$GOPATH/bin:/usr/local/go/bin:$PATH

# Create the app directory
RUN mkdir -p /app/cmd/lambda

# Copy go.mod and go.sum to enable dependency download
COPY go.mod go.sum /app/
WORKDIR /app
RUN go mod download

# Copy the rest of the application files
COPY cmd/lambda /app/cmd/lambda
COPY pkg /app/pkg

# Build the Go binary
WORKDIR /app/cmd/lambda
RUN go build -o main .

# Strip the binary to reduce size
RUN strip /app/cmd/lambda/main

# Command to copy the built binary to the output directory
CMD ["cp", "/app/cmd/lambda/main", "/out/server"]
