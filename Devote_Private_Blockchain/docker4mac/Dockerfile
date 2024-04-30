# Choose a base image that is compatible with ARM architecture
FROM arm64v8/ubuntu:latest

# Install dependencies and build tools
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install a specific version of Go if necessary
RUN curl -OL https://golang.org/dl/go1.13.linux-arm64.tar.gz \
    && tar -C /usr/local -xzf go1.13.linux-arm64.tar.gz \
    && rm go1.13.linux-arm64.tar.gz

# Set environment variable for Go
ENV PATH /usr/local/go/bin:$PATH

# Create a non-root user to use if necessary
RUN useradd -m -s /bin/bash go-user
USER go-user
WORKDIR /home/go-user

# Clone the specific version of Geth from the Ethereum repository
RUN git clone https://github.com/ethereum/go-ethereum.git
WORKDIR /home/go-user/go-ethereum
RUN git checkout tags/v1.9.25

# Initialize and update submodules
RUN git submodule update --init --recursive

# Build Geth from the specified version

# Build Bootnode from the specified version
ENV GO111MODULE=on
RUN go mod download
RUN go build -o build/bin/geth ./cmd/geth
RUN go build -o build/bin/bootnode ./cmd/bootnode
RUN ls -l /home/go-user/go-ethereum/build/bin/
# Switch back to the root user if you need to perform actions that require root privileges
USER root

# Copy the node directories to the /data directory in the container
COPY ./bnode /data/bnode
COPY ./node1 /data/node1
COPY ./node2 /data/node2

RUN chown -R go-user:go-user /data
# Copy the binaries to a bin directory in PATH
RUN cp build/bin/bootnode /usr/local/bin/
RUN cp /home/go-user/go-ethereum/build/bin/* /usr/local/bin/
RUN ls -l /usr/local/bin/
RUN [ -f /usr/local/bin/bootnode ] && chmod +x /usr/local/bin/bootnode || echo "bootnode not found"
# Expose the default port for Geth and Bootnode
# EXPOSE 30303 30304 30301 8545 8546

# Use the user `go-user` to run the container
USER go-user

# Set up a volume for data persistence
VOLUME ["/home/go-user/data"]